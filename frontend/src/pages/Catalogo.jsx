import { useState } from 'react'

import CategoryFilter from '@/components/CategoryFilter'
import ProductList from '@/components/ProductList'
import { categoriasMock, productosMock } from '@/data/productosMock'

function Catalogo() {
  // El estado vive en la página: CategoryFilter lo cambia y ProductList lo usa para filtrar
  const [categoriaActiva, setCategoriaActiva] = useState(null)

  const productosVisibles = categoriaActiva === null
    ? productosMock
    : productosMock.filter((producto) => producto.categoria === categoriaActiva)

  return (
    <section id="catalogo" className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <h2 className="text-2xl font-bold">Catálogo</h2>
      <CategoryFilter
        categorias={categoriasMock}
        categoriaActiva={categoriaActiva}
        onSeleccionar={setCategoriaActiva}
      />
      <ProductList productos={productosVisibles} />
    </section>
  )
}

export default Catalogo
