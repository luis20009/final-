const blogsRouter = require('express').Router()
const { Blog, User } = require('../models')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['username', 'name']
      }],
      order: [['createdAt', 'DESC']]
    })
    response.json(blogs)
  } catch (error) {
    console.error('Error getting blogs:', error)
    response.status(500).json({ error: 'Error al obtener blogs', details: error.message })
  }
})

blogsRouter.put('/:id/likes', userExtractor, async (request, response) => {
  const { likes } = request.body

  try {
    const blog = await Blog.findByPk(request.params.id)
    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' })
    }

    blog.likes = likes
    const updatedBlog = await blog.save()
    const populatedBlog = await updatedBlog.populate('user', { username: 1, name: 1 })
    
    response.json(populatedBlog)
  } catch (error) {
    response.status(500).json({ error: 'Server error' })
  }
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const { title, content, url, tags } = request.body
  const user = request.user

  if (!title || !content) {
    return response.status(400).json({ error: 'title and content are required' })
  }

  const blog = new Blog({
    title,
    content,
    url,
    tags: tags || [],
    author: user.name,
    likes: 0,
    user: user._id,
    comments: []
  })

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    
    const populatedBlog = await savedBlog.populate('user', { username: 1, name: 1 })
    response.status(201).json(populatedBlog)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

blogsRouter.post('/:id/comments', userExtractor, async (request, response) => {
  const { comment } = request.body
  
  try {
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' })
    }

    blog.comments.push({ text: comment, user: request.user._id })
    const updatedBlog = await blog.save()
    const populatedBlog = await updatedBlog.populate('user', { username: 1, name: 1 })
    
    response.json(populatedBlog)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

blogsRouter.get('/:id', async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id)
      .populate('user', { username: 1, name: 1 })
      .populate('comments.user', { username: 1, name: 1 })
    
    if (blog) {
      response.json(blog)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  try {
    const user = request.user
    const blog = await Blog.findById(request.params.id)
    
    if (!blog) {
      return response.status(404).json({ error: 'blog not found' })
    }

    if (blog.user.toString() !== user._id.toString()) {
      return response.status(403).json({ error: 'only the creator can delete the blog' })
    }

    await blog.deleteOne()
    user.blogs = user.blogs.filter(b => b.toString() !== blog._id.toString())
    await user.save()
    
    response.status(204).end()
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

module.exports = blogsRouter
