// ═══════════════════════════════════════════════════════════
//  session-routes.js — AgentulMeu · API Rute Sesiuni
//  Plasează în: /var/www/agentulmeu.online/api/session-routes.js
//  Adaugă în server.js: require('./session-routes')(app)
// ═══════════════════════════════════════════════════════════

const {
  createSession,
  getSession,
  updateSessionStep,
  markCompleted,
  saveGeneratedFile,
  getSessionFiles,
  getSessionFile,
  saveReportConfig,
  getReportConfig,
  getDashboardData,
} = require('./db-sessions');

module.exports = function registerSessionRoutes(app) {

  // ── Middleware: log toate session requests ─────────────────
  app.use('/api/session', (req, res, next) => {
    console.log(`[SESSION] ${req.method} ${req.path} | session: ${req.headers['x-session-id'] || req.query.sessionId || '-'}`);
    next();
  });

  // ─────────────────────────────────────────────────────────
  //  POST /api/session/create
  //  Body: { sessionId? }
  //  Crează sau returnează o sesiune existentă
  // ─────────────────────────────────────────────────────────
  app.post('/api/session/create', (req, res) => {
    try {
      const sessionId = req.body.sessionId || generateSessionId();
      createSession(sessionId);
      const session = getSession(sessionId);
      res.json({ success: true, sessionId, session });
    } catch (err) {
      console.error('[SESSION] create error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────
  //  GET /api/session/:sessionId
  //  Returnează sesiunea completă cu fișierele generate
  // ─────────────────────────────────────────────────────────
  app.get('/api/session/:sessionId', (req, res) => {
    try {
      const session = getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ success: false, error: 'Sesiunea nu există' });
      }
      res.json({ success: true, session });
    } catch (err) {
      console.error('[SESSION] get error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────
  //  POST /api/session/:sessionId/step
  //  Body: { step: 1-9, fields: { ... } }
  //  Salvează datele unui step individual
  // ─────────────────────────────────────────────────────────
  app.post('/api/session/:sessionId/step', (req, res) => {
    try {
      const { step, fields } = req.body;
      const { sessionId } = req.params;

      if (!step || !fields) {
        return res.status(400).json({ success: false, error: 'step și fields sunt obligatorii' });
      }

      // Asigură că sesiunea există
      createSession(sessionId);
      const updated = updateSessionStep(sessionId, { step, fields });
      res.json({ success: true, session: updated });
    } catch (err) {
      console.error('[SESSION] step update error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────
  //  POST /api/session/:sessionId/file
  //  Body: { fileName: 'SOUL.md', content: '...' }
  //  Salvează un fișier generat
  // ─────────────────────────────────────────────────────────
  app.post('/api/session/:sessionId/file', (req, res) => {
    try {
      const { fileName, content } = req.body;
      const { sessionId } = req.params;

      if (!fileName || !content) {
        return res.status(400).json({ success: false, error: 'fileName și content sunt obligatorii' });
      }

      saveGeneratedFile(sessionId, fileName, content);
      const files = getSessionFiles(sessionId);
      res.json({ 
        success: true, 
        filesCount: files.length,
        filesGenerated: files.map(f => f.file_name)
      });
    } catch (err) {
      console.error('[SESSION] file save error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────
  //  GET /api/session/:sessionId/files
  //  Returnează toate fișierele generate pentru sesiune
  // ─────────────────────────────────────────────────────────
  app.get('/api/session/:sessionId/files', (req, res) => {
    try {
      const files = getSessionFiles(req.params.sessionId);
      res.json({ success: true, files });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────
  //  GET /api/session/:sessionId/file/:fileName
  //  Returnează conținutul unui fișier specific
  // ─────────────────────────────────────────────────────────
  app.get('/api/session/:sessionId/file/:fileName', (req, res) => {
    try {
      const file = getSessionFile(req.params.sessionId, req.params.fileName);
      if (!file) {
        return res.status(404).json({ success: false, error: 'Fișierul nu a fost generat încă' });
      }
      res.json({ success: true, file });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────
  //  POST /api/session/:sessionId/complete
  //  Marchează sesiunea ca finalizată
  // ─────────────────────────────────────────────────────────
  app.post('/api/session/:sessionId/complete', (req, res) => {
    try {
      markCompleted(req.params.sessionId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────
  //  GET /api/dashboard/:sessionId
  //  Date complete pentru dashboard
  // ─────────────────────────────────────────────────────────
  app.get('/api/dashboard/:sessionId', (req, res) => {
    try {
      const data = getDashboardData(req.params.sessionId);
      if (!data) {
        return res.status(404).json({ success: false, error: 'Sesiunea nu există' });
      }
      res.json({ success: true, ...data });
    } catch (err) {
      console.error('[DASHBOARD] error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────
  //  POST /api/dashboard/:sessionId/report-config
  //  Salvează configurarea rapoartelor
  // ─────────────────────────────────────────────────────────
  app.post('/api/dashboard/:sessionId/report-config', (req, res) => {
    try {
      const config = {
        business_name: req.body.business_name || '',
        email: req.body.email || '',
        telegram_token: req.body.telegram_token || '',
        telegram_chat: req.body.telegram_chat || '',
        auto_reports: req.body.auto_reports ? 1 : 0,
      };
      createSession(req.params.sessionId); // asigură existența
      saveReportConfig(req.params.sessionId, config);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────
  //  PATCH pe ruta existentă /api/wizard/generate
  //  Interceptează răspunsul și salvează automat în DB
  //  NOTĂ: Acest middleware trebuie adăugat ÎNAINTE de ruta generate
  // ─────────────────────────────────────────────────────────
  app.use('/api/wizard/generate', (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Dacă generarea a reușit, salvează în DB
      if (data && data.success && data.content && req.body) {
        const sessionId = req.body.sessionId || req.headers['x-session-id'];
        const fileName = req.body.fileName || req.body.file;
        
        if (sessionId && fileName) {
          try {
            createSession(sessionId);
            saveGeneratedFile(sessionId, fileName, data.content);
            console.log(`[AUTO-SAVE] ${fileName} salvat pentru sesiunea ${sessionId}`);
          } catch (err) {
            console.error('[AUTO-SAVE] eroare:', err.message);
          }
        }
      }
      return originalJson(data);
    };
    
    next();
  });

  console.log('[SESSION-ROUTES] ✅ Rute sesiuni înregistrate');
};

// ── Utilitar ──────────────────────────────────────────────
function generateSessionId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `sess_${timestamp}_${random}`;
}
