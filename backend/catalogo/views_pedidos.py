from rest_framework import mixins, status, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import Pedido
from .pedidos import crear_pedido
from .serializers import PedidoEntradaSerializer, PedidoSerializer


class PedidoViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin,
                    viewsets.GenericViewSet):
    """Cualquier cliente puede crear un pedido; solo los administradores pueden verlos."""
    queryset = Pedido.objects.prefetch_related('items__producto')
    serializer_class = PedidoSerializer

    def get_permissions(self):
        return [AllowAny() if self.action == 'create' else IsAdminUser()]

    def create(self, request, *args, **kwargs):
        entrada = PedidoEntradaSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        pedido = crear_pedido(entrada.validated_data)
        return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)
