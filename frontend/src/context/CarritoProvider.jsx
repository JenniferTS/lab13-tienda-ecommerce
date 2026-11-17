import { useCallback, useEffect, useMemo, useState } from 'react'

import { CarritoContext } from '@/context/CarritoContext'

const CLAVE = 'misti-carrito'

function leerGuardado() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? []
  } catch {
    return []
  }
}

// Del producto solo se guarda lo necesario para dibujar el carrito
function resumirProducto(p) {
  return {
    id: p.id, nombre: p.nombre, imagen: p.imagen, categoria_nombre: p.categoria_nombre,
    precio: p.precio, descuento: p.descuento, precio_final: p.precio_final, en_oferta: p.en_oferta,
    cantidad_disponible: p.cantidad_disponible,
  }
}

// Guarda el carrito en el navegador (localStorage) para que no se pierda al recargar la página
function CarritoProvider({ children }) {
  const [items, setItems] = useState(leerGuardado)
  const [abierto, setAbierto] = useState(false)
  const [aviso, setAviso] = useState(null)
  // Sube cuando se confirma un pedido, para que el catálogo vuelva a pedir el stock actualizado
  const [version, setVersion] = useState(0)

  useEffect(() => {
    localStorage.setItem(CLAVE, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    if (!aviso) return
    const temporizador = setTimeout(() => setAviso(null), 2600)
    return () => clearTimeout(temporizador)
  }, [aviso])

  const agregar = useCallback((producto, cantidad = 1) => {
    const maximo = producto.cantidad_disponible
    const actual = items.find((i) => i.producto.id === producto.id)?.cantidad ?? 0
    if (actual >= maximo) {
      setAviso({ texto: `Ya tienes todas las unidades disponibles de «${producto.nombre}»`, tipo: 'error' })
      return
    }
    const nueva = Math.min(actual + cantidad, maximo)
    setItems((previos) =>
      actual === 0
        ? [...previos, { producto: resumirProducto(producto), cantidad: nueva }]
        : previos.map((i) => (i.producto.id === producto.id ? { ...i, cantidad: nueva } : i)),
    )
    setAviso({ texto: `«${producto.nombre}» se agregó al carrito`, tipo: 'ok' })
  }, [items])

  const cambiarCantidad = useCallback((id, cantidad) => {
    setItems((previos) =>
      previos.map((i) =>
        i.producto.id === id ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.producto.cantidad_disponible)) } : i,
      ),
    )
  }, [])

  const quitar = useCallback((id) => setItems((previos) => previos.filter((i) => i.producto.id !== id)), [])
  const vaciar = useCallback(() => setItems([]), [])

  // Actualiza precios y stock con los productos que acaba de enviar el servidor
  const sincronizar = useCallback((productos) => {
    setItems((previos) =>
      previos.flatMap((i) => {
        const actual = productos.find((p) => p.id === i.producto.id)
        if (!actual || actual.cantidad_disponible === 0) return []
        return [{ producto: resumirProducto(actual), cantidad: Math.min(i.cantidad, actual.cantidad_disponible) }]
      }),
    )
  }, [])

  const valor = useMemo(() => {
    const subtotal = items.reduce((suma, i) => suma + Number(i.producto.precio_final) * i.cantidad, 0)
    const sinDescuento = items.reduce((suma, i) => suma + Number(i.producto.precio) * i.cantidad, 0)
    return {
      items,
      cantidadTotal: items.reduce((suma, i) => suma + i.cantidad, 0),
      subtotal,
      ahorroPorOfertas: sinDescuento - subtotal,
      abierto, setAbierto, aviso, setAviso, version,
      pedidoConfirmado: () => setVersion((v) => v + 1),
      agregar, cambiarCantidad, quitar, vaciar, sincronizar,
    }
  }, [items, abierto, aviso, version, agregar, cambiarCantidad, quitar, vaciar, sincronizar])

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
}

export default CarritoProvider
