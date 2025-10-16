// src/services/userService.js
import axios from 'axios'
import { BASE_URL } from './config'

const baseUrl = `${BASE_URL}/users`

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const createUser = async userData => {
  const response = await axios.post(baseUrl, userData)
  return response.data
}

const getMakers = async () => {
  const response = await axios.get(`${baseUrl}/makers`)
  return response.data
}

const deleteUser = async (id) => {
  try {
    await axios.delete(`${baseUrl}/${id}`)
    return true
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Usuario no encontrado')
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    } else {
      throw new Error('Error al eliminar el usuario y sus datos asociados')
    }
  }
}

const updateUserRole = async (id, newRole) => {
  const response = await axios.put(`${baseUrl}/${id}/role`, { Rol: newRole })
  return response.data
}

const checkUserInfo = async (info) => {
  const response = await axios.post(`${baseUrl}/check`, info)
  return response.data
}



export default {
  getAll,
  createUser,
  getMakers,
  updateUserRole,
  checkUserInfo,
  deleteUser
}