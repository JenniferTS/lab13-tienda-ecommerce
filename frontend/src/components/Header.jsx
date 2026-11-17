import { Search, X } from 'lucide-react'

import BotonCarrito from '@/components/carrito/BotonCarrito'
import Logo from '@/components/Logo'

const enlaces = [
  { texto: 'Inicio', href: '#inicio' },
  { texto: 'Catálogo', href: '#catalogo' },
  { texto: 'Nosotros', href: '#nosotros' },
  { texto: 'Contacto', href: '#contacto' },
]

// El buscador está en el encabezado para que se vea en toda la página
function Header({ nombreTienda, busqueda, onBuscar }) {
  const irAlCatalogo = (e) => {
    e.preventDefault()
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <a href="#inicio" className="flex items-center gap-3">
          <Logo />
          <span className="font-heading text-2xl font-extrabold tracking-tight text-primary">
            {nombreTienda}
          </span>
        </a>

        <form
          role="search"
          onSubmit={irAlCatalogo}
          className="order-last relative w-full md:order-none md:max-w-md md:flex-1"
        >
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => onBuscar(e.target.value)}
            placeholder="Buscar por título, autor o tema"
            aria-label="Buscar productos"
            className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/20 [&::-webkit-search-cancel-button]:hidden"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => onBuscar('')}
              aria-label="Borrar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          )}
        </form>

        <nav className="ml-auto hidden gap-6 text-sm font-medium lg:flex">
          {enlaces.map((enlace) => (
            <a
              key={enlace.href}
              href={enlace.href}
              className="border-b-2 border-transparent py-1 text-foreground/80 transition-colors hover:border-dorado hover:text-primary"
            >
              {enlace.texto}
            </a>
          ))}
        </nav>
        <div className="ml-auto lg:ml-0">
          <BotonCarrito />
        </div>
      </div>
    </header>
  )
}

export default Header
