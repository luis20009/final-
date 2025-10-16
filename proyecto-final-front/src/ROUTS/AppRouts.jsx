import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Servicios from "../Pages/Servicios";
import Contactanos from "../Pages/Contactanos";
import SobreNosotros from "../Pages/SobreNosotros";
import Crear from "../Pages/Crear-usuarios";
import Tareas from "../Pages/Tareas";
import VerTareas from "../Pages/Ver-Tareas";
import Callme from "../Pages/Contactanos copy";
import VerContacts from "../Pages/ver-contacts";
import Mensajes from "../Pages/Mensajes";

const AppRoutes = ({ user, setUser }) => (
  <Router>
    <Routes>
      <Route path="/" element={<Servicios user={user} />} />
      <Route path="/PYTHON-PLANET" element={<Contactanos user={user} setUser={setUser} />} />
      <Route path="/sobre-nosotros" element={<SobreNosotros user={user} />} />
      <Route path="/Tareas" element={<Tareas user={user} />} />
      <Route path="/Tareas-ver" element={<VerTareas user={user} />} />
      <Route path="/Crear" element={<Crear user={user} />} />
      <Route path="/contactanos" element={<Callme />} />
      <Route 
        path="/ver-contactos" 
        element={user?.Rol === 'administrador' ? <VerContacts user={user} /> : <Servicios user={user} />} 
      />
      <Route 
        path="/mensajes" 
        element={user ? <Mensajes user={user} /> : <Servicios user={user} />} 
      />
    </Routes>
  </Router>
);

export default AppRoutes;
