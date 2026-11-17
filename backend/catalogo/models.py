from datetime import date
from decimal import ROUND_HALF_UP, Decimal

from django.core.validators import MaxValueValidator
from django.db import models


class Categoria(models.Model):
    nombre = models.CharField(max_length=60, unique=True)
    descripcion = models.CharField('descripción', max_length=200, blank=True)

    class Meta:
        ordering = ['nombre']
        verbose_name = 'categoría'
        verbose_name_plural = 'categorías'

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    nombre = models.CharField(max_length=120)
    autor = models.CharField(max_length=80, blank=True)
    descripcion = models.TextField('descripción')
    precio = models.DecimalField(max_digits=8, decimal_places=2)
    imagen = models.ImageField(upload_to='portadas/', blank=True)
    cantidad_disponible = models.PositiveIntegerField('cantidad disponible', default=0)
    # Porcentaje de descuento de la promoción (0 = sin promoción)
    descuento = models.PositiveSmallIntegerField(
        'descuento (%)', default=0, validators=[MaxValueValidator(90)],
        help_text='Porcentaje de descuento. 0 significa que el producto no está en oferta.',
    )
    # Cuando el stock baja de este número se avisa que hay que reponer
    stock_minimo = models.PositiveIntegerField('stock mínimo', default=3)
    categoria = models.ForeignKey(
        Categoria, on_delete=models.CASCADE, related_name='productos'
    )

    class Meta:
        ordering = ['nombre']
        verbose_name_plural = 'productos'

    def __str__(self):
        return self.nombre

    @property
    def en_oferta(self):
        return self.descuento > 0

    @property
    def precio_final(self):
        """Precio que paga el cliente, con el descuento ya aplicado."""
        if not self.en_oferta:
            return self.precio
        return (self.precio * (100 - self.descuento) / 100).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @property
    def stock_bajo(self):
        return 0 < self.cantidad_disponible <= self.stock_minimo

    @property
    def estado_stock(self):
        if self.cantidad_disponible == 0:
            return 'agotado'
        return 'bajo' if self.stock_bajo else 'normal'


class MovimientoInventario(models.Model):
    """Cada entrada o salida de mercadería queda registrada, para saber por qué cambió el stock."""

    ENTRADA = 'entrada'
    SALIDA = 'salida'
    AJUSTE = 'ajuste'
    TIPOS = [
        (ENTRADA, 'Entrada (reposición)'),
        (SALIDA, 'Salida (venta)'),
        (AJUSTE, 'Ajuste (merma o corrección)'),
    ]

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='movimientos')
    tipo = models.CharField(max_length=10, choices=TIPOS)
    # Positiva si entran unidades y negativa si salen
    cantidad = models.IntegerField()
    stock_resultante = models.PositiveIntegerField('stock después del movimiento')
    motivo = models.CharField(max_length=120, blank=True)
    usuario = models.CharField(max_length=60, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha', '-id']
        verbose_name = 'movimiento de inventario'
        verbose_name_plural = 'movimientos de inventario'

    def __str__(self):
        return f'{self.producto} {self.cantidad:+d} ({self.tipo})'


class Cupon(models.Model):
    """Código de descuento que el cliente escribe en el carrito."""

    codigo = models.CharField(max_length=20, unique=True)
    porcentaje = models.PositiveSmallIntegerField('descuento (%)', validators=[MaxValueValidator(90)])
    compra_minima = models.DecimalField('compra mínima', max_digits=8, decimal_places=2, default=0)
    vence = models.DateField('válido hasta', null=True, blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ['codigo']
        verbose_name = 'cupón'
        verbose_name_plural = 'cupones'

    def __str__(self):
        return f'{self.codigo} (-{self.porcentaje}%)'

    def save(self, *args, **kwargs):
        self.codigo = self.codigo.strip().upper()
        super().save(*args, **kwargs)

    @property
    def vigente(self):
        return self.activo and (self.vence is None or self.vence >= date.today())

    def error_para(self, subtotal):
        """Devuelve el motivo por el que no se puede usar con este subtotal, o None si es válido."""
        if not self.activo:
            return 'Este cupón ya no está activo.'
        if self.vence is not None and self.vence < date.today():
            return f'Este cupón venció el {self.vence:%d/%m/%Y}.'
        if subtotal < self.compra_minima:
            return f'Este cupón se usa desde una compra de S/ {self.compra_minima:.2f}.'
        return None

    def descuento_sobre(self, subtotal):
        return (subtotal * self.porcentaje / 100).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


class Pedido(models.Model):
    """Compra confirmada por un cliente. Los precios quedan guardados tal como se cobraron."""

    PENDIENTE = 'pendiente'
    ENTREGADO = 'entregado'
    CANCELADO = 'cancelado'
    ESTADOS = [(PENDIENTE, 'Pendiente'), (ENTREGADO, 'Entregado'), (CANCELADO, 'Cancelado')]

    cliente_nombre = models.CharField('nombre del cliente', max_length=100)
    cliente_email = models.EmailField('correo')
    telefono = models.CharField('teléfono', max_length=20, blank=True)
    direccion = models.CharField('dirección de entrega', max_length=200, blank=True)
    cupon_codigo = models.CharField('cupón usado', max_length=20, blank=True)
    subtotal = models.DecimalField(max_digits=9, decimal_places=2)
    descuento_cupon = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    costo_envio = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=9, decimal_places=2)
    estado = models.CharField(max_length=10, choices=ESTADOS, default=PENDIENTE)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha', '-id']

    def __str__(self):
        return f'Pedido {self.id} de {self.cliente_nombre}'


class PedidoItem(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name='ventas')
    cantidad = models.PositiveIntegerField()
    # Precio que se cobró por unidad (con el descuento del producto)
    precio_unitario = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f'{self.cantidad} x {self.producto}'

    @property
    def importe(self):
        return self.precio_unitario * self.cantidad
