import { Link, Outlet, useOutletContext } from "react-router";

export default function BusinessPitchHome() {
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

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
              <Link to="/myBusiness/editBusiness/" className="menu-item">
                Editar Negocio
              </Link>
            </nav>
          </div>

          <div className="content-area">
            <Outlet context={{showNotification}}/>
          </div>
        </div>
      </div>)
}
