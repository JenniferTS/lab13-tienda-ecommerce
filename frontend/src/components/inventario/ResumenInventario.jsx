import { AlertTriangle, Boxes, PackageX, Wallet } from 'lucide-react'

import { soles } from '@/lib/format'

// Cuatro tarjetas con los números principales del inventario
function ResumenInventario({ resumen }) {
  const tarjetas = [
    { titulo: 'Unidades en stock', valor: resumen.unidades, detalle: `${resumen.productos} productos`, icono: Boxes, color: 'text-primary bg-primary/10' },
    { titulo: 'Valor del inventario', valor: soles(resumen.valor_inventario), detalle: 'a precio de venta', icono: Wallet, color: 'text-emerald-700 bg-emerald-100' },
    { titulo: 'Stock bajo', valor: resumen.stock_bajo, detalle: 'por reponer pronto', icono: AlertTriangle, color: 'text-amber-700 bg-amber-100' },
    { titulo: 'Agotados', valor: resumen.agotados, detalle: 'sin unidades', icono: PackageX, color: 'text-destructive bg-destructive/10' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tarjetas.map(({ titulo, valor, detalle, icono: Icono, color }) => (
        <div key={titulo} className="rounded-2xl border bg-card p-4 shadow-sm">
          <span className={`mb-3 flex size-9 items-center justify-center rounded-full ${color}`}>
            <Icono className="size-4" />
          </span>
          <p className="font-heading text-2xl font-bold leading-none">{valor}</p>
          <p className="mt-1 text-sm font-medium">{titulo}</p>
          <p className="text-xs text-muted-foreground">{detalle}</p>
        </div>
      ))}
    </div>
  )
}

export default ResumenInventario
