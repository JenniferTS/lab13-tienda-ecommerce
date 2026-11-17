from collections import defaultdict
from decimal import Decimal

from django.db import transaction
from rest_framework.exceptions import ValidationError

from .inventario import StockInsuficiente, registrar_movimiento
from .models import Cupon, MovimientoInventario, Pedido, PedidoItem, Producto
from .promociones import costo_envio


@transaction.atomic
def crear_pedido(datos):
    """Registra un pedido y descuenta el stock. Si algo falla, no se guarda nada.

    Los precios se toman siempre de la base de datos: el navegador solo manda qué productos
    y cuántas unidades, así nadie puede cambiar el precio desde el cliente.
    """
    # Si el mismo producto llega dos veces se suman sus cantidades
    cantidades = defaultdict(int)
    for item in datos['items']:
        cantidades[item['producto']] += item['cantidad']

    productos = {p.id: p for p in Producto.objects.filter(id__in=cantidades)}
    faltantes = set(cantidades) - set(productos)
    if faltantes:
        raise ValidationError({'detail': 'Alguno de los productos del carrito ya no existe.'})

    subtotal = sum((productos[i].precio_final * n for i, n in cantidades.items()), Decimal('0.00'))

    cupon, descuento = None, Decimal('0.00')
    codigo = datos.get('cupon', '').strip().upper()
    if codigo:
        cupon = Cupon.objects.filter(codigo=codigo).first()
        error = 'No existe un cupón con ese código.' if cupon is None else cupon.error_para(subtotal)
        if error:
            raise ValidationError({'detail': error})
        descuento = cupon.descuento_sobre(subtotal)

    envio = costo_envio(subtotal - descuento)
    pedido = Pedido.objects.create(
        cliente_nombre=datos['cliente_nombre'], cliente_email=datos['cliente_email'],
        telefono=datos.get('telefono', ''), direccion=datos.get('direccion', ''),
        cupon_codigo=cupon.codigo if cupon else '', subtotal=subtotal, descuento_cupon=descuento,
        costo_envio=envio, total=subtotal - descuento + envio,
    )

    for producto_id, cantidad in cantidades.items():
        producto = productos[producto_id]
        PedidoItem.objects.create(pedido=pedido, producto=producto, cantidad=cantidad,
                                  precio_unitario=producto.precio_final)
        try:
            registrar_movimiento(producto_id, -cantidad, MovimientoInventario.SALIDA, f'Venta del pedido {pedido.id}')
        except StockInsuficiente as error:
            # La excepción deshace todo el pedido gracias a transaction.atomic
            raise ValidationError({'detail': str(error)})
    return pedido
