import { useEffect, useState } from 'react'

import CategoryFilter from '@/components/CategoryFilter'
import ProductList from '@/components/ProductList'
import { Button } from '@/components/ui/button'
import { obtenerCategorias, obtenerProductos } from '@/services/api'

function Catalogo() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  // Al cambiar este número se vuelve a pedir el catálogo (botón "Actualizar")
  const [recarga, setRecarga] = useState(0)

  // Las categorías se piden al entrar y cuando se actualiza el catálogo
  useEffect(() => {
    obtenerCategorias()
      .then(setCategorias)
      .catch((e) => setError(e.message))
  }, [recarga])

  // Los productos se piden al entrar y cada vez que se elige otra categoría
  useEffect(() => {
    let vigente = true
    setCargando(true)
    setError(null)
    obtenerProductos(categoriaActiva)
      .then((datos) => {
        if (vigente) setProductos(datos)
      })
      .catch((e) => {
        if (vigente) setError(e.message)
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    // Si se elige otra categoría antes de que llegue la respuesta, se ignora la anterior
    return () => {
      vigente = false
    }
  }, [categoriaActiva, recarga])

  return (
    <section id="catalogo" className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Catálogo</h2>
        <Button variant="outline" onClick={() => setRecarga((n) => n + 1)}>
          Actualizar catálogo
        </Button>
      </div>

      <CategoryFilter
        categorias={categorias}
        categoriaActiva={categoriaActiva}
        onSeleccionar={setCategoriaActiva}
      />

      {cargando && <p className="py-10 text-center text-muted-foreground">Cargando productos...</p>}

      {error && !cargando && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-center text-destructive">
          No se pudo cargar el catálogo: {error}. Revisa que el backend de Django esté encendido.
        </p>
      )}

      {!cargando && !error && <ProductList productos={productos} />}
    </section>
  )
}

export default Catalogo
