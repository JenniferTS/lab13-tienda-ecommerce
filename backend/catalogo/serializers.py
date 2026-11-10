from rest_framework import serializers

from .models import Categoria, Producto


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion']


class ProductoSerializer(serializers.ModelSerializer):
    # Se devuelve el nombre de la categoría además de su id para no hacer otra consulta
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id', 'nombre', 'autor', 'descripcion', 'precio', 'imagen',
            'cantidad_disponible', 'categoria', 'categoria_nombre',
        ]
