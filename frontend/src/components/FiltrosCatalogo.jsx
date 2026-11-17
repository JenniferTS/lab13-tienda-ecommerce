import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

const ORDENES = [
  { valor: 'nombre', texto: 'Nombre (A-Z)' },
  { valor: 'precio_asc', texto: 'Precio: menor a mayor' },
  { valor: 'precio_desc', texto: 'Precio: mayor a menor' },
  { valor: 'descuento', texto: 'Mayor descuento' },
  { valor: 'novedades', texto: 'Más recientes' },
]

// Orden, rango de precios y «solo disponibles». En pantallas chicas el panel se pliega.
function FiltrosCatalogo({ filtros, onCambio, onLimpiar, hayFiltros }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="rounded-full bg-card md:hidden"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
      >
        <SlidersHorizontal /> Filtros y orden
      </Button>

      <div
        className={`${abierto ? 'grid' : 'hidden'} items-end gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-2 md:grid md:grid-cols-[1.2fr_1fr_auto_auto_auto]`}
      >
        <label className="block space-y-1.5">
          <span className="block text-sm font-medium">Ordenar por</span>
          <select
            value={filtros.orden}
            onChange={(e) => onCambio({ orden: e.target.value })}
            className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {ORDENES.map((o) => (
              <option key={o.valor} value={o.valor}>{o.texto}</option>
            ))}
          </select>
        </label>

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium">Precio (S/)</legend>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="Mín."
              aria-label="Precio mínimo"
              value={filtros.precio_min}
              onChange={(e) => onCambio({ precio_min: e.target.value })}
              className="h-9"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="Máx."
              aria-label="Precio máximo"
              value={filtros.precio_max}
              onChange={(e) => onCambio({ precio_max: e.target.value })}
              className="h-9"
            />
          </div>
        </fieldset>

        <label className="flex items-center gap-2 pb-1.5 text-sm font-medium">
          <Switch checked={filtros.disponibles} onCheckedChange={(v) => onCambio({ disponibles: v })} />
          Solo disponibles
        </label>

        <label className="flex items-center gap-2 pb-1.5 text-sm font-medium">
          <Switch checked={filtros.en_oferta} onCheckedChange={(v) => onCambio({ en_oferta: v })} />
          Solo ofertas
        </label>

        <Button variant="ghost" className="text-primary" onClick={onLimpiar} disabled={!hayFiltros}>
          Limpiar filtros
        </Button>
      </div>
    </div>
  )
}

export default FiltrosCatalogo
