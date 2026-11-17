from django.contrib.auth import authenticate
from django.db.models import F, Sum
from rest_framework import mixins, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .inventario import StockInsuficiente, registrar_movimiento
from .models import MovimientoInventario, Producto
from .serializers import InventarioSerializer, MovimientoSerializer, NuevoMovimientoSerializer


class LoginView(APIView):
    """POST /api/auth/login/ con usuario y clave. Devuelve un token si es un administrador."""
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        usuario = authenticate(username=request.data.get('usuario'), password=request.data.get('clave'))
        if usuario is None:
            return Response({'detail': 'Usuario o contraseña incorrectos.'}, status=status.HTTP_400_BAD_REQUEST)
        if not usuario.is_staff:
            return Response({'detail': 'Esta cuenta no tiene permiso para administrar la tienda.'},
                            status=status.HTTP_403_FORBIDDEN)
        token, _ = Token.objects.get_or_create(user=usuario)
        return Response({'token': token.key, 'usuario': usuario.get_username()})


class InventarioViewSet(mixins.ListModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """Panel de inventario: solo para administradores (token en el encabezado Authorization)."""
    permission_classes = [IsAdminUser]
    serializer_class = InventarioSerializer
    queryset = Producto.objects.select_related('categoria').order_by('cantidad_disponible', 'nombre')
    http_method_names = ['get', 'patch', 'post', 'head', 'options']

    @action(detail=False)
    def resumen(self, request):
        productos = Producto.objects.all()
        valor = productos.aggregate(v=Sum(F('precio') * F('cantidad_disponible')))['v'] or 0
        return Response({
            'productos': productos.count(),
            'unidades': productos.aggregate(u=Sum('cantidad_disponible'))['u'] or 0,
            'valor_inventario': valor,
            'agotados': productos.filter(cantidad_disponible=0).count(),
            'stock_bajo': sum(1 for p in productos if p.stock_bajo),
        })

    @action(detail=False)
    def movimientos(self, request):
        movimientos = MovimientoInventario.objects.select_related('producto')
        producto = request.query_params.get('producto')
        if producto:
            movimientos = movimientos.filter(producto_id=producto)
        return Response(MovimientoSerializer(movimientos[:30], many=True).data)

    @action(detail=True, methods=['post'])
    def movimiento(self, request, pk=None):
        """Repone (entrada) o corrige (ajuste) el stock de un producto."""
        self.get_object()
        datos = NuevoMovimientoSerializer(data=request.data)
        datos.is_valid(raise_exception=True)
        try:
            registrar_movimiento(
                pk, datos.validated_data['cantidad'], datos.validated_data['tipo'],
                datos.validated_data.get('motivo') or 'Reposición de mercadería',
                usuario=request.user.get_username(),
            )
        except StockInsuficiente as error:
            return Response({'detail': str(error)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(InventarioSerializer(self.get_object(), context={'request': request}).data)
