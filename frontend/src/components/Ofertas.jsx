import CuponCard from '@/components/CuponCard'
import ProductCard from '@/components/ProductCard'

// Sección de marketing: productos en oferta (carrusel horizontal) y cupones disponibles
function Ofertas({ ofertas, cupones, onVer }) {
  if (ofertas.length === 0 && cupones.length === 0) return null

  return (
    <section id="ofertas" className="bg-secondary/60 py-12">
      <div className="mx-auto max-w-6xl space-y-8 px-4">
        {ofertas.length > 0 && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">Por tiempo limitado</p>
              <h2 className="text-3xl font-extrabold text-primary">Ofertas de la semana</h2>
            </div>
            {/* En el celular se desliza con el dedo; cada tarjeta se detiene al inicio */}
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">
              {ofertas.map((producto) => (
                <div key={producto.id} className="w-60 shrink-0 snap-start sm:w-64">
                  <ProductCard producto={producto} onVer={onVer} />
                </div>
              ))}
            </div>
          </div>
        )}

        {cupones.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-heading text-2xl font-bold text-primary">Cupones de descuento</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {cupones.map((cupon) => (
                <CuponCard key={cupon.codigo} cupon={cupon} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Escribe el código en el carrito al finalizar tu compra.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default Ofertas
