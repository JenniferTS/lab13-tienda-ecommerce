import { useEffect, useState } from 'react'

import ProductCard from '@/components/ProductCard'
import { useCarrito } from '@/context/CarritoContext'
import { obtenerMasVendidos } from '@/services/api'

// Los productos que más compran los clientes, ordenados por unidades vendidas
function MasVendidos({ onVer }) {
  const [productos, setProductos] = useState([])
  const { version } = useCarrito()

  useEffect(() => {
    obtenerMasVendidos(4).then(setProductos).catch(() => setProductos([]))
  }, [version])

  if (productos.length === 0) return null

  return (
    <section id="mas-vendidos" className="mx-auto max-w-6xl space-y-5 px-4 py-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">Lo que más se lleva</p>
        <h2 className="text-3xl font-extrabold text-primary">Los más vendidos</h2>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
        {productos.map((producto, i) => (
          <div key={producto.id} className="flex w-44 shrink-0 snap-start flex-col gap-2 sm:w-56 md:w-auto">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-7 items-center justify-center rounded-full bg-dorado font-heading text-base font-bold text-foreground">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{producto.motivo}</span>
            </p>
            <div className="flex-1">
              <ProductCard producto={producto} onVer={onVer} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MasVendidos
