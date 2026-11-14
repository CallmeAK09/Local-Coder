const API_BASE = '/api';

export async function fetchWorkspaceTree() {
  const res = await fetch(`${API_BASE}/workspace/tree/`);
  if (!res.ok) throw new Error('Failed to load workspace file tree.');
  return await res.json();
}

export async function readFile(path) {
  const res = await fetch(`${API_BASE}/workspace/file/?path=${encodeURIComponent(path)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to read file.');
  }
  return await res.json();
}

export async function saveFile(path, content) {
  const res = await fetch(`${API_BASE}/workspace/file/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save file.');
  }
  return await res.json();
}

export async function createFolder(path) {
  const res = await fetch(`${API_BASE}/workspace/folder/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to create folder.');
  }
  return await res.json();
}

export async function renameItem(old_path, new_path) {
  const res = await fetch(`${API_BASE}/workspace/rename/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ old_path, new_path }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to rename item.');
  }
  return await res.json();
}

export async function deleteItem(path) {
  const res = await fetch(`${API_BASE}/workspace/delete/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete item.');
  }
  return await res.json();
}

export async function executeCode({ path, stdin = '', timeout = 20, exec_id = null, content = null }) {
  const res = await fetch(`${API_BASE}/execute/run/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, stdin, timeout, exec_id, content }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to execute code.');
  }
  return await res.json();
}

export async function stopExecution(exec_id) {
  const res = await fetch(`${API_BASE}/execute/stop/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exec_id }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to stop process.');
  }
  return await res.json();
}

export async function fetchExecutionHistory() {
  const res = await fetch(`${API_BASE}/execute/history/`);
  if (!res.ok) throw new Error('Failed to fetch execution history.');
  return await res.json();
}

export async function clearExecutionHistory() {
  const res = await fetch(`${API_BASE}/execute/history/`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear execution history.');
  return await res.json();
}

export async function checkDependencies() {
  const res = await fetch(`${API_BASE}/dependencies/status/`);
  if (!res.ok) throw new Error('Failed to check dependencies.');
  return await res.json();
}

export function getPreviewUrl(subpath = 'web/index.html') {
  return `${API_BASE}/workspace/preview/${encodeURIComponent(subpath)}`;
}

export function getBrowserProxyUrl(url) {
  if (!url) return '';
  return `${API_BASE}/browser/proxy/?url=${encodeURIComponent(url)}`;
}

export function getOfflineDocsUrl(topic = 'python') {
  return `${API_BASE}/browser/docs/?topic=${encodeURIComponent(topic)}`;
}

export async function stopServer() {
  const res = await fetch(`${API_BASE}/server/stop/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to stop server.');
  return await res.json();
}



