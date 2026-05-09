'use strict';
const express  = require('express');
const OpenAI   = require('openai');
const AdmZip   = require('adm-zip');
const cors     = require('cors');
const fs       = require('fs');
const path     = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const KIMI_KEY   = process.env.KIMI_API_KEY || '';
const OUTPUT_DIR = '/var/www/agentulmeu.online/output/OpenClaw';
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const kimi = new OpenAI({ apiKey: KIMI_KEY, baseURL: 'https://api.moonshot.ai/v1' });
console.log('[GenAPI] boot | key:', !!KIMI_KEY);

// ─── JOB STORE ───────────────────────────────────────────────────────────────
const JOBS = {};
const mkId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ─── FILE ORDER ───────────────────────────────────────────────────────────────
const FILE_ORDER = ['SOUL','IDENTITY','USER','MEMORY','TOOLS','AGENTS','HEARTBEAT','BOOTSTRAP','AGENT_RD'];

// ─── PROMPTS ──────────────────────────────────────────────────────────────────
const PROMPTS = {
SOUL:`Genereaza SOUL.md pentru agentul AI al business-ului {business_name} ({business_category}).
Ton: {tone}. Obiective: {objectives}.
# SOUL - {business_name}
## 1. MISIUNE FUNDAMENTALA (2-3 paragrafe)
## 2. VALORI CORE (5-7 valori cu explicatii)
## 3. PERSONALITATE SI TON (exemple concrete de limbaj)
## 4. PRINCIPII DE DECIZIE (ce face si ce NU face)
## 5. CE ESTE / CE NU ESTE agentul
## 6. VIZIUNE PE TERMEN LUNG
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

IDENTITY:`Genereaza IDENTITY.md pentru {business_name} ({business_category}).
# IDENTITY - {business_name}
## 1. PROFIL BUSINESS (descriere detaliata)
## 2. PUBLICUL TINTA (3-4 segmente cu caracteristici)
## 3. PROPUNERE DE VALOARE UNICA
## 4. POZITIONARE PE PIATA
## 5. DIFERENTIATORI FATA DE CONCURENTA
## 6. VOCE SI STIL COMUNICARE
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

USER:`Genereaza USER.md pentru {business_name} ({business_category}). Obiective: {objectives}.
# USER PROFILES - {business_name}
## 1. PERSONA PRIMARA (nume fictiv, varsta, profesie, nevoi, comportament digital)
## 2. PERSONA SECUNDARA
## 3. PERSONA TERTIARA
## 4. JOURNEY MAP pentru persona primara (7-10 pasi)
## 5. PAIN POINTS COMUNE
## 6. TRIGGER-E DE CONVERSIE
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

MEMORY:`Genereaza MEMORY.md pentru agentul AI al {business_name} ({business_category}).
# MEMORY - {business_name}
## 1. CE MEMOREAZA AGENTUL (tipuri de informatii)
## 2. STRUCTURA MEMORIE PE TERMEN SCURT
## 3. STRUCTURA MEMORIE PE TERMEN LUNG
## 4. REGULI DE ACTUALIZARE MEMORIE
## 5. INFORMATII CRITICE BUSINESS (preturi, program, politici)
## 6. RASPUNSURI STANDARD (10+ situatii frecvente)
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

TOOLS:`Genereaza TOOLS.md pentru agentul AI al {business_name} ({business_category}). Obiective: {objectives}.
# TOOLS - {business_name}
## 1. TOOLKIT PRINCIPAL (tool-uri recomandate cu justificare)
## 2. INTEGRARI API (ce API-uri sa conecteze)
## 3. FLUXURI AUTOMATIZATE (3-5 fluxuri detaliate)
## 4. TOOL-URI DE COMUNICARE
## 5. TOOL-URI DE ANALYTICS
## 6. CONFIGURARE TEHNICA RECOMANDATA
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

AGENTS:`Genereaza AGENTS.md pentru ecosistemul de agenti al {business_name} ({business_category}).
# AGENTS ECOSYSTEM - {business_name}
## 1. AGENTUL PRINCIPAL (rol, responsabilitati)
## 2. SUB-AGENTI RECOMANDATI (3-4 agenti specializati)
## 3. PROTOCOALE DE COMUNICARE INTRE AGENTI
## 4. IERARHIE SI ESCALADARE
## 5. SCENARII DE COLABORARE
## 6. METRICI DE PERFORMANTA
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

HEARTBEAT:`Genereaza HEARTBEAT.md pentru monitorizarea agentului AI al {business_name} ({business_category}).
# HEARTBEAT - {business_name}
## 1. METRICI CHEIE (KPI-uri cu valori tinta)
## 2. DASHBOARD ZILNIC (ce verifica zilnic)
## 3. ALERTE SI PRAGURI CRITICE
## 4. RAPOARTE SAPTAMANALE
## 5. OPTIMIZARE CONTINUA (proces de imbunatatire)
## 6. SEMNALE DE ALARMA (cand sa intervii manual)
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

BOOTSTRAP:`Genereaza BOOTSTRAP.md — ghid de lansare pentru agentul AI al {business_name} ({business_category}).
# BOOTSTRAP - {business_name}
## 1. CHECKLIST PRE-LANSARE (20+ itemi)
## 2. PRIMELE 24 DE ORE (plan orar)
## 3. PRIMA SAPTAMANA (obiective zilnice)
## 4. PRIMA LUNA (milestone-uri)
## 5. TESTARE SI VALIDARE
## 6. ROLLBACK PLAN
Minim 400 cuvinte. EXCLUSIV in limba romana.`,

AGENT_RD:`Genereaza AGENT_RD.md — document R&D pentru agentul AI al {business_name} ({business_category}).
# AGENT R&D - {business_name}
## 1. ANALIZA COMPETITIVA (agenti AI similari in industrie)
## 2. EXPERIMENTE RECOMANDATE (A/B tests)
## 3. TEHNOLOGII EMERGENTE RELEVANTE
## 4. ROADMAP EVOLUTIE AGENT (6-12 luni)
## 5. IPOTEZE DE TESTAT
## 6. RESURSE DE INVATARE
Minim 400 cuvinte. EXCLUSIV in limba romana.`
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fill = (tpl, d) => tpl.replace(/\{(\w+)\}/g, (_, k) => d[k] || '');
const slug = (s) => (s || 'biz').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g,'_').slice(0,40);

async function genOne(fileType, intake) {
  const res = await kimi.chat.completions.create({
    model: 'kimi-k2.6',
    thinking: { type: 'disabled' },
    max_tokens: 8192,
    messages: [{ role: 'user', content: fill(PROMPTS[fileType], intake) }]
  });
  return res.choices[0].message.content || '';
}

// ─── ASYNC ZIP JOB ────────────────────────────────────────────────────────────
async function runJob(job_id, intake) {
  const job = JOBS[job_id];
  const dir = path.join(OUTPUT_DIR, slug(intake.business_name));
  fs.mkdirSync(dir, { recursive: true });

  for (let i = 0; i < FILE_ORDER.length; i++) {
    const ft = FILE_ORDER[i];
    job.current = ft;
    try {
      const content = await genOne(ft, intake);
      fs.writeFileSync(path.join(dir, `${ft}.md`), content, 'utf8');
      job.files[ft] = { ok: true, chars: content.length };
    } catch (e) {
      console.error(`[job:${job_id}] ${ft} ERROR:`, e.message);
      job.files[ft] = { ok: false, error: e.message };
    }
    job.done = i + 1;
  }

  // Build ZIP cu adm-zip
  const zipPath = path.join(dir, 'openclaw_bundle.zip');
  const zip = new AdmZip();
  FILE_ORDER.forEach(ft => {
    const fp = path.join(dir, `${ft}.md`);
    if (fs.existsSync(fp)) zip.addLocalFile(fp);
  });
  zip.writeZip(zipPath);

  job.zip_b64  = fs.readFileSync(zipPath).toString('base64');
  job.status   = 'done';
  job.current  = null;
  console.log(`[job:${job_id}] DONE — ${Object.keys(job.files).length} files`);
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Health
app.get('/api/genhealth', (_req, res) => {
  res.json({ status: 'ok', model: 'kimi-k2.6-no-thinking', key: !!KIMI_KEY, jobs: Object.keys(JOBS).length });
});

// Single file

// ═══ HYBRID AI ROUTING + CONFIDENCE CHECK ═══
function needsFallback(content, intake) {
  if (!content || content.length < 80) return true;
  const lower = content.toLowerCase();
  const negativeSignals = ['nu stiu', 'nu pot', 'nu am', 'nu sunt sigur', 'i cannot', 'i dont know', 'sorry', 'error'];
  if (negativeSignals.some(s => lower.includes(s))) return true;
  if (intake?.business_name && !content.toLowerCase().includes(intake.business_name.toLowerCase().substring(0, 4))) return true;
  return false;
}

async function callAIWithFallback(prompt, intake, useKimiDirect = false) {
  const OpenAI = require('openai');
  
  // Try Ollama first (fast, free, local)
  if (!useKimiDirect) {
    try {
      const ollama = new OpenAI({ baseURL: 'http://localhost:11434/v1', apiKey: 'ollama' });
      const res = await ollama.chat.completions.create({
        model: 'llama3.2:1b',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      });
      const content = res.choices[0]?.message?.content || '';
      if (!needsFallback(content, intake)) {
        return { content, source: 'ollama-local', chars: content.length };
      }
      console.log('[HYBRID] Ollama weak response, falling back to Kimi...');
    } catch (e) {
      console.log('[HYBRID] Ollama unavailable, using Kimi:', e.message);
    }
  }
  
  // Fallback to Kimi k2.6 (high quality)
  const kimi = new OpenAI({
    baseURL: 'https://api.moonshot.ai/v1',
    apiKey: process.env.KIMI_API_KEY
  });
  const res = await kimi.chat.completions.create({
    model: 'kimi-k2.6',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3000,
    temperature: 0.5,
    thinking: { type: 'disabled' }
  });
  const content = res.choices[0]?.message?.content || '';
  return { content, source: 'kimi-k2.6', chars: content.length };
}

app.post('/api/generate-file', async (req, res) => {
  const { file_type, intake_data } = req.body || {};
  if (!PROMPTS[file_type]) return res.status(400).json({ error: 'Invalid file_type' });
  try {
    const content = await genOne(file_type, intake_data || {});
    const dir = path.join(OUTPUT_DIR, slug((intake_data || {}).business_name));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${file_type}.md`), content, 'utf8');
    res.json({ status: 'ok', file_type, content, chars: content.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Start ZIP job → returns job_id instantly
app.post('/api/generate-zip', (req, res) => {
  const intake = (req.body || {}).intake_data;
  if (!intake || !intake.business_name) return res.status(400).json({ error: 'intake_data.business_name required' });
  const job_id = mkId();
  JOBS[job_id] = { status: 'running', done: 0, total: FILE_ORDER.length, current: null, files: {}, zip_b64: null };
  res.json({ status: 'accepted', job_id });
  runJob(job_id, intake).catch(e => { JOBS[job_id].status = 'error'; JOBS[job_id].error = e.message; });
});

// SSE progress
app.get('/api/job/:id/progress', (req, res) => {
  const job = JOBS[req.params.id];
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  const send = () => res.write(`data: ${JSON.stringify({
    status: job.status, done: job.done, total: job.total,
    current: job.current, files: Object.keys(job.files), error: job.error || null
  })}\n\n`);
  send();
  if (job.status !== 'running') return res.end();
  const iv = setInterval(() => { send(); if (job.status !== 'running') { clearInterval(iv); res.end(); } }, 2000);
  req.on('close', () => clearInterval(iv));
});

// Final result
app.get('/api/job/:id/result', (req, res) => {
  const job = JOBS[req.params.id];
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status === 'running') return res.status(202).json({ status: 'running', done: job.done, total: job.total });
  if (job.status === 'error')   return res.status(500).json({ status: 'error', error: job.error });
  res.json({ status: 'done', files_generated: Object.keys(job.files).length, files: job.files, zip_b64: job.zip_b64 });
});

app.listen(8002, () => console.log('[GenAPI] listening on :8002'));
