import { useEffect, useState } from 'react'

import BarraPromos from '@/components/BarraPromos'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Ofertas from '@/components/Ofertas'
import ProductDetail from '@/components/ProductDetail'
import Catalogo from '@/pages/Catalogo'
import Inventario from '@/pages/Inventario'
import { obtenerCategorias, obtenerConfiguracion, obtenerProductos } from '@/services/api'

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
  const [busqueda, setBusqueda] = useState('')
  const [productoAbierto, setProductoAbierto] = useState(null)
  // Datos generales para el banner y las ofertas (el catálogo pide los suyos por separado)
  const [resumen, setResumen] = useState({ productos: [], categorias: 0 })
  const [configuracion, setConfiguracion] = useState(null)

  useEffect(() => {
    Promise.all([obtenerProductos(), obtenerCategorias(), obtenerConfiguracion()])
      .then(([productos, categorias, config]) => {
        setResumen({ productos, categorias: categorias.length })
        setConfiguracion(config)
      })
      .catch(() => {})
  }, [])

  const conStock = resumen.productos.filter((p) => p.cantidad_disponible > 0)
  const ofertas = conStock.filter((p) => p.en_oferta).sort((a, b) => b.descuento - a.descuento)
  // Para el banner se prefieren las ofertas con stock
  const destacados = [...ofertas, ...conStock.filter((p) => !p.en_oferta)].slice(0, 3)
  const maximoDescuento = Math.max(0, ...ofertas.map((p) => p.descuento))

  return (
    <div className="min-h-screen bg-background">
      <BarraPromos configuracion={configuracion} />
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
              maximoDescuento={maximoDescuento}
            />
            <Ofertas ofertas={ofertas} cupones={configuracion?.cupones ?? []} onVer={setProductoAbierto} />
            <Catalogo busqueda={busqueda} onBuscar={setBusqueda} onVer={setProductoAbierto} />
          </>
        )}
      </main>
      <Footer nombreTienda={NOMBRE_TIENDA} />
      <ProductDetail producto={productoAbierto} onCerrar={() => setProductoAbierto(null)} />
    </div>
  )
}

export default App
