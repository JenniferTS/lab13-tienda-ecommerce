import { useEffect, useState } from 'react'

import CategoryFilter from '@/components/CategoryFilter'
import ProductList from '@/components/ProductList'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
    <section id="catalogo" className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-extrabold text-primary">Catálogo</h2>
          <p className="text-muted-foreground">Elige una categoría para ver solo esos productos.</p>
        </div>
        <Button variant="outline" className="rounded-full bg-card" onClick={() => setRecarga((n) => n + 1)}>
          Actualizar catálogo
        </Button>
      </div>

      <CategoryFilter
        categorias={categorias}
        categoriaActiva={categoriaActiva}
        onSeleccionar={setCategoriaActiva}
      />

      {cargando && (
        <div className="space-y-4">
          <p className="text-center text-muted-foreground">Cargando productos...</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {error && !cargando && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-center text-destructive">
          No se pudo cargar el catálogo: {error}. Revisa que el backend de Django esté encendido.
        </p>
      )}

      {!cargando && !error && <ProductList productos={productos} />}
    </section>
  )
}

export default Catalogo
