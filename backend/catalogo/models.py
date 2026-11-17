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
