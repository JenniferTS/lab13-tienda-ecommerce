# Librería Misti

Tienda virtual de libros y útiles (Laboratorios 13 y 14 de Desarrollo de Aplicaciones Empresariales).
Frontend con **React + Vite + Tailwind CSS + shadcn/ui** y backend con **Django + Django REST Framework**.

```
libreria-misti/
├── backend/    API REST (Django): catálogo, inventario, promociones, pedidos y recomendaciones
├── frontend/   Aplicación React: components, pages, context, hooks y services
└── docs/       Análisis del negocio, objetivos y características (S14), esquemas y boceto
```

## Funciones

| Función | Dónde está |
|---|---|
| Catálogo con búsqueda (sin tildes), filtros por categoría y precio, orden y «solo ofertas» | `pages/Catalogo.jsx`, `catalogo/filtros.py` |
| Detalle del producto en una ventana | `components/ProductDetail.jsx` |
| Inventario: stock mínimo, movimientos, alertas y panel para administradores (`#/inventario`) | `pages/Inventario.jsx`, `catalogo/inventario.py` |
| Promociones: descuento por producto, ofertas, cupones y envío gratis desde S/ 100 | `components/Ofertas.jsx`, `catalogo/promociones.py` |
| Carrito (guardado en el navegador) y pedidos que descuentan el stock | `context/CarritoProvider.jsx`, `catalogo/pedidos.py` |
| Recomendaciones y más vendidos | `components/Recomendaciones.jsx`, `catalogo/recomendaciones.py` |
| Diseño responsivo (celular, tablet y computadora) | Clases de Tailwind en todos los componentes |

## Cómo ejecutarlo

### Backend (puerto 8000)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # en Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py cargar_datos   # categorías, productos (con portadas), descuentos y cupones
python manage.py cargar_ventas  # pedidos de ejemplo para las recomendaciones y los más vendidos
python manage.py createsuperuser
python manage.py runserver
```

El usuario que crees con `createsuperuser` sirve para el administrador (`http://localhost:8000/admin/`) y para el panel de inventario de la tienda (`http://localhost:5173/#/inventario`).

### Frontend (puerto 5173)

```bash
cd frontend
npm install
npm run dev
```

La dirección de la API se puede cambiar con la variable `VITE_API_URL` (por defecto `http://localhost:8000/api`).

### Pruebas del backend

```bash
cd backend
python manage.py test
```

## Servicios REST

| Método y ruta | Descripción |
|---|---|
| `GET /api/categorias/` | Categorías con su cantidad de productos |
| `GET /api/productos/` | Productos. Filtros: `q`, `categoria`, `precio_min`, `precio_max`, `disponibles=1`, `en_oferta=1`, `orden` (`nombre`, `precio_asc`, `precio_desc`, `descuento`, `novedades`) |
| `GET /api/productos/{id}/` | Detalle de un producto |
| `GET /api/productos/{id}/recomendaciones/` | Productos recomendados para ese producto |
| `GET /api/productos/mas_vendidos/` | Los más vendidos (`limite`) |
| `GET /api/recomendaciones/?productos=1,2,3` | Recomendaciones para varios productos (carrito) |
| `GET /api/configuracion/` | Envío gratis desde, costo de envío y cupones vigentes |
| `POST /api/cupones/validar/` | Valida un cupón con el subtotal |
| `POST /api/pedidos/` | Crea un pedido y descuenta el stock |
| `POST /api/auth/login/` | Inicio de sesión de administradores (devuelve un token) |
| `GET /api/inventario/`, `/resumen/`, `/movimientos/` | Panel de inventario (solo administradores) |
| `POST /api/inventario/{id}/movimiento/` | Repone o ajusta el stock (solo administradores) |
| `GET /api/pedidos/` | Lista de pedidos (solo administradores) |

Las rutas de administradores piden el encabezado `Authorization: Token <token>`.

## Alcance

No incluye pasarela de pagos ni cuentas de clientes: el pedido queda registrado como pendiente y la librería lo atiende desde el administrador.
