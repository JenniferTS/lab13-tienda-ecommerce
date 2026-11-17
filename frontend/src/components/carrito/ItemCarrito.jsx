import { Minus, Plus, Trash2 } from 'lucide-react'

import { useCarrito } from '@/context/CarritoContext'
import { soles } from '@/lib/format'

function ItemCarrito({ item }) {
  const { cambiarCantidad, quitar } = useCarrito()
  const { producto, cantidad } = item
  const alMaximo = cantidad >= producto.cantidad_disponible

  return (
    <li className="flex gap-3 py-4">
      <img src={producto.imagen} alt="" className="h-24 w-[4.5rem] shrink-0 rounded-md object-cover ring-1 ring-border" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-heading font-bold leading-snug">{producto.nombre}</p>
        <p className="text-sm">
          <span className="font-semibold text-primary">{soles(producto.precio_final)}</span>
          {producto.en_oferta && (
            <span className="ml-2 text-xs text-muted-foreground line-through">{soles(producto.precio)}</span>
          )}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center rounded-full border bg-card">
            <button
              type="button"
              aria-label={`Quitar una unidad de ${producto.nombre}`}
              disabled={cantidad <= 1}
              onClick={() => cambiarCantidad(producto.id, cantidad - 1)}
              className="flex size-8 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-7 text-center text-sm font-semibold" aria-live="polite">{cantidad}</span>
            <button
              type="button"
              aria-label={`Agregar una unidad de ${producto.nombre}`}
              disabled={alMaximo}
              onClick={() => cambiarCantidad(producto.id, cantidad + 1)}
              className="flex size-8 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => quitar(producto.id)}
            aria-label={`Quitar ${producto.nombre} del carrito`}
            className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        {alMaximo && <p className="text-xs text-amber-700">Es el máximo disponible ({producto.cantidad_disponible})</p>}
      </div>
    </li>
  )
}

export default ItemCarrito
