const { sequelize } = require('../db');
const { User, Blog, Contact, Tarea } = require('../models');
const logger = require('./logger');
const bcrypt = require('bcrypt');

const setupDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    
    // Crear usuarios iniciales
    await User.bulkCreate([
      {
        username: 'administrador',
        name: 'Administrador Principal',
        email: 'admin@example.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        Rol: 'administrador'
      },
      {
        username: 'profesor1',
        name: 'Profesor Demo',
        email: 'profesor@example.com',
        passwordHash: await bcrypt.hash('profesor123', 10),
        Rol: 'profesor'
      },
      {
        username: 'usuario1',
        name: 'Usuario Demo',
        email: 'usuario@example.com',
        passwordHash: await bcrypt.hash('usuario123', 10),
        Rol: 'usuario'
      }
    ]);

    logger.info('Usuarios iniciales creados correctamente');
  } catch (error) {
    logger.error('Error en la configuración:', error);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}