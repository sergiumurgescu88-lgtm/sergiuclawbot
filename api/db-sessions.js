// ═══════════════════════════════════════════════════════════
//  db-sessions.js — AgentulMeu · Sesiuni Wizard + Fișiere MD
//  Plasează în: /var/www/agentulmeu.online/api/db-sessions.js
// ═══════════════════════════════════════════════════════════

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../data/agentulmeu.db');

// Asigură că directorul există
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// ── Performanță ──────────────────────────────────────────
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id          TEXT PRIMARY KEY,
    created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at  INTEGER NOT NULL DEFAULT (unixepoch()),
    current_step INTEGER NOT NULL DEFAULT 1,
    completed   INTEGER NOT NULL DEFAULT 0,

    -- Step 1: Profil business
    business_types  TEXT,   -- JSON array
    team_size       TEXT,
    maturity_stage  TEXT,

    -- Step 2: Identitate
    business_name   TEXT,
    business_desc   TEXT,
    products        TEXT,
    ideal_client    TEXT,
    geo_zone        TEXT,
    website         TEXT,
    revenue_model   TEXT,

    -- Step 3: Obiective
    objectives      TEXT,   -- JSON array
    problem_main    TEXT,
    repetitive_tasks TEXT,
    time_lost       TEXT,
    priority_90days TEXT,

    -- Step 4: Agenți
    agents_execution TEXT,  -- JSON array
    agents_special   TEXT,  -- JSON array

    -- Step 5: Canale
    channels        TEXT,   -- JSON array
    crm_tools       TEXT,   -- JSON array
    integrations    TEXT,   -- JSON array
    budget_monthly  TEXT,

    -- Step 6: Personalitate
    autonomy_level  TEXT,
    verbal_tone     TEXT,
    red_lines       TEXT,
    competitive_adv TEXT,

    -- Step 7: Context tehnic
    ai_experience   TEXT,
    setup_involvement TEXT,
    launch_deadline TEXT,
    expectations_30 TEXT,
    specific_context TEXT
  );

  CREATE TABLE IF NOT EXISTS generated_files (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    file_name   TEXT NOT NULL,       -- ex: SOUL.md
    content     TEXT NOT NULL,
    generated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(session_id, file_name)
  );

  CREATE TABLE IF NOT EXISTS report_config (
    session_id    TEXT PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
    business_name TEXT,
    email         TEXT,
    telegram_token TEXT,
    telegram_chat  TEXT,
    auto_reports   INTEGER DEFAULT 0,
    updated_at     INTEGER DEFAULT (unixepoch())
  );
`);

// ════════════════════════════════════════════════════════════
//  SESSIONS
// ════════════════════════════════════════════════════════════

function createSession(sessionId) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO sessions (id) VALUES (?)
  `);
  stmt.run(sessionId);
  return getSession(sessionId);
}

function getSession(sessionId) {
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  if (!row) return null;

  // Parse JSON câmpuri
  const jsonFields = ['business_types','objectives','agents_execution','agents_special','channels','crm_tools','integrations'];
  jsonFields.forEach(f => {
    if (row[f]) {
      try { row[f] = JSON.parse(row[f]); } catch { /* rămâne string */ }
    }
  });

  // Adaugă fișierele generate
  row.files = getSessionFiles(sessionId);
  return row;
}

function updateSessionStep(sessionId, stepData) {
  // stepData: { step, fields: { key: value, ... } }
  const { step, fields } = stepData;

  // Serializează array-urile în JSON
  const processedFields = {};
  const jsonFields = ['business_types','objectives','agents_execution','agents_special','channels','crm_tools','integrations'];
  
  for (const [key, value] of Object.entries(fields)) {
    if (jsonFields.includes(key) && Array.isArray(value)) {
      processedFields[key] = JSON.stringify(value);
    } else {
      processedFields[key] = value;
    }
  }

  // Build dynamic SET clause
  const setClauses = Object.keys(processedFields).map(k => `${k} = @${k}`).join(', ');
  const query = `
    UPDATE sessions 
    SET ${setClauses}, current_step = @current_step, updated_at = unixepoch()
    WHERE id = @id
  `;

  const params = { ...processedFields, current_step: step, id: sessionId };
  
  try {
    db.prepare(query).run(params);
  } catch (err) {
    console.error('[DB] updateSessionStep error:', err.message);
    throw err;
  }

  return getSession(sessionId);
}

