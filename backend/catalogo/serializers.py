from rest_framework import serializers

from .models import Categoria, Cupon, MovimientoInventario, Pedido, PedidoItem, Producto


class CategoriaSerializer(serializers.ModelSerializer):
    total_productos = serializers.IntegerField(read_only=True)

    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'total_productos']


class ProductoSerializer(serializers.ModelSerializer):
    # Se devuelve el nombre de la categoría además de su id para no hacer otra consulta
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    stock_bajo = serializers.BooleanField(read_only=True)
    en_oferta = serializers.BooleanField(read_only=True)
    precio_final = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id', 'nombre', 'autor', 'descripcion', 'precio', 'descuento', 'precio_final', 'en_oferta',
            'imagen', 'cantidad_disponible', 'stock_bajo', 'categoria', 'categoria_nombre',
        ]


class RecomendacionSerializer(ProductoSerializer):
    """Producto recomendado con el motivo por el que se recomienda."""
    motivo = serializers.CharField(read_only=True, default='')

    class Meta(ProductoSerializer.Meta):
        fields = ProductoSerializer.Meta.fields + ['motivo']


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


class CuponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cupon
        fields = ['codigo', 'porcentaje', 'compra_minima', 'vence']


class ItemPedidoEntradaSerializer(serializers.Serializer):
    producto = serializers.IntegerField()
    cantidad = serializers.IntegerField(min_value=1, max_value=50)


class PedidoEntradaSerializer(serializers.Serializer):
    """Datos que envía el carrito para confirmar la compra."""
    cliente_nombre = serializers.CharField(max_length=100)
    cliente_email = serializers.EmailField()
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    direccion = serializers.CharField(max_length=200, required=False, allow_blank=True)
    cupon = serializers.CharField(max_length=20, required=False, allow_blank=True)
    items = ItemPedidoEntradaSerializer(many=True, allow_empty=False)


class PedidoItemSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    importe = serializers.DecimalField(max_digits=9, decimal_places=2, read_only=True)

    class Meta:
        model = PedidoItem
        fields = ['producto', 'producto_nombre', 'cantidad', 'precio_unitario', 'importe']


class PedidoSerializer(serializers.ModelSerializer):
    items = PedidoItemSerializer(many=True, read_only=True)
    estado_texto = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = Pedido
        fields = ['id', 'cliente_nombre', 'cliente_email', 'telefono', 'direccion', 'cupon_codigo',
                  'subtotal', 'descuento_cupon', 'costo_envio', 'total', 'estado', 'estado_texto',
                  'fecha', 'items']
