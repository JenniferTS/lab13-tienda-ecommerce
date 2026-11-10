import { Button } from '@/components/ui/button'

// categoriaActiva es el id de la categoría elegida (null = todas)
function CategoryFilter({ categorias, categoriaActiva, onSeleccionar }) {
  const estilo = (activa) =>
    activa
      ? 'rounded-full bg-primary px-5 text-primary-foreground shadow-md hover:bg-primary/90'
      : 'rounded-full border-border bg-card px-5 text-foreground hover:border-dorado hover:bg-accent'

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Categorías">
      <Button
        variant="outline"
        className={estilo(categoriaActiva === null)}
        onClick={() => onSeleccionar(null)}
      >
        Todos
      </Button>
      {categorias.map((categoria) => (
        <Button
          key={categoria.id}
          variant="outline"
          className={estilo(categoriaActiva === categoria.id)}
          onClick={() => onSeleccionar(categoria.id)}
        >
          {categoria.nombre}
        </Button>
      ))}
    </div>
  )
}

export default CategoryFilter
