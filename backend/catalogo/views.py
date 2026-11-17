from django.db.models import Count
from rest_framework import viewsets

from .filtros import filtrar_productos
from .models import Categoria, Producto
from .serializers import CategoriaSerializer, ProductoSerializer


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
