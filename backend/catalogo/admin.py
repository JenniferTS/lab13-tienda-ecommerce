from django.contrib import admin

from .inventario import registrar_movimiento
from .models import Categoria, MovimientoInventario, Producto


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')
    search_fields = ('nombre',)


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'autor', 'categoria', 'precio', 'cantidad_disponible', 'stock_minimo', 'estado')
    list_filter = ('categoria',)
    search_fields = ('nombre', 'autor')
    actions = ['reponer_10']
    # El stock no se edita a mano: se cambia con movimientos para que quede registrado
    readonly_fields = ('cantidad_disponible',)

    @admin.display(description='estado del stock')
    def estado(self, producto):
        return producto.estado_stock

    @admin.action(description='Reponer 10 unidades a los productos seleccionados')
    def reponer_10(self, request, queryset):
        for producto in queryset:
            registrar_movimiento(producto.id, 10, MovimientoInventario.ENTRADA,
                                 'Reposición desde el administrador', request.user.get_username())
        self.message_user(request, f'Se repusieron 10 unidades a {queryset.count()} productos.')


@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ('fecha', 'producto', 'tipo', 'cantidad', 'stock_resultante', 'motivo', 'usuario')
    list_filter = ('tipo',)
    search_fields = ('producto__nombre', 'motivo')
    date_hierarchy = 'fecha'

    # Los movimientos son un historial: no se crean ni se editan a mano
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
