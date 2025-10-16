import axios from 'axios'
import { BASE_URL } from './config'

let token = null

const setToken = newToken => {
  token = `Bearer ${newToken}`
}

const getAll = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/blogs`)
    return response.data
  } catch (error) {
    console.error('Error fetching blogs:', error)
    throw error
  }
}

export default { getAll, setToken }