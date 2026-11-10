// Logotipo: el volcán Misti sobre las páginas de un libro abierto
function Logo({ className = 'size-10' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Logotipo de Librería Misti">
      <circle cx="24" cy="24" r="23" fill="#7A2E2E" />
      <path d="M8 32 L19 17 L24 24 L29.5 13 L40 32 Z" fill="#E0A526" />
      <path d="M26.5 17.5 L29.5 13 L32 17.5 L30 16.5 L28.5 18 Z" fill="#FFF7E8" />
      <path d="M6 35 Q15 31 24 35 Q33 31 42 35 V40 Q33 36 24 40 Q15 36 6 40 Z" fill="#FBF6EC" />
      <line x1="24" y1="35" x2="24" y2="40" stroke="#7A2E2E" strokeWidth="1.2" />
    </svg>
  )
}

export default Logo
