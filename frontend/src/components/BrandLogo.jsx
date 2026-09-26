import { Link } from 'react-router-dom'
import mark from '../assets/paw-care-logo.svg'
import miniLogo from '../assets/mini-logo.png'

export default function BrandLogo({
  to = '/',
  className = '',
  onClick,
  variant = 'mark',
}) {
  if (variant === 'mini') {
    return (
      <Link
        to={to}
        className={`brand-logo brand-logo--mini ${className}`.trim()}
        onClick={onClick}
      >
        <img
          className="brand-logo-mini"
          src={miniLogo}
          alt="Paw Care Groomer"
          width={220}
          height={80}
        />
      </Link>
    )
  }

  return (
    <Link to={to} className={`brand-logo ${className}`.trim()} onClick={onClick}>
      <img className="brand-logo-img" src={mark} alt="" width={40} height={40} />
      <span className="brand-logo-text">
        <strong>Paw Care</strong>
        <small>Groomer</small>
      </span>
    </Link>
  )
}
