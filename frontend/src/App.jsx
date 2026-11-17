import { useEffect, useState } from 'react'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Catalogo from '@/pages/Catalogo'
import Inventario from '@/pages/Inventario'
import { obtenerCategorias, obtenerProductos } from '@/services/api'

const NOMBRE_TIENDA = 'Librería Misti'

// Las dos «páginas» de la tienda se distinguen por el hash de la URL: #/inventario o la tienda
function useVista() {
  const leer = () => (window.location.hash.startsWith('#/inventario') ? 'inventario' : 'tienda')
  const [vista, setVista] = useState(leer)
  useEffect(() => {
    const alCambiar = () => setVista(leer())
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])
  return vista
}

function App() {
  const vista = useVista()
  // Datos generales para el banner de portada (el catálogo pide los suyos por separado)
  const [busqueda, setBusqueda] = useState('')
  const [resumen, setResumen] = useState({ productos: [], categorias: 0 })

  useEffect(() => {
    Promise.all([obtenerProductos(), obtenerCategorias()])
      .then(([productos, categorias]) => setResumen({ productos, categorias: categorias.length }))
      .catch(() => {})
  }, [])

  // Para el banner se prefieren los productos con stock
  const destacados = resumen.productos.filter((p) => p.cantidad_disponible > 0).slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      <Header nombreTienda={NOMBRE_TIENDA} busqueda={busqueda} onBuscar={setBusqueda} />
      <main>
        {vista === 'inventario' ? (
          <Inventario />
        ) : (
          <>
            <Hero
              destacados={destacados}
              totalProductos={resumen.productos.length}
              totalCategorias={resumen.categorias}
            />
            <Catalogo busqueda={busqueda} onBuscar={setBusqueda} />
          </>
        )}
      </main>
      <Footer nombreTienda={NOMBRE_TIENDA} />
    </div>
  )
}

export default App
