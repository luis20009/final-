const usersRouter = require('express').Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { sequelize } = require('../db');

// Get all users
usersRouter.get('/', async (request, response) => {
  try {
    const users = await User.findAll({
      where: {},
      attributes: ['id', 'username', 'name', 'email', 'Rol']
    });
    response.json(users);
  } catch (error) {
    response.status(500).json({ error: 'Error retrieving users' });
  }
});

const validRoles = ['usuario', 'profesor', 'administrador'];

// Create new user
usersRouter.post('/', async (request, response) => {
  try {
    const { username, name, email, password, Rol } = request.body;

    // Validate required fields
    if (!username || !password || !name || !email) {
      return response.status(400).json({
        error: 'El usuario, contraseña, nombre y correo son requeridos'
      });
    }

    // Validate role
    if (!validRoles.includes(Rol)) {
      return response.status(400).json({
        error: 'Rol inválido. Debe ser: usuario, profesor o administrador'
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Check if username or email already exists
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return response.status(400).json({
        error: 'El nombre de usuario ya está en uso',
        field: 'username'
      });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return response.status(400).json({
        error: 'El correo electrónico ya está registrado',
        field: 'email'
      });
    }

    const user = await User.create({
      username,
      name,
      email,
      passwordHash,
      Rol
    });

    response.status(201).json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      Rol: user.Rol
    });
  } catch (error) {
    console.error('Error creating user:', error);
    response.status(400).json({
      error: error.message
    });
  }
});

// Delete user
usersRouter.delete('/:id', async (request, response) => {
  try {
    const id = request.params.id;
    
    // Buscamos el usuario con todas sus relaciones
    const user = await User.findByPk(id);

    if (!user) {
      return response.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    console.log('Iniciando eliminación de usuario:', id);
    
    // La eliminación en cascada se manejará automáticamente gracias a las configuraciones en los modelos
    await user.destroy();
    
    console.log('Usuario y registros relacionados eliminados correctamente');
    response.status(204).end();
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    response.status(500).json({
      error: 'Error al eliminar el usuario y sus datos asociados',
      details: error.message
    });
  }
});

// Check if user information exists
usersRouter.post('/check', async (request, response) => {
  try {
    const { username, email } = request.body;
    const checks = {};

    if (username) {
      const existingUsername = await User.findOne({ where: { username } });
      checks.username = !!existingUsername;
    }

    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      checks.email = !!existingEmail;
    }

    response.json({
      exists: checks,
      message: {
        username: checks.username ? 'El nombre de usuario ya está en uso' : null,
        email: checks.email ? 'El correo electrónico ya está registrado' : null
      }
    });
  } catch (error) {
    console.error('Error checking user information:', error);
    response.status(500).json({
      error: 'Error al verificar la información del usuario'
    });
  }
});

// Update user role
usersRouter.put('/:id/role', async (request, response) => {
  try {
    const { id } = request.params;
    const { Rol } = request.body;

    // Validate role
    if (!validRoles.includes(Rol)) {
      return response.status(400).json({
        error: 'Rol inválido. Debe ser: usuario, profesor o administrador'
      });
    }

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return response.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Update role
    user.Rol = Rol;
    await user.save();

    // Return updated user
    response.json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      Rol: user.Rol
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    response.status(500).json({
      error: 'Error al actualizar el rol del usuario'
    });
  }
});

module.exports = usersRouter;