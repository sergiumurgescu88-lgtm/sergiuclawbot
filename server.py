#!/usr/bin/env python3
"""
AgentulMeu.online — Hermes Agent Edition v2.0
Backend Flask care integrează Hermes Agent by Nous Research
Conform blueprint-ului oficial: https://hermes-agent.nousresearch.com

Arhitectura:
  User → Nginx → Flask (:8080) → Hermes CLI → Ollama (:11434)
                          ↓
                   React SPA (dist/public/)
"""

import os

# Auto-load .env din directorul curent
def _load_dotenv(path=".env"):
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())
    except FileNotFoundError:
        pass
_load_dotenv("/var/www/agentulmeu.online/.env")

import sys
import json
import subprocess
import shutil
import sqlite3
import hashlib
import secrets
import base64
try:
    import stripe
except ImportError:
    stripe = None
from functools import wraps
from datetime import datetime, timedelta
from pathlib import Path
from flask import Flask, request, jsonify, send_file, g
from flask_cors import CORS
from intent_module import classify_intent
from reports_module import get_weekly_stats, format_telegram_report, send_telegram_report, send_email_report
from dotenv import load_dotenv

load_dotenv()

# ===== CONFIGURARE =====
app = Flask(__name__, static_folder='dist/public', static_url_path='')
CORS(app)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', secrets.token_hex(32))

# Directoare Hermes Agent (conform blueprint)
HOME = Path.home()
HERMES_DIR = HOME / ".hermes"
PROFILES_DIR = HERMES_DIR / "profiles"
AGENTS_DIR = HERMES_DIR / "agents"
SKILLS_DIR = HERMES_DIR / "skills"
MEMORY_DIR = HERMES_DIR / "memory"

# Directoare proiect (fallback compatibilitate)
BASE_DIR = Path(__file__).parent.resolve()
OUTPUT_DIR = BASE_DIR / "output" / "OpenClaw"
DB_PATH = BASE_DIR / "config" / "agentulmeu.db"

# Creare directoare
for d in [PROFILES_DIR, AGENTS_DIR, SKILLS_DIR, MEMORY_DIR, BASE_DIR / "config", OUTPUT_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Configurare Hermes & Ollama
HERMES_CMD = os.getenv("HERMES_CMD", "hermes")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "llama3.2:1b")

# ===== AUTENTIFICARE JWT =====

def init_db():
    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            agent_name TEXT,
            business_id TEXT,
            profile_filename TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            agent_id TEXT,
            messages TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
    return f"{salt}${pwd_hash}"

def verify_password(password: str, stored: str) -> bool:
    try:
        salt, pwd_hash = stored.split("$")
        return hashlib.sha256(f"{password}{salt}".encode()).hexdigest() == pwd_hash
    except:
        return False

def generate_token(user_id: int) -> str:
    header = json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(',', ':'))
    payload = json.dumps({
        "sub": user_id,
        "iat": datetime.utcnow().isoformat(),
        "exp": (datetime.utcnow() + timedelta(days=7)).isoformat()
    }, separators=(',', ':'))
    header_b64 = base64.urlsafe_b64encode(header.encode()).decode().rstrip('=')
    payload_b64 = base64.urlsafe_b64encode(payload.encode()).decode().rstrip('=')
    signature = hashlib.sha256(f"{header_b64}.{payload_b64}.{app.config['SECRET_KEY']}".encode()).hexdigest()
    return f"{header_b64}.{payload_b64}.{signature}"

def verify_token(token: str) -> int | None:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        signature = hashlib.sha256(f"{parts[0]}.{parts[1]}.{app.config['SECRET_KEY']}".encode()).hexdigest()
        if signature != parts[2]:
            return None
        payload = base64.urlsafe_b64decode(parts[1] + "==").decode()
        data = json.loads(payload)
        exp = datetime.fromisoformat(data["exp"])
        if datetime.utcnow() > exp:
            return None
        return int(data["sub"])
    except:
        return None

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        token = auth_header[7:] if auth_header.startswith('Bearer ') else None
        if not token:
            return jsonify({"success": False, "error": "Token lipsa"}), 401
        user_id = verify_token(token)
        if not user_id:
            return jsonify({"success": False, "error": "Token invalid sau expirat"}), 401
        conn = sqlite3.connect(str(DB_PATH))
        c = conn.cursor()
        c.execute("SELECT id, username, email, full_name FROM users WHERE id = ?", (user_id,))
        user = c.fetchone()
        conn.close()
        if not user:
            return jsonify({"success": False, "error": "Utilizator negasit"}), 401
        g.user = {"id": user[0], "username": user[1], "email": user[2], "full_name": user[3]}
        return f(*args, **kwargs)
    return decorated

# ===== HERMES INTEGRATION =====

def run_hermes_command(args: list, timeout: int = 120) -> dict:
    """Executa comanda Hermes si returneaza rezultatul"""
    cmd = [HERMES_CMD] + args
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout,
            env={**os.environ, "OLLAMA_HOST": OLLAMA_URL}
        )
        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Hermes command timed out", "output": "", "stderr": ""}
    except Exception as e:
        return {"success": False, "error": str(e), "output": "", "stderr": ""}

def hermes_installed() -> bool:
    """Verifica daca Hermes Agent este instalat"""
    try:
        result = subprocess.run([HERMES_CMD, "--version"], capture_output=True, text=True, timeout=5)
        return result.returncode == 0
    except:
        return False

