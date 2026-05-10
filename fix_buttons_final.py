with open('dist/public/wizard-form.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ── 1. Sterge toate blocurile de override conflictuale ──────────────────────
import re

# Sterge blocul mare "TOATE BUTOANELE — GOLD PREMIUM FINAL"
html = re.sub(
    r'/\* ═══ TOATE BUTOANELE — GOLD PREMIUM FINAL ═══ \*/.*?button:disabled \{[^}]*\}',
    '',
    html,
    flags=re.DOTALL
)

# Sterge blocul "BUTOANE GOLD PREMIUM"
html = re.sub(
    r'/\* ═══ BUTOANE GOLD PREMIUM ═══ \*/.*?@keyframes gold-shimmer \{[^}]*\}',
    '',
    html,
    flags=re.DOTALL
)

# Sterge blocul "NEON CARDS"
html = re.sub(
    r'/\* ═══ NEON CARDS ═══ \*/.*?\.wz-pill\.sel \{[^}]*\}',
    '',
    html,
    flags=re.DOTALL
)

# Sterge blocul "CULORI FINALE OVERRIDE"
html = re.sub(
    r'/\* ═══ CULORI FINALE OVERRIDE ═══ \*/.*?box-shadow: none !important;\n\}',
    '',
    html,
    flags=re.DOTALL
)

# ── 2. Injectează CSS curat ÎNAINTE de </style> ─────────────────────────────
CLEAN_CSS = """
/* ═══════════════════════════════════════════════════
   SISTEM BUTOANE PREMIUM — VERSIUNE FINALĂ UNICĂ
   ═══════════════════════════════════════════════════ */

/* Reset global — elimină orice animație nebună */
button, input[type=submit], input[type=button] {
  font-family: 'Inter', sans-serif !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  border-radius: 8px !important;
  transition: transform .15s ease, box-shadow .15s ease !important;
  animation: none !important;
}

/* ── CONTINUE (Next) — Verde solid ── */
.wz-btn-next {
  background: #16a34a !important;
  color: #ffffff !important;
  border: none !important;
  padding: 12px 28px !important;
  font-size: 0.92rem !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 8px rgba(22,163,74,0.30) !important;
  border-radius: 10px !important;
}
.wz-btn-next:hover:not(:disabled) {
  background: #15803d !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(22,163,74,0.38) !important;
}
.wz-btn-next:disabled {
  background: #86efac !important;
  color: #fff !important;
  opacity: 0.6 !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

/* ── BACK — Gri neutru ── */
.wz-btn-back {
  background: #f3f4f6 !important;
  color: #6b7280 !important;
  border: 1.5px solid #e5e7eb !important;
  padding: 12px 22px !important;
  font-size: 0.88rem !important;
  font-weight: 600 !important;
  box-shadow: none !important;
  border-radius: 10px !important;
}
.wz-btn-back:hover {
  background: #e5e7eb !important;
  color: #374151 !important;
  transform: none !important;
  box-shadow: none !important;
}

/* ── SUGEREAZĂ / PROPUNE — Premium White ── */
.wz-btn-ask {
  background: #ffffff !important;
  color: #374151 !important;
  border: 1.5px solid #d1d5db !important;
  padding: 5px 12px !important;
  font-size: 0.74rem !important;
  font-weight: 600 !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07) !important;
  border-radius: 7px !important;
}
.wz-btn-ask:hover:not(:disabled) {
  background: #f9fafb !important;
  border-color: #9ca3af !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 3px 8px rgba(0,0,0,0.10) !important;
}
.wz-btn-ask:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
  transform: none !important;
}

/* ── ACTION (Download, ZIP) — Gold gradient ── */
.wz-btn-action {
  background: linear-gradient(135deg, #F5D050 0%, #C9A227 55%, #9A7610 100%) !important;
  color: #111111 !important;
  border: none !important;
  padding: 13px 24px !important;
  font-size: 0.92rem !important;
  font-weight: 700 !important;
  box-shadow: 0 3px 12px rgba(201,162,39,0.35) !important;
  border-radius: 10px !important;
  width: 100% !important;
}
.wz-btn-action:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 22px rgba(201,162,39,0.50) !important;
}

/* ── PILLS — Premium White, selected = negru solid ── */
.wz-pill {
  background: #ffffff !important;
  color: #374151 !important;
  border: 1.5px solid #e5e7eb !important;
  padding: 8px 18px !important;
  border-radius: 999px !important;
  font-size: 0.82rem !important;
  font-weight: 500 !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
  transition: all .18s ease !important;
}
.wz-pill:hover {
  border-color: #9ca3af !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.10) !important;
  transform: none !important;
}
.wz-pill.active, .wz-pill.sel {
  background: #111111 !important;
  color: #ffffff !important;
  border-color: #111111 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18) !important;
  font-weight: 700 !important;
}

/* ── CARDS (biz type, objectives, agents) ── */
.wz-bcard, .wz-acard, .wz-biz-card {
  background: #ffffff !important;
  border: 1.5px solid #e5e7eb !important;
  transition: all .2s ease !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
}
.wz-bcard:hover, .wz-acard:hover, .wz-biz-card:hover {
  border-color: #C9A227 !important;
  box-shadow: 0 4px 16px rgba(201,162,39,0.25) !important;
  transform: translateY(-3px) !important;
}
.wz-bcard.sel, .wz-acard.sel, .wz-biz-card.active {
  border-color: #C9A227 !important;
  box-shadow: 0 0 0 3px rgba(201,162,39,0.20), 0 4px 16px rgba(201,162,39,0.22) !important;
  background: #fffdf0 !important;
}

/* ── Butoane mici inline (download, preview, salvează) ── */
button.dl-btn,
.wz-btn-ask[onclick*="saveEdit"],
.wz-btn-ask[onclick*="closeEdit"] {
  background: #ffffff !important;
  color: #374151 !important;
  border: 1.5px solid #d1d5db !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07) !important;
}

/* ── Chat toggle ── */
.wz-chat-toggle {
  background: linear-gradient(135deg, #F5D050, #C9A227) !important;
  color: #111 !important;
  border: none !important;
  box-shadow: 0 4px 16px rgba(201,162,39,0.40) !important;
}
.wz-chat-input button {
  background: linear-gradient(135deg, #F5D050, #C9A227) !important;
  color: #111 !important;
  border: none !important;
}

@keyframes gold-shimmer {
  0% { left: -80%; }
  65%, 100% { left: 130%; }
}
"""

# Injectează înainte de primul </style>
if CLEAN_CSS not in html:
    html = html.replace('</style>', CLEAN_CSS + '\n</style>', 1)
    print("✅ CSS premium injectat")
else:
    print("⚠️  CSS deja prezent, skip")

with open('dist/public/wizard-form.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("✅ Gata — wizard-form.html salvat")
