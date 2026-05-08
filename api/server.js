require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { generateWithFallback } = require('./ai-router');
const fs = require('fs').promises;
const path = require('path');
const JSZip = require('jszip');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), port: PORT });
});

// Ask AI
app.post('/api/ask-ai', async (req, res) => {
  const { prompt, context } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  try {
    const result = await generateWithFallback(prompt, { maxTokens: 250, temperature: 0.2, context });
    res.json({ text: result.text, provider: result.provider, fallback: !!result.warning });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate file (streaming)
app.post('/api/generate-file', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const { file_type, intake } = req.body;
  if (!file_type || !intake) {
    res.write('data: ' + JSON.stringify({ error: 'Missing file_type or intake' }) + '\n\n');
    return res.end();
  }
  const send = (msg) => res.write('data: ' + JSON.stringify(msg) + '\n\n');
  try {
    send({ type: 'start', file: file_type });
    const tplPath = path.join(__dirname, 'templates', file_type + '.md');
    let template;
    try { template = await fs.readFile(tplPath, 'utf-8'); }
    catch (e) { send({ type: 'error', message: 'Template not found: ' + file_type }); return res.end(); }
    send({ type: 'step', step: 'analyzing_intake', percent: 20 });
    const prompt = `Generate a valid Markdown config file of type "${file_type}.md" based on this business intake.\nRules: 1) Keep YAML frontmatter if present. 2) Replace {{VARIABLE}} with intake values. 3) Use proper Markdown syntax. 4) Output ONLY the final MD content.\nIntake: ${JSON.stringify(intake).slice(0, 3000)}\nTemplate: ${template.slice(0, 500)}\nGenerate now:`;
    send({ type: 'step', step: 'generating', percent: 50 });
    const result = await generateWithFallback(prompt, { maxTokens: 4096, temperature: 0.2, context: intake });
    let content = result.text;
    for (const [k, v] of Object.entries(intake)) { if (v != null) content = content.split('{{' + k + '}}').join(String(v)); }
    content = content.replace(/{{\w+}}/g, 'N/A');
    send({ type: 'complete', percent: 100, content, provider: result.provider });
  } catch (err) {
    send({ type: 'error', message: err.message });
  } finally { res.end(); }
});

// Generate ZIP
app.post('/api/generate-zip', async (req, res) => {
  const { intake } = req.body;
  if (!intake) return res.status(400).json({ error: 'Missing intake data' });
  try {
    const zip = new JSZip();
    const templatesDir = path.join(__dirname, 'templates');
    const files = await fs.readdir(templatesDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    for (const file of mdFiles) {
      const tplPath = path.join(templatesDir, file);
      let content = await fs.readFile(tplPath, 'utf-8');
      const flatIntake = flattenObject(intake);
      for (const [k, v] of Object.entries(flatIntake)) {
        if (v != null) content = content.split(new RegExp('{{' + k + '}}', 'gi')).join(String(v));
      }
      content = content.replace(/{{\w+}}/g, 'N/A');
      zip.file(file, content);
    }
    const readme = `# AgentulMeu Configuration Package\nGenerated: ${new Date().toISOString()}\nBusiness: ${intake.identity?.agent_name || 'N/A'}\nType: ${intake.identity?.business_type || 'N/A'}\n\n## Files Included\n${mdFiles.map(f => `- ${f}`).join('\n')}\n\n## Quick Start\n1. Extract this ZIP\n2. Review each .md file\n3. Deploy to your AI platform\n\n## Support\nVisit https://agentulmeu.online for updates.`;
    zip.file('README.md', readme);
    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="agent-config-${Date.now()}.zip"`);
    res.send(buffer);
  } catch (err) {
    console.error('ZIP error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Stripe webhook
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_fallback';
    const event = stripe.webhooks.constructEvent(req.body, sig, secret);
    console.log(`Stripe: ${event.type}`);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  res.json({ received: true });
});

// Stripe checkout
app.post('/api/checkout', async (req, res) => {
  const { user_email } = req.body;
  if (!user_email) return res.status(400).json({ error: 'Missing user_email' });
  try {
    const priceId = process.env.STRIPE_PRICE_BASE || 'price_default';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: 'https://agentulmeu.online/?checkout=success',
      cancel_url: 'https://agentulmeu.online/?checkout=cancelled',
      customer_email: user_email
    });
    res.json({ url: session.url, session_id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, '..')));
app.get("/api/kb/pricing", (req, res) => {
  res.json({
    base_plan: { name: "Starter", short_desc: "9 fisiere MD + Hermes setup", price_monthly_usd: 29, features: ["9 fisiere MD generate cu AI","1 business profile","Wizard 8 pasi","Download ZIP","Support email"] },
    subagent_plan: { name: "Professional", short_desc: "Business-uri nelimitate + sub-agenti", price_per_agent_monthly_usd: 99, features: ["Business-uri nelimitate","Sub-agenti specializati","Integrare Telegram/WhatsApp","Dashboard avansat","Priority support","API access"] },
    setup_plan: { name: "Done-For-You", short_desc: "Instalam totul pe VPS-ul tau", price_one_time_usd: 299, features: ["Setup complet VPS","Hermes instalat+configurat","Toate canalele conectate","Training 1-on-1 2h","30 zile support prioritar"] }
  });
});

app.listen(PORT, '127.0.0.1', () => console.log(`API running on :${PORT}`));

function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '_' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else if (Array.isArray(obj[k])) {
      obj[k].forEach((item, i) => {
        if (typeof item === 'object') Object.assign(acc, flattenObject(item, pre + k + '_' + i));
        else acc[pre + k + '_' + i] = item;
      });
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}
