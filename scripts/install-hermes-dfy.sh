#!/usr/bin/env bash
set -euo pipefail
# HERMES DFY INSTALL — AgentulMeu.online (Calea B: $299 one-time)
# Usage: curl -sL https://agentulmeu.online/install-dfy.sh | bash -s -- --domain X --zip Y

RED='\033[0;32m'; NC='\033[0m'
log() { echo -e "${RED}[✓]${NC} $1"; }

DOMAIN=""; BUSINESS=""; ZIP_PATH=""; HERMES_PORT="3000"
while [[ $# -gt 0 ]]; do
  case $1 in
    --domain) DOMAIN="$2"; shift 2;;
    --business) BUSINESS="$2"; shift 2;;
    --zip) ZIP_PATH="$2"; shift 2;;
    --port) HERMES_PORT="$2"; shift 2;;
    *) shift;;
  esac
done
[[ -z "$DOMAIN" || -z "$ZIP_PATH" ]] && { echo "Usage: $0 --domain X --zip Y"; exit 1; }

SUBDOMAIN="hermes.${DOMAIN}"
HERMES_DIR="/opt/hermes-${DOMAIN//./_}"
HERMES_HOME="$HOME/.hermes"

log "Starting DFY install for $BUSINESS ($SUBDOMAIN)"

# 1. Extract ZIP config files
mkdir -p "$HERMES_HOME" "$HERMES_DIR"
unzip -q "$ZIP_PATH" -d "$HERMES_HOME"
log "Config files extracted to $HERMES_HOME"

# 2. Install Hermes Agent if missing
if ! command -v hermes >/dev/null 2>&1; then
  log "Installing Hermes Agent..."
  curl -sSL https://raw.githubusercontent.com/nousresearch/hermes/main/install.sh | bash
fi

# 3. Create systemd service
cat > /etc/systemd/system/hermes-${DOMAIN//./_}.service << SVCEOF
[Unit]
Description=Hermes Agent for $BUSINESS
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=$HERMES_HOME
Environment="HERMES_HOME=$HERMES_HOME"
Environment="NODE_ENV=production"
ExecStart=$(which node) $(which hermes) agent --port $HERMES_PORT
Restart=on-failure
RestartSec=5
[Install]
WantedBy=multi-user.target
SVCEOF

# 4. Nginx + SSL
cat > /etc/nginx/sites-available/$SUBDOMAIN << NGINXEOF
server {
    listen 80;
    server_name $SUBDOMAIN;
    location / { return 301 https://\$server_name\$request_uri; }
}
server {
    listen 443 ssl http2;
    server_name $SUBDOMAIN;
    ssl_certificate /etc/letsencrypt/live/$SUBDOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$SUBDOMAIN/privkey.pem;
    location / {
        proxy_pass http://127.0.0.1:$HERMES_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/$SUBDOMAIN /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d $SUBDOMAIN --non-interactive --agree-tos --register-unsafely-without-email || log "⚠️ SSL: setup manual needed"

# 5. Start service
systemctl daemon-reload
systemctl enable --now hermes-${DOMAIN//./_}

log "✅ Hermes installed for $BUSINESS"
echo ""
echo "🔗 Dashboard: https://$SUBDOMAIN"
echo "🔧 Manage: systemctl status hermes-${DOMAIN//./_}"
echo "📁 Config: $HERMES_HOME"
echo ""
echo "Next: Share dashboard link with client + schedule onboarding call."
