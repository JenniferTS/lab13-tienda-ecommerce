import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from catalogo.models import Pedido, PedidoItem, Producto

# Combinaciones que los clientes suelen comprar juntas (sirven para probar las recomendaciones)
CANASTAS = [
    (['Introducción a la programación con Python', 'Cálculo diferencial e integral', 'Redacción y comunicación académica'], 10),
    (['El Principito', 'Alicia en el país de las maravillas', 'Cuentos de la selva'], 9),
    (['Cuaderno cuadriculado A4 de 100 hojas', 'Resaltadores pastel (set de 6)', 'Agenda 2027 con tapa de lino'], 12),
    (['Trilce', 'Veinte poemas de amor y una canción desesperada', 'Los heraldos negros'], 6),
    (['Los ríos profundos', 'La ciudad y los perros', 'Cien años de soledad'], 8),
    (['Cálculo diferencial e integral', 'Cuaderno cuadriculado A4 de 100 hojas'], 5),
    (['El Principito', 'Resaltadores pastel (set de 6)'], 3),
]
CLIENTES = ['Lucía Mamani', 'Diego Quispe', 'Valeria Condori', 'Marco Huamán', 'Camila Flores', 'Renzo Apaza']


class Command(BaseCommand):
    help = 'Crea pedidos de ejemplo (de los últimos 60 días) para probar las recomendaciones y los más vendidos'

    def handle(self, *args, **options):
        if Pedido.objects.filter(cliente_email__endswith='@ejemplo.pe').exists():
            self.stdout.write('Los pedidos de ejemplo ya estaban cargados')
            return
        azar = random.Random(14)  # semilla fija: siempre salen los mismos pedidos
        productos = {p.nombre: p for p in Producto.objects.all()}
        creados = 0
        for nombres, veces in CANASTAS:
            for _ in range(veces):
                # En cada compra el cliente se lleva 2 o todos los productos de la combinación
                elegidos = azar.sample(nombres, k=azar.randint(min(2, len(nombres)), len(nombres)))
                items = [(productos[n], azar.choice([1, 1, 1, 2])) for n in elegidos]
                subtotal = sum((p.precio_final * c for p, c in items), Decimal('0.00'))
                cliente = azar.choice(CLIENTES)
                pedido = Pedido.objects.create(
                    cliente_nombre=cliente, cliente_email=f'{cliente.split()[0].lower()}@ejemplo.pe',
                    direccion='Arequipa', subtotal=subtotal,
                    costo_envio=Decimal('0.00') if subtotal >= 100 else Decimal('8.00'),
                    total=subtotal + (Decimal('0.00') if subtotal >= 100 else Decimal('8.00')),
                    estado=Pedido.ENTREGADO,
                )
                for producto, cantidad in items:
                    PedidoItem.objects.create(pedido=pedido, producto=producto, cantidad=cantidad,
                                              precio_unitario=producto.precio_final)
                # auto_now_add no deja elegir la fecha al crear, por eso se corrige después
                Pedido.objects.filter(pk=pedido.pk).update(
                    fecha=timezone.now() - timedelta(days=azar.randint(1, 60), hours=azar.randint(0, 12)))
                creados += 1
        self.stdout.write(self.style.SUCCESS(f'{creados} pedidos de ejemplo creados'))
