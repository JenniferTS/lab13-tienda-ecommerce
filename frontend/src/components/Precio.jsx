import { soles } from '@/lib/format'

// Precio de un producto: si está en oferta muestra el precio normal tachado y el porcentaje
function Precio({ producto, className = 'text-xl' }) {
  if (!producto.en_oferta) {
    return <span className={`font-heading font-bold text-primary ${className}`}>{soles(producto.precio)}</span>
  }
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-heading font-bold text-primary ${className}`}>{soles(producto.precio_final)}</span>
      <span className="text-sm text-muted-foreground line-through">{soles(producto.precio)}</span>
    </span>
  )
}

export default Precio
