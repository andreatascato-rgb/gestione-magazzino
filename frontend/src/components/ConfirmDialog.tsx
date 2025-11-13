import React from 'react';
import Modal from './Modal';
import Button from './Button';
import './ConfirmDialog.css';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Conferma',
  message,
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  variant = 'info',
  isLoading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const variantClass = `confirm-dialog-${variant}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={!isLoading}
    >
      <div className={`confirm-dialog ${variantClass}`}>
        <div className="confirm-dialog-icon">
          {variant === 'danger' && '⚠️'}
          {variant === 'warning' && '⚠️'}
          {variant === 'info' && 'ℹ️'}
        </div>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Caricamento...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

