import { Link, Outlet, useOutletContext } from "react-router";
import '../../../static/css/crudTable.css'

export default function CouponHome() {
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
  return (
    <div style={{ padding: '2rem' }}>
        <div className="crud-home-container">
          <h1 className="crud-title">Gestión de Cupones</h1>
          <div className="menu-section">
            <nav className="crud-menu">
              <Link to="/admin/coupons" className="menu-item">
              Inicio
              </Link>
              <Link to="/admin/coupons/getAll/" className="menu-item">
              Ver cupones
              </Link>
              <Link to="/admin/coupons/add/" className="menu-item">
                Agregar Cupones
              </Link>
              <Link to="/admin/coupons/getOne/" className="menu-item">
              Ver cupon por ID
              </Link>
              <Link to="/admin/coupons/update/" className="menu-item">
              Actualizar cupones
              </Link>
            </nav>
          </div>

          <div className="content-area">
            <Outlet context={{showNotification}}/>
          </div>
    </div>
    </div>
  );
}
