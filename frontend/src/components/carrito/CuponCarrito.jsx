import { Tag, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { validarCupon } from '@/services/api'

// Campo para escribir un cupón. El código lo valida el servidor con el subtotal del carrito.
function CuponCarrito({ subtotal, cupon, onAplicar, onQuitar, error, onError }) {
  const [codigo, setCodigo] = useState('')
  const [validando, setValidando] = useState(false)

  const aplicar = async (e) => {
    e.preventDefault()
    if (!codigo.trim()) return
    setValidando(true)
    onError(null)
    try {
      onAplicar(await validarCupon(codigo.trim(), subtotal.toFixed(2)))
      setCodigo('')
    } catch (err) {
      onError(err.message)
    } finally {
      setValidando(false)
    }
  }

  if (cupon) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-dashed border-dorado bg-accent/50 px-3 py-2 text-sm">
        <span className="flex items-center gap-2">
          <Tag className="size-4 text-primary" />
          Cupón <b className="tracking-wider">{cupon.codigo}</b> (-{cupon.porcentaje}%)
        </span>
        <button type="button" onClick={onQuitar} aria-label="Quitar cupón" className="rounded-full p-1 hover:bg-muted">
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={aplicar} className="space-y-1.5">
      <div className="flex gap-2">
        <Input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="¿Tienes un cupón?"
          aria-label="Código de cupón"
          className="h-9 uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal"
        />
        <Button type="submit" variant="secondary" disabled={validando || !codigo.trim()}>
          Aplicar
        </Button>
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </form>
  )
}

export default CuponCarrito
