import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import '../static/css/authMessages.css';

interface OutletContext {
  setHeaderMode: (mode: 'full' | 'simple') => void;
}

export default function NotFound() {
  const navigate = useNavigate();
  const { setHeaderMode } = useOutletContext<OutletContext>();

  useEffect(() => {
    setHeaderMode('simple');
    return () => setHeaderMode('full');
  }, [setHeaderMode]);

  return (
    <div className="auth-message-page">
      <div className="auth-message-card">
        <span className="auth-message-icon">🔍</span>
        <h1 className="auth-message-title">Página No Encontrada</h1>
        <p className="auth-message-text">
          La página que buscas no existe o fue movida.
        </p>
        <button className="auth-message-btn" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
