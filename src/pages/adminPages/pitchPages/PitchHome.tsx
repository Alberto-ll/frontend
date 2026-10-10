import { Link, Outlet, useOutletContext } from "react-router";
import '../../../static/css/users/userHome.css';

export default function PitchHome() {
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
  return (
    <div className="user-home-container">
      <h1>Gestión de Canchas</h1>

      <div className="menu-section">
        <nav className="user-menu">
          <Link to="getAll/" className="menu-item">
            Ver Canchas
          </Link>
          <Link to="add/" className="menu-item">
            Agregar Cancha
          </Link>
        </nav>
      </div>

      <div className="content-area">
        <Outlet context={{ showNotification }} />
      </div>
    </div>
  )
}
