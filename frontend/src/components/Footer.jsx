import Logo from '@/components/Logo'

function Footer({ nombreTienda }) {
  return (
    <footer className="mt-10 bg-vino text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div id="nosotros" className="space-y-3">
          <div className="flex items-center gap-3">
            <Logo className="size-9" />
            <span className="font-heading text-xl font-bold">{nombreTienda}</span>
          </div>
          <p className="text-sm text-primary-foreground/80">
            Somos una librería arequipeña. Su nombre viene del volcán Misti, que se ve desde
            cualquier rincón de la ciudad, y queremos que nuestros libros también lleguen a todos lados.
          </p>
        </div>
        <div id="contacto" className="space-y-2 text-sm">
          <h3 className="font-heading text-lg font-bold text-dorado">Contacto</h3>
          <p>Arequipa, Perú</p>
          <p>Lunes a sábado de 9:00 a 20:00</p>
        </div>
        <div className="space-y-2 text-sm">
          <h3 className="font-heading text-lg font-bold text-dorado">Próximamente</h3>
          <p>Carrito de compras, pedidos y pagos en línea.</p>
        </div>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-xs text-primary-foreground/60">
        © 2026 {nombreTienda} · Laboratorio 13 de Desarrollo de Aplicaciones Empresariales
      </div>
    </footer>
  )
}

export default Footer
