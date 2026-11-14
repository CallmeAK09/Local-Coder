import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCw, 
  ExternalLink, 
  Smartphone, 
  Tablet, 
  Monitor, 
  X,
  Globe,
  FileText
} from 'lucide-react';
import { getPreviewUrl } from '../services/api';

export default function PreviewPanel({
  previewFile = 'web/index.html',
  onClose,
  width = 450,
  refreshTrigger = 0
}) {
  const [deviceMode, setDeviceMode] = useState('full'); // 'full' | 'tablet' | 'mobile'
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef(null);

  const isMd = previewFile?.toLowerCase().endsWith('.md') || previewFile?.toLowerCase().endsWith('.markdown');

  // Automatically refresh when refreshTrigger increments (e.g. file saved)
  useEffect(() => {
    setReloadKey(k => k + 1);
  }, [refreshTrigger, previewFile]);

  const handleRefresh = () => {
    setReloadKey(k => k + 1);
  };

  const getContainerWidth = () => {
    if (deviceMode === 'mobile') return '375px';
    if (deviceMode === 'tablet') return '768px';
    return '100%';
  };

  const currentUrl = `${getPreviewUrl(previewFile)}?v=${reloadKey}`;

  return (
    <aside className="preview-panel" style={{ width: `${width}px` }}>
      {/* Top Address & Controls */}
      <div className="preview-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isMd ? <FileText size={14} color="var(--accent)" /> : <Globe size={14} color="var(--accent)" />}
          <span style={{ fontSize: '12px', fontWeight: 600 }}>
            {isMd ? 'Markdown Preview' : 'Browser Preview'}
          </span>
        </div>

        <div className="preview-address" title={currentUrl}>
          {previewFile}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button 
            className="tree-action-btn" 
            title="Reload Preview" 
            onClick={handleRefresh}
          >
            <RotateCw size={13} />
          </button>

          {/* Viewport Modes */}
          <button 
            className="tree-action-btn" 
            title="Desktop / Full Width"
            style={deviceMode === 'full' ? { color: 'var(--accent)' } : {}}
            onClick={() => setDeviceMode('full')}
          >
            <Monitor size={13} />
          </button>
          <button 
            className="tree-action-btn" 
            title="Tablet Width (768px)"
            style={deviceMode === 'tablet' ? { color: 'var(--accent)' } : {}}
            onClick={() => setDeviceMode('tablet')}
          >
            <Tablet size={13} />
          </button>
          <button 
            className="tree-action-btn" 
            title="Mobile Width (375px)"
            style={deviceMode === 'mobile' ? { color: 'var(--accent)' } : {}}
            onClick={() => setDeviceMode('mobile')}
          >
            <Smartphone size={13} />
          </button>

          <button 
            className="tree-action-btn" 
            title="Close Preview Panel" 
            onClick={onClose}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Sandboxed Iframe Container */}
      <div className="preview-frame-container">
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={currentUrl}
          className="preview-iframe"
          title="Sandboxed Live Preview"
          sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
          style={{
            width: getContainerWidth(),
            background: isMd ? '#0d1117' : '#ffffff',
            boxShadow: deviceMode !== 'full' ? '0 0 20px rgba(0,0,0,0.3)' : 'none',
            borderLeft: deviceMode !== 'full' ? '1px solid var(--border-color)' : 'none',
            borderRight: deviceMode !== 'full' ? '1px solid var(--border-color)' : 'none',
          }}
        />
      </div>
    </aside>
  );
}

