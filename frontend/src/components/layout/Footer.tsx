import { Link } from 'react-router'

import { Logo } from '@/components/ui/Logo'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-sky-light/50 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-sm text-ink-soft">
            Conecta tu mundo: viajes y encomiendas a todo el país.
          </p>
        </div>
        <nav aria-label="Servicios" className="flex flex-col gap-2 text-sm">
          <h3 className="font-display text-sm font-bold text-ink">Servicios</h3>
          <Link to="/reservar" className="text-ink-soft hover:text-primary">
            Reserva de asientos
          </Link>
          <Link to="/encomiendas" className="text-ink-soft hover:text-primary">
            Envío de encomiendas
          </Link>
          <Link to="/rastrear" className="text-ink-soft hover:text-primary">
            Rastrear encomienda
          </Link>
        </nav>
        <nav aria-label="Mi cuenta" className="flex flex-col gap-2 text-sm">
          <h3 className="font-display text-sm font-bold text-ink">Mi cuenta</h3>
          <Link to="/ingresar" className="text-ink-soft hover:text-primary">
            Ingresar
          </Link>
          <Link to="/registrarse" className="text-ink-soft hover:text-primary">
            Crear cuenta
          </Link>
          <Link to="/mi-cuenta" className="text-ink-soft hover:text-primary">
            Mis viajes y envíos
          </Link>
        </nav>
        <div className="flex flex-col gap-2 text-sm">
          <h3 className="font-display text-sm font-bold text-ink">Contacto</h3>
          <p className="text-ink-soft">Av. Los Próceres 1234, Lima</p>
          <p className="text-ink-soft">(01) 500-1234</p>
          <p className="text-ink-soft">hola@rutex.pe</p>
        </div>
      </div>
      <div className="border-t border-sky-light/40 py-4 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} RUTEX Transportes. Proyecto de demostración.
      </div>
    </footer>
  )
}
