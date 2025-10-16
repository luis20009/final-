import { useState, useEffect, useRef } from 'react'
import blogService from '../services/blogs'
import LoginForm from '../components/Login'
import loginService from '../services/login'
import Notification from '../components/Notification'
import Menu from "../components/Menu"
import { setToken as setTareasToken } from '../services/tareasService'
import messagesService from '../services/messagesService'

const Contactanos = ({ user: userProp, setUser: setUserProp }) => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    blogService
      .getAll()
      .then(blogs => {
        setBlogs(blogs)
      })
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const userData = await loginService.login({ 
        username, 
        password
      })

      const userToSave = {
        username: userData.username,
        name: userData.name,
        token: userData.token,
        Rol: userData.Rol || userData.rol, // Aceptar ambas versiones
        id: userData.userId
      }

      window.localStorage.setItem(
        'loggedBlogappUser', 
        JSON.stringify(userToSave)
      )

      blogService.setToken(userData.token)
      setTareasToken(userData.token)
      messagesService.setToken(userData.token)
      setUserProp(userToSave)
      setUsername('')
      setPassword('')
      
      setMessage({
        message: `Bienvenido ${userData.name}`,
        type: true
      })

    } catch (error) {
      console.error('Error en login:', error)
      setMessage({
        message: error.response?.data?.error || 'Error en el inicio de sesión',
        type: false
      })
    }
    setTimeout(() => setMessage(null), 5000)
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUserProp(null)
    blogService.setToken(null)
    setTareasToken(null)
  }

  // Funciones faltantes para el manejo de blogs
  const addBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      setMessage({
        message: `A new blog ${returnedBlog.title} by ${returnedBlog.author} added`,
        type: true
      })
    } catch (error) {
      setMessage({
        message: error.response.data.error,
        type: false
      })
    }
    setTimeout(() => setMessage(null), 5000)
  }

  const updatedBlog = async (id, blogObject) => {
    try {
      const returnedBlog = await blogService.update(id, blogObject)
      setBlogs(blogs.map(blog => blog.id !== id ? blog : returnedBlog))
    } catch (error) {
      setMessage({
        message: error.response.data.error,
        type: false
      })
    }
  }

  const deleteBlog = async (id) => {
    try {
      await blogService.remove(id)
      setBlogs(blogs.filter(blog => blog.id !== id))
    } catch (error) {
      setMessage({
        message: error.response.data.error,
        type: false
      })
    }
  }

  // Ordenar blogs por likes
  const orderBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

return (
  <div>
    {!userProp ? (
      <div>
        <Menu user={userProp}/>
        <LoginForm
          handleLogin={handleLogin}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          message={message}
        />
      </div>
    ) : (
        <>
          <Menu user={userProp}/>
          <h2>BIENVENIDO</h2>
          <Notification message={message} />
          <p>
            {userProp.name} ({userProp.Rol}) conectado{' '}
            <button onClick={handleLogout}>Cerrar sesión</button>
          </p>
        </>
      )}
    </div>
  )
}

export default Contactanos