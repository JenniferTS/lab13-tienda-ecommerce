import { CheckCircle2, ShoppingBag, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'

import CuponCarrito from '@/components/carrito/CuponCarrito'
import FormularioPedido from '@/components/carrito/FormularioPedido'
import ItemCarrito from '@/components/carrito/ItemCarrito'
import Recomendaciones from '@/components/Recomendaciones'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useCarrito } from '@/context/CarritoContext'
import { soles } from '@/lib/format'
import { crearPedido, obtenerProductos, validarCupon } from '@/services/api'

const DATOS_INICIALES = { cliente_nombre: '', cliente_email: '', telefono: '', direccion: '' }

// Panel lateral con tres pasos: carrito -> datos del cliente -> pedido confirmado
function CarritoSheet({ configuracion }) {
  const { items, subtotal, ahorroPorOfertas, cantidadTotal, abierto, setAbierto, vaciar, sincronizar, pedidoConfirmado } = useCarrito()
  const [paso, setPaso] = useState('carrito')
  const [cupon, setCupon] = useState(null)
  const [errorCupon, setErrorCupon] = useState(null)
  const [datos, setDatos] = useState(DATOS_INICIALES)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [pedido, setPedido] = useState(null)

  const envioGratisDesde = Number(configuracion?.envio_gratis_desde ?? 100)
  const costoEnvioBase = Number(configuracion?.costo_envio ?? 8)
  const descuentoCupon = cupon ? Number(cupon.descuento) : 0
  const baseEnvio = subtotal - descuentoCupon
  const envio = items.length === 0 || baseEnvio >= envioGratisDesde ? 0 : costoEnvioBase
  const total = baseEnvio + envio

  // Al abrir el carrito se actualizan precios y stock, por si cambiaron desde que se agregaron
  useEffect(() => {
    if (!abierto || paso === 'listo') return
    obtenerProductos().then(sincronizar).catch(() => {})
  }, [abierto, paso, sincronizar])

  // Si cambia el subtotal, el cupón se vuelve a validar (puede dejar de cumplir la compra mínima)
  useEffect(() => {
    if (!cupon) return
    if (items.length === 0) {
      setCupon(null)
      return
    }
    validarCupon(cupon.codigo, subtotal.toFixed(2))
      .then(setCupon)
      .catch((e) => {
        setCupon(null)
        setErrorCupon(e.message)
      })
    // Solo interesa reaccionar al cambio del subtotal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal])

  const cerrar = (abiertoAhora) => {
    setAbierto(abiertoAhora)
    if (!abiertoAhora && paso === 'listo') {
      // Después de confirmar, al cerrar el panel se vuelve al estado inicial
      setPaso('carrito')
      setPedido(null)
    }
  }

  const confirmar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const creado = await crearPedido({
        ...datos,
        cupon: cupon?.codigo ?? '',
        items: items.map((i) => ({ producto: i.producto.id, cantidad: i.cantidad })),
      })
      setPedido(creado)
      setPaso('listo')
      vaciar()
      setCupon(null)
      pedidoConfirmado()
    } catch (err) {
      setError(err.message)
      // Si falló por falta de stock, se actualiza el carrito con las cantidades reales
      obtenerProductos().then(sincronizar).catch(() => {})
    } finally {
      setEnviando(false)
    }
  }

  const faltaParaEnvio = Math.max(0, envioGratisDesde - baseEnvio)
  const progreso = Math.min(100, (baseEnvio / envioGratisDesde) * 100)

  return (
    <Sheet open={abierto} onOpenChange={cerrar}>
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-md" aria-describedby={undefined}>
        <SheetHeader className="border-b pb-3">
          <SheetTitle className="flex items-center gap-2 font-heading text-xl">
            <ShoppingBag className="size-5 text-primary" />
            {paso === 'carrito' && `Tu carrito${cantidadTotal > 0 ? ` (${cantidadTotal})` : ''}`}
            {paso === 'datos' && 'Tus datos de entrega'}
            {paso === 'listo' && '¡Pedido recibido!'}
          </SheetTitle>
          <SheetDescription className="sr-only">Carrito de compras de Librería Misti</SheetDescription>
        </SheetHeader>

        {paso === 'carrito' && items.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="size-12 text-muted-foreground/50" />
            <p className="font-heading text-xl font-bold text-primary">Tu carrito está vacío</p>
            <p className="text-muted-foreground">Agrega libros o útiles desde el catálogo.</p>
            <Button onClick={() => setAbierto(false)} render={<a href="#catalogo" />} nativeButton={false}>
              Ver catálogo
            </Button>
          </div>
        )}

        {paso === 'carrito' && items.length > 0 && (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <div className="mb-2 space-y-1.5 rounded-xl bg-secondary/70 p-3 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <Truck className="size-4 text-primary" />
                  {faltaParaEnvio > 0
                    ? `Te faltan ${soles(faltaParaEnvio)} para el envío gratis`
                    : '¡Tienes envío gratis!'}
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full bg-dorado transition-all" style={{ width: `${progreso}%` }} />
                </div>
              </div>
              <ul className="divide-y">
                {items.map((item) => (
                  <ItemCarrito key={item.producto.id} item={item} />
                ))}
              </ul>
              <Recomendaciones
                ids={items.map((i) => i.producto.id)}
                titulo="Completa tu compra"
                limite={3}
                className="border-t py-4 [&>div]:grid-cols-1"
              />
            </div>

            <div className="space-y-3 border-t bg-card p-4">
              <CuponCarrito
                subtotal={subtotal}
                cupon={cupon}
                onAplicar={setCupon}
                onQuitar={() => setCupon(null)}
                error={errorCupon}
                onError={setErrorCupon}
              />
              <dl className="space-y-1 text-sm">
                {ahorroPorOfertas > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Ahorro por ofertas</dt>
                    <dd>-{soles(ahorroPorOfertas)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>{soles(subtotal)}</dd>
                </div>
                {cupon && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Cupón {cupon.codigo}</dt>
                    <dd>-{soles(descuentoCupon)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Envío</dt>
                  <dd>{envio === 0 ? 'Gratis' : soles(envio)}</dd>
                </div>
                <div className="flex justify-between border-t pt-2 font-heading text-lg font-bold text-primary">
                  <dt>Total</dt>
                  <dd>{soles(total)}</dd>
                </div>
              </dl>
              <Button size="lg" className="w-full" onClick={() => setPaso('datos')}>
                Continuar con el pedido
              </Button>
            </div>
          </>
        )}

        {paso === 'datos' && (
          <FormularioPedido
            datos={datos}
            onCambio={(cambios) => setDatos((d) => ({ ...d, ...cambios }))}
            onSubmit={confirmar}
            onVolver={() => {
              setPaso('carrito')
              setError(null)
            }}
            enviando={enviando}
            error={error}
            total={soles(total)}
          />
        )}

        {paso === 'listo' && pedido && (
          <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto px-6 pb-6 text-center">
            <CheckCircle2 className="size-14 text-emerald-600" />
            <div>
              <p className="font-heading text-2xl font-bold text-primary">Pedido N.º {String(pedido.id).padStart(4, '0')}</p>
              <p className="text-muted-foreground">Gracias, {pedido.cliente_nombre.split(' ')[0]}. Te enviaremos la confirmación a {pedido.cliente_email}.</p>
            </div>
            <ul className="w-full divide-y rounded-xl border bg-card text-left text-sm">
              {pedido.items.map((i) => (
                <li key={i.producto} className="flex justify-between gap-3 p-3">
                  <span>{i.cantidad} × {i.producto_nombre}</span>
                  <span className="font-medium">{soles(i.importe)}</span>
                </li>
              ))}
              <li className="flex justify-between p-3 font-heading text-lg font-bold text-primary">
                <span>Total pagado</span>
                <span>{soles(pedido.total)}</span>
              </li>
            </ul>
            <Button className="w-full" onClick={() => cerrar(false)}>Seguir comprando</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default CarritoSheet
