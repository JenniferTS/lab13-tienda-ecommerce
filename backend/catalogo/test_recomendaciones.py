from django.test import TestCase

from .models import Categoria, Pedido, PedidoItem, Producto
from .recomendaciones import mas_vendidos, recomendar


class RecomendacionesTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        novelas = Categoria.objects.create(nombre='Novelas')
        poesia = Categoria.objects.create(nombre='Poesía')
        utiles = Categoria.objects.create(nombre='Útiles')

        def crear(nombre, autor, categoria, stock=5, precio='30.00'):
            return Producto.objects.create(nombre=nombre, autor=autor, precio=precio,
                                           cantidad_disponible=stock, categoria=categoria)

        cls.rios = crear('Los ríos profundos', 'José María Arguedas', novelas)
        cls.zorro = crear('El zorro de arriba y el zorro de abajo', 'José María Arguedas', novelas)
        cls.ciudad = crear('La ciudad y los perros', 'Mario Vargas Llosa', novelas)
        cls.trilce = crear('Trilce', 'César Vallejo', poesia)
        cls.cuaderno = crear('Cuaderno', 'Librería Misti', utiles)
        cls.lapicero = crear('Lapicero', 'Librería Misti', utiles)
        cls.agotado = crear('Agotado', 'José María Arguedas', novelas, stock=0)

    def vender(self, *productos, estado='entregado'):
        pedido = Pedido.objects.create(cliente_nombre='Ana', cliente_email='a@a.com', subtotal=1,
                                       total=1, estado=estado)
        for producto, cantidad in productos:
            PedidoItem.objects.create(pedido=pedido, producto=producto, cantidad=cantidad, precio_unitario=1)

    def nombres(self, lista):
        return [p.nombre for p in lista]

    def test_mismo_autor_va_primero(self):
        recomendados = recomendar([self.rios.id], limite=3)
        self.assertEqual(recomendados[0].id, self.zorro.id)
        self.assertIn('mismo autor', recomendados[0].motivo)

    def test_misma_categoria_va_despues_del_autor(self):
        recomendados = recomendar([self.rios.id], limite=2)
        self.assertEqual(self.nombres(recomendados), ['El zorro de arriba y el zorro de abajo', 'La ciudad y los perros'])

    def test_no_recomienda_el_mismo_producto_ni_los_agotados(self):
        recomendados = recomendar([self.rios.id], limite=6)
        self.assertNotIn(self.rios.id, [p.id for p in recomendados])
        self.assertNotIn(self.agotado.id, [p.id for p in recomendados])

    def test_comprados_juntos_pesan_mas(self):
        for _ in range(3):
            self.vender((self.cuaderno, 1), (self.trilce, 1))
        recomendados = recomendar([self.cuaderno.id], limite=2)
        self.assertEqual(recomendados[0].id, self.trilce.id)
        self.assertEqual(recomendados[0].motivo, 'Se compran juntos')

    def test_pedidos_cancelados_no_cuentan(self):
        self.vender((self.cuaderno, 1), (self.trilce, 1), estado='cancelado')
        self.assertEqual(self.nombres(recomendar([self.cuaderno.id], limite=1)), ['Lapicero'])

    def test_varios_productos_de_referencia(self):
        recomendados = recomendar([self.rios.id, self.cuaderno.id], limite=6)
        nombres = self.nombres(recomendados)
        self.assertIn('Lapicero', nombres)
        self.assertIn('La ciudad y los perros', nombres)

    def test_mas_vendidos_ordenados_por_unidades(self):
        self.vender((self.trilce, 5), (self.cuaderno, 1))
        self.vender((self.cuaderno, 2))
        lista = mas_vendidos(2)
        self.assertEqual(self.nombres(lista), ['Trilce', 'Cuaderno'])
        self.assertEqual(lista[0].motivo, '5 vendidos')

    def test_mas_vendidos_se_completa_si_hay_pocas_ventas(self):
        self.assertEqual(len(mas_vendidos(4)), 4)

    def test_sin_referencia_valida_recomienda_los_mas_vendidos(self):
        self.vender((self.trilce, 3))
        self.assertEqual(recomendar([9999], limite=1)[0].id, self.trilce.id)

    # --- API
    def test_api_recomendaciones_de_un_producto(self):
        datos = self.client.get(f'/api/productos/{self.rios.id}/recomendaciones/', {'limite': 2}).json()
        self.assertEqual(len(datos), 2)
        self.assertIn('motivo', datos[0])

    def test_api_recomendaciones_para_el_carrito(self):
        datos = self.client.get('/api/recomendaciones/', {'productos': f'{self.rios.id},{self.cuaderno.id}'}).json()
        self.assertTrue(datos)

    def test_api_mas_vendidos(self):
        self.vender((self.trilce, 2))
        datos = self.client.get('/api/productos/mas_vendidos/', {'limite': 1}).json()
        self.assertEqual(datos[0]['nombre'], 'Trilce')

    def test_limite_invalido_usa_el_valor_por_defecto(self):
        datos = self.client.get('/api/productos/mas_vendidos/', {'limite': 'abc'}).json()
        self.assertEqual(len(datos), 4)
