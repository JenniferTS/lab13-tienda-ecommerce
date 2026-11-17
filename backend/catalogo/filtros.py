import re
import unicodedata
from decimal import Decimal, InvalidOperation


def normalizar(texto):
    """Pasa a minúsculas y quita las tildes, para que «rios» encuentre «Los ríos profundos»."""
    texto = unicodedata.normalize('NFKD', texto or '')
    return ''.join(c for c in texto if not unicodedata.combining(c)).lower()


def _decimal(valor):
    try:
        return Decimal(valor)
    except (InvalidOperation, TypeError):
        return None


def _coincide(producto, palabras):
    """Cada palabra buscada debe ser el comienzo de alguna palabra del producto.

    Así «rios» encuentra «ríos» pero no «Varios»."""
    texto = normalizar(f'{producto.nombre} {producto.autor} {producto.descripcion} {producto.categoria.nombre}')
    encontradas = re.findall(r'\w+', texto)
    return all(any(e.startswith(palabra) for e in encontradas) for palabra in palabras)


# Cada orden indica la clave de ordenamiento y si es descendente
ORDENES = {
    'nombre': (lambda p: normalizar(p.nombre), False),
    'precio_asc': (lambda p: p.precio, False),
    'precio_desc': (lambda p: p.precio, True),
    'novedades': (lambda p: p.id, True),
}


def filtrar_productos(productos, params):
    """Aplica a los productos los filtros que llegan en la URL (request.query_params).

    q            texto que debe aparecer en el nombre, el autor o la descripción
    categoria    id de la categoría
    precio_min   precio mínimo
    precio_max   precio máximo
    disponibles  1 = solo los que tienen stock
    orden        nombre | precio_asc | precio_desc | novedades
    """
    categoria = params.get('categoria')
    if categoria:
        productos = productos.filter(categoria_id=categoria)
    if params.get('disponibles') == '1':
        productos = productos.filter(cantidad_disponible__gt=0)

    resultado = list(productos)

    # La búsqueda se hace en Python y no con icontains porque SQLite no ignora las tildes
    consulta = normalizar(params.get('q', '').strip())
    if consulta:
        palabras = consulta.split()
        resultado = [p for p in resultado if _coincide(p, palabras)]

    minimo, maximo = _decimal(params.get('precio_min')), _decimal(params.get('precio_max'))
    if minimo is not None:
        resultado = [p for p in resultado if p.precio >= minimo]
    if maximo is not None:
        resultado = [p for p in resultado if p.precio <= maximo]

    clave, descendente = ORDENES.get(params.get('orden'), ORDENES['nombre'])
    return sorted(resultado, key=clave, reverse=descendente)
