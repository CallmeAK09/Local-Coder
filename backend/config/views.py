import urllib.request
import urllib.parse
import os
import sys
import json
from pathlib import Path
from django.conf import settings
from django.http import HttpResponse, FileResponse, Http404, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .lifecycle import record_heartbeat, record_client_leave, terminate_server, sync_pwa_launchers

DIST_DIR = settings.BASE_DIR.parent / 'frontend' / 'dist'

@csrf_exempt
def server_heartbeat_view(request):
    """
    Heartbeat ping from active browser tabs.
    Maintains server uptime while tab is open.
    """
    session_id = request.GET.get('session_id') or ''
    if not session_id and request.body:
        try:
            data = json.loads(request.body.decode('utf-8'))
            session_id = data.get('session_id', '')
        except Exception:
            pass
    record_heartbeat(session_id)
    return JsonResponse({"status": "alive", "session_id": session_id})

@csrf_exempt
def server_client_leave_view(request):
    """
    Called via navigator.sendBeacon when a tab or PWA window closes.
    Triggers auto-shutdown if all tabs are closed.
    """
    session_id = request.GET.get('session_id') or ''
    if not session_id and request.body:
        try:
            data = json.loads(request.body.decode('utf-8'))
            session_id = data.get('session_id', '')
        except Exception:
            pass
    record_client_leave(session_id)
    return JsonResponse({"status": "leave_recorded"})

@csrf_exempt
def pwa_sync_view(request):
    """
    Hooks the installed Chrome PWA desktop file to `run.sh --pwa`.
    """
    result = sync_pwa_launchers()
    return JsonResponse(result)

@csrf_exempt
def server_stop_view(request):
    """
    Shuts down the backend server process gracefully.
    Allows quitting directly from the frontend or desktop actions without touching a terminal.
    """
    if request.method == 'POST':
        import threading
        threading.Thread(target=terminate_server, daemon=True).start()
        return JsonResponse({"success": True, "message": "Local Compiler server is shutting down."})
    return JsonResponse({"error": "Method not allowed"}, status=405)



def index_view(request):
    dist_index = DIST_DIR / 'index.html'
    if dist_index.exists():
        resp = HttpResponse(dist_index.read_text(encoding='utf-8'), content_type='text/html; charset=utf-8')
        resp['Cache-Control'] = 'no-cache, must-revalidate'
        return resp
    return HttpResponse(
        "<h1>LOCAL CODER Backend is Running!</h1>"
        "<p>Frontend is running via Vite at <a href='http://localhost:5173'>http://localhost:5173</a> or run <code>npm run build</code>.</p>",
        content_type='text/html'
    )

def pwa_or_spa_serve(request, path=''):
    """
    Serves PWA manifest, service workers, static root icons, or falls back to
    index_view for SPA routing. Ensures correct MIME types and Service-Worker-Allowed header.
    """
    clean_path = (path or '').strip().lstrip('/\\')
    if clean_path:
        target = (DIST_DIR / clean_path).resolve()
        try:
            target.relative_to(DIST_DIR)
        except ValueError:
            raise Http404("Invalid file path.")

        if target.exists() and target.is_file():
            import mimetypes
            content_type, _ = mimetypes.guess_type(target.name)
            if target.name == 'manifest.json' or target.name.endswith('.webmanifest'):
                content_type = 'application/manifest+json'
            elif target.name.endswith('.js') or target.name == 'sw.js':
                content_type = 'application/javascript'

            response = FileResponse(open(target, 'rb'), content_type=content_type)
            if target.name in ('sw.js', 'registerSW.js'):
                response['Service-Worker-Allowed'] = '/'
                response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            return response

    return index_view(request)

