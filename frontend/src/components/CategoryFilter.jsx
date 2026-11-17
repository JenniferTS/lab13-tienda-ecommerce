import { Button } from '@/components/ui/button'

// categoriaActiva es el id de la categoría elegida (null = todas)
function CategoryFilter({ categorias, categoriaActiva, onSeleccionar }) {
  const estilo = (activa) =>
    activa
      ? 'rounded-full bg-primary px-4 text-primary-foreground shadow-md hover:bg-primary/90'
      : 'rounded-full border-border bg-card px-4 text-foreground hover:border-dorado hover:bg-accent'
  const total = categorias.reduce((suma, c) => suma + (c.total_productos ?? 0), 0)

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Categorías">
      <Button variant="outline" className={estilo(categoriaActiva === null)} onClick={() => onSeleccionar(null)}>
        Todos
        {total > 0 && <span className="ml-1 text-xs opacity-70">{total}</span>}
      </Button>
      {categorias.map((categoria) => (
        <Button
          key={categoria.id}
          variant="outline"
          className={estilo(categoriaActiva === categoria.id)}
          onClick={() => onSeleccionar(categoria.id)}
        >
          {categoria.nombre}
          <span className="ml-1 text-xs opacity-70">{categoria.total_productos}</span>
        </Button>
      ))}
    </div>
  )
}

export default CategoryFilter
