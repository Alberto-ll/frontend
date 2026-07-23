import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../static/css/AdminLayout.css";
import { useCallback, useState } from "react";
import { FaUserShield, FaBars, FaTimes, FaUsers, FaMapMarkerAlt, FaTicketAlt,FaArrowAltCircleLeft,FaFutbol, FaHome, FaStore } from "react-icons/fa";
import HomeFooter from "../pages/homepage/homeFooter.js";
import Toast from "../components/Toast.js";
import { useAuth } from "../components/Auth.js";

export function AdminLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const {userData} = useAuth();

    //    NUEVOS ESTADOS PARA EL TOAST
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
    
    //    FUNCIÓN PARA MOSTRAR TOAST
    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    }, []);
    
    //    FUNCIÓN PARA CERRAR TOAST
    const closeToast = () => {
        setShowToast(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };
    
    const handleLogout = () =>{
        localStorage.clear() //temporal
        alert('sesion cerrada')
        navigate('/')
    }

    return (
        <div>
        <div className="admin-container">
            {/* Sidebar para desktop */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">{userData?.name && userData?.name.substring(0,2)}</div>
                    <div className="sidebar-title">{userData?.name}</div>
                </div>
                
                <nav className="sidebar-nav">
                    <NavLink 
                        to="" 
                        end
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <div className="nav-icon"><FaBars /></div>
                        <div className="nav-text">Dashboard</div>
                    </NavLink>
                    <NavLink 
                        to="/" 
                        end
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <div className="nav-icon"><FaHome /></div>
                        <div className="nav-text">Inicio</div>
                    </NavLink>
                    <NavLink 
                        to="users/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <div className="nav-icon"><FaUsers /></div>
                        <div className="nav-text">Usuarios</div>
                    </NavLink>
                    
                    <NavLink 
                        to="localities/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <div className="nav-icon"><FaMapMarkerAlt /></div>
                        <div className="nav-text">Localidades</div>
                    </NavLink>
                    
                    <NavLink 
                        to="coupons/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <div className="nav-icon"><FaTicketAlt /></div>
                        <div className="nav-text">Cupones</div>
                    </NavLink>
                    <NavLink 
                        to="categories/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <div className="nav-icon"><FaUserShield /></div>
                        <div className="nav-text">Categorías</div>
                    </NavLink>
                    <NavLink 
                        to="business/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <div className="nav-icon"><FaStore /></div>
                        <div className="nav-text">Business</div>
                    </NavLink>
                    <NavLink 
                        to="pitchs/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <div className="nav-icon"><FaFutbol /></div>
                        <div className="nav-text">Canchas</div>
                    </NavLink>

                    <NavLink to="../login/" className="nav-item" onClick={handleLogout}><div className="nav-icon"><FaArrowAltCircleLeft /></div>Cerrar sesión</NavLink>
                </nav>
            </aside>

            {/* Header móvil */}
            <header className="mobile-header">
                <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                    {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
                <div className="mobile-logo">
                    <div className="mobile-logo-icon">{userData?.name && userData?.name.substring(0,2)}</div>
                    <div className="mobile-logo-text">{userData?.name}</div>
                </div>
            </header>

            {/* Sidebar móvil */}
            <div className={`mobile-sidebar ${mobileMenuOpen ? 'active' : ''}`}>
                <nav className="sidebar-nav">
                    <NavLink 
                        to="/" 
                        end
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        onClick={toggleMobileMenu}
                    >
                        <div className="nav-icon"><FaHome /></div>
                        <div className="nav-text">Inicio</div>
                    </NavLink>
                    <NavLink 
                        to="users/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        onClick={toggleMobileMenu}
                    >
                        <div className="nav-icon"><FaUsers /></div>
                        <div className="nav-text">Usuarios</div>
                    </NavLink>
                    
                    <NavLink 
                        to="localities/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        onClick={toggleMobileMenu}
                    >
                        <div className="nav-icon"><FaMapMarkerAlt /></div>
                        <div className="nav-text">Localidades</div>
                    </NavLink>
                    
                    <NavLink 
                        to="coupons/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        onClick={toggleMobileMenu}
                    >
                        <div className="nav-icon"><FaTicketAlt /></div>
                        <div className="nav-text">Cupones</div>
                    </NavLink>
                    <NavLink 
                        to="categories/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        onClick={toggleMobileMenu}
                    >
                        <div className="nav-icon"><FaUserShield /></div>
                        <div className="nav-text">Categorías</div>
                    </NavLink>
                    <NavLink 
                        to="pitchs/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        onClick={toggleMobileMenu}
                    >
                        <div className="nav-icon"><FaFutbol /></div>
                        <div className="nav-text">Canchas</div>
                    </NavLink>
                    <a className="nav-item" onClick={handleLogout}><div className="nav-icon"><FaArrowAltCircleLeft /></div>Cerrar sesión</a>
                </nav>
            </div>

            {/* Overlay para móvil */}
            <div 
                className={`menu-overlay ${mobileMenuOpen ? 'active' : ''}`} 
                onClick={toggleMobileMenu}
            />

            {/* Contenido principal */}
            <main className="admin-content">
                <Outlet context={{showNotification}}/>
            </main>
            
        </div>
        <HomeFooter />
        <Toast
            message={toastMessage}
            type={toastType}
            isVisible={showToast}
            onClose={closeToast}
            duration={4000}
            />
        </div>
    );
}