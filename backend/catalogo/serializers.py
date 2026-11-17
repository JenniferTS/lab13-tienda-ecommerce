from rest_framework import serializers

from .models import Categoria, MovimientoInventario, Producto


class CategoriaSerializer(serializers.ModelSerializer):
    total_productos = serializers.IntegerField(read_only=True)

    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'total_productos']


class ProductoSerializer(serializers.ModelSerializer):
    # Se devuelve el nombre de la categoría además de su id para no hacer otra consulta
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    stock_bajo = serializers.BooleanField(read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id', 'nombre', 'autor', 'descripcion', 'precio', 'imagen',
            'cantidad_disponible', 'stock_bajo', 'categoria', 'categoria_nombre',
        ]


class InventarioSerializer(serializers.ModelSerializer):
    """Vista del producto para el panel de inventario. Solo se puede editar el stock mínimo."""
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    estado_stock = serializers.CharField(read_only=True)
    valor_stock = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = [
            'id', 'nombre', 'autor', 'imagen', 'categoria_nombre', 'precio',
            'cantidad_disponible', 'stock_minimo', 'estado_stock', 'valor_stock',
        ]
        read_only_fields = [f for f in fields if f != 'stock_minimo']

    def get_valor_stock(self, producto):
        return producto.precio * producto.cantidad_disponible


class MovimientoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    tipo_texto = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = MovimientoInventario
        fields = ['id', 'producto', 'producto_nombre', 'tipo', 'tipo_texto', 'cantidad',
                  'stock_resultante', 'motivo', 'usuario', 'fecha']


class NuevoMovimientoSerializer(serializers.Serializer):
    """Datos que envía el panel para reponer o ajustar el stock de un producto."""
    tipo = serializers.ChoiceField(choices=[MovimientoInventario.ENTRADA, MovimientoInventario.AJUSTE])
    cantidad = serializers.IntegerField()
    motivo = serializers.CharField(max_length=120, required=False, allow_blank=True)

    def validate(self, datos):
        if datos['cantidad'] == 0:
            raise serializers.ValidationError({'cantidad': 'La cantidad no puede ser 0.'})
        if datos['tipo'] == MovimientoInventario.ENTRADA and datos['cantidad'] < 0:
            raise serializers.ValidationError({'cantidad': 'Una reposición debe ser mayor que 0.'})
        if datos['tipo'] == MovimientoInventario.AJUSTE and not datos.get('motivo', '').strip():
            raise serializers.ValidationError({'motivo': 'Indica el motivo del ajuste.'})
        return datos
