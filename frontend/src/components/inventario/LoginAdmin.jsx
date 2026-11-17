import { Lock } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { iniciarSesion } from '@/services/api'

// Formulario de ingreso para administradores. Usa las mismas cuentas del administrador de Django.
function LoginAdmin({ onEntrar }) {
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const { token, usuario: nombre } = await iniciarSesion(usuario, clave)
      onEntrar(token, nombre)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="mx-auto max-w-sm space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="space-y-1 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="size-5" />
        </span>
        <h2 className="font-heading text-2xl font-bold text-primary">Panel de inventario</h2>
        <p className="text-sm text-muted-foreground">Ingresa con tu cuenta de administrador.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="usuario">Usuario</Label>
        <Input id="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="clave">Contraseña</Label>
        <Input id="clave" type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="current-password" required />
      </div>
      {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={enviando}>
        {enviando ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </form>
  )
}

export default LoginAdmin
