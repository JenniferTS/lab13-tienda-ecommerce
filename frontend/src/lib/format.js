// Muestra un monto en soles, por ejemplo 42.9 -> "S/ 42.90"
export function soles(monto) {
  return `S/ ${Number(monto).toFixed(2)}`
}
