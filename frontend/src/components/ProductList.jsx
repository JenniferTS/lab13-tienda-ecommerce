import ProductCard from '@/components/ProductCard'

function ProductList({ productos, onVer, hayFiltros, onLimpiar }) {
  if (productos.length === 0) {
    return (
      <div className="space-y-3 rounded-2xl border border-dashed bg-card py-14 text-center">
        <p className="font-heading text-xl font-bold text-primary">No encontramos productos</p>
        <p className="text-muted-foreground">
          {hayFiltros ? 'Prueba con otra palabra o quita algún filtro.' : 'Todavía no hay productos en el catálogo.'}
        </p>
        {hayFiltros && (
          <button type="button" onClick={onLimpiar} className="text-sm font-semibold text-primary underline underline-offset-4">
            Limpiar búsqueda y filtros
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} onVer={onVer} />
      ))}
    </div>
  )
}

export default ProductList
