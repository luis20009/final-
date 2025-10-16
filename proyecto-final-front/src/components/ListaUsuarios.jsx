import { useEffect, useState } from "react"
import userService from "../services/userService"
import Menu from "../components/Menu"

const ListaUsuarios = ({ user }) => {
  const [usuarios, setUsuarios] = useState([])
  const [message, setMessage] = useState(null)

  const fetchUsers = async () => {
    const datos = await userService.getAll()
    setUsuarios(datos)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = async (id, username) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${username}?\nEsta acción también eliminará todos los mensajes, tareas y blogs asociados al usuario.`)) {
      try {
        await userService.deleteUser(id)
        setMessage({
          type: 'success',
          text: `✅ Usuario ${username} y sus datos asociados han sido eliminados correctamente`
        })
        // Actualizar la lista de usuarios
        fetchUsers()
      } catch (error) {
        console.error('Error al eliminar usuario:', error)
        setMessage({
          type: 'error',
          text: `❌ ${error.message}`
        })
      }
      setTimeout(() => setMessage(null), 5000)
    }
  }

  return (
    <div>
      <h2>Usuarios Registrados</h2>
      {message && (
        <p className={`message ${message.type}`} style={{
          padding: '10px',
          margin: '10px 0',
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </p>
      )}
      {usuarios.length === 0
        ? <p>No hay usuarios aún.</p>
        : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {usuarios.map(u => (
              <li key={u.id} style={{ 
                margin: '10px 0', 
                padding: '10px', 
                border: '1px solid #ddd',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>Usuario: {u.username}</strong>
                  <br />
                  Nombre: {u.name}
                  <br />
                  Correo: {u.email}
                  <br />
                  Rol: <em>{u.Rol || "Sin rol"}</em>
                </div>
                {/* No mostrar el botón de eliminar para el usuario actual */}
                {user?.username !== u.username && (
                  <button 
                    onClick={() => handleDelete(u.id, u.username)}
                    style={{
                      backgroundColor: '#ff4444',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Eliminar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
    </div>
  )
}

export default ListaUsuarios