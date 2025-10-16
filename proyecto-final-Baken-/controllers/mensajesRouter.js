const mensajesRouter = require('express').Router();
const { Sequelize, Op } = require('sequelize');
const Mensaje = require('../models/mensajes');
const User = require('../models/user');
const { sequelize } = require('../db');

// Get mensajes recibidos
mensajesRouter.get('/recibidos', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Token missing or invalid' });
    }
    const mensajes = await Mensaje.findAll({
      where: { destinatarioId: req.user.id },
      include: [
        { model: User, as: 'remitente', attributes: ['username', 'Rol'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(mensajes);
  } catch (error) {
    console.error('Error en /recibidos:', error);
    res.status(500).json({ error: error.message || 'Error al obtener los mensajes' });
  }
});

// Get mensajes enviados
mensajesRouter.get('/enviados', async (req, res) => {
  try {
    const mensajes = await Mensaje.findAll({
      where: { remitenteId: req.user.id },
      include: [
        { model: User, as: 'destinatario', attributes: ['username', 'Rol'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(mensajes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los mensajes' });
  }
});

// Enviar un mensaje
mensajesRouter.post('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Token missing or invalid' });
    }

    const { contenido, asunto, destinatarioId } = req.body;

    if (!contenido || !asunto || !destinatarioId) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Verificar que el destinatario existe
    const destinatario = await User.findByPk(destinatarioId);
    if (!destinatario) {
      return res.status(404).json({ error: 'Usuario destinatario no encontrado' });
    }

    // Verificar permisos según roles
    const remitente = await User.findByPk(req.user.id);
    if (!remitente) {
      return res.status(404).json({ error: 'Usuario remitente no encontrado' });
    }

    // Validar permisos según roles
    if (remitente.Rol === 'usuario' && !['profesor', 'administrador'].includes(destinatario.Rol)) {
      return res.status(403).json({ error: 'No tienes permiso para enviar mensajes a este usuario' });
    }
    if (remitente.Rol === 'profesor' && destinatario.Rol !== 'administrador') {
      return res.status(403).json({ error: 'Los profesores solo pueden enviar mensajes a administradores' });
    }
    if (remitente.Rol === 'administrador') {
      return res.status(403).json({ error: 'Los administradores no pueden enviar mensajes' });
    }

    // Verificar permisos según roles
    const rolRemitente = req.user.Rol;
    const rolDestinatario = destinatario.Rol;

    const mensaje = await Mensaje.create({
      contenido,
      asunto,
      remitenteId: req.user.id,
      destinatarioId
    });

    const mensajeConDetalles = await Mensaje.findByPk(mensaje.id, {
      include: [
        { model: User, as: 'remitente', attributes: ['username', 'Rol'] },
        { model: User, as: 'destinatario', attributes: ['username', 'Rol'] }
      ]
    });

    res.status(201).json(mensajeConDetalles);
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

// Editar un mensaje
mensajesRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { asunto, contenido } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Token missing or invalid' });
    }

    const mensaje = await Mensaje.findOne({
      where: { 
        id,
        remitenteId: req.user.id // Solo el remitente puede editar sus mensajes
      }
    });

    if (!mensaje) {
      return res.status(404).json({ error: 'Mensaje no encontrado o no tienes permiso para editarlo' });
    }

    await mensaje.update({
      asunto,
      contenido
    });

    const mensajeActualizado = await Mensaje.findByPk(id, {
      include: [
        { model: User, as: 'remitente', attributes: ['username', 'Rol'] },
        { model: User, as: 'destinatario', attributes: ['username', 'Rol'] }
      ]
    });

    res.json(mensajeActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el mensaje' });
  }
});

// Marcar mensaje como leído
mensajesRouter.put('/:id/leer', async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Token missing or invalid' });
    }

    const mensaje = await Mensaje.findOne({
      where: { 
        id,
        destinatarioId: req.user.id,
        leido: false
      }
    });

    if (!mensaje) {
      return res.status(404).json({ error: 'Mensaje no encontrado o ya está marcado como leído' });
    }

    await mensaje.update({ leido: true });

    const mensajeActualizado = await Mensaje.findByPk(id, {
      include: [
        { model: User, as: 'remitente', attributes: ['username', 'Rol'] },
        { model: User, as: 'destinatario', attributes: ['username', 'Rol'] }
      ]
    });

    res.json(mensajeActualizado);
  } catch (error) {
    console.error('Error al marcar mensaje como leído:', error);
    res.status(500).json({ error: 'Error al marcar el mensaje como leído' });
  }
});

// Borrar un mensaje
mensajesRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Token missing or invalid' });
    }

    const mensaje = await Mensaje.findOne({
      where: { 
        id,
        [Op.or]: [
          { remitenteId: req.user.id },
          { destinatarioId: req.user.id }
        ]
      }
    });

    if (!mensaje) {
      return res.status(404).json({ error: 'Mensaje no encontrado o no tienes permiso para borrarlo' });
    }

    try {
      await mensaje.destroy();
      res.status(204).end();
    } catch (deleteError) {
      console.error('Error al eliminar mensaje:', deleteError);
      return res.status(500).json({ 
        error: 'Error al eliminar el mensaje',
        details: deleteError.message 
      });
    }

    await mensaje.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el mensaje' });
  }
});

// Marcar mensaje como leído
mensajesRouter.put('/:id/leer', async (req, res) => {
  try {
    const mensaje = await Mensaje.findByPk(req.params.id);
    
    if (!mensaje) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    if (mensaje.destinatarioId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para marcar este mensaje como leído' });
    }

    mensaje.leido = true;
    await mensaje.save();

    res.json(mensaje);
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar el mensaje como leído' });
  }
});

module.exports = mensajesRouter;