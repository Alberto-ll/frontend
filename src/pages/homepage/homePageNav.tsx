import {Link, useNavigate } from "react-router-dom";
import { FaFutbol } from "react-icons/fa";
import '../../static/css/homePageNav.css'
import { useAuth } from "../../components/Auth";

interface HomePageNavProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function HomePageNav({ showNotification }: HomePageNavProps){
    const navigate = useNavigate()
    
    const {userData} = useAuth();
    
    const toHome = () => {
        navigate('/')
    }
    
    const handleLogout = () => {
        localStorage.removeItem('user');
        showNotification("Sesión cerrada con éxito", "success");
    }
    
    return(
        <header className="homeHeader">
                <div className="Nav">
                    <h1 className="companyName" onClick={toHome}>
                        <div className="navIcon"><FaFutbol /></div>
                        FútbolYa
                    </h1>
                    <ul>
                        <li>
                            <Link to="/about">Sobre nosotros</Link>
                        </li>
                        
                        <li>
                            <Link to="/reserve-pitch">Lista de Canchas</Link>
                        </li>
                        {(userData?.category === 'admin') &&
                        <li>
                            <Link to="/admin">Admin Dashboard</Link>
                        </li>}
                        {(userData?.category === 'business_owner' || userData?.category === 'admin') &&
                        <li>
                            <Link to="/myBusiness">Mi negocio</Link> 
                        </li>}
                        {(userData?.category === 'user') &&
                        <li>
                            <Link to="/registerBusiness">Registrar negocio</Link> 
                        </li>}
                        {userData &&
                        <li>
                            <Link to="/myReservations">Mis reservas</Link>
                        </li>}
                        <li>
                            {!userData && 
                            <Link to="/login">Iniciar sesión</Link>}
                            {userData &&
                            <Link to="/" onClick={handleLogout}>Cerrar sesión</Link>}
                        </li>  
                        
                    </ul>   
                </div>
            </header>
    )
}