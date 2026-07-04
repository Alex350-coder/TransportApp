import { Navigate, useLocation } from 'react-router'
import type { ReactNode } from 'react'

import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/lib/auth-context'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <Spinner label="Verificando tu sesión…" />

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/ingresar?next=${next}`} replace />
  }

  return children
}
