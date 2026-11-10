from rest_framework import viewsets

from .models import Categoria, Producto
from .serializers import CategoriaSerializer, ProductoSerializer


class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


class ProductoViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductoSerializer

    def get_queryset(self):
        productos = Producto.objects.select_related('categoria')
        # /api/productos/?categoria=3 devuelve solo los de esa categoría
        categoria = self.request.query_params.get('categoria')
        if categoria:
            productos = productos.filter(categoria_id=categoria)
        return productos
