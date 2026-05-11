'use strict';
const express = require('express');
const OpenAI  = require('openai');
const AdmZip  = require('adm-zip');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const OUTPUT_DIR     = '/var/www/agentulmeu.online/output/OpenClaw';
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Client OpenRouter (compatibil OpenAI SDK)
const or = new OpenAI({
  apiKey:  OPENROUTER_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://agentulmeu.online',
    'X-Title':      'AgentulMeu',
  },
});

console.log('[GenAPI] boot | OpenRouter key:', !!OPENROUTER_KEY);

// ─── MODELE FALLBACK (în ordine) ─────────────────────────────────────────────
const MODELS = [
  { id: 'moonshotai/kimi-k2',               label: 'Kimi K2'         },
  { id: 'qwen/qwen3-235b-a22b',             label: 'Qwen3 235B'      },
  { id: 'google/gemini-flash-1.5',          label: 'Gemini Flash 1.5' },
];

// max_tokens per tip fișier (cost control)
const MAX_TOKENS = {
  SOUL:      2400,
  IDENTITY:  2400,
  USER:      2200,
  MEMORY:    2200,
  TOOLS:     2400,
  AGENTS:    2400,
  HEARTBEAT: 2000,
  BOOTSTRAP: 2000,
  AGENT_RD:  2200,
  DEFAULT:   2000,
};

// ─── JOB STORE ────────────────────────────────────────────────────────────────
const JOBS = {};
const mkId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ─── QUEUE STATE ──────────────────────────────────────────────────────────────
const QUEUE = {
  pending:     [],   // [job_id, ...]
  running:     0,
  CONCURRENCY: 2,    // max 2 generări simultan
};

function queueTick() {
  while (QUEUE.running < QUEUE.CONCURRENCY && QUEUE.pending.length > 0) {
    const job_id = QUEUE.pending.shift();
    const job    = JOBS[job_id];
    if (!job || job.status === 'cancelled') continue;
    QUEUE.running++;
    job._runner()
      .catch(e => {
        job.status = 'error';
        job.error  = e.message;
        broadcastSSE(job, { status: 'error', message: e.message, progress: 100 });
      })
      .finally(() => {
        QUEUE.running--;
        queueTick();
      });
  }
}

// ─── SSE HELPERS ──────────────────────────────────────────────────────────────
function broadcastSSE(job, data) {
  if (!job._clients) return;
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  job._clients.forEach(res => { try { res.write(msg); } catch (_) {} });
  // Închide clienții la final
  if (data.status === 'done' || data.status === 'error' || data.status === 'timeout') {
    job._clients.forEach(res => { try { res.end(); } catch (_) {} });
    job._clients = [];
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fill = (tpl, d) => tpl.replace(/\{(\w+)\}/g, (_, k) => d[k] || '');
const slug = (s) => (s || 'biz').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 40);

// ─── APEL AI CU FALLBACK ─────────────────────────────────────────────────────
async function callAI(prompt, fileType, onModelTry) {
  const maxTokens = MAX_TOKENS[fileType] || MAX_TOKENS.DEFAULT;
  let lastError;

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    onModelTry?.(i, model.label);
    try {
      const res = await Promise.race([
        or.chat.completions.create({
          model:      model.id,
          max_tokens: maxTokens,
          temperature: 0.6,
          messages:   [{ role: 'user', content: prompt }],
        }),
        new Promise((_, rej) =>
          setTimeout(() => rej(Object.assign(new Error('Timeout 90s'), { code: 'TIMEOUT' })), 90_000)
        ),
      ]);

      const content = res.choices?.[0]?.message?.content || '';
      if (content.length < 80) throw new Error('Răspuns prea scurt');
      return { content, model: model.label, tokens: res.usage?.completion_tokens || 0 };

    } catch (e) {
      lastError = e;
      console.warn(`[GenAPI] ${model.label} failed for ${fileType}:`, e.message);
      if (e.code === 'TIMEOUT' && i < MODELS.length - 1) continue;
      if (e.status === 429 && i < MODELS.length - 1) {
        await new Promise(r => setTimeout(r, 2000)); // rate limit backoff
        continue;
      }
      if (i < MODELS.length - 1) continue;
    }
  }
  throw lastError || new Error('Toate modelele au eșuat');
}

// ─── GENERARE UN SINGUR FIȘIER ────────────────────────────────────────────────
async function genOne(fileType, intake, onModelTry) {
  const prompt = fill(PROMPTS[fileType] || PROMPTS.DEFAULT, intake);
  return callAI(prompt, fileType, onModelTry);
}

// ─── FILE ORDER ───────────────────────────────────────────────────────────────
const FILE_ORDER = ['SOUL', 'IDENTITY', 'USER', 'MEMORY', 'TOOLS', 'AGENTS', 'HEARTBEAT', 'BOOTSTRAP', 'AGENT_RD'];