def browser_proxy_view(request):
    """
    Transparent HTTP proxy for the integrated IDE web browser.
    Strips X-Frame-Options and CSP frame-ancestors so docs and developer websites
    can be viewed inside the sandboxed iframe without browser connection blocks.
    """
    raw_url = request.GET.get('url', '').strip()
    if not raw_url:
        return HttpResponse("<h3 style='color:#e2e8f0;font-family:sans-serif;'>No URL specified.</h3>", status=400, content_type='text/html')

    if not raw_url.startswith(('http://', 'https://')):
        if raw_url.startswith(('localhost', '127.0.0.1')):
            raw_url = 'http://' + raw_url
        else:
            raw_url = 'https://' + raw_url

    parsed = urllib.parse.urlparse(raw_url)
    if not parsed.netloc:
        return HttpResponse("<h3 style='color:#e2e8f0;font-family:sans-serif;'>Invalid URL specified.</h3>", status=400, content_type='text/html')

    # Security: enforce HTTP/HTTPS schemes only and block cloud metadata SSRF
    if parsed.scheme not in ('http', 'https'):
        return HttpResponse("<h3 style='color:#e2e8f0;font-family:sans-serif;'>Security error: Only HTTP and HTTPS URLs are permitted.</h3>", status=403, content_type='text/html')

    hostname = (parsed.hostname or '').lower()
    if hostname in ('169.254.169.254', 'metadata.google.internal', 'instance-data'):
        return HttpResponse("<h3 style='color:#e2e8f0;font-family:sans-serif;'>Security error: Access to internal metadata services is blocked.</h3>", status=403, content_type='text/html')

    headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }

    try:
        req = urllib.request.Request(raw_url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as resp:
            content_type = resp.headers.get('Content-Type', 'text/html')
            data = resp.read()

            if 'text/html' in content_type:
                encoding = resp.headers.get_content_charset() or 'utf-8'
                try:
                    html_str = data.decode(encoding, errors='replace')
                except Exception:
                    html_str = data.decode('utf-8', errors='replace')

                # Inject base tag so relative resources resolve to origin
                base_tag = f'<base href="{raw_url}" target="_self">'
                if '<head>' in html_str:
                    html_str = html_str.replace('<head>', f'<head>\n  {base_tag}', 1)
                elif '<HEAD>' in html_str:
                    html_str = html_str.replace('<HEAD>', f'<HEAD>\n  {base_tag}', 1)
                else:
                    html_str = f"{base_tag}\n{html_str}"

                django_resp = HttpResponse(html_str, content_type=content_type)
            else:
                django_resp = HttpResponse(data, content_type=content_type)

            django_resp['X-Frame-Options'] = 'ALLOWALL'
            return django_resp

    except Exception as e:
        error_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Browser Gateway</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #0d1117;
      color: #e2e8f0;
      padding: 2rem 1.5rem;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
    }}
    .card {{
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 10px;
      padding: 2rem;
      max-width: 520px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }}
    h3 {{ margin-top: 0; color: #f8fafc; font-size: 1.15rem; }}
    .url-chip {{
      display: inline-block;
      background: #21262d;
      padding: 4px 10px;
      border-radius: 4px;
      color: #38bdf8;
      font-family: monospace;
      font-size: 12px;
      margin: 10px 0;
      word-break: break-all;
    }}
    p {{ font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 8px 0; }}
    .btn {{
      display: inline-block;
      margin-top: 14px;
      padding: 8px 18px;
      background: #38bdf8;
      color: #0b1120;
      font-weight: 600;
      font-size: 13px;
      border-radius: 6px;
      text-decoration: none;
      transition: background 0.15s;
    }}
    .btn:hover {{ background: #7dd3fc; }}
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 32px; margin-bottom: 8px;">🌐</div>
    <h3>External Website Security Restriction</h3>
    <div class="url-chip">{raw_url}</div>
    <p>This external website refuses embedded frame access or your connection timed out ({str(e)}).</p>
    <p>You can still open and view it directly in a full browser tab:</p>
    <a href="{raw_url}" target="_blank" rel="noreferrer" class="btn">Open in New Window &rarr;</a>
  </div>
</body>
</html>"""
        resp = HttpResponse(error_html, content_type='text/html')
        resp['X-Frame-Options'] = 'ALLOWALL'
        return resp

OFFLINE_DOCS = {
    'python': {
        'title': 'Python 3 Reference & Cheatsheet',
        'content': """
<h2>🐍 Python 3 Standard Cheatsheet (Offline)</h2>
<hr>
<h3>1. Data Structures & Types</h3>
<pre><code># Lists
lst = [1, 2, 3]
lst.append(4)
squares = [x**2 for x in range(10) if x % 2 == 0]

# Dictionaries
d = {'a': 1, 'b': 2}
val = d.get('c', 0)
for k, v in d.items():
    print(k, v)

# Sets & Tuples
s = {1, 2, 3}
t = (1, "text", 3.14)</code></pre>

<h3>2. Functions & Classes</h3>
<pre><code>def greet(name: str, greeting: str = "Hello") -> str:
    \"\"\"Docstring description.\"\"\"
    return f"{greeting}, {name}!"

class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def introduce(self):
        return f"I'm {self.name}, {self.age} years old."</code></pre>

<h3>3. File I/O & Exceptions</h3>
<pre><code>try:
    with open('data.txt', 'r', encoding='utf-8') as f:
        content = f.read()
except FileNotFoundError as e:
    print(f"Error: {e}")
finally:
    print("Execution complete.")</code></pre>
"""
    },
    'javascript': {
        'title': 'JavaScript (ES6+) Reference & Cheatsheet',
        'content': """
<h2>⚡ JavaScript (Node.js & Modern ES6+) (Offline)</h2>
<hr>
<h3>1. Variables & Arrow Functions</h3>
<pre><code>const pi = 3.14159;
let count = 0;

const add = (a, b) => a + b;
const doubleList = (arr) => arr.map(x => x * 2);</code></pre>

<h3>2. Arrays & Objects Destructuring</h3>
<pre><code>const user = { id: 1, name: 'Alice', role: 'admin' };
const { name, role } = user;
const clone = { ...user, active: true };

const numbers = [10, 20, 30];
const [first, ...rest] = numbers;</code></pre>

<h3>3. Async / Await & Promises</h3>
<pre><code>async function fetchData(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Fetch error:', err);
  }
}</code></pre>
"""
    },
    'c': {
        'title': 'C Standard Library & Syntax Cheatsheet',
        'content': """
<h2>⚙️ C Programming Reference (Offline)</h2>
<hr>
<h3>1. Basic Boilerplate</h3>
<pre><code>#include &lt;stdio.h&gt;
#include &lt;stdlib.h&gt;

int main(int argc, char *argv[]) {
    printf("Hello from C!\\n");
    return 0;
}</code></pre>

<h3>2. Pointers & Dynamic Allocation</h3>
<pre><code>int x = 42;
int *ptr = &amp;x;
printf("Value: %d, Address: %p\\n", *ptr, (void*)ptr);

int *arr = (int*)malloc(10 * sizeof(int));
if (arr != NULL) {
    for (int i = 0; i &lt; 10; i++) arr[i] = i * i;
    free(arr);
}</code></pre>

<h3>3. Structs</h3>
<pre><code>typedef struct {
    int id;
    char name[50];
    double score;
} Student;

Student s1 = { 101, "Alice", 98.5 };</code></pre>
"""
    },
    'html': {
        'title': 'HTML5 & CSS3 Reference',
        'content': """
<h2>🌐 HTML5 & CSS3 Quick Reference (Offline)</h2>
<hr>
<h3>1. Semantic Elements</h3>
<pre><code>&lt;header&gt;, &lt;nav&gt;, &lt;main&gt;, &lt;section&gt;, &lt;article&gt;, &lt;aside&gt;, &lt;footer&gt;</code></pre>

<h3>2. Modern CSS Flexbox</h3>
<pre><code>.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}</code></pre>

<h3>3. Modern CSS Grid</h3>
<pre><code>.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}</code></pre>
"""
    }
}

def offline_docs_view(request):
    """
    Serves offline developer cheatsheets with zero network dependency.
    """
    topic = request.GET.get('topic', 'python').lower()
    doc = OFFLINE_DOCS.get(topic, OFFLINE_DOCS['python'])

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{doc['title']}</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #e2e8f0;
      background: #0d1117;
      margin: 0;
      padding: 1.5rem;
      max-width: 820px;
      margin: 0 auto;
    }}
    h2 {{ color: #38bdf8; margin-top: 0; border-bottom: 2px solid #30363d; padding-bottom: 8px; }}
    h3 {{ color: #f8fafc; margin-top: 1.4rem; font-size: 1.1rem; }}
    pre {{
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
      font-size: 12px;
    }}
    code {{
      font-family: 'JetBrains Mono', Consolas, monospace;
      color: #facc15;
    }}
    pre code {{ color: #e2e8f0; }}
    hr {{ border: none; border-top: 1px solid #30363d; margin: 1rem 0; }}
  </style>
</head>
<body>
  {doc['content']}
</body>
</html>"""
    resp = HttpResponse(html, content_type='text/html')
    resp['X-Frame-Options'] = 'ALLOWALL'
    return resp



