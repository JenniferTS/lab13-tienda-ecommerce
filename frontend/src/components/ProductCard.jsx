import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

// Recibe por props los datos del producto (nombre, descripción, precio, imagen y categoría)
function ProductCard({ nombre, autor, descripcion, precio, imagen, categoria, cantidad }) {
  return (
    <Card className="h-full">
      <img src={imagen} alt={`Portada de ${nombre}`} className="aspect-[3/4] w-full object-cover" />
      <CardHeader>
        <Badge variant="secondary" className="w-fit">{categoria}</Badge>
        <CardTitle className="text-base">{nombre}</CardTitle>
        {autor && <CardDescription>{autor}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-muted-foreground">{descripcion}</p>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-lg font-bold">S/ {Number(precio).toFixed(2)}</span>
        <span className="text-xs text-muted-foreground">
          {cantidad > 0 ? `${cantidad} disponibles` : 'Agotado'}
        </span>
      </CardFooter>
    </Card>
  )
}

export default ProductCard