// ─── PROMPTS ──────────────────────────────────────────────────────────────────
const PROMPTS = {
SOUL: `Genereaza SOUL.md pentru agentul AI al business-ului {business_name} ({business_category}).
Ton: {tone}. Obiective: {objectives}.
# SOUL - {business_name}
## 1. MISIUNE FUNDAMENTALA (2-3 paragrafe)
## 2. VALORI CORE (5-7 valori cu explicatii)
## 3. PERSONALITATE SI TON (exemple concrete de limbaj)
## 4. PRINCIPII DE DECIZIE (ce face si ce NU face)
## 5. CE ESTE / CE NU ESTE agentul
## 6. VIZIUNE PE TERMEN LUNG
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

IDENTITY: `Genereaza IDENTITY.md pentru {business_name} ({business_category}).
# IDENTITY - {business_name}
## 1. PROFIL BUSINESS (descriere detaliata)
## 2. PUBLICUL TINTA (3-4 segmente cu caracteristici)
## 3. PROPUNERE DE VALOARE UNICA
## 4. POZITIONARE PE PIATA
## 5. DIFERENTIATORI FATA DE CONCURENTA
## 6. VOCE SI STIL COMUNICARE
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

USER: `Genereaza USER.md pentru {business_name} ({business_category}). Obiective: {objectives}.
IMPORTANT: Nu folosi code fences markdown (\`\`\`). Genereaza direct continut Markdown curat.
# USER PROFILES - {business_name}
## 1. PERSONA PRIMARA (nume fictiv, varsta, profesie, nevoi, comportament digital)
## 2. PERSONA SECUNDARA
## 3. PERSONA TERTIARA
## 4. JOURNEY MAP pentru persona primara (7-10 pasi)
## 5. PAIN POINTS COMUNE
## 6. TRIGGER-E DE CONVERSIE
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

MEMORY: `Genereaza MEMORY.md pentru agentul AI al {business_name} ({business_category}).
# MEMORY - {business_name}
## 1. CE MEMOREAZA AGENTUL (tipuri de informatii)
## 2. STRUCTURA MEMORIE PE TERMEN SCURT
## 3. STRUCTURA MEMORIE PE TERMEN LUNG
## 4. REGULI DE ACTUALIZARE MEMORIE
## 5. INFORMATII CRITICE BUSINESS (preturi, program, politici)
## 6. RASPUNSURI STANDARD (10+ situatii frecvente)
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

TOOLS: `Genereaza TOOLS.md pentru agentul AI al {business_name} ({business_category}). Obiective: {objectives}.
# TOOLS - {business_name}
## 1. TOOLKIT PRINCIPAL (tool-uri recomandate cu justificare)
## 2. INTEGRARI API (ce API-uri sa conecteze)
## 3. FLUXURI AUTOMATIZATE (3-5 fluxuri detaliate)
## 4. TOOL-URI DE COMUNICARE
## 5. TOOL-URI DE ANALYTICS
## 6. CONFIGURARE TEHNICA RECOMANDATA
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

AGENTS: `Genereaza AGENTS.md pentru ecosistemul de agenti al {business_name} ({business_category}).
# AGENTS - {business_name}
## 1. AGENTUL PRINCIPAL (rol, responsabilitati, trigger-e)
## 2. AGENTI SPECIALIZATI (minim 4 agenti cu roluri clare)
## 3. IERARHIE SI DELEGARE
## 4. PROTOCOALE DE COMUNICARE INTER-AGENTI
## 5. ESCALADARE SI EXCEPTII
## 6. KPI PER AGENT
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

HEARTBEAT: `Genereaza HEARTBEAT.md — rutina zilnica a agentului AI pentru {business_name} ({business_category}).
# HEARTBEAT - {business_name}
## 1. RUTINA DIMINEATA (07:00-09:00)
## 2. RUTINA ZI (09:00-18:00)
## 3. RUTINA SEARA (18:00-21:00)
## 4. TASK-URI SAPTAMANALE
## 5. TASK-URI LUNARE
## 6. INDICATORI DE PERFORMANTA ZILNICA
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

BOOTSTRAP: `Genereaza BOOTSTRAP.md — ghid de initializare pentru agentul AI al {business_name} ({business_category}).
# BOOTSTRAP - {business_name}
## 1. PRE-LAUNCH CHECKLIST (10+ iteme)
## 2. CONFIGURARE INITIALA (pas cu pas)
## 3. PRIMELE 7 ZILE (plan detaliat)
## 4. PRIMELE 30 ZILE (milestones)
## 5. INTEGRARI PRIORITARE
## 6. SEMNALE DE SUCCES / ESEC
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

AGENT_RD: `Genereaza AGENT_RD.md — framework R&D continuu pentru agentul AI al {business_name} ({business_category}).
# AGENT_RD - {business_name}
## 1. OBIECTIVE R&D (ce imbunatatim)
## 2. METRICI DE MONITORIZAT
## 3. EXPERIMENTE PROPUSE (5+ idei concrete)
## 4. SURSE DE INVATARE (publicatii, tool-uri, comunitate)
## 5. PROCES DE ITERATIE (cum adoptam ce merge)
## 6. ROADMAP 6 LUNI
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

DEFAULT: `Genereaza un document profesional pentru agentul AI al {business_name} ({business_category}).
Minim 400 cuvinte. EXCLUSIV in limba romana.`,
};

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Health
app.get('/api/genhealth', (_req, res) => {
  res.json({
    status:    'ok',
    provider:  'OpenRouter',
    models:    MODELS.map(m => m.label),
    key:       !!OPENROUTER_KEY,
    queue:     { running: QUEUE.running, pending: QUEUE.pending.length, concurrency: QUEUE.CONCURRENCY },
    jobs:      Object.keys(JOBS).length,
    timestamp: new Date().toISOString(),
  });
});

// ── POST /api/generate-file — async, returnează job_id instant ────────────────
app.post('/api/generate-file', (req, res) => {
  const { file_type, intake_data } = req.body || {};
  const ft = (file_type || '').toUpperCase();

  if (!PROMPTS[ft]) {
    return res.status(400).json({ error: `file_type invalid. Valori: ${FILE_ORDER.join(', ')}` });
  }
  if (!intake_data?.business_name) {
    return res.status(400).json({ error: 'intake_data.business_name este obligatoriu' });
  }

  const job_id = mkId();
  JOBS[job_id] = {
    type:     'single',
    file_type: ft,
    status:   'queued',
    progress: 0,
    message:  'În așteptare...',
    model:    null,
    content:  null,
    error:    null,
    chars:    0,
    _clients: [],
    createdAt: Date.now(),
  };

  const job = JOBS[job_id];

  job._runner = async () => {
    job.status   = 'running';
    job.progress = 5;
    job.message  = 'Pregătire prompt...';
    broadcastSSE(job, { status: 'running', progress: 5, message: job.message });

    const { content, model, tokens } = await genOne(ft, intake_data, (attempt, label) => {
      const pct = 10 + attempt * 15;
      job.progress = pct;
      job.message  = attempt === 0 ? `Generare cu ${label}...` : `Retry cu ${label}...`;
      job.model    = label;
      broadcastSSE(job, { status: 'running', progress: pct, message: job.message });
    });

    // Salvează pe disk
    const dir = path.join(OUTPUT_DIR, slug(intake_data.business_name));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${ft}.md`), content, 'utf8');

    job.status   = 'done';
    job.progress = 100;
    job.content  = content;
    job.chars    = content.length;
    job.model    = model;
    job.tokens   = tokens;
    job.message  = `Gata! ${content.length} caractere via ${model}`;
    broadcastSSE(job, { status: 'done', progress: 100, message: job.message, content, chars: content.length });
    console.log(`[GenAPI] ${ft} done | ${content.length} chars | model: ${model} | tokens: ${tokens}`);
  };

  QUEUE.pending.push(job_id);
  queueTick();

  const pos = QUEUE.pending.indexOf(job_id) + 1;
  res.status(202).json({
    status:      'queued',
    job_id,
    queue_position: QUEUE.running < QUEUE.CONCURRENCY ? 0 : pos,
    message:     QUEUE.running < QUEUE.CONCURRENCY ? 'Job pornit imediat.' : `Job în așteptare (poziție ${pos}).`,
    progressUrl: `/api/job/${job_id}/progress`,
    resultUrl:   `/api/job/${job_id}/result`,
  });
});

