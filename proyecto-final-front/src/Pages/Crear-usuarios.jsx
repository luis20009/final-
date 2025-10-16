// src/pages/Crear.jsx
import { useState } from "react"
import userService from "../services/userService"
import Menu from "../components/Menu"
import ListaUsuarios from "../components/ListaUsuarios"

const Crear = ({ user }) => {
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [Rol, setRol] = useState("usuario")
  const [message, setMessage] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [isChecking, setIsChecking] = useState(false)

  const checkExistingInfo = async (field, value) => {
    if (!value) return;
    
    setIsChecking(true);
    try {
      const checkData = await userService.checkUserInfo({ [field]: value });
      if (checkData.exists[field]) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: checkData.message[field]
        }));
      } else {
        setFieldErrors(prev => ({
          ...prev,
          [field]: null
        }));
      }
    } catch (error) {
      console.error(`Error checking ${field}:`, error);
    } finally {
      setIsChecking(false);
    }
  };

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Debounced check functions
  const debouncedCheckUsername = debounce(
    (value) => checkExistingInfo('username', value),
    500
  );

  const debouncedCheckEmail = debounce(
    (value) => checkExistingInfo('email', value),
    500
  );

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const newUser = {
        username,
        name,
        email,
        password,
        Rol
      }
      
      await userService.createUser(newUser)
      setMessage("✅ Usuario creado correctamente")
      
      // Limpiar formulario
      setUsername("")
      setName("")
      setEmail("")
      setPassword("")
      setRol("usuario")
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      console.error('Error:', error)
      setMessage(`❌ ${error.response?.data?.error || error.message}`)
    }

    setTimeout(() => setMessage(null), 4000)
  }

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    debouncedCheckUsername(value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    debouncedCheckEmail(value);
  };

  return (
    <div>
      <Menu user={user} />
      <h2>Crear Usuario</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Usuario: </label>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            required
            minLength={3}
            style={{ borderColor: fieldErrors.username ? 'red' : undefined }}
          />
          {fieldErrors.username && (
            <div style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>
              {fieldErrors.username}
            </div>
          )}
        </div>
        <div>
          <label>Nombre: </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Correo: </label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            style={{ borderColor: fieldErrors.email ? 'red' : undefined }}
          />
          {fieldErrors.email && (
            <div style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>
              {fieldErrors.email}
            </div>
          )}
        </div>
        <div>
          <label>Contraseña: </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div>
          <label>Rol: </label>
          <select 
            value={Rol} 
            onChange={e => setRol(e.target.value)}
            required
          >
            <option value="usuario">Usuario</option>
            <option value="profesor">Profesor</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>
        <button type="submit">Crear</button>
      </form>
      <ListaUsuarios user={user}/>
    </div>
  )
}

export default Crear