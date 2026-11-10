from django.contrib import admin

from .models import Categoria, Producto


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')
    search_fields = ('nombre',)


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'autor', 'categoria', 'precio', 'cantidad_disponible')
    list_filter = ('categoria',)
    search_fields = ('nombre', 'autor')
