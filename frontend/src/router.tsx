import { Route, Routes } from 'react-router'

import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RootLayout } from '@/components/layout/RootLayout'
import { ConfirmacionPage } from '@/pages/ConfirmacionPage'
import { EncomiendasPage } from '@/pages/EncomiendasPage'
import { IngresarPage } from '@/pages/IngresarPage'
import { LandingPage } from '@/pages/LandingPage'
import { MiCuentaPage } from '@/pages/MiCuentaPage'
import { RastrearPage } from '@/pages/RastrearPage'
import { RegistrarsePage } from '@/pages/RegistrarsePage'
import { ReservarPage } from '@/pages/ReservarPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="reservar" element={<ReservarPage />} />
        <Route
          path="reservar/confirmacion/:code"
          element={
            <ProtectedRoute>
              <ConfirmacionPage />
            </ProtectedRoute>
          }
        />
        <Route path="encomiendas" element={<EncomiendasPage />} />
        <Route path="rastrear/:code?" element={<RastrearPage />} />
        <Route path="ingresar" element={<IngresarPage />} />
        <Route path="registrarse" element={<RegistrarsePage />} />
        <Route
          path="mi-cuenta"
          element={
            <ProtectedRoute>
              <MiCuentaPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}
