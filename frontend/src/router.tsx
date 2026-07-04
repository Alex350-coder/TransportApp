import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router'

import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RootLayout } from '@/components/layout/RootLayout'
import { Spinner } from '@/components/ui/Spinner'
import { LandingPage } from '@/pages/LandingPage'

// Landing stays eager (LCP page); everything else is code-split per route.
const ReservarPage = lazy(() =>
  import('@/pages/ReservarPage').then((module) => ({ default: module.ReservarPage })),
)
const ConfirmacionPage = lazy(() =>
  import('@/pages/ConfirmacionPage').then((module) => ({ default: module.ConfirmacionPage })),
)
const EncomiendasPage = lazy(() =>
  import('@/pages/EncomiendasPage').then((module) => ({ default: module.EncomiendasPage })),
)
const RastrearPage = lazy(() =>
  import('@/pages/RastrearPage').then((module) => ({ default: module.RastrearPage })),
)
const IngresarPage = lazy(() =>
  import('@/pages/IngresarPage').then((module) => ({ default: module.IngresarPage })),
)
const RegistrarsePage = lazy(() =>
  import('@/pages/RegistrarsePage').then((module) => ({ default: module.RegistrarsePage })),
)
const MiCuentaPage = lazy(() =>
  import('@/pages/MiCuentaPage').then((module) => ({ default: module.MiCuentaPage })),
)

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<LandingPage />} />
        <Route
          path="reservar"
          element={
            <Suspense fallback={<Spinner />}>
              <ReservarPage />
            </Suspense>
          }
        />
        <Route
          path="reservar/confirmacion/:code"
          element={
            <Suspense fallback={<Spinner />}>
              <ProtectedRoute>
                <ConfirmacionPage />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="encomiendas"
          element={
            <Suspense fallback={<Spinner />}>
              <EncomiendasPage />
            </Suspense>
          }
        />
        <Route
          path="rastrear/:code?"
          element={
            <Suspense fallback={<Spinner />}>
              <RastrearPage />
            </Suspense>
          }
        />
        <Route
          path="ingresar"
          element={
            <Suspense fallback={<Spinner />}>
              <IngresarPage />
            </Suspense>
          }
        />
        <Route
          path="registrarse"
          element={
            <Suspense fallback={<Spinner />}>
              <RegistrarsePage />
            </Suspense>
          }
        />
        <Route
          path="mi-cuenta"
          element={
            <Suspense fallback={<Spinner />}>
              <ProtectedRoute>
                <MiCuentaPage />
              </ProtectedRoute>
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}
