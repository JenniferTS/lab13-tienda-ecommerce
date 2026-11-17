import { ShoppingCart } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Precio from '@/components/Precio'
import { Button } from '@/components/ui/button'
import { useCarrito } from '@/context/CarritoContext'

// Recibe el producto completo; al hacer clic en la portada o en el título se abre su detalle
function ProductCard({ producto, onVer }) {
  const { agregar } = useCarrito()
  const { nombre, autor, descripcion, imagen, categoria_nombre: categoria, cantidad_disponible: cantidad, stock_bajo: pocasUnidades } = producto
  const agotado = cantidad === 0

  return (
    <Card className="group h-full gap-2 pt-0 sm:gap-3 rounded-2xl bg-card shadow-sm ring-border transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <button
        type="button"
        onClick={() => onVer(producto)}
        aria-label={`Ver detalle de ${nombre}`}
        className="relative block overflow-hidden text-left"
      >
        <img
          src={imagen}
          alt={`Portada de ${nombre}`}
          className={`aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105 ${agotado ? 'grayscale' : ''}`}
        />
        {producto.en_oferta && (
          <span className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-primary text-xs font-bold sm:size-12 sm:text-sm text-primary-foreground shadow-lg ring-2 ring-dorado">
            -{producto.descuento}%
          </span>
        )}
        {agotado && (
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-foreground/85 py-2 text-center text-sm font-semibold tracking-[0.3em] text-background">
            AGOTADO
          </span>
        )}
      </button>
      <CardHeader className="flex-1 gap-1 px-3 sm:flex-none sm:px-4">
        <Badge variant="secondary" className="mb-1 w-fit">{categoria}</Badge>
        <CardTitle className="font-heading text-base font-bold leading-snug sm:text-lg">
          <button type="button" onClick={() => onVer(producto)} className="text-left hover:text-primary">
            {nombre}
          </button>
        </CardTitle>
        {autor && <CardDescription className="italic">{autor}</CardDescription>}
      </CardHeader>
      <CardContent className="hidden flex-1 sm:block">
        <p className="line-clamp-3 text-sm text-muted-foreground">{descripcion}</p>
      </CardContent>
      <CardFooter className="flex-wrap items-baseline justify-between gap-x-2 border-t bg-transparent px-3 sm:px-4">
        <Precio producto={producto} />
        {pocasUnidades ? (
          <Badge className="bg-dorado text-foreground">¡Últimas {cantidad}!</Badge>
        ) : (
          <span className={`text-xs text-muted-foreground ${agotado ? '' : 'hidden sm:inline'}`}>
            {agotado ? 'Sin stock' : `${cantidad} disponibles`}
          </span>
        )}
      </CardFooter>
      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <Button className="w-full" disabled={agotado} onClick={() => agregar(producto)}>
          <ShoppingCart />
          {agotado ? 'Sin stock' : (
            <>
              <span className="sm:hidden">Agregar</span>
              <span className="hidden sm:inline">Agregar al carrito</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

export default ProductCard
