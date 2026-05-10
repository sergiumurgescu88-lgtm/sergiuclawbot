with open('dist/public/wizard-form.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. JSZip in <head>
jszip_tag = '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>\n'
html = html.replace('</head>', jszip_tag + '</head>', 1)

# 2. Buton ZIP dupa butonul downloadAll
old_btn = '<button class="wz-btn-action" onclick="downloadAll()">📦 Descarcă toate fișierele</button>'
new_btn = (old_btn +
    '\n      <button class="wz-btn-action" onclick="downloadAllZip()" '
    'style="margin-top:8px;background:#fff;color:#111;border:1.5px solid #d1d5db">'
    '🗜️ Descarcă ZIP (un singur fișier)</button>')
html = html.replace(old_btn, new_btn, 1)

# 3. Functia downloadAllZip dupa downloadAll
old_end = ('  Object.entries(generatedFiles).forEach(([fileId, content]) => {\n'
    '    const file = DATA.files.find(f => f.id === fileId);\n'
    '    const fname = file ? file.label : fileId + \'.md\';\n'
    '    const blob = new Blob([content], {type: \'text/markdown\'});\n'
    '    const a = document.createElement(\'a\');\n'
    '    a.href = URL.createObjectURL(blob);\n'
    '    a.download = fname;\n'
    '    a.click();\n'
    '  });\n'
    '}')

new_end = old_end + """
async function downloadAllZip() {
  const FNAMES = {soul:'SOUL.md',identity:'IDENTITY.md',user:'USER.md',memory:'MEMORY.md',tools:'TOOLS.md',agents:'AGENTS.md',heartbeat:'HEARTBEAT.md',bootstrap:'BOOTSTRAP.md',agent_rd:'AGENT_RD.md'};
  const keys = Object.keys(FNAMES).filter(k => generatedFiles[k]);
  if (keys.length === 0) { alert('Genereaza mai intai fisierele!'); return; }
  const zip = new JSZip();
  keys.forEach(k => zip.file(FNAMES[k], generatedFiles[k]));
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'AgentulMeu-' + Date.now() + '.zip';
  a.click();
}"""

if old_end in html:
    html = html.replace(old_end, new_end, 1)
    print("✅ Functia downloadAllZip adaugata")
else:
    print("❌ EROARE: blocul downloadAll nu a fost gasit - verifica manual")

with open('dist/public/wizard-form.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("✅ Patch aplicat")
