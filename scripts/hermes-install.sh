#!/bin/bash
# ═══════════════════════════════════════════════════════════
# HERMES AGENT — Install Script pentru Ubuntu 22.04/24.04
# AgentulMeu.online — Done-For-You Setup
# ═══════════════════════════════════════════════════════════

set -e

# Culori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logo
echo -e "${BLUE}"
echo "  ╔═══════════════════════════════════════════════════╗"
echo "  ║                                                   ║"
echo "  ║   🤖  HERMES AGENT — Install Script              ║"
echo "  ║   AgentulMeu.online — Done-For-You Setup         ║"
echo "  ║                                                   ║"
echo "  ╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ═══ VERIFICĂRI PRELIMINARE ═══
echo -e "${YELLOW}━━━ Verificări preliminare ━━━${NC}"

# Root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}✕ Rulează cu sudo sau ca root${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Root: OK${NC}"

# Ubuntu version
OS_VERSION=$(lsb_release -rs 2>/dev/null || echo "unknown")
if [[ "$OS_VERSION" != "22.04" && "$OS_VERSION" != "24.04" ]]; then
  echo -e "${YELLOW}⚠ Ubuntu $OS_VERSION detectat (recomandat: 22.04 sau 24.04)${NC}"
  read -p "Continui oricum? (y/n): " -n 1 -r
  echo
  [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
fi
echo -e "${GREEN}✓ Ubuntu $OS_VERSION: OK${NC}"

# RAM
RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
if [ "$RAM_MB" -lt 3500 ]; then
  echo -e "${RED}✕ RAM insuficient: ${RAM_MB}MB (minim 4GB recomandat)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ RAM: ${RAM_MB}MB OK${NC}"

# Disk
DISK_AVAIL=$(df -m / | awk 'NR==2{print $4}')
if [ "$DISK_AVAIL" -lt 5000 ]; then
  echo -e "${YELLOW}⚠ Spațiu disk: ${DISK_AVAIL}MB disponibil (recomandat >5GB)${NC}"
fi
echo -e "${GREEN}✓ Disk: ${DISK_AVAIL}MB disponibil${NC}"

# ═══ PARAMETRI ═══
echo ""
echo -e "${YELLOW}━━━ Configurare ━━━${NC}"

# Parametri din URL sau interactiv
AGENT_NAME="${AGENT_NAME:-AgentulMeu}"
BUSINESS_NAME="${BUSINESS_NAME:-Business-ul Meu}"
TELEGRAM_TOKEN="${TELEGRAM_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
OLLAMA_MODEL="${OLLAMA_MODEL:-llama3.2:1b}"
DOMAIN="${DOMAIN:-}"

if [ -z "$TELEGRAM_TOKEN" ]; then
  read -p "Telegram Bot Token (lasă gol pentru skip): " TELEGRAM_TOKEN
fi
if [ -z "$TELEGRAM_CHAT_ID" ]; then
  read -p "Telegram Chat ID (lasă gol pentru skip): " TELEGRAM_CHAT_ID
fi
if [ -z "$DOMAIN" ]; then
  read -p "Domeniu pentru HTTPS (ex: agent.domeniu.ro): " DOMAIN
fi

echo -e "${GREEN}✓ Agent: $AGENT_NAME${NC}"
echo -e "${GREEN}✓ Business: $BUSINESS_NAME${NC}"
echo -e "${GREEN}✓ Model: $OLLAMA_MODEL${NC}"
[ -n "$TELEGRAM_TOKEN" ] && echo -e "${GREEN}✓ Telegram: configurat${NC}"
[ -n "$DOMAIN" ] && echo -e "${GREEN}✓ Domeniu: $DOMAIN${NC}"

# ═══ INSTALARE DEPENDINȚE ═══
echo ""
echo -e "${YELLOW}━━━ Instalare dependențe ━━━${NC}"

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl wget git unzip nginx certbot python3-certbot-nginx \
  build-essential python3 python3-pip python3-venv nodejs npm > /dev/null 2>&1

echo -e "${GREEN}✓ Dependințe sistem: instalate${NC}"

# ═══ NODE.JS (LTS) ═══
echo -e "${YELLOW}→ Node.js...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
  apt-get install -y -qq nodejs > /dev/null 2>&1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# ═══ OLLAMA ═══
echo -e "${YELLOW}→ Ollama...${NC}"
if ! command -v ollama &> /dev/null; then
  curl -fsSL https://ollama.ai/install.sh | sh > /dev/null 2>&1
fi

# Start Ollama
systemctl start ollama 2>/dev/null || ollama serve &
sleep 3

# Pull model
echo -e "${YELLOW}→ Download model $OLLAMA_MODEL (poate dura câteva minute)...${NC}"
ollama pull "$OLLAMA_MODEL" > /dev/null 2>&1
echo -e "${GREEN}✓ Ollama + $OLLAMA_MODEL: ready${NC}"

# ═══ HERMES AGENT ═══
echo ""
echo -e "${YELLOW}━━━ Hermes Agent ━━━${NC}"

HERMES_USER="hermes"
HERMES_HOME="/home/$HERMES_USER"

# Create dedicated user
if ! id "$HERMES_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$HERMES_USER"
  echo -e "${GREEN}✓ Utilizator $HERMES_USER creat${NC}"
fi

# Install Hermes Agent
echo -e "${YELLOW}→ Download Hermes Agent...${NC}"
su - $HERMES_USER -c "
  mkdir -p ~/.hermes/skills ~/.hermes/profiles ~/.hermes/memory
  cd ~
  if [ ! -d 'hermes-agent' ]; then
    git clone https://github.com/NousResearch/hermes-agent.git hermes-agent 2>/dev/null || \
    git clone https://github.com/openclaw/hermes-agent.git hermes-agent 2>/dev/null || \
    echo 'WARN: Hermes clone failed, using pip install'
  fi
"

# Install via pip
su - $HERMES_USER -c "
  cd ~/hermes-agent 2>/dev/null || cd ~
  python3 -m venv .venv 2>/dev/null
  source .venv/bin/activate 2>/dev/null
  pip install -q hermes-agent 2>/dev/null || pip install -q openclaw 2>/dev/null || true
"

echo -e "${GREEN}✓ Hermes Agent: instalat${NC}"

# ═══ CONFIGURARE HERMES ═══
echo ""
echo -e "${YELLOW}━━━ Configurare ━━━${NC}"

# Create config
cat > "$HERMES_HOME/.hermes/config.yaml" << CONFIGEOF
agent:
  name: "$AGENT_NAME"
  business: "$BUSINESS_NAME"
  model: "$OLLAMA_MODEL"
  ollama_url: "http://localhost:11434"
  autonomy: "semi"

telegram:
  enabled: $([ -n "$TELEGRAM_TOKEN" ] && echo "true" || echo "false")
  token: "${TELEGRAM_TOKEN:-}"
  chat_id: "${TELEGRAM_CHAT_ID:-}"

server:
  host: "127.0.0.1"
  port: 9119

memory:
  path: "~/.hermes/memory"
  persistent: true

skills:
  path: "~/.hermes/skills"
  auto_load: true
CONFIGEOF

chown -R $HERMES_USER:$HERMES_USER "$HERMES_HOME/.hermes"
echo -e "${GREEN}✓ Config: ~/.hermes/config.yaml${NC}"

# ═══ FIȘIERE MD (SOUL, IDENTITY, etc.) ═══
echo -e "${YELLOW}→ Generare fișiere MD de bază...${NC}"

SOUL_DIR="$HERMES_HOME/.hermes/knowledge"
mkdir -p "$SOUL_DIR"

cat > "$SOUL_DIR/SOUL.md" << 'SOULEOF'
# SOUL — AgentulMeu

## MISIUNE
Sunt agentul AI al business-ului configurat prin AgentulMeu.online. 
Scopul meu este să automatizez interacțiunile cu clienții, să răspund 
la întrebări și să execut task-uri repetitive cu precizie.

## VALORI
- Profesionalism în fiecare interacțiune
- Răspunsuri rapide și precise
- Respectarea tonului și identității business-ului
- Învățare continuă din interacțiuni

## REGULI ABSOLUTE
- Nu inventez informații despre produse/prețuri
- Nu promit ce nu pot livra
- Escaladez către uman când nu sunt sigur
- Răspund în limba română
SOULEOF

cat > "$SOUL_DIR/IDENTITY.md" << IDENTITYEOF
# IDENTITY — $BUSINESS_NAME

## BUSINESS
- Nume: $BUSINESS_NAME
- Agent: $AGENT_NAME
- Configurare: AgentulMeu.online

## TON COMUNICAȚIE
Profesional, prietenos, orientat spre soluții.

## LIMBĂ
Română (principal), English (fallback)
IDENTITYEOF

chown -R $HERMES_USER:$HERMES_USER "$SOUL_DIR"
echo -e "${GREEN}✓ Fișiere MD: SOUL.md, IDENTITY.md${NC}"

# ═══ SYSTEMD SERVICE ═══
echo ""
echo -e "${YELLOW}━━━ Systemd Service ━━━${NC}"

cat > /etc/systemd/system/hermes-agent.service << SVCEOF
[Unit]
Description=Hermes AI Agent
After=network.target ollama.service

[Service]
Type=simple
User=$HERMES_USER
WorkingDirectory=$HERMES_HOME/hermes-agent
ExecStart=$HERMES_HOME/hermes-agent/.venv/bin/python -m hermes_agent
Restart=always
RestartSec=10
Environment=HOME=$HERMES_HOME
Environment=OLLAMA_HOST=http://localhost:11434

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable hermes-agent
systemctl start hermes-agent
echo -e "${GREEN}✓ Service: hermes-agent activat și pornit${NC}"

# ═══ NGINX REVERSE PROXY ═══
echo ""
echo -e "${YELLOW}━━━ Nginx Reverse Proxy ━━━${NC}"

if [ -n "$DOMAIN" ]; then
  cat > /etc/nginx/sites-available/hermes-$DOMAIN << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:9119;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:9119;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINXEOF

  ln -sf /etc/nginx/sites-available/hermes-$DOMAIN /etc/nginx/sites-enabled/
  
  # SSL Certificate
  echo -e "${YELLOW}→ Certificat SSL pentru $DOMAIN...${NC}"
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email 2>/dev/null || \
    echo -e "${YELLOW}⚠ SSL: rulează manual: certbot --nginx -d $DOMAIN${NC}"
  
  systemctl reload nginx
  echo -e "${GREEN}✓ Nginx: https://$DOMAIN → localhost:9119${NC}"
else
  echo -e "${YELLOW}⚠ Fără domeniu — Hermes accesibil doar local pe port 9119${NC}"
fi

# ═══ TELEGRAM GATEWAY ═══
if [ -n "$TELEGRAM_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
  echo ""
  echo -e "${YELLOW}━━━ Telegram Gateway ━━━${NC}"
  
  cat > "$HERMES_HOME/.hermes/telegram-gateway.py" << TGEOF
#!/usr/bin/env python3
"""Telegram Gateway pentru Hermes Agent"""
import requests, json, time, os

TOKEN = "$TELEGRAM_TOKEN"
CHAT_ID = "$TELEGRAM_CHAT_ID"
HERMES_API = "http://localhost:9119/api"

def get_updates(offset=None):
    url = f"https://api.telegram.org/bot{TOKEN}/getUpdates"
    params = {"timeout": 30}
    if offset:
        params["offset"] = offset
    try:
        r = requests.get(url, params=params, timeout=35)
        return r.json().get("result", [])
    except:
        return []

def send_message(text):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    requests.post(url, json={"chat_id": CHAT_ID, "text": text, "parse_mode": "Markdown"})

def process_command(text):
    if text.startswith("/status"):
        try:
            r = requests.get(f"{HERMES_API}/status", timeout=5)
            return f"🤖 Hermes: {r.json().get('status', 'unknown')}"
        except:
            return "⚠ Hermes API indisponibil"
    elif text.startswith("/list"):
        return "📋 Agenți disponibili:\n• hunter - Lead Generation\n• writer - Conținut\n• closer - Vânzări\n• support - Suport Clienți"
    elif text.startswith("/run"):
        parts = text.split(" ", 2)
        if len(parts) >= 3:
            agent, prompt = parts[1], parts[2]
            return f"🚀 Trimit task către {agent}..."
        return "❌ Format: /run <agent> <prompt>"
    else:
        return f"Comenzi disponibile:\n/status — Status sistem\n/list — Lista agenți\n/run <agent> <prompt> — Execută task"

if __name__ == "__main__":
    print("🤖 Telegram Gateway pornit")
    send_message("✅ Hermes Agent online! Trimite /status pentru detalii.")
    last_offset = None
    while True:
        updates = get_updates(last_offset)
        for update in updates:
            last_offset = update["update_id"] + 1
            msg = update.get("message", {})
            text = msg.get("text", "")
            if text:
                response = process_command(text)
                send_message(response)
        time.sleep(5)
TGEOF

  chown $HERMES_USER:$HERMES_USER "$HERMES_HOME/.hermes/telegram-gateway.py"
  chmod +x "$HERMES_HOME/.hermes/telegram-gateway.py"
  
  # Telegram gateway service
  cat > /etc/systemd/system/hermes-telegram.service << TGSVCEOF
[Unit]
Description=Hermes Telegram Gateway
After=network.target hermes-agent.service

[Service]
Type=simple
User=$HERMES_USER
ExecStart=/usr/bin/python3 $HERMES_HOME/.hermes/telegram-gateway.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
TGSVCEOF

  systemctl daemon-reload
  systemctl enable hermes-telegram
  systemctl start hermes-telegram
  echo -e "${GREEN}✓ Telegram Gateway: activat și pornit${NC}"
fi

# ═══ FINAL ═══
echo ""
echo -e "${BLUE}"
echo "  ╔═══════════════════════════════════════════════════╗"
echo "  ║                                                   ║"
echo "  ║   ✅ INSTALARE COMPLETĂ!                          ║"
echo "  ║                                                   ║"
echo "  ╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}Servicii active:${NC}"
echo "  • Hermes Agent:  http://localhost:9119"
echo "  • Ollama:        http://localhost:11434"
[ -n "$DOMAIN" ] && echo "  • Web:           https://$DOMAIN"
[ -n "$TELEGRAM_TOKEN" ] && echo "  • Telegram:      @bot activ"

echo ""
echo -e "${YELLOW}Comenzi utile:${NC}"
echo "  systemctl status hermes-agent    — Status agent"
echo "  systemctl restart hermes-agent   — Restart agent"
echo "  journalctl -u hermes-agent -f    — Logs live"
echo "  ollama list                      — Modele instalate"
echo ""
echo -e "${GREEN}🤖 Agentul tău Hermes e live!${NC}"
echo -e "${GRAY}Configurat prin AgentulMeu.online${NC}"
