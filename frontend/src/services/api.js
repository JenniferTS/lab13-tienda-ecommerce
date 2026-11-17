// Todas las peticiones al backend de Django están en este archivo
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

async function pedir(ruta) {
  const respuesta = await fetch(`${API_URL}${ruta}`)
  if (!respuesta.ok) {
    throw new Error(`El servidor respondió con el error ${respuesta.status}`)
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
