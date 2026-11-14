<p align="center">
  <img src="https://res.cloudinary.com/xpehvn66/image/upload/v1794678368/Local_Coder_Neon_Workspace_h9w2gg.png" alt="LOCAL CODER Workspace Banner" width="100%" style="border-radius: 12px; box-shadow: 0 0 35px rgba(56, 189, 248, 0.45);" />
</p>

<p align="center">
  <img src="https://res.cloudinary.com/xpehvn66/image/upload/v1794678367/Neon_Local_Coder_App_Icon_vl8wml.png" alt="LOCAL CODER Logo" width="76" height="76" style="border-radius: 16px; vertical-align: middle; box-shadow: 0 0 20px rgba(56, 189, 248, 0.5);" />
</p>

<h1 align="center">LOCAL CODER</h1>

<p align="center">
  <b>Enterprise-Grade, Offline-First Multi-Language Web IDE & Compiler for Localhost</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Offline--First_Zero_CDN-0284c7?style=for-the-badge&logo=electron&logoColor=white" alt="Offline-First" />
  <img src="https://img.shields.io/badge/Monaco_Editor-v0.52_Bundled-6366f1?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="Monaco" />
  <img src="https://img.shields.io/badge/Python-3.x_Runner-38bdf8?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Node.js-v24_LTS-22c55e?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/GCC-C%20%2F%20C%2B%2B_O2-3b82f6?style=for-the-badge&logo=c&logoColor=white" alt="GCC" />
  <img src="https://img.shields.io/badge/JDK-Java_Compiler-ef4444?style=for-the-badge&logo=openjdk&logoColor=white" alt="JDK" />
  <img src="https://img.shields.io/badge/Django-6.1_REST_Framework-047857?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
  <img src="https://img.shields.io/badge/React-19_Vite_6-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/License-MIT-a855f7?style=for-the-badge" alt="License" />
</p>

---

## 📑 Table of Contents

