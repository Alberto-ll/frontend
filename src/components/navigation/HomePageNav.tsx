import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaFutbol, FaBars, FaTimes } from "react-icons/fa";
import '../../static/css/homePageNav.css';
import { useAuth } from "../../hooks/useAuth";

interface HomePageNavProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  simple?: boolean;
}

export function HomePageNav({ showNotification, simple = false }: HomePageNavProps){
    void showNotification;
    const navigate = useNavigate();
    const { userData, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        isActive ? "active" : undefined;

    const toHome = () => {
        navigate("/");
        setMenuOpen(false);
    };

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        logout();
        navigate("/");
        setMenuOpen(false);
    };

    return(
        <header className="homeHeader">
            <div className="Nav">
                <h1 className="companyName" onClick={toHome}>
                    <div className="navIcon"><FaFutbol /></div>
                    FútbolYa
                </h1>
                {!simple && (
                    <>
                        <button
                            className="nav-toggle"
                            onClick={() => setMenuOpen(o => !o)}
                            aria-label="Abrir menú"
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                        <ul className={menuOpen ? "open" : undefined}>
                            <li>
                                <NavLink to="/about" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                                    Sobre nosotros
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/reserve-pitch" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                                    Lista de Canchas
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/businesses" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                                    Negocios
                                </NavLink>
                            </li>
                            {userData?.category === 'admin' &&
                            <li>
                                <NavLink to="/admin" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                                    Admin Dashboard
                                </NavLink>
                            </li>}
                            {(userData?.category === 'business_owner' || userData?.category === 'admin') &&
                            <li>
                                <NavLink to="/myBusiness" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                                    Mi negocio
                                </NavLink>
                            </li>}
                            {userData?.category === 'user' &&
                            <li>
                                <NavLink to="/registerBusiness" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                                    Registrar negocio
                                </NavLink>
                            </li>}
                            {userData &&
                            <li>
                                <NavLink to="/myReservations" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                                    Mis reservas
                                </NavLink>
                            </li>}
                            {userData &&
                            <li className="nav-user-item">
                                <span className="nav-user-chip">
                                    {userData?.name || userData?.email}
                                </span>
                            </li>}
                            <li>
                                {!userData &&
                                    <NavLink to="/login" className="nav-cta" onClick={() => setMenuOpen(false)}>
                                        Iniciar sesión
                                    </NavLink>}
                                {userData &&
                                    <NavLink to="/" className="nav-logout" onClick={handleLogout}>
                                        Cerrar sesión
                                    </NavLink>}
                            </li>
                        </ul>
                    </>
                )}
            </div>
        </header>
    )
}
