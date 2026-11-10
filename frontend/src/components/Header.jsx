import { BookOpen } from 'lucide-react'

const enlaces = [
  { texto: 'Inicio', href: '#inicio' },
  { texto: 'Catálogo', href: '#catalogo' },
  { texto: 'Nosotros', href: '#nosotros' },
  { texto: 'Contacto', href: '#contacto' },
]

function Header({ nombreTienda }) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <a href="#inicio" className="flex items-center gap-2 text-xl font-bold">
          <BookOpen className="size-6" />
          {nombreTienda}
        </a>
        <nav className="flex gap-5 text-sm">
          {enlaces.map((enlace) => (
            <a key={enlace.href} href={enlace.href} className="hover:underline">
              {enlace.texto}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header
