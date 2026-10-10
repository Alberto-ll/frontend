import { Link, Outlet, useOutletContext } from "react-router";
import '../../../static/css/users/userHome.css';

export default function CouponHome() {
  const { showNotification } = useOutletContext<{
    showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void;
  }>();

  return (
    <div className="user-home-container">
      <h1>Gestión de Cupones</h1>

      <div className="menu-section">
        <nav className="user-menu">
          <Link to="getAll" className="menu-item">
            Ver Cupones
          </Link>
          <Link to="create" className="menu-item">
            Agregar Cupón
          </Link>
        </nav>
      </div>

      <div className="content-area">
        <Outlet context={{ showNotification }} />
      </div>
    </div>
  );
}
