// ═══════════════════════════════════════════════════════════
//  dashboard-session.js — AgentulMeu
//  ADAUGĂ ACEST SCRIPT LA FINALUL dashboard.html (sau în fișierul JS existent)
//  înainte de </body>, după toate scripturile existente
// ═══════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ── Detectează session ID ──────────────────────────────
  function getSessionId() {
    // 1. Din URL: /dashboard?session=sess_xxx
    const urlParams = new URLSearchParams(window.location.search);
    const urlSession = urlParams.get('session');
    if (urlSession) {
      localStorage.setItem('agentulmeu_session_id', urlSession);
      return urlSession;
    }

    // 2. Din localStorage (setat de wizard)
    return localStorage.getItem('agentulmeu_session_id');
  }

  const SESSION_ID = getSessionId();

  // ════════════════════════════════════════════════════════
  //  MAIN: Încarcă datele din DB și populează dashboard-ul
  // ════════════════════════════════════════════════════════
  async function loadDashboardData() {
    if (!SESSION_ID) {
      showNoSessionState();
      return;
    }

    try {
      const resp = await fetch(`/api/dashboard/${SESSION_ID}`);
      if (!resp.ok) {
        showNoSessionState();
        return;
      }

      const data = await resp.json();
      if (!data.success) {
        showNoSessionState();
        return;
      }

      console.log('[DASHBOARD] Date încărcate:', data);
      populateDashboard(data);

    } catch (err) {
      console.error('[DASHBOARD] Eroare încărcare:', err);
      showNoSessionState();
    }
  }

  // ════════════════════════════════════════════════════════
  //  POPULARE DASHBOARD
  // ════════════════════════════════════════════════════════
  function populateDashboard(data) {
    const { session, files, filesCount, progress, filesGenerated } = data;

    // ── Salut personalizat ────────────────────────────────
    const businessName = session.business_name || 'prietene';
    const greetingEls = document.querySelectorAll('h1, .greeting, [class*="welcome"]');
    greetingEls.forEach(el => {
      if (el.textContent.includes('Bună ziua') || el.textContent.includes('—')) {
        el.innerHTML = el.innerHTML.replace(/—|Bună ziua,.*?👋/, `Bună ziua, <span style="background:linear-gradient(135deg,#a855f7,#00f5ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${businessName}</span> 👋`);
      }
    });

    // ── Progres fișiere ───────────────────────────────────
    updateFileProgress(filesGenerated || [], files || {});

    // ── Stats ─────────────────────────────────────────────
    updateStats(session, progress);

    // ── Secțiunea fișiere MD ──────────────────────────────
    updateFileGrid(filesGenerated || [], files || {});

    // ── Link-uri sesiune ──────────────────────────────────
    addSessionLinks();

    // ── Badge sesiune ─────────────────────────────────────
    showSessionBadge();
  }

  // ── Actualizare progres fișiere ───────────────────────
  const FILE_ORDER = ['SOUL.md','IDENTITY.md','USER.md','MEMORY.md','TOOLS.md','AGENTS.md','HEARTBEAT.md','BOOTSTRAP.md','AGENT_RD.md'];

  function updateFileProgress(generated, filesContent) {
    const count = generated.length;
    const total = 9;

    // Actualizează counter-ul existent
    const counters = document.querySelectorAll('[class*="file-count"], .files-generated, .progress-count');
    counters.forEach(el => {
      if (el.textContent.match(/\d+\/\d+/) || el.textContent.includes('rămase')) {
        el.textContent = `${count}/${total}`;
      }
    });

    // Actualizează texte "X rămase"
    const remainingEls = document.querySelectorAll('[class*="remaining"]');
    remainingEls.forEach(el => {
      el.textContent = `${total - count} rămase`;
    });

    // Actualizează butonul ZIP
    const zipBtns = document.querySelectorAll('[onclick*="zip"], [onclick*="ZIP"], .btn-zip');
    zipBtns.forEach(btn => {
      btn.textContent = `📦 Descarcă ZIP (${count}/${total})`;
    });

    // Injectează fișierele în grid-ul existent
    injectFilesIntoExistingGrid(generated, filesContent);
  }

  function injectFilesIntoExistingGrid(generated, filesContent) {
    // Caută containerul de fișiere MD din dashboard
    const fileGrids = document.querySelectorAll('[class*="md-files"], [class*="file-grid"], [class*="files-section"], .dashboard-files');
    
    FILE_ORDER.forEach(fileName => {
      const isGenerated = generated.includes(fileName);
      const content = filesContent[fileName];
      
      // Caută card-ul existent pentru acest fișier
      const existingCard = document.querySelector(`[data-file="${fileName}"], [data-md="${fileName}"]`);
      
      if (existingCard) {
        // Actualizează card-ul existent
        updateFileCard(existingCard, fileName, isGenerated, content);
      }
    });

    // Dacă există un container de fișiere, asigurăm că toate 9 sunt vizibile
    if (fileGrids.length > 0) {
      ensureAllFilesVisible(fileGrids[0], generated, filesContent);
    }
  }

  function updateFileCard(card, fileName, isGenerated, content) {
    // Actualizează statusul
    const statusEl = card.querySelector('[class*="status"], .file-status');
    if (statusEl) {
      statusEl.textContent = isGenerated ? '✓ Generat' : '⏳ Negенерат';
      statusEl.style.color = isGenerated ? '#00e676' : '#666';
    }

    // Activează butoanele de preview/download dacă e generat
    if (isGenerated && content) {
      const previewBtns = card.querySelectorAll('[onclick*="preview"], .btn-preview');
      previewBtns.forEach(btn => {
        btn.onclick = () => showFilePreview(fileName, content);
        btn.disabled = false;
        btn.style.opacity = '1';
      });

      const downloadBtns = card.querySelectorAll('[onclick*="download"], .btn-download');
      downloadBtns.forEach(btn => {
        btn.onclick = () => downloadFile(fileName, content);
        btn.disabled = false;
        btn.style.opacity = '1';
      });
    }
  }

  function ensureAllFilesVisible(container, generated, filesContent) {
    // Dacă containerul nu are deja toate 9 fișiere, injectăm ce lipsește
    FILE_ORDER.forEach(fileName => {
      const existing = container.querySelector(`[data-file="${fileName}"]`);
      if (!existing) {
        const isGenerated = generated.includes(fileName);
        const content = filesContent[fileName];
        const card = createFileCard(fileName, isGenerated, content);
        container.appendChild(card);
      }
    });
  }

  function createFileCard(fileName, isGenerated, content) {
    const shortName = fileName.replace('.md', '');
    const descriptions = {
      'SOUL': 'Esența și valorile agentului',
      'IDENTITY': 'Personalitate și ton',
      'USER': 'Profilul utilizatorilor',
      'MEMORY': 'Sistem de memorie',
      'TOOLS': 'Instrumente disponibile',
      'AGENTS': 'Configurare agenți',
      'HEARTBEAT': 'Monitoring și sănătate',
      'BOOTSTRAP': 'Inițializare sistem',
      'AGENT_RD': 'Cercetare & Dezvoltare',
    };

    const card = document.createElement('div');
    card.dataset.file = fileName;
    card.style.cssText = `
      background: rgba(255,255,255,0.03);
      border: 1px solid ${isGenerated ? 'rgba(0,230,118,0.3)' : 'rgba(255,255,255,0.1)'};
      border-radius: 16px; padding: 20px;
      display: flex; flex-direction: column; gap: 12px;
      transition: all 0.3s ease;
    `;

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-family:'Orbitron',sans-serif;font-size:13px;color:${isGenerated ? '#00f5ff' : '#666'};font-weight:700">${shortName}.md</div>
        <div style="font-size:11px;color:${isGenerated ? '#00e676' : '#555'}">${isGenerated ? '✓ Generat' : '○ Neprocesar'}</div>
      </div>
      <div style="font-size:12px;color:#888;font-family:'Space Grotesk',sans-serif">${descriptions[shortName] || ''}</div>
      <div style="display:flex;gap:8px;margin-top:auto">
        ${isGenerated && content ? `
          <button onclick="window.dashboardPreview('${fileName}')" style="
            flex:1;padding:8px;background:rgba(0,245,255,0.1);border:1px solid rgba(0,245,255,0.3);
            color:#00f5ff;border-radius:8px;cursor:pointer;font-size:11px;font-family:'Space Grotesk',sans-serif
          ">👁 Preview</button>
          <button onclick="window.dashboardDownload('${fileName}')" style="
            flex:1;padding:8px;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);
            color:#a855f7;border-radius:8px;cursor:pointer;font-size:11px;font-family:'Space Grotesk',sans-serif
          ">⬇ Download</button>
        ` : `
          <a href="/wizard-form?session=${SESSION_ID}#step8" style="
            flex:1;text-align:center;padding:8px;background:rgba(255,255,255,0.05);
            border:1px solid rgba(255,255,255,0.1);color:#666;border-radius:8px;
            cursor:pointer;font-size:11px;font-family:'Space Grotesk',sans-serif;text-decoration:none
          ">⚡ Generează</a>
        `}
      </div>
    `;

    card.onmouseenter = () => { card.style.borderColor = isGenerated ? 'rgba(0,230,118,0.6)' : 'rgba(255,255,255,0.2)'; };
    card.onmouseleave = () => { card.style.borderColor = isGenerated ? 'rgba(0,230,118,0.3)' : 'rgba(255,255,255,0.1)'; };

    return card;
  }

  // ── Stats ─────────────────────────────────────────────
  function updateStats(session, progress) {
    // Fișiere generate
    setStatValue('files_count', progress.filesGenerated);
    setStatValue('completion_pct', `${progress.percentComplete}%`);

    // Ultima actualizare
    if (session.updated_at) {
      const date = new Date(session.updated_at * 1000);
      setStatValue('last_updated', date.toLocaleDateString('ro-RO'));
    }
  }

  function setStatValue(key, value) {
    const els = document.querySelectorAll(`[data-stat="${key}"], .stat-${key}`);
    els.forEach(el => { el.textContent = value; });
  }

  // ── Preview fișier ────────────────────────────────────
  const filesCache = {};

  window.dashboardPreview = function(fileName) {
    if (filesCache[fileName]) {
      openPreviewModal(fileName, filesCache[fileName]);
    } else {
      fetch(`/api/session/${SESSION_ID}/file/${fileName}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.file) {
            filesCache[fileName] = data.file.content;
            openPreviewModal(fileName, data.file.content);
          }
        });
    }
  };

  window.dashboardDownload = function(fileName) {
    const content = filesCache[fileName];
    if (content) {
      downloadFile(fileName, content);
    } else {
      fetch(`/api/session/${SESSION_ID}/file/${fileName}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.file) {
            downloadFile(fileName, data.file.content);
          }
        });
    }
  };

  function openPreviewModal(fileName, content) {
    // Caută modal-ul existent
    let modal = document.querySelector('.preview-modal, #previewModal, [class*="preview-overlay"]');
    
    if (modal) {
      // Actualizează conținutul modal-ului existent
      const titleEl = modal.querySelector('[class*="title"], h2, h3');
      if (titleEl) titleEl.textContent = fileName;
      
      const contentEl = modal.querySelector('pre, textarea, [class*="content"]');
      if (contentEl) {
        contentEl.textContent = content;
        contentEl.value = content;
      }
      
      modal.style.display = 'flex';
      modal.classList.add('active');
    } else {
      // Creează modal nou
      createPreviewModal(fileName, content);
    }

    filesCache[fileName] = content;
  }

  function createPreviewModal(fileName, content) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.85);
      display:flex;align-items:center;justify-content:center;z-index:10000;
      backdrop-filter:blur(10px);
    `;
    modal.innerHTML = `
      <div style="
        background:#0a0a0f;border:1px solid rgba(0,245,255,0.3);border-radius:20px;
        width:min(800px,90vw);max-height:80vh;display:flex;flex-direction:column;overflow:hidden;
        box-shadow:0 0 60px rgba(0,245,255,0.1);
      ">
        <div style="
          padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.1);
          display:flex;justify-content:space-between;align-items:center;
        ">
          <div style="font-family:'Orbitron',sans-serif;color:#00f5ff;font-size:14px;font-weight:700">${fileName}</div>
          <div style="display:flex;gap:8px">
            <button onclick="window.dashboardDownload('${fileName}')" style="
              padding:8px 16px;background:rgba(168,85,247,0.2);border:1px solid rgba(168,85,247,0.4);
              color:#a855f7;border-radius:8px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-size:12px
            ">⬇ Download</button>
            <button onclick="this.closest('div[style*=\"position:fixed\"]').remove()" style="
              padding:8px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
              color:#fff;border-radius:8px;cursor:pointer;font-size:16px
            ">✕</button>
          </div>
        </div>
        <textarea style="
          flex:1;padding:24px;background:transparent;border:none;outline:none;
          color:#e0e0e0;font-family:'Space Grotesk',monospace;font-size:13px;
          line-height:1.7;resize:none;overflow-y:auto;
        ">${escapeHtml(content)}</textarea>
        <div style="
          padding:12px 24px;border-top:1px solid rgba(255,255,255,0.05);
          font-family:'Space Grotesk',sans-serif;font-size:11px;color:#555;
          display:flex;justify-content:space-between
        ">
          <span>${content.split('\n').length} linii</span>
          <span>${(content.length / 1024).toFixed(1)} KB</span>
        </div>
      </div>
    `;
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
  }

  function downloadFile(fileName, content) {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Link-uri sesiune ──────────────────────────────────
  function addSessionLinks() {
    if (!SESSION_ID) return;

    // Actualizează linkul Wizard existent
    document.querySelectorAll('a[href*="/wizard"]').forEach(a => {
      if (!a.href.includes('session=')) {
        a.href = `/wizard-form?session=${SESSION_ID}`;
      }
    });

    // Adaugă link-ul de continuare dacă nu există
    const wizardBtns = document.querySelectorAll('[onclick*="wizard"], a[href*="wizard"]');
    wizardBtns.forEach(btn => {
      if (btn.tagName === 'A' && !btn.href.includes('session=')) {
        btn.href = `/wizard-form?session=${SESSION_ID}`;
      }
    });
  }

  // ── Badge sesiune ──────────────────────────────────────
  function showSessionBadge() {
    if (!SESSION_ID) return;
    if (document.getElementById('am-session-badge')) return;

    const badge = document.createElement('div');
    badge.id = 'am-session-badge';
    badge.style.cssText = `
      position:fixed;bottom:20px;left:20px;
      background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);
      color:#a855f7;padding:8px 14px;border-radius:10px;
      font-family:'Space Grotesk',sans-serif;font-size:11px;
      display:flex;align-items:center;gap:8px;
      backdrop-filter:blur(10px);cursor:pointer;z-index:999;
      transition:all 0.2s;
    `;
    badge.innerHTML = `🔗 Sesiune: <span style="color:#00f5ff;font-weight:600">${SESSION_ID.substring(0, 16)}...</span>`;
    badge.title = 'Click pentru a copia link-ul sesiunii';
    badge.onclick = () => {
      const url = `${window.location.origin}/dashboard?session=${SESSION_ID}`;
      navigator.clipboard.writeText(url).then(() => {
        badge.innerHTML = '✓ Link copiat!';
        setTimeout(() => {
          badge.innerHTML = `🔗 Sesiune: <span style="color:#00f5ff;font-weight:600">${SESSION_ID.substring(0, 16)}...</span>`;
        }, 2000);
      });
    };
    document.body.appendChild(badge);
  }

  // ── Stare fără sesiune ────────────────────────────────
  function showNoSessionState() {
    const sections = document.querySelectorAll('.dashboard-content, main, [class*="dashboard"]');
    const target = sections[0] || document.body;

    const noSession = document.createElement('div');
    noSession.style.cssText = `
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      padding:80px 24px;text-align:center;gap:24px;
    `;
    noSession.innerHTML = `
      <div style="font-size:64px;filter:grayscale(1)">🤖</div>
      <div style="font-family:'Orbitron',sans-serif;color:#00f5ff;font-size:20px;font-weight:700">
        Nicio sesiune activă
      </div>
      <div style="font-family:'Space Grotesk',sans-serif;color:#666;font-size:14px;max-width:400px;line-height:1.6">
        Completează wizard-ul pentru a configura agentul tău AI. Datele se vor salva automat și vei putea reveni oricând.
      </div>
      <a href="/wizard-form" style="
        display:inline-flex;align-items:center;gap:10px;
        background:linear-gradient(135deg,#a855f7,#00f5ff);
        color:#000;padding:14px 28px;border-radius:12px;
        font-family:'Orbitron',sans-serif;font-weight:700;font-size:14px;
        text-decoration:none;letter-spacing:1px;
        box-shadow:0 0 30px rgba(168,85,247,0.4);
      ">🚀 Pornește Wizard-ul</a>
    `;
    
    // Inserează după header
    const header = document.querySelector('header, nav, .navbar');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(noSession, header.nextSibling);
    } else {
      target.prepend(noSession);
    }
  }

  // ── INIT ──────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDashboardData);
  } else {
    loadDashboardData();
  }

  console.log('[DASHBOARD] ✅ Inițializat. Session:', SESSION_ID || 'niciuna');

})();
