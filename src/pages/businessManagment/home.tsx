import { Link, Outlet, useOutletContext, Navigate } from "react-router";
import { useAuth } from '../../components/Auth';
/*import '../../static/css/crudTable.css' */

export default function BusinessPitchHome() {
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
  const { userData, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }
  if (!userData) {
    alert('sesion no iniciada');
    return <Navigate to="/login" />;
  }
  if (userData.category !== "business_owner" && userData.category !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <div style={{ padding: '2rem' }}>
        <div className="crud-home-container">
          <h1 className="crud-title">Gestión de Negocio</h1>
          <div className="menu-section">
            <nav className="crud-menu">
              <Link to="/myBusiness" className="menu-item">
              Inicio
              </Link>
              <Link to="/myBusiness/getAll/" className="menu-item">
              Ver canchas
              </Link>
              <Link to="/myBusiness/add/" className="menu-item">
                Agregar Canchas
              </Link>
              <Link to="/myBusiness/getReservations/" className="menu-item">
                Ver Reservas
              </Link>
            </nav>
          </div>

          <div className="content-area">
            <Outlet context={{showNotification}}/>
          </div>
        </div>
      </div>)
}
