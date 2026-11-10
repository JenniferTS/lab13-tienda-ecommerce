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

// Si se envía el id de una categoría, la API devuelve solo los productos de esa categoría
export function obtenerProductos(categoriaId = null) {
  return pedir(categoriaId ? `/productos/?categoria=${categoriaId}` : '/productos/')
}
