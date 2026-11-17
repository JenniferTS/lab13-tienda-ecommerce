import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { soles } from '@/lib/format'

// Ventana con el detalle del producto. `producto` es null cuando está cerrada.
function ProductDetail({ producto, onCerrar }) {
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
              <p className="font-heading text-3xl font-bold text-primary">{soles(producto.precio)}</p>
              <p className="text-sm text-muted-foreground">
                {producto.cantidad_disponible === 0
                  ? 'Sin stock por el momento'
                  : `${producto.cantidad_disponible} unidades disponibles`}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ProductDetail
