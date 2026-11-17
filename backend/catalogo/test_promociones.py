from datetime import date, timedelta
from decimal import Decimal

from django.test import TestCase

from .models import Categoria, Cupon, Producto


class PromocionesTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        categoria = Categoria.objects.create(nombre='Infantil')
        cls.principito = Producto.objects.create(nombre='El Principito', precio='32.90', descuento=20,
                                                 cantidad_disponible=5, categoria=categoria)
        cls.alicia = Producto.objects.create(nombre='Alicia', precio='36.90', cantidad_disponible=5,
                                             categoria=categoria)
        Cupon.objects.create(codigo='misti10', porcentaje=10)
        Cupon.objects.create(codigo='LECTOR15', porcentaje=15, compra_minima='80')
        Cupon.objects.create(codigo='VIEJO', porcentaje=20, vence=date.today() - timedelta(days=1))
        Cupon.objects.create(codigo='APAGADO', porcentaje=5, activo=False)

    def validar(self, codigo, subtotal='100'):
        return self.client.post('/api/cupones/validar/', {'codigo': codigo, 'subtotal': subtotal},
                                content_type='application/json')

    # --- precios
    def test_precio_final_con_descuento(self):
        self.principito.refresh_from_db()
        self.assertEqual(self.principito.precio_final, Decimal('26.32'))
        self.assertTrue(self.principito.en_oferta)

    def test_producto_sin_descuento_mantiene_su_precio(self):
        self.alicia.refresh_from_db()
        self.assertEqual(self.alicia.precio_final, Decimal('36.90'))
        self.assertFalse(self.alicia.en_oferta)

    def test_la_api_devuelve_precio_final_y_descuento(self):
        datos = {p['nombre']: p for p in self.client.get('/api/productos/').json()}
        self.assertEqual(datos['El Principito']['precio_final'], '26.32')
        self.assertEqual(datos['El Principito']['descuento'], 20)

    def test_filtro_solo_ofertas(self):
        nombres = [p['nombre'] for p in self.client.get('/api/productos/', {'en_oferta': '1'}).json()]
        self.assertEqual(nombres, ['El Principito'])

    def test_filtro_de_precio_usa_el_precio_final(self):
        # El Principito cuesta 32.90 pero con el descuento queda en 26.32
        nombres = [p['nombre'] for p in self.client.get('/api/productos/', {'precio_max': '30'}).json()]
        self.assertEqual(nombres, ['El Principito'])

    def test_orden_por_mayor_descuento(self):
        nombres = [p['nombre'] for p in self.client.get('/api/productos/', {'orden': 'descuento'}).json()]
        self.assertEqual(nombres[0], 'El Principito')

    # --- cupones
    def test_cupon_valido_sin_importar_mayusculas(self):
        respuesta = self.validar('MISTI10', '120')
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(float(respuesta.json()['descuento']), 12.0)

    def test_cupon_inexistente(self):
        self.assertEqual(self.validar('NOEXISTE').status_code, 400)

    def test_cupon_vencido(self):
        respuesta = self.validar('VIEJO')
        self.assertEqual(respuesta.status_code, 400)
        self.assertIn('venció', respuesta.json()['detail'])

    def test_cupon_inactivo(self):
        self.assertEqual(self.validar('APAGADO').status_code, 400)

    def test_cupon_con_compra_minima(self):
        self.assertEqual(self.validar('LECTOR15', '50').status_code, 400)
        self.assertEqual(self.validar('LECTOR15', '80').status_code, 200)

    def test_subtotal_invalido(self):
        self.assertEqual(self.validar('MISTI10', 'abc').status_code, 400)

    def test_configuracion_lista_solo_cupones_vigentes(self):
        datos = self.client.get('/api/configuracion/').json()
        self.assertEqual({c['codigo'] for c in datos['cupones']}, {'MISTI10', 'LECTOR15'})
        self.assertEqual(float(datos['envio_gratis_desde']), 100.0)
