from collections import defaultdict

from django.db.models import Count, Sum

from .models import PedidoItem, Producto

# Estos «autores» no indican que dos libros se parezcan
AUTORES_GENERICOS = {'varios autores', 'librería misti'}

# Cuánto suma cada señal al puntaje de un producto candidato
PESO_COMPRADO_JUNTO = 3   # por cada pedido en el que aparece junto a un producto de referencia
PESO_MISMO_AUTOR = 4
PESO_MISMA_CATEGORIA = 2
PESO_POPULARIDAD = 0.1    # por cada unidad vendida (sirve para desempatar)


def _vendidas():
    """Unidades vendidas de cada producto (los pedidos cancelados no cuentan)."""
    filas = (PedidoItem.objects.exclude(pedido__estado='cancelado')
             .values('producto').annotate(total=Sum('cantidad')))
    return {fila['producto']: fila['total'] for fila in filas}


def mas_vendidos(limite=4):
    """Los productos con más unidades vendidas. Si todavía hay pocas ventas, se completa con ofertas."""
    vendidas = _vendidas()
    productos = list(Producto.objects.filter(id__in=vendidas, cantidad_disponible__gt=0).select_related('categoria'))
    productos.sort(key=lambda p: vendidas[p.id], reverse=True)
    for producto in productos:
        producto.motivo = f'{vendidas[producto.id]} vendidos'
    if len(productos) < limite:
        relleno = Producto.objects.filter(cantidad_disponible__gt=0).exclude(id__in=vendidas) \
            .order_by('-descuento', 'nombre').select_related('categoria')[:limite - len(productos)]
        for producto in relleno:
            producto.motivo = 'Novedad'
        productos += list(relleno)
    return productos[:limite]


def recomendar(ids, limite=4):
    """Productos que le pueden interesar al cliente según lo que está viendo o lleva en el carrito.

    Cada producto candidato suma puntos por: haberse comprado junto con los de referencia,
    tener el mismo autor y ser de la misma categoría. Solo se recomiendan productos con stock.
    """
    referencia = list(Producto.objects.filter(id__in=ids))
    if not referencia:
        return mas_vendidos(limite)

    ids_ref = {p.id for p in referencia}
    autores = {p.autor.strip().lower() for p in referencia} - AUTORES_GENERICOS
    categorias = {p.categoria_id for p in referencia}

    # Cuántos pedidos comparte cada producto con alguno de los de referencia
    pedidos_ref = PedidoItem.objects.filter(producto_id__in=ids_ref).exclude(pedido__estado='cancelado') \
        .values_list('pedido_id', flat=True)
    juntos = dict(
        PedidoItem.objects.filter(pedido_id__in=pedidos_ref).exclude(producto_id__in=ids_ref)
        .values_list('producto').annotate(n=Count('pedido', distinct=True))
    )

    vendidas = _vendidas()
    puntajes, motivos = defaultdict(float), {}
    candidatos = Producto.objects.filter(cantidad_disponible__gt=0).exclude(id__in=ids_ref).select_related('categoria')
    for producto in candidatos:
        puntos, motivo = 0.0, None
        if juntos.get(producto.id):
            puntos += PESO_COMPRADO_JUNTO * juntos[producto.id]
            motivo = 'Se compran juntos'
        if producto.autor.strip().lower() in autores:
            puntos += PESO_MISMO_AUTOR
            motivo = motivo or f'Del mismo autor: {producto.autor}'
        if producto.categoria_id in categorias:
            puntos += PESO_MISMA_CATEGORIA
            motivo = motivo or f'También en {producto.categoria.nombre}'
        if puntos == 0:
            continue
        puntajes[producto.id] = puntos + PESO_POPULARIDAD * vendidas.get(producto.id, 0)
        motivos[producto.id] = motivo
        producto.motivo = motivo

    elegidos = sorted((p for p in candidatos if p.id in puntajes), key=lambda p: (-puntajes[p.id], p.nombre))
    resultado = elegidos[:limite]
    # Si no hay suficientes parecidos, se completa con los más vendidos
    if len(resultado) < limite:
        usados = ids_ref | {p.id for p in resultado}
        resultado += [p for p in mas_vendidos(limite + len(usados)) if p.id not in usados][:limite - len(resultado)]
    return resultado
