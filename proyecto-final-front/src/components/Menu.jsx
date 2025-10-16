import { Link, useLocation } from "react-router-dom";

const Menu = ({ user }) => {
  const location = useLocation();
  const hasRoleView = ["administrador", "usuario", "profesor"].includes(user?.Rol);

  return (
    <nav>
      <ul>
        {!hasRoleView && <li><Link to="/">Servicios</Link></li>}
        {user?.Rol === "administrador" && <li><Link to="/Crear">Crear Usuario</Link></li>}
        {user?.Rol === "usuario" && <li><Link to="/Tareas-ver">Tareas</Link></li>}
        {user?.Rol === "profesor" && <li><Link to="/Tareas">Tareas</Link></li>}
        <li><Link to="/PYTHON-PLANET">INGRESO</Link></li>
        {!hasRoleView && <li><Link to="/sobre-nosotros">Sobre Nosotros</Link></li>}
        {!hasRoleView && <Link to="/contactanos">Contáctanos</Link>}
        {user?.Rol === "administrador" && <li><Link to="/ver-contactos">Ver Contactos</Link></li>}
        {hasRoleView && <li><Link to="/mensajes">Mensajes</Link></li>}
      </ul>
    </nav>
  );
};

export default Menu;
