import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Datos del cliente para confirmar el pedido
function FormularioPedido({ datos, onCambio, onSubmit, onVolver, enviando, error, total }) {
  const campo = (nombre) => ({
    id: nombre,
    value: datos[nombre],
    onChange: (e) => onCambio({ [nombre]: e.target.value }),
  })

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
        <div className="space-y-1.5">
          <Label htmlFor="cliente_nombre">Nombre completo</Label>
          <Input {...campo('cliente_nombre')} autoComplete="name" required maxLength={100} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cliente_email">Correo electrónico</Label>
          <Input {...campo('cliente_email')} type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefono">Celular</Label>
          <Input {...campo('telefono')} type="tel" inputMode="numeric" pattern="[0-9]{9}" title="9 dígitos" autoComplete="tel" placeholder="987654321" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="direccion">Dirección de entrega</Label>
          <Input {...campo('direccion')} autoComplete="street-address" placeholder="Calle, número y distrito" required maxLength={200} />
        </div>
        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      </div>
      <div className="space-y-2 border-t bg-card p-4">
        <Button type="submit" size="lg" className="w-full" disabled={enviando}>
          {enviando ? 'Enviando pedido...' : `Confirmar pedido · ${total}`}
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={onVolver} disabled={enviando}>
          Volver al carrito
        </Button>
      </div>
    </form>
  )
}

export default FormularioPedido
