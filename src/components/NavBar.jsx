import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { logOut } = useAuth()
  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">🎨 Artchive</Link>
      <nav>
        <NavLink to="/" end>Gallery</NavLink>
        <NavLink to="/kids">Kids</NavLink>
        <NavLink to="/upload" className="nav-upload">+ Add art</NavLink>
        <button className="btn-link" onClick={logOut}>Sign out</button>
      </nav>
    </header>
  )
}
