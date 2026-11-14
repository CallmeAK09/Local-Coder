import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import FileExplorer from './components/FileExplorer';
import OutputPanel from './components/OutputPanel';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import BrowserReaderPanel from './components/BrowserReaderPanel';
import DependencyModal from './components/DependencyModal';
import SettingsModal from './components/SettingsModal';
import NewFileModal from './components/NewFileModal';
import NewFolderModal from './components/NewFolderModal';
import CustomDialogModal from './components/CustomDialogModal';

import {
  fetchWorkspaceTree,
  readFile,
  saveFile,
  createFolder,
  renameItem,
  deleteItem,
  executeCode,
  stopExecution,
  fetchExecutionHistory,
  clearExecutionHistory,
  checkDependencies,
  stopServer
} from './services/api';

const STARTER_TEMPLATES = {
  '.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>
`,
  '.js': `console.log("Hello from JavaScript!");\n`,
  '.py': `print("Hello from Python!")\n`,
  '.c': `#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}\n`,
  '.h': `#ifndef HEADER_H\n#define HEADER_H\n\n// Header declarations\n\n#endif\n`,
  '.java': `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}\n`,
  '.css': `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n`,
  '.json': `{\n  "name": "project",\n  "version": "1.0.0"\n}\n`,
  '.md': `# Document\n\nWrite markdown here.\n`,
  '.txt': ``
};

const extractFolders = (items) => {
  let list = [];
  for (const item of items) {
    if (item.is_dir) {
      list.push(item.path);
      if (item.children) {
        list = list.concat(extractFolders(item.children));
      }
    }
  }
  return list;
};

