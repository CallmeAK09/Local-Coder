import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  Terminal, 
  ShieldAlert, 
  X,
  Info
} from 'lucide-react';

export default function DependencyModal({
  isOpen,
  onClose,
  dependenciesStatus,
  onRefreshDependencies,
  isRefreshing
}) {
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const osInfo = dependenciesStatus?.os || {};
  const deps = dependenciesStatus?.dependencies || [];

  const handleCopy = (id, command) => {
    navigator.clipboard.writeText(command);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <Terminal size={18} color="var(--accent)" />
            <span>Local Compilers & Interpreters Audit</span>
          </div>
          <button className="tree-action-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* OS Environment Summary */}
          <div style={{ 
            background: 'var(--bg-secondary)', 
            padding: '10px 14px', 
            borderRadius: '6px', 
            marginBottom: '16px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Detected System: </span>
              <strong>{osInfo.system} ({osInfo.distro || 'Standard'}) {osInfo.release}</strong>
            </div>
            <button 
              className="btn" 
              onClick={onRefreshDependencies}
              disabled={isRefreshing}
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Checking...' : 'Recheck Installation'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {deps.map((dep) => {
              const isInstalled = dep.installed;
              const guide = dep.install_guide || {};

              return (
                <div 
                  key={dep.id}
                  style={{
                    border: `1px solid ${isInstalled ? 'var(--border-color)' : 'rgba(210, 153, 34, 0.4)'}`,
                    borderRadius: '8px',
                    padding: '12px 14px',
                    background: isInstalled ? 'var(--bg-secondary)' : 'rgba(210, 153, 34, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isInstalled ? (
                        <CheckCircle2 size={18} color="var(--success)" />
                      ) : (
                        <XCircle size={18} color="var(--warning)" />
                      )}
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{dep.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({dep.language})</span>
                    </div>

                    <span className={`status-tag ${isInstalled ? 'SUCCESS' : 'TIMEOUT'}`}>
                      {isInstalled ? 'Installed' : 'Missing'}
                    </span>
                  </div>

                  {isInstalled ? (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      <div>Version: <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-code)' }}>{dep.primary_version || 'Detected'}</span></div>
                      <div style={{ marginTop: '2px' }}>
                        Binary: <code style={{ fontSize: '11px' }}>{Object.values(dep.paths).filter(Boolean).join(', ')}</code>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {guide.description}
                      </p>
                      
                      {guide.command && (
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            Installation Command ({osInfo.system}):
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            background: 'var(--bg-darker)', 
                            padding: '6px 10px', 
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            gap: '8px'
                          }}>
                            <code style={{ flex: 1, fontSize: '12px', color: 'var(--accent)' }}>
                              {guide.command}
                            </code>
                            <button 
                              className="btn btn-icon" 
                              title="Copy command to clipboard"
                              onClick={() => handleCopy(dep.id, guide.command)}
                            >
                              {copiedId === dep.id ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ 
            marginTop: '16px', 
            padding: '10px 12px', 
            borderRadius: '6px', 
            background: 'rgba(88, 166, 255, 0.08)',
            border: '1px solid rgba(88, 166, 255, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}>
            <ShieldAlert size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Local Security Policy:</strong> LOCAL CODER respects your operating system boundaries and never installs compilers or packages without your manual shell invocation.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

