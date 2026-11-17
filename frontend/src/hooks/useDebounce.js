import { useEffect, useState } from 'react'

// Devuelve el valor recién después de que deje de cambiar durante `espera` milisegundos.
// Sirve para no pedir los productos al servidor con cada letra que se escribe en el buscador.
export function useDebounce(valor, espera = 350) {
  const [retrasado, setRetrasado] = useState(valor)

  useEffect(() => {
    const temporizador = setTimeout(() => setRetrasado(valor), espera)
    return () => clearTimeout(temporizador)
  }, [valor, espera])

  return retrasado
}
