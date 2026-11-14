import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCode, 
  FileText, 
  X, 
  Plus, 
  Code2, 
  Sparkles,
  Folder
} from 'lucide-react';

const SUPPORTED_FORMATS = [
  { ext: '.html', name: 'HTML Document', lang: 'html', badge: 'HTML5', color: '#fb923c', defaultTemplate: true, requiredDep: null },
  { ext: '.js', name: 'JavaScript', lang: 'javascript', badge: 'Node/JS', color: '#facc15', defaultTemplate: false, requiredDep: 'node' },
  { ext: '.py', name: 'Python Script', lang: 'python', badge: 'Python 3', color: '#38bdf8', defaultTemplate: false, requiredDep: 'python' },
  { ext: '.css', name: 'CSS Stylesheet', lang: 'css', badge: 'CSS3', color: '#38bdf8', defaultTemplate: false, requiredDep: null },
  { ext: '.c', name: 'C Source Code', lang: 'c', badge: 'GCC C', color: '#60a5fa', defaultTemplate: false, requiredDep: 'gcc' },
  { ext: '.h', name: 'C Header', lang: 'c', badge: 'C Header', color: '#93c5fd', defaultTemplate: false, requiredDep: 'gcc' },
  { ext: '.java', name: 'Java Class', lang: 'java', badge: 'JDK Java', color: '#f87171', defaultTemplate: false, requiredDep: 'java' },
  { ext: '.json', name: 'JSON Data', lang: 'json', badge: 'JSON', color: '#a3e635', defaultTemplate: false, requiredDep: null },
  { ext: '.md', name: 'Markdown Doc', lang: 'markdown', badge: 'Markdown', color: '#cbd5e1', defaultTemplate: false, requiredDep: null },
  { ext: '.txt', name: 'Plain Text', lang: 'plaintext', badge: 'Text', color: '#94a3b8', defaultTemplate: false, requiredDep: null },
];

export default function NewFileModal({
  isOpen,
  onClose,
  onCreate,
  parentFolder = '',
  folders = [],
  dependenciesStatus = null
}) {
  const [fileName, setFileName] = useState('');
  const [selectedExt, setSelectedExt] = useState('.html');
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(parentFolder);
  const inputRef = useRef(null);

  // Filter formats: Show only formats whose runtime/compiler is installed on the host system,
  // while keeping HTML, CSS, Markdown, JSON, and Text accessible at all times!
  const availableFormats = SUPPORTED_FORMATS.filter(fmt => {
    if (!fmt.requiredDep) return true; // Always accessible (HTML, CSS, MD, JSON, TXT)
    if (dependenciesStatus && dependenciesStatus.dependencies) {
      const dep = dependenciesStatus.dependencies.find(d => d.id === fmt.requiredDep);
      return dep ? Boolean(dep.installed) : false;
    }
    return true;
  });

  useEffect(() => {
    if (isOpen) {
      setFileName('');
      const defaultExt = availableFormats.some(f => f.ext === '.html') ? '.html' : (availableFormats[0]?.ext || '.html');
      setSelectedExt(defaultExt);
      setUseTemplate(defaultExt === '.html');
      setSelectedFolder(parentFolder || '');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, parentFolder]);

  // If user types extension inside file name (e.g. "app.js"), sync selectedExt
  const handleNameChange = (e) => {
    const val = e.target.value;
    setFileName(val);

    const match = availableFormats.find(fmt => val.toLowerCase().endsWith(fmt.ext));
    if (match) {
      setSelectedExt(match.ext);
    }
  };

  const handleSelectFormat = (fmt) => {
    setSelectedExt(fmt.ext);
    if (fmt.ext === '.html') {
      setUseTemplate(true);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    let cleanName = fileName.trim();
    if (!cleanName) {
      cleanName = selectedExt === '.java' ? 'Main' : 'index';
    }

    // Remove extension if already typed to avoid double extension (e.g. index.html.html)
    if (cleanName.toLowerCase().endsWith(selectedExt.toLowerCase())) {
      cleanName = cleanName.slice(0, -selectedExt.length);
    }

    const fullFileName = `${cleanName}${selectedExt}`;
    const fullPath = selectedFolder ? `${selectedFolder}/${fullFileName}` : fullFileName;

    onCreate(fullPath, selectedExt, useTemplate);
    onClose();
  };

  if (!isOpen) return null;

  const currentFormat = availableFormats.find(f => f.ext === selectedExt) || availableFormats[0] || SUPPORTED_FORMATS[0];
  const finalDisplay = `${selectedFolder ? selectedFolder + '/' : ''}${fileName.trim() || 'filename'}${selectedExt}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content floating-new-file-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <FileCode size={18} color="var(--accent)" />
            <span>Create New File</span>
          </div>
          <button type="button" className="tree-action-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* File Name Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                File Name:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={inputRef}
                  type="text"
                  className="stdin-input"
                  style={{ flex: 1, fontSize: '13px', padding: '7px 10px' }}
                  placeholder="e.g. index, main, app, server"
                  value={fileName}
                  onChange={handleNameChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit(e);
                    if (e.key === 'Escape') onClose();
                  }}
                />
                <span style={{ 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)', 
                  padding: '7px 12px', 
                  borderRadius: '4px',
                  fontFamily: 'var(--font-code)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: currentFormat.color
                }}>
                  {selectedExt}
                </span>
              </div>
            </div>

            {/* Select File Format Options */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                Select File Format:
              </label>
              <div className="format-grid">
                {availableFormats.map(fmt => {
                  const isSelected = selectedExt === fmt.ext;
                  return (
                    <div
                      key={fmt.ext}
                      className={`format-option-card ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectFormat(fmt)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: fmt.color 
                        }} />
                        <span style={{ fontWeight: 600, fontSize: '12px' }}>{fmt.badge}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fmt.ext}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Folder Destination (if folders exist) */}
            {folders.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Destination Folder:
                </label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
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

            {/* Include Boilerplate Template Option */}
            <div style={{ 
              background: 'var(--bg-secondary)', 
              padding: '10px 12px', 
              borderRadius: '6px', 
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>Starter Boilerplate Template</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {selectedExt === '.html' 
                      ? 'Pre-fill with modern HTML5 standard boilerplate'
                      : `Pre-fill with starter ${currentFormat.name} code`}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={useTemplate}
                onChange={(e) => setUseTemplate(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
            </div>

            {/* Preview of file path */}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Path: <code style={{ color: 'var(--accent)' }}>workspace/{finalDisplay}</code>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={14} />
              <span>Create File</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

