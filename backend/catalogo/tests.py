from django.test import TestCase

from .models import Categoria, Producto


class BusquedaYFiltrosTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        novelas = Categoria.objects.create(nombre='Novelas')
        utiles = Categoria.objects.create(nombre='Útiles')
        crear = Producto.objects.create
        cls.rios = crear(nombre='Los ríos profundos', autor='José María Arguedas', descripcion='Andes',
                         precio='42.90', cantidad_disponible=12, categoria=novelas)
        cls.ciudad = crear(nombre='La ciudad y los perros', autor='Mario Vargas Llosa', descripcion='Cadetes',
                           precio='49.90', cantidad_disponible=0, categoria=novelas)
        cls.libro = crear(nombre='Cálculo', autor='Varios autores', descripcion='Integrales',
                          precio='89.90', cantidad_disponible=4, categoria=novelas)
        cls.cuaderno = crear(nombre='Cuaderno A4', autor='Librería Misti', descripcion='Cuadriculado',
                             precio='12.50', cantidad_disponible=40, categoria=utiles)

    def nombres(self, **params):
        respuesta = self.client.get('/api/productos/', params)
        self.assertEqual(respuesta.status_code, 200)
        return [p['nombre'] for p in respuesta.json()]

    def test_busqueda_ignora_tildes_y_mayusculas(self):
        self.assertEqual(self.nombres(q='RIOS'), ['Los ríos profundos'])

    def test_busqueda_coincide_con_el_inicio_de_la_palabra(self):
        # «rios» no debe encontrar «Varios autores»
        self.assertNotIn('Cálculo', self.nombres(q='rios'))
        self.assertEqual(self.nombres(q='cuad'), ['Cuaderno A4'])

    def test_busqueda_por_autor(self):
        self.assertEqual(self.nombres(q='vargas llosa'), ['La ciudad y los perros'])

    def test_busqueda_sin_resultados(self):
        self.assertEqual(self.nombres(q='xyz'), [])

    def test_filtro_por_categoria(self):
        self.assertEqual(self.nombres(categoria=self.cuaderno.categoria_id), ['Cuaderno A4'])

    def test_filtro_por_rango_de_precio(self):
        self.assertEqual(self.nombres(precio_min='40', precio_max='45'), ['Los ríos profundos'])

    def test_solo_disponibles(self):
        self.assertNotIn('La ciudad y los perros', self.nombres(disponibles='1'))

    def test_orden_por_precio(self):
        self.assertEqual(self.nombres(orden='precio_asc')[0], 'Cuaderno A4')
        self.assertEqual(self.nombres(orden='precio_desc')[0], 'Cálculo')

    def test_precio_invalido_se_ignora(self):
        self.assertEqual(len(self.nombres(precio_min='abc')), 4)

    def test_detalle_no_aplica_filtros(self):
        respuesta = self.client.get(f'/api/productos/{self.rios.id}/', {'q': 'no coincide'})
        self.assertEqual(respuesta.status_code, 200)

    def test_categorias_incluyen_total_de_productos(self):
        datos = {c['nombre']: c['total_productos'] for c in self.client.get('/api/categorias/').json()}
        self.assertEqual(datos, {'Novelas': 3, 'Útiles': 1})
