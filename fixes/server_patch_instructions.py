#!/usr/bin/env python3
"""
PATCH server.py — AgentulMeu.online
Aplică cu: patch /var/www/agentulmeu.online/server.py server.patch

SAU înlocuiește manual cele 3 secțiuni marcate jos.
"""

# ============================================================
# FIX 1: Mută `import base64` la TOPUL fișierului
# (linia 17-18, după `import secrets`)
#
# Adaugă la secțiunea de imports existentă:
#   import base64
#
# Șterge din __main__:
#   import base64  # Import here to avoid circular issues
# ============================================================

# ============================================================
# FIX 2: Adaugă endpoint-ul /api/generate-file
# (după ruta /api/backup/status, înainte de /api/kb/pricing)
# ============================================================

GENERATE_FILE_ROUTE = '''
# ===== GENERATE FILE (folosit de Dashboard.jsx) =====

@app.route('/api/generate-file', methods=['POST'])
@require_auth
def generate_file():
    """Generează un fișier MD individual pentru Dashboard"""
    try:
        data = request.get_json()
        file_type = data.get("file_type", "").upper()
        intake = data.get("intake_data", {})

        if not file_type:
            return jsonify({"success": False, "error": "Missing file_type"}), 400

        valid_types = ["SOUL","IDENTITY","USER","MEMORY","TOOLS","AGENTS","HEARTBEAT","BOOTSTRAP","AGENT_RD"]
        if file_type not in valid_types:
            return jsonify({"success": False, "error": f"Invalid file_type: {file_type}"}), 400

        business_name = intake.get("business_name", "Business")
        agent_name = intake.get("agent_name", "Agent")

        templates = {
            "SOUL": f"""# SOUL.md — {business_name}

## Misiune
Agent AI dedicat pentru {business_name}. Scop: automatizare inteligentă și creștere sustenabilă.

## Valori Fundamentale
- Transparență totală față de utilizator
- Acuratețe înaintea vitezei
- Respectul datelor private
- Îmbunătățire continuă prin feedback

## Reguli Absolute (Red Lines)
{intake.get("red_lines", "- Nu contacta clienții fără aprobare explicită\\n- Nu face promisiuni neconfirmate\\n- Nu accesa date fără permisiune")}

## Autonomie
Nivel: {intake.get("autonomy_level", "Acțiune cu aprobare")}

## Identitate
Sunt {agent_name}, agentul AI al {business_name}. Operez conform acestor principii indiferent de circumstanțe.
""",
            "IDENTITY": f"""# IDENTITY.md — {agent_name}

## Profil Agent
- **Nume:** {agent_name}
- **Business:** {business_name}
- **Ton:** {intake.get("tone", "Profesional")}
- **Limbă:** {intake.get("language", "Română")}
- **Program:** {intake.get("working_hours", "09:00-18:00 L-V")}

## Personalitate
Agent {intake.get("tone", "profesional").lower()}, axat pe rezultate concrete.
Comunică clar, fără jargon inutil.

## Capabilități Primare
{chr(10).join([f"- {ag}" for ag in (intake.get("exec_agents") or ["Asistență generală"])])}

## Canale Active
{chr(10).join([f"- {ch}" for ch in (intake.get("channels") or ["Email"])])}
""",
            "USER": f"""# USER.md — Profilul Utilizatorului

## Date Business
- **Categorie:** {intake.get("business_category", "N/A")}
- **Maturitate:** {intake.get("business_maturity", "N/A")}
- **Echipă:** {intake.get("team_size", "Solo")}
- **Nisă:** {intake.get("niche", "N/A")}

## Obiective
{intake.get("objectives", "- Creștere vânzări\\n- Automatizare procese\\n- Îmbunătățire customer service")}

## Prioritate 90 Zile
{intake.get("priority_90_days", "Definit de utilizator")}

## Nivel Tehnic
{intake.get("tech_comfort", "Intermediar")} — Implicare: {intake.get("involvement", "Co-pilot")}
""",
            "MEMORY": f"""# MEMORY.md — Context Business

## Descriere
{intake.get("business_description", "Business activ pe piața românească.")}

## Produse & Servicii
{intake.get("products_services", "De completat de utilizator.")}

## Structura Prețuri
{intake.get("pricing_info", "De completat de utilizator.")}

## Client Ideal
{intake.get("ideal_client", "De completat de utilizator.")}

## Avantaj Competitiv
Definit în funcție de context și feedback continuu.
""",
            "TOOLS": f"""# TOOLS.md — Infrastructură & Tooling

## CRM & Tools
{intake.get("crm_tools", "De specificat de utilizator")}

## Canale Comunicare
{chr(10).join([f"- {ch}: activ" for ch in (intake.get("channels") or [])])}

## Buget AI Lunar
${intake.get("ai_budget", "0")}/lună

## Stack Tehnic
- Model: Hermes Agent (Nous Research)
- Backend: Ollama local / API
- Integrări: Conform canalelor active
""",
            "AGENTS": f"""# AGENTS.md — Echipa de Sub-Agenți

## Agenți de Execuție
{chr(10).join([f"### {ag}\\nRol definit, memorie proprie, escaladare configurată." for ag in (intake.get("exec_agents") or ["HUNTER"])])}

## Agenți Specializați
{chr(10).join([f"- {ag}" for ag in (intake.get("spec_agents") or [])])}

## Workflow
1. Utilizatorul trimite comandă
2. Agentul principal procesează
3. Delegare la sub-agent specializat
4. Rezultat + raport înapoi
""",
            "HEARTBEAT": f"""# HEARTBEAT.md — Rutine & Automatizări

## Task-uri Proactive Zilnice
- 08:00 — Raport overnight + priorități zi
- 12:00 — Check pipeline lead-uri
- 17:00 — Sumar activitate + next steps

## Trigger-e Automate
- Mesaj nou → răspuns în < 30 min
- Lead nou → calificare automată
- Eroare critică → alertă imediată

## Alerte
- Buget AI depășit 80% → notificare
- Nicio activitate 48h → health check
""",
            "BOOTSTRAP": f"""# BOOTSTRAP.md — Checklist Lansare

## Pași Critici
- [ ] Instalat Hermes Agent pe server
- [ ] Configurat model AI (Ollama/API)
- [ ] Conectat canale comunicare
- [ ] Testat primul mesaj de la telefon
- [ ] Verificat flow-ul de lead-uri
- [ ] Backup configurat

## Deadline
{intake.get("deadline", "Cât mai curând posibil")}

## Așteptări
{intake.get("expectations", "Sistem funcțional, automatizare reală, ROI măsurabil.")}

## Fallback Plan
Dacă ceva nu merge: rulează în mod manual 48h → diagnosticare → fix.
""",
            "AGENT_RD": f"""# AGENT_RD.md — Research & Development

## Framework Validare Idei
1. Ipoteză → Test mic (< $50 sau 1 zi)
2. Măsoară rezultat concret
3. Iterare sau abandon

## Surse Monitorizate
- Competitori: scan săptămânal
- Piață: Google Trends + social
- Clienți: feedback loop continuu

## Metrici Cheie
- CAC (Cost per client achiziționat)
- LTV (Valoare pe durata relației)
- Rata răspuns la mesaje
- Conversie lead → client
""",
        }

        content = templates.get(file_type, f"# {file_type}.md\\n\\nFișier generat de AgentulMeu.online")

        # Salvează pe disk opțional (în output)
        output_dir = BASE_DIR / "output" / "OpenClaw" / business_name.lower().replace(" ", "_")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"{file_type}.md"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(content)

        log_event("FILE_GENERATED", f"Generated {file_type}.md for {business_name}")

        return jsonify({
            "success": True,
            "file_type": file_type,
            "content": content,
            "path": str(output_path)
        })

    except Exception as e:
        log_event("ERROR", f"generate_file failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
'''

