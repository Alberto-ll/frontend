import { useNavigate } from 'react-router';
import '../static/css/authMessages.css';

interface LoginRequiredProps {
  redirectUrl: string;
}

export default function LoginRequired({ redirectUrl }: LoginRequiredProps) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  return (
    <div className="auth-message-page">
      <div className="auth-message-card">
        <span className="auth-message-icon">🔐</span>
        <h1 className="auth-message-title">Acceso Requerido</h1>
        <p className="auth-message-text">
          Debes iniciar sesión para acceder a esta sección.
        </p>
        <button className="auth-message-btn" onClick={handleLogin}>
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
