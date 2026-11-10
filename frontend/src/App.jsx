import { useEffect, useState } from 'react'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Catalogo from '@/pages/Catalogo'
import { obtenerCategorias, obtenerProductos } from '@/services/api'

const NOMBRE_TIENDA = 'Librería Misti'

function App() {
  // Datos generales para el banner de portada (el catálogo pide los suyos por separado)
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
      <Header nombreTienda={NOMBRE_TIENDA} />
      <main>
        <Hero
          destacados={destacados}
          totalProductos={resumen.productos.length}
          totalCategorias={resumen.categorias}
        />
        <Catalogo />
      </main>
      <Footer nombreTienda={NOMBRE_TIENDA} />
    </div>
  )
}

export default App
