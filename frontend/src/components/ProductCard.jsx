import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { soles } from '@/lib/format'

// Recibe el producto completo; al hacer clic en la portada o en el título se abre su detalle
function ProductCard({ producto, onVer }) {
  const { nombre, autor, descripcion, precio, imagen, categoria_nombre: categoria, cantidad_disponible: cantidad, stock_bajo: pocasUnidades } = producto
  const agotado = cantidad === 0

  return (
    <Card className="group h-full gap-3 pt-0 rounded-2xl bg-card shadow-sm ring-border transition duration-300 hover:-translate-y-1 hover:shadow-xl">
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
        {agotado && (
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-foreground/85 py-2 text-center text-sm font-semibold tracking-[0.3em] text-background">
            AGOTADO
          </span>
        )}
      </button>
      <CardHeader className="gap-1">
        <Badge variant="secondary" className="mb-1 w-fit">{categoria}</Badge>
        <CardTitle className="font-heading text-lg font-bold leading-snug">
          <button type="button" onClick={() => onVer(producto)} className="text-left hover:text-primary">
            {nombre}
          </button>
        </CardTitle>
        {autor && <CardDescription className="italic">{autor}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-muted-foreground">{descripcion}</p>
      </CardContent>
      <CardFooter className="items-baseline justify-between border-t bg-transparent">
        <span className="font-heading text-xl font-bold text-primary">{soles(precio)}</span>
        {pocasUnidades ? (
          <Badge className="bg-dorado text-foreground">¡Últimas {cantidad}!</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">
            {agotado ? 'Sin stock' : `${cantidad} disponibles`}
          </span>
        )}
      </CardFooter>
    </Card>
  )
}

export default ProductCard
