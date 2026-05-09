import React, { useState } from 'react'

export default function Wizard({ step, setStep, data, saveData, onComplete, onBack }) {
  // FIX: inițializăm formData din prop `data` (nu mai pierde datele la re-render)
  const [formData, setFormData] = useState(() => data || {})

  const steps = [
    {
      title: 'Profil Business',
      fields: [
        { name: 'business_category', label: 'Categorie business', type: 'select', options: ['Consultanță','E-commerce','Servicii locale','SaaS','Content Creator','Altele'] },
        { name: 'team_size', label: 'Echipă', type: 'select', options: ['Solo','2-5','6-20','20+'] },
        { name: 'business_maturity', label: 'Maturitate', type: 'select', options: ['Idee','Launch (<1 an)','Growth (1-3 ani)','Scale (3+ ani)'] }
      ]
    },
    {
      title: 'Identitate & Context',
      fields: [
        { name: 'agent_name', label: 'Nume agent' },
        { name: 'business_name', label: 'Nume business' },
        { name: 'niche', label: 'Nisă' },
        { name: 'business_description', label: 'Descriere', type: 'textarea' },
        { name: 'products_services', label: 'Produse/Servicii', type: 'textarea' },
        { name: 'pricing_info', label: 'Prețuri', type: 'textarea' },
        { name: 'ideal_client', label: 'Client ideal', type: 'textarea' }
      ]
    },
    {
      title: 'Obiective & Probleme',
      fields: [
        { name: 'objectives', label: 'Top 3 obiective (separate prin virgulă)', type: 'textarea' },
        { name: 'main_problem', label: 'Problema #1 de rezolvat', type: 'textarea' },
        { name: 'priority_90_days', label: 'Prioritate 90 zile', type: 'textarea' }
      ]
    },
    {
      title: 'Echipa de Agenți',
      fields: [
        { name: 'exec_agents', label: 'Agenți execuție (bifați)', type: 'checkbox', options: ['HUNTER: Prospecting','WRITER: Conținut','CLOSER: Vânzări','SCHEDULER: Programări','ANALYST: Rapoarte','SCOUT: Competitori'] },
        { name: 'spec_agents', label: 'Agenți specializați', type: 'checkbox', options: ['VOICE: Apeluri+mesaje','PUBLISHER: Multi-platform','RESEARCH: Market intel','SUPPORT: Customer care'] }
      ]
    },
    {
      title: 'Canale & Infrastructură',
      fields: [
        { name: 'channels', label: 'Canale comunicare', type: 'checkbox', options: ['Email','Telegram','WhatsApp','Website chat','Telefon'] },
        { name: 'crm_tools', label: 'CRM/Tool-uri' },
        { name: 'ai_budget', label: 'Buget lunar AI ($)', type: 'number' }
      ]
    },
    {
      title: 'Personalitate & Reguli',
      fields: [
        { name: 'tone', label: 'Ton preferat', type: 'select', options: ['Profesional','Prietenos','Direct','Empatic'] },
        { name: 'language', label: 'Limbă principală' },
        { name: 'working_hours', label: 'Program lucru' },
        { name: 'red_lines', label: 'Reguli absolute (linii roșii)', type: 'textarea' },
        { name: 'autonomy_level', label: 'Nivel autonomie', type: 'select', options: ['Doar sugestii','Acțiune cu aprobare','Autonom < $100','Autonom total'] }
      ]
    },
    {
      title: 'Context Tehnic',
      fields: [
        { name: 'tech_comfort', label: 'Nivel tehnic', type: 'select', options: ['Începător','Intermediar','Avansat'] },
        { name: 'involvement', label: 'Implicare dorită', type: 'select', options: ['Hands-off','Co-pilot','Full control'] },
        { name: 'deadline', label: 'Deadline dorit' },
        { name: 'expectations', label: 'Așteptări specifice', type: 'textarea' }
      ]
    },
    { title: 'Review & Confirmare', review: true }
  ]

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    saveData(updated)
  }

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1)
    else onComplete()
  }

  const current = steps[step]

  if (current.review) {
    const filledFields = Object.values(formData).filter(v => v && (Array.isArray(v) ? v.length > 0 : v !== '')).length
    const totalFields = 25
    const completeness = Math.min(100, Math.round((filledFields / totalFields) * 100))

    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container-custom max-w-4xl">
          <button className="mb-8 text-blue-400 hover:text-blue-300 transition-colors" onClick={onBack}>← Înapoi la landing</button>
          <h2 className="text-3xl font-bold mb-8">🔍 Review & Generare</h2>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="card text-center">
              <div className="text-3xl text-emerald-400 font-bold mb-1">{completeness}%</div>
              <div className="text-sm text-slate-400">Completitudine</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl text-blue-400 font-bold mb-1">{formData.exec_agents?.length || 0}</div>
              <div className="text-sm text-slate-400">Agenți selectați</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl text-amber-400 font-bold mb-1">{formData.channels?.length || 0}</div>
              <div className="text-sm text-slate-400">Canale active</div>
            </div>
          </div>

          {formData.business_name && (
            <div className="card mb-6 border-emerald-500/30">
              <h4 className="font-semibold text-white mb-3">📋 Rezumat:</h4>
              <div className="space-y-2 text-sm text-slate-300">
                {formData.business_name && <p><span className="text-slate-500">Business:</span> {formData.business_name}</p>}
                {formData.niche && <p><span className="text-slate-500">Nisă:</span> {formData.niche}</p>}
                {formData.agent_name && <p><span className="text-slate-500">Agent:</span> {formData.agent_name}</p>}
                {formData.exec_agents?.length > 0 && <p><span className="text-slate-500">Agenți:</span> {formData.exec_agents.join(', ')}</p>}
              </div>
            </div>
          )}

          <div className="card mb-6">
            <h4 className="font-semibold text-white mb-3">💡 Recomandări:</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              {!formData.business_name && <li>• ⚠️ Completează numele business-ului (Pasul 2)</li>}
              {(!formData.exec_agents || formData.exec_agents.length === 0) && <li>• ⚠️ Selectează cel puțin un agent (Pasul 4)</li>}
              {!formData.objectives && <li>• Adaugă obiective clare pentru generare mai precisă (Pasul 3)</li>}
              {completeness >= 60 && <li>• ✅ Profil suficient pentru generare de calitate</li>}
            </ul>
          </div>

          <div className="flex gap-4">
            <button className="btn-secondary" onClick={() => setStep(step - 1)}>← Editare</button>
            <button className="btn-primary btn-glow flex-1" onClick={next}>
              🚀 Confirmă și Generează Cele 9 Fișiere
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-custom max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm" onClick={() => step > 0 ? setStep(step - 1) : onBack()}>
              ← {step > 0 ? 'Pasul anterior' : 'Anulează'}
            </button>
            <span className="text-slate-400 text-sm">Pasul {step + 1} din {steps.length}</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">{current.title}</h2>

        <div className="space-y-5">
          {current.fields?.map((field, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-slate-300 mb-2">{field.label}</label>

              {field.type === 'textarea' ? (
                <textarea
                  className="w-full p-3 rounded-xl border border-white/10 bg-transparent text-white focus:border-blue-500 focus:outline-none min-h-[100px] resize-none transition-colors"
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder || ''}
                />
              ) : field.type === 'select' ? (
                <select
                  className="w-full p-3 rounded-xl border border-white/10 bg-slate-900 text-white focus:border-blue-500 focus:outline-none transition-colors"
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                >
                  <option value="">Alege...</option>
                  {field.options?.map((opt, j) => (
                    <option key={j} value={opt} className="bg-slate-800">{opt}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div className="space-y-2">
                  {field.options?.map((opt, j) => (
                    <label key={j} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500 accent-blue-500"
                        checked={(formData[field.name] || []).includes(opt)}
                        onChange={(e) => {
                          const arr = formData[field.name] || []
                          handleChange(field.name, e.target.checked ? [...arr, opt] : arr.filter(x => x !== opt))
                        }}
                      />
                      <span className="text-sm text-slate-300">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type={field.type || 'text'}
                  className="w-full p-3 rounded-xl border border-white/10 bg-transparent text-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder={field.placeholder || ''}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <button className="btn-primary btn-glow w-full mt-8 py-4 text-base" onClick={next}>
          {step === steps.length - 2 ? 'Review →' : 'Continuă →'}
        </button>
      </div>
    </div>
  )
}
