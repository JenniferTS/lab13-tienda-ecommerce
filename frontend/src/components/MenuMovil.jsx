import { Menu } from 'lucide-react'
import { useState } from 'react'

import Logo from '@/components/Logo'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

// Menú de navegación para pantallas chicas (en computadora los enlaces están en el encabezado)
function MenuMovil({ enlaces, nombreTienda }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir el menú"
        className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-primary lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      <Sheet open={abierto} onOpenChange={setAbierto}>
        <SheetContent side="left" className="w-72 max-w-[80vw] sm:max-w-xs">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="flex items-center gap-3 font-heading text-xl text-primary">
              <Logo className="size-9" /> {nombreTienda}
            </SheetTitle>
            <SheetDescription className="sr-only">Menú de navegación</SheetDescription>
          </SheetHeader>
          <nav className="flex flex-col px-2">
            {enlaces.map((enlace) => (
              <a
                key={enlace.href}
                href={enlace.href}
                onClick={() => setAbierto(false)}
                className="rounded-lg px-3 py-3 text-base font-medium hover:bg-accent"
              >
                {enlace.texto}
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default MenuMovil
