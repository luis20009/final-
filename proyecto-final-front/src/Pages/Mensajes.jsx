import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../components/Menu';
import Notification from '../components/Notification';
import messagesService from '../services/messagesService';
import userService from '../services/userService';
import './Mensajes.css';

const Mensajes = ({ user }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [activeTab, setActiveTab] = useState('recibidos');
  const [nuevoMensaje, setNuevoMensaje] = useState({
    asunto: '',
    contenido: '',
    destinatarioId: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/PYTHON-PLANET');
      return;
    }

    // Configurar el token cuando el componente se monta
    messagesService.setToken(user.token);
  }, [user]);

  useEffect(() => {
    if (user) {
      cargarMensajes();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user) {
      cargarUsuarios();
    }
  }, [user]);

  const cargarMensajes = async () => {
    try {
      const data = activeTab === 'recibidos'
        ? await messagesService.getMensajesRecibidos()
        : await messagesService.getMensajesEnviados();
      setMensajes(data);
    } catch (error) {
      setMessage({ type: false, message: 'Error al cargar los mensajes' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const data = await userService.getAll();
      // Filtrar usuarios según el rol del usuario actual
      const usuariosFiltrados = data.filter(u => {
        if (user.Rol === 'usuario') {
          return ['profesor', 'administrador'].includes(u.Rol);
        }
        if (user.Rol === 'profesor') {
          return u.Rol === 'administrador';
        }
        return false; // Los administradores no pueden enviar mensajes
      });
      setUsuarios(usuariosFiltrados);
    } catch (error) {
      setMessage({ type: false, message: 'Error al cargar los usuarios' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    try {
      await messagesService.enviarMensaje(nuevoMensaje);
      setNuevoMensaje({
        asunto: '',
        contenido: '',
        destinatarioId: ''
      });
      setMessage({ type: true, message: 'Mensaje enviado correctamente' });
      cargarMensajes();
    } catch (error) {
      setMessage({ type: false, message: 'Error al enviar el mensaje' });
    }
    setTimeout(() => setMessage(null), 5000);
  };

  const [mensajeEditando, setMensajeEditando] = useState(null);

  const handleMarcarLeido = async (mensajeId) => {
    try {
      await messagesService.marcarComoLeido(mensajeId);
      setMessage({ type: true, message: 'Mensaje marcado como leído' });
      cargarMensajes();
    } catch (error) {
      setMessage({ 
        type: false, 
        message: error.response?.data?.error || 'Error al marcar como leído'
      });
    }
    setTimeout(() => setMessage(null), 5000);
  };

  const handleBorrarMensaje = async (mensajeId) => {
    if (window.confirm('¿Estás seguro de que deseas borrar este mensaje? Esta acción no se puede deshacer.')) {
      try {
        await messagesService.borrarMensaje(mensajeId);
        setMessage({ type: true, message: 'Mensaje eliminado correctamente' });
        await cargarMensajes(); // Esperamos a que se actualice la lista
      } catch (error) {
        console.error('Error en handleBorrarMensaje:', error);
        setMessage({ 
          type: false, 
          message: error.response?.data?.error || 
                   error.response?.data?.details || 
                   'Error al eliminar el mensaje'
        });
      } finally {
        setTimeout(() => setMessage(null), 5000);
      }
    }
  };

  const handleEditarMensaje = async (e) => {
    e.preventDefault();
    try {
      if (!mensajeEditando.asunto.trim() || !mensajeEditando.contenido.trim()) {
        setMessage({ type: false, message: 'El asunto y el contenido son requeridos' });
        return;
      }
      await messagesService.editarMensaje(mensajeEditando.id, {
        asunto: mensajeEditando.asunto.trim(),
        contenido: mensajeEditando.contenido.trim()
      });
      setMessage({ type: true, message: 'Mensaje actualizado correctamente' });
      setMensajeEditando(null);
      cargarMensajes();
    } catch (error) {
      setMessage({ 
        type: false, 
        message: error.response?.data?.error || 'Error al actualizar el mensaje'
      });
    }
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="mensajes-container">
      <Menu user={user} />
      <h2>Centro de Mensajes</h2>
      <Notification message={message} />

      {user.Rol !== 'administrador' && (
        <form className="mensaje-form" onSubmit={handleEnviarMensaje}>
          <h3>Nuevo Mensaje</h3>
          <select
            value={nuevoMensaje.destinatarioId}
            onChange={(e) => setNuevoMensaje({...nuevoMensaje, destinatarioId: e.target.value})}
            required
          >
            <option value="">Seleccionar destinatario</option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.username} ({usuario.Rol})
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Asunto"
            value={nuevoMensaje.asunto}
            onChange={(e) => setNuevoMensaje({...nuevoMensaje, asunto: e.target.value})}
            required
          />
          <textarea
            placeholder="Mensaje"
            value={nuevoMensaje.contenido}
            onChange={(e) => setNuevoMensaje({...nuevoMensaje, contenido: e.target.value})}
            required
            rows={4}
          />
          <button type="submit">Enviar Mensaje</button>
        </form>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'recibidos' ? 'active' : ''}`}
          onClick={() => setActiveTab('recibidos')}
        >
          Mensajes Recibidos
        </button>
        <button
          className={`tab ${activeTab === 'enviados' ? 'active' : ''}`}
          onClick={() => setActiveTab('enviados')}
        >
          Mensajes Enviados
        </button>
      </div>

      <div className="mensajes-lista">
        {mensajes.length === 0 ? (
          <p>No hay mensajes {activeTab === 'recibidos' ? 'recibidos' : 'enviados'}.</p>
        ) : (
          mensajes.map((mensaje) => (
            <div key={mensaje.id} className={`mensaje-item ${!mensaje.leido && activeTab === 'recibidos' ? 'no-leido' : ''}`}>
              {mensajeEditando?.id === mensaje.id ? (
                <form onSubmit={handleEditarMensaje} className="mensaje-form-edit">
                  <input
                    type="text"
                    value={mensajeEditando.asunto}
                    onChange={(e) => setMensajeEditando({
                      ...mensajeEditando,
                      asunto: e.target.value
                    })}
                    required
                  />
                  <textarea
                    value={mensajeEditando.contenido}
                    onChange={(e) => setMensajeEditando({
                      ...mensajeEditando,
                      contenido: e.target.value
                    })}
                    required
                    rows={4}
                  />
                  <div className="edit-buttons">
                    <button type="submit">Guardar</button>
                    <button type="button" onClick={() => setMensajeEditando(null)}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="mensaje-header">
                    <span className="mensaje-asunto">{mensaje.asunto}</span>
                    <span className="mensaje-meta">
                      {activeTab === 'recibidos' ? 'De: ' : 'Para: '}
                      {activeTab === 'recibidos'
                        ? mensaje.remitente?.username || 'Usuario desconocido'
                        : mensaje.destinatario?.username || 'Usuario desconocido'}
                      {' '}
                  ({new Date(mensaje.createdAt).toLocaleString()})
                </span>
              </div>
              <div className="mensaje-contenido">{mensaje.contenido}</div>
              <div className="mensaje-acciones">
                {activeTab === 'recibidos' && !mensaje.leido && (
                  <button onClick={() => handleMarcarLeido(mensaje.id)}>
                    Marcar como leído
                  </button>
                )}
                {activeTab === 'enviados' && (
                  <button onClick={() => setMensajeEditando(mensaje)}>
                    Editar
                  </button>
                )}
                <button 
                  onClick={() => handleBorrarMensaje(mensaje.id)}
                  className="delete-button"
                >
                  Borrar
                </button>
              </div>
              </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Mensajes;