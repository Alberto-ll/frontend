import { Link, Outlet, useOutletContext } from "react-router";
import '../../../static/css/users/userHome.css';

const LocalityHome = () => {
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
  return (
    <div className="user-home-container">
      <h1>Gestión de Localidades</h1>
      
      <div className="menu-section">
        <nav className="user-menu">
          <Link to="getAll/" className="menu-item">
            Ver Localidades
          </Link>
          <Link to="create/" className="menu-item">
            Agregar Localidad
          </Link>
        </nav>
      </div>

      <div className="content-area">
        <Outlet context={{showNotification}} />
      </div>
    </div>
  );
};

export default LocalityHome;
