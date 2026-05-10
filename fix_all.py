with open('dist/public/wizard-form.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ─── 1. Sterge CSS orfan (liniile ~181-206) ──────────────────────────────────
s = html.find('\n\n\n  65%, 100% { left: 130%; }\n}')
e = html.find('\n\n\n/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n   SISTEM BUTOANE PREMIUM')
if s != -1 and e != -1:
    html = html[:s] + html[e:]
    print('OK 1: CSS orfan sters')
else:
    print('SKIP 1: s=%d e=%d' % (s,e))

# ─── 2. wz-btn-ask = GOLD in blocul SISTEM BUTOANE ────────────────────────────
html = html.replace(
'/* \u2500\u2500 SUGEREAZ\u0102 / PROPUNE \u2014 Premium White \u2500\u2500 */\n.wz-btn-ask {\n  background: #ffffff !important;\n  color: #374151 !important;\n  border: 1.5px solid #d1d5db !important;\n  padding: 5px 12px !important;\n  font-size: 0.74rem !important;\n  font-weight: 600 !important;\n  box-shadow: 0 1px 3px rgba(0,0,0,0.07) !important;\n  border-radius: 7px !important;\n}\n.wz-btn-ask:hover:not(:disabled) {\n  background: #f9fafb !important;\n  border-color: #9ca3af !important;\n  transform: translateY(-1px) !important;\n  box-shadow: 0 3px 8px rgba(0,0,0,0.10) !important;\n}\n.wz-btn-ask:disabled {\n  opacity: 0.5 !important;\n  cursor: not-allowed !important;\n  transform: none !important;\n}',
'/* \u2500\u2500 SUGEREAZ\u0102 / PROPUNE \u2014 Gold Premium \u2500\u2500 */\n.wz-btn-ask {\n  background: rgba(201,162,39,0.13) !important;\n  color: #A68521 !important;\n  border: 1.5px solid rgba(201,162,39,0.40) !important;\n  padding: 4px 11px !important;\n  font-size: 0.74rem !important;\n  font-weight: 700 !important;\n  box-shadow: none !important;\n  border-radius: 7px !important;\n}\n.wz-btn-ask:hover:not(:disabled) {\n  background: linear-gradient(135deg,#F5D050,#C9A227) !important;\n  color: #111 !important;\n  border-color: #C9A227 !important;\n  transform: translateY(-1px) !important;\n  box-shadow: 0 3px 10px rgba(201,162,39,0.28) !important;\n}\n.wz-btn-ask:disabled {\n  opacity: 0.5 !important;\n  cursor: not-allowed !important;\n  transform: none !important;\n}')
print('OK 2: wz-btn-ask gold')

# ─── 3. Rescrie fileCard() cu butoane vizibile de la start ───────────────────
FC_START = "function fileCard(item) {\n  const d = document.createElement('div');\n  d.className = 'wz-bcard'; d.dataset.file = item.id;"
FC_END   = "  d.appendChild(header);\n  d.appendChild(desc);\n  d.appendChild(btn);\n  d.appendChild(preview);\n  return d;\n}"
s = html.find(FC_START)
e = html.find(FC_END, s) + len(FC_END)
if s != -1:
    NEW_FC = """function fileCard(item) {
  const FNAMES = {soul:'SOUL.md',identity:'IDENTITY.md',user:'USER.md',memory:'MEMORY.md',tools:'TOOLS.md',agents:'AGENTS.md',heartbeat:'HEARTBEAT.md',bootstrap:'BOOTSTRAP.md',agent_rd:'AGENT_RD.md'};
  const fname = FNAMES[item.id] || item.id + '.md';
  const d = document.createElement('div');
  d.dataset.file = item.id;
  d.style.cssText = 'text-align:left;cursor:default;padding:16px;background:#fff;border:1.5px solid rgba(201,162,39,0.25);border-radius:12px;margin-bottom:10px;transition:border-color .2s,background .2s';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px';
  header.innerHTML = '<span style="font-size:1.3rem">' + item.icon + '</span><span style="font-size:0.87rem;font-weight:700;color:#111">' + item.label + '</span>';
  const status = document.createElement('span');
  status.className = 'file-status';
  status.style.cssText = 'margin-left:auto;font-size:0.7rem;color:#9ca3af;white-space:nowrap;font-weight:600';
  status.textContent = '\u25a1 Negenerat';
  header.appendChild(status);

  const desc = document.createElement('div');
  desc.style.cssText = 'font-size:0.78rem;color:#666;margin-bottom:12px;line-height:1.5';
  desc.textContent = item.desc;

  const genBtn = document.createElement('button');
  genBtn.className = 'gen-btn';
  genBtn.style.cssText = 'width:100%;padding:11px;background:#16a34a;color:#fff;font-weight:700;border:none;border-radius:9px;cursor:pointer;font-size:0.84rem;box-shadow:0 2px 8px rgba(22,163,74,0.28);transition:all .15s;margin-bottom:8px';
  genBtn.textContent = '\u26a1 Genereaz\u0103 ' + item.label;
  genBtn.onmouseover = function(){ if(!this.disabled){this.style.background='#15803d';this.style.transform='translateY(-1px)';} };
  genBtn.onmouseout  = function(){ if(!this.disabled){this.style.background='#16a34a';this.style.transform='';} };
  genBtn.onclick = function() { generateFile(item.id, this); };

  const actRow = document.createElement('div');
  actRow.style.cssText = 'display:flex;gap:8px';

  const dlBtn = document.createElement('button');
  dlBtn.className = 'dl-btn';
  dlBtn.disabled = true;
  dlBtn.style.cssText = 'flex:1;padding:8px 10px;background:#f3f4f6;color:#9ca3af;font-weight:600;border:1.5px solid #e5e7eb;border-radius:8px;cursor:not-allowed;font-size:0.78rem;transition:all .15s';
  dlBtn.textContent = '\u2b07 Descarc\u0103';
  dlBtn.onclick = function() {
    const c = generatedFiles[item.id]; if(!c) return;
    const b = new Blob([c],{type:'text/markdown'}); const a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = fname; a.click();
  };

  const pvBtn = document.createElement('button');
  pvBtn.className = 'pv-btn';
  pvBtn.disabled = true;
  pvBtn.style.cssText = 'flex:1;padding:8px 10px;background:#f3f4f6;color:#9ca3af;font-weight:600;border:1.5px solid #e5e7eb;border-radius:8px;cursor:not-allowed;font-size:0.78rem;transition:all .15s';
  pvBtn.textContent = '\ud83d\udc41 Preview';
  pvBtn.onclick = function() {
    const pv = d.querySelector('.file-preview');
    if(pv) { pv.style.display = pv.style.display==='none'?'block':'none'; pvBtn.textContent = pv.style.display==='block'?'\u2715 \u00cenchide':'\ud83d\udc41 Preview'; }
  };
  actRow.appendChild(dlBtn); actRow.appendChild(pvBtn);

  const preview = document.createElement('div');
  preview.className = 'file-preview';
  preview.style.cssText = 'display:none;margin-top:10px;font-size:0.75rem;color:#444;max-height:160px;overflow-y:auto;white-space:pre-wrap;background:#f8f9fa;padding:10px;border-radius:8px;border:1px solid #e5e7eb;line-height:1.6;font-family:JetBrains Mono,monospace';

  d.appendChild(header); d.appendChild(desc); d.appendChild(genBtn); d.appendChild(actRow); d.appendChild(preview);
  return d;
}"""
    html = html[:s] + NEW_FC + html[e:]
    print('OK 3: fileCard() rescris')
else:
    print('SKIP 3: FC_START negasit')

# ─── 4. Fix blocul de succes din generateFile() ───────────────────────────────
OLD_OK = "        if (status) { status.textContent = 'Gata \u2705'; status.style.color = 'var(--green)'; }\n        card.style.borderColor = 'var(--green-border)';\n        card.style.background = 'var(--green-bg)';\n        btn.textContent = origText; btn.disabled = false;\n        if (!card.querySelector('.dl-btn')) {"
s = html.find(OLD_OK)
if s != -1:
    # Gaseste sfarsitul blocului if (!card.querySelector...)
    block_end_marker = "          btn.parentNode.insertBefore(row, btn.nextSibling);\n        }"
    e = html.find(block_end_marker, s) + len(block_end_marker)
    NEW_OK = """        if (status) { status.textContent = '\u2705 Generat'; status.style.color = 'var(--green)'; }
        card.style.borderColor = 'rgba(22,163,74,0.35)';
        card.style.background = 'rgba(22,163,74,0.04)';
        btn.textContent = '\u267b\ufe0f Regenereaz\u0103'; btn.disabled = false;
        btn.style.cssText = 'width:100%;padding:11px;background:#f0fdf4;color:#15803d;font-weight:700;border:1.5px solid #86efac;border-radius:9px;cursor:pointer;font-size:0.84rem;transition:all .15s;margin-bottom:8px';
        const dlB2 = card.querySelector('.dl-btn');
        const pvB2 = card.querySelector('.pv-btn');
        const actStyle = 'flex:1;padding:8px 10px;background:#fff;color:#111;font-weight:600;border:1.5px solid #d1d5db;border-radius:8px;cursor:pointer;font-size:0.78rem;transition:all .15s';
        if (dlB2) { dlB2.disabled = false; dlB2.style.cssText = actStyle; }
        if (pvB2) { pvB2.disabled = false; pvB2.style.cssText = actStyle; }"""
    html = html[:s] + NEW_OK + html[e:]
    print('OK 4: generateFile success actualizat')
else:
    print('SKIP 4: OLD_OK negasit')

# ─── 5. Fix preview: elimina delay-urile aberante de 15s/5s ─────────────────
import re
html = re.sub(
    r"if \(preview\) \{\s*preview\.style\.display = 'block'; preview\.textContent = '';.*?preview\.textContent \+= '\\\\n\\\\n';\s*\}\s*\}",
    "if (preview) {\n          preview.style.display = 'block';\n          preview.textContent = data.content.substring(0, 1500);\n        }",
    html, flags=re.DOTALL
)
# Fallback simplu daca regex nu prinde
if "await new Promise(r => setTimeout(r, 15000))" in html:
    s = html.find("if (preview) {\n          preview.style.display = 'block'; preview.textContent = '';")
    e = html.find("preview.textContent += '\\n\\n';\n          }\n        }", s)
    if s != -1 and e != -1:
        e2 = e + len("preview.textContent += '\\n\\n';\n          }\n        }")
        html = html[:s] + "if (preview) {\n          preview.style.display = 'block';\n          preview.textContent = data.content.substring(0, 1500);\n        }" + html[e2:]
print('OK 5: preview instant')

# ─── 6. Adauga populateExport() + hook in showStep ──────────────────────────
EXPORT_FN = """
// ════════════════════════════════════════════════════════════
// POPULATE STEP 9
// ════════════════════════════════════════════════════════════
function populateExport() {
  const list = document.getElementById('exportList');
  if (!list) return;
  list.innerHTML = '';
  const FNAMES = {soul:'SOUL.md',identity:'IDENTITY.md',user:'USER.md',memory:'MEMORY.md',tools:'TOOLS.md',agents:'AGENTS.md',heartbeat:'HEARTBEAT.md',bootstrap:'BOOTSTRAP.md',agent_rd:'AGENT_RD.md'};
  const done = DATA.files.filter(function(f){ return generatedFiles[f.id]; });
  if (done.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:40px 20px;border:1.5px dashed #e5e7eb;border-radius:12px;color:#9ca3af">' +
      '<div style="font-size:2.5rem;margin-bottom:10px">\ud83d\udcc2</div>' +
      '<div style="font-weight:700;font-size:0.92rem;color:#374151;margin-bottom:4px">Niciun fi\u0219ier generat</div>' +
      '<div style="font-size:0.82rem;margin-bottom:16px">Mergi la Pasul 8 \u0219i genereaz\u0103 fi\u0219ierele</div>' +
      '<button onclick="prevStep()" style="padding:10px 22px;background:#16a34a;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.85rem;box-shadow:0 2px 8px rgba(22,163,74,0.25)">\u2190 \u00cenapoi la Generare</button></div>';
    return;
  }
  done.forEach(function(f) {
    const content = generatedFiles[f.id];
    const fname = FNAMES[f.id] || f.id + '.md';
    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border:1.5px solid rgba(22,163,74,0.3);border-radius:12px;padding:16px;margin-bottom:4px';
    const hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px';
    hdr.innerHTML = '<span style="font-size:1.2rem">' + f.icon + '</span>' +
      '<span style="font-weight:700;font-size:0.88rem;color:#111">' + f.label + '</span>' +
      '<span style="margin-left:auto;font-size:0.72rem;color:var(--green);font-weight:700">\u2705 Generat</span>';
    const descEl = document.createElement('div');
    descEl.style.cssText = 'font-size:0.78rem;color:#666;margin-bottom:10px';
    descEl.textContent = f.desc;
    const pv = document.createElement('div');
    pv.style.cssText = 'display:none;font-size:0.75rem;font-family:JetBrains Mono,monospace;color:#374151;max-height:220px;overflow-y:auto;white-space:pre-wrap;background:#f8f9fa;padding:12px;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:10px;line-height:1.6';
    pv.textContent = content;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    function mkBtn(txt, style, fn) { var b=document.createElement('button'); b.style.cssText=style; b.textContent=txt; b.onclick=fn; return b; }
    var dlB = mkBtn('\u2b07 Descarc\u0103 ' + fname,
      'flex:1;min-width:110px;padding:9px 12px;background:#16a34a;color:#fff;font-weight:700;border:none;border-radius:8px;cursor:pointer;font-size:0.8rem;box-shadow:0 2px 6px rgba(22,163,74,0.25)',
      function(){ var b=new Blob([content],{type:'text/markdown'}); var a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=fname; a.click(); }
    );
    var pvB = mkBtn('\ud83d\udc41 Preview',
      'padding:9px 12px;background:#fff;color:#374151;font-weight:600;border:1.5px solid #d1d5db;border-radius:8px;cursor:pointer;font-size:0.8rem',
      function(){ pv.style.display=pv.style.display==='none'?'block':'none'; pvB.textContent=pv.style.display==='block'?'\u2715 \u00cenchide':'\ud83d\udc41 Preview'; }
    );
    var editB = mkBtn('\u270f\ufe0f Editeaz\u0103',
      'padding:9px 12px;background:#fff;color:#374151;font-weight:600;border:1.5px solid #d1d5db;border-radius:8px;cursor:pointer;font-size:0.8rem',
      (function(fid,lbl){ return function(){
        document.getElementById('editLabel').textContent = 'Editare \u2014 ' + lbl;
        document.getElementById('editContent').value = generatedFiles[fid] || '';
        document.getElementById('editArea').style.display = 'block';
        document.getElementById('editArea').scrollIntoView({behavior:'smooth'});
      }; })(f.id, f.label)
    );
    row.appendChild(dlB); row.appendChild(pvB); row.appendChild(editB);
    card.appendChild(hdr); card.appendChild(descEl); card.appendChild(pv); card.appendChild(row);
    list.appendChild(card);
  });
}

"""

NAV_ANCHOR = '// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n// NAVIGARE WIZARD\n// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550'
if NAV_ANCHOR in html:
    html = html.replace(NAV_ANCHOR, EXPORT_FN + NAV_ANCHOR, 1)
    print('OK 6a: populateExport() adaugat')
else:
    print('SKIP 6a: NAV_ANCHOR negasit')

# Hook in showStep
OLD_BAR = "      const bar = document.querySelector('.wz-progress-bar, .progress-bar, [role=\"progressbar\"]');\n      if (bar) bar.style.width = Math.round((n / totalSteps) * 100) + '%';\n      window.scrollTo({top: 0, behavior: 'smooth'});"
NEW_BAR = "      const barFill = document.getElementById('progressFill');\n      if (barFill) barFill.style.width = Math.round((n / totalSteps) * 100) + '%';\n      if (n === 9) { setTimeout(populateExport, 50); }\n      window.scrollTo({top: 0, behavior: 'smooth'});"
if OLD_BAR in html:
    html = html.replace(OLD_BAR, NEW_BAR)
    print('OK 6b: showStep hookuit')
else:
    print('SKIP 6b: OLD_BAR negasit')

with open('dist/public/wizard-form.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('\n=== DONE ===')