def get_hermes_status() -> dict:
    """Returneaza statusul Hermes Agent"""
    if not hermes_installed():
        return {"installed": False, "version": None, "ollama_connected": False}
    
    result = run_hermes_command(["--version"], timeout=5)
    version = result["output"].strip() if result["success"] else "unknown"
    
    # Verifica conexiunea Ollama
    ollama_ok = False
    try:
        import urllib.request
        req = urllib.request.Request(f"{OLLAMA_URL}/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            ollama_ok = resp.status == 200
    except:
        pass
    
    return {
        "installed": True,
        "version": version,
        "ollama_connected": ollama_ok,
        "ollama_url": OLLAMA_URL,
        "hermes_dir": str(HERMES_DIR),
        "profiles_count": len(list(PROFILES_DIR.glob("*.json"))) if PROFILES_DIR.exists() else 0,
        "agents_count": sum(1 for _ in AGENTS_DIR.rglob("*.AGENT.md")) if AGENTS_DIR.exists() else 0
    }

# ===== LOGGING =====

def log_event(event_type: str, message: str, data: dict = None):
    entry = {
        "timestamp": datetime.now().isoformat(),
        "type": event_type,
        "message": message,
        "data": data or {}
    }
    log_file = BASE_DIR / "output" / "logs" / f"{datetime.now().strftime('%Y%m%d')}.jsonl"
    log_file.parent.mkdir(parents=True, exist_ok=True)
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

# ===== API ROUTES =====

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check complet cu status Hermes + Ollama"""
    hermes_status = get_hermes_status()
    profiles = len(list(PROFILES_DIR.glob("*.json"))) if PROFILES_DIR.exists() else 0
    agents = sum(1 for _ in AGENTS_DIR.rglob("*.AGENT.md")) if AGENTS_DIR.exists() else 0
    
    return jsonify({
        "status": "ok",
        "hermes": hermes_status,
        "profiles_count": profiles,
        "agents_count": agents,
        "ollama_url": OLLAMA_URL,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/hermes/status', methods=['GET'])
def hermes_status():
    """Status detaliat Hermes Agent"""
    return jsonify({"success": True, **get_hermes_status()})

@app.route('/api/hermes/install', methods=['POST'])
def hermes_install():
    """Instalare Hermes Agent via script oficial"""
    try:
        install_script = "https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh"
        result = subprocess.run(
            ["bash", "-c", f"curl -fsSL {install_script} | bash"],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            return jsonify({"success": True, "message": "Hermes Agent instalat cu succes", "output": result.stdout[:500]})
        return jsonify({"success": False, "error": "Instalare esuata", "details": result.stderr[:500]}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/hermes/agents', methods=['GET'])
def list_hermes_agents():
    """Listeaza agentii generati in ~/.hermes/agents/"""
    try:
        agents = []
        if AGENTS_DIR.exists():
            for business_dir in AGENTS_DIR.iterdir():
                if business_dir.is_dir():
                    business_agents = []
                    for agent_file in business_dir.glob("*.AGENT.md"):
                        business_agents.append({
                            "filename": agent_file.name,
                            "path": str(agent_file),
                            "size": agent_file.stat().st_size
                        })
                    if business_agents:
                        agents.append({
                            "business_id": business_dir.name,
                            "agents": business_agents
                        })
        return jsonify({"success": True, "agents": agents, "count": sum(len(a["agents"]) for a in agents)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/hermes/run', methods=['POST'])
def run_hermes_skill():
    """Ruleaza un skill Hermes: { skill, args }"""
    try:
        data = request.get_json()
        skill = data.get("skill")
        args = data.get("args", [])
        
        if not skill:
            return jsonify({"success": False, "error": "Missing skill parameter"}), 400
        
        hermes_args = ["run", f"skill={skill}"]
        for arg in args:
            hermes_args.extend(["--arg", arg])
        
        result = run_hermes_command(hermes_args, timeout=180)
        return jsonify({
            "success": result["success"],
            "output": result["output"],
            "stderr": result.get("stderr", ""),
            "returncode": result.get("returncode", -1)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ===== AUTH ROUTES =====

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "")
        full_name = data.get("full_name", "").strip()
        
        if not all([username, email, password]):
            return jsonify({"success": False, "error": "Toate campurile sunt obligatorii"}), 400
        if len(password) < 6:
            return jsonify({"success": False, "error": "Parola trebuie sa aiba minim 6 caractere"}), 400
        
        conn = sqlite3.connect(str(DB_PATH))
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
        if c.fetchone():
            conn.close()
            return jsonify({"success": False, "error": "Username sau email deja existent"}), 409
        
        pwd_hash = hash_password(password)
        c.execute("INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
                  (username, email, pwd_hash, full_name))
        user_id = c.lastrowid
        conn.commit()
        conn.close()
        
        token = generate_token(user_id)
        log_event("USER_REGISTERED", f"User {username} registered")
        
        return jsonify({
            "success": True,
            "token": token,
            "user": {"id": user_id, "username": username, "email": email, "full_name": full_name}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        password = data.get("password", "")
        
        conn = sqlite3.connect(str(DB_PATH))
        c = conn.cursor()
        c.execute("SELECT id, username, email, password_hash, full_name FROM users WHERE username = ?", (username,))
        user = c.fetchone()
        conn.close()
        
        if not user or not verify_password(password, user[3]):
            return jsonify({"success": False, "error": "Credentiale incorecte"}), 401
        
        token = generate_token(user[0])
        log_event("USER_LOGIN", f"User {username} logged in")
        
        return jsonify({
            "success": True,
            "token": token,
            "user": {"id": user[0], "username": user[1], "email": user[2], "full_name": user[4]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
@require_auth
def me():
    app.logger.warning(f"DEBUG_ME: g.user type={type(g.user)} value={g.user}")
    resp_payload = {"success": True, "user": g.user, "plan": "free"}
    app.logger.warning(f"DEBUG_ME: returning payload keys={list(resp_payload.keys())}")
    result = jsonify(resp_payload)
    app.logger.warning(f"DEBUG_ME: jsonify result type={type(result)}")
    return result

@app.route('/api/auth/logout', methods=['POST'])
@require_auth
def logout():
    log_event("USER_LOGOUT", f"User {g.user['username']} logged out")
    
    # Convert g.user to plain dict + add plan
    user_data = dict(g.user) if hasattr(g.user, 'keys') else (g.user if isinstance(g.user, dict) else {})
    return jsonify({"success": True, "user": {**user_data, "plan": "free"}, "plan": "free"})

@app.route('/api/auth/users/count', methods=['GET'])
def users_count():
    try:
        conn = sqlite3.connect(str(DB_PATH))
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM users")
        count = c.fetchone()[0]
        conn.close()
        return jsonify({"success": True, "count": count})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ===== PROFILE & GENERATE (Hermes Edition) =====

@app.route('/api/profile', methods=['POST'])
@require_auth
def save_profile():
    """Salvează profilul in ~/.hermes/profiles/ (conform blueprint)"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No JSON data"}), 400
        
        business = data.get("business", {})
        business_name = business.get("name", "unknown").lower().replace(" ", "_")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{business_name}_{timestamp}.json"
        
        # Salvează în ~/.hermes/profiles/ (conform blueprint Hermes)
        profile_path = PROFILES_DIR / filename
        
        # Structură conform blueprint-ului Hermes
        hermes_profile = {
            "business": {
                "business_id": business.get("business_id", business_name),
                "name": business.get("name", ""),
                "type": business.get("type", []),
                "description": business.get("description", ""),
                "products": business.get("products", ""),
                "ideal_client": business.get("ideal_client", ""),
                "region": business.get("region", ""),
                "website": business.get("website", "")
            },
            "goals": data.get("goals", {
                "primary": ["Crestere vanzari", "Automatizare lead-uri"],
                "top_problem": "Lipsa de timp pentru follow-up",
                "repetitive_tasks": ["Raspuns emailuri", "Calificare lead-uri", "Programare intalniri"],
                "priority_90days": "Dublarea numarului de lead-uri calificate"
            }),
            "agents_needed": data.get("agents_needed", ["hunter"]),
            "personality": data.get("personality", {}),
            "channels": data.get("channels", {}),
            "_meta": {
                "created_at": datetime.now().isoformat(),
                "filename": filename,
                "version": "2.0-hermes",
                "user_id": g.user["id"],
                "hermes_compatible": True
            }
        }
        
        with open(profile_path, "w", encoding="utf-8") as f:
            json.dump(hermes_profile, f, indent=2, ensure_ascii=False)
        
        log_event("PROFILE_SAVED", f"Saved to ~/.hermes/profiles/{filename}", {"business": business_name})
        
        return jsonify({
            "success": True,
            "filename": filename,
            "filepath": str(profile_path),
            "hermes_command": f'hermes run skill=build_business_agents --arg profile_path="{profile_path}"',
            "message": f"Profil salvat in ~/.hermes/profiles/{filename}"
        })
    except Exception as e:
        log_event("ERROR", f"Failed to save profile: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/generate', methods=['POST'])
@require_auth
def generate_agents():
    """Generează agenți folosind Hermes skill build_business_agents"""
    try:
        data = request.get_json()
        profile_filename = data.get("profile_filename")
        
        if not profile_filename:
            return jsonify({"success": False, "error": "Missing profile_filename"}), 400
        
        profile_path = PROFILES_DIR / profile_filename
        if not profile_path.exists():
            # Încearcă și în directorul vechi pentru compatibilitate
            old_path = BASE_DIR / "config" / "profiles" / profile_filename
            if old_path.exists():
                profile_path = old_path
            else:
                return jsonify({"success": False, "error": f"Profile not found: {profile_filename}"}), 404
        
        # Verifică dacă skill-ul există
        skill_path = SKILLS_DIR / "build_business_agents.SKILL.md"
        if not skill_path.exists():
            # Generează skill-ul implicit dacă nu există
            generate_default_skill()
        
        # Rulează skill-ul Hermes
        result = run_hermes_command([
            "run", f"skill=build_business_agents",
            "--arg", f'profile_path="{profile_path}"',
            "--arg", f'output_dir="{AGENTS_DIR}"'
        ], timeout=300)
        
        if result["success"]:
            # Listează fișierele generate
            business_id = profile_path.stem.split('_')[0]
            business_agents_dir = AGENTS_DIR / business_id
            generated_files = []
            if business_agents_dir.exists():
                for f in business_agents_dir.glob("*.AGENT.md"):
                    generated_files.append({
                        "filename": f.name,
                        "path": str(f),
                        "size": f.stat().st_size
                    })
            
            log_event("AGENTS_GENERATED", f"Generated {len(generated_files)} files via Hermes")
            
            return jsonify({
                "success": True,
                "message": f"Agenti generati prin Hermes! ({len(generated_files)} fisiere)",
                "output": result["output"],
                "generated_files": generated_files,
                "business_id": business_id,
                "hermes_dir": str(AGENTS_DIR)
            })
        else:
            return jsonify({
                "success": False,
                "error": "Hermes generation failed",
                "details": result.get("stderr", "")[:500],
                "output": result.get("output", "")[:500]
            }), 500
    except Exception as e:
        log_event("ERROR", f"Generate failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

def generate_default_skill():
    """Generează skill-ul build_business_agents implicit în ~/.hermes/skills/"""
    skill_content = '''# build_business_agents

## DESCRIPTION
Genereaza fisiere .AGENT.md pentru business-ul definit intr-un profil JSON.

## INPUT SCHEMA
```json
{
  "profile_path": "string (path to JSON profile)",
  "output_dir": "string (path to output directory, default: ~/.hermes/agents/)"
}
```

## OUTPUT
Fisiere .AGENT.md in ~/.hermes/agents/{business_id}/

## RUNTIME
model: llama3.2:1b
temperature: 0.7
max_tokens: 2048

## PROMPT
```
ROLE: Esti un expert in automatizare business care genereaza configuratii pentru agenti AI.

TASK: Genereaza un fisier .AGENT.md complet pentru un agent AI de tip {agent_type}.

FORMAT:
# {AGENT_TYPE} AGENT — {business_name}

## Rol si Obiective
- [Descriere clara a rolului agentului]
- [Obiective masurabile]

## Personalitate si Ton
- [Definirea personalitatii]
- [Exemple de comunicare]

## Capabilitati
- [Lista completa de capabilitati]

## Reguli si Constrangeri
- [Reguli absolute]
- [Limitari si exceptii]

## Flux de Lucru
1. [Pasul 1]
2. [Pasul 2]
3. [Pasul 3]

## Mesaje Template
- [Template 1]
- [Template 2]

RULES:
- Maxim 5 puncte per sectiune
- Instructiuni scurte si clare
- Limbaj romanesc profesional
- Optimizat pentru llama3.2:1b

EXAMPLES:
Input: business=NeoTerm, agent=hunter
Output: HUNTER.AGENT.md cu sectiunile de mai sus completate.
```
'''
    skill_path = SKILLS_DIR / "build_business_agents.SKILL.md"
    skill_path.parent.mkdir(parents=True, exist_ok=True)
    with open(skill_path, "w", encoding="utf-8") as f:
        f.write(skill_content)
    log_event("SKILL_CREATED", f"Created default skill at {skill_path}")

# ===== CHAT (Ollama direct — fallback) =====

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat cu agent prin Ollama (fallback Hermes)"""
    try:
        data = request.get_json()
        message = data.get("message", "")
        agent_type = data.get("agent_type", "hunter")
        business_id = data.get("business_id", "default")
        
        # Încearcă mai întâi să folosească agentul Hermes dacă există
        agent_file = AGENTS_DIR / business_id / f"{agent_type.upper()}.AGENT.md"
        context = ""
        if agent_file.exists():
            with open(agent_file, "r", encoding="utf-8") as f:
                context = f.read()[:1500]
        
        # Construiește prompt-ul
        system_prompt = f"Esti un agent AI de tip {agent_type.upper()} pentru business-ul {business_id}."
        if context:
            system_prompt += f"\n\nContextul tau de configurare:\n{context}"
        
        ollama_payload = {
            "model": DEFAULT_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "stream": False,
            "options": {"temperature": 0.7, "num_predict": 1024}
        }
        
        import urllib.request
        req = urllib.request.Request(
            f"{OLLAMA_URL}/api/chat",
            data=json.dumps(ollama_payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        with urllib.request.urlopen(req, timeout=180) as resp:
            result = json.loads(resp.read())
            response_text = result.get("message", {}).get("content", "")
        
        return jsonify({
            "success": True,
            "response": response_text,
            "model": DEFAULT_MODEL,
            "agent_type": agent_type,
            "business_id": business_id
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ===== BACKUP & FILES =====

@app.route('/api/backup/status', methods=['GET'])
def backup_status():
    try:
        import shutil
        disk = shutil.disk_usage("/")
        disk_free_gb = round(disk.free / (1024**3), 1)
        disk_total_gb = round(disk.total / (1024**3), 1)
        disk_percent = round((disk.used / disk.total) * 100, 1)
        
        backup_dir = Path("/opt/backups/agentulmeu/daily")
        latest_backup = None
        if backup_dir.exists():
            backups = sorted(backup_dir.glob("*"), key=lambda p: p.stat().st_mtime, reverse=True)
            if backups:
                latest_backup = backups[0].name
        
        return jsonify({
            "success": True,
            "disk_free": f"{disk_free_gb}GB",
            "disk_total": f"{disk_total_gb}GB",
            "disk_used_percent": disk_percent,
            "last_backup": latest_backup or "Niciun backup",
            "hermes_dir_size": sum(f.stat().st_size for f in HERMES_DIR.rglob("*") if f.is_file()) if HERMES_DIR.exists() else 0
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ===== GENERATE FILE (Dashboard.jsx) =====

import requests as _req
import zipfile, io as _io, base64 as _b64

OLLAMA_URL = "http://localhost:11434/api/generate"
_MODEL_BIG  = "qwen2.5-coder:7b"
_MODEL_FAST = "qwen2.5:0.5b"

_PROMPTS = {
"SOUL": "Esti expert in agenti AI pentru business-uri romanesti. Genereaza SOUL.md COMPLET si DETALIAT pentru agentul AI al business-ului de mai jos. Scrie EXCLUSIV in romana, minim 400 cuvinte, fii specific NU generic.\n\nBusiness: {business_name}\nCategorie: {business_category}\nTon: {tone}\nObiective: {objectives}\nDescriere: {business_description}\nEchipa: {team_size}\n\nStructura obligatorie:\n# SOUL - {business_name}\n## 1. MISIUNEA PRINCIPALA\n## 2. VALORILE FUNDAMENTALE (3-4 valori cu exemple practice)\n## 3. PRINCIPII ETICE (reguli clare pentru {business_category})\n## 4. AUTONOMIE vs CONTROL (ce face automat vs cere aprobare)\n## 5. TON si COMUNICARE (exemple mesaje concrete in stil {tone})",

"IDENTITY": "Genereaza IDENTITY.md pentru agentul business-ului {business_name} ({business_category}).\n\nFormat EXACT:\n# IDENTITY - {business_name}\n- Nume Agent: [nume memorabil relevant pentru {business_category}]\n- Agent ID: {agent_id}\n- Rol: [titlu concis]\n- Emoji: [1-2 emoji relevante]\n- Versiune: 1.0\n- Ton: {tone}\n- Personalitate in 3 cuvinte: [adj1], [adj2], [adj3]\n- Motto: [fraza scurta]\n\n## Cand ma activezi\n[3 exemple concrete pentru {business_category}]\n\n## Ce NU fac\n[3 limite clare]",

"AGENTS": "Genereaza AGENTS.md complet pentru {business_name} ({business_category}). Ton: {tone}. Obiective: {objectives}.\n\nInclude:\n# AGENTS - {business_name}\n## 1. OVERVIEW SISTEM\n## 2. AGENT PRINCIPAL (rol, capabilitati specifice pentru {business_category})\n## 3. SUBAGENT: [relevant pt {business_category}] (ex: Rezervari/Comenzi/Programari/FAQ)\n## 4. SUBAGENT: [al doilea relevant]\n## 5. PIPELINE COMPLET\n## 6. REGULI INTER-AGENTI\n## 7. EXEMPLE ACTIVARE MANUALA (5 exemple concrete)\nMinim 500 cuvinte, specific pentru {business_category}.",

"USER": "Genereaza USER.md pentru administratorul business-ului {business_name}.\nCategorie: {business_category}, Echipa: {team_size}, Ton: {tone}.\n\n# USER - {business_name}\n## Date de Baza\n## Preferinte Comunicare\n## Nivel de Aprobare\n### Executa automat:\n### Cere aprobare:\n## Context Business\n## Preferinte Raportare\n\nFii specific pentru {business_category}.",

"TOOLS": "Genereaza TOOLS.md pentru agentul {business_name} ({business_category}).\n\n# TOOLS - {business_name}\n## 1. CANALE DE COMUNICARE\n## 2. TOOL-URI INTERNE (specifice pentru {business_category})\n## 3. API-URI EXTERNE (relevante pentru {business_category})\n## 4. TOOL-URI INTERZISE\n## 5. NOTE MEDIU si CONFIGURARE\n## 6. PRIORITATE TOOL-URI\n\nMinim 300 cuvinte, specific pentru {business_category}.",

"MEMORY": "Genereaza MEMORY.md cu date initiale (seed) pentru {business_name} ({business_category}).\nObiective: {objectives}\n\n# MEMORY - {business_name}\n## Date Business (adresa, program, contact - cu [COMPLETEAZA] unde lipsesc)\n## Produse/Servicii Principale (5-8 tipice pentru {business_category}, preturi placeholder)\n## FAQ-uri Comune (10 intrebari+raspunsuri specifice {business_category})\n## Politici Cheie\n## Pattern-uri Clienti\n## Ce Nu Stiu Inca\n\nMinim 400 cuvinte.",

"HEARTBEAT": "Genereaza HEARTBEAT.md cu sarcini recurente pentru {business_name} ({business_category}).\nObiective: {objectives}\n\n# HEARTBEAT - {business_name}\n## ZILNIC 07:00 - Start zi\n## ZILNIC 12:00 - Check pranz\n## ZILNIC 19:00 - Inchidere zi\n## SAPTAMANAL (Luni 09:00)\n## LUNAR (1 ale lunii)\n## TRIGGER-URI IMEDIATE\n\nFii specific pentru {business_category}, minim 300 cuvinte.",

"BOOTSTRAP": "Genereaza BOOTSTRAP.md ghid de pornire pentru {business_name} ({business_category}), sistem OpenClaw.\n\n# BOOTSTRAP - {business_name}\n## CHECKLIST PRE-LANSARE (10 puncte)\n## PASUL 1: Configurare Credentiale\n## PASUL 2: Completare Date Business\n## PASUL 3: Testare (5 teste concrete)\n## PASUL 4: Prima Rulare\n## TROUBLESHOOTING COMUN (5 probleme+solutii)\n## SUPORT: contact@agentulmeu.online\n\nMinim 350 cuvinte, ghid practic.",

"AGENT_RD": "Genereaza AGENT_RD.md (Research & Development) pentru {business_name} ({business_category}).\nObiective: {objectives}\n\n# AGENT_RD - {business_name}\n## 1. SURSE MONITORIZATE (8-10 specifice pentru {business_category})\n## 2. METRICI DE PERFORMANTA\n## 3. AUTO-EVALUARE LUNARA\n## 4. ROADMAP (Luna 1-3 / 3-6 / 6-12)\n## 5. IDEI AUTOMATIZARI VIITOARE\n## 6. INTREBARI DE AUTO-EVALUARE\n\nMinim 400 cuvinte, actiionabil."
}

def _call_ollama(prompt, fast=False):
    """Kimi k2.6 via OpenAI SDK (primary) → Ollama (fallback)."""
    import os
    from openai import OpenAI

    kimi_key = os.getenv("KIMI_API_KEY", "")

    # --- Kimi k2.6 (primary) ---
    if kimi_key:
        try:
            client = OpenAI(
                api_key=kimi_key,
                base_url="https://api.moonshot.ai/v1"
            )
            resp = client.chat.completions.create(
                model="moonshot-v1-8k",
                messages=[
                    {"role": "system", "content": "Esti expert in configurarea agentilor AI pentru business-uri romanesti. Genereaza continut complet si detaliat exclusiv in limba romana. Respecta intocmai structura ceruta."},
                    {"role": "user", "content": prompt}
                ],
                temperature=1,
                max_tokens=8000
            )
            msg = resp.choices[0].message
            content = (msg.content or "").strip()
            if not content and hasattr(msg, "reasoning_content") and msg.reasoning_content:
                content = msg.reasoning_content.strip()
            log_event("GEN_KIMI", f"{len(content)}c")
            return content
        except Exception as e:
            log_event("KIMI_ERR", str(e))

    # --- Ollama local (fallback) ---
    model = _MODEL_FAST if fast else _MODEL_BIG
    try:
        r = _req.post(OLLAMA_URL, json={
            "model": model,
            "prompt": f"Raspunde in romana.\n\n{prompt}",
            "stream": False,
            "options": {"temperature": 0.72, "num_predict": 2048}
        }, timeout=180)
        if r.status_code == 200:
            content = r.json().get("response", "").strip()
            log_event("GEN_OLLAMA", f"{len(content)}c")
            return content
    except Exception as e:
        log_event("OLLAMA_ERR", str(e))

    return None

def _build_prompt(file_type, intake):
    tmpl = _PROMPTS.get(file_type, "Genereaza {file_type}.md pentru {business_name}.")
    bn = intake.get("business_name", "Business")
    return tmpl.format(
        business_name=bn,
        business_category=intake.get("business_category", "Servicii"),
        tone=intake.get("tone", "Profesional"),
        objectives=intake.get("objectives", "Automatizare suport clienti"),
        business_description=intake.get("business_description", intake.get("objectives", "")),
        team_size=intake.get("team_size", "Solo"),
        agent_id=bn.lower().replace(" ", "_") + "_v1",
        file_type=file_type
    )

@app.route('/api/generate-file', methods=['POST'])
@require_auth
def generate_file():
    try:
        data = request.get_json()
        file_type = data.get("file_type", "").upper()
        intake = data.get("intake_data", {})
        fast = data.get("fast", False)
        valid = ["SOUL","IDENTITY","USER","MEMORY","TOOLS","AGENTS","HEARTBEAT","BOOTSTRAP","AGENT_RD"]
        if not file_type:
            return jsonify({"success": False, "error": "Missing file_type"}), 400
        if file_type not in valid:
            return jsonify({"success": False, "error": f"Invalid: {file_type}"}), 400
        bn = intake.get("business_name", "Business")
        log_event("GEN_START", f"{file_type} pentru {bn}")
        prompt = _build_prompt(file_type, intake)
        content = _call_ollama(prompt, fast=fast)
        if not content:
            content = f"# {file_type}.md - {bn}\n\n> Generare AI indisponibila. Editati manual.\n\nBusiness: {bn}\nCategorie: {intake.get('business_category','N/A')}\nTon: {intake.get('tone','Profesional')}\nObiective: {intake.get('objectives','N/A')}\n"
            log_event("GEN_FALLBACK", file_type)
        safe = bn.lower().replace(" ","_").replace("/","_")
        out_dir = BASE_DIR / "output" / "OpenClaw" / safe
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / f"{file_type}.md").write_text(content, encoding="utf-8")
        log_event("GEN_DONE", f"{file_type} {len(content)}c")
        return jsonify({"success": True, "file_type": file_type, "content": content, "chars": len(content)})
    except Exception as e:
        log_event("GEN_ERR", str(e))
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/generate-zip', methods=['POST'])
@require_auth
def generate_zip():
    try:
        data = request.get_json()
        intake = data.get("intake_data", {})
        fast = data.get("fast", False)
        types = data.get("files", ["SOUL","IDENTITY","USER","MEMORY","TOOLS","AGENTS","HEARTBEAT","BOOTSTRAP","AGENT_RD"])
        bn = intake.get("business_name", "Business")
        safe = bn.lower().replace(" ","_").replace("/","_")
        log_event("ZIP_START", f"{bn} - {len(types)} fisiere")
        generated = {}
        failed = []
        for ft in types:
            if ft not in _PROMPTS:
                continue
            prompt = _build_prompt(ft, intake)
            content = _call_ollama(prompt, fast=fast)
            if content:
                generated[ft] = content
                log_event("ZIP_OK", f"{ft} {len(content)}c")
            else:
                generated[ft] = f"# {ft}.md - {bn}\n\n> Generare AI indisponibila. Editati manual.\n"
                failed.append(ft)
        out_dir = BASE_DIR / "output" / "OpenClaw" / safe
        out_dir.mkdir(parents=True, exist_ok=True)
        for ft, c in generated.items():
            (out_dir / f"{ft}.md").write_text(c, encoding="utf-8")
        buf = _io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for ft, c in generated.items():
                zf.writestr(f"{safe}/{ft}.md", c)
            readme = f"# OpenClaw Agent - {bn}\nGenerat de AgentulMeu.online\n\nFisiere:\n" + "\n".join(f"- {ft}.md" for ft in generated) + "\n\nInstalare:\n1. Copiaza folderul in ~/.openclaw/workspace/\n2. openclaw start\n\nSuport: contact@agentulmeu.online\n"
            zf.writestr(f"{safe}/README.md", readme)
        buf.seek(0)
        raw = buf.read()
        (out_dir / f"{safe}_openclaw.zip").write_bytes(raw)
        log_event("ZIP_DONE", f"{len(generated)} fisiere {len(raw)}B")
        return jsonify({
            "success": True,
            "business_name": bn,
            "files_generated": len(generated),
            "files_failed": failed,
            "zip_size_bytes": len(raw),
            "zip_base64": _b64.b64encode(raw).decode(),
            "zip_filename": f"{safe}_openclaw.zip",
            "files": {ft: {"chars": len(c), "preview": c[:150]} for ft,c in generated.items()}
        })
    except Exception as e:
        log_event("ZIP_ERR", str(e))
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/kb/pricing', methods=['GET'])
def kb_pricing():
    return jsonify({
        "base_plan": {"name": "Starter", "short_desc": "9 fișiere MD + Hermes setup", "price_monthly_usd": 29,
            "features": ["9 fișiere MD generate cu AI","1 business profile","Wizard 8 pași","Download ZIP","Support email"]},
        "subagent_plan": {"name": "Professional", "short_desc": "Business-uri nelimitate + sub-agenți", "price_per_agent_monthly_usd": 99,
            "features": ["Business-uri nelimitate","Sub-agenți specializați","Integrare Telegram/WhatsApp","Dashboard avansat","Priority support","API access"]},
        "setup_plan": {"name": "Done-For-You", "short_desc": "Instalăm totul pe VPS-ul tău", "price_one_time_usd": 299,
            "features": ["Setup complet VPS","Hermes instalat+configurat","Toate canalele conectate","Training 1-on-1 (2h)","30 zile support prioritar"]}
    })


# ===== SPA FALLBACK =====


@app.route('/install/command', methods=['GET'])
def install_command():
    """Returnează comanda one-liner pentru instalare"""
    domain = request.args.get('domain', '')
    telegram_token = request.args.get('telegram_token', '')
    telegram_chat_id = request.args.get('telegram_chat_id', '')
    business_name = request.args.get('business_name', 'Business-ul Meu')
    agent_name = request.args.get('agent_name', 'AgentulMeu')
    
    env_vars = f"AGENT_NAME='{agent_name}' BUSINESS_NAME='{business_name}'"
    if telegram_token:
        env_vars += f" TELEGRAM_TOKEN='{telegram_token}'"
    if telegram_chat_id:
        env_vars += f" TELEGRAM_CHAT_ID='{telegram_chat_id}'"
    if domain:
        env_vars += f" DOMAIN='{domain}'"
    
    command = f"{env_vars} curl -fsSL https://agentulmeu.online/install | sudo bash"
    
    return jsonify({
        "command": command,
        "script_url": "https://agentulmeu.online/install",
        "instructions": "Rulează comanda de mai sus pe VPS-ul tău Ubuntu 22.04/24.04"
    })


@app.route('/api/dashboard/hermes-status', methods=['GET'])
def hermes_dashboard_status():
    try:
        import requests as req
        resp = req.get("http://127.0.0.1:8787/api/dashboard/status", timeout=5)
        resp.raise_for_status()
        data = resp.json()
        return jsonify({"success": True, "hermes": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e), "hermes": {}}), 500

@app.route('/api/dashboard/analytics', methods=['GET'])
def dashboard_analytics():
    try:
        import os, json
        # Date reale vor fi citite din Hermes state.db în viitor
        # Pentru acum, returnăm structură stabilă + progres din wizard
        data = {
            "intents": {"rezervari": 42, "suport": 31, "vanzari": 16, "altele": 11},
            "channels": {"telegram": 58, "webchat": 27, "whatsapp": 15},
            "conversations_7d": [14, 21, 28, 33, 25, 38, 44],
            "top_questions": [
                {"q": "Care este programul?", "count": 87},
                {"q": "Cum fac o rezervare?", "count": 64},
                {"q": "Aveți livrare la domiciliu?", "count": 43}
            ]
        }
        return jsonify({"success": True, "analytics": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def spa_catch_all(path):
    if path.startswith('api/'):
        return jsonify({"success": False, "error": "API route not found"}), 404
    index_path = BASE_DIR / "dist" / "public" / "index.html"
    if index_path.exists():
        return send_file(index_path)
    return jsonify({"success": False, "error": "Frontend not built"}), 404

@app.errorhandler(404)
def not_found(e):
    path = request.path
    if not path.startswith('/api/'):
        index_path = BASE_DIR / "dist" / "public" / "index.html"
        if index_path.exists():
            return send_file(index_path)
    return jsonify({"error": "Endpoint not found"}), 404


# ===== MAIN =====



# === STRIPE CHECKOUT ROUTE ===
@app.route('/api/stripe/create-checkout', methods=['POST'])
@require_auth
def api_stripe_create_checkout():
    """Create Stripe Checkout Session"""
    try:
        if not request.is_json:
            return jsonify({'success': False, 'error': 'JSON required'}), 400
        data = request.get_json() or {}
        plan = data.get('plan', 'starter')
        
        plan_map = {'starter': 'STARTER', 'professional': 'PRO', 'doneforyou': 'DFY'}
        price_key = f"STRIPE_PRICE_{plan_map.get(plan, 'STARTER')}"
        price_id = os.getenv(price_key)
        
        if not price_id or 'REPLACE' in price_id:
            return jsonify({'success': False, 'error': f'Price {plan} not configured'}), 500
        
        mode = 'payment' if plan == 'doneforyou' else 'subscription'
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{'price': price_id, 'quantity': 1}],
            mode=mode,
            success_url=f"https://agentulmeu.online/success?plan={plan}",
            cancel_url="https://agentulmeu.online/cancel",
            metadata={'user_id': str(g.user.get('id',0)), 'plan': plan}
        )
        return jsonify({'success': True, 'url': session.url, 'session_id': session.id}), 200
    except stripe.error.StripeError as e:
        app.logger.error(f"Stripe API error: {e}")
        return jsonify({'success': False, 'error': f'Stripe: {str(e)}'}), 502
    except Exception as e:
        app.logger.error(f"Checkout error: {e}", exc_info=True)
        return jsonify({'success': False, 'error': f'Internal: {str(e)}'}), 500




# === STRIPE WEBHOOK ===
@app.route('/api/stripe/webhook', methods=['POST'])
def api_stripe_webhook():
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature', '')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except ValueError:
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError:
        return jsonify({'error': 'Invalid signature'}), 400

    event_type = event['type']
    app.logger.info(f"Stripe webhook: {event_type}")

    if event_type == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('metadata', {}).get('user_id')
        plan = session.get('metadata', {}).get('plan', 'starter')
        payment_status = session.get('payment_status', '')
        subscription_id = session.get('subscription')
        payment_intent = session.get('payment_intent')

        if user_id and payment_status == 'paid':
            try:
                conn = sqlite3.connect(str(DB_PATH))
                c = conn.cursor()
                # Cream coloana plan daca nu exista
                try:
                    c.execute("ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free'")
                    conn.commit()
                except:
                    pass
                try:
                    c.execute("ALTER TABLE users ADD COLUMN subscription_id TEXT")
                    conn.commit()
                except:
                    pass
                try:
                    c.execute("ALTER TABLE users ADD COLUMN plan_activated_at TEXT")
                    conn.commit()
                except:
                    pass
                c.execute(
                    "UPDATE users SET plan=?, subscription_id=?, plan_activated_at=? WHERE id=?",
                    (plan, subscription_id or payment_intent, datetime.utcnow().isoformat(), int(user_id))
                )
                conn.commit()
                conn.close()
                app.logger.info(f"Plan {plan} activat pentru user {user_id}")
            except Exception as e:
                app.logger.error(f"DB error webhook: {e}")

    elif event_type in ('customer.subscription.deleted', 'customer.subscription.updated'):
        sub = event['data']['object']
        sub_id = sub.get('id')
        status = sub.get('status')
        if status in ('canceled', 'unpaid', 'past_due'):
            try:
                conn = sqlite3.connect(str(DB_PATH))
                c = conn.cursor()
                c.execute("UPDATE users SET plan='free' WHERE subscription_id=?", (sub_id,))
                conn.commit()
                conn.close()
                app.logger.info(f"Plan resetat pentru subscription {sub_id} ({status})")
            except Exception as e:
                app.logger.error(f"DB error subscription update: {e}")

    return jsonify({'received': True}), 200



@app.route('/api/intent/classify', methods=['POST'])
def api_intent_classify():
    """Clasifica intentia unui mesaj"""
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'message required'}), 400
    
    result = classify_intent(data['message'])
    return jsonify(result)


@app.route('/api/intent/stats', methods=['GET'])
@require_auth
def api_intent_stats():
    """Returneaza statistici pe intentii pentru userul curent"""
    user_id = g.user['id']
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='conversations'")
        if not cursor.fetchone():
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    message TEXT,
                    response TEXT,
                    intent TEXT,
                    confidence REAL,
                    channel TEXT DEFAULT 'unknown',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
        
        cursor.execute("""
            SELECT intent, COUNT(*) as count, AVG(confidence) as avg_confidence
            FROM conversations 
            WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
            GROUP BY intent ORDER BY count DESC
        """, (user_id,))
        
        stats = []
        total = 0
        for row in cursor.fetchall():
            stats.append({
                'intent': row['intent'],
                'count': row['count'],
                'avg_confidence': round(row['avg_confidence'] or 0, 2)
            })
            total += row['count']
        
        conn.close()
        
        return jsonify({
            'success': True,
            'period': '7 zile',
            'total_conversations': total,
            'intents': stats
        })
        
    except Exception as e:
        app.logger.error(f"Intent stats error: {e}")
        return jsonify({
            'success': True,
            'period': '7 zile',
            'total_conversations': 0,
            'intents': []
        })


@app.route('/api/intent/log', methods=['POST'])
@require_auth
def api_intent_log():
    """Log o conversatie cu intent tagging automat"""
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'message required'}), 400
    
    user_id = g.user['id']
    message = data['message']
    response = data.get('response', '')
    channel = data.get('channel', 'web')
    
    intent_result = classify_intent(message)
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                message TEXT,
                response TEXT,
                intent TEXT,
                confidence REAL,
                channel TEXT DEFAULT 'unknown',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            INSERT INTO conversations (user_id, message, response, intent, confidence, channel)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, message, response, intent_result['intent'], intent_result['confidence'], channel))
        
        conn.commit()
        conv_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'success': True,
            'conversation_id': conv_id,
            'intent': intent_result
        })
        
    except Exception as e:
        app.logger.error(f"Intent log error: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/reports/weekly', methods=['GET'])
@require_auth
def api_reports_weekly():
    """Returnează raportul săptămânal pentru userul curent"""
    user_id = g.user['id']
    stats = get_weekly_stats(user_id)
    return jsonify(stats)


@app.route('/api/reports/send-telegram', methods=['POST'])
@require_auth
def api_reports_send_telegram():
    """Trimite raportul săptămânal pe Telegram"""
    data = request.get_json()
    if not data or 'telegram_token' not in data or 'chat_id' not in data:
        return jsonify({'error': 'telegram_token and chat_id required'}), 400
    
    business_name = data.get('business_name', 'Business-ul tău')
    result = send_telegram_report(data['telegram_token'], data['chat_id'], business_name)
    return jsonify(result)


@app.route('/api/reports/send-email', methods=['POST'])
@require_auth
def api_reports_send_email():
    """Trimite raportul săptămânal pe Email"""
    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({'error': 'email required'}), 400
    
    business_name = data.get('business_name', 'Business-ul tău')
    result = send_email_report(data['email'], business_name)
    return jsonify(result)


@app.route('/api/reports/configure', methods=['POST'])
@require_auth
def api_reports_configure():
    """Configurează rapoartele automate pentru user"""
    data = request.get_json()
    user_id = g.user['id']
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Creează tabela dacă nu există
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_report_config (
                user_id INTEGER PRIMARY KEY,
                telegram_token TEXT,
                telegram_chat_id TEXT,
                email TEXT,
                enabled INTEGER DEFAULT 1,
                business_name TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Upsert config
        cursor.execute("""
            INSERT OR REPLACE INTO user_report_config 
            (user_id, telegram_token, telegram_chat_id, email, enabled, business_name, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (
            user_id,
            data.get('telegram_token', ''),
            data.get('telegram_chat_id', ''),
            data.get('email', ''),
            1 if data.get('enabled', True) else 0,
            data.get('business_name', 'Business-ul tău')
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Configurație salvată'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/reports/config', methods=['GET'])
@require_auth
def api_reports_get_config():
    """Returnează configurația rapoartelor pentru user"""
    user_id = g.user['id']
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_report_config (
                user_id INTEGER PRIMARY KEY,
                telegram_token TEXT,
                telegram_chat_id TEXT,
                email TEXT,
                enabled INTEGER DEFAULT 1,
                business_name TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("SELECT * FROM user_report_config WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return jsonify({
                'success': True,
                'config': {
                    'telegram_token': row['telegram_token'],
                    'telegram_chat_id': row['telegram_chat_id'],
                    'email': row['email'],
                    'enabled': bool(row['enabled']),
                    'business_name': row['business_name']
                }
            })
        else:
            return jsonify({
                'success': True,
                'config': {
                    'telegram_token': '',
                    'telegram_chat_id': '',
                    'email': '',
                    'enabled': True,
                    'business_name': 'Business-ul tău'
                }
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/api/wizard/businesses', methods=['GET'])
@require_auth
def wizard_get_businesses():
    """Returnează lista de business-uri configurate de user"""
    user_id = g.user['id']
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get profiles for this user
        cursor.execute("""
            SELECT id, filename, data, created_at 
            FROM profiles 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        """, (user_id,))
        
        businesses = []
        for row in cursor.fetchall():
            try:
                profile_data = json.loads(row['data']) if row['data'] else {}
                businesses.append({
                    'id': row['id'],
                    'name': profile_data.get('business_name', 'Business nou'),
                    'category': profile_data.get('business_category', 'Nespecificat'),
                    'created_at': row['created_at'],
                    'preview': {
                        'tone': profile_data.get('tone', ''),
                        'objectives': profile_data.get('objectives', '')
                    }
                })
            except:
                continue
        
        conn.close()
        return jsonify({'success': True, 'businesses': businesses})
        
    except Exception as e:
        app.logger.error(f"Get businesses error: {e}")
        return jsonify({'success': True, 'businesses': []})


@app.route('/api/wizard/business', methods=['POST'])
@require_auth
def wizard_create_business():
    """Creează un nou profil de business pentru wizard"""
    data = request.get_json()
    if not data or 'business_name' not in data: 
        return jsonify({'error': 'business_name required'}), 400
    
    user_id = g.user['id']
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        profile_data = {
            'business_name': data['business_name'],
            'business_category': data.get('category', ''),
            'tone': data.get('tone', ''),
            'objectives': data.get('objectives', ''),
            'created_via': 'wizard_multi'
        }
        
        cursor.execute("""
            INSERT INTO profiles (user_id, filename, data, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        """, (user_id, f"business_{data['business_name'].lower().replace(' ', '_')}.json", json.dumps(profile_data)))
        
        conn.commit()
        profile_id = cursor.lastrowid
        conn.close()
        
        return jsonify({'success': True, 'profile_id': profile_id})
        
    except Exception as e:
        app.logger.error(f"Create business error: {e}")
        return jsonify({'error': str(e)}), 500




@app.route('/api/wizard/ask-ai', methods=['POST', 'OPTIONS'])
def wizard_ask_ai_public():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        import requests
        data = request.json or {}
        question = data.get('prompt') or data.get('question') or ''
        context = data.get('business_context', {})
        if not question:
            return jsonify({"success": False, "error": "Intrebarea este goala"}), 400

        context_str = "\n".join([f"{k}: {v}" for k, v in context.items() if v])
        prompt = f"""Esti un asistent AI specializat in configurarea de agenti AI pentru business-uri.
Utilizatorul completeaza un wizard si are nevoie de o sugestie profesionala, concisa si practica.
Intrebare: {question}
Context business (daca exista):
{context_str if context_str else "Niciun context furnizat inca."}

Raspunde direct, in limba romana, in maxim 3-4 propozitii. Fara introduceri lungi. Fii practic si orientat spre actiune."""

        # Folosim cheia Gemini furnizată
        OR_KEY = __import__("os").environ.get("OPENROUTER_API_KEY", "")
        resp = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": "Bearer " + OR_KEY, "Content-Type": "application/json", "HTTP-Referer": "https://agentulmeu.online"},
            json={"model": "google/gemini-2.0-flash-001", "messages": [{"role": "user", "content": prompt}], "max_tokens": 512},
            timeout=20
        )
        resp.raise_for_status()
        answer = resp.json()["choices"][0]["message"]["content"].strip()
        return jsonify({"success": True, "answer": answer})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/wizard/generate', methods=['POST', 'OPTIONS'])
def wizard_generate_files():
    if request.method == 'OPTIONS': return '', 204
    try:
        import requests as req_lib
        data = request.json or {}
        ctx = data.get('context', {})
        file_id = data.get('file', None)
        if not ctx:
            ctx = {"business": "Business general"}
        ctx_str = ", ".join([str(k)+": "+str(v) for k, v in ctx.items() if v])
        file_prompts = {
            "soul":      ("SOUL.md",      "Creaza SOUL.md pentru agent AI. Context: "+ctx_str+". Include: misiune, valori, reguli absolute, ton, ce NU face niciodata. Format markdown."),
            "identity":  ("IDENTITY.md",  "Creaza IDENTITY.md. Context: "+ctx_str+". Include: nume agent, rol, personalitate, limite, stil raspuns. Format markdown."),
            "user":      ("USER.md",      "Creaza USER.md profil proprietar. Context: "+ctx_str+". Include: obiective, preferinte, prioritati, restrictii. Format markdown."),
            "memory":    ("MEMORY.md",    "Creaza MEMORY.md memoria initiala. Context: "+ctx_str+". Include: decizii cheie, contexte, pattern-uri relevante. Format markdown."),
            "tools":     ("TOOLS.md",     "Creaza TOOLS.md. Context: "+ctx_str+". Include: capabilitati tehnice, API-uri, integari, tool-uri disponibile. Format markdown."),
            "agents":    ("AGENTS.md",    "Creaza AGENTS.md. Context: "+ctx_str+". Include: subagenti, roluri, workflows, pipeline-uri de lucru. Format markdown."),
            "heartbeat": ("HEARTBEAT.md", "Creaza HEARTBEAT.md. Context: "+ctx_str+". Include: taskuri proactive zilnice, saptamanale, lunare. Format markdown."),
            "bootstrap": ("BOOTSTRAP.md", "Creaza BOOTSTRAP.md. Context: "+ctx_str+". Include: checklist initializare, pasi setup in ordine, fallback-uri. Format markdown."),
            "agent_rd":  ("AGENT_RD.md",  "Creaza AGENT_RD.md agent R&D. Context: "+ctx_str+". Include: domenii monitorizate, validare idei, surse, raportare. Format markdown."),
        }
        openrouter_key = os.getenv("OPENROUTER_API_KEY", "")
        if not openrouter_key:
            return jsonify({"success": False, "error": "OPENROUTER_API_KEY lipsa"}), 500
        headers = {
            "Authorization": "Bearer " + openrouter_key,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://agentulmeu.online",
            "X-Title": "AgentulMeu Wizard"
        }
        def gen_one(prompt):
            r = req_lib.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json={"model": "google/gemini-2.0-flash-001", "messages": [{"role": "user", "content": prompt}]},
                timeout=100
            )
            r.raise_for_status()
            text = r.json()["choices"][0]["message"]["content"].strip()
            lines = text.split(chr(10))
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            return chr(10).join(lines).strip()
        if file_id and file_id in file_prompts:
            fname, prompt = file_prompts[file_id]
            content = gen_one(prompt)
            return jsonify({"success": True, "content": content, "filename": fname})
        else:
            generated = {}
            for fid, (fname, prompt) in file_prompts.items():
                generated[fid] = gen_one(prompt)
            return jsonify({"success": True, "files": generated})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", 8080))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    log_event("SERVER_START", f"AgentulMeu.online Hermes Edition starting on {host}:{port}")
    app.run(host=host, port=port, debug=debug, threaded=True)
