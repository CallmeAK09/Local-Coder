import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { X, Code2, FilePlus, FolderPlus } from 'lucide-react';
import { getFileIcon } from './FileExplorer';
import '../monacoConfig'; // loads local monaco configuration

export function getLanguageTabSize(language, customTabSize) {
  if (customTabSize && customTabSize !== 4) {
    return customTabSize;
  }
  
  switch (language) {
    case 'javascript':
    case 'html':
    case 'css':
    case 'json':
      return 2;
    case 'python':
    case 'c':
    case 'java':
    default:
      return 4;
  }
}

export default function EditorPanel({
  tabs = [],
  activeTabPath,
  onSelectTab,
  onCloseTab,
  onChangeContent,
  onSave,
  onRun,
  onNewFile,
  onNewFolder,
  editorSettings = {
    fontSize: 14,
    tabSize: 4,
    minimap: true,
    wordWrap: 'on'
  },
  theme = 'dark'
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const activeTab = tabs.find(t => t.path === activeTabPath);
  const activeLanguage = activeTab?.language || 'plaintext';
  const effectiveTabSize = getLanguageTabSize(activeLanguage, editorSettings.tabSize);

  // Setup language indentation rules once Monaco mounts
  const configureIndentationForLanguage = (monacoInstance) => {
    // 1. Python Indentation Rules
    monacoInstance.languages.setLanguageConfiguration('python', {
      onEnterRules: [
        {
          beforeText: /:\s*$/,
          action: { indentAction: monacoInstance.languages.IndentAction.Indent }
        }
      ],
      indentationRules: {
        increaseIndentPattern: /^.*:\s*$/,
        decreaseIndentPattern: /^\s*(elif|else|except|finally)\b.*:\s*$/
      }
    });

    // 2. JavaScript, C, Java Indentation Rules
    const braceLanguages = ['javascript', 'c', 'cpp', 'java', 'typescript', 'json'];
    braceLanguages.forEach(lang => {
      monacoInstance.languages.setLanguageConfiguration(lang, {
        onEnterRules: [
          {
            beforeText: /\{[^}]*$/,
            afterText: /^\s*\}/,
            action: { indentAction: monacoInstance.languages.IndentAction.IndentOutdent }
          },
          {
            beforeText: /\{[^}]*$/,
            action: { indentAction: monacoInstance.languages.IndentAction.Indent }
          },
          {
            beforeText: /:\s*$/,
            action: { indentAction: monacoInstance.languages.IndentAction.Indent }
          }
        ],
        indentationRules: {
          increaseIndentPattern: /(?:\{[^}]*|:\s*)$/,
          decreaseIndentPattern: /^(.*\*\/)?\s*\}[;\s]*$/
        }
      });
    });

    // 3. HTML & CSS
    monacoInstance.languages.setLanguageConfiguration('html', {
      indentationRules: {
        increaseIndentPattern: /<(?!\?|(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)\b|[^>]*\/>)([-_\.A-Za-z0-9]+)(?=\s|>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)|\{[^}]*$/,
        decreaseIndentPattern: /^\s*(<\/(?!html)[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/
      }
    });

    monacoInstance.languages.setLanguageConfiguration('css', {
      indentationRules: {
        increaseIndentPattern: /^.*\{[^}"']*$/,
        decreaseIndentPattern: /^(.*\*\/)?\s*\}[;\s]*$/
      }
    });
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    configureIndentationForLanguage(monaco);

    // Update active model indentation options dynamically
    const model = editor.getModel();
    if (model) {
      model.updateOptions({
        tabSize: effectiveTabSize,
        insertSpaces: true,
        indentSize: effectiveTabSize
      });
    }

    // Smart Auto-Indentation on Enter key
    editor.onKeyDown((e) => {
      if (e.keyCode === monaco.KeyCode.Enter && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const curModel = editor.getModel();
        if (!curModel) return;

        const pos = editor.getPosition();
        if (!pos) return;

        const lineNum = pos.lineNumber;
        const col = pos.column;
        const lineText = curModel.getLineContent(lineNum);
        const beforeCursor = lineText.substring(0, col - 1);
        const afterCursor = lineText.substring(col - 1);

        const matchIndent = beforeCursor.match(/^(\s*)/);
        const baseIndent = matchIndent ? matchIndent[1] : '';

        const tabSize = curModel.getOptions().tabSize || effectiveTabSize || 2;
        const tabString = ' '.repeat(tabSize);
        const trimmedBefore = beforeCursor.trimEnd();
        const lineTrimmed = lineText.trim();

        // Double Enter Dedent: If current line is already empty (contains only whitespace indentation),
        // pressing Enter cancels/dedents the indentation by one level (e.g. 8 spaces -> 4 spaces -> 0 spaces)
        if (lineTrimmed === '' && beforeCursor.length > 0) {
          e.preventDefault();
          e.stopPropagation();

          const currentIndent = beforeCursor.length;
          const newIndentLength = Math.max(0, currentIndent - tabSize);
          const newText = ' '.repeat(newIndentLength);

          editor.executeEdits('double-enter-dedent', [
            {
              range: new monaco.Range(lineNum, 1, lineNum, col),
              text: newText,
              forceMoveMarkers: true
            }
          ]);

          editor.setPosition({
            lineNumber: lineNum,
            column: newIndentLength + 1
          });
          return;
        }

        // Condition 1: Between '{' and '}' -> expands to indented block
        if (trimmedBefore.endsWith('{') && afterCursor.trimStart().startsWith('}')) {
          e.preventDefault();
          e.stopPropagation();

          const afterIndent = afterCursor.match(/^(\s*)/)[1];
          const newText = '\n' + baseIndent + tabString + '\n' + baseIndent;
          editor.executeEdits('smart-enter', [
            {
              range: new monaco.Range(lineNum, col, lineNum, col + afterIndent.length),
              text: newText,
              forceMoveMarkers: true
            }
          ]);

          editor.setPosition({
            lineNumber: lineNum + 1,
            column: baseIndent.length + tabString.length + 1
          });
          return;
        }

        // Condition 2: Line ends with '{' or ':' (JavaScript, C, Java, Python, CSS)
        if (
          trimmedBefore.endsWith('{') || 
          trimmedBefore.endsWith(':') || 
          trimmedBefore.endsWith('(') || 
          trimmedBefore.endsWith('[')
        ) {
          e.preventDefault();
          e.stopPropagation();

          const newText = '\n' + baseIndent + tabString;
          editor.executeEdits('smart-enter', [
            {
              range: new monaco.Range(lineNum, col, lineNum, col),
              text: newText,
              forceMoveMarkers: true
            }
          ]);

          editor.setPosition({
            lineNumber: lineNum + 1,
            column: baseIndent.length + tabString.length + 1
          });
          return;
        }
      }
    });

    // Keyboard Shortcuts
    // Ctrl+S / Cmd+S
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) onSave();
    });

    // Ctrl+Enter / Cmd+Enter
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) onRun();
    });

    // F5 to run
    editor.addCommand(monaco.KeyCode.F5, () => {
      if (onRun) onRun();
    });
  };

  // Whenever activeTab changes, update model indentation
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        model.updateOptions({
          tabSize: effectiveTabSize,
          insertSpaces: true,
          indentSize: effectiveTabSize
        });
      }
    }
  }, [activeTabPath, effectiveTabSize]);

  const getMonacoLanguage = (lang, ext) => {
    if (lang === 'c') return 'c';
    if (lang === 'python') return 'python';
    if (lang === 'javascript') return 'javascript';
    if (lang === 'java') return 'java';
    if (lang === 'html') return 'html';
    if (lang === 'css') return 'css';
    if (lang === 'json') return 'json';
    if (lang === 'markdown') return 'markdown';
    return 'plaintext';
  };

  return (
    <div className="editor-container">
      {/* Tabs Bar */}
      <div className="tabs-bar">
        {tabs.map(tab => {
          const isActive = tab.path === activeTabPath;
          return (
            <div
              key={tab.path}
              className={`tab-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.path)}
              title={tab.path}
            >
              {getFileIcon(tab.extension, tab.language)}
              <span>{tab.name}</span>
              {tab.isDirty ? (
                <div className="dirty-indicator" title="Unsaved changes" />
              ) : null}
              <div 
                className="tab-close" 
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.path);
                }}
                title="Close Tab"
              >
                <X size={13} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Body */}
      <div className="monaco-wrapper">
        {activeTab ? (
          <Editor
            height="100%"
            path={activeTab.path}
            language={getMonacoLanguage(activeTab.language, activeTab.extension)}
            value={activeTab.content}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            onChange={(val) => onChangeContent(activeTab.path, val ?? '')}
            onMount={handleEditorDidMount}
            options={{
              fontSize: editorSettings.fontSize || 14,
              tabSize: effectiveTabSize,
              indentSize: effectiveTabSize,
              insertSpaces: true,
              detectIndentation: false,
              autoIndent: 'full',
              formatOnType: true,
              formatOnPaste: true,
              trimAutoWhitespace: true,
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              autoSurround: 'languageDefined',
              bracketPairColorization: { enabled: true },
              lineNumbers: 'on',
              folding: true,
              automaticLayout: true,
              minimap: { enabled: editorSettings.minimap ?? true },
              wordWrap: editorSettings.wordWrap || 'on',
              scrollBeyondLastLine: false,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace",
              // Auto-fill & Code Suggestions toggle
              quickSuggestions: (editorSettings.suggestions !== false) ? { other: true, comments: false, strings: true } : false,
              suggestOnTriggerCharacters: editorSettings.suggestions !== false,
              snippetSuggestions: (editorSettings.suggestions !== false) ? 'inline' : 'none',
              wordBasedSuggestions: (editorSettings.suggestions !== false) ? 'currentDocument' : 'off',
              parameterHints: { enabled: editorSettings.suggestions !== false },
              tabCompletion: (editorSettings.suggestions !== false) ? 'on' : 'off',
              suggest: {
                showKeywords: editorSettings.suggestions !== false,
                showSnippets: editorSettings.suggestions !== false,
                showWords: editorSettings.suggestions !== false,
                showFunctions: editorSettings.suggestions !== false,
                showVariables: editorSettings.suggestions !== false,
                showClasses: editorSettings.suggestions !== false,
                showModules: editorSettings.suggestions !== false,
              }
            }}
          />
        ) : (
          <div className="empty-workspace-screen">
            <Code2 size={54} color="var(--accent)" opacity={0.8} />
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>
              LOCAL CODER
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '380px', textAlign: 'center', lineHeight: '1.5' }}>
              Workspace is clean and ready. Click below or open the Files panel to create and edit files.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button className="btn btn-primary" onClick={onNewFile}>
                <FilePlus size={14} />
                <span>Create New File</span>
              </button>
              <button className="btn" onClick={onNewFolder}>
                <FolderPlus size={14} />
                <span>New Folder</span>
              </button>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div><kbd>Ctrl+S</kbd> Save File</div>
              <div><kbd>Ctrl+Enter</kbd> / <kbd>F5</kbd> Run &amp; Compile</div>
              <div><kbd>Ctrl+F</kbd> Find &amp; Replace</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
