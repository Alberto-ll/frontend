import React from 'react';
import '../static/css/components/deleteConfirm.css';

interface DeleteConfirmProps {
  isOpen: boolean;
  title?: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
  isOpen,
  title = "Confirmar Eliminación",
  message,
  itemName,
  onConfirm,
  onCancel,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  isLoading = false
}) => {
  // Cerrar con ESC
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="delete-confirm-overlay" onClick={onCancel}>
      <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-confirm-header">
          <div className="delete-confirm-icon">
            ⚠️
          </div>
          <h2 className="delete-confirm-title">{title}</h2>
        </div>

        <div className="delete-confirm-content">
          <p className="delete-confirm-message">
            {message}
          </p>
          
          {itemName && (
            <div className="delete-confirm-item">
              <span className="item-label">Elemento a eliminar:</span>
              <span className="item-name">"{itemName}"</span>
            </div>
          )}

          <div className="delete-confirm-warning">
            <span className="warning-icon">🚨</span>
            <span className="warning-text">
              Esta acción no se puede deshacer
            </span>
          </div>
        </div>

        <div className="delete-confirm-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="confirm-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Eliminando...
              </>
            ) : (
              <>
                <span className="confirm-icon">🗑️</span>
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;