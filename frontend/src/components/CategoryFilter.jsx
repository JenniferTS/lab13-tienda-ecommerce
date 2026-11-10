import { Button } from '@/components/ui/button'

// categoriaActiva es el id de la categoría elegida (null = todas)
function CategoryFilter({ categorias, categoriaActiva, onSeleccionar }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={categoriaActiva === null ? 'default' : 'outline'}
        onClick={() => onSeleccionar(null)}
      >
        Todos
      </Button>
      {categorias.map((categoria) => (
        <Button
          key={categoria.id}
          variant={categoriaActiva === categoria.id ? 'default' : 'outline'}
          onClick={() => onSeleccionar(categoria.id)}
        >
          {categoria.nombre}
        </Button>
      ))}
    </div>
  )
}

export default CategoryFilter
