import { LogOut } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import Cargando from '@/components/Cargando'
import FilaInventario from '@/components/inventario/FilaInventario'
import LoginAdmin from '@/components/inventario/LoginAdmin'
import ResumenInventario from '@/components/inventario/ResumenInventario'
import { Button } from '@/components/ui/button'
import { soles } from '@/lib/format'
import {
  obtenerInventario, obtenerMovimientos, obtenerPedidos, obtenerResumenInventario, registrarMovimiento,
} from '@/services/api'

const FILTROS = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'bajo', texto: 'Stock bajo' },
  { valor: 'agotado', texto: 'Agotados' },
]

const formatoFecha = new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' })

// Panel para el personal de la librería. El token se guarda solo mientras dure la pestaña.
function Inventario() {
  const [sesion, setSesion] = useState(() => JSON.parse(sessionStorage.getItem('misti-admin') ?? 'null'))
  const [datos, setDatos] = useState(null)
  const [filtro, setFiltro] = useState('todos')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  const salir = useCallback(() => {
    sessionStorage.removeItem('misti-admin')
    setSesion(null)
    setDatos(null)
  }, [])

  const cargar = useCallback(async () => {
    if (!sesion) return
    try {
      const [productos, resumen, movimientos, pedidos] = await Promise.all([
        obtenerInventario(sesion.token),
        obtenerResumenInventario(sesion.token),
        obtenerMovimientos(sesion.token),
        obtenerPedidos(sesion.token),
      ])
      setDatos({ productos, resumen, movimientos, pedidos })
      setError(null)
    } catch (e) {
      // Token vencido o inválido: se vuelve a pedir el ingreso
      if (e.estado === 401 || e.estado === 403) salir()
      else setError(e.message)
    }
  }, [sesion, salir])

  useEffect(() => {
    cargar()
  }, [cargar])

  const entrar = (token, usuario) => {
    const nueva = { token, usuario }
    sessionStorage.setItem('misti-admin', JSON.stringify(nueva))
    setSesion(nueva)
  }

  const movimiento = async (productoId, datosMovimiento) => {
    setOcupado(true)
    setError(null)
    try {
      await registrarMovimiento(sesion.token, productoId, datosMovimiento)
      await cargar()
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setOcupado(false)
    }
  }

  const productos = datos?.productos.filter((p) => filtro === 'todos' || p.estado_stock === filtro) ?? []

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-primary">Inventario</h1>
          <p className="text-muted-foreground">
            {sesion ? `Sesión de ${sesion.usuario}` : 'Solo para el personal de la librería'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full bg-card" render={<a href="#inicio" />} nativeButton={false}>
            Volver a la tienda
          </Button>
          {sesion && (
            <Button variant="ghost" onClick={salir}>
              <LogOut /> Salir
            </Button>
          )}
        </div>
      </div>

      {!sesion && <LoginAdmin onEntrar={entrar} />}

      {sesion && !datos && !error && <Cargando />}

      {error && (
        <p role="alert" className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          {error}
        </p>
      )}

      {sesion && datos && (
        <>
          <ResumenInventario resumen={datos.resumen} />

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado">
              {FILTROS.map((f) => (
                <Button
                  key={f.valor}
                  variant={filtro === f.valor ? 'default' : 'outline'}
                  className="rounded-full"
                  onClick={() => setFiltro(f.valor)}
                >
                  {f.texto}
                </Button>
              ))}
            </div>
            {productos.map((producto) => (
              <FilaInventario key={producto.id} producto={producto} onMovimiento={movimiento} ocupado={ocupado} />
            ))}
            {productos.length === 0 && <p className="py-6 text-center text-muted-foreground">No hay productos en este estado.</p>}
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-primary">Pedidos recientes</h2>
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="p-3">N.º</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Productos</th>
                    <th className="p-3">Cupón</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.pedidos.slice(0, 10).map((pedido) => (
                    <tr key={pedido.id} className="border-t">
                      <td className="p-3 font-semibold">{String(pedido.id).padStart(4, '0')}</td>
                      <td className="p-3 whitespace-nowrap">{formatoFecha.format(new Date(pedido.fecha))}</td>
                      <td className="p-3">{pedido.cliente_nombre}</td>
                      <td className="p-3 text-muted-foreground">
                        {pedido.items.map((i) => `${i.cantidad} × ${i.producto_nombre}`).join(', ')}
                      </td>
                      <td className="p-3">{pedido.cupon_codigo || '—'}</td>
                      <td className="p-3 text-right font-semibold">{soles(pedido.total)}</td>
                    </tr>
                  ))}
                  {datos.pedidos.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Todavía no hay pedidos.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-primary">Últimos movimientos</h2>
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Producto</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3 text-right">Cantidad</th>
                    <th className="p-3 text-right">Stock final</th>
                    <th className="p-3">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.movimientos.map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="p-3 whitespace-nowrap">{formatoFecha.format(new Date(m.fecha))}</td>
                      <td className="p-3 font-medium">{m.producto_nombre}</td>
                      <td className="p-3">{m.tipo_texto}</td>
                      <td className={`p-3 text-right font-semibold ${m.cantidad > 0 ? 'text-emerald-700' : 'text-destructive'}`}>
                        {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                      </td>
                      <td className="p-3 text-right">{m.stock_resultante}</td>
                      <td className="p-3 text-muted-foreground">{m.motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default Inventario
