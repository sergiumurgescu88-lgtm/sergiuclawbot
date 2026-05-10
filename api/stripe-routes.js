const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Database = require('better-sqlite3');
const db = new Database('/var/www/agentulmeu.online/data/agentulmeu.db');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const BASE_URL = process.env.BASE_URL || 'https://agentulmeu.online';

const getSession = (id) => db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
const updateSession = (id, fields) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return;
  const sets = keys.map(k => k + ' = ?').join(', ');
  db.prepare('UPDATE sessions SET ' + sets + ' WHERE id = ?').run(...Object.values(fields), id);
};

router.post('/create-checkout', async (req, res) => {
  try {
    const { sessionId, priceId, mode = 'subscription' } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId necesar' });
    const session = getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Sesiunea nu exista' });
    if (session.payment_status === 'paid') return res.json({ success: true, alreadyPaid: true });

    const selectedPrice = priceId || process.env.STRIPE_PRICE_BASE;
    const checkout = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: mode,
      client_reference_id: sessionId,
      line_items: [{ price: selectedPrice, quantity: 1 }],
      success_url: BASE_URL + '/wizard?session=' + sessionId + '&step=8&payment=success',
      cancel_url: BASE_URL + '/wizard?session=' + sessionId + '&step=7&payment=cancelled',
      metadata: { sessionId }
    });
    updateSession(sessionId, { stripe_checkout_id: checkout.id });
    res.json({ success: true, url: checkout.url });
  } catch (err) {
    console.error('[Stripe Create] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/check-status/:sessionId', async (req, res) => {
  try {
    const session = getSession(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Sesiunea nu exista' });
    res.json({ success: true, payment_status: session.payment_status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = endpointSecret ? stripe.webhooks.constructEvent(req.body, sig, endpointSecret) : JSON.parse(req.body);
  } catch (err) {
    return res.status(400).send('Webhook Error: ' + err.message);
  }
  if (event.type === 'checkout.session.completed') {
    const cs = event.data.object;
    if (cs.client_reference_id) {
      updateSession(cs.client_reference_id, { payment_status: 'paid', stripe_payment_intent: cs.payment_intent });
      console.log('[Stripe] Sesiunea ' + cs.client_reference_id + ' platita.');
    }
  }
  res.json({ received: true });
});

module.exports = router;
