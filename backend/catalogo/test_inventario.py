from django.contrib.auth.models import User
from django.test import TestCase

from .inventario import StockInsuficiente, registrar_movimiento
from .models import Categoria, MovimientoInventario, Producto


class InventarioTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        categoria = Categoria.objects.create(nombre='Novelas')
        cls.libro = Producto.objects.create(nombre='Trilce', precio='29.90', cantidad_disponible=10,
                                            stock_minimo=3, categoria=categoria)
        cls.poco = Producto.objects.create(nombre='Agenda', precio='38.00', cantidad_disponible=2,
                                           stock_minimo=5, categoria=categoria)
        cls.agotado = Producto.objects.create(nombre='Heraldos', precio='27.90', cantidad_disponible=0,
                                              categoria=categoria)
        cls.admin = User.objects.create_user('admin', password='clave123', is_staff=True)
        cls.cliente = User.objects.create_user('cliente', password='clave123')

    def entrar(self, usuario='admin', clave='clave123'):
        return self.client.post('/api/auth/login/', {'usuario': usuario, 'clave': clave}, content_type='application/json')

    def token(self):
        return {'HTTP_AUTHORIZATION': f'Token {self.entrar().json()["token"]}'}

    # --- servicio
    def test_entrada_suma_y_registra_el_movimiento(self):
        registrar_movimiento(self.libro.id, 5, MovimientoInventario.ENTRADA, 'Reposición')
        self.libro.refresh_from_db()
        self.assertEqual(self.libro.cantidad_disponible, 15)
        movimiento = self.libro.movimientos.get()
        self.assertEqual((movimiento.cantidad, movimiento.stock_resultante), (5, 15))

    def test_no_permite_stock_negativo(self):
        with self.assertRaises(StockInsuficiente):
            registrar_movimiento(self.poco.id, -3, MovimientoInventario.SALIDA, 'Venta')
        self.poco.refresh_from_db()
        self.assertEqual(self.poco.cantidad_disponible, 2)
        self.assertEqual(self.poco.movimientos.count(), 0)

    def test_estado_del_stock(self):
        self.assertEqual(
            (self.libro.estado_stock, self.poco.estado_stock, self.agotado.estado_stock),
            ('normal', 'bajo', 'agotado'),
        )

    # --- login y permisos
    def test_login_de_administrador(self):
        respuesta = self.entrar()
        self.assertEqual(respuesta.status_code, 200)
        self.assertIn('token', respuesta.json())

    def test_login_con_clave_incorrecta(self):
        self.assertEqual(self.entrar(clave='mala').status_code, 400)

    def test_cliente_sin_permiso_no_recibe_token(self):
        self.assertEqual(self.entrar('cliente').status_code, 403)

    def test_inventario_exige_token(self):
        self.assertEqual(self.client.get('/api/inventario/').status_code, 401)

    # --- panel
    def test_lista_ordenada_por_menor_stock(self):
        datos = self.client.get('/api/inventario/', **self.token()).json()
        self.assertEqual([p['nombre'] for p in datos], ['Heraldos', 'Agenda', 'Trilce'])

    def test_resumen(self):
        datos = self.client.get('/api/inventario/resumen/', **self.token()).json()
        self.assertEqual(datos['productos'], 3)
        self.assertEqual(datos['unidades'], 12)
        self.assertEqual(datos['agotados'], 1)
        self.assertEqual(datos['stock_bajo'], 1)
        self.assertEqual(float(datos['valor_inventario']), 29.90 * 10 + 38.00 * 2)

    def test_reponer_desde_la_api(self):
        respuesta = self.client.post(
            f'/api/inventario/{self.agotado.id}/movimiento/', {'tipo': 'entrada', 'cantidad': 8},
            content_type='application/json', **self.token())
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.json()['cantidad_disponible'], 8)
        self.assertEqual(self.agotado.movimientos.get().usuario, 'admin')

    def test_ajuste_pide_motivo(self):
        respuesta = self.client.post(
            f'/api/inventario/{self.libro.id}/movimiento/', {'tipo': 'ajuste', 'cantidad': -1},
            content_type='application/json', **self.token())
        self.assertEqual(respuesta.status_code, 400)

    def test_ajuste_no_deja_stock_negativo(self):
        respuesta = self.client.post(
            f'/api/inventario/{self.poco.id}/movimiento/', {'tipo': 'ajuste', 'cantidad': -9, 'motivo': 'Merma'},
            content_type='application/json', **self.token())
        self.assertEqual(respuesta.status_code, 400)

    def test_cambiar_stock_minimo(self):
        respuesta = self.client.patch(
            f'/api/inventario/{self.libro.id}/', {'stock_minimo': 12, 'cantidad_disponible': 999},
            content_type='application/json', **self.token())
        self.assertEqual(respuesta.status_code, 200)
        self.libro.refresh_from_db()
        # El stock mínimo cambia, pero el stock no se puede editar directamente
        self.assertEqual((self.libro.stock_minimo, self.libro.cantidad_disponible), (12, 10))

    def test_historial_de_movimientos(self):
        registrar_movimiento(self.libro.id, 4, MovimientoInventario.ENTRADA, 'Reposición')
        datos = self.client.get('/api/inventario/movimientos/', **self.token()).json()
        self.assertEqual(datos[0]['producto_nombre'], 'Trilce')
