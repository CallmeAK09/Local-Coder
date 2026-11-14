import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Plus, 
  FolderPlus
} from 'lucide-react';

export function getFileIcon(extension, language) {
  const ext = (extension || '').toLowerCase();
  switch (ext) {
    case '.py':
      return <FileCode size={14} color="#38bdf8" />;
    case '.js':
    case '.mjs':
      return <FileCode size={14} color="#facc15" />;
    case '.c':
    case '.h':
      return <FileCode size={14} color="#60a5fa" />;
    case '.java':
      return <FileCode size={14} color="#f87171" />;
    case '.html':
    case '.htm':
      return <FileCode size={14} color="#fb923c" />;
    case '.css':
      return <FileCode size={14} color="#38bdf8" />;
    case '.json':
      return <FileCode size={14} color="#a3e635" />;
    case '.pdf':
      return <FileText size={14} color="#f43f5e" />;
    case '.md':
      return <FileText size={14} color="#cbd5e1" />;
    default:
      return <FileText size={14} color="var(--text-muted)" />;
  }
}

export default function FileExplorer({
  tree = [],
  activeFile,
  onSelectFile,
  onRefresh,
  onCreateFile,
  onCreateFolder,
  onRenameItem,
  onDeleteItem,
  width = 240
}) {
  const [expanded, setExpanded] = useState({
    'python': true,
    'javascript': true,
    'c': true,
    'java': true,
    'web': true,
  });

  const toggleFolder = (path) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (items, depth = 0) => {
    return items.map((item) => {
      const isDir = item.is_dir;
      const isExp = expanded[item.path] ?? false;
      const isActive = activeFile?.path === item.path;

      if (isDir) {
        return (
          <div key={item.path}>
            <div 
              className={`tree-node ${isActive ? 'active' : ''}`}
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
              onClick={() => toggleFolder(item.path)}
            >
              {isExp ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
              {isExp ? <FolderOpen size={15} color="#eab308" /> : <Folder size={15} color="#eab308" />}
              <span style={{ fontWeight: 500 }}>{item.name}</span>

              <div className="tree-actions" onClick={e => e.stopPropagation()}>
                <button 
                  className="tree-action-btn" 
                  title="New File inside folder"
                  onClick={() => onCreateFile(item.path)}
                >
                  <Plus size={13} />
                </button>
                <button 
                  className="tree-action-btn" 
                  title="Rename folder"
                  onClick={() => onRenameItem(item.path)}
                >
                  <Edit3 size={13} />
                </button>
                <button 
                  className="tree-action-btn" 
                  title="Delete folder"
                  onClick={() => onDeleteItem(item.path, true)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {isExp && item.children && (
              <div>{renderTree(item.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      return (
        <div 
          key={item.path}
          className={`tree-node ${isActive ? 'active' : ''}`}
          style={{ paddingLeft: `${depth * 14 + 18}px` }}
          onClick={() => onSelectFile(item)}
        >
          {getFileIcon(item.extension, item.language)}
          <span>{item.name}</span>

          <div className="tree-actions" onClick={e => e.stopPropagation()}>
            <button 
              className="tree-action-btn" 
              title="Rename file"
              onClick={() => onRenameItem(item.path)}
            >
              <Edit3 size={13} />
            </button>
            <button 
              className="tree-action-btn" 
              title="Delete file"
              onClick={() => onDeleteItem(item.path, false)}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <aside className="sidebar" style={{ width: `${width}px` }}>
      <div className="sidebar-header">
        <span>Workspace</span>
        <div className="sidebar-header-actions">
          <button className="tree-action-btn" title="New Root File" onClick={() => onCreateFile('')}>
            <Plus size={14} />
          </button>
          <button className="tree-action-btn" title="New Root Folder" onClick={() => onCreateFolder('')}>
            <FolderPlus size={14} />
          </button>
          <button className="tree-action-btn" title="Refresh Workspace Tree" onClick={onRefresh}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="file-tree-container">
        {tree.length === 0 ? (
          <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>
            No files in workspace.
          </div>
        ) : (
          renderTree(tree)
        )}
      </div>
    </aside>
  );
}