- [Executive Summary](#-executive-summary)
- [System Architecture](#-system-architecture)
- [Language & Toolchain Matrix](#-language--toolchain-matrix)
- [Key Features & Capabilities](#-key-features--capabilities)
  - [Center-Stage Monaco Compiler Editor](#1-center-stage-monaco-compiler-editor)
  - [Smart Indentation & Double-Enter Dedent](#2-smart-indentation--double-enter-dedent)
  - [Unified Right Context Panel](#3-unified-right-context-panel)
  - [Integrated In-App PDF Reader](#4-integrated-in-app-pdf-reader)
  - [Web Browser with Bypass Proxy & Custom Bookmarks](#5-web-browser-with-bypass-proxy--custom-bookmarks)
  - [Live HTML & Markdown Document Previews](#6-live-html--markdown-document-previews)
  - [Dynamic Compiler Availability Detection](#7-dynamic-compiler-availability-detection)
  - [Process Isolation & Runaway Loop Defense](#8-process-isolation--runaway-loop-defense)
- [Workspace Directory Traversal Security](#-workspace-directory-traversal-security)
- [REST API Specifications](#-rest-api-specifications)
- [Keyboard Shortcuts Reference](#-keyboard-shortcuts-reference)
- [Quick Start & Deployment](#-quick-start--deployment)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 💡 Executive Summary

**LOCAL CODER** is an offline-first desktop development platform engineered for programmers, researchers, and competitive coders who demand instant execution speed without network friction. 

Unlike browser playgrounds that rely on third-party cloud compilers, remote containers, or external CDNs, **LOCAL CODER** runs 100% on `localhost`. All syntax lexers, tokenizers, and Monaco web workers are locally bundled into production JavaScript chunks. User code executes natively on the host machine through isolated POSIX/Windows subprocesses with real-time standard I/O piping, process group lifecycle management, and SQLite execution telemetry.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              LOCAL CODER DESKTOP BROWSER                               │
│                         React 19 SPA • Bundled Monaco Editor                           │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ JSON REST API / WebSocket-ready
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DJANGO 6.1 REST BACKEND                                │
│                     (Bound to strictly 127.0.0.1 / localhost)                          │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│    WORKSPACE MANAGER     │      EXECUTION ENGINE       │      DEPENDENCY DOCTOR        │
│  - Traversal Prevention  │  - POSIX Subprocess Spawn   │  - Host Compiler Probing      │
│  - POSIX Path Resolution │  - Process Group SIGKILL    │  - OS-Specific Guides         │
│  - MIME Preview Server   │  - Stdin/Stdout Buffering   │  - Version Inspection         │
│  - Markdown HTML Engine  │  - SQLite Audit Telemetry   │                               │
├──────────────────────────┴─────────────────────────────┴───────────────────────────────┤
│                                 BROWSER GATEWAY PROXY                                  │
│             - Strips X-Frame-Options & CSP frame-ancestors headers                     │
│             - Injects <base href="..."> for embedded doc browsing                      │
│             - Offline Cheatsheets Library (Python, JS, C, HTML/CSS)                    │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                HOST OPERATING SYSTEM                                   │
│            Python 3.x  •  Node.js  •  GCC (C/C++)  •  JDK OpenJDK  •  SQLite3          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Language & Toolchain Matrix

| Language | Ext | Engine / Tool | Compiler / Run Flags | Capabilities |
|---|---|---|---|---|
| **Python** | `.py` | `python3` / `python` | `python3 -u <file>` | Unbuffered stdout, interactive stdin, standard library |
| **JavaScript** | `.js`, `.mjs` | `node` | `node <file>` | Modern ES6+, Node.js runtime APIs, async/await |
| **C Language** | `.c`, `.h` | `gcc` | `gcc -O2 -Wall <file> -o <bin> -lm` | Native binary compilation, standard C library |
| **Java** | `.java` | `javac` + `java` | `javac -encoding UTF-8` & `java -cp` | Full JVM compilation and class execution |
| **Markdown** | `.md`, `.markdown` | Python `markdown` engine | `extra`, `codehilite`, `tables`, `toc` | Real-time formatted HTML preview with dark theme |
| **HTML5** | `.html`, `.htm` | Sandboxed Browser Iframe | Native DOM Rendering | Live reload, responsive viewport testing |
| **CSS3** | `.css` | Sandboxed Browser Iframe | CSSOM Engine | Live styling with instant refresh |
| **JSON** | `.json` | Monaco JSON Schema | Syntax & Lint validation | Data structuring and configuration |
| **Plain Text** | `.txt` | Monaco Plaintext | Unicode UTF-8 | Notes, input buffers, benchmarks |

---

## ⚡ Key Features & Capabilities

### 1. Center-Stage Monaco Compiler Editor
The editor occupies the central position on the screen, maximizing line width and vertical readability. 
- **100% Offline Bundle:** Zero CDN calls to Cloudflare, jsDelivr, or unpkg. Monaco loads directly from pre-built local assets.
- **Auto-Save on Run:** Pressing <kbd>Ctrl</kbd> + <kbd>Enter</kbd> or <kbd>F5</kbd> automatically flushes dirty buffers to disk prior to invocation.
- **IntelliSense Customization:** Toggle code suggestions, snippets, parameter hints, and quick-suggestions on or off in Preferences.

### 2. Smart Indentation & Double-Enter Dedent
- **Automatic Block Indent:** Pressing Enter after `:` (Python, CSS, Switch statements) or `{` (JavaScript, C, Java) automatically calculates the correct nested indentation level.
- **Double-Enter Dedent:** Pressing Enter twice on an empty indented line automatically dedents the line by one `tabSize`, eliminating manual backspacing.

### 3. Unified Right Context Panel
Instead of separate, competing panels that cover or unmount execution output, **Output, Terminal, Problems, History, PDF Reader, Web Browser, and Live Previews** are unified into a single multi-tab panel:
- **Output:** Streaming stdout and stderr output with color-coded badges.
- **Terminal:** Interactive Stdin command bar for supplying inputs to `input()`, `scanf()`, or `Scanner`.
- **Problems:** Compilation diagnostics and stack traces.
- **History:** SQLite audit log with execution duration in milliseconds, exit codes, and timestamps.
- **PDF Reader:** In-app PDF reading.
- **Browser:** Integrated documentation and localhost browser.
- **Preview:** Live rendering for HTML and Markdown files.

### 4. Integrated In-App PDF Reader
- Open textbooks, reference manuals, or assignment PDFs from your laptop via file dialog or drag-and-drop.
- **Persistent State:** Switching tabs between Output, Terminal, and PDF Reader preserves the scroll position and active document without re-uploading.
- Includes a dedicated full-window popout shortcut (<kbd><ExternalLink size={12} /></kbd>).

### 5. Web Browser with Bypass Proxy & Custom Bookmarks
- **Zero Iframe Blockages:** Uses the backend proxy (`/api/browser/proxy/?url=...`) to strip `X-Frame-Options: SAMEORIGIN` and `Content-Security-Policy: frame-ancestors` from sites like DevDocs, Wikipedia, and MDN.
- **Custom Bookmarks:** Bookmark any active URL with one click. Add custom titles, navigate instantly, and delete bookmarks with local persistence via `localStorage`.
- **Offline Cheatsheet Library:** Built-in offline quick-reference cards for Python, JavaScript, C, and HTML/CSS available with zero internet access.

### 6. Live HTML & Markdown Document Previews
- **Markdown (`.md`):** Automatically compiled into modern GitHub-styled dark-mode HTML with formatted headings, code blocks, task lists, and data tables.
- **HTML5 (`.html`):** Renders sandboxed iframes with responsive device presets:
  - 🖥️ **Desktop / Full Width**
  - 📱 **Tablet (768px)**
  - 📲 **Mobile (375px)**

### 7. Dynamic Compiler Availability Detection
The New File modal audits host binaries on startup:
- If a compiler (e.g., `javac` for Java) is missing from the host machine, `.java` is hidden from creation options.
- Once installed, the dependency doctor automatically enables the format.
- Formats without compiler requirements (`.html`, `.css`, `.md`, `.json`, `.txt`) are always accessible.

### 8. Process Isolation & Runaway Loop Defense
- **Process Group Kill:** Child processes are spawned in their own process group (`os.setpgrp`). Clicking **Stop** sends `SIGKILL` to the entire tree, instantly stopping infinite loops.
- **Output Memory Caps:** Output streams are bounded to 300 KB to prevent memory exhaustion in infinite print loops.
- **Configurable Timeouts:** Execution timeouts (default: 20s) automatically abort runaway processes.

---

## 🔒 Workspace Directory Traversal Security

All filesystem requests are validated through `resolve_workspace_path`:

```python
def resolve_workspace_path(relative_path: str, allow_root: bool = False) -> Path:
    clean_path = (relative_path or '').strip().lstrip('/\\')
    root = get_workspace_root()
    resolved = (root / clean_path).resolve()
    
    # Enforce confinement to workspace boundary
    try:
        resolved.relative_to(root)
    except ValueError:
        raise PermissionDenied("Access denied: Traversal outside workspace root.")
    return resolved
```

Any request attempting `../../etc/passwd` or accessing files outside `WORKSPACE_ROOT` is rejected with `HTTP 403 Forbidden`.

---

## 🔌 REST API Specifications

### Workspace Management
- `GET /api/workspace/tree/` — Retrieve hierarchical file and directory tree.
- `GET /api/workspace/file/?path=<subpath>` — Read file content and detect language grammar.
- `POST /api/workspace/file/` — Create or overwrite file (`path`, `content`).
- `POST /api/workspace/folder/` — Create new subdirectory (`path`).
- `POST /api/workspace/rename/` — Move or rename item (`old_path`, `new_path`).
- `POST /api/workspace/delete/` — Delete file or recursive directory (`path`).
- `GET /api/workspace/preview/<subpath>` — Serve file with correct MIME type and Markdown rendering.

### Execution Engine
- `POST /api/execute/run/` — Execute code (`path`, `stdin`, `timeout`). Returns stdout, stderr, exit code, and execution time.
- `POST /api/execute/stop/` — Terminate active process group (`exec_id`).
- `GET /api/execute/history/` — List SQLite execution audit history.
- `DELETE /api/execute/history/` — Clear execution history.

### Dependencies & Gateway
- `GET /api/dependencies/status/` — Audit host compilers (`python`, `node`, `gcc`, `java`) and OS install guides.
- `GET /api/browser/proxy/?url=<encoded_url>` — Proxy external websites and strip frame-blocking headers.
- `GET /api/browser/docs/?topic=<topic>` — Serve zero-dependency offline developer reference sheets.

---

## ⌨️ Keyboard Shortcuts Reference

| Key Combination | Function | Scope |
|---|---|---|
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> / <kbd>F5</kbd> | **Run / Compile Code** | Global / Monaco |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | **Save File** | Monaco |
| <kbd>Enter</kbd> + <kbd>Enter</kbd> | **Double-Enter Dedent** | Monaco (empty indented line) |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> | **Find & Replace** | Monaco |
| <kbd>Ctrl</kbd> + <kbd>/</kbd> | **Toggle Line Comment** | Monaco |
| <kbd>Alt</kbd> + <kbd>Up</kbd> / <kbd>Down</kbd> | **Move Line Up / Down** | Monaco |
| <kbd>Shift</kbd> + <kbd>Alt</kbd> + <kbd>Down</kbd> | **Duplicate Line** | Monaco |

---

## 🚀 Quick Start & Deployment

### Quick Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/local-coder.git
cd "local-coder"

# 2. Start development mode (concurrent Django backend + Vite frontend)
chmod +x start_dev.sh run.sh
./start_dev.sh
```

Navigate to:
- **Production Server:** `http://127.0.0.1:8000`
- **Vite Hot Reload:** `http://localhost:5173`

### Production Build
```bash
cd frontend
npm run build
cd ../backend
python3 manage.py collectstatic --noinput
python3 manage.py runserver 127.0.0.1:8000
```

---

## 📂 Project Structure

```
Local Coder/
├── backend/                           # Django 6.1 Backend Application
│   ├── apps/
│   │   ├── workspace_manager/         # Filesystem operations, traversal guard & preview
│   │   ├── execution_manager/         # Subprocess runner, process kill & SQLite logging
│   │   └── dependency_manager/        # Host compiler probing & OS installation guides
│   ├── config/                        # Settings, URL router & browser gateway proxy
│   ├── db.sqlite3                     # SQLite execution telemetry store
│   └── manage.py                      # Django CLI with automatic virtualenv detection
├── frontend/                          # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Top bar with neon branding & tools
│   │   │   ├── EditorPanel.jsx        # Center Monaco editor with smart indentation
│   │   │   ├── FileExplorer.jsx       # Workspace navigation tree
│   │   │   ├── OutputPanel.jsx        # Unified Output, Terminal, PDF, Browser & Preview
│   │   │   ├── PreviewPanel.jsx       # Responsive HTML & Markdown preview
│   │   │   ├── NewFileModal.jsx       # Floating file creator with compiler filtering
│   │   │   ├── NewFolderModal.jsx     # Floating folder creator
│   │   │   ├── DependencyModal.jsx    # Compiler inspection & installation guides
│   │   │   └── SettingsModal.jsx      # Preferences & editor settings
│   │   ├── services/api.js            # REST API client & proxy router
│   │   ├── monacoConfig.js            # Offline Monaco worker loader
│   │   ├── App.jsx                    # State coordinator & unified split layout
│   │   └── index.css                  # Responsive dark/light theme stylesheet
│   └── dist/                          # Production offline assets (Zero CDN)
├── workspace/                         # User-isolated workspace directory
├── run.sh                             # Single-command launcher
├── start_dev.sh                       # Concurrent development launcher
└── README.md                          # Documentation
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.

<p align="center">
  <b>LOCAL CODER</b> — Engineered for offline-first developers.
</p>
