import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

// Recibe por props los datos del producto (nombre, descripción, precio, imagen y categoría)
function ProductCard({ nombre, autor, descripcion, precio, imagen, categoria, cantidad }) {
  const agotado = cantidad === 0
  const pocasUnidades = cantidad > 0 && cantidad <= 3

  return (
    <Card className="group h-full gap-3 pt-0 rounded-2xl bg-card shadow-sm ring-border transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden">
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
      </div>
      <CardHeader className="gap-1">
        <Badge variant="secondary" className="mb-1 w-fit">{categoria}</Badge>
        <CardTitle className="font-heading text-lg font-bold leading-snug">{nombre}</CardTitle>
        {autor && <CardDescription className="italic">{autor}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-muted-foreground">{descripcion}</p>
      </CardContent>
      <CardFooter className="items-baseline justify-between border-t bg-transparent">
        <span className="font-heading text-xl font-bold text-primary">S/ {Number(precio).toFixed(2)}</span>
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
