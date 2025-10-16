import axios from 'axios'
import { BASE_URL } from './config'

const login = async credentials => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, credentials)
    return {
      ...response.data,
      userId: response.data.userId || response.data.id
    }
  } catch (error) {
    throw error
  }
}

export default { login }