# ============================================================
# FIX 3: Adaugă endpoint-ul /api/kb/pricing
# (folosit de Pricing.jsx)
# ============================================================

KB_PRICING_ROUTE = '''
@app.route('/api/kb/pricing', methods=['GET'])
def kb_pricing():
    """Date prețuri pentru componenta Pricing"""
    return jsonify({
        "base_plan": {
            "name": "Starter",
            "short_desc": "Perfect pentru un singur business. Cele 9 fișiere MD + Hermes setup.",
            "price_monthly_usd": 29,
            "features": [
                "9 fișiere MD generate cu AI",
                "1 business profile",
                "Wizard complet 8 pași",
                "Download ZIP",
                "Support prin email",
                "Update-uri incluse"
            ],
            "footer_text": "Anulezi oricând"
        },
        "subagent_plan": {
            "name": "Professional",
            "short_desc": "Mai multe business-uri, sub-agenți specializați, prioritate support.",
            "price_per_agent_monthly_usd": 99,
            "features": [
                "Business-uri nelimitate",
                "Sub-agenți specializați (Hunter, Writer, Closer...)",
                "Integrare Telegram/WhatsApp",
                "Dashboard avansat",
                "Priority support",
                "API access",
                "Custom agent templates"
            ],
            "footer_text": "Cel mai ales plan"
        },
        "setup_plan": {
            "name": "Done-For-You Setup",
            "short_desc": "Instalăm și configurăm totul pe VPS-ul tău. Training 1-on-1 inclus.",
            "price_one_time_usd": 299,
            "features": [
                "Setup complet pe VPS-ul tău",
                "Hermes Agent instalat și configurat",
                "Toate canalele conectate",
                "Training 1-on-1 (2h)",
                "30 zile support prioritar",
                "Customizare agenți",
                "Documentație personalizată"
            ],
            "footer_text": "Plată unică, fără abonament"
        }
    })
'''

if __name__ == '__main__':
    print("=== PATCH INSTRUCTIONS ===")
    print()
    print("1. Adaugă `import base64` la topul server.py (linia ~17)")
    print("2. Șterge `import base64` din blocul if __name__ == '__main__'")
    print("3. Adaugă ruta generate_file (de mai sus) înainte de SPA FALLBACK")
    print("4. Adaugă ruta kb_pricing (de mai sus) după generate_file")
    print()
    print("SAU rulează comanda de pe VPS de mai jos:")