// ── POST /api/generate-zip — generare toate 9 fișiere ────────────────────────
app.post('/api/generate-zip', (req, res) => {
  const intake = (req.body || {}).intake_data;
  if (!intake?.business_name) {
    return res.status(400).json({ error: 'intake_data.business_name este obligatoriu' });
  }

  const job_id = mkId();
  JOBS[job_id] = {
    type:     'zip',
    status:   'queued',
    done:     0,
    total:    FILE_ORDER.length,
    current:  null,
    files:    {},
    zip_b64:  null,
    error:    null,
    _clients: [],
    createdAt: Date.now(),
  };

  const job = JOBS[job_id];

  job._runner = async () => {
    job.status = 'running';
    const dir = path.join(OUTPUT_DIR, slug(intake.business_name));
    fs.mkdirSync(dir, { recursive: true });

    for (let i = 0; i < FILE_ORDER.length; i++) {
      const ft = FILE_ORDER[i];
      job.current  = ft;
      const pct    = Math.round(((i) / FILE_ORDER.length) * 90) + 5;
      job.message  = `Generez ${ft}... (${i + 1}/${FILE_ORDER.length})`;
      broadcastSSE(job, { status: 'running', progress: pct, current: ft, done: i, total: FILE_ORDER.length, message: job.message });

      try {
        const { content, model } = await genOne(ft, intake);
        fs.writeFileSync(path.join(dir, `${ft}.md`), content, 'utf8');
        job.files[ft] = { ok: true, chars: content.length, model };
      } catch (e) {
        console.error(`[job:${job_id}] ${ft} ERROR:`, e.message);
        job.files[ft] = { ok: false, error: e.message };
      }
      job.done = i + 1;
    }

    // Build ZIP
    const zipPath = path.join(dir, 'agentulmeu_bundle.zip');
    const zip = new AdmZip();
    FILE_ORDER.forEach(ft => {
      const fp = path.join(dir, `${ft}.md`);
      if (fs.existsSync(fp)) zip.addLocalFile(fp);
    });
    zip.writeZip(zipPath);

    job.zip_b64 = fs.readFileSync(zipPath).toString('base64');
    job.status  = 'done';
    job.current = null;
    job.message = `ZIP generat — ${Object.values(job.files).filter(f => f.ok).length}/${FILE_ORDER.length} fișiere OK`;
    broadcastSSE(job, { status: 'done', progress: 100, message: job.message, zip_b64: job.zip_b64 });
    console.log(`[job:${job_id}] DONE — ${Object.keys(job.files).length} files`);
  };

  QUEUE.pending.push(job_id);
  queueTick();

  res.status(202).json({
    status:      'accepted',
    job_id,
    message:     'ZIP job pornit.',
    progressUrl: `/api/job/${job_id}/progress`,
    resultUrl:   `/api/job/${job_id}/result`,
  });
});

