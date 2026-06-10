import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FRIENDLY_ERRORS = {
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/email-already-in-use': 'An account with that email already exists.',
  'auth/weak-password': 'Password needs at least 6 characters.',
  'auth/invalid-email': 'That email address doesn’t look right.',
}

export default function SignIn() {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signin') await signIn(email, password)
      else await signUp(email, password)
      navigate('/')
    } catch (err) {
      setError(FRIENDLY_ERRORS[err.code] || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError('')
    try {
      await signInWithGoogle()
      navigate('/')
    } catch {
      setError('Google sign-in didn’t complete. Please try again.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo">🎨 Artchive</h1>
        <p className="auth-tagline">Every masterpiece that comes home, saved forever.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button className="btn btn-google" onClick={handleGoogle} type="button">
          Continue with Google
        </button>
        <button
          className="btn-link"
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError('')
          }}
        >
          {mode === 'signin'
            ? 'New here? Create an account'
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
