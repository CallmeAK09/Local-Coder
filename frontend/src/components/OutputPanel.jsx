import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  AlertCircle, 
  History, 
  Send, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Eraser,
  Play,
  Globe,
  BookOpen,
  FileText,
  Upload,
  RotateCw,
  ExternalLink,
  Bookmark,
  BookmarkPlus,
  Plus,
  X,
  Compass,
  FileCode,
  ListPlus
} from 'lucide-react';
import PreviewPanel from './PreviewPanel';
import { getBrowserProxyUrl, getOfflineDocsUrl } from '../services/api';

const DEFAULT_BOOKMARKS = [
  { id: 'devdocs', name: 'DevDocs', url: 'https://devdocs.io', isDefault: true },
  { id: 'mdn', name: 'MDN Web', url: 'https://developer.mozilla.org', isDefault: true },
  { id: 'python', name: 'Python 3', url: 'https://docs.python.org/3/', isDefault: true },
  { id: 'wikipedia', name: 'Wikipedia', url: 'https://en.wikipedia.org', isDefault: true },
  { id: 'localhost', name: 'Localhost', url: 'http://localhost:5173', isDefault: true },
];

export default function OutputPanel({
  width = 440,
  activeTab: controlledActiveTab,
  onTabChange,
  executionResult,
  isRunning,
  stdinValue,
  sessionStdin = [],
  onStdinChange,
  onSendStdin,
  history = [],
  onClearHistory,
  onClearOutput,
  onSelectHistoryItem,
  isCollapsed = false,
  onToggleCollapse,
  showPreviewTab = false,
  previewFile = 'index.html',
  previewRefreshTrigger = 0,
  selectedPdfUrl = null,
  selectedPdfName = '',
  onSelectPdf = null,
  showAlert
}) {
  const [internalTab, setInternalTab] = useState('output');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalTab;

  const setActiveTab = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  // PDF Reader internal state
  const [isMultilineStdin, setIsMultilineStdin] = useState(false);
  const stdinInputRef = useRef(null);

  const handleStdinChange = (val) => {
    if (val && val.includes('\n') && !isMultilineStdin) {
      setIsMultilineStdin(true);
    }
    if (onStdinChange) {
      onStdinChange(val);
    }
  };

  const [pdfUrl, setPdfUrl] = useState(selectedPdfUrl);
  const [pdfName, setPdfName] = useState(selectedPdfName);
  const [pdfSize, setPdfSize] = useState(null);
  const [isPdfDragging, setIsPdfDragging] = useState(false);
  const pdfInputRef = useRef(null);

  useEffect(() => {
    if (selectedPdfUrl) {
      setPdfUrl(selectedPdfUrl);
      setPdfName(selectedPdfName || 'document.pdf');
    }
  }, [selectedPdfUrl, selectedPdfName]);

  const handlePdfUpload = (file) => {
    if (!file || file.type !== 'application/pdf') {
      showAlert?.('Please choose a valid PDF (.pdf) file.', 'Invalid File Format', 'warning');
      return;
    }

    if (pdfUrl && pdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPdfUrl(objectUrl);
    setPdfName(file.name);
    setPdfSize((file.size / 1024 / 1024).toFixed(2));

    if (onSelectPdf) {
      onSelectPdf(objectUrl, file.name);
    }
  };

  // Web Browser internal state
  const [browserInputUrl, setBrowserInputUrl] = useState('https://devdocs.io');
  const [browserTargetUrl, setBrowserTargetUrl] = useState('https://devdocs.io');
  const [browserIframeKey, setBrowserIframeKey] = useState(0);

  // Custom Bookmarks state
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('local_coder_bookmarks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_BOOKMARKS;
  });

  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('local_coder_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {}
  }, [bookmarks]);

  const handleNavigateBrowser = (e) => {
    e?.preventDefault();
    let url = browserInputUrl.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.startsWith('localhost') || url.startsWith('127.0.0.1')) {
        url = 'http://' + url;
      } else {
        url = 'https://' + url;
      }
    }

    setBrowserInputUrl(url);
    setBrowserTargetUrl(url);
    setBrowserIframeKey(k => k + 1);
  };

  const handleOpenDoc = (url) => {
    setBrowserInputUrl(url);
    setBrowserTargetUrl(url);
    setBrowserIframeKey(k => k + 1);
  };

  const handleOpenOfflineDoc = (topic) => {
    const docUrl = getOfflineDocsUrl(topic);
    setBrowserInputUrl(`[Offline Cheatsheet] ${topic}`);
    setBrowserTargetUrl(docUrl);
    setBrowserIframeKey(k => k + 1);
  };

  const handleSaveNewBookmark = (e) => {
    e?.preventDefault();
    let name = newBookmarkName.trim();
    let url = newBookmarkUrl.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    if (!name) {
      try {
        name = new URL(url).hostname.replace('www.', '');
      } catch {
        name = 'Bookmark';
      }
    }

    setBookmarks(prev => [...prev, { id: Date.now().toString(), name, url, isDefault: false }]);
    setIsAddingBookmark(false);
    setNewBookmarkName('');
    setNewBookmarkUrl('');
  };

  const handleDeleteBookmark = (id, e) => {
    e?.stopPropagation();
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const isEofOrInputRequired = Boolean(
    executionResult?.is_input_required ||
    executionResult?.status === 'INPUT_REQUIRED' ||
    (executionResult?.stderr && (
      executionResult.stderr.includes('EOFError') ||
      executionResult.stderr.includes('EOF when reading a line')
    ))
  );

  useEffect(() => {
    if (isEofOrInputRequired && stdinInputRef.current) {
      stdinInputRef.current.focus();
    }
  }, [isEofOrInputRequired, executionResult]);

  const status = isRunning ? 'RUNNING' : (
    isEofOrInputRequired ? 'INPUT_REQUIRED' : (executionResult?.status || 'IDLE')
  );
  const hasProblems = Boolean(
    executionResult?.compilation_error || 
    (executionResult?.status === 'ERROR' && executionResult?.stderr) ||
    isEofOrInputRequired
  );

  const renderInputRequiredBanner = () => {
    if (!isEofOrInputRequired) return null;
    const nextInputIndex = (sessionStdin?.length || 0) + 1;
    return (
      <div className="terminal-input-banner">
        <div className="terminal-input-banner-icon">⌨️</div>
        <div className="terminal-input-banner-body">
          <div className="terminal-input-banner-title">
            Program is waiting for input {sessionStdin?.length ? `(Input #${nextInputIndex})` : ''}
          </div>
          <div className="terminal-input-banner-subtitle">
            {sessionStdin && sessionStdin.length > 0 && (
              <div style={{ marginBottom: '5px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Entered so far:</span>
                {sessionStdin.map((item, idx) => (
                  <span key={idx} style={{ 
                    background: 'rgba(56, 189, 248, 0.15)', 
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38bdf8',
                    padding: '1px 6px', 
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}>
                    #{idx + 1}: {item === '' ? '""' : item}
                  </span>
                ))}
              </div>
            )}
            Please enter input #{nextInputIndex} in the input box below and click <strong>Run</strong> (or press Enter).
          </div>
        </div>
        <button 
          type="button" 
          className="btn btn-primary"
          style={{ padding: '4px 10px', fontSize: '11px', whiteSpace: 'nowrap' }}
          onClick={() => {
            if (stdinInputRef.current) stdinInputRef.current.focus();
          }}
        >
          Enter Input #{nextInputIndex} ↓
        </button>
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <aside 
        className="output-panel-collapsed-right" 
        onClick={onToggleCollapse} 
        title="Expand Output &amp; Tools Panel (Right)"
      >
        <ChevronLeft size={14} />
        <div className="collapsed-label">
          <Terminal size={14} />
          <span>OUTPUT &amp; TOOLS</span>
        </div>
      </aside>
    );
  }

  // Calculate browser iframe source (uses backend proxy to bypass X-Frame-Options unless local)
  const isDirectLocal = browserTargetUrl.startsWith('http://localhost') || 
                        browserTargetUrl.startsWith('http://127.0.0.1') || 
                        browserTargetUrl.startsWith('/api/');
  const effectiveBrowserIframeSrc = isDirectLocal ? browserTargetUrl : getBrowserProxyUrl(browserTargetUrl);

  return (
    <aside className="output-panel-right" style={{ width: `${width}px` }}>
      {/* Top Header & Navigation Tabs */}
      <div className="panel-header">
        <div className="panel-tabs">
          <button 
            type="button"
            className={`panel-tab ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => setActiveTab('output')}
            title="Standard Output stream"
          >
            <Terminal size={13} />
            <span>Output</span>
          </button>

          <button 
            type="button"
            className={`panel-tab ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => setActiveTab('terminal')}
            title="Interactive Terminal with Stdin"
          >
            <Send size={13} />
            <span>Terminal</span>
          </button>

          <button 
            type="button"
            className={`panel-tab ${activeTab === 'problems' ? 'active' : ''}`}
            onClick={() => setActiveTab('problems')}
            style={hasProblems ? { color: 'var(--danger)' } : {}}
            title="Compilation and runtime errors"
          >
            <AlertCircle size={13} />
            <span>Problems {hasProblems ? '(1)' : ''}</span>
          </button>

          <button 
            type="button"
            className={`panel-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            title="Execution Run History"
          >
            <History size={13} />
            <span>History ({history.length})</span>
          </button>

          {/* Integrated PDF Reader Tab */}
          <button 
            type="button"
            className={`panel-tab ${activeTab === 'pdf' ? 'active' : ''}`}
            onClick={() => setActiveTab('pdf')}
            title="Local PDF Book &amp; Docs Reader"
            style={pdfUrl ? { color: 'var(--accent)' } : {}}
          >
            <BookOpen size={13} />
            <span>PDF Reader {pdfUrl ? '•' : ''}</span>
          </button>

          {/* Integrated Web Browser Tab */}
          <button 
            type="button"
            className={`panel-tab ${activeTab === 'browser' ? 'active' : ''}`}
            onClick={() => setActiveTab('browser')}
            title="Web Browser with Custom Bookmarks"
          >
            <Compass size={13} />
            <span>Browser</span>
          </button>

          {/* Live Preview Tab */}
          {showPreviewTab && (
            <button 
              type="button"
              className={`panel-tab ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
              title="HTML / Markdown Live Preview"
            >
              <Globe size={13} />
              <span>Preview</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {onClearOutput && activeTab === 'output' && (
            <button 
              className="tree-action-btn" 
              title="Clear Output" 
              onClick={onClearOutput}
            >
              <Eraser size={13} />
            </button>
          )}
          <button 
            className="tree-action-btn" 
            title="Collapse Output Panel" 
            onClick={onToggleCollapse}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Status Bar (Shown for Output, Terminal, Problems, History) */}
      {(activeTab === 'output' || activeTab === 'terminal' || activeTab === 'problems' || activeTab === 'history') && (
        <div className="output-status-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status:</span>
            <span className={`status-tag ${status}`}>{status}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
            {executionResult?.execution_time_ms !== undefined && !isRunning && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={11} /> {executionResult.execution_time_ms} ms
              </span>
            )}
            {executionResult?.exit_code !== undefined && !isRunning && (
              <span>exit {executionResult.exit_code}</span>
            )}
          </div>
        </div>
      )}

      {/* Main Panel Content Area */}
      <div className="panel-content-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Tab 1: Output */}
        {activeTab === 'output' && (
          <div className="panel-content">
            {renderInputRequiredBanner()}

            {isRunning && (
              <div style={{ color: 'var(--accent)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="spinner">⏳</span>
                <span>Executing code...</span>
              </div>
            )}

            {!isRunning && !executionResult && (
              <div className="empty-state">
                <Terminal size={36} opacity={0.3} />
                <p>Run code (<kbd>Ctrl+Enter</kbd> / <kbd>F5</kbd>) to compile and view real-time output.</p>
              </div>
            )}

            {executionResult?.stdout && (
              <div className="stream-stdout">
                <pre>{executionResult.stdout}</pre>
              </div>
            )}

            {isEofOrInputRequired && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: '6px 0',
                padding: '4px 8px',
                background: 'rgba(56, 189, 248, 0.08)',
                borderRadius: '4px',
                borderLeft: '2px solid var(--accent)',
                fontFamily: 'var(--font-code)',
                fontSize: '12px',
                color: '#38bdf8'
              }}>
                <span style={{ fontWeight: 700 }}>❯</span>
                <span className="blink-cursor">_</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                  (Waiting for input #{sessionStdin.length + 1})
                </span>
              </div>
            )}

            {!isEofOrInputRequired && executionResult?.stderr && (
              <div className="stream-stderr">
                <pre>{executionResult.stderr}</pre>
              </div>
            )}

            {executionResult?.compilation_error && (
              <div className="stream-compilation-error">
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Compilation Error:</div>
                <pre>{executionResult.compilation_error}</pre>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Terminal */}
        {activeTab === 'terminal' && (
          <div className="panel-content">
            {renderInputRequiredBanner()}

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Standard input is piped into the running program. If your code calls <code>input()</code>, enter inputs below (click the <strong>Lines</strong> icon for multiple inputs).
            </div>

            {executionResult ? (
              <div>
                {executionResult.stdout && <pre className="terminal-stdout">{executionResult.stdout}</pre>}
                {isEofOrInputRequired && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    margin: '6px 0',
                    padding: '4px 8px',
                    background: 'rgba(56, 189, 248, 0.08)',
                    borderRadius: '4px',
                    borderLeft: '2px solid var(--accent)',
                    fontFamily: 'var(--font-code)',
                    fontSize: '12px',
                    color: '#38bdf8'
                  }}>
                    <span style={{ fontWeight: 700 }}>❯</span>
                    <span className="blink-cursor">_</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                      (Waiting for input #{sessionStdin.length + 1})
                    </span>
                  </div>
                )}
                {!isEofOrInputRequired && executionResult.stderr && <pre className="terminal-stderr">{executionResult.stderr}</pre>}
              </div>
            ) : (
              <div className="empty-state">
                <Send size={32} opacity={0.3} />
                <p>No active terminal stream. Type input below and click Run.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Problems */}
        {activeTab === 'problems' && (
          <div className="panel-content">
            {!hasProblems ? (
              <div className="empty-state">
                <CheckCircle2 size={36} color="var(--success)" opacity={0.8} />
                <p style={{ color: 'var(--success)' }}>No compilation or execution errors detected.</p>
              </div>
            ) : (
              <div className="problems-list">
                <div className="problem-item error">
                  <XCircle size={16} color="var(--danger)" />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--danger)' }}>
                      {isEofOrInputRequired 
                        ? 'Input Required (EOF Encountered)' 
                        : `Execution Error (Exit code: ${executionResult?.exit_code})`}
                    </div>
                    {isEofOrInputRequired && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', marginBottom: '6px' }}>
                        The program called <code>input()</code> or read from standard input, but no input was provided. Enter inputs into the input box below and re-run.
                      </div>
                    )}
                    <pre style={{ margin: '4px 0 0 0', color: 'var(--text-main)', fontSize: '12px' }}>
                      {executionResult?.compilation_error || executionResult?.stderr}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: History */}
        {activeTab === 'history' && (
          <div className="panel-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Showing last {history.length} execution runs:
              </span>
              {history.length > 0 && onClearHistory && (
                <button className="btn" style={{ fontSize: '11px', padding: '2px 8px' }} onClick={onClearHistory}>
                  <Trash2 size={12} />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="empty-state">
                <History size={32} opacity={0.3} />
                <p>No execution history recorded yet.</p>
              </div>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="history-item"
                    onClick={() => onSelectHistoryItem && onSelectHistoryItem(item)}
                    title="Click to load output logs"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`status-tag ${item.status}`}>{item.status}</span>
                      <span style={{ fontWeight: 600, fontSize: '12px' }}>{item.file_path}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>{item.execution_time_ms} ms</span>
                      <span>exit {item.exit_code}</span>
                      <span>{new Date(item.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: In-Panel PDF Reader */}
        {activeTab === 'pdf' && (
          <div className="reader-content-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* PDF Toolbar */}
            <div className="reader-toolbar" style={{ flexShrink: 0 }}>
              <input 
                type="file" 
                ref={pdfInputRef} 
                accept="application/pdf" 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePdfUpload(file);
                }} 
              />

              <button 
                className="btn btn-primary" 
                style={{ padding: '3px 9px', fontSize: '11px' }}
                onClick={() => pdfInputRef.current?.click()}
              >
                <Upload size={12} />
                <span>Open PDF from Laptop</span>
              </button>

              {pdfName && (
                <div className="pdf-title-badge" title={pdfName} style={{ maxWidth: '180px' }}>
                  <FileText size={12} color="#f43f5e" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdfName}</span>
                  {pdfSize && <span style={{ opacity: 0.6 }}>({pdfSize} MB)</span>}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                {pdfUrl && (
                  <a 
                    href={pdfUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="tree-action-btn" 
                    title="Open PDF in Full Window / Tab"
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>

            {/* PDF Viewer Body */}
            <div 
              className={`reader-body ${isPdfDragging ? 'dragging' : ''}`}
              style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
              onDragOver={(e) => { e.preventDefault(); setIsPdfDragging(true); }}
              onDragLeave={() => setIsPdfDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsPdfDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handlePdfUpload(file);
              }}
            >
              {pdfUrl ? (
                <iframe
                  src={`${pdfUrl}#toolbar=1&navpanes=1`}
                  className="embedded-pdf-frame"
                  title="Integrated Local PDF Viewer"
                  type="application/pdf"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <div 
                  className="pdf-empty-dropzone" 
                  onClick={() => pdfInputRef.current?.click()}
                  style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                  <div className="dropzone-icon-circle">
                    <Upload size={28} color="var(--accent)" />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)', marginTop: '8px' }}>
                    Read PDF Inside Output Panel
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '300px', margin: '4px 0 12px', textAlign: 'center', lineHeight: '1.4' }}>
                    Select any textbook or documentation PDF from your laptop, or drag &amp; drop it here. You can freely switch back to the Output tab anytime!
                  </p>
                  <button type="button" className="btn btn-primary" style={{ pointerEvents: 'none', fontSize: '11px', padding: '4px 10px' }}>
                    Browse Local PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: In-Panel Web Browser */}
        {activeTab === 'browser' && (
          <div className="browser-content-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Address Bar Toolbar */}
            <div className="browser-toolbar" style={{ flexShrink: 0 }}>
              <button 
                type="button" 
                className="tree-action-btn" 
                title="Reload Page" 
                onClick={() => setBrowserIframeKey(k => k + 1)}
              >
                <RotateCw size={13} />
              </button>

              <form onSubmit={handleNavigateBrowser} style={{ flex: 1, display: 'flex' }}>
                <input 
                  type="text" 
                  className="browser-url-input" 
                  placeholder="Enter URL (e.g. https://devdocs.io or http://localhost:5173)..."
                  value={browserInputUrl}
                  onChange={(e) => setBrowserInputUrl(e.target.value)}
                />
              </form>

              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ padding: '3px 9px', fontSize: '11px' }}
                onClick={handleNavigateBrowser}
              >
                Go
              </button>

              <button
                type="button"
                className="tree-action-btn"
                title="Bookmark current URL"
                onClick={() => {
                  setNewBookmarkUrl(browserTargetUrl);
                  try {
                    setNewBookmarkName(new URL(browserTargetUrl).hostname.replace('www.', ''));
                  } catch {
                    setNewBookmarkName('Bookmark');
                  }
                  setIsAddingBookmark(true);
                }}
                style={{ color: 'var(--accent)' }}
              >
                <BookmarkPlus size={14} />
              </button>

              <a 
                href={browserTargetUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="tree-action-btn" 
                title="Open website in new browser tab"
                style={{ display: 'inline-flex', alignItems: 'center' }}
              >
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Bookmarks Bar */}
            <div className="browser-bookmarks-bar" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px', flexShrink: 0 }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Bookmark size={10} />
                <span>Bookmarks:</span>
              </span>

              {bookmarks.map(bm => (
                <div key={bm.id} className="bookmark-chip-wrapper" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="bookmark-chip"
                    title={`${bm.name} - ${bm.url}`}
                    onClick={() => handleOpenDoc(bm.url)}
                  >
                    <span>{bm.name}</span>
                  </button>
                  <button
                    type="button"
                    className="bookmark-remove-btn"
                    title={`Remove ${bm.name}`}
                    onClick={(e) => handleDeleteBookmark(bm.id, e)}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="bookmark-chip add-btn"
                title="Add New Custom Bookmark"
                onClick={() => setIsAddingBookmark(v => !v)}
              >
                <Plus size={11} />
                <span>Add</span>
              </button>

              {/* Offline Cheatsheets Divider & Quick Chips */}
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginLeft: '6px', textTransform: 'uppercase' }}>
                Offline:
              </span>
              {['python', 'javascript', 'c', 'html'].map(topic => (
                <button
                  key={topic}
                  type="button"
                  className="bookmark-chip"
                  style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                  title={`Offline ${topic.toUpperCase()} Cheatsheet`}
                  onClick={() => handleOpenOfflineDoc(topic)}
                >
                  {topic.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Add Bookmark Expandable Banner */}
            {isAddingBookmark && (
              <form onSubmit={handleSaveNewBookmark} className="add-bookmark-banner" style={{ flexShrink: 0 }}>
                <input 
                  type="text" 
                  placeholder="Bookmark Name" 
                  value={newBookmarkName} 
                  onChange={(e) => setNewBookmarkName(e.target.value)} 
                  className="bookmark-inline-input"
                  style={{ width: '130px' }}
                  autoFocus
                />
                <input 
                  type="text" 
                  placeholder="https://..." 
                  value={newBookmarkUrl} 
                  onChange={(e) => setNewBookmarkUrl(e.target.value)} 
                  className="bookmark-inline-input"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '11px', height: '24px' }}>
                  Save
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ padding: '2px 6px', fontSize: '11px', height: '24px' }}
                  onClick={() => setIsAddingBookmark(false)}
                >
                  <X size={12} />
                </button>
              </form>
            )}

            {/* Embedded Web View */}
            <div className="browser-iframe-container" style={{ flex: 1, position: 'relative' }}>
              <iframe
                key={browserIframeKey}
                src={effectiveBrowserIframeSrc}
                className="embedded-web-frame"
                title="Integrated Web Browser"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                style={{ width: '100%', height: '100%', border: 'none', background: '#0d1117' }}
              />
            </div>
          </div>
        )}

        {/* Tab 7: Live HTML & Markdown Preview */}
        {activeTab === 'preview' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <PreviewPanel
              width="100%"
              previewFile={previewFile}
              onClose={() => setActiveTab('output')}
              refreshTrigger={previewRefreshTrigger}
            />
          </div>
        )}
      </div>

      {/* Stdin Input Bar at Bottom (Active for Output, Terminal, Problems, History) */}
      {(activeTab === 'output' || activeTab === 'terminal' || activeTab === 'problems' || activeTab === 'history') && (
        <div 
          className={`stdin-bar ${isEofOrInputRequired ? 'needs-input' : ''}`} 
          style={{ 
            flexDirection: isMultilineStdin ? 'column' : 'row', 
            alignItems: isMultilineStdin ? 'stretch' : 'center', 
            gap: '8px' 
          }}
        >
          <div style={{ display: 'flex', alignItems: isMultilineStdin ? 'flex-start' : 'center', gap: '8px', flex: 1 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700, paddingTop: isMultilineStdin ? '8px' : '0' }}>&gt;</span>
            {!isMultilineStdin ? (
              <input
                ref={stdinInputRef}
                type="text"
                className={`stdin-input ${isEofOrInputRequired ? 'needs-input' : ''}`}
                placeholder={isEofOrInputRequired ? `Program waiting for input #${(sessionStdin?.length || 0) + 1}! Type here and press Enter...` : "Stdin input (type here, or click ☰ for multiple lines)..."}
                value={stdinValue}
                onChange={(e) => handleStdinChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSendStdin();
                  }
                }}
              />
            ) : (
              <textarea
                ref={stdinInputRef}
                className={`stdin-input ${isEofOrInputRequired ? 'needs-input' : ''}`}
                rows={4}
                style={{
                  height: '96px',
                  resize: 'vertical',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  padding: '10px 12px'
                }}
                placeholder={isEofOrInputRequired ? `Program waiting for input #${(sessionStdin?.length || 0) + 1}! Enter lines and press Ctrl+Enter to Run...` : "Stdin inputs (one line per input() prompt; press Ctrl+Enter to Run)..."}
                value={stdinValue}
                onChange={(e) => handleStdinChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    onSendStdin();
                  }
                }}
              />
            )}
            
            <button
              type="button"
              className="tree-action-btn"
              title={isMultilineStdin ? "Switch to single-line input" : "Switch to multi-line input (for multiple input() calls)"}
              onClick={() => setIsMultilineStdin(prev => !prev)}
              style={isMultilineStdin ? { color: 'var(--accent)', background: 'var(--bg-tertiary)' } : {}}
            >
              <ListPlus size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: isMultilineStdin ? 'flex-end' : 'flex-start', gap: '6px' }}>
            <button 
              className={`btn ${isEofOrInputRequired ? 'btn-primary pulse-btn' : 'btn-primary'}`} 
              onClick={onSendStdin} 
              title={isMultilineStdin ? "Send All Lines & Execute (Ctrl+Enter)" : "Send Stdin & Execute (Enter)"}
              disabled={isRunning}
              style={{ minHeight: isMultilineStdin ? '34px' : '44px', padding: '0 16px' }}
            >
              <Play size={13} fill="currentColor" />
              <span>{isMultilineStdin ? "Run with Inputs" : (isEofOrInputRequired ? `Send Input #${(sessionStdin?.length || 0) + 1}` : "Run")}</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