export default function App() {
  // State: Workspace & Files
  const [workspaceTree, setWorkspaceTree] = useState([]);
  const [workspaceRoot, setWorkspaceRoot] = useState('');
  const [tabs, setTabs] = useState([]);
  const [activeTabPath, setActiveTabPath] = useState(null);

  // Layout: File explorer hidden by default, shown only when clicked
  const [showExplorer, setShowExplorer] = useState(false);
  
  // Output panel on the right side
  const [showOutput, setShowOutput] = useState(true);
  const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);
  const [outputPanelTab, setOutputPanelTab] = useState('output'); // 'output' | 'terminal' | 'problems' | 'history' | 'pdf' | 'browser' | 'preview'

  // Document Preview state (HTML & Markdown files)
  const [previewFile, setPreviewFile] = useState('index.html');
  const [previewRefreshTrigger, setPreviewRefreshTrigger] = useState(0);

  // PDF Reader state (integrated inside output panel)
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [selectedPdfName, setSelectedPdfName] = useState('');

  // Floating Modals for New File & New Folder
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [modalParentFolder, setModalParentFolder] = useState('');

  // State: Execution
  const [isRunning, setIsRunning] = useState(false);
  const [activeExecId, setActiveExecId] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [stdinValue, setStdinValue] = useState('');
  const [executionHistory, setExecutionHistory] = useState([]);

  // State: Dependencies
  const [dependenciesStatus, setDependenciesStatus] = useState(null);
  const [isRefreshingDeps, setIsRefreshingDeps] = useState(false);
  const [showDepModal, setShowDepModal] = useState(false);

  // State: Settings & Theme
  const [theme, setTheme] = useState('dark');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 14,
    tabSize: 4,
    minimap: true,
    wordWrap: 'on',
    suggestions: true,
    timeout: 20
  });

  // State: Panel dimensions
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [outputWidth, setOutputWidth] = useState(420);
  const [previewWidth, setPreviewWidth] = useState(480);
  const [serverStopped, setServerStopped] = useState(false);

  // Custom Universal Dialog Modal State
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'alert', // 'alert' | 'confirm' | 'prompt'
    title: '',
    message: '',
    defaultValue: '',
    placeholder: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    variant: 'primary',
    resolve: null
  });

  const showAlert = useCallback((message, title = 'Notification', variant = 'primary') => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: 'alert',
        title,
        message,
        defaultValue: '',
        placeholder: '',
        confirmText: 'OK',
        cancelText: 'Cancel',
        variant,
        resolve
      });
    });
  }, []);

  const showConfirm = useCallback((message, title = 'Confirm Action', options = {}) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        defaultValue: '',
        placeholder: '',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'primary',
        resolve
      });
    });
  }, []);

  const showPrompt = useCallback((message, defaultValue = '', title = 'Input Required', options = {}) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: 'prompt',
        title,
        message,
        defaultValue,
        placeholder: options.placeholder || '',
        confirmText: options.confirmText || 'OK',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'primary',
        resolve
      });
    });
  }, []);

  const handleDialogConfirm = (val) => {
    if (dialogState.resolve) {
      if (dialogState.type === 'prompt') {
        dialogState.resolve(val);
      } else if (dialogState.type === 'confirm') {
        dialogState.resolve(true);
      } else {
        dialogState.resolve(true);
      }
    }
    setDialogState(prev => ({ ...prev, isOpen: false, resolve: null }));
  };

  const handleDialogCancel = () => {
    if (dialogState.resolve) {
      if (dialogState.type === 'prompt') {
        dialogState.resolve(null);
      } else {
        dialogState.resolve(false);
      }
    }
    setDialogState(prev => ({ ...prev, isOpen: false, resolve: null }));
  };

  const handleStopServer = async () => {
    const confirmed = await showConfirm(
      "Shut down the Local Compiler background server? This will release port 8000.",
      "Shut Down Server",
      { variant: "danger", confirmText: "Shut Down" }
    );
    if (confirmed) {
      try {
        await stopServer();
      } catch (e) {
        // Server will terminate and close socket
      }
      setServerStopped(true);
    }
  };

  // Resizing refs
  const isResizingSidebar = useRef(false);
  const isResizingOutput = useRef(false);
  const isResizingPreview = useRef(false);
  const isResizingBrowserReader = useRef(false);

  // Session ID for tab lifecycle tracking
  const sessionId = useRef(
    sessionStorage.getItem('pwa_session_id') ||
    Math.random().toString(36).substring(2) + Date.now().toString(36)
  ).current;

  // Manage Heartbeat and Auto-Shutdown on tab/window close
  useEffect(() => {
    sessionStorage.setItem('pwa_session_id', sessionId);

    // Initial heartbeat & sync PWA desktop launcher
    fetch(`/api/server/heartbeat/?session_id=${sessionId}`, { method: 'POST' }).catch(() => {});
    fetch('/api/pwa/sync/', { method: 'POST' }).catch(() => {});

    // Periodic heartbeat every 4s
    const heartbeatInterval = setInterval(() => {
      fetch(`/api/server/heartbeat/?session_id=${sessionId}`, { method: 'POST' }).catch(() => {});
    }, 4000);

    // Sync PWA launcher when user installs app from browser
    const handleAppInstalled = () => {
      fetch('/api/pwa/sync/', { method: 'POST' }).catch(() => {});
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Send leave beacon on tab close / window unload
    const handleLeave = () => {
      const url = `/api/server/client-leave/?session_id=${sessionId}`;
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url);
      } else {
        fetch(url, { method: 'POST', keepalive: true }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleLeave);
    window.addEventListener('pagehide', handleLeave);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('beforeunload', handleLeave);
      window.removeEventListener('pagehide', handleLeave);
    };
  }, [sessionId]);

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load workspace tree, dependencies, and execution history
  const loadWorkspace = useCallback(async () => {
    try {
      const data = await fetchWorkspaceTree();
      setWorkspaceTree(data.tree || []);
      setWorkspaceRoot(data.workspace_root || '');

      // If user has existing files in workspace and no tab is open yet, open the first file
      if (data.tree && data.tree.length > 0) {
        setTabs(currentTabs => {
          if (currentTabs.length === 0) {
            const firstFile = data.tree.find(item => !item.is_dir) || 
                              (data.tree[0].children && data.tree[0].children[0]);
            if (firstFile && firstFile.extension !== '.pdf') {
              readFile(firstFile.path).then(fileData => {
                setTabs([{
                  path: fileData.path,
                  name: fileData.name,
                  content: fileData.content,
                  language: fileData.language,
                  extension: firstFile.extension,
                  isDirty: false
                }]);
                setActiveTabPath(fileData.path);
              }).catch(() => {});
            }
          }
          return currentTabs;
        });
      }
    } catch (err) {
      console.error('Error loading workspace tree:', err);
    }
  }, []);

  const loadDependencies = useCallback(async () => {
    try {
      setIsRefreshingDeps(true);
      const data = await checkDependencies();
      setDependenciesStatus(data);
    } catch (err) {
      console.error('Error checking dependencies:', err);
    } finally {
      setIsRefreshingDeps(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchExecutionHistory();
      setExecutionHistory(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  }, []);

  useEffect(() => {
    loadWorkspace();
    loadDependencies();
    loadHistory();
  }, [loadWorkspace, loadDependencies, loadHistory]);

  // Active tab helper
  const activeTab = tabs.find(t => t.path === activeTabPath);
  const isHtml = activeTab?.extension === '.html' || activeTab?.extension === '.htm' || activeTab?.language === 'html';
  const isMarkdown = activeTab?.extension === '.md' || activeTab?.extension === '.markdown' || activeTab?.language === 'markdown';
  const isPreviewableFile = isHtml || isMarkdown;

  const isItemPreviewable = (item) => {
    const ext = (item?.extension || '').toLowerCase();
    const lang = (item?.language || '').toLowerCase();
    return ext === '.html' || ext === '.htm' || ext === '.md' || ext === '.markdown' || lang === 'html' || lang === 'markdown';
  };

  // File Selection / Open
  const handleSelectFile = async (item) => {
    // If it's a PDF file, open it directly in the integrated PDF Reader tab!
    if (item.extension === '.pdf') {
      setSelectedPdfUrl(`/api/workspace/preview/${encodeURIComponent(item.path)}`);
      setSelectedPdfName(item.name);
      setOutputPanelTab('pdf');
      setShowOutput(true);
      setIsOutputCollapsed(false);
      return;
    }

    const existing = tabs.find(t => t.path === item.path);
    if (existing) {
      setActiveTabPath(item.path);
      if (isItemPreviewable(item)) {
        setPreviewFile(item.path);
        setOutputPanelTab('preview');
        setShowOutput(true);
        setIsOutputCollapsed(false);
      }
      return;
    }

    try {
      const fileData = await readFile(item.path);
      const newTab = {
        path: fileData.path,
        name: fileData.name,
        content: fileData.content,
        language: fileData.language,
        extension: item.extension,
        isDirty: false
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabPath(fileData.path);

      if (isItemPreviewable(item)) {
        setPreviewFile(fileData.path);
        setOutputPanelTab('preview');
        setShowOutput(true);
        setIsOutputCollapsed(false);
      }
    } catch (err) {
      showAlert(`Could not open file: ${err.message}`, 'File Open Error', 'danger');
    }
  };

  // Close Tab
  const handleCloseTab = async (path) => {
    const tabToClose = tabs.find(t => t.path === path);
    if (tabToClose?.isDirty) {
      const confirmed = await showConfirm(
        `File "${tabToClose.name}" has unsaved changes. Close anyway?`,
        'Unsaved Changes',
        { variant: 'warning', confirmText: 'Close Without Saving' }
      );
      if (!confirmed) {
        return;
      }
    }

    const filtered = tabs.filter(t => t.path !== path);
    setTabs(filtered);
    if (activeTabPath === path) {
      setActiveTabPath(filtered.length > 0 ? filtered[filtered.length - 1].path : null);
    }
  };

  // Content change
  const handleChangeContent = (path, newContent) => {
    setTabs(prev => prev.map(t => {
      if (t.path === path) {
        return { ...t, content: newContent, isDirty: true };
      }
      return t;
    }));
  };

  // Save File
  const handleSave = async () => {
    if (!activeTab) return;

    try {
      await saveFile(activeTab.path, activeTab.content);
      setTabs(prev => prev.map(t => {
        if (t.path === activeTab.path) {
          return { ...t, isDirty: false };
        }
        return t;
      }));

      if (isHtml || isMarkdown || activeTab.path.endsWith('.css') || activeTab.path.endsWith('.js')) {
        setPreviewRefreshTrigger(k => k + 1);
      }
    } catch (err) {
      showAlert(`Save failed: ${err.message}`, 'Save Error', 'danger');
    }
  };

  // Run Active File (Auto-saves file immediately before execution)
  const handleRun = async (overrideStdin = null) => {
    if (!activeTab) {
      showAlert('Please select or create a file to execute.', 'No File Selected', 'warning');
      return;
    }

    // 1. Auto-save file automatically when hitting run
    if (activeTab.isDirty) {
      try {
        await saveFile(activeTab.path, activeTab.content);
        setTabs(prev => prev.map(t => t.path === activeTab.path ? { ...t, isDirty: false } : t));
        if (isHtml || isMarkdown || activeTab.path.endsWith('.css') || activeTab.path.endsWith('.js')) {
          setPreviewRefreshTrigger(k => k + 1);
        }
      } catch (saveErr) {
        console.error('Auto-save error before execution:', saveErr);
      }
    }

    // 2. HTML & Markdown documents are rendered live in preview tab
    if (isPreviewableFile) {
      setPreviewFile(activeTab.path);
      setOutputPanelTab('preview');
      setShowOutput(true);
      setIsOutputCollapsed(false);
      return;
    }

    setOutputPanelTab('output');
    setShowOutput(true);
    setIsOutputCollapsed(false);

    if (dependenciesStatus && dependenciesStatus.dependencies) {
      const depMap = { python: 'python', javascript: 'node', c: 'gcc', java: 'java' };
      const reqId = depMap[activeTab.language];
      if (reqId) {
        const dep = dependenciesStatus.dependencies.find(d => d.id === reqId);
        if (dep && !dep.installed) {
          setShowDepModal(true);
          setExecutionResult({
            status: 'ERROR',
            exit_code: 127,
            stdout: '',
            stderr: `Compiler/Interpreter Missing: ${dep.name} is required to run '${activeTab.name}'.`,
            compilation_error: '',
            execution_time_ms: 0
          });
          return;
        }
      }
    }

    const execId = crypto.randomUUID();
    setActiveExecId(execId);
    setIsRunning(true);

    try {
      const inputToSend = overrideStdin !== null ? overrideStdin : stdinValue;
      const res = await executeCode({
        path: activeTab.path,
        stdin: inputToSend,
        timeout: settings.timeout || 20,
        exec_id: execId,
        content: activeTab.content
      });

      setTabs(prev => prev.map(t => t.path === activeTab.path ? { ...t, isDirty: false } : t));
      setExecutionResult(res);
      loadHistory();
    } catch (err) {
      setExecutionResult({
        status: 'ERROR',
        exit_code: 1,
        stdout: '',
        stderr: err.message,
        compilation_error: '',
        execution_time_ms: 0
      });
    } finally {
      setIsRunning(false);
      setActiveExecId(null);
    }
  };

  // Stop active execution
  const handleStop = async () => {
    if (!activeExecId) return;
    try {
      await stopExecution(activeExecId);
      setIsRunning(false);
      setExecutionResult(prev => ({
        ...prev,
        status: 'TERMINATED',
        stderr: (prev?.stderr || '') + '\n[Execution stopped by user]'
      }));
    } catch (err) {
      console.error('Stop error:', err);
    }
  };

  const handleSendStdin = () => {
    handleRun(stdinValue);
  };

  // Open Floating New File Form
  const handleOpenNewFileModal = (parentFolder = '') => {
    setModalParentFolder(parentFolder);
    setShowNewFileModal(true);
  };

  // Open Floating New Folder Form
  const handleOpenNewFolderModal = (parentFolder = '') => {
    setModalParentFolder(parentFolder);
    setShowNewFolderModal(true);
  };

  // Confirm Creation of New File from Floating Form
  const handleConfirmCreateFile = async (fullPath, ext, useTemplate) => {
    let initialContent = '';
    if (useTemplate) {
      initialContent = STARTER_TEMPLATES[ext] || '';
    }

    try {
      await saveFile(fullPath, initialContent);
      await loadWorkspace();
      handleSelectFile({ 
        path: fullPath, 
        name: fullPath.split('/').pop(), 
        extension: ext 
      });
    } catch (err) {
      showAlert(`Error creating file: ${err.message}`, 'File Creation Error', 'danger');
    }
  };

  // Confirm Creation of New Folder
  const handleConfirmCreateFolder = async (fullPath) => {
    try {
      await createFolder(fullPath);
      await loadWorkspace();
    } catch (err) {
      showAlert(`Error creating folder: ${err.message}`, 'Folder Creation Error', 'danger');
    }
  };

  // Rename
  const handleRenameItem = async (oldPath) => {
    const currentName = oldPath.split('/').pop();
    const newName = await showPrompt(
      `Enter new name for "${currentName}":`,
      currentName,
      'Rename Item',
      { confirmText: 'Rename', placeholder: 'Enter new name...' }
    );
    if (!newName || newName.trim() === '' || newName.trim() === currentName) return;

    const cleanNewName = newName.trim();
    const parentDir = oldPath.includes('/') ? oldPath.substring(0, oldPath.lastIndexOf('/')) : '';
    const newPath = parentDir ? `${parentDir}/${cleanNewName}` : cleanNewName;

    try {
      await renameItem(oldPath, newPath);
      await loadWorkspace();
      setTabs(prev => prev.map(t => {
        if (t.path === oldPath) {
          return { ...t, path: newPath, name: cleanNewName };
        }
        return t;
      }));
      if (activeTabPath === oldPath) {
        setActiveTabPath(newPath);
      }
    } catch (err) {
      showAlert(`Rename failed: ${err.message}`, 'Rename Error', 'danger');
    }
  };

  // Delete
  const handleDeleteItem = async (path, isDir) => {
    const name = path.split('/').pop();
    const confirmed = await showConfirm(
      `Are you sure you want to delete ${isDir ? 'folder' : 'file'} "${name}"? This action cannot be undone.`,
      `Delete ${isDir ? 'Folder' : 'File'}`,
      { variant: 'danger', confirmText: 'Delete' }
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteItem(path);
      await loadWorkspace();
      setTabs(prev => prev.filter(t => !t.path.startsWith(path)));
      if (activeTabPath && activeTabPath.startsWith(path)) {
        setActiveTabPath(null);
      }
    } catch (err) {
      showAlert(`Delete failed: ${err.message}`, 'Delete Error', 'danger');
    }
  };

  // Clear Output
  const handleClearOutput = () => {
    setExecutionResult(null);
  };

  // Keyboard Shortcuts (Ctrl+S / F5 / Ctrl+Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
      if (((e.ctrlKey || e.metaKey) && e.key === 'Enter') || e.key === 'F5') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabPath, tabs, stdinValue, settings.timeout]);

  // Resizing mouse events
  const startResizeSidebar = () => { isResizingSidebar.current = true; };
  const startResizeOutput = () => { isResizingOutput.current = true; };
  const startResizePreview = () => { isResizingPreview.current = true; };
  const startResizeBrowserReader = () => { isResizingBrowserReader.current = true; };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingSidebar.current) {
        const newW = Math.max(160, Math.min(e.clientX, 450));
        setSidebarWidth(newW);
      }
      if (isResizingOutput.current) {
        const newW = Math.max(300, Math.min(window.innerWidth - e.clientX, window.innerWidth - 200));
        setOutputWidth(newW);
      }
      if (isResizingPreview.current) {
        const newW = Math.max(260, Math.min(window.innerWidth - e.clientX, 900));
        setPreviewWidth(newW);
      }
      if (isResizingBrowserReader.current) {
        const newW = Math.max(280, Math.min(window.innerWidth - e.clientX, 1000));
        setBrowserReaderWidth(newW);
      }
    };

    const handleMouseUp = () => {
      isResizingSidebar.current = false;
      isResizingOutput.current = false;
      isResizingPreview.current = false;
      isResizingBrowserReader.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const existingFolders = extractFolders(workspaceTree);

  return (
    <div className="app-shell">
      {/* Top Navbar */}
      <Navbar
        activeFile={activeTab}
        isRunning={isRunning}
        onRun={() => handleRun()}
        onStop={handleStop}
        onNewFile={() => handleOpenNewFileModal('')}
        onNewFolder={() => handleOpenNewFolderModal('')}
        showExplorer={showExplorer}
        onToggleExplorer={() => setShowExplorer(prev => !prev)}
        showOutput={showOutput}
        onToggleOutput={() => setShowOutput(prev => !prev)}
        showPreview={outputPanelTab === 'preview' && showOutput && !isOutputCollapsed}
        onTogglePreview={() => {
          setShowOutput(true);
          setIsOutputCollapsed(false);
          setOutputPanelTab(prev => prev === 'preview' ? 'output' : 'preview');
        }}
        isPreviewableFile={isPreviewableFile}
        showBrowserReader={(outputPanelTab === 'pdf' || outputPanelTab === 'browser') && showOutput && !isOutputCollapsed}
        onToggleBrowserReader={() => {
          setShowOutput(true);
          setIsOutputCollapsed(false);
          setOutputPanelTab(prev => {
            if (prev === 'pdf') return 'browser';
            if (prev === 'browser') return 'output';
            return 'pdf';
          });
        }}
        dependenciesStatus={dependenciesStatus}
        onOpenDependencies={() => setShowDepModal(true)}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onOpenSettings={() => setShowSettings(true)}
        onStopServer={handleStopServer}
      />

      {/* Main Workspace Layout */}
      <main className="main-workspace">
        {/* Left: Files / Workspace (Shows only when clicked) */}
        {showExplorer && (
          <>
            <FileExplorer
              width={sidebarWidth}
              tree={workspaceTree}
              activeFile={activeTab}
              onSelectFile={handleSelectFile}
              onRefresh={loadWorkspace}
              onCreateFile={(f) => handleOpenNewFileModal(f)}
              onCreateFolder={(f) => handleOpenNewFolderModal(f)}
              onRenameItem={handleRenameItem}
              onDeleteItem={handleDeleteItem}
            />
            <div className="resizer-horizontal" onMouseDown={startResizeSidebar} />
          </>
        )}

        {/* Middle: Compiler / File Editor (Center) */}
        <EditorPanel
          tabs={tabs}
          activeTabPath={activeTabPath}
          onSelectTab={setActiveTabPath}
          onCloseTab={handleCloseTab}
          onChangeContent={handleChangeContent}
          onSave={handleSave}
          onRun={() => handleRun()}
          onNewFile={() => handleOpenNewFileModal('')}
          onNewFolder={() => handleOpenNewFolderModal('')}
          editorSettings={settings}
          theme={theme}
        />

        {/* Right: Unified Output, Terminal, PDF Reader, Web Browser & Live Preview */}
        {showOutput && (
          <>
            <div className="resizer-horizontal" onMouseDown={startResizeOutput} />
            <OutputPanel
              width={outputWidth}
              activeTab={outputPanelTab}
              onTabChange={setOutputPanelTab}
              executionResult={executionResult}
              isRunning={isRunning}
              stdinValue={stdinValue}
              onStdinChange={setStdinValue}
              onSendStdin={handleSendStdin}
              history={executionHistory}
              onClearHistory={async () => {
                await clearExecutionHistory();
                setExecutionHistory([]);
              }}
              onClearOutput={handleClearOutput}
              onSelectHistoryItem={(item) => {
                setExecutionResult({
                  status: item.status,
                  exit_code: item.exit_code,
                  stdout: item.stdout,
                  stderr: item.stderr,
                  compilation_error: item.compilation_error,
                  execution_time_ms: item.execution_time_ms
                });
              }}
              isCollapsed={isOutputCollapsed}
              onToggleCollapse={() => setIsOutputCollapsed(c => !c)}
              showPreviewTab={isPreviewableFile}
              previewFile={previewFile}
              previewRefreshTrigger={previewRefreshTrigger}
              selectedPdfUrl={selectedPdfUrl}
              selectedPdfName={selectedPdfName}
              onSelectPdf={(url, name) => {
                setSelectedPdfUrl(url);
                setSelectedPdfName(name);
              }}
              showAlert={showAlert}
            />
          </>
        )}
      </main>

      {/* Floating New File Modal Form */}
      <NewFileModal
        isOpen={showNewFileModal}
        onClose={() => setShowNewFileModal(false)}
        onCreate={handleConfirmCreateFile}
        parentFolder={modalParentFolder}
        folders={existingFolders}
        dependenciesStatus={dependenciesStatus}
      />

      {/* Floating New Folder Modal Form */}
      <NewFolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        onCreate={handleConfirmCreateFolder}
        parentFolder={modalParentFolder}
        folders={existingFolders}
      />

      {/* Dependency Modal */}
      <DependencyModal
        isOpen={showDepModal}
        onClose={() => setShowDepModal(false)}
        dependenciesStatus={dependenciesStatus}
        onRefreshDependencies={loadDependencies}
        isRefreshing={isRefreshingDeps}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        workspaceRoot={workspaceRoot}
      />

      {/* Universal Custom Alert / Confirm / Prompt Modal */}
      <CustomDialogModal
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        title={dialogState.title}
        message={dialogState.message}
        defaultValue={dialogState.defaultValue}
        placeholder={dialogState.placeholder}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />

      {/* Graceful Server Shutdown Screen */}
      {serverStopped && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 14, 20, 0.96)',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '14px',
            padding: '36px',
            maxWidth: '460px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ fontSize: '42px', marginBottom: '14px' }}>🛑</div>
            <h2 style={{ color: '#ef4444', margin: '0 0 10px 0', fontSize: '20px' }}>Server Stopped</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px 0' }}>
              The Local Compiler background server has been safely shut down.
            </p>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              You can close this window now. Whenever you want to code again, simply double-click the <strong>Local Compiler</strong> shortcut on your desktop!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
