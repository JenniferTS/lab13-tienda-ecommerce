import Logo from '@/components/Logo'

const enlaces = [
  { texto: 'Inicio', href: '#inicio' },
  { texto: 'Catálogo', href: '#catalogo' },
  { texto: 'Nosotros', href: '#nosotros' },
  { texto: 'Contacto', href: '#contacto' },
]

function Header({ nombreTienda }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <a href="#inicio" className="flex items-center gap-3">
          <Logo />
          <span className="font-heading text-2xl font-extrabold tracking-tight text-primary">
            {nombreTienda}
          </span>
        </a>
        <nav className="flex gap-6 text-sm font-medium">
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
      </div>
    </header>
  )
}

export default Header
