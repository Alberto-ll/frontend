import { Link, Outlet, useOutletContext } from "react-router";
import '../../../static/css/categories/categoryHome.css'

function CategoryHome() {
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
  return (
    <div className="user-home-container">
      <h1>Gestión de Categorías</h1>
      
      <div className="menu-section">
        <nav className="user-menu">
          <Link to="getAll/" className="menu-item">
            Ver Categorías
          </Link>
          <Link to="create/" className="menu-item">
            Agregar Categoría
          </Link>
        </nav>
      </div>

      <div className="content-area">
        <Outlet context={{showNotification}}/>
      </div>
    </div>
  );
}

export default CategoryHome;
