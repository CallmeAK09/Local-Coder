import React, { useState, useEffect, useRef } from 'react';
import { FolderPlus, X, Plus } from 'lucide-react';

export default function NewFolderModal({
  isOpen,
  onClose,
  onCreate,
  parentFolder = '',
  folders = []
}) {
  const [folderName, setFolderName] = useState('');
  const [selectedParent, setSelectedParent] = useState(parentFolder);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setSelectedParent(parentFolder || '');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, parentFolder]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const clean = folderName.trim();
    if (!clean) return;

    const fullPath = selectedParent ? `${selectedParent}/${clean}` : clean;
    onCreate(fullPath);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ width: '420px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <FolderPlus size={18} color="var(--accent)" />
            <span>Create New Folder</span>
          </div>
          <button type="button" className="tree-action-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Folder Name:
              </label>
              <input
                ref={inputRef}
                type="text"
                className="stdin-input"
                style={{ width: '100%', fontSize: '13px', padding: '7px 10px' }}
                placeholder="e.g. components, utils, scripts"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit(e);
                  if (e.key === 'Escape') onClose();
                }}
              />
            </div>

            {folders.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Parent Directory:
                </label>
                <select
                  value={selectedParent}
                  onChange={(e) => setSelectedParent(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  <option value="">(Workspace Root /)</option>
                  {folders.map(f => (
                    <option key={f} value={f}>📁 {f}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!folderName.trim()}>
              <Plus size={14} />
              <span>Create Folder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

