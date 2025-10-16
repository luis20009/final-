const app = require('./app');
const { sequelize } = require('./db');
const config = require('./utils/config');
const logger = require('./utils/logger');
const { User, Blog, Contact, Tarea } = require('./models');

const start = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connected successfully');

    // Sync tables without forcing recreation
    await sequelize.sync({ force: false, alter: false });
    logger.info('Database tables synchronized');

    // Start server
    app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

start();