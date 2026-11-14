import React, { useState } from 'react';
import { 
  Terminal, 
  AlertCircle, 
  History, 
  Send, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Maximize2, 
  Minimize2,
  FileText
} from 'lucide-react';

export default function BottomPanel({
  height = 240,
  onResize,
  executionResult,
  isRunning,
  stdinValue,
  onStdinChange,
  onSendStdin,
  history = [],
  onClearHistory,
  onSelectHistoryItem,
  isCollapsed = false,
  onToggleCollapse
}) {
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'terminal' | 'problems' | 'history'

  const status = isRunning ? 'RUNNING' : (executionResult?.status || 'IDLE');
  const hasProblems = executionResult?.compilation_error || (executionResult?.status === 'ERROR' && executionResult?.stderr);

  return (
    <section className="bottom-panel" style={{ height: isCollapsed ? '34px' : `${height}px` }}>
      {/* Panel Header & Tabs */}
      <div className="panel-header">
        <div className="panel-tabs">
          <div 
            className={`panel-tab ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => { setActiveTab('output'); if (isCollapsed) onToggleCollapse(); }}
          >
            <Terminal size={13} />
            <span>Output</span>
          </div>

          <div 
            className={`panel-tab ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => { setActiveTab('terminal'); if (isCollapsed) onToggleCollapse(); }}
          >
            <Send size={13} />
            <span>Terminal / Stdin</span>
          </div>

          <div 
            className={`panel-tab ${activeTab === 'problems' ? 'active' : ''}`}
            onClick={() => { setActiveTab('problems'); if (isCollapsed) onToggleCollapse(); }}
            style={hasProblems ? { color: 'var(--danger)' } : {}}
          >
            <AlertCircle size={13} />
            <span>Problems {hasProblems ? '(1)' : '(0)'}</span>
          </div>

          <div 
            className={`panel-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => { setActiveTab('history'); if (isCollapsed) onToggleCollapse(); }}
          >
            <History size={13} />
            <span>History ({history.length})</span>
          </div>
        </div>

        {/* Status indicator & Panel controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {status !== 'IDLE' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className={`status-tag ${status}`}>{status}</span>
              {executionResult?.execution_time_ms !== undefined && !isRunning && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={11} /> {executionResult.execution_time_ms} ms
                </span>
              )}
              {executionResult?.exit_code !== undefined && !isRunning && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  exit {executionResult.exit_code}
                </span>
              )}
            </div>
          )}

          <button 
            className="tree-action-btn" 
            title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
            onClick={onToggleCollapse}
          >
            {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Panel Body Content (hidden when collapsed) */}
      {!isCollapsed && (
        <>
          {activeTab === 'output' && (
            <div className="panel-content">
              {isRunning && (
                <div style={{ color: 'var(--accent)', marginBottom: '8px' }}>
                  ⏳ Program is currently running...
                </div>
              )}

              {executionResult?.stdout && (
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-main)' }}>
                  {executionResult.stdout}
                </pre>
              )}

              {executionResult?.stderr && (
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--danger)', marginTop: '8px' }}>
                  {executionResult.stderr}
                </pre>
              )}

              {executionResult?.compilation_error && (
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--warning)', marginTop: '8px' }}>
                  {executionResult.compilation_error}
                </pre>
              )}

              {!isRunning && !executionResult?.stdout && !executionResult?.stderr && !executionResult?.compilation_error && (
                <div style={{ color: 'var(--text-muted)' }}>
                  Output is empty. Press "Run" to execute the active program.
                </div>
              )}
            </div>
          )}

          {activeTab === 'terminal' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="panel-content">
                <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Enter standard input (stdin) passed directly to programs expecting user input (e.g. <code>input()</code> in Python, <code>scanf</code> in C, <code>Scanner</code> in Java).
                </div>
                {executionResult?.stdout && (
                  <pre style={{ whiteSpace: 'pre-wrap', color: 'var(--text-main)', marginBottom: '8px' }}>
                    {executionResult.stdout}
                  </pre>
                )}
              </div>
              <div className="stdin-bar">
                <span style={{ color: 'var(--accent)', fontWeight: 700, alignSelf: 'center' }}>&gt;</span>
                <input
                  type="text"
                  className="stdin-input"
                  placeholder="Type standard input (stdin) and click Run or press Enter..."
                  value={stdinValue}
                  onChange={(e) => onStdinChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSendStdin();
                    }
                  }}
                />
                <button className="btn btn-primary" onClick={onSendStdin}>
                  <Send size={13} />
                  <span>Send & Run</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'problems' && (
            <div className="panel-content">
              {hasProblems ? (
                <div style={{ background: 'rgba(248, 81, 73, 0.1)', border: '1px solid var(--danger)', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={15} />
                    <span>Diagnostics & Errors</span>
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', color: 'var(--text-main)', fontSize: '12px' }}>
                    {executionResult.compilation_error || executionResult.stderr}
                  </pre>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                  <CheckCircle2 size={16} />
                  <span>No compilation or runtime problems detected.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="panel-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Previous execution runs stored in local SQLite database:
                </span>
                {history.length > 0 && (
                  <button className="btn" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={onClearHistory}>
                    <Trash2 size={12} />
                    <span>Clear History</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>No execution history yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => onSelectHistoryItem(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`status-tag ${item.status}`}>{item.status}</span>
                        <span style={{ fontWeight: 600 }}>{item.file_path}</span>
                        <span style={{ color: 'var(--text-muted)' }}>({item.language})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '11px' }}>
                        <span>{item.execution_time_ms} ms</span>
                        <span>{new Date(item.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

