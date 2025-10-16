require('dotenv').config();

const config = {
  PORT: process.env.PORT || 3001,
  DATABASE_CONFIG: {
    username: 'postgres',
    password: 'jhoan',
    dialect: 'postgres',
    host: 'localhost',
    dialect: 'postgres',
    port: 5432
  },
  SECRET: process.env.SECRET || 'tu_clave_secreta'
};

module.exports = config;
