import { useState } from "react";

const ContactForm = ({
  username,
  nombre,
  contraseña,
  correo,
  editId,
  setUsername,
  setNombre,
  setContraseña,
  setCorreo,
  onSubmit,
  onCancel,
  rol,
  setRol
}) => {
  const [contrasenaError, setContrasenaError] = useState("");

  // Validar contraseña (debe tener al menos una letra y un número, mínimo 4 caracteres)
  const validarContrasena = (value) => {
    const tieneLetra = /[a-zA-Z]/.test(value);
    const tieneNumero = /\d/.test(value);
    return value.length >= 4 && tieneLetra && tieneNumero;
  };

  const handleContrasenaChange = (e) => {
    const value = e.target.value;
    setContraseña(value);

    if (!validarContrasena(value)) {
      setContrasenaError(
        "La contraseña debe tener al menos 4 caracteres, incluyendo al menos una letra y un número."
      );
    } else {
      setContrasenaError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar contraseña
    if (!validarContrasena(contraseña)) {
      setContrasenaError(
        "La contraseña debe tener al menos 4 caracteres, incluyendo al menos una letra y un número."
      );
      return;
    }

    // Llama al submit original
    await onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Nombre de Usuario:
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Nombre Completo:
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Contraseña:
        <input
          type="password"
          value={contraseña}
          onChange={e => setContraseña(e.target.value)}
          placeholder="Mínimo 4 caracteres, incluir letra y número"
          required
        />
       
      </label>
      <br />
      <label>
        Correo electrónico:
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Rol:
        <select
          value={rol}
          onChange={e => setRol(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '8px',
            marginTop: '5px',
            marginBottom: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          <option value="usuario">Usuario</option>
          <option value="administrador">Administrador</option>
          <option value="profesor">Profesor</option>
        </select>
      </label>
      <br />
      <button type="submit">
        {editId ? "Actualizar" : "Agregar"}
      </button>
      {editId && (
        <button type="button" onClick={onCancel}>Cancelar</button>
      )}
    </form>
  );
};
/*a*/
export default ContactForm;