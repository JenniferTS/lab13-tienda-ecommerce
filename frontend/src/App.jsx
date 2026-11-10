import Header from '@/components/Header'
import Catalogo from '@/pages/Catalogo'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header nombreTienda="Librería Misti" />
      <main>
        <Catalogo />
      </main>
    </div>
  )
}

export default App
