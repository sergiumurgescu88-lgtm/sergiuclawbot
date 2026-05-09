import React, { useState, useEffect } from 'react'

const FILE_META = {
  SOUL:      { icon: '💫', desc: 'Misiune, valori, reguli absolute, autonomie' },
  IDENTITY:  { icon: '👤', desc: 'Profil agent, ton, limbă, program de lucru' },
  USER:      { icon: '🎯', desc: 'Profilul tău, preferințe, priorități 90 zile' },
  MEMORY:    { icon: '🧠', desc: 'Context business, produse, prețuri, USP' },
  TOOLS:     { icon: '🛠️', desc: 'Canale, CRM, API-uri AI, buget, comenzi' },
  AGENTS:    { icon: '🤖', desc: 'Echipa de sub-agenți, workflow-uri, pipeline' },
  HEARTBEAT: { icon: '💓', desc: 'Task-uri proactive, rutine, trigger-e, alerte' },
  BOOTSTRAP: { icon: '🚀', desc: 'Checklist lansare, pași critici, fallback plan' },
  AGENT_RD:  { icon: '🔬', desc: 'Research framework, validare idei, surse' },
}

export default function Dashboard({ data, onBack }) {
  const [generating, setGenerating] = useState(null)
  const [status, setStatus] = useState({})
  const [contents, setContents] = useState({})
  const [preview, setPreview] = useState(null)
  const [profileSaved, setProfileSaved] = useState(false)
  const [token] = useState(() => localStorage.getItem('agentulmeu_token') || '')

  const files = Object.keys(FILE_META)

  // Salvăm profilul automat la mount dacă există date
  useEffect(() => {
    if (data?.business_name && token && !profileSaved) {
      saveProfile()
    }
  }, [])

  const saveProfile = async () => {
    if (!token) return null
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          business: {
            name: data.business_name || 'Business',
            type: data.business_category ? [data.business_category] : [],
            description: data.business_description || '',
            products: data.products_services || '',
            ideal_client: data.ideal_client || '',
            region: '',
          },
          goals: {
            primary: (data.objectives || '').split(',').map(s => s.trim()).filter(Boolean),
            top_problem: data.main_problem || '',
            repetitive_tasks: [],
            priority_90days: data.priority_90_days || ''
          },
          agents_needed: data.exec_agents || [],
          personality: { tone: data.tone || 'Profesional', language: data.language || 'Română' },
          channels: { active: data.channels || [] }
        })
      })
      const result = await res.json()
      if (result.success) {
        setProfileSaved(true)
        return result.filename
      }
    } catch (e) {
      console.error('Profile save error:', e)
    }
    return null
  }

  const generate = async (file) => {
    setGenerating(file)
    setStatus(prev => ({ ...prev, [file]: 'loading' }))
    try {
      // FIX: endpoint corect — /api/generate-file există în server.py (adăugat)
      const res = await fetch('/api/generate-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ file_type: file, intake_data: data })
      })
      const result = await res.json()
      if (result.success) {
        setStatus(prev => ({ ...prev, [file]: 'done' }))
        setContents(prev => ({ ...prev, [file]: result.content || '' }))
      } else {
        setStatus(prev => ({ ...prev, [file]: 'error' }))
      }
    } catch (e) {
      setStatus(prev => ({ ...prev, [file]: 'error' }))
    }
    setGenerating(null)
  }

  const generateAll = async () => {
    for (const f of files) {
      if (status[f] !== 'done') await generate(f)
    }
  }

  const downloadFile = (file) => {
    const content = contents[file] || `# ${file}.md\n\nFișier generat de AgentulMeu.online`
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${file}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAll = () => {
    const doneFiles = files.filter(f => status[f] === 'done')
    doneFiles.forEach(f => downloadFile(f))
  }

  const doneCount = files.filter(f => status[f] === 'done').length

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-custom">

        <button className="mb-8 text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2" onClick={onBack}>
          ← Înapoi
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold">📁 Dashboard — Cele 9 Fișiere MD</h2>
            {data?.business_name && (
              <p className="text-slate-400 mt-1">Business: <span className="text-blue-400">{data.business_name}</span></p>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <button className="btn-secondary" onClick={generateAll} disabled={!!generating || doneCount === files.length}>
              {generating ? '⏳ Generează...' : `🔄 Generează Toate (${files.length - doneCount} rămase)`}
            </button>
            <button
              className={`btn-primary ${doneCount === 0 ? 'opacity-50' : ''}`}
              onClick={downloadAll}
              disabled={doneCount === 0}
            >
              📦 Descarcă ZIP ({doneCount}/{files.length})
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {doneCount > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Progres generare</span>
              <span>{doneCount}/{files.length} fișiere</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / files.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map(file => {
            const meta = FILE_META[file]
            const st = status[file]
            return (
              <div key={file} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{meta.icon}</span>
                    <h3 className="font-semibold text-white">{file}.md</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    st === 'done' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    st === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    st === 'loading' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-slate-700/50 text-slate-400'
                  }`}>
                    {st === 'done' ? '✓ Gata' : st === 'error' ? '✗ Eroare' : st === 'loading' ? '⏳ Generez...' : 'Negenerat'}
                  </span>
                </div>

                <p className="text-sm text-slate-400 mb-4">{meta.desc}</p>

                <div className="flex gap-2">
                  <button
                    className="flex-1 btn-secondary text-sm py-2"
                    onClick={() => generate(file)}
                    disabled={!!generating || st === 'done'}
                  >
                    {generating === file ? '⏳...' : st === 'done' ? '✓ Gata' : 'Generează'}
                  </button>
                  <button
                    className="px-3 btn-secondary text-sm"
                    disabled={st !== 'done'}
                    onClick={() => st === 'done' && setPreview({ file, content: contents[file] })}
                    title="Previzualizare"
                  >
                    👁
                  </button>
                  <button
                    className="px-3 btn-secondary text-sm"
                    disabled={st !== 'done'}
                    onClick={() => downloadFile(file)}
                    title="Descarcă"
                  >
                    ↓
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Preview modal */}
        {preview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" onClick={() => setPreview(null)}>
            <div className="card max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">{preview.file}.md</h3>
                <button className="text-slate-400 hover:text-white transition-colors" onClick={() => setPreview(null)}>✕</button>
              </div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {preview.content || '(fișier gol)'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
