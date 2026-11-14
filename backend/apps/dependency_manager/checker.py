import shutil
import subprocess
import platform
import sys

def get_tool_version(binary_name: str, version_arg: str = '--version') -> str:
    """Executes the binary safely with shell=False and version argument."""
    try:
        proc = subprocess.run(
            [binary_name, version_arg],
            capture_output=True,
            text=True,
            timeout=3,
            shell=False
        )
        output = (proc.stdout or proc.stderr or '').strip().split('\n')[0]
        return output
    except Exception as e:
        return ""

def detect_os_info():
    system = platform.system().lower()
    distro = ""
    if system == "linux":
        try:
            with open("/etc/os-release") as f:
                lines = f.readlines()
                for line in lines:
                    if line.startswith("ID="):
                        distro = line.strip().split("=")[1].replace('"', '')
                        break
        except Exception:
            distro = "ubuntu"
    return system, distro

def get_install_guide(tool_key: str, system: str, distro: str) -> dict:
    guides = {
        'python': {
            'linux': {
                'ubuntu': 'sudo apt update && sudo apt install -y python3 python3-pip',
                'debian': 'sudo apt update && sudo apt install -y python3 python3-pip',
                'fedora': 'sudo dnf install -y python3 python3-pip',
                'arch': 'sudo pacman -S python python-pip',
                'default': 'Use your Linux distribution package manager to install python3.'
            },
            'darwin': 'brew install python',
            'windows': 'winget install Python.Python.3.12'
        },
        'node': {
            'linux': {
                'ubuntu': 'sudo apt update && sudo apt install -y nodejs npm',
                'debian': 'sudo apt update && sudo apt install -y nodejs npm',
                'fedora': 'sudo dnf install -y nodejs npm',
                'arch': 'sudo pacman -S nodejs npm',
                'default': 'Use your distribution package manager or nvm to install nodejs.'
            },
            'darwin': 'brew install node',
            'windows': 'winget install OpenJS.NodeJS.LTS'
        },
        'gcc': {
            'linux': {
                'ubuntu': 'sudo apt update && sudo apt install -y build-essential gcc',
                'debian': 'sudo apt update && sudo apt install -y build-essential gcc',
                'fedora': 'sudo dnf groupinstall -y "Development Tools"',
                'arch': 'sudo pacman -S base-devel gcc',
                'default': 'Install GCC via your package manager (e.g. build-essential).'
            },
            'darwin': 'xcode-select --install',
            'windows': 'winget install BrechtSanders.MinGW-w64'
        },
        'java': {
            'linux': {
                'ubuntu': 'sudo apt update && sudo apt install -y default-jdk',
                'debian': 'sudo apt update && sudo apt install -y default-jdk',
                'fedora': 'sudo dnf install -y java-latest-openjdk-devel',
                'arch': 'sudo pacman -S jdk-openjdk',
                'default': 'sudo apt update && sudo apt install -y default-jdk'
            },
            'darwin': 'brew install openjdk',
            'windows': 'winget install Oracle.JDK.21'
        }
    }

    tool_info = guides.get(tool_key, {})
    if system in tool_info:
        if isinstance(tool_info[system], dict):
            cmd = tool_info[system].get(distro, tool_info[system].get('default', ''))
        else:
            cmd = tool_info[system]
    else:
        cmd = 'Refer to the official documentation to install ' + tool_key

    instructions = {
        'python': f"Python 3 interpreter is needed to execute .py scripts locally.",
        'node': f"Node.js runtime is needed to execute JavaScript (.js) files locally.",
        'gcc': f"GCC (GNU Compiler Collection) is needed to compile and run C (.c) programs.",
        'java': f"Java Development Kit (JDK with javac and java) is needed to compile and execute Java programs."
    }

    return {
        'command': cmd,
        'description': instructions.get(tool_key, '')
    }

def check_all_dependencies() -> dict:
    system, distro = detect_os_info()

    dependencies = [
        {
            'id': 'python',
            'name': 'Python 3',
            'language': 'Python (.py)',
            'binaries': ['python3'],
            'check_args': {'python3': '--version'},
            'required_for': 'Python execution'
        },
        {
            'id': 'node',
            'name': 'Node.js',
            'language': 'JavaScript (.js)',
            'binaries': ['node'],
            'check_args': {'node': '--version'},
            'required_for': 'JavaScript execution'
        },
        {
            'id': 'gcc',
            'name': 'GCC C Compiler',
            'language': 'C (.c)',
            'binaries': ['gcc'],
            'check_args': {'gcc': '--version'},
            'required_for': 'C compilation & execution'
        },
        {
            'id': 'java',
            'name': 'Java Development Kit (JDK)',
            'language': 'Java (.java)',
            'binaries': ['javac', 'java'],
            'check_args': {'javac': '-version', 'java': '-version'},
            'required_for': 'Java compilation & execution'
        }
    ]

    results = []
    all_ready = True

    for dep in dependencies:
        bin_paths = {}
        bin_versions = {}
        is_installed = True

        for b in dep['binaries']:
            path = shutil.which(b)
            if path:
                bin_paths[b] = path
                bin_versions[b] = get_tool_version(b, dep['check_args'].get(b, '--version'))
            else:
                bin_paths[b] = None
                bin_versions[b] = None
                is_installed = False

        if not is_installed:
            all_ready = False

        guide = get_install_guide(dep['id'], system, distro)
        results.append({
            'id': dep['id'],
            'name': dep['name'],
            'language': dep['language'],
            'installed': is_installed,
            'binaries': dep['binaries'],
            'paths': bin_paths,
            'versions': bin_versions,
            'primary_version': list(bin_versions.values())[0] if bin_versions else None,
            'install_guide': guide
        })

    return {
        'all_ready': all_ready,
        'os': {
            'system': platform.system(),
            'release': platform.release(),
            'distro': distro or platform.system().lower()
        },
        'dependencies': results
    }

