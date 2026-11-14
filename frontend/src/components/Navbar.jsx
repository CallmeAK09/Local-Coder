import React from 'react';
import { 
  Play, 
  Square, 
  Save, 
  FilePlus, 
  FolderPlus, 
  Eye, 
  EyeOff, 
  Settings, 
  Moon, 
  Sun, 
  ShieldCheck, 
  AlertTriangle,
  Code2,
  FolderTree,
  Terminal,
  BookOpen,
  Power
} from 'lucide-react';

export default function Navbar({
  activeFile,
  isRunning,
  onRun,
  onStop,
  onNewFile,
  onNewFolder,
  showExplorer,
  onToggleExplorer,
  showOutput,
  onToggleOutput,
  showPreview,
  onTogglePreview,
  isPreviewableFile,
  showBrowserReader,
  onToggleBrowserReader,
  dependenciesStatus,
  onOpenDependencies,
  theme,
  onToggleTheme,
  onOpenSettings,
  onStopServer
}) {
  const allDepsReady = dependenciesStatus?.all_ready;
  const readyCount = dependenciesStatus?.dependencies?.filter(d => d.installed).length || 0;
  const totalCount = dependenciesStatus?.dependencies?.length || 4;

  return (
    <header className="navbar">
      <div className="brand-section">
        <div className="brand-title" style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <img 
            src="https://res.cloudinary.com/xpehvn66/image/upload/v1794678367/Neon_Local_Coder_App_Icon_vl8wml.png" 
            alt="LOCAL CODER"
            onError={(e) => { e.currentTarget.src = '/logo.png'; }}
            style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '7px', 
              objectFit: 'cover',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.45)',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }} 
          />
          <span>LOCAL CODER</span>
        </div>
        <span className="brand-badge">OFFLINE IDE</span>
      </div>

      <div className="actions-section">
        {/* Toggle File Explorer / Workspace */}
        <button 
          className={`btn ${showExplorer ? 'btn-active' : ''}`}
          title="Toggle Files / Workspace (Left)" 
          onClick={onToggleExplorer}
          style={showExplorer ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
        >
          <FolderTree size={16} />
          <span>Files</span>
        </button>

        {/* Toggle Output Panel (Right) */}
        <button 
          className={`btn ${showOutput ? 'btn-active' : ''}`}
          title="Toggle Output & Terminal (Right)" 
          onClick={onToggleOutput}
          style={showOutput ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
        >
          <Terminal size={16} />
          <span>Output</span>
        </button>

        <div style={{ width: '1px', height: '22px', background: 'var(--border-color)', margin: '0 4px' }} />

        {/* New File & Folder */}
        <button className="btn" title="Create New File" onClick={onNewFile}>
          <FilePlus size={16} />
          <span>New File</span>
        </button>
        <button className="btn" title="Create New Folder" onClick={onNewFolder}>
          <FolderPlus size={16} />
          <span>New Folder</span>
        </button>

        {/* Run & Stop */}
        {!isRunning ? (
          <button 
            className="btn btn-primary" 
            title="Execute Code (Auto-saves file) (Ctrl+Enter / F5)" 
            onClick={onRun}
            disabled={!activeFile}
          >
            <Play size={16} fill="currentColor" />
            <span>Run</span>
          </button>
        ) : (
          <button 
            className="btn btn-danger" 
            title="Stop Execution" 
            onClick={onStop}
          >
            <Square size={16} fill="currentColor" />
            <span>Stop</span>
          </button>
        )}

        {/* Browser & PDF Reader Toggle */}
        <button 
          className={`btn ${showBrowserReader ? 'btn-active' : ''}`}
          title="Toggle PDF Reader & Web Browser" 
          onClick={onToggleBrowserReader}
          style={showBrowserReader ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
        >
          <BookOpen size={16} />
          <span>Browser / PDF</span>
        </button>

        {/* Live Preview Toggle - Available for HTML & Markdown files */}
        {isPreviewableFile && (
          <button 
            className={`btn ${showPreview ? 'btn-active' : ''}`}
            title="Toggle Live Sandboxed Preview (HTML & Markdown)" 
            onClick={onTogglePreview}
            style={showPreview ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>Preview</span>
          </button>
        )}
      </div>

      <div className="actions-section">
        {/* Dependency Status Indicator */}
        <button 
          className="btn" 
          onClick={onOpenDependencies}
          style={{
            borderColor: allDepsReady ? 'var(--success)' : 'var(--warning)',
            color: allDepsReady ? 'var(--success)' : 'var(--warning)'
          }}
          title="Inspect Local Compilers & Interpreters"
        >
          {allDepsReady ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
          <span>{allDepsReady ? 'Compilers Ready' : `Compilers (${readyCount}/${totalCount})`}</span>
        </button>

        {/* Theme Toggle */}
        <button className="btn btn-icon" title="Toggle Dark/Light Theme" onClick={onToggleTheme}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Settings */}
        <button className="btn btn-icon" title="IDE Preferences" onClick={onOpenSettings}>
          <Settings size={17} />
        </button>

        {/* Stop Server / Shutdown */}
        <button 
          className="btn btn-icon" 
          title="Stop Compiler Server (Shutdown)" 
          onClick={onStopServer}
          style={{ color: '#ef4444' }}
        >
          <Power size={17} />
        </button>
      </div>
    </header>
  );
}
