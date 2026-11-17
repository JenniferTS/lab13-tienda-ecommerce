from django.db import transaction

from .models import MovimientoInventario, Producto


class StockInsuficiente(Exception):
    """Se intentó sacar más unidades de las que hay."""


@transaction.atomic
def registrar_movimiento(producto_id, cantidad, tipo, motivo='', usuario=''):
    """Cambia el stock de un producto y deja registrado el movimiento.

    `cantidad` es positiva si entran unidades y negativa si salen. Se bloquea la fila del
    producto durante la operación para que dos compras al mismo tiempo no pisen el stock.
    """
    producto = Producto.objects.select_for_update().get(pk=producto_id)
    nuevo_stock = producto.cantidad_disponible + cantidad
    if nuevo_stock < 0:
        raise StockInsuficiente(
            f'«{producto.nombre}»: hay {producto.cantidad_disponible} unidades y se piden {-cantidad}.'
        )
    producto.cantidad_disponible = nuevo_stock
    producto.save(update_fields=['cantidad_disponible'])
    return MovimientoInventario.objects.create(
        producto=producto, tipo=tipo, cantidad=cantidad,
        stock_resultante=nuevo_stock, motivo=motivo, usuario=usuario,
    )
