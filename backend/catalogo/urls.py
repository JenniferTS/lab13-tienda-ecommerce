from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CategoriaViewSet, ProductoViewSet
from .views_promociones import configuracion, validar_cupon
from .views_inventario import InventarioViewSet, LoginView

router = DefaultRouter()
router.register('categorias', CategoriaViewSet)
router.register('productos', ProductoViewSet, basename='producto')
router.register('inventario', InventarioViewSet, basename='inventario')

urlpatterns = [
    path('auth/login/', LoginView.as_view()),
    path('configuracion/', configuracion),
    path('cupones/validar/', validar_cupon),
] + router.urls
