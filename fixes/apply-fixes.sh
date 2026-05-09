#!/bin/bash
# apply-fixes.sh — Aplică toate fix-urile pentru AgentulMeu.online
# Rulează din /root/: bash apply-fixes.sh

set -e
FRONTEND="/root/agentulmeu-frontend"
BACKEND="/var/www/agentulmeu.online"
HERMES="/var/www/hermes"
FIXES_DIR="$(dirname "$0")"

echo "🔧 AgentulMeu — Aplicare fix-uri..."
echo ""

# ===== 1. tailwind.config.js =====
echo "1/6 tailwind.config.js..."
cp "$FIXES_DIR/tailwind.config.js" "$FRONTEND/tailwind.config.js"
echo "   ✓ Done"

# ===== 2. global.css =====
echo "2/6 global.css..."
cp "$FIXES_DIR/global.css" "$FRONTEND/src/styles/global.css"
echo "   ✓ Done"

# ===== 3. Wizard.jsx =====
echo "3/6 Wizard.jsx (fix formData init)..."
cp "$FIXES_DIR/Wizard.jsx" "$FRONTEND/src/components/Wizard.jsx"
echo "   ✓ Done"

# ===== 4. Dashboard.jsx =====
echo "4/6 Dashboard.jsx (fix endpoint + preview)..."
cp "$FIXES_DIR/Dashboard.jsx" "$FRONTEND/src/components/Dashboard.jsx"
echo "   ✓ Done"

# ===== 5. server.py — fix base64 + adăugare endpoint-uri =====
echo "5/6 server.py (fix base64 import + /api/generate-file + /api/kb/pricing)..."

SERVERPY="$BACKEND/server.py"
BACKUP="$BACKEND/server.py.bak.$(date +%s)"
cp "$SERVERPY" "$BACKUP"
echo "   Backup: $BACKUP"

# Fix 1: adaugă 'import base64' la topul importurilor (după 'import secrets')
if ! grep -q "^import base64" "$SERVERPY"; then
  sed -i 's/^import secrets$/import secrets\nimport base64/' "$SERVERPY"
  echo "   ✓ import base64 adăugat la top"
fi

# Fix 2: șterge import base64 din __main__
sed -i '/import base64  # Import here to avoid circular issues/d' "$SERVERPY"
echo "   ✓ import base64 din __main__ șters"

# Fix 3: adaugă /api/generate-file dacă nu există
if ! grep -q "generate-file" "$SERVERPY"; then
python3 << 'PYEOF'
import re

with open("/var/www/agentulmeu.online/server.py", "r") as f:
    content = f.read()

generate_route = '''
# ===== GENERATE FILE (Dashboard.jsx) =====

@app.route('/api/generate-file', methods=['POST'])
@require_auth
def generate_file():
    try:
        data = request.get_json()
        file_type = data.get("file_type", "").upper()
        intake = data.get("intake_data", {})
        if not file_type:
            return jsonify({"success": False, "error": "Missing file_type"}), 400
        valid = ["SOUL","IDENTITY","USER","MEMORY","TOOLS","AGENTS","HEARTBEAT","BOOTSTRAP","AGENT_RD"]
        if file_type not in valid:
            return jsonify({"success": False, "error": f"Invalid: {file_type}"}), 400
        business_name = intake.get("business_name", "Business")
        agent_name = intake.get("agent_name", "Agent")
        content = f"""# {file_type}.md — {business_name}

## Generat de AgentulMeu.online
Business: {business_name}
Agent: {agent_name}
Tip: {file_type}

## Date Preluate din Wizard
- Categorie: {intake.get("business_category", "N/A")}
- Maturitate: {intake.get("business_maturity", "N/A")}
- Echipă: {intake.get("team_size", "Solo")}
- Ton: {intake.get("tone", "Profesional")}
- Obiective: {intake.get("objectives", "N/A")}

## Configurare {file_type}
[Generat automat — editează conform nevoilor]
"""
        output_dir = BASE_DIR / "output" / "OpenClaw" / business_name.lower().replace(" ", "_")
        output_dir.mkdir(parents=True, exist_ok=True)
        with open(output_dir / f"{file_type}.md", "w") as out:
            out.write(content)
        log_event("FILE_GENERATED", f"Generated {file_type}.md")
        return jsonify({"success": True, "file_type": file_type, "content": content})
    except Exception as e:
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

'''

# Insert before SPA FALLBACK
spa_marker = "# ===== SPA FALLBACK ====="
if spa_marker in content:
    content = content.replace(spa_marker, generate_route + "\n" + spa_marker)
    with open("/var/www/agentulmeu.online/server.py", "w") as f:
        f.write(content)
    print("   ✓ /api/generate-file + /api/kb/pricing adăugate")
else:
    print("   ⚠ Nu am găsit marcajul SPA FALLBACK — adaugă manual")
PYEOF
fi

echo "   ✓ server.py patch complet"

# ===== 6. Hermes interface =====
echo "6/6 Hermes chat interface..."
mkdir -p "$HERMES"
cp "$FIXES_DIR/hermes-index.html" "$HERMES/index.html"
chown www-data:www-data "$HERMES/index.html" 2>/dev/null || true
echo "   ✓ Done"

# ===== BUILD FRONTEND =====
echo ""
echo "🏗  Rebuild frontend React..."
cd "$FRONTEND"
npm run build 2>&1 | tail -5

# Copy build to serving location
BUILD_SRC="$FRONTEND/dist"
BUILD_DEST="$BACKEND/dist/public"
mkdir -p "$BUILD_DEST"
cp -r "$BUILD_SRC/"* "$BUILD_DEST/"
echo "   ✓ Build copiat în $BUILD_DEST"

# ===== RESTART FLASK =====
echo ""
echo "🔄 Restart Flask..."
if command -v pm2 &>/dev/null && pm2 list | grep -q "agentulmeu"; then
  pm2 restart agentulmeu
  echo "   ✓ PM2 restart"
elif systemctl is-active --quiet agentulmeu 2>/dev/null; then
  systemctl restart agentulmeu
  echo "   ✓ systemctl restart"
else
  echo "   ⚠ Restart manual: kill procesul Flask + repornește server.py"
  echo "   Hint: pkill -f 'server.py' && cd $BACKEND && python3 server.py &"
fi

echo ""
echo "✅ Toate fix-urile aplicate!"
echo ""
echo "📋 Verificare:"
echo "   curl https://agentulmeu.online/api/health"
echo "   curl https://agentulmeu.online/api/kb/pricing"
echo "   Visit: https://hermes.agentulmeu.online"
