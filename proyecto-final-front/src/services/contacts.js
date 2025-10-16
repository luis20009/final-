import axios from 'axios'
import { BASE_URL } from './config'

const baseUrl = `${BASE_URL}/contacts` // La ruta completa será http://localhost:3001/api/contacts

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const getMine = async () => {
  const response = await axios.get(`${baseUrl}/mis-tareas`)
  return response.data
}

const create = async newObject => {
  try {
    const response = await axios.post(baseUrl, newObject)
    return response.data
  } catch (error) {
    // Manejar errores específicos del servidor
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    // Manejar errores de red u otros errores
    console.error('Error al crear contacto:', error);
    throw new Error('Error al crear el contacto. Por favor, intente nuevamente.');
  }
}

const update = async (id, newObject) => {
  try {
    const response = await axios.put(`${baseUrl}/${id}`, newObject)
    return response.data
  } catch (error) {
    console.error('Error al actualizar contacto:', error.response?.data || error.message)
    throw error
  }
}

const remove = async (id) => {
  try {
    const response = await axios.delete(`${baseUrl}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error al eliminar contacto:', error.response?.data || error.message)
    throw error
  }
}

export default { getAll, create, update, remove }