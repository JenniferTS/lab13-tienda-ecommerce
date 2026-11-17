from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase

from .models import Categoria, Cupon, MovimientoInventario, Pedido, Producto


class PedidosTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        categoria = Categoria.objects.create(nombre='Novelas')
        cls.rios = Producto.objects.create(nombre='Los ríos profundos', precio='40.00', cantidad_disponible=5,
                                           categoria=categoria)
        cls.principito = Producto.objects.create(nombre='El Principito', precio='50.00', descuento=20,
                                                 cantidad_disponible=3, categoria=categoria)
        cls.cuaderno = Producto.objects.create(nombre='Cuaderno', precio='12.50', cantidad_disponible=1,
                                               categoria=categoria)
        Cupon.objects.create(codigo='MISTI10', porcentaje=10)
        cls.admin = User.objects.create_user('admin', password='clave123', is_staff=True)

    def pedir(self, items, **extra):
        datos = {'cliente_nombre': 'Ana Quispe', 'cliente_email': 'ana@correo.com', 'items': items, **extra}
        return self.client.post('/api/pedidos/', datos, content_type='application/json')

    def test_pedido_descuenta_stock_y_registra_movimientos(self):
        respuesta = self.pedir([{'producto': self.rios.id, 'cantidad': 2}])
        self.assertEqual(respuesta.status_code, 201)
        self.rios.refresh_from_db()
        self.assertEqual(self.rios.cantidad_disponible, 3)
        movimiento = self.rios.movimientos.get()
        self.assertEqual((movimiento.tipo, movimiento.cantidad), (MovimientoInventario.SALIDA, -2))

    def test_totales_con_descuento_de_producto_y_envio(self):
        # 2 x 40.00 + 1 x 40.00 (50 con 20% de descuento) = 120.00 -> envío gratis
        datos = self.pedir([{'producto': self.rios.id, 'cantidad': 2},
                            {'producto': self.principito.id, 'cantidad': 1}]).json()
        self.assertEqual(Decimal(datos['subtotal']), Decimal('120.00'))
        self.assertEqual(Decimal(datos['costo_envio']), Decimal('0.00'))
        self.assertEqual(Decimal(datos['total']), Decimal('120.00'))

    def test_envio_se_cobra_si_no_llega_al_monto(self):
        datos = self.pedir([{'producto': self.rios.id, 'cantidad': 1}]).json()
        self.assertEqual(Decimal(datos['costo_envio']), Decimal('8.00'))
        self.assertEqual(Decimal(datos['total']), Decimal('48.00'))

    def test_cupon_se_aplica_al_subtotal(self):
        datos = self.pedir([{'producto': self.rios.id, 'cantidad': 3}], cupon='misti10').json()
        # 120.00 - 12.00 de cupón = 108.00, con envío gratis
        self.assertEqual(Decimal(datos['descuento_cupon']), Decimal('12.00'))
        self.assertEqual(Decimal(datos['total']), Decimal('108.00'))
        self.assertEqual(datos['cupon_codigo'], 'MISTI10')

    def test_cupon_invalido_cancela_el_pedido(self):
        respuesta = self.pedir([{'producto': self.rios.id, 'cantidad': 1}], cupon='FALSO')
        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(Pedido.objects.count(), 0)

    def test_stock_insuficiente_no_guarda_nada(self):
        # Hay 5 libros y 1 cuaderno: el cuaderno falla y el pedido completo se deshace
        respuesta = self.pedir([{'producto': self.rios.id, 'cantidad': 2},
                                {'producto': self.cuaderno.id, 'cantidad': 2}])
        self.assertEqual(respuesta.status_code, 400)
        self.assertIn('Cuaderno', str(respuesta.json()))
        self.assertEqual(Pedido.objects.count(), 0)
        self.rios.refresh_from_db()
        self.assertEqual(self.rios.cantidad_disponible, 5)

    def test_el_precio_se_toma_del_servidor(self):
        respuesta = self.pedir([{'producto': self.rios.id, 'cantidad': 1, 'precio': '0.01'}])
        self.assertEqual(Decimal(respuesta.json()['subtotal']), Decimal('40.00'))

    def test_productos_repetidos_se_suman(self):
        respuesta = self.pedir([{'producto': self.rios.id, 'cantidad': 2}, {'producto': self.rios.id, 'cantidad': 4}])
        self.assertEqual(respuesta.status_code, 400)  # 6 unidades y solo hay 5

    def test_datos_invalidos(self):
        self.assertEqual(self.pedir([]).status_code, 400)
        self.assertEqual(self.pedir([{'producto': self.rios.id, 'cantidad': 0}]).status_code, 400)
        self.assertEqual(self.pedir([{'producto': 9999, 'cantidad': 1}]).status_code, 400)
        correo_malo = self.client.post(
            '/api/pedidos/', {'cliente_nombre': 'Ana', 'cliente_email': 'no-es-correo',
                              'items': [{'producto': self.rios.id, 'cantidad': 1}]},
            content_type='application/json')
        self.assertEqual(correo_malo.status_code, 400)

    def test_los_pedidos_solo_los_ve_un_administrador(self):
        self.pedir([{'producto': self.rios.id, 'cantidad': 1}])
        self.assertEqual(self.client.get('/api/pedidos/').status_code, 401)
        token = self.client.post('/api/auth/login/', {'usuario': 'admin', 'clave': 'clave123'},
                                 content_type='application/json').json()['token']
        lista = self.client.get('/api/pedidos/', HTTP_AUTHORIZATION=f'Token {token}').json()
        self.assertEqual(len(lista), 1)
        self.assertEqual(lista[0]['items'][0]['producto_nombre'], 'Los ríos profundos')
