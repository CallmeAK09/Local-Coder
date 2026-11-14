<p align="center">
  <img src="https://res.cloudinary.com/xpehvn66/image/upload/v1794678368/Local_Coder_Neon_Workspace_h9w2gg.png" alt="LOCAL CODER Neon Workspace" width="100%" style="border-radius: 12px; box-shadow: 0 0 30px rgba(56, 189, 248, 0.4);" />
</p>

<p align="center">
  <img src="https://res.cloudinary.com/xpehvn66/image/upload/v1794678367/Neon_Local_Coder_App_Icon_vl8wml.png" alt="LOCAL CODER Icon" width="68" height="68" style="border-radius: 14px; vertical-align: middle; margin-right: 10px;" />
</p>

<h1 align="center">⚡ LOCAL CODER</h1>
<p align="center">
  <b>The Professional Offline-First Multi-Language IDE & Compiler for Localhost</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Offline-100%25_Zero_CDN-0ea5e9?style=for-the-badge&logo=offline&logoColor=white" alt="Offline First" />
  <img src="https://img.shields.io/badge/Monaco_Editor-Bundled_Locally-6366f1?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="Monaco Editor" />
  <img src="https://img.shields.io/badge/Python-3.x-38bdf8?style=for-the-badge&logo=python&logoColor=white" alt="Python 3" />
  <img src="https://img.shields.io/badge/Node.js-JavaScript-facc15?style=for-the-badge&logo=nodedotjs&logoColor=black" alt="Node.js" />
  <img src="https://img.shields.io/badge/GCC-C%20%2F%20C%2B%2B-60a5fa?style=for-the-badge&logo=c&logoColor=white" alt="GCC C" />
  <img src="https://img.shields.io/badge/JDK-Java-f87171?style=for-the-badge&logo=openjdk&logoColor=white" alt="JDK Java" />
  <img src="https://img.shields.io/badge/Markdown_%26_HTML-Live_Preview-34d399?style=for-the-badge&logo=markdown&logoColor=white" alt="Markdown & HTML" />
  <img src="https://img.shields.io/badge/PDF_Reader-In--App-f43f5e?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="PDF Reader" />
  <img src="https://img.shields.io/badge/License-MIT-a855f7?style=for-the-badge" alt="MIT License" />
</p>

---

## 🌟 Overview

**LOCAL CODER** is a modern, distraction-free desktop-grade web IDE engineered for offline development. Built with **Django 6.1 (DRF)** on the backend and **React 19 + bundled Monaco Editor** on the frontend, it runs strictly on `localhost` with **zero external CDN dependencies**.

Whether you're compiling C algorithms, testing Python scripts, crafting Node.js services, writing Markdown documentation, reading local PDF reference books, or prototyping responsive web interfaces, **LOCAL CODER** delivers immediate, sandboxed feedback without requiring an internet connection.

---

## ✨ Standout Features

### 💻 1. Center-Stage Monaco Code Editor
- **Zero-CDN Offline Bundle:** Grammars, syntax highlighters, and worker threads are bundled locally via Vite.
- **Smart Indentation Engine:**
  - Automatic indentation after `:` (Python, CSS, Switch) and `{` (JavaScript, C, Java, CSS).
  - **Double-Enter Dedent:** Pressing Enter twice on an empty indented line automatically dedents by one tab level.
- **Code Suggestions / Auto-fill Toggle:** Easily switch Intellisense and auto-completions on or off in Preferences.
- **Auto-Save on Run:** Clicking **Run** (<kbd>Ctrl+Enter</kbd> / <kbd>F5</kbd>) automatically saves your active file to disk before executing.

### ⚙️ 2. Dynamic Language Availability & Floating Modals
- **Intelligent Compiler Inspection:** The New File modal checks the host system dependencies in real-time. Only languages with installed compilers/interpreters (`Python`, `Node.js`, `GCC`, `Java`) are presented as options.
- **Always-Accessible Formats:** `HTML`, `CSS`, `Markdown`, `JSON`, and `Plain Text` are always available for instant creation regardless of compiler installations.
- **Default Boilerplates:** New `.html` files automatically spawn with modern HTML5 boilerplate templates.

### 📖 3. Markdown & HTML Live Preview
- **Live Markdown Rendering:** View `.md` files formatted with clean dark/light typography, syntax-highlighted code blocks, tables, and task lists.
- **HTML Sandboxed Preview:** Live responsive viewport preview with instant presets: Desktop / Full Width, Tablet (768px), and Mobile (375px).

### 📑 4. In-App PDF Reader & Web Browser
- **Local Laptop PDF Reader:** Open PDF textbooks, cheatsheets, or specifications directly inside the IDE via file picker or drag-and-drop.
- **Integrated Web Browser:** Browse documentation, localhost servers, or web tools inside a dedicated side panel.
- **Custom Bookmarks Manager:**
  - One-click bookmarking of active pages.
  - Add, edit, navigate, and delete custom bookmarks with persistence in `localStorage`.
  - Bundled with quick doc links (DevDocs, MDN, Python 3, Wikipedia, Localhost).

