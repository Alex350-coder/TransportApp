import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/lib/auth-context'

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/reservar', label: 'Reservar' },
  { to: '/encomiendas', label: 'Encomiendas' },
  { to: '/rastrear', label: 'Rastrear' },
]

function navLinkClasses({ isActive }: { isActive: boolean }): string {
  const base =
    'rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150'
  return isActive
    ? `${base} bg-primary-soft text-primary-deep`
    : `${base} text-ink-soft hover:bg-primary-soft/60 hover:text-primary-deep`
}

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-sky-light/50 bg-surface/80 backdrop-blur-md">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3"
      >
        <Link to="/" aria-label="RUTEX Transportes — Inicio">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClasses} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                to="/mi-cuenta"
                className="rounded-full px-4 py-2 text-sm font-semibold text-primary-deep hover:bg-primary-soft"
              >
                Hola, {user.first_name}
              </Link>
              <Button variant="secondary" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/ingresar"
                className="rounded-full px-4 py-2 text-sm font-semibold text-primary-deep hover:bg-primary-soft"
              >
                Ingresar
              </Link>
              <Button onClick={() => navigate('/registrarse')}>Crear cuenta</Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl p-2 text-primary-deep md:hidden"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" className="size-6 fill-none stroke-current stroke-2">
            {isMenuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-sky-light/50 bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navLinkClasses}
                end={link.to === '/'}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <hr className="my-2 border-sky-light/60" />
            {user ? (
              <>
                <NavLink
                  to="/mi-cuenta"
                  className={navLinkClasses}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mi cuenta
                </NavLink>
                <Button variant="secondary" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <NavLink
                  to="/ingresar"
                  className={navLinkClasses}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ingresar
                </NavLink>
                <Button
                  onClick={() => {
                    setIsMenuOpen(false)
                    navigate('/registrarse')
                  }}
                >
                  Crear cuenta
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
