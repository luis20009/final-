import { useState, useEffect } from 'react'
import AppRoutes from "./ROUTS/AppRouts"

const App = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
    }
  }, [])

  return <AppRoutes user={user} setUser={setUser} />
}

export default App