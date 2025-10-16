const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../db');

class Mensaje extends Model {}

Mensaje.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  asunto: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  leido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  remitenteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
      onDelete: 'CASCADE'
    }
  },
  destinatarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
      onDelete: 'CASCADE'
    }
  }
}, {
  sequelize,
  modelName: 'mensaje',
  tableName: 'mensajes',
  timestamps: true,
  underscored: true
});

module.exports = Mensaje;
