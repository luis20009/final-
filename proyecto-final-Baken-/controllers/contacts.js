const contactRouter = require('express').Router()
const { Contact } = require('../models')

contactRouter.get('/', async (request, response) => {
  try {
    console.log('Obteniendo contactos...');
    const contacts = await Contact.findAll({
      order: [['createdAt', 'DESC']]
    });
    console.log('Contactos encontrados:', contacts);
    response.json(contacts);
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    response.status(500).json({ 
      error: 'Server error', 
      details: error.message,
      stack: error.stack 
    });
  }
})

contactRouter.get('/:id', async (request, response) => {
  try {
    const contact = await Contact.findByPk(request.params.id)
    if (contact) {
      response.json(contact)
    } else {
      response.status(404).json({ error: 'Contact not found' })
    }
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

contactRouter.post('/', async (request, response) => {
  try {
    const { username, name, number, email, comments } = request.body

    if (!username || !name || !number || !email) {
      return response.status(400).json({ error: 'username, name, number, and email are required' })
    }

    // Verificar si ya existe un contacto con ese email
    const existingContact = await Contact.findOne({ where: { email } })
    if (existingContact) {
      return response.status(400).json({ error: 'Este correo electrónico ya está registrado' })
    }

    // Crear el nuevo contacto
    const contact = await Contact.create({
      username,
      name,
      number, 
      email,
      comments: comments || '',
      createdAt: new Date()
    })

    response.status(201).json(contact)
  } catch (error) {
    console.error('Error al crear contacto:', error)
    response.status(500).json({ error: error.message })
  }
})

contactRouter.delete('/:id', async (request, response) => {
  try {
    const result = await Contact.destroy({
      where: {
        id: request.params.id
      }
    })
    if (result > 0) {
      response.status(204).end()
    } else {
      response.status(404).json({ error: 'Contact not found' })
    }
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

contactRouter.put('/:id', async (request, response) => {
  const { username, name, number, email, comments } = request.body

  if (!username || !name || !number) {
    return response.status(400).json({ error: 'username, name and number are required' })
  }

  const contactToUpdate = {
    username,
    name,
    number,
    email,
    comments: comments || ''
  }

  try {
    const [updated] = await Contact.update(contactToUpdate, {
      where: { id: request.params.id }
    })
    
    if (updated) {
      const updatedContact = await Contact.findByPk(request.params.id)
      response.json(updatedContact)
    } else {
      response.status(404).json({ error: 'Contact not found' })
    }
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

module.exports = contactRouter
