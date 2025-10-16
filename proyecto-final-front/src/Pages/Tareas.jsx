import { useState, useEffect } from 'react'
import { crearTarea, setToken, obtenerMisTareas } from '../services/tareasService'
import Menu from "../components/Menu"


const Tareas = ({ user }) => {
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [fechaLimite, setFechaLimite] = useState("")
  const [mensaje, setMensaje] = useState(null)
  const [tareas, setTareas] = useState([])
  const [errorTareas, setErrorTareas] = useState(null)
  const [preguntas, setPreguntas] = useState([{
    pregunta: '',
    opciones: [{ texto: '', esCorrecta: false }]
  }])

  useEffect(() => {
    if (user?.token) {
      console.log('Estableciendo token en Tareas:', user.token)
      setToken(user.token)
    }
  }, [user])

  // Modificar la validación de roles
  useEffect(() => {
    const cargarTareas = async () => {
      if (user?.token && user?.Rol === 'profesor') {
        try {
          const misTareas = await obtenerMisTareas()
          if (Array.isArray(misTareas)) {
            setTareas(misTareas)
            setErrorTareas(null)
          } else {
            console.error('La respuesta no es un array:', misTareas)
            setTareas([])
            setErrorTareas('No se pudieron cargar las tareas correctamente')
          }
        } catch (error) {
          console.error('Error al cargar tareas:', error)
          setTareas([])
          setMensaje("Error al cargar las tareas")
        }
      }
    }
    cargarTareas()
  }, [user?.token])

  const agregarPregunta = () => {
    setPreguntas([...preguntas, {
      pregunta: '',
      opciones: [{ texto: '', esCorrecta: false }]
    }])
  }

  const eliminarPregunta = (preguntaIndex) => {
    setPreguntas(preguntas.filter((_, index) => index !== preguntaIndex))
  }

  const actualizarPregunta = (preguntaIndex, campo, valor) => {
    const nuevasPreguntas = preguntas.map((pregunta, index) => {
      if (index === preguntaIndex) {
        return { ...pregunta, [campo]: valor }
      }
      return pregunta
    })
    setPreguntas(nuevasPreguntas)
  }

  const agregarOpcion = (preguntaIndex) => {
    const nuevasPreguntas = preguntas.map((pregunta, index) => {
      if (index === preguntaIndex) {
        return {
          ...pregunta,
          opciones: [...pregunta.opciones, { texto: '', esCorrecta: false }]
        }
      }
      return pregunta
    })
    setPreguntas(nuevasPreguntas)
  }

  const eliminarOpcion = (preguntaIndex, opcionIndex) => {
    const nuevasPreguntas = preguntas.map((pregunta, index) => {
      if (index === preguntaIndex) {
        return {
          ...pregunta,
          opciones: pregunta.opciones.filter((_, i) => i !== opcionIndex)
        }
      }
      return pregunta
    })
    setPreguntas(nuevasPreguntas)
  }

  const validarPregunta = (pregunta) => {
    if (!pregunta.pregunta?.trim()) {
      setMensaje("La pregunta es obligatoria")
      return false
    }

    if (!pregunta.opciones?.length) {
      setMensaje("Debe proporcionar al menos una opción")
      return false
    }

    for (const opcion of pregunta.opciones) {
      if (!opcion.texto?.trim()) {
        setMensaje("El texto de la opción es obligatorio")
        return false
      }
    }

    const tieneOpcionCorrecta = pregunta.opciones.some(opcion => opcion.esCorrecta)
    if (!tieneOpcionCorrecta) {
      setMensaje("Debe marcar al menos una opción como correcta")
      return false
    }

    return true
  }

  const validarFormulario = () => {
    // Validación del título
    if (!titulo.trim()) {
      setMensaje("El título es obligatorio")
      return false
    }

    // Validación de fecha límite
    if (!fechaLimite) {
      setMensaje("La fecha límite es obligatoria")
      return false
    }

    // Validación de preguntas
    if (!preguntas || preguntas.length === 0) {
      setMensaje("Debe proporcionar al menos una pregunta")
      return false
    }

    // Validar cada pregunta
    for (const pregunta of preguntas) {
      // Validar texto de la pregunta
      if (!pregunta.pregunta.trim()) {
        setMensaje("Cada pregunta debe tener un texto")
        return false
      }

      // Validar opciones
      if (!pregunta.opciones || pregunta.opciones.length < 2) {
        setMensaje("Cada pregunta debe tener al menos dos opciones")
        return false
      }

      // Validar que las opciones tengan texto
      const opcionesValidas = pregunta.opciones.filter(o => o.texto.trim())
      if (opcionesValidas.length < 2) {
        setMensaje("Cada pregunta debe tener al menos dos opciones con texto")
        return false
      }

      // Verificar que haya al menos una respuesta correcta
      const opcionesCorrectas = pregunta.opciones.filter(o => o.esCorrecta)
      if (opcionesCorrectas.length < 1) {
        setMensaje("Cada pregunta debe tener al menos una opción correcta")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Validaciones del lado del cliente
      if (!titulo.trim()) {
        setMensaje("❌ El título es obligatorio")
        return
      }

      if (!fechaLimite) {
        setMensaje("❌ La fecha límite es obligatoria")
        return
      }

      // Validar preguntas
      for (const pregunta of preguntas) {
        if (!pregunta.pregunta.trim()) {
          setMensaje("❌ Cada pregunta debe tener un texto")
          return
        }

        if (!pregunta.opciones || pregunta.opciones.length < 2) {
          setMensaje("❌ Cada pregunta debe tener al menos dos opciones")
          return
        }

        const opcionesValidas = pregunta.opciones.filter(o => o.texto.trim())
        if (opcionesValidas.length < 2) {
          setMensaje("❌ Cada pregunta debe tener al menos dos opciones con texto")
          return
        }

        const tieneOpcionCorrecta = pregunta.opciones.some(o => o.esCorrecta)
        if (!tieneOpcionCorrecta) {
          setMensaje("❌ Cada pregunta debe tener al menos una opción correcta")
          return
        }
      }

      const nuevaTarea = {
        titulo,
        descripcion,
        fechaLimite,
        preguntas
      }
      
      await crearTarea(nuevaTarea)
      setMensaje("✅ Tarea creada exitosamente")
      
      // Limpiar formulario
      setTitulo("")
      setDescripcion("")
      setFechaLimite("")
      setPreguntas([{
        pregunta: '',
        opciones: [{ texto: '', esCorrecta: false }]
      }])

      // Recargar después de un momento
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      console.error('Error al crear tarea:', error)
      setMensaje(`❌ ${error.response?.data?.error || error.message}`)
    }

    setTimeout(() => setMensaje(null), 4000)
  }

  // Modificar la función actualizarOpcion
  const actualizarOpcion = (preguntaIndex, opcionIndex, campo, valor) => {
    const nuevasPreguntas = preguntas.map((pregunta, pIndex) => {
      if (pIndex === preguntaIndex) {
        const nuevasOpciones = pregunta.opciones.map((opcion, oIndex) => {
          if (oIndex === opcionIndex) {
            return { ...opcion, [campo]: valor }
          }
          return opcion
        })
        return { ...pregunta, opciones: nuevasOpciones }
      }
      return pregunta
    })
    setPreguntas(nuevasPreguntas)
  }

  return (
    <div>
      <Menu user={user} />
      <h2>Gestión de Tareas</h2>
      {mensaje && (
        <p className={`mensaje ${mensaje.includes("❌") ? "messageerror" : "messagesuccess"}`}>
          {mensaje}
        </p>
      )}
      
      {user?.Rol === 'profesor' ? (
        <>
          <h3>Crear Nueva Tarea</h3>
          <form onSubmit={handleSubmit} className="tarea-form">
            <div>
              <label>Título: </label>
              <input
                type="text"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Descripción: </label>
              <textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
              />
            </div>
            <div>
              <label>Fecha Límite: </label>
              <input
                type="date"
                value={fechaLimite}
                onChange={e => setFechaLimite(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="preguntas-container">
              <h4>Preguntas:</h4>
              {preguntas.map((pregunta, preguntaIndex) => (
                <div key={preguntaIndex} className="pregunta-item">
                  <input
                    type="text"
                    value={pregunta.pregunta}
                    onChange={(e) => actualizarPregunta(preguntaIndex, 'pregunta', e.target.value)}
                    placeholder="Escribe la pregunta..."
                    required
                    className={!pregunta.pregunta.trim() ? 'invalid' : ''}
                  />
                  
                  <div className="opciones-lista">
                    {pregunta.opciones.map((opcion, opcionIndex) => (
                      <div key={opcionIndex} className="opcion-item">
                        <input
                          type="text"
                          value={opcion.texto}
                          onChange={(e) => actualizarOpcion(preguntaIndex, opcionIndex, 'texto', e.target.value)}
                          placeholder="Escribe la opción..."
                          required
                          className={!opcion.texto.trim() ? 'invalid' : ''}
                        />
                        <label>
                          <input
                            type="checkbox"
                            checked={opcion.esCorrecta}
                            onChange={(e) => actualizarOpcion(preguntaIndex, opcionIndex, 'esCorrecta', e.target.checked)}
                          /> Correcta
                        </label>
                        {pregunta.opciones.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => eliminarOpcion(preguntaIndex, opcionIndex)}
                            className="btn-eliminar"
                          >
                            Eliminar opción
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => agregarOpcion(preguntaIndex)}
                      className="btn-agregar"
                    >
                      + Agregar opción
                    </button>
                  </div>

                  {preguntas.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => eliminarPregunta(preguntaIndex)}
                      className="btn-eliminar-pregunta"
                    >
                      Eliminar pregunta
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={agregarPregunta}
                className="btn-agregar-pregunta"
              >
                + Agregar pregunta
              </button>
            </div>
            
            <button type="submit" className="btn-submit">Crear Tarea</button>
          </form>

          <h3>Mis Tareas</h3>
          {errorTareas ? (
            <p className="error-message">{errorTareas}</p>
          ) : tareas.length === 0 ? (
            <p>No hay tareas disponibles</p>
          ) : (
            <ul>
              {tareas.map(tarea => (
                <li key={tarea.id}>
                  <h4>{tarea.titulo}</h4>
                  <p>{tarea.descripcion}</p>
                  <p>Fecha límite: {new Date(tarea.fechaLimite).toLocaleDateString()}</p>
                  <p>Estado: {tarea.completada ? 'Completada' : 'Pendiente'}</p>
                  <p>Creado por: {tarea.nombreCreador}</p>
                  <p>Rol: {tarea.userInfo?.Rol}</p>
                  {tarea.respuesta && <p>Respuesta: {tarea.respuesta}</p>}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p>No tienes permisos para crear tareas. Solo los profesores pueden crear tareas.</p>
      )}
    </div>
  )
}

export default Tareas
