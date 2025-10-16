import { useState, useEffect } from 'react'
import Menu from '../components/Menu'
import contactService from '../services/contacts'
import userService from '../services/userService'
import './ver-contacts.css'

const VerContacts = ({ user }) => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const [showRolModal, setShowRolModal] = useState(false)
  const [selectedRol, setSelectedRol] = useState('usuario')

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true)
        const contactsList = await contactService.getAll()
        setContacts(contactsList)
        setError(null)
      } catch (err) {
        console.error('Error al obtener contactos:', err)
        setError('No se pudieron cargar los contactos. Por favor, intente más tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  if (user?.Rol !== 'administrador') {
    return (
      <div className="contacts-container">
        <Menu user={user} />
        <div className="error-message">No tienes permisos para ver esta página</div>
      </div>
    )
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      try {
        await contactService.remove(id)
        setContacts(contacts.filter(contact => contact.id !== id))
        setError(null)
      } catch (err) {
        console.error('Error al eliminar el contacto:', err)
        setError(err.response?.data?.error || 'Error al eliminar el contacto. Por favor, intente nuevamente.')
      }
    }
  }

  const handleCreateUser = async (contact) => {
    setSelectedContact(contact)
    setShowRolModal(true)
  }

  const handleConfirmCreateUser = async () => {
    try {
      // Validación exhaustiva de campos requeridos
      if (!selectedContact?.username?.trim()) {
        throw new Error('El nombre de usuario es requerido');
      }
      if (!selectedContact?.name?.trim()) {
        throw new Error('El nombre es requerido');
      }
      if (!selectedContact?.number?.trim()) {
        throw new Error('La contraseña es requerida');
      }
      if (!selectedContact?.email?.trim()) {
        throw new Error('El correo electrónico es requerido');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(selectedContact.email.trim())) {
        throw new Error('El formato del correo electrónico no es válido');
      }

      // Preparar los datos del usuario
      const userData = {
        username: selectedContact.username.trim(),
        name: selectedContact.name.trim(),
        password: selectedContact.number.trim(),
        email: selectedContact.email.trim(),
        Rol: selectedRol
      };

      // Verificar si el username ya existe
      try {
        const checkResult = await userService.checkUserInfo({ 
          username: userData.username 
        });
        
        if (checkResult.exists.username) {
          setError('Este nombre de usuario ya está registrado. Por favor, elija otro.');
          return;
        }
      } catch (checkError) {
        console.error('Error al verificar el nombre de usuario:', checkError);
      }

      console.log('Intentando crear usuario con datos:', JSON.stringify(userData, null, 2));

      // Intentar crear el usuario
      const response = await userService.createUser(userData);
      console.log('Respuesta del servidor:', response);

      // Eliminar el contacto después de crear el usuario exitosamente
      try {
        await contactService.remove(selectedContact.id);
        // Actualizar la lista de contactos
        setContacts(prevContacts => prevContacts.filter(c => c.id !== selectedContact.id));
      } catch (deleteError) {
        console.error('Error al eliminar el contacto:', deleteError);
        // Aún consideramos exitosa la operación ya que el usuario se creó
      }

      // Si llegamos aquí, todo salió bien
      setError(null);
      setShowRolModal(false);
      setSelectedContact(null);
      // Mostrar mensaje de éxito
      alert('Usuario creado exitosamente');
    } catch (err) {
      console.error('Error completo:', err);
      
      if (err.response?.data) {
        console.error('Detalles del error del servidor:', err.response.data);
      }

      // Si es un error local de validación
      if (err.message && !err.response) {
        setError(err.message);
      } else {
        // Si es un error del servidor
        const serverError = err.response?.data?.error;
        if (serverError === 'El nombre de usuario ya está en uso') {
          setError('Este nombre de usuario ya está registrado. Por favor, elija otro.');
        } else {
          setError(serverError || 'Error al crear el usuario. Por favor, intente nuevamente.');
        }
      }

      // Mantener el modal abierto para mostrar el error
    }
  }

  if (loading) {
    return (
      <div className="contacts-container">
        <Menu user={user} />
        <div className="loading">Cargando contactos...</div>
      </div>
    )
  }

  return (
    <div className="contacts-container">
      <Menu user={user} />
      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}
      <div className="contacts-header">
        <h2>Lista de Contactos</h2>
      </div>
      
      {contacts.length === 0 ? (
        <p className="no-contacts">No hay contactos registrados</p>
      ) : (
        <div className="contacts-grid">
          {contacts.map(contact => (
            <div key={contact.id} className="contact-card">
              <h3>{contact.username}</h3>
              <div className="contact-info">
                <p><strong>Email:</strong> {contact.email}</p>
                <p><strong>Nombre:</strong> {contact.name}</p>
                <p><strong>Rol:</strong> {contact.comments}</p>
                <p><strong>Fecha:</strong> {new Date(contact.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="contact-actions" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleCreateUser(contact)}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '5px 10px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Crear Usuario
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '5px 10px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRolModal && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '300px'
          }}>
            <h3>Seleccionar Rol</h3>
            {error && (
              <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
            )}
            <select 
              value={selectedRol}
              onChange={(e) => setSelectedRol(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '15px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              <option value="usuario">Usuario</option>
              <option value="profesor">Profesor</option>
              <option value="administrador">Administrador</option>
            </select>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <button
                onClick={handleConfirmCreateUser}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowRolModal(false)
                  setSelectedContact(null)
                  setError(null)
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerContacts