from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .filtros import filtrar_productos
from .models import Categoria, Producto
from .recomendaciones import mas_vendidos, recomendar
from .serializers import CategoriaSerializer, ProductoSerializer, RecomendacionSerializer


class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    # total_productos permite mostrar cuántos productos tiene cada categoría
    queryset = Categoria.objects.annotate(total_productos=Count('productos'))
    serializer_class = CategoriaSerializer


class ProductoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Producto.objects.select_related('categoria')
    serializer_class = ProductoSerializer

    def filter_queryset(self, queryset):
        # Los filtros solo se aplican al listado; el detalle de un producto no los necesita
        if self.action == 'list':
            return filtrar_productos(queryset, self.request.query_params)
        return queryset

    def _limite(self):
        try:
            return max(1, min(int(self.request.query_params.get('limite', 4)), 12))
        except ValueError:
            return 4

    @action(detail=False)
    def mas_vendidos(self, request):
        """/api/productos/mas_vendidos/?limite=4"""
        productos = mas_vendidos(self._limite())
        return Response(RecomendacionSerializer(productos, many=True, context={'request': request}).data)

    @action(detail=True)
    def recomendaciones(self, request, pk=None):
        """/api/productos/5/recomendaciones/: productos parecidos o comprados junto con el 5"""
        productos = recomendar([self.get_object().id], self._limite())
        return Response(RecomendacionSerializer(productos, many=True, context={'request': request}).data)


@api_view(['GET'])
def recomendaciones_para_carrito(request):
    """/api/recomendaciones/?productos=1,2,3: recomendaciones para varios productos a la vez"""
    ids = [int(i) for i in request.query_params.get('productos', '').split(',') if i.strip().isdigit()]
    try:
        limite = max(1, min(int(request.query_params.get('limite', 4)), 12))
    except ValueError:
        limite = 4
    productos = recomendar(ids, limite)
    return Response(RecomendacionSerializer(productos, many=True, context={'request': request}).data)
