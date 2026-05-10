// ═══════════════════════════════════════════════════════════
//  wizard-session.js — AgentulMeu
//  ADAUGĂ ACEST SCRIPT LA FINALUL wizard-form.html
//  înainte de </body>, după toate scripturile existente
// ═══════════════════════════════════════════════════════════

(function() {
  'use strict';

  const API = ''; // același origin

  // ── Session ID ─────────────────────────────────────────
  function getOrCreateSessionId() {
    let sid = localStorage.getItem('agentulmeu_session_id');
    if (!sid) {
      const ts = Date.now().toString(36);
      const rnd = Math.random().toString(36).substring(2, 8);
      sid = `sess_${ts}_${rnd}`;
      localStorage.setItem('agentulmeu_session_id', sid);
    }
    return sid;
  }

  const SESSION_ID = getOrCreateSessionId();
  console.log('[WIZARD] Session ID:', SESSION_ID);

  // Expune global pentru alte funcții din wizard
  window.WIZARD_SESSION_ID = SESSION_ID;

  // ── Inițializare sesiune pe server ─────────────────────
  async function initSession() {
    try {
      await fetch(`${API}/api/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: SESSION_ID }),
      });
    } catch (err) {
      console.warn('[WIZARD] Inițializare sesiune eșuată:', err);
    }
  }

  // ── Mapare step → câmpuri DB ───────────────────────────
  const STEP_FIELD_MAP = {
    1: {
      fields: () => ({
        business_types: getCheckedValues('[name="business_type"]') || 
                        getCheckedValues('.business-type-check') ||
                        getSelectedChips('step1', 'business_type'),
        team_size: getSelectValue('team_size') || getSelectValue('[data-field="team_size"]'),
        maturity_stage: getSelectValue('maturity_stage') || getSelectValue('[data-field="maturity_stage"]'),
      })
    },
    2: {
      fields: () => ({
        business_name: getInputValue('business_name') || getInputValue('[data-field="business_name"]') || getInputByPlaceholder('Numele business'),
        business_desc: getTextareaValue('business_desc') || getInputByPlaceholder('Ce face business'),
        products: getTextareaValue('products') || getInputByPlaceholder('Produse'),
        ideal_client: getTextareaValue('ideal_client') || getInputByPlaceholder('Clientul ideal'),
        geo_zone: getInputValue('geo_zone') || getInputByPlaceholder('Zona geografică'),
        website: getInputValue('website') || getInputByPlaceholder('Website'),
        revenue_model: getSelectValue('revenue_model') || getInputByPlaceholder('Modelul de venit'),
      })
    },
    3: {
      fields: () => ({
        objectives: getCheckedValues('[name="objective"]') || getCheckedValues('.objective-check'),
        problem_main: getTextareaValue('problem_main') || getInputByPlaceholder('Problema #1'),
        repetitive_tasks: getTextareaValue('repetitive_tasks') || getInputByPlaceholder('Task-uri repetitive'),
        time_lost: getSelectValue('time_lost') || getInputByPlaceholder('Timp pierdut'),
        priority_90days: getTextareaValue('priority_90days') || getInputByPlaceholder('Prioritate'),
      })
    },
    4: {
      fields: () => ({
        agents_execution: getCheckedValues('[name="agent_execution"]') || getCheckedValues('.agent-exec-check'),
        agents_special: getCheckedValues('[name="agent_special"]') || getCheckedValues('.agent-spec-check'),
      })
    },
    5: {
      fields: () => ({
        channels: getCheckedValues('[name="channel"]') || getCheckedValues('.channel-check'),
        crm_tools: getCheckedValues('[name="crm"]') || getCheckedValues('.crm-check'),
        integrations: getCheckedValues('[name="integration"]') || getCheckedValues('.integration-check'),
        budget_monthly: getSelectValue('budget_monthly') || getInputByPlaceholder('Buget'),
      })
    },
    6: {
      fields: () => ({
        autonomy_level: getSelectValue('autonomy_level') || getRadioValue('autonomy_level'),
        verbal_tone: getSelectValue('verbal_tone') || getSelectValue('[data-field="verbal_tone"]'),
        red_lines: getTextareaValue('red_lines') || getInputByPlaceholder('Linii roșii'),
        competitive_adv: getTextareaValue('competitive_adv') || getInputByPlaceholder('Avantaj competitiv'),
      })
    },
    7: {
      fields: () => ({
        ai_experience: getSelectValue('ai_experience') || getRadioValue('ai_experience'),
        setup_involvement: getSelectValue('setup_involvement') || getRadioValue('setup_involvement'),
        launch_deadline: getSelectValue('launch_deadline') || getInputByPlaceholder('Deadline'),
        expectations_30: getTextareaValue('expectations_30') || getInputByPlaceholder('Așteptări'),
        specific_context: getTextareaValue('specific_context') || getInputByPlaceholder('Context specific'),
      })
    },
  };

  // ── Helper-e de extragere valori ───────────────────────
  function getInputValue(nameOrSelector) {
    const el = document.querySelector(`input[name="${nameOrSelector}"], #${nameOrSelector}, ${nameOrSelector}`);
    return el ? el.value.trim() : null;
  }

  function getTextareaValue(nameOrSelector) {
    const el = document.querySelector(`textarea[name="${nameOrSelector}"], #${nameOrSelector}, ${nameOrSelector}`);
    return el ? el.value.trim() : null;
  }

  function getSelectValue(nameOrSelector) {
    const el = document.querySelector(`select[name="${nameOrSelector}"], #${nameOrSelector}, ${nameOrSelector}`);
    return el ? el.value : null;
  }

  function getCheckedValues(selector) {
    const els = document.querySelectorAll(`${selector}:checked`);
    const vals = Array.from(els).map(el => el.value || el.dataset.value || el.textContent.trim());
    return vals.length > 0 ? vals : null;
  }

  function getRadioValue(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : null;
  }

  function getInputByPlaceholder(partialText) {
    const els = document.querySelectorAll('input, textarea');
    for (const el of els) {
      if (el.placeholder && el.placeholder.includes(partialText)) {
        return el.value.trim() || null;
      }
    }
    return null;
  }

  function getSelectedChips(stepId, field) {
    const chips = document.querySelectorAll(`[data-step="${stepId}"] .chip.selected, .step-active .chip.selected`);
    const vals = Array.from(chips).map(c => c.dataset.value || c.textContent.trim());
    return vals.length > 0 ? vals : null;
  }

  // ── Salvare step ───────────────────────────────────────
  async function saveCurrentStep(stepNumber) {
    const mapping = STEP_FIELD_MAP[stepNumber];
    if (!mapping) return; // Step 8/9 nu au câmpuri de salvat

    const fields = mapping.fields();
    // Filtrează null/empty
    const cleanFields = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)) {
        cleanFields[k] = v;
      }
    }

    if (Object.keys(cleanFields).length === 0) return;

    try {
      const resp = await fetch(`${API}/api/session/${SESSION_ID}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepNumber, fields: cleanFields }),
      });
      const data = await resp.json();
      if (data.success) {
        console.log(`[WIZARD] Step ${stepNumber} salvat ✓`, cleanFields);
        showSaveFeedback();
      }
    } catch (err) {
      console.warn(`[WIZARD] Eroare salvare step ${stepNumber}:`, err);
    }
  }

  // ── Feedback vizual salvare ────────────────────────────
  function showSaveFeedback() {
    let indicator = document.getElementById('am-save-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'am-save-indicator';
      indicator.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 9999;
        background: rgba(0,229,118,0.15); border: 1px solid #00e676;
        color: #00e676; padding: 8px 16px; border-radius: 8px;
        font-family: 'Space Grotesk', sans-serif; font-size: 13px;
        display: flex; align-items: center; gap: 8px;
        backdrop-filter: blur(10px);
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(indicator);
    }
    indicator.innerHTML = '✓ Salvat automat';
    indicator.style.opacity = '1';
    setTimeout(() => { indicator.style.opacity = '0'; }, 2000);
  }

  // ── Interceptare buton "Continuă" ──────────────────────
  function hookContinueButtons() {
    // Găsim toate butoanele de continuare
    const continueButtons = document.querySelectorAll(
      '[data-action="next"], .btn-next, button[onclick*="nextStep"], .continue-btn, #btn-next'
    );

    continueButtons.forEach(btn => {
      btn.addEventListener('click', async function(e) {
        const currentStep = getCurrentStep();
        if (currentStep && currentStep <= 7) {
          await saveCurrentStep(currentStep);
        }
      });
    });

    // Fallback: observăm schimbările de step prin MutationObserver
    observeStepChanges();
  }

  // ── Detectare step curent ──────────────────────────────
  function getCurrentStep() {
    // Metodă 1: atribut data
    const activeStep = document.querySelector('[data-step].active, .step-active, .wizard-step.active');
    if (activeStep) {
      const step = parseInt(activeStep.dataset.step || activeStep.dataset.stepNum);
      if (!isNaN(step)) return step;
    }

    // Metodă 2: din indicator "01 / 09"
    const indicator = document.querySelector('.step-indicator, [class*="step-count"]');
    if (indicator) {
      const match = indicator.textContent.match(/(\d+)\s*\/\s*\d+/);
      if (match) return parseInt(match[1]);
    }

    // Metodă 3: variabilă globală wizard
    if (typeof window.currentStep !== 'undefined') return window.currentStep;
    if (typeof window.wizardStep !== 'undefined') return window.wizardStep;

    return null;
  }

  // ── Observer pentru schimbări step ────────────────────
  let lastObservedStep = null;
  function observeStepChanges() {
    const observer = new MutationObserver(() => {
      const step = getCurrentStep();
      if (step && step !== lastObservedStep && lastObservedStep !== null) {
        // Step s-a schimbat → salvează step-ul anterior
        if (lastObservedStep <= 7) {
          saveCurrentStep(lastObservedStep);
        }
        // Dacă ajungem la step 9, marchează ca finalizat
        if (step === 9) {
          markSessionComplete();
        }
      }
      lastObservedStep = step;
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-step'],
    });
  }

  // ── Salvare fișiere generate (Step 8/9) ──────────────
  // Interceptăm apelul existent de /api/wizard/generate
  const originalFetch = window.fetch;
  window.fetch = async function(url, options = {}) {
    const response = await originalFetch(url, options);

    // Interceptăm generate
    if (typeof url === 'string' && url.includes('/api/wizard/generate')) {
      const clone = response.clone();
      clone.json().then(data => {
        if (data && data.success && data.content) {
          // Extrage fileName din body
          let fileName = 'unknown.md';
          try {
            const body = JSON.parse(options.body);
            fileName = body.fileName || body.file || body.type || 'unknown.md';
            if (!fileName.endsWith('.md')) fileName += '.md';
          } catch {}

          // Salvează în DB
          saveFileToServer(fileName, data.content);
        }
      }).catch(() => {});
    }

    return response;
  };

  async function saveFileToServer(fileName, content) {
    try {
      await fetch(`${API}/api/session/${SESSION_ID}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, content }),
      });
      console.log(`[WIZARD] Fișier salvat în DB: ${fileName}`);
    } catch (err) {
      console.warn('[WIZARD] Eroare salvare fișier:', err);
    }
  }

  // ── Marchează sesiunea completă ────────────────────────
  async function markSessionComplete() {
    try {
      await fetch(`${API}/api/session/${SESSION_ID}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      // Adaugă link spre dashboard în Step 9
      addDashboardLink();
    } catch {}
  }

  // ── Link dashboard în Step 9 ───────────────────────────
  function addDashboardLink() {
    // Evită duplicare
    if (document.getElementById('am-dashboard-link')) return;

    const dashboardBtn = document.createElement('a');
    dashboardBtn.id = 'am-dashboard-link';
    dashboardBtn.href = `/dashboard?session=${SESSION_ID}`;
    dashboardBtn.style.cssText = `
      display: inline-flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, #a855f7, #00f5ff);
      color: #000; padding: 14px 28px; border-radius: 12px;
      font-family: 'Orbitron', sans-serif; font-weight: 700;
      font-size: 14px; text-decoration: none; margin: 16px 8px;
      letter-spacing: 1px; transition: transform 0.2s;
      box-shadow: 0 0 30px rgba(168,85,247,0.4);
    `;
    dashboardBtn.innerHTML = '📊 Vezi Dashboard-ul Tău →';
    dashboardBtn.onmouseenter = () => dashboardBtn.style.transform = 'scale(1.05)';
    dashboardBtn.onmouseleave = () => dashboardBtn.style.transform = 'scale(1)';

    // Inserează după butoanele de download existente
    const downloadBtns = document.querySelector('[class*="download"], [class*="export"], #step9-actions, .step9-buttons');
    const insertTarget = downloadBtns || document.querySelector('.step-9, [data-step="9"]') || document.body;
    
    if (downloadBtns) {
      downloadBtns.appendChild(dashboardBtn);
    } else {
      // Caută secțiunea step 9 vizibilă
      const step9Containers = document.querySelectorAll('[class*="step"]');
      for (const el of step9Containers) {
        if (el.textContent.includes('Rezultate') || el.textContent.includes('Export')) {
          el.appendChild(dashboardBtn);
          break;
        }
      }
    }
  }

  // ── Restaurare sesiune existentă ───────────────────────
  async function restoreSession() {
    try {
      const resp = await fetch(`${API}/api/session/${SESSION_ID}`);
      if (!resp.ok) return;
      const data = await resp.json();
      if (!data.success || !data.session) return;

      const session = data.session;
      console.log('[WIZARD] Sesiune restaurată:', session);

      // Populează câmpurile cu datele salvate
      populateField('business_name', session.business_name);
      populateField('business_desc', session.business_desc);
      populateField('products', session.products);
      populateField('ideal_client', session.ideal_client);
      populateField('geo_zone', session.geo_zone);
      populateField('website', session.website);
      populateField('problem_main', session.problem_main);
      populateField('repetitive_tasks', session.repetitive_tasks);
      populateField('priority_90days', session.priority_90days);
      populateField('red_lines', session.red_lines);
      populateField('competitive_adv', session.competitive_adv);
      populateField('expectations_30', session.expectations_30);
      populateField('specific_context', session.specific_context);

      // Selecteaza valorile din select-uri
      populateSelect('team_size', session.team_size);
      populateSelect('maturity_stage', session.maturity_stage);
      populateSelect('revenue_model', session.revenue_model);
      populateSelect('budget_monthly', session.budget_monthly);
      populateSelect('autonomy_level', session.autonomy_level);
      populateSelect('verbal_tone', session.verbal_tone);
      populateSelect('ai_experience', session.ai_experience);
      populateSelect('setup_involvement', session.setup_involvement);
      populateSelect('launch_deadline', session.launch_deadline);
      populateSelect('time_lost', session.time_lost);

      // Checkbox-uri
      if (session.business_types) {
        checkValues('[name="business_type"]', session.business_types);
      }
      if (session.objectives) {
        checkValues('[name="objective"]', session.objectives);
      }
      if (session.agents_execution) {
        checkValues('[name="agent_execution"]', session.agents_execution);
      }
      if (session.agents_special) {
        checkValues('[name="agent_special"]', session.agents_special);
      }
      if (session.channels) {
        checkValues('[name="channel"]', session.channels);
      }

      // Dacă sunt fișiere generate, adaugă link-ul de dashboard
      if (session.files && session.files.length > 0) {
        addDashboardLink();
      }

    } catch (err) {
      console.warn('[WIZARD] Eroare restaurare sesiune:', err);
    }
  }

  function populateField(name, value) {
    if (!value) return;
    const el = document.querySelector(
      `input[name="${name}"], textarea[name="${name}"], #${name}, [data-field="${name}"]`
    );
    if (el && !el.value) el.value = value;
  }

  function populateSelect(name, value) {
    if (!value) return;
    const el = document.querySelector(`select[name="${name}"], #${name}`);
    if (el && !el.value) el.value = value;
  }

  function checkValues(selector, values) {
    if (!Array.isArray(values)) return;
    document.querySelectorAll(selector).forEach(el => {
      if (values.includes(el.value)) el.checked = true;
    });
  }

  // ── INIT ───────────────────────────────────────────────
  async function init() {
    await initSession();
    hookContinueButtons();

    // Observăm de la bun început
    const initialStep = getCurrentStep();
    lastObservedStep = initialStep || 1;

    // Restaurează dacă există sesiune
    await restoreSession();

    console.log('[WIZARD] ✅ Session manager inițializat. Session:', SESSION_ID);

    // Expune funcții utile global
    window.wizardSaveStep = saveCurrentStep;
    window.wizardSaveFile = saveFileToServer;
    window.wizardSessionId = SESSION_ID;
  }

  // Pornește după DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
