from django.core.management.base import BaseCommand

from catalogo.models import Categoria, Producto

# Datos de ejemplo de Librería Misti. Las portadas ya están en media/portadas/
CATEGORIAS = [
    ('Novelas', 'Narrativa peruana y latinoamericana'),
    ('Poesía', 'Versos para leer despacio'),
    ('Infantil', 'Cuentos para los más chicos'),
    ('Académicos', 'Textos de estudio y consulta'),
    ('Útiles', 'Todo para el cuaderno y el escritorio'),
]

# (nombre, autor, categoría, precio, cantidad disponible, descripción, archivo de portada)
PRODUCTOS = [
    ('Los ríos profundos', 'José María Arguedas', 'Novelas',
     42.9, 12,
     'Ernesto, un adolescente criado entre indios y mestizos, llega al internado de Abancay y descubre un mundo de injusticias. Una novela muy sensible sobre los Andes.',
     'portadas/los-rios-profundos.png'),
    ('La ciudad y los perros', 'Mario Vargas Llosa', 'Novelas',
     49.9, 8,
     'Historia de un grupo de cadetes del Colegio Militar Leoncio Prado, en Lima, y de la violencia que se esconde detrás de las reglas.',
     'portadas/la-ciudad-y-los-perros.png'),
    ('Cien años de soledad', 'Gabriel García Márquez', 'Novelas',
     59.9, 3,
     'La saga de la familia Buendía en el pueblo de Macondo, entre lo real y lo fantástico. Una de las novelas más leídas en español.',
     'portadas/cien-anos-de-soledad.png'),
    ('Trilce', 'César Vallejo', 'Poesía',
     29.9, 10,
     'Poemario de 1922 que rompió con todo lo anterior: palabras inventadas, imágenes inesperadas y mucha emoción.',
     'portadas/trilce.png'),
    ('Veinte poemas de amor y una canción desesperada', 'Pablo Neruda', 'Poesía',
     34.9, 15,
     'Los poemas de juventud de Neruda, publicados en 1924, sobre el amor, el deseo y la nostalgia.',
     'portadas/veinte-poemas-de-amor-y-una-cancion-desesperada.png'),
    ('Los heraldos negros', 'César Vallejo', 'Poesía',
     27.9, 0,
     'El primer libro de Vallejo, de 1919. Habla del dolor, de la fe y de la vida cotidiana en los Andes.',
     'portadas/los-heraldos-negros.png'),
    ('El Principito', 'Antoine de Saint-Exupéry', 'Infantil',
     32.9, 20,
     'Un piloto perdido en el desierto conoce a un pequeño príncipe que viaja de planeta en planeta. Un cuento para todas las edades.',
     'portadas/el-principito.png'),
    ('Alicia en el país de las maravillas', 'Lewis Carroll', 'Infantil',
     36.9, 9,
     'Alicia sigue a un conejo blanco por una madriguera y llega a un mundo donde nada tiene sentido.',
     'portadas/alicia-en-el-pais-de-las-maravillas.png'),
    ('Cuentos de la selva', 'Horacio Quiroga', 'Infantil',
     24.9, 14,
     'Historias de animales de la selva, como la tortuga gigante y los flamencos, escritas para sus propios hijos.',
     'portadas/cuentos-de-la-selva.png'),
    ('Introducción a la programación con Python', 'Varios autores', 'Académicos',
     79.9, 6,
     'Variables, condicionales, bucles y funciones explicados paso a paso, con ejercicios resueltos para empezar a programar.',
     'portadas/introduccion-a-la-programacion-con-python.png'),
    ('Cálculo diferencial e integral', 'Varios autores', 'Académicos',
     89.9, 4,
     'Límites, derivadas e integrales con ejemplos de ingeniería y problemas propuestos al final de cada capítulo.',
     'portadas/calculo-diferencial-e-integral.png'),
    ('Redacción y comunicación académica', 'Varios autores', 'Académicos',
     54.9, 11,
     'Guía para redactar informes y trabajos con normas APA, con modelos de citas y referencias.',
     'portadas/redaccion-y-comunicacion-academica.png'),
    ('Cuaderno cuadriculado A4 de 100 hojas', 'Librería Misti', 'Útiles',
     12.5, 40,
     'Tapa dura, hojas de 80 g y cuadrícula de 5 mm. Ideal para matemáticas y apuntes de clase.',
     'portadas/cuaderno-cuadriculado-a4-de-100-hojas.png'),
    ('Resaltadores pastel (set de 6)', 'Librería Misti', 'Útiles',
     18.9, 25,
     'Seis colores pastel de punta biselada y tinta que no traspasa el papel.',
     'portadas/resaltadores-pastel-set-de-6.png'),
    ('Agenda 2027 con tapa de lino', 'Librería Misti', 'Útiles',
     38.0, 2,
     'Agenda semanal con calendario de feriados del Perú, marcador de cinta y bolsillo interior.',
     'portadas/agenda-2027-con-tapa-de-lino.png'),
]


class Command(BaseCommand):
    help = 'Carga las categorías y los productos de ejemplo de la librería'

    def handle(self, *args, **options):
        for nombre, descripcion in CATEGORIAS:
            Categoria.objects.get_or_create(nombre=nombre, defaults={'descripcion': descripcion})

        for nombre, autor, categoria, precio, cantidad, descripcion, imagen in PRODUCTOS:
            Producto.objects.update_or_create(
                nombre=nombre,
                defaults={
                    'autor': autor,
                    'descripcion': descripcion,
                    'precio': precio,
                    'cantidad_disponible': cantidad,
                    'imagen': imagen,
                    'categoria': Categoria.objects.get(nombre=categoria),
                },
            )
        self.stdout.write(self.style.SUCCESS(
            f'{Categoria.objects.count()} categorías y {Producto.objects.count()} productos cargados'))
