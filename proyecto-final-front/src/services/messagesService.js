import axios from 'axios';
import { BASE_URL } from './config';

const baseUrl = `${BASE_URL}/mensajes`;

let token = null;

const setToken = newToken => {
  token = newToken ? `Bearer ${newToken}` : null;
};

const getMensajesRecibidos = async () => {
  const config = {
    headers: { Authorization: token }
  };
  const response = await axios.get(`${baseUrl}/recibidos`, config);
  return response.data;
};

const getMensajesEnviados = async () => {
  const config = {
    headers: { Authorization: token }
  };
  const response = await axios.get(`${baseUrl}/enviados`, config);
  return response.data;
};

const enviarMensaje = async (mensaje) => {
  const config = {
    headers: { Authorization: token }
  };
  const response = await axios.post(baseUrl, mensaje, config);
  return response.data;
};

const marcarComoLeido = async (mensajeId) => {
  const config = {
    headers: { Authorization: token }
  };
  const response = await axios.put(`${baseUrl}/${mensajeId}/leer`, {}, config);
  return response.data;
};

const editarMensaje = async (mensajeId, mensajeActualizado) => {
  const config = {
    headers: { Authorization: token }
  };
  const response = await axios.put(`${baseUrl}/${mensajeId}`, mensajeActualizado, config);
  return response.data;
};

const borrarMensaje = async (mensajeId) => {
  try {
    const config = {
      headers: { Authorization: token }
    };
    await axios.delete(`${baseUrl}/${mensajeId}`, config);
  } catch (error) {
    console.error('Error al borrar mensaje:', error.response?.data || error);
    throw error;
  }
};

export default {
  setToken,
  getMensajesRecibidos,
  getMensajesEnviados,
  enviarMensaje,
  marcarComoLeido,
  editarMensaje,
  borrarMensaje
};