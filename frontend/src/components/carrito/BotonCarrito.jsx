import { ShoppingBag } from 'lucide-react'

import { useCarrito } from '@/context/CarritoContext'

// Botón del encabezado: muestra cuántas unidades hay en el carrito
function BotonCarrito() {
  const { cantidadTotal, setAbierto } = useCarrito()

  return (
    <button
      type="button"
      onClick={() => setAbierto(true)}
      aria-label={`Abrir el carrito, ${cantidadTotal} productos`}
      className="relative flex size-10 items-center justify-center rounded-full border border-border bg-card text-primary transition hover:border-dorado hover:bg-accent"
    >
      <ShoppingBag className="size-5" />
      {cantidadTotal > 0 && (
        <span
          key={cantidadTotal}
          className="absolute -right-1 -top-1 flex size-5 animate-bounce items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground [animation-iteration-count:2]"
        >
          {cantidadTotal}
        </span>
      )}
    </button>
  )
}

export default BotonCarrito
