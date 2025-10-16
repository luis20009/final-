import Menu from "../components/Menu";
import "./SobreNosotros.css";
const SobreNosotros = () => (
  <div>
      <Menu />
      <h1 className="title">INFORMACIÓN</h1>
      
      <div className="info-section">
        <p className="popni">
          Bienvenidos a TECNO SPACE, un lugar donde los niños y jóvenes verán como la programación crea la comodidad y la diversión.
        </p>
        
        <div className="skills-section">
          <p className="popni">Nos enfocamos en que cada estudiante logre mejorar grandes habilidades, como pueden ser:</p>
          <ul>
            <li className="popni">El pensamiento lógico</li>
            <li className="popni">Una mayor perseverancia</li>
            <li className="popni">Un mejor manejo en la tecnología</li>
          </ul>
        </div>

        <p className="popni">
          Con nuestro acompañamiento, los niños podrán crear sus propios proyectos y descubrir lo emocionante que es programar.
        </p>

        <p className="popni">
          ¡Queremos que se sientan motivados y seguros para enfrentar los retos del mundo digital!
        </p>
      </div>
  </div>
);

export default SobreNosotros;