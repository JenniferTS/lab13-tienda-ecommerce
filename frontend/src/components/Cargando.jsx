import { Skeleton } from '@/components/ui/skeleton'

function Cargando({ filas = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  )
}

export default Cargando
