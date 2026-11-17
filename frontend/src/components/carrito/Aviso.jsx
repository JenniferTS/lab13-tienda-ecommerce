import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { useCarrito } from '@/context/CarritoContext'

// Mensaje breve que aparece abajo cuando se agrega un producto al carrito
function Aviso() {
  const { aviso } = useCarrito()
  if (!aviso) return null
  const Icono = aviso.tipo === 'error' ? AlertCircle : CheckCircle2

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-sm animate-in items-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm text-background shadow-xl fade-in slide-in-from-bottom-4"
    >
      <Icono className={`size-4 shrink-0 ${aviso.tipo === 'error' ? 'text-dorado' : 'text-emerald-400'}`} />
      <span className="truncate">{aviso.texto}</span>
    </div>
  )
}

export default Aviso
