const { sequelize } = require('../db');
const Blog = require('./blog');
const User = require('./user');
const Contact = require('./contact');
const Tarea = require('./tarea');
const Mensaje = require('./mensajes');

// Define associations with CASCADE delete
Blog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

User.hasMany(Blog, {
  foreignKey: 'userId',
  as: 'blogs',
  onDelete: 'CASCADE',
  hooks: true
});

Tarea.belongsTo(User, {
  foreignKey: 'creadorId',
  as: 'autor',
  onDelete: 'CASCADE'
});

User.hasMany(Tarea, {
  foreignKey: 'creadorId',
  as: 'tareas',
  onDelete: 'CASCADE',
  hooks: true
});

// Asociaciones de mensajes con CASCADE delete
Mensaje.belongsTo(User, {
  foreignKey: 'remitenteId',
  as: 'remitente',
  targetKey: 'id',
  onDelete: 'CASCADE'
});

Mensaje.belongsTo(User, {
  foreignKey: 'destinatarioId',
  as: 'destinatario',
  targetKey: 'id',
  onDelete: 'CASCADE'
});

User.hasMany(Mensaje, {
  foreignKey: 'remitenteId',
  as: 'mensajesEnviados',
  onDelete: 'CASCADE',
  hooks: true
});

User.hasMany(Mensaje, {
  foreignKey: 'destinatarioId',
  as: 'mensajesRecibidos',
  onDelete: 'CASCADE',
  hooks: true
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Sync all models
const syncModels = async () => {
  try {
    // Primero sincronizar modelos sin dependencias
    await User.sync({ alter: true });
    console.log('User model synchronized');
    
    // Luego sincronizar modelos con dependencias
    await Promise.all([
      Blog.sync({ alter: true }),
      Contact.sync({ alter: true }),
      Tarea.sync({ alter: true }),
      Mensaje.sync({ alter: true })
    ]);
    
    console.log('All models synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing models:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  Blog,
  User,
  Contact,
  Tarea,
  Mensaje,
  testConnection,
  syncModels
};