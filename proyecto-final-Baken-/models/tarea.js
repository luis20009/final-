const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Tarea = sequelize.define('Tarea', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fechaLimite: {
    type: DataTypes.DATE,
    allowNull: false
  },
  preguntas: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('preguntas');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('preguntas', JSON.stringify(value || []));
    }
  },
  creadorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'tareas',
  timestamps: true
});

module.exports = Tarea;
