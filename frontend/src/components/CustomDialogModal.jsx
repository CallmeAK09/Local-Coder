import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  HelpCircle, 
  Edit3, 
  CheckCircle2, 
  X 
} from 'lucide-react';

export default function CustomDialogModal({
  isOpen,
  type = 'alert', // 'alert' | 'confirm' | 'prompt'
  title = '',
  message = '',
  defaultValue = '',
  placeholder = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
  variant = 'primary', // 'primary' | 'danger' | 'warning' | 'info'
  onConfirm,
  onCancel
}) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue || '');
      if (type === 'prompt') {
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 50);
      }
    }
  }, [isOpen, defaultValue, type]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      } else if (e.key === 'Enter' && type !== 'prompt') {
        e.preventDefault();
        onConfirm?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel, type]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (type === 'prompt') {
      onConfirm?.(inputValue);
    } else {
      onConfirm?.();
    }
  };

  const renderIcon = () => {
    if (variant === 'danger') return <AlertCircle size={20} color="var(--danger, #ef4444)" />;
    if (variant === 'warning') return <AlertTriangle size={20} color="var(--warning, #f59e0b)" />;
    if (type === 'prompt') return <Edit3 size={20} color="var(--accent, #38bdf8)" />;
    if (type === 'confirm') return <HelpCircle size={20} color="var(--accent, #38bdf8)" />;
    return <Info size={20} color="var(--accent, #38bdf8)" />;
  };

  const getConfirmBtnClass = () => {
    if (variant === 'danger') return 'btn btn-danger';
    if (variant === 'warning') return 'btn';
    return 'btn btn-primary';
  };

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 100000 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '460px', 
          width: '90vw',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontWeight: 600 }}>
            {renderIcon()}
            <span>{title || (type === 'confirm' ? 'Confirm Action' : type === 'prompt' ? 'Input Required' : 'Notification')}</span>
          </div>
          <button 
            type="button" 
            className="tree-action-btn" 
            onClick={onCancel} 
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '20px 22px' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
              {message}
            </p>

            {type === 'prompt' && (
              <div style={{ marginTop: '10px' }}>
                <input
                  ref={inputRef}
                  type="text"
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  value={inputValue}
                  placeholder={placeholder}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ padding: '12px 20px', background: 'var(--bg-secondary)' }}>
            {(type === 'confirm' || type === 'prompt') && (
              <button 
                type="button" 
                className="btn" 
                onClick={onCancel}
                style={{ padding: '6px 14px', fontSize: '13px' }}
              >
                {cancelText}
              </button>
            )}
            <button 
              type="submit" 
              className={getConfirmBtnClass()}
              style={{ padding: '6px 18px', fontSize: '13px', fontWeight: 500 }}
              autoFocus={type !== 'prompt'}
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

