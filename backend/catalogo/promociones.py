from decimal import Decimal

# Condiciones de envío de la tienda (las usa el carrito y el registro de pedidos)
ENVIO_GRATIS_DESDE = Decimal('100.00')
COSTO_ENVIO = Decimal('8.00')


def costo_envio(subtotal_con_descuentos):
    """El envío es gratis cuando la compra llega al monto indicado."""
    return Decimal('0.00') if subtotal_con_descuentos >= ENVIO_GRATIS_DESDE else COSTO_ENVIO
