import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Librería Misti</h1>
      <p className="text-muted-foreground">Proyecto base con React, Vite, Tailwind CSS y shadcn/ui</p>
      <Button>Botón de shadcn/ui</Button>
    </div>
  )
}

export default App
