const { Sequelize } = require('sequelize')
const config = require('./utils/config')

const sequelize = new Sequelize(
  config.DATABASE_CONFIG.database,
  config.DATABASE_CONFIG.username,
  config.DATABASE_CONFIG.password,
  {
    host: config.DATABASE_CONFIG.host,
    dialect: config.DATABASE_CONFIG.dialect,
    port: config.DATABASE_CONFIG.port,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
)

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connection has been established successfully.')
    
    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: true })
    console.log('All models were synchronized successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    process.exit(1)
  }
}

module.exports = { sequelize, connectDB }