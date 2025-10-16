const ContactList = ({ contactos, onEditar, onBorrar }) => (
  <ul>
    {contactos.map((c) => (
      <li key={c.id}>
        <div>
          <strong>Usuario: {c.username}</strong>
          <br />
          Nombre: {c.name}
          <br />
          Número: {c.number}
          <br />
          Email: {c.email}
          {c.comments && (
            <>
              <br />
              Comentarios: {c.comments}
            </>
          )}
        </div>
        <div>
          <button onClick={() => onEditar(c)}>Editar</button>
          <button onClick={() => onBorrar(c.id)}>Borrar</button>
        </div>
      </li>
    ))}
  </ul>
)

export default ContactList
