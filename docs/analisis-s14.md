# Laboratorio 14. Aplicación de comercio electrónico: objetivos, público y características

Se parte de la tienda del laboratorio 13 (catálogo, categorías y comunicación React ↔ Django) y se le agregan las funciones de una tienda en línea completa.

## Objetivos de la aplicación

1. **Vender en línea** los libros y útiles de Librería Misti, además de la venta en el local.
2. **Que encontrar un producto sea rápido**: búsqueda por título o autor, filtros por categoría y precio, y orden de la lista.
3. **Llevar el control del inventario** sin planillas aparte: el stock baja solo con cada venta y se avisa cuando queda poco.
4. **Aumentar las ventas** con promociones, descuentos, cupones y envío gratis desde un monto.
5. **Recomendar productos** parecidos o que otros clientes compraron juntos, para que cada cliente vea más de lo que le interesa.
6. **Funcionar bien en el celular**, porque la mayoría de las visitas llegan desde el teléfono.

## Público objetivo

| Segmento | Qué busca | Cómo lo atiende la tienda |
|---|---|---|
| Estudiantes universitarios y de colegio (15 a 25 años) | Textos de estudio, cuadernos y útiles al mejor precio | Filtro por categoría Académicos y Útiles, ofertas y cupones |
| Lectores de novela y poesía (20 a 50 años) | Autores peruanos y latinoamericanos | Búsqueda por autor y recomendaciones por autor o categoría |
| Padres y docentes | Cuentos infantiles y material escolar | Categoría Infantil, compras de varios productos con envío gratis |
| Personal administrativo de la librería | Saber qué se está vendiendo y qué hay que reponer | Panel de inventario con alertas de stock bajo y registro de movimientos |

## Características clave

| # | Característica | Cómo se implementa |
|---|---|---|
| 1 | Diseño responsivo | Tailwind CSS con diseño primero para celular (rejilla de 1 a 4 columnas, menú y filtros plegables, carrito en panel lateral) |
| 2 | Visualización de productos | Tarjetas con portada, precio y stock, y una ventana con el detalle de cada producto |
| 3 | Búsqueda y filtros | Parámetros `q`, `categoria`, `precio_min`, `precio_max`, `en_oferta`, `disponibles` y `orden` en `/api/productos/` |
| 4 | Gestión de inventario | Stock mínimo por producto, movimientos (entradas, salidas y ajustes) y panel solo para administradores |
| 5 | Marketing | Descuento por producto con precio tachado, sección de ofertas, cupones de descuento y envío gratis desde S/ 100 |
| 6 | Carrito y pedidos | Carrito guardado en el navegador y pedidos que descuentan el stock de forma segura |
| 7 | Recomendaciones | Productos de la misma categoría y autor, comprados juntos y más vendidos |

## Arquitectura

```
React (Vite, Tailwind, shadcn/ui)  ──fetch/JSON──▶  Django REST Framework  ──ORM──▶  SQLite
 Header · Catálogo · Carrito · Inventario            productos · pedidos · cupones       Categoria · Producto
 Ofertas · Recomendaciones                           inventario · recomendaciones        Cupon · Pedido · PedidoItem
                                                                                         MovimientoInventario
```

## Plan de trabajo (un commit y una etiqueta por ejercicio)

| Etiqueta | Contenido |
|---|---|
| `s14-ejercicio01` | Objetivos, público objetivo y características clave |
| `s14-ejercicio02` | Búsqueda, filtros, orden y detalle del producto |
| `s14-ejercicio03` | Gestión de inventario |
| `s14-ejercicio04` | Promociones, descuentos y cupones |
| `s14-ejercicio05` | Carrito de compras y pedidos |
| `s14-ejercicio06` | Sistema de recomendación |
| `s14-ejercicio07` | Diseño responsivo, móvil y retoques finales |
