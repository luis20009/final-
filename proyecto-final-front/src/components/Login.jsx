import { useState } from 'react'
import loginService from '../services/login'
import { setToken as setTareasToken } from '../services/tareasService'
import './css/login.css'

const Login = ({ handleLogin: parentHandleLogin, username, setUsername, password, setPassword, message }) => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      // Usamos la función handleLogin que viene como prop
      await parentHandleLogin(event)
      
      setUsername('')
      setPassword('')

    } catch (error) {
      console.error('Error en login:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      {message && (
        <div className={`message ${message.type ? 'success' : 'error'}`}>
          {message.message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            value={username}
            name="Username"
            placeholder="Usuario"
            onChange={({ target }) => setUsername(target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            name="Password"
            placeholder="Contraseña"
            onChange={({ target }) => setPassword(target.value)}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  )
}

export default Login