### ⚡ 5. Sandboxed Local Execution Engine
- **POSIX / Windows Subprocess Isolation:** Child processes run securely with `shell=False`, custom stdin streaming, and memory protection (300 KB output limit).
- **Infinite Loop Defense:** Process group tracking allows instant one-click process termination (`Stop` button) sending `SIGKILL` to prevent runaway scripts.
- **Interactive Stdin Terminal:** Pipe inputs to `input()`, `scanf()`, or `java.util.Scanner` via the interactive terminal bar.
- **Execution History:** SQLite-backed audit log capturing status, execution time, stdout, stderr, and exit codes.

---

## 📐 Layout Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] LOCAL CODER  [Files] [New File] [New Folder] [▶ Run] [Browser/PDF] [Preview]    │
├──────────────┬───────────────────────────────────────────┬─────────────────────────────┤
│              │                                           │                             │
│  WORKSPACE   │           MONACO CODE EDITOR              │       CONTEXT PANEL         │
│  FILE TREE   │             (CENTER STAGE)                │   (Output / Terminal /      │
│              │                                           │    HTML & MD Preview /      │
│ (Hidden by   │   - Multi-tab navigation                  │    PDF Reader / Browser)    │
│  default;    │   - Auto-indentation after : & {          │                             │
│  click Files │   - Auto-save on Run                      │   - Live stdout / stderr    │
│  to open)    │   - Configurable suggestions              │   - Interactive Stdin       │
│              │   - Double-Enter dedent                   │   - Responsive viewports    │
│              │                                           │   - Custom bookmarks        │
├──────────────┴───────────────────────────────────────────┴─────────────────────────────┤
│  STATUS: Compilers Ready (3/4) | UTF-8 | Spaces: 4 | Theme: Dark                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
|---|---|---|
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> / <kbd>F5</kbd> | **Run & Compile** | Auto-saves file and compiles/runs immediately |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | **Save File** | Saves current tab and updates live preview |
| <kbd>Enter</kbd> + <kbd>Enter</kbd> | **Double-Enter Dedent** | Cancels indentation by one tab level |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> | **Find & Replace** | Opens Monaco search and replace widget |
| <kbd>Ctrl</kbd> + <kbd>/</kbd> | **Toggle Comment** | Comments/uncomments selected lines |
| <kbd>Alt</kbd> + <kbd>Up</kbd> / <kbd>Down</kbd> | **Move Line** | Moves selected lines up or down |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+ (for Django backend)
- Node.js 18+ (for frontend development/builds)
- Optional: `gcc` for C compilation, `default-jdk` for Java compilation

### 1. Launch in One Command
```bash
# Clone the repository
git clone https://github.com/your-username/local-coder.git
cd "local-coder"

# Run development servers concurrently
chmod +x start_dev.sh run.sh
./start_dev.sh
```

Open your browser at:
👉 **`http://127.0.0.1:8000`** (or `http://localhost:5173` for Vite HMR)

---

## 📁 Project Structure

```
Local Coder/
├── backend/                           # Django 6.1 REST Framework Backend
│   ├── apps/
│   │   ├── workspace_manager/         # File traversal safety, tree, and preview server
│   │   ├── execution_manager/         # Multi-language subprocess runner & SQLite audit log
│   │   └── dependency_manager/        # Host compiler doctor & OS installation guides
│   ├── config/                        # Django settings, URLs, static routes
│   └── manage.py                      # Enhanced CLI with auto-venv detection
├── frontend/                          # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Top bar with neon branding & preview triggers
│   │   │   ├── EditorPanel.jsx        # Center Monaco editor with smart indentation
│   │   │   ├── FileExplorer.jsx       # Workspace file tree
│   │   │   ├── OutputPanel.jsx        # Output, terminal, problems, and history tabs
│   │   │   ├── PreviewPanel.jsx       # Sandboxed HTML & Markdown live preview
│   │   │   ├── BrowserReaderPanel.jsx # In-app PDF reader & Web browser with bookmarks
│   │   │   ├── NewFileModal.jsx       # Floating file creator with compiler filtering
│   │   │   ├── NewFolderModal.jsx     # Floating folder creator
│   │   │   ├── DependencyModal.jsx    # Compiler inspection & installation guides
│   │   │   └── SettingsModal.jsx      # Preferences & editor settings
│   │   ├── services/api.js            # REST API client
│   │   ├── monacoConfig.js            # Offline Monaco loader configuration
│   │   ├── App.jsx                    # Master state coordinator & layout orchestrator
│   │   └── index.css                  # Responsive dark/light theme stylesheet
│   └── dist/                          # Production build assets (zero CDN)
├── workspace/                         # Isolated user workspace
├── run.sh                             # Single-command production launcher
├── start_dev.sh                       # Development launcher
└── README.md
```

---

## 🔒 Security Architecture

1. **Localhost Restriction:** Binds strictly to `127.0.0.1` and `localhost`.
2. **Directory Traversal Protection:** All workspace paths are resolved using `resolve_workspace_path` preventing any `../` directory escapes.
3. **Execution Safety:** Processes run with `shell=False`. Process groups are cleanly killed on timeout or manual stop.
4. **Memory Guard:** Standard output and error streams are truncated at 300 KB to protect the browser from memory crashes caused by infinite loops.

---

<p align="center">
  <b>LOCAL CODER</b> — Made with ❤️ for offline-first developers.
</p>

  