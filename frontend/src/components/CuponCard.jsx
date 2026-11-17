import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { soles } from '@/lib/format'

// Cupón con borde punteado y botón para copiar el código
function CuponCard({ cupon }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = () => {
    navigator.clipboard?.writeText(cupon.codigo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-dorado bg-card p-4">
      <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl bg-vino text-primary-foreground">
        <span className="font-heading text-2xl font-extrabold leading-none">{cupon.porcentaje}%</span>
        <span className="text-[10px] uppercase tracking-wider text-dorado">dscto.</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-lg font-bold tracking-widest text-primary">{cupon.codigo}</p>
        <p className="text-xs text-muted-foreground">
          {Number(cupon.compra_minima) > 0 ? `Compras desde ${soles(cupon.compra_minima)}` : 'Sin compra mínima'}
          {cupon.vence && ` · hasta el ${new Date(`${cupon.vence}T00:00`).toLocaleDateString('es-PE')}`}
        </p>
      </div>
      <button
        type="button"
        onClick={copiar}
        className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition hover:bg-accent"
      >
        {copiado ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copiado ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}

export default CuponCard
