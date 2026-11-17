import { Gift, Truck } from 'lucide-react'

import { soles } from '@/lib/format'

// Franja superior con las promociones vigentes de la tienda
function BarraPromos({ configuracion }) {
  if (!configuracion) return null
  const cupon = configuracion.cupones[0]

  return (
    <div className="bg-dorado text-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-1.5 text-xs font-semibold sm:text-sm">
        <span className="flex items-center gap-1.5">
          <Truck className="size-4" /> Envío gratis desde {soles(configuracion.envio_gratis_desde)}
        </span>
        {cupon && (
          <span className="flex items-center gap-1.5">
            <Gift className="size-4" /> Usa el cupón <b className="tracking-wider">{cupon.codigo}</b> y ahorra {cupon.porcentaje}%
          </span>
        )}
      </div>
    </div>
  )
}

export default BarraPromos
