# Ejercicio 01. Análisis del negocio y planificación

## Negocio

- **Rubro:** librería.
- **Nombre comercial:** Librería Misti (el nombre viene del volcán Misti de Arequipa).
- **Productos:** novelas y poesía peruana y latinoamericana, cuentos infantiles, libros académicos y útiles escolares y de escritorio.

## Funcionalidades de la primera versión

- Ver el catálogo de productos en tarjetas.
- Filtrar los productos por categoría.
- Ver el precio y la cantidad disponible de cada producto (con aviso cuando está agotado).
- Administrar categorías y productos desde el panel de administración de Django.
- Consultar los datos por servicios REST (`/api/categorias/` y `/api/productos/`).

## Información de cada producto

| Campo | Tipo | Descripción |
|---|---|---|
| nombre | texto | Título del libro o nombre del útil |
| autor | texto | Autor (opcional) |
| descripcion | texto largo | Reseña corta |
| precio | decimal | Precio en soles |
| imagen | imagen | Portada |
| cantidad_disponible | entero | Unidades en stock |
| categoria | relación | Categoría a la que pertenece (1 categoría → N productos) |

## Elementos de la interfaz

Encabezado (`Header`), filtro de categorías (`CategoryFilter`), lista de productos (`ProductList`) y tarjeta de producto (`ProductCard`). Ver `boceto-interfaz.png`.

## Comunicación entre las capas

React pide los datos con `fetch` a la API de Django REST Framework, que los lee de la base de datos con el ORM y los devuelve en JSON. Ver `esquema-arquitectura.png`.
