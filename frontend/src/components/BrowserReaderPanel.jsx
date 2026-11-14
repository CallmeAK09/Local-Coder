import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Globe, 
  Upload, 
  RotateCw, 
  ExternalLink, 
  ArrowLeft, 
  ArrowRight, 
  X, 
  FileText, 
  Maximize2,
  FolderDown,
  Compass,
  Bookmark,
  BookmarkPlus,
  Plus,
  Trash2
} from 'lucide-react';

const DEFAULT_BOOKMARKS = [
  { id: 'devdocs', name: 'DevDocs', url: 'https://devdocs.io', isDefault: true },
  { id: 'mdn', name: 'MDN Web', url: 'https://developer.mozilla.org', isDefault: true },
  { id: 'python', name: 'Python 3', url: 'https://docs.python.org/3/', isDefault: true },
  { id: 'wikipedia', name: 'Wikipedia', url: 'https://en.wikipedia.org', isDefault: true },
  { id: 'localhost', name: 'Localhost', url: 'http://localhost:5173', isDefault: true },
];

export default function BrowserReaderPanel({
  width = 480,
  onClose,
  initialPdfUrl = null,
  initialPdfName = '',
  onSavePdfToWorkspace
}) {
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' | 'browser'
  
  // PDF state
  const [pdfUrl, setPdfUrl] = useState(initialPdfUrl);
  const [pdfName, setPdfName] = useState(initialPdfName);
  const [pdfSize, setPdfSize] = useState(null);
  const [pdfFileObj, setPdfFileObj] = useState(null);
  const fileInputRef = useRef(null);

  // Browser state
  const [inputUrl, setInputUrl] = useState('https://devdocs.io');
  const [currentUrl, setCurrentUrl] = useState('https://devdocs.io');
  const [iframeKey, setIframeKey] = useState(0);

  // Bookmarks state (with localStorage persistence)
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('local_coder_bookmarks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading bookmarks from localStorage:', e);
    }
    return DEFAULT_BOOKMARKS;
  });

  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');

  // Persist bookmarks whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('local_coder_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Error saving bookmarks to localStorage:', e);
    }
  }, [bookmarks]);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (initialPdfUrl) {
      setPdfUrl(initialPdfUrl);
      setPdfName(initialPdfName || 'document.pdf');
      setActiveTab('pdf');
    }
  }, [initialPdfUrl, initialPdfName]);

  // Handle local PDF upload from laptop
  const handlePdfFile = (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF (.pdf) file.');
      return;
    }

    // Revoke previous blob URL if exists
    if (pdfUrl && pdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPdfUrl(objectUrl);
    setPdfName(file.name);
    setPdfSize((file.size / 1024 / 1024).toFixed(2));
    setPdfFileObj(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePdfFile(file);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handlePdfFile(file);
    }
  };

  // Browser navigation
  const handleNavigate = (e) => {
    e?.preventDefault();
    let url = inputUrl.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.startsWith('localhost') || url.startsWith('127.0.0.1')) {
        url = 'http://' + url;
      } else {
        url = 'https://' + url;
      }
    }
    setInputUrl(url);
    setCurrentUrl(url);
    setIframeKey(k => k + 1);
  };

  const handleQuickDoc = (url) => {
    setInputUrl(url);
    setCurrentUrl(url);
    setIframeKey(k => k + 1);
  };

  const handleOpenAddBookmark = () => {
    try {
      const u = new URL(currentUrl);
      setNewBookmarkName(u.hostname.replace('www.', ''));
    } catch {
      setNewBookmarkName('My Bookmark');
    }
    setNewBookmarkUrl(currentUrl);
    setIsAddingBookmark(true);
  };

  const handleSaveNewBookmark = (e) => {
    e?.preventDefault();
    let name = newBookmarkName.trim();
    let url = newBookmarkUrl.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.startsWith('localhost') || url.startsWith('127.0.0.1')) {
        url = 'http://' + url;
      } else {
        url = 'https://' + url;
      }
    }

    if (!name) {
      try {
        name = new URL(url).hostname.replace('www.', '');
      } catch {
        name = 'Bookmark';
      }
    }

    const newBm = {
      id: Date.now().toString(),
      name,
      url,
      isDefault: false
    };

    setBookmarks(prev => [...prev, newBm]);
    setIsAddingBookmark(false);
    setNewBookmarkName('');
    setNewBookmarkUrl('');
  };

  const handleDeleteBookmark = (id, e) => {
    e?.stopPropagation();
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const handleSaveToWorkspace = () => {
    if (pdfFileObj && onSavePdfToWorkspace) {
      onSavePdfToWorkspace(pdfFileObj);
    }
  };

  return (
    <aside className="browser-reader-panel" style={{ width: `${width}px` }}>
      {/* Top Header Mode Tabs */}
      <div className="panel-header" style={{ justifyContent: 'space-between', padding: '0 8px' }}>
        <div className="panel-tabs">
          <button 
            type="button"
            className={`panel-tab ${activeTab === 'pdf' ? 'active' : ''}`}
            onClick={() => setActiveTab('pdf')}
          >
            <BookOpen size={13} />
            <span>PDF Reader</span>
          </button>

          <button 
            type="button"
            className={`panel-tab ${activeTab === 'browser' ? 'active' : ''}`}
            onClick={() => setActiveTab('browser')}
          >
            <Globe size={13} />
            <span>Web Browser</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button 
            type="button"
            className="tree-action-btn" 
            title="Close Reader & Browser Panel" 
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Mode 1: PDF Reader */}
      {activeTab === 'pdf' && (
        <div className="reader-content-container">
          {/* PDF Toolbar */}
          <div className="reader-toolbar">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="application/pdf" 
              style={{ display: 'none' }} 
              onChange={handleFileInputChange} 
            />

            <button 
              className="btn btn-primary" 
              style={{ padding: '4px 10px', fontSize: '11px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={13} />
              <span>Open PDF from Laptop</span>
            </button>

            {pdfName && (
              <div className="pdf-title-badge" title={pdfName}>
                <FileText size={12} color="#f43f5e" />
                <span>{pdfName}</span>
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
            className={`reader-body ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1`}
                className="embedded-pdf-frame"
                title="Local PDF Viewer"
                type="application/pdf"
              />
            ) : (
              <div className="pdf-empty-dropzone" onClick={() => fileInputRef.current?.click()}>
                <div className="dropzone-icon-circle">
                  <Upload size={32} color="var(--accent)" />
                </div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)', marginTop: '10px' }}>
                  Open PDF to Read Inside LOCAL CODER
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '320px', margin: '6px 0 16px', lineHeight: '1.5' }}>
                  Click to select any PDF book, assignment, or documentation file from your laptop, or drag &amp; drop it here.
                </p>
                <button type="button" className="btn btn-primary" style={{ pointerEvents: 'none' }}>
                  Browse Local PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Web Browser */}
      {activeTab === 'browser' && (
        <div className="browser-content-container">
          {/* Address Bar Toolbar */}
          <div className="browser-toolbar">
            <button 
              type="button" 
              className="tree-action-btn" 
              title="Reload Page" 
              onClick={() => setIframeKey(k => k + 1)}
            >
              <RotateCw size={13} />
            </button>

            <form onSubmit={handleNavigate} style={{ flex: 1, display: 'flex' }}>
              <input 
                type="text" 
                className="browser-url-input" 
                placeholder="Enter URL (e.g. https://devdocs.io or http://localhost:5173)..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
            </form>

            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ padding: '3px 9px', fontSize: '11px' }}
              onClick={handleNavigate}
            >
              Go
            </button>

            <button
              type="button"
              className="tree-action-btn"
              title="Add this page to Bookmarks"
              onClick={handleOpenAddBookmark}
              style={{ color: 'var(--accent)' }}
            >
              <BookmarkPlus size={14} />
            </button>

            <a 
              href={currentUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="tree-action-btn" 
              title="Open website in new browser tab"
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Quick Bookmarks / Documentation Bar with Add Bookmark option */}
          <div className="browser-bookmarks-bar" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Bookmark size={11} />
              <span>Bookmarks:</span>
            </span>

            {bookmarks.map(bm => (
              <div key={bm.id} className="bookmark-chip-wrapper" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <button
                  type="button"
                  className="bookmark-chip"
                  title={`${bm.name} - ${bm.url}`}
                  onClick={() => handleQuickDoc(bm.url)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
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
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)', fontWeight: 600 }}
            >
              <Plus size={11} />
              <span>Add</span>
            </button>
          </div>

          {/* Add Bookmark Expandable Form */}
          {isAddingBookmark && (
            <form onSubmit={handleSaveNewBookmark} className="add-bookmark-banner">
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

          {/* Browser Iframe Body */}
          <div className="browser-iframe-container">
            <iframe
              key={iframeKey}
              src={currentUrl}
              className="embedded-web-frame"
              title="Integrated Web Browser"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      )}
    </aside>
  );
}

