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
    categoria = models.ForeignKey(
        Categoria, on_delete=models.CASCADE, related_name='productos'
    )

    class Meta:
        ordering = ['nombre']
        verbose_name_plural = 'productos'

    def __str__(self):
        return self.nombre
