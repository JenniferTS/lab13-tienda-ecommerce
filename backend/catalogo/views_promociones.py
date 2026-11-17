from datetime import date
from decimal import Decimal, InvalidOperation

from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Cupon
from .promociones import COSTO_ENVIO, ENVIO_GRATIS_DESDE
from .serializers import CuponSerializer


@api_view(['GET'])
def configuracion(request):
    """Condiciones comerciales y cupones vigentes, para mostrarlos en la tienda."""
    vigentes = Cupon.objects.filter(activo=True).filter(Q(vence__isnull=True) | Q(vence__gte=date.today()))
    return Response({
        'envio_gratis_desde': ENVIO_GRATIS_DESDE,
        'costo_envio': COSTO_ENVIO,
        'cupones': CuponSerializer(vigentes.order_by('compra_minima', 'codigo'), many=True).data,
    })


@api_view(['POST'])
def validar_cupon(request):
    """Comprueba un código con el subtotal del carrito y devuelve cuánto se descuenta."""
    codigo = str(request.data.get('codigo', '')).strip().upper()
    try:
        subtotal = Decimal(str(request.data.get('subtotal', '0')))
    except InvalidOperation:
        return Response({'detail': 'El subtotal no es válido.'}, status=400)

    cupon = Cupon.objects.filter(codigo=codigo).first()
    if cupon is None:
        return Response({'detail': 'No existe un cupón con ese código.'}, status=400)
    error = cupon.error_para(subtotal)
    if error:
        return Response({'detail': error}, status=400)
    return Response({
        'codigo': cupon.codigo,
        'porcentaje': cupon.porcentaje,
        'descuento': cupon.descuento_sobre(subtotal),
    })
