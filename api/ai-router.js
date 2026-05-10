const { GoogleGenerativeAI } = require('@google/generative-ai');
const GEMINI_KEY     = process.env.GEMINI_API_KEY  || '';
const NVIDIA_KEY     = process.env.NVIDIA_API_KEY  || '';
const OPENAI_KEY     = process.env.OPENAI_API_KEY  || '';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';

async function generateWithGemini(prompt, options = {}) {
  if (!GEMINI_KEY) throw new Error('No Gemini key');
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  return { text: result.response.text(), provider: 'gemini-2.0-flash' };
}
async function generateWithOpenRouter(prompt, options = {}) {
  if (!OPENROUTER_KEY) throw new Error('No OpenRouter key');
  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENROUTER_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://agentulmeu.online', 'X-Title': 'AgentulMeu Wizard' },
    body: JSON.stringify({ model: 'google/gemini-2.0-flash-001', messages: [{ role: 'user', content: prompt }], max_tokens: options.maxTokens || 1024, temperature: options.temperature || 0.2 })
  });
  if (!resp.ok) { const e = await resp.text(); throw new Error(`OpenRouter ${resp.status}: ${e}`); }
  const data = await resp.json();
  return { text: data.choices[0].message.content, provider: 'openrouter/gemini-2.0-flash' };
}
async function generateWithNvidia(prompt, options = {}) {
  if (!NVIDIA_KEY) throw new Error('No NVIDIA key');
  const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', { method: 'POST', headers: { 'Authorization': `Bearer ${NVIDIA_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'nvidia/llama-3.1-70b-instruct', messages: [{ role: 'user', content: prompt }], max_tokens: options.maxTokens || 1024, temperature: options.temperature || 0.2 }) });
  if (!resp.ok) throw new Error(`NVIDIA HTTP ${resp.status}`);
  const data = await resp.json();
  return { text: data.choices[0].message.content, provider: 'nvidia/llama-3.1-70b' };
}
async function generateWithOpenAI(prompt, options = {}) {
  if (!OPENAI_KEY) throw new Error('No OpenAI key');
  const resp = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: options.maxTokens || 1024, temperature: options.temperature || 0.2 }) });
  if (!resp.ok) throw new Error(`OpenAI HTTP ${resp.status}`);
  const data = await resp.json();
  return { text: data.choices[0].message.content, provider: 'openai/gpt-4o-mini' };
}
async function generateWithFallback(prompt, options = {}) {
  const providers = [
    { name: 'openrouter', fn: generateWithOpenRouter },
    { name: 'gemini',     fn: generateWithGemini },
    { name: 'nvidia',     fn: generateWithNvidia },
    { name: 'openai',     fn: generateWithOpenAI },
  ];
  for (const provider of providers) {
    for (let attempt = 0; attempt <= 2; attempt++) {
      try { return await provider.fn(prompt, options); }
      catch (err) {
        console.log(`[${provider.name}] attempt ${attempt+1} failed: ${err.message}`);
        if (attempt < 2) await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }
  return { text: 'AI unavailable.', provider: 'fallback', warning: true };
}
module.exports = { generateWithFallback };
