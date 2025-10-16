const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const { User } = require('../models')
const config = require('../utils/config')

loginRouter.post('/', async (request, response) => {
  try {
    const { username, password } = request.body

    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'name', 'passwordHash', 'Rol']
    })

    const passwordCorrect = user === null
      ? false
      : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
      return response.status(401).json({
        error: 'Usuario o contraseña inválidos'
      })
    }

    const userForToken = {
      username: user.username,
      id: user.id,
      Rol: user.Rol
    }

    const token = jwt.sign(userForToken, config.SECRET, { expiresIn: '24h' })

    response.status(200).json({
      token,
      username: user.username,
      name: user.name,
      Rol: user.Rol,
      userId: user.id // Añadido explícitamente
    })

  } catch (error) {
    console.error('Error en login:', error)
    response.status(500).json({ error: 'Error en el servidor' })
  }
})

module.exports = loginRouter