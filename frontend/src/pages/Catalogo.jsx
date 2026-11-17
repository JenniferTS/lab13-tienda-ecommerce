import { useEffect, useMemo, useState } from 'react'

import CategoryFilter from '@/components/CategoryFilter'
import FiltrosCatalogo from '@/components/FiltrosCatalogo'
import ProductList from '@/components/ProductList'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCarrito } from '@/context/CarritoContext'
import { useDebounce } from '@/hooks/useDebounce'
import { obtenerCategorias, obtenerProductos } from '@/services/api'

const FILTROS_INICIALES = { categoria: null, orden: 'nombre', precio_min: '', precio_max: '', disponibles: false, en_oferta: false }

// `busqueda` es el texto del buscador del encabezado
function Catalogo({ busqueda, onBuscar, onVer }) {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  // Al cambiar este número se vuelve a pedir el catálogo (botón "Actualizar")
  const [recarga, setRecarga] = useState(0)

  // Cuando se confirma un pedido cambia el stock, así que se vuelve a pedir el catálogo
  const { version } = useCarrito()

  // La búsqueda se envía cuando el cliente deja de escribir
  const q = useDebounce(busqueda.trim())

  const cambiarFiltros = (cambios) => setFiltros((actuales) => ({ ...actuales, ...cambios }))
  const hayFiltros = useMemo(
    () => q !== '' || JSON.stringify(filtros) !== JSON.stringify(FILTROS_INICIALES),
    [q, filtros],
  )
  const limpiar = () => {
    setFiltros(FILTROS_INICIALES)
    onBuscar('')
  }

  // Las categorías se piden al entrar y cuando se actualiza el catálogo
  useEffect(() => {
    obtenerCategorias()
      .then(setCategorias)
      .catch((e) => setError(e.message))
  }, [recarga, version])

  // Los productos se piden al entrar y cada vez que cambia la búsqueda o algún filtro
  useEffect(() => {
    let vigente = true
    setCargando(true)
    setError(null)
    obtenerProductos({ ...filtros, q })
      .then((datos) => {
        if (vigente) setProductos(datos)
      })
      .catch((e) => {
        if (vigente) setError(e.message)
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    // Si cambia un filtro antes de que llegue la respuesta, se ignora la anterior
    return () => {
      vigente = false
    }
  }, [filtros, q, recarga, version])

  return (
    <section id="catalogo" className="scroll-mt-28 mx-auto max-w-6xl space-y-6 px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-extrabold text-primary">Catálogo</h2>
          <p className="text-muted-foreground" aria-live="polite">
            {cargando
              ? 'Buscando productos...'
              : `${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}${q ? ` para «${q}»` : ''}`}
          </p>
        </div>
        <Button variant="outline" className="rounded-full bg-card" onClick={() => setRecarga((n) => n + 1)}>
          Actualizar catálogo
        </Button>
      </div>

      <CategoryFilter
        categorias={categorias}
        categoriaActiva={filtros.categoria}
        onSeleccionar={(id) => cambiarFiltros({ categoria: id })}
      />
      <FiltrosCatalogo filtros={filtros} onCambio={cambiarFiltros} onLimpiar={limpiar} hayFiltros={hayFiltros} />

      {cargando && (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
          ))}
        </div>
      )}

      {error && !cargando && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-center text-destructive">
          No se pudo cargar el catálogo: {error}. Revisa que el backend de Django esté encendido.
        </p>
      )}

      {!cargando && !error && (
        <ProductList productos={productos} onVer={onVer} hayFiltros={hayFiltros} onLimpiar={limpiar} />
      )}

    </section>
  )
}

export default Catalogo