function markCompleted(sessionId) {
  db.prepare(`UPDATE sessions SET completed = 1, updated_at = unixepoch() WHERE id = ?`).run(sessionId);
}

function getAllSessions() {
  const rows = db.prepare(`
    SELECT s.*, 
           COUNT(f.id) as files_count
    FROM sessions s
    LEFT JOIN generated_files f ON f.session_id = s.id
    GROUP BY s.id
    ORDER BY s.updated_at DESC
  `).all();
  return rows;
}

// ════════════════════════════════════════════════════════════
//  GENERATED FILES
// ════════════════════════════════════════════════════════════

function saveGeneratedFile(sessionId, fileName, content) {
  db.prepare(`
    INSERT INTO generated_files (session_id, file_name, content)
    VALUES (@sessionId, @fileName, @content)
    ON CONFLICT(session_id, file_name) 
    DO UPDATE SET content = @content, generated_at = unixepoch()
  `).run({ sessionId, fileName, content });
}

function getSessionFiles(sessionId) {
  return db.prepare(`
    SELECT file_name, content, generated_at 
    FROM generated_files 
    WHERE session_id = ?
    ORDER BY generated_at ASC
  `).all(sessionId);
}

function getSessionFile(sessionId, fileName) {
  return db.prepare(`
    SELECT * FROM generated_files 
    WHERE session_id = ? AND file_name = ?
  `).get(sessionId, fileName);
}

// ════════════════════════════════════════════════════════════
//  REPORT CONFIG
// ════════════════════════════════════════════════════════════

function saveReportConfig(sessionId, config) {
  db.prepare(`
    INSERT INTO report_config (session_id, business_name, email, telegram_token, telegram_chat, auto_reports)
    VALUES (@sessionId, @business_name, @email, @telegram_token, @telegram_chat, @auto_reports)
    ON CONFLICT(session_id)
    DO UPDATE SET 
      business_name = @business_name,
      email = @email,
      telegram_token = @telegram_token,
      telegram_chat = @telegram_chat,
      auto_reports = @auto_reports,
      updated_at = unixepoch()
  `).run({ sessionId, ...config });
}

function getReportConfig(sessionId) {
  return db.prepare('SELECT * FROM report_config WHERE session_id = ?').get(sessionId);
}

// ════════════════════════════════════════════════════════════
//  DASHBOARD AGGREGATE
// ════════════════════════════════════════════════════════════

function getDashboardData(sessionId) {
  const session = getSession(sessionId);
  if (!session) return null;

  const files = getSessionFiles(sessionId);
  const reportConfig = getReportConfig(sessionId);

  const fileMap = {};
  files.forEach(f => { fileMap[f.file_name] = f.content; });

  return {
    session,
    files: fileMap,
    filesCount: files.length,
    filesGenerated: files.map(f => f.file_name),
    reportConfig,
    progress: {
      stepsCompleted: session.current_step - 1,
      filesGenerated: files.length,
      totalFiles: 9,
      percentComplete: Math.round((files.length / 9) * 100)
    }
  };
}

module.exports = {
  db,
  createSession,
  getSession,
  updateSessionStep,
  markCompleted,
  getAllSessions,
  saveGeneratedFile,
  getSessionFiles,
  getSessionFile,
  saveReportConfig,
  getReportConfig,
  getDashboardData,
};

// Migrare sigură: adaugă coloanele de plată dacă nu există
function migratePaymentColumns() {
  const cols = db.pragma("table_info('sessions')", { simple: false }).map(c => c.name);
  if (!cols.includes('payment_status')) {
    db.exec("ALTER TABLE sessions ADD COLUMN payment_status TEXT DEFAULT 'pending'");
  }
  if (!cols.includes('stripe_checkout_id')) {
    db.exec("ALTER TABLE sessions ADD COLUMN stripe_checkout_id TEXT");
  }
  if (!cols.includes('stripe_payment_intent')) {
    db.exec("ALTER TABLE sessions ADD COLUMN stripe_payment_intent TEXT");
  }
}
migratePaymentColumns();
