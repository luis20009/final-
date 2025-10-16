import Menu from "../components/Menu";
import { useState, useEffect } from "react"
import contactsService from "../services/contacts"
import ContactList from "../components/ContactList"
import ContactForm from "../components/ContactForm";


const Callme = () => {
  const [username, setUsername] = useState("");
  const [nombre, setNombre] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [correo, setCorreo] = useState("");
  const [contactos, setContactos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [rol, setRol] = useState("usuario");

  // Obtener contactos al cargar el componente
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await contactsService.getAll();
        setContactos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al obtener contactos:", err);
        setContactos([]);
      }
    };
    
    fetchContacts();
  }, []);

  // Agregar un nuevo contacto
  const agregar = async (e) => {
    e.preventDefault();
    try {
      // Validar todos los campos requeridos según el backend
      if (!username.trim()) {
        alert("Por favor, ingresa un nombre de usuario.");
        return;
      }
      if (!nombre.trim()) {
        alert("Por favor, ingresa tu nombre completo.");
        return;
      }
      if (!contraseña.trim()) {
        alert("Por favor, ingresa una contraseña.");
        return;
      }
      if (!correo.trim()) {
        alert("Por favor, ingresa un correo electrónico.");
        return;
      }

      // Verificar si el nombre de usuario ya existe
      const usernameExists = contactos.some(
        contact => contact.username?.toLowerCase() === username.trim().toLowerCase()
      );
      const correoExists = contactos.some(
        contact => contact.email?.toLowerCase() === correo.trim().toLowerCase()
      );

      if (usernameExists) {
        alert("Este nombre de usuario ya está en uso. Por favor, elige otro.");
        return;
      }
      if (correoExists) {
        alert("Este correo electrónico ya está registrado. Por favor, usa otro.");
        return;
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo.trim())) {
        alert("Por favor, ingresa un correo electrónico válido.");
        return;
      }
      
      // Validar que el nombre de usuario no contenga espacios
      if (username.includes(" ")) {
        alert("El nombre de usuario no puede contener espacios.");
        return;
      }

      // Validar que la contraseña contenga al menos una letra y un número
      const tieneLetra = /[a-zA-Z]/.test(contraseña);
      const tieneNumero = /[0-9]/.test(contraseña);
      if (!tieneLetra || !tieneNumero || contraseña.length < 4) {
        alert("La contraseña debe tener al menos 4 caracteres y contener al menos una letra y un número.");
        return;
      }

      console.log('Intentando crear contacto...');
      const contactoData = { 
        username: username.trim(), // Campo único para nombre de usuario
        name: nombre.trim(),      // Campo único para nombre completo
        number: contraseña,       // Contraseña
        email: correo.trim(),     // Email
        comments: rol             // Rol del usuario
      };

      if (editId) {
        const contactoActualizado = await contactsService.update(editId, contactoData);
        setContactos(contactos.map((c) => (c.id === editId ? contactoActualizado : c)));
        console.log('Contacto actualizado:', contactoActualizado);
      } else {
        const contactoAgregado = await contactsService.create(contactoData);
        setContactos([...contactos, contactoAgregado]);
        console.log('Contacto agregado:', contactoAgregado);
        
        // Limpiar formulario solo si se agregó correctamente
        setUsername("");
        setNombre("");
        setContraseña("");
        setCorreo("");
        setRol("usuario"); // Resetear al valor por defecto
      }
      setEditId(null);
      
    } catch (error) {
      console.error('Error completo:', error);
      const mensajeError = error.response?.data?.error || error.message || "Error al procesar el contacto";
      alert(mensajeError);
    }
  };

  // Borrar un contacto
  const borrar = (id) => {
    if (window.confirm("¿Seguro que quieres borrar este contacto?")) {
      contactsService
        .remove(id)
        .then(() => setContactos(contactos.filter((c) => c.id !== id)))
        .catch((err) => alert("Error al borrar contacto"));
    }
  };

  // Editar un contacto
  const editar = (contacto) => {
    setNombre(contacto.name);
    setContraseña(contacto.number || "");
    setCorreo(contacto.email || "");
    setEditId(contacto.id);
  };

  // Cancelar edición
  const cancelar = () => {
    setNombre("");
    setContraseña("");
    setCorreo("");
    setEditId(null);
  };

  return (
    <div>
      <Menu />
      <h2  className = "title"style={{ textAlign: "center" }}>Enviar una consulta</h2>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: "600px" }}>
          <ContactForm
            username={username}
            nombre={nombre}
            contraseña={contraseña}
            correo={correo}
            editId={editId}
            setUsername={setUsername}
            setNombre={setNombre}
            setContraseña={setContraseña}
            setCorreo={setCorreo}
            onSubmit={agregar}
            onCancel={cancelar}
            rol={rol}
            setRol={setRol}
            contactos={contactos}

          />
        </div>
        {/* 
        <div style={{ width: "100%", maxWidth: "800px", marginTop: "2rem" }}>
          <h3 style={{ textAlign: "center" }}>Contactos</h3>
          <ContactList
            contactos={contactos}
            onEditar={editar}
            onBorrar={borrar}
          />
        </div>
        */}
      </div>
    </div>
  );
};

export default Callme;
