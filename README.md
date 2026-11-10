# Librería Misti

Estructura inicial de una tienda virtual de libros y útiles (Laboratorio 13 de Desarrollo de Aplicaciones Empresariales).
Frontend con **React + Vite + Tailwind CSS + shadcn/ui** y backend con **Django + Django REST Framework**.

```
libreria-misti/
├── backend/    API REST (Django): modelos Categoria y Producto, admin, serializadores
├── frontend/   Aplicación React: components, pages y services
└── docs/       Análisis del negocio, esquema de arquitectura y boceto de la interfaz
```

## Cómo ejecutarlo

### Backend (puerto 8000)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # en Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py cargar_datos   # categorías y productos de ejemplo (con sus portadas)
python manage.py createsuperuser
python manage.py runserver
```

Servicios REST: `http://localhost:8000/api/categorias/` y `http://localhost:8000/api/productos/` (acepta `?categoria=<id>`).
Administrador: `http://localhost:8000/admin/`.

### Frontend (puerto 5173)

```bash
cd frontend
npm install
npm run dev
```

La dirección de la API se puede cambiar con la variable `VITE_API_URL` (por defecto `http://localhost:8000/api`).

## Alcance

Solo la estructura inicial: catálogo, categorías y comunicación React ↔ Django. No incluye carrito, pedidos, autenticación de clientes ni pagos.
