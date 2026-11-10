import { Button } from '@/components/ui/button'

// Banner de portada. Muestra tres portadas del catálogo (las que llegan desde la API)
function Hero({ destacados, totalProductos, totalCategorias }) {
  const inclinaciones = ['-rotate-6 translate-y-4', 'z-10 scale-110', 'rotate-6 translate-y-4']

  return (
    <section id="inicio" className="relative overflow-hidden bg-vino text-primary-foreground">
      <div className="absolute -right-24 -top-24 size-96 rounded-full bg-dorado/20" />
      <div className="absolute -bottom-32 left-1/3 size-80 rounded-full bg-primary/60" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-dorado">Arequipa · desde 2026</p>
          <h1 className="text-4xl font-extrabold leading-tight lg:text-5xl">
            Historias que cruzan los Andes
          </h1>
          <p className="max-w-md text-lg text-primary-foreground/85">
            Novelas, poesía, cuentos infantiles, libros de estudio y útiles para el cuaderno.
            Tu librería de barrio, ahora también en línea.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              size="lg"
              className="bg-dorado text-foreground hover:bg-dorado/90"
              render={<a href="#catalogo" />}
              nativeButton={false}
            >
              Ver catálogo
            </Button>
            {totalProductos > 0 && (
              <span className="text-sm text-primary-foreground/75">
                {totalProductos} títulos · {totalCategorias} categorías
              </span>
            )}
          </div>
        </div>

        <div className="flex h-64 items-center justify-center gap-0 sm:h-80">
          {destacados.slice(0, 3).map((producto, i) => (
            <img
              key={producto.id}
              src={producto.imagen}
              alt={`Portada de ${producto.nombre}`}
              className={`-mx-3 h-48 w-auto rounded-md shadow-2xl ring-1 ring-white/20 sm:h-64 ${inclinaciones[i]}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
