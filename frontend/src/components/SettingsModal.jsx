import React from 'react';
import { Settings, X, HardDrive, Cpu, ShieldCheck } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  workspaceRoot
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <Settings size={18} color="var(--accent)" />
            <span>LOCAL CODER Preferences</span>
          </div>
          <button className="tree-action-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Auto-fill & Suggestions Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Auto-fill &amp; Code Suggestions</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Enable/disable autocomplete popups and IntelliSense suggestions</div>
              </div>
              <input 
                type="checkbox" 
                checked={settings.suggestions !== false} 
                onChange={(e) => onUpdateSettings({ ...settings, suggestions: e.target.checked })}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
            </div>

            {/* Font Size */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Editor Font Size</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Controls Monaco code font size</div>
              </div>
              <select 
                value={settings.fontSize} 
                onChange={(e) => onUpdateSettings({ ...settings, fontSize: Number(e.target.value) })}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                <option value={12}>12 px</option>
                <option value={14}>14 px</option>
                <option value={16}>16 px</option>
                <option value={18}>18 px</option>
              </select>
            </div>

            {/* Tab Size */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Tab Indentation</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Number of spaces per indentation level</div>
              </div>
              <select 
                value={settings.tabSize} 
                onChange={(e) => onUpdateSettings({ ...settings, tabSize: Number(e.target.value) })}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
              </select>
            </div>

            {/* Minimap */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Show Code Minimap</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Displays miniature overview on the right</div>
              </div>
              <input 
                type="checkbox" 
                checked={settings.minimap} 
                onChange={(e) => onUpdateSettings({ ...settings, minimap: e.target.checked })}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
            </div>

            {/* Word Wrap */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Word Wrap</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wrap long code lines inside the viewport</div>
              </div>
              <select 
                value={settings.wordWrap} 
                onChange={(e) => onUpdateSettings({ ...settings, wordWrap: e.target.value })}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                <option value="on">On</option>
                <option value="off">Off</option>
              </select>
            </div>

            {/* Execution Timeout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Execution Timeout</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max seconds before terminating infinite loops</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input 
                  type="number" 
                  min={2} 
                  max={60} 
                  value={settings.timeout || 20} 
                  onChange={(e) => onUpdateSettings({ ...settings, timeout: Number(e.target.value) })}
                  style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    width: '60px'
                  }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>sec</span>
              </div>
            </div>

            {/* Workspace location */}
            <div style={{ 
              background: 'var(--bg-secondary)', 
              padding: '10px 12px', 
              borderRadius: '6px', 
              border: '1px solid var(--border-color)',
              marginTop: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                <HardDrive size={14} color="var(--accent)" />
                <span>Local Workspace Path</span>
              </div>
              <code style={{ fontSize: '11px', wordBreak: 'break-all', color: 'var(--text-muted)' }}>
                {workspaceRoot || 'workspace/'}
              </code>
            </div>

            {/* Offline guarantee banner */}
            <div style={{ 
              background: 'rgba(63, 185, 80, 0.08)', 
              padding: '10px 12px', 
              borderRadius: '6px', 
              border: '1px solid rgba(63, 185, 80, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              color: 'var(--success)'
            }}>
              <ShieldCheck size={18} />
              <span>100% Offline-First Architecture. No external network traffic, telemetry, or remote API dependencies.</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

