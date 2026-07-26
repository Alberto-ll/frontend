import { Link, Outlet, useOutletContext } from "react-router";
import '../../../static/css/users/userHome.css';

const UserHome = () => {
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
  return (
    <div className="user-home-container">
      <h1>Gestión de Usuarios</h1>
      
      <div className="menu-section">
        <nav className="user-menu">
          <Link to="getAll/" className="menu-item">
            Ver Usuarios
          </Link>
          <Link to="createUser/" className="menu-item">
            Agregar Usuario
          </Link>
        </nav>
      </div>

      <div className="content-area">
        <Outlet context={{showNotification}} />
      </div>
    </div>
  );
};

export default UserHome;
