import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import NavBar from './components/NavBar'
import SignIn from './pages/SignIn'
import Home from './pages/Home'
import Kids from './pages/Kids'
import KidPage from './pages/KidPage'
import Explore from './pages/Explore'
import Upload from './pages/Upload'

function ProtectedLayout() {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loading">Loading…</div>
  if (!user) return <Navigate to="/signin" replace />
  return (
    <>
      <NavBar />
      <main className="container">
        <Outlet />
      </main>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/kids" element={<Kids />} />
            <Route path="/kid/:profileId" element={<KidPage />} />
            <Route path="/explore/:tag" element={<Explore />} />
            <Route path="/upload" element={<Upload />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
