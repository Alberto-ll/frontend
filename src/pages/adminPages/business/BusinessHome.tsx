import { Link, Outlet, useOutletContext } from "react-router";
import '../../../static/css/business/homebusiness.css'

function BusinessHome() {
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
  return (
    <div className="user-home-container">
      <h1>Gestión de negocios</h1>
      
      <div className="menu-section">
        <nav className="user-menu">
          <Link to="getAll/" className="menu-item">
            Ver Negocios
          </Link>
          <Link to="create/" className="menu-item">
            Agregar Negocio
          </Link>
          <Link to="inactiveBusinesses/" className="menu-item">
            habilitar Negocio
          </Link>
        </nav>
      </div>

      <div className="content-area">
        <Outlet context={{showNotification}}/>
      </div>
    </div>
  );
}

export default BusinessHome;
