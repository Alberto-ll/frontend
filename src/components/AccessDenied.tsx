import { useNavigate } from 'react-router';
import '../static/css/authMessages.css';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="auth-message-page">
      <div className="auth-message-card">
        <span className="auth-message-icon">🔒</span>
        <h1 className="auth-message-title">Acceso Denegado</h1>
        <p className="auth-message-text">
          No tienes permisos para acceder a esta sección.
        </p>
        <button className="auth-message-btn" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
