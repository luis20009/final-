import { useState, useEffect } from "react"
import { obtenerMisTareas, setToken, responderTarea } from "../services/tareasService"
import Menu from '../components/Menu'

const VerTareas = ({ user }) => {
  const [tareas, setTareas] = useState([])
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    if (user?.token) {
      setToken(user.token)
    }
  }, [user])

  useEffect(() => {
    const cargarTareas = async () => {
      if (user?.token && user?.Rol === 'usuario') {
        try {
          const misTareas = await obtenerMisTareas()
          if (Array.isArray(misTareas)) {
            setTareas(misTareas)
            if (misTareas.length === 0) {
              setMensaje("No hay tareas disponibles")
            }
          } else {
            console.error('La respuesta no es un array:', misTareas)
            setMensaje("Error al cargar las tareas")
          }
        } catch (error) {
          console.error('Error al cargar tareas:', error)
          setMensaje("Error al cargar las tareas")
        }
      }
    }
    cargarTareas()
  }, [user?.token])

  const handleResponderPregunta = async (tareaId, preguntaIndex, respuestaIndex) => {
    try {
      const tareaActualizada = await responderTarea(tareaId, preguntaIndex, respuestaIndex)
      
      if (tareaActualizada) {
        // Actualizar la lista de tareas con la respuesta
        setTareas(tareas.map(tarea =>
          tarea.id === tareaId ? tareaActualizada : tarea
        ))

        // Verificar si la respuesta es correcta
        const pregunta = tareaActualizada.preguntas[preguntaIndex]
        const respuestaUsuario = pregunta.respuestas?.find(r => r.usuarioId === user.id)
        const esCorrecta = pregunta.opciones[respuestaUsuario?.seleccion]?.esCorrecta

        setMensaje(esCorrecta ? "¡Correcto! 🎉" : "Incorrecto. Inténtalo de nuevo 😟")
      }
    } catch (error) {
      console.error('Error al responder:', error)
      setMensaje(error?.response?.data?.error || "Error al enviar la respuesta")
    }
    setTimeout(() => setMensaje(null), 3000)
  }

  const tareasPendientes = tareas.filter(tarea => {
    // Asegurémonos de que la tarea tenga preguntas
    const preguntas = Array.isArray(tarea.preguntas) ? tarea.preguntas : []
    if (preguntas.length === 0) return false

    // Verificar respuestas del usuario
    const respuestasUsuario = preguntas.map(p => 
      Array.isArray(p.respuestas) ? p.respuestas.find(r => r.usuarioId === user.id) : null
    )
    const haRespondidoTodas = respuestasUsuario.every(r => r && r.seleccion !== undefined)

    // Filtrar por fecha: solo mostrar si la fecha límite es hoy o en el futuro
    const hoy = new Date()
    hoy.setHours(0,0,0,0) // Ignorar la hora
    const fechaLimite = new Date(tarea.fechaLimite)
    fechaLimite.setHours(0,0,0,0)

    return !haRespondidoTodas && fechaLimite >= hoy
  })
  return (
    <div className="tareas-container">
      <Menu user={user} />
      <h2>Mis Tareas Asignadas</h2>
      {mensaje && (
        <p className={`mensaje ${mensaje.includes("Error") ? "error" : "success"}`}>
          {mensaje}
        </p>
      )}

      {user?.Rol === 'usuario' ? (
        tareasPendientes.length === 0 ? (
          <p className="sin-tareas">🎉 ¡Todas tus tareas están completadas!</p>
        ) : (
          <ul className="tareas-lista">
            {tareasPendientes.map(tarea => (
              <li key={tarea.id} className="tarea-item">
                <div className="tarea-header">
                  <h3>{tarea.titulo}</h3>
                  <span className="estado pendiente">Pendiente</span>
                </div>
                <p className="descripcion">{tarea.descripcion}</p>
                <p className="fecha">Fecha límite: {new Date(tarea.fechaLimite).toLocaleDateString()}</p>
                <p className="profesor">Asignado por: {tarea.nombreCreador}</p>

                <div className="preguntas-container">
                  {tarea.preguntas?.map((pregunta, preguntaIndex) => {
                    const respuestaUsuario = pregunta.respuestas?.find(r => r.usuarioId === user.id)

                    return (
                      <div key={preguntaIndex} className="pregunta-item">
                        <h4>Pregunta {preguntaIndex + 1}: {pregunta.pregunta}</h4>
                        <div className="opciones-lista">
                          {pregunta.opciones.map((opcion, opcionIndex) => (
                            <button
                              key={opcionIndex}
                              onClick={() => handleResponderPregunta(tarea.id, preguntaIndex, opcionIndex)}
                              disabled={!!respuestaUsuario}
                              className={`opcion-btn ${
                                respuestaUsuario?.seleccion === opcionIndex ? 'respondida' : ''
                              }`}
                            >
                              {opcion.texto}
                            </button>
                          ))}
                        </div>
                        {respuestaUsuario && (
                          <p className="respuesta-info">
                            Tu respuesta: {pregunta.opciones[respuestaUsuario.seleccion]?.texto}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : (
        <p className="no-permisos">No tienes permisos para ver las tareas</p>
      )}
    </div>
  )

}
export default VerTareas
