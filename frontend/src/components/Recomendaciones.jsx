import { useEffect, useState } from 'react'

import ProductoMini from '@/components/ProductoMini'
import { obtenerRecomendaciones } from '@/services/api'

// Lista de productos recomendados a partir de los ids que se están viendo o comprando
function Recomendaciones({ ids, titulo, limite = 4, onVer, className = '' }) {
  const [productos, setProductos] = useState([])
  const clave = ids.join(',')

  useEffect(() => {
    if (!clave) return
    let vigente = true
    obtenerRecomendaciones(clave.split(','), limite)
      .then((datos) => vigente && setProductos(datos))
      .catch(() => vigente && setProductos([]))
    return () => {
      vigente = false
    }
  }, [clave, limite])

  if (!clave || productos.length === 0) return null

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="font-heading text-lg font-bold text-primary">{titulo}</h3>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {productos.map((producto) => (
          <ProductoMini key={producto.id} producto={producto} onVer={onVer} />
        ))}
      </div>
    </div>
  )
}

export default Recomendaciones
