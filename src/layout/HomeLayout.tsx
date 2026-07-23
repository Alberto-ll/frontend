import { Outlet, useNavigate } from "react-router"
import { HomePageNav } from "../pages/homepage/homePageNav"
import { useCallback, useEffect, useState } from "react"
import HomeFooter from "../pages/homepage/homeFooter"
import Toast from "../components/Toast"
import { readStoredAuthSession } from "../services/authSession"

export function HomeLayout(){
    //  NUEVOS ESTADOS PARA EL TOAST
        const [showToast, setShowToast] = useState(false);
        const [toastMessage, setToastMessage] = useState('');
        const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
    
        //  FUNCIÓN PARA MOSTRAR TOAST
        const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info') => {
            setToastMessage(message);
            setToastType(type);
            setShowToast(true);
        }, []);
    
        //  FUNCIÓN PARA CERRAR TOAST
        const closeToast = () => {
            setShowToast(false);
        };

        const navigate = useNavigate();
        
        useEffect( () =>{
        const user = readStoredAuthSession();
        // Solo redirigir si está en login Y ya tiene sesión activa
        // NO redirigir durante el proceso de login (cuando viene del formulario)
        if (user && window.location.pathname === '/login') {
            // Verificar si el token es válido antes de redirigir
            try {
                if (user.token) {
                    // Solo redirigir después de un delay para permitir que el login se complete
                    const timer = setTimeout(() => {
                        if (window.location.pathname === '/login') {
                            navigate('/reserve-pitch/')
                        }
                    }, 500);
                    return () => clearTimeout(timer);
                }
            } catch {
                // Token inválido, no redirigir
            }
        }}, [navigate])
        
    return (
        <section className="homeLayout">
            <HomePageNav showNotification={showNotification}/>
            <Outlet context={{showNotification}}/>
            <HomeFooter />
            <Toast
            message={toastMessage}
            type={toastType}
            isVisible={showToast}
            onClose={closeToast}
            duration={4000}
            />
        </section>
    )
}