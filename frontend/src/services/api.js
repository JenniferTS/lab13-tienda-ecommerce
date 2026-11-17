// Todas las peticiones al backend de Django están en este archivo
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

// Pide una ruta a la API. `opciones`: metodo, cuerpo (objeto que se envía como JSON) y token (administradores).
async function pedir(ruta, { metodo = 'GET', cuerpo, token } = {}) {
  const encabezados = {}
  if (cuerpo) encabezados['Content-Type'] = 'application/json'
  if (token) encabezados.Authorization = `Token ${token}`
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: encabezados,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  })
  if (!respuesta.ok) {
    // Si el servidor explica el error (por ejemplo «stock insuficiente») se muestra ese mensaje
    const datos = await respuesta.json().catch(() => ({}))
    const mensaje = datos.detail ?? Object.values(datos).flat().join(' ')
    const error = new Error(mensaje || `El servidor respondió con el error ${respuesta.status}`)
    error.estado = respuesta.status
    throw error
  }
  return respuesta.json()
}

export function obtenerCategorias() {
  return pedir('/categorias/')
}

// `filtros` usa los mismos nombres que la API: q, categoria, precio_min, precio_max, disponibles y orden.
// Los filtros vacíos no se envían.
export function obtenerProductos(filtros = {}) {
  const params = new URLSearchParams()
  for (const [nombre, valor] of Object.entries(filtros)) {
    if (valor === '' || valor === null || valor === undefined || valor === false) continue
    params.set(nombre, valor === true ? '1' : valor)
  }
  const consulta = params.toString()
  return pedir(consulta ? `/productos/?${consulta}` : '/productos/')
}

export function obtenerProducto(id) {
  return pedir(`/productos/${id}/`)
}

// ---- Administración (requiere token de un usuario administrador)
export function iniciarSesion(usuario, clave) {
  return pedir('/auth/login/', { metodo: 'POST', cuerpo: { usuario, clave } })
}

export function obtenerInventario(token) {
  return pedir('/inventario/', { token })
}

export function obtenerResumenInventario(token) {
  return pedir('/inventario/resumen/', { token })
}

export function obtenerMovimientos(token) {
  return pedir('/inventario/movimientos/', { token })
}

// tipo: 'entrada' (reposición) o 'ajuste' (merma o corrección; la cantidad puede ser negativa)
export function registrarMovimiento(token, productoId, { tipo, cantidad, motivo }) {
  return pedir(`/inventario/${productoId}/movimiento/`, { metodo: 'POST', token, cuerpo: { tipo, cantidad, motivo } })
}

export function cambiarStockMinimo(token, productoId, stockMinimo) {
  return pedir(`/inventario/${productoId}/`, { metodo: 'PATCH', token, cuerpo: { stock_minimo: stockMinimo } })
}
