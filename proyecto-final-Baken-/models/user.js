const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Debe ser un correo electrónico válido'
      }
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Rol: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'usuario',
    validate: {
      isIn: {
        args: [['usuario', 'profesor', 'administrador']],
        msg: 'Rol debe ser: usuario, profesor o administrador'
      }
    }
  }
}, {
  tableName: 'Users', // Match the table name in foreign key references
  timestamps: true
});

module.exports = User;