// ── GET /api/job/:id/progress — SSE streaming ─────────────────────────────────
app.get('/api/job/:id/progress', (req, res) => {
  const job = JOBS[req.params.id];
  if (!job) {
    return res.status(404).json({ error: 'Job negăsit sau expirat' });
  }

  res.writeHead(200, {
    'Content-Type':      'text/event-stream',
    'Cache-Control':     'no-cache',
    'Connection':        'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();

  // Trimite starea curentă imediat
  const snap = { status: job.status, progress: job.progress || 0, message: job.message || '' };
  if (job.type === 'zip') { snap.done = job.done; snap.total = job.total; snap.current = job.current; }
  res.write(`data: ${JSON.stringify(snap)}\n\n`);

  // Dacă deja terminat, închide
  if (job.status === 'done' || job.status === 'error') return res.end();

  job._clients.push(res);
  res.on('close', () => { job._clients = job._clients.filter(r => r !== res); });
});

// ── GET /api/job/:id/result ───────────────────────────────────────────────────
app.get('/api/job/:id/result', (req, res) => {
  const job = JOBS[req.params.id];
  if (!job) return res.status(404).json({ error: 'Job negăsit sau expirat (>1h)' });

  if (job.status === 'done') {
    if (job.type === 'single') {
      return res.json({ status: 'done', file_type: job.file_type, content: job.content, chars: job.chars, model: job.model });
    }
    return res.json({ status: 'done', files: job.files, zip_b64: job.zip_b64 });
  }

  if (job.status === 'error') {
    return res.status(500).json({ status: 'error', error: job.error });
  }

  res.status(202).json({ status: job.status, progress: job.progress || 0, message: job.message || '' });
});

// ─── CLEANUP JOBS VECHI (>1 oră) ─────────────────────────────────────────────
setInterval(() => {
  const cutoff = Date.now() - 60 * 60_000;
  let cleaned = 0;
  Object.keys(JOBS).forEach(id => {
    if (JOBS[id].createdAt < cutoff) { delete JOBS[id]; cleaned++; }
  });
  if (cleaned > 0) console.log(`[GenAPI] Cleanup: ${cleaned} jobs expirate șterse`);
}, 15 * 60_000);

// ─── QUEUE STATS LOG ──────────────────────────────────────────────────────────
setInterval(() => {
  if (QUEUE.running > 0 || QUEUE.pending.length > 0) {
    console.log(`[QUEUE] running=${QUEUE.running} pending=${QUEUE.pending.length} total_jobs=${Object.keys(JOBS).length}`);
  }
}, 30_000);

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.GENAPI_PORT || 8002;
app.listen(PORT, () => console.log(`[GenAPI] Listening on :${PORT} | OpenRouter | concurrency=${QUEUE.CONCURRENCY}`));
