import { Link } from 'react-router-dom'
import logo from '../assets/flags/logo.png'

function BrandLogo({ className = '' }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${className}`.trim()}
      aria-label="Dibladi"
    >
      <img
        src={logo}
        alt="Dibladi"
        className="h-24 w-auto object-contain sm:h-14"
      />
    </Link>
  )
}

export default BrandLogo