import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { RequireGuest } from './components/RequireGuest'
import { RequireGuestOrAdmin } from './components/RequireGuestOrAdmin'
import { RequireAdmin } from './components/RequireAdmin'
import { Home } from './pages/Home'
import { StateSelection } from './pages/StateSelection'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Trial } from './pages/Trial'
import { Practice } from './pages/Practice'
import { MockExam } from './pages/MockExam'
import { ExamDetail } from './pages/ExamDetail'
import { Exams } from './pages/Exams'
import { Mistakes } from './pages/Mistakes'
import { Strategy } from './pages/Strategy'
import { Profile } from './pages/Profile'
import { AdminUsers } from './pages/AdminUsers'
import { AdminInviteCodes } from './pages/AdminInviteCodes'
import { NotFound } from './pages/NotFound'
import { ScrollManager } from './components/ScrollManager'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" />
      <BrowserRouter>
        <ScrollManager />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="state-selection" element={<StateSelection />} />
            <Route
              path="trial"
              element={
                <RequireGuestOrAdmin>
                  <Trial />
                </RequireGuestOrAdmin>
              }
            />
            <Route path="strategy" element={<Strategy />} />
            <Route
              path="login"
              element={
                <RequireGuest>
                  <Login />
                </RequireGuest>
              }
            />
            <Route
              path="register"
              element={
                <RequireGuest>
                  <Register />
                </RequireGuest>
              }
            />
            <Route
              path="practice"
              element={
                <RequireAuth>
                  <Practice />
                </RequireAuth>
              }
            />
            <Route
              path="mock-exam"
              element={
                <RequireAuth>
                  <MockExam />
                </RequireAuth>
              }
            />
            <Route
              path="exams"
              element={
                <RequireAuth>
                  <Exams />
                </RequireAuth>
              }
            />
            <Route
              path="exams/:id"
              element={
                <RequireAuth>
                  <ExamDetail />
                </RequireAuth>
              }
            />
            <Route
              path="mistakes"
              element={
                <RequireAuth>
                  <Mistakes />
                </RequireAuth>
              }
            />
            <Route
              path="profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="admin/users"
              element={
                <RequireAuth>
                  <RequireAdmin>
                    <AdminUsers />
                  </RequireAdmin>
                </RequireAuth>
              }
            />
            <Route
              path="admin/invite-codes"
              element={
                <RequireAuth>
                  <RequireAdmin>
                    <AdminInviteCodes />
                  </RequireAdmin>
                </RequireAuth>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
