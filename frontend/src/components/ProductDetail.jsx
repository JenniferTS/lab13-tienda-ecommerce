import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Precio from '@/components/Precio'
import { useCarrito } from '@/context/CarritoContext'
import { soles } from '@/lib/format'

// Ventana con el detalle del producto. `producto` es null cuando está cerrada.
function ProductDetail({ producto, onCerrar }) {
  const { agregar } = useCarrito()
  const [cantidad, setCantidad] = useState(1)
  const [productoAnterior, setProductoAnterior] = useState(producto)

  // Al abrir otro producto la cantidad vuelve a 1
  if (producto !== productoAnterior) {
    setProductoAnterior(producto)
    setCantidad(1)
  }

  const disponible = producto?.cantidad_disponible ?? 0

  return (
    <Dialog open={producto !== null} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {producto && (
          <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
            <img
              src={producto.imagen}
              alt={`Portada de ${producto.nombre}`}
              className="mx-auto aspect-[3/4] w-40 rounded-lg object-cover shadow-lg ring-1 ring-border sm:w-full"
            />
            <div className="space-y-4">
              <DialogHeader className="gap-1">
                <Badge variant="secondary" className="w-fit">{producto.categoria_nombre}</Badge>
                <DialogTitle className="font-heading text-2xl font-bold leading-tight">{producto.nombre}</DialogTitle>
                <DialogDescription className="italic">{producto.autor}</DialogDescription>
              </DialogHeader>
              <p className="text-sm leading-relaxed text-foreground/85">{producto.descripcion}</p>
              <div className="space-y-1">
                <Precio producto={producto} className="text-3xl" />
                {producto.en_oferta && (
                  <Badge className="bg-dorado text-foreground">
                    -{producto.descuento}% · ahorras {soles(producto.precio - producto.precio_final)}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {producto.cantidad_disponible === 0
                  ? 'Sin stock por el momento'
                  : `${producto.cantidad_disponible} unidades disponibles`}
              </p>
              {disponible > 0 && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center rounded-full border bg-card">
                    <button
                      type="button"
                      aria-label="Menos unidades"
                      disabled={cantidad <= 1}
                      onClick={() => setCantidad((c) => c - 1)}
                      className="flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{cantidad}</span>
                    <button
                      type="button"
                      aria-label="Más unidades"
                      disabled={cantidad >= disponible}
                      onClick={() => setCantidad((c) => c + 1)}
                      className="flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      agregar(producto, cantidad)
                      onCerrar()
                    }}
                  >
                    <ShoppingCart /> Agregar al carrito
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ProductDetail
