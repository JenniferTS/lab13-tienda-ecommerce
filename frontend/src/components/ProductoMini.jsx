import { Plus } from 'lucide-react'

import Precio from '@/components/Precio'
import { useCarrito } from '@/context/CarritoContext'

// Versión compacta de un producto para las listas de recomendaciones
function ProductoMini({ producto, onVer }) {
  const { agregar } = useCarrito()

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-2.5">
      <button
        type="button"
        onClick={() => onVer?.(producto)}
        aria-label={`Ver detalle de ${producto.nombre}`}
        className="shrink-0"
      >
        <img src={producto.imagen} alt="" className="h-20 w-[3.75rem] rounded object-cover ring-1 ring-border" />
      </button>
      <div className="min-w-0 flex-1 space-y-0.5">
        <button
          type="button"
          onClick={() => onVer?.(producto)}
          className="line-clamp-2 text-left font-heading text-sm font-bold leading-snug hover:text-primary"
        >
          {producto.nombre}
        </button>
        {producto.motivo && <p className="line-clamp-1 text-xs text-muted-foreground">{producto.motivo}</p>}
        <Precio producto={producto} className="text-sm" />
      </div>
      <button
        type="button"
        onClick={() => agregar(producto)}
        aria-label={`Agregar ${producto.nombre} al carrito`}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/85"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

export default ProductoMini
