import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const ESTADOS = {
  normal: { texto: 'Normal', clase: 'bg-emerald-100 text-emerald-800' },
  bajo: { texto: 'Stock bajo', clase: 'bg-dorado text-foreground' },
  agotado: { texto: 'Agotado', clase: 'bg-destructive text-white' },
}

// Una fila del panel: muestra el stock y permite reponer o descontar unidades
function FilaInventario({ producto, onMovimiento, ocupado }) {
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('')
  const estado = ESTADOS[producto.estado_stock]

  const reponer = (unidades) => onMovimiento(producto.id, { tipo: 'entrada', cantidad: unidades })
  const ajustar = () => {
    // Un ajuste descuenta unidades (merma, daño, pérdida) y siempre lleva un motivo
    onMovimiento(producto.id, { tipo: 'ajuste', cantidad: -Math.abs(Number(cantidad)), motivo })
      .then(() => {
        setCantidad('')
        setMotivo('')
      })
      .catch(() => {})
  }

  return (
    <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm lg:grid-cols-[2.2fr_0.8fr_0.8fr_auto] lg:items-center">
      <div className="flex items-center gap-3">
        <img src={producto.imagen} alt="" className="h-16 w-12 rounded object-cover ring-1 ring-border" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{producto.nombre}</p>
          <p className="text-xs text-muted-foreground">{producto.categoria_nombre}</p>
        </div>
      </div>

      {/* En el celular el stock y el estado van uno al lado del otro; en pantallas grandes son columnas */}
      <div className="grid grid-cols-2 items-center gap-3 lg:contents">
        <div>
          <p className="text-xs text-muted-foreground">Stock</p>
          <p className="font-heading text-2xl font-bold">{producto.cantidad_disponible}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Mínimo: {producto.stock_minimo}</p>
          <Badge className={estado.clase}>{estado.texto}</Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[5, 10].map((n) => (
          <Button key={n} size="sm" variant="outline" disabled={ocupado} onClick={() => reponer(n).catch(() => {})}>
            +{n}
          </Button>
        ))}
        <Input
          type="number"
          min="1"
          max={producto.cantidad_disponible}
          placeholder="Merma"
          aria-label={`Unidades a descontar de ${producto.nombre}`}
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          className="h-8 w-24"
        />
        <Input
          placeholder="Motivo"
          aria-label={`Motivo del descuento de ${producto.nombre}`}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="h-8 w-28"
        />
        <Button size="sm" variant="secondary" disabled={ocupado || !cantidad || !motivo.trim()} onClick={ajustar}>
          Descontar
        </Button>
      </div>
    </div>
  )
}

export default FilaInventario
