const express = require('express');
const cors = require('cors');
const middleware = require('./utils/middleware');

// Import routers
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const contactsRouter = require('./controllers/contacts');
const tareasRouter = require('./controllers/tareasRouters');
const mensajesRouter = require('./controllers/mensajesRouter');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/tareas', tareasRouter);
app.use('/api/mensajes', middleware.tokenExtractor, middleware.userExtractor, mensajesRouter);

// Error handling
app.use(middleware.errorHandler);

module.exports = app;
