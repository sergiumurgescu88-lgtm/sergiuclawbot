# HEARTBEAT - Restaurant La Crama

## Monitorizare Agent AI HoReCa | Document Operational V1.0

---

## 1. METRICI CHEIE (KPI-uri cu valori tinta)

### 1.1 Disponibilitate si Performanta Tehnica

| Indicator | Valoare Tinta | Frecventa Masurare |
|-----------|---------------|-------------------|
| Uptime agent AI | ≥ 99.5% | Continuu |
| Timp mediu de raspuns (RT) | ≤ 3 secunde | Per interactiune |
| Rata de succes a intentiilor | ≥ 92% | Zilnic |
| Eroare rate (fallback la operator) | ≤ 5% | Zilnic |

### 1.2 Calitatea Interactiunii cu Clientul

| Indicator | Valoare Tinta | Frecventa Masurare |
|-----------|---------------|-------------------|
| Scor CSAT post-interactiune | ≥ 4.3/5.0 | Per conversatie |
| Rata de rezolvare la primul contact (FCR) | ≥ 85% | Saptamanal |
| Rata de conversie rezervare | ≥ 35% din intentii | Lunar |
| Abandon conversatie | ≤ 8% | Zilnic |

### 1.3 Eficienta Operationala

| Indicator | Valoare Tinta | Frecventa Masurare |
|-----------|---------------|-------------------|
| Cost per interactiune | ≤ 0.80 RON | Lunar |
| Interactiuni handle per ora | ≥ 45 | Zilnic |
| Reducere timp operator uman | ≥ 60% | Lunar |
| Precizie detectie limba (RO/EN/DE) | ≥ 98% | Continuu |

---

## 2. DASHBOARD ZILNIC (ce verifica zilnic)

### 2.1 Morning Check (08:00 - 09:00)

Responsabil: Manager Operational / Tehnic

**Verificari obligatorii:**

- [ ] **Stare servicii**: API-uri rezervari, meniu digital, platforma delivery integrate functional
- [ ] **Coada mesaje noapte**: procesare automata mesaje primite in afara orelor de program (22:00 - 10:00)
- [ ] **Alerte overnight**: revizuire notificari critice generate intre orele 22:00 - 08:00
- [ ] **Capacitate rezervari ziua curenta**: sincronizare cu sistemul de management al meselor
- [ ] **Meniu activ**: confirmare preturi, disponibilitate preparate, optiuni vegetariene/vegane actualizate

### 2.2 Monitorizare Continua (09:00 - 23:00)

**Panou in timp real:**

| Widget | Descriere | Actiune la Anomalie |
|--------|-----------|---------------------|
| Conversatii active | Numar sesiuni live | Alerta la > 15 simultan |
| Timp asteptare mediu | Latenta per client | Escalare la > 5 secunde |
| Intentii nerezolvate | Clasificare esuata | Revizuire imediata |
| Sentiment client | Analiza emotionala | Interventie umana la scor < 3.0 |
| Rezervari confirmate | Conversii in timp real | Verificare dubla la peak hours |

### 2.3 Evening Report (22:00 - 23:00)

**Generare automata:**

- Total conversatii procesate
- Distributie pe canale (WhatsApp, Facebook Messenger, website chat)
- Top 5 intentii solicitate
- Top 3 puncte de esec (failure points)
- Rezervari create vs. anulate vs. modificate
- Feedback clienti cu scor < 3.0 (revizuire manuala obligatorie)

---

## 3. ALERTE SI PRAGURI CRITICE

### 3.1 Nivel CRITIC (Interventie imediata - < 5 minute)

| Conditie | Notificare | Actiune |
|----------|-----------|---------|
| Agent AI offline > 2 minute | SMS + Apel + Slack #critical | Pornire instanta backup, notificare clienti pe canale alternative |
| Rata eroare > 15% in 10 minute | PagerDuty + Sunet | Diagnostic rapid, switch la modul semi-automat |
| API rezervari indisponibil | Email + Slack | Activare proces manual rezervari, informare receptie |
| Scurgere date personale detectata | Toate canalele | Oprire serviciu, incident security, GDPR protocol |

### 3.2 Nivel AVERTIZARE (Interventie in 30 minute)

| Conditie | Notificare | Actiune |
|----------|-----------|---------|
| Timp raspuns > 5 secunde in 15 minute | Slack #alerts | Verificare load, scalare automata sau manuala |
| Rata abandon > 12% in ora | Email + Dashboard | Analiza conversatii esuate, ajustare flow |
| Intentie noua frecventa > 5% din total | Slack #product | Evaluare adaugare intentie in model |
| Scor sentiment mediu < 3.5 in 2 ore | Dashboard highlight | Review conversatii negative, posibila ajustare ton |

### 3.3 Nivel INFORMATIV (Revizuire in ziua urmatoare)

| Conditie | Notificare | Actiune |
|----------|-----------|---------|
| Variatie > 20% volum fata de zi similara | Raport zilnic | Analiza cauza (eveniment, campanie, etc.) |
| Precizie model < 90% pe o intentie specifica | Raport saptamanal | Retraining targeted pe intentia respectiva |

---

## 4. RAPOARTE SAPTAMANALE

### 4.1 Raport Executiv (Luni, 09:00)

Destinatar: Proprietar / Director General

**Continut:**
- Rezumat KPI vs. target saptamanal
- Evolutie comparativa cu saptamana precedenta si aceeasi saptamana anul trecut
- Evenimente semnificative (peak-uri, incidente, lansari)
- Recomandari strategice pentru saptamana urmatoare
- ROI estimat: costuri agent AI vs. costuri personal suplimentar evitat

### 4.2 Raport Operational (Marti, 10:00)

Destinatar: Manager Restaurant + Echipa IT

**Continut detaliat:**

**Sectiunea A: Performanta Conversatii**
- Distributie orara a volumului (identificare ore critice)
- Top 10 intentii cu rata de succes scazuta
- Analiza fallback-uri: cauze si clasificare (tehnic vs. lipsa cunostinte vs. ambiguitate client)

**Sectiunea B: Calitate Serviciu**
- Distributie scoruri CSAT
- Verbatim-uri clienti (selectie reprezentativa pozitiva si negativa)
- Corelatie intre timp raspuns si satisfactie

**Sectiunea C: Impact Business**
- Rezervari generate prin agent vs. alte canale
- Valoare estimata comenzi facilitate
- Rate de no-show la rezervari AI vs. telefonice

**Sectiunea D: Tehnic**
- Incidente si timp de rezolvare (MTTR)
- Utilizare resurse (CPU, memorie, API calls)
- Actualizari model si impact asupra metricilor

### 4.3 Raport Lunar: Review Imbunatatire Model

Destinatar: Echipa AI + Management

- Analiza erori de clasificare (false positive/negative)
- Propuneri noi intentii sau sub-intentii
- Evaluare necesitate retraining complet vs. incremental
- Benchmark competitiv (industria HoReCa Romania)

---

## 5. OPTIMIZARE CONTINUA (proces de imbunatatire)

### 5.1 Ciclu PDCA Adaptat pentru Agent AI

```
PLAN    → Analiza raport saptamanal, identificare oportunitati
DO      → Implementare modificari in mediu de test (staging)
CHECK   → A/B testing pe 10% trafic, validare metrici
ACT     → Deploy productie sau rollback cu documentare invataminte
```

### 5.2 Calendar Optimizare

| Frecventa | Activitate | Responsabil |
|-----------|-----------|-------------|
| Zilnic | Revizuire conversatii esuate (esantion 20) | Operator Senior |
| Saptamanal | Ajustare raspunsuri template, ton, clarificari | Content Manager |
| Bilunar | Retraining intentii cu precizie < 85% | ML Engineer |
| Lunar | Review arhitectura, scalabilitate, costuri | Tech Lead |
| Trimestrial | Evaluare completa provider AI, benchmark alternative | Management + IT |

### 5.3 Sursa Imbunatatiri (Feedback Loop)

1. **Clienti direct**: In-chat rating, comentarii post-conversatie
2. **Operatori umani**: Tag-uri la preluare manuala, note interne
3. **Analiza automata**: Clustering intentii neidentificate, detectie anomalii
4. **Business**: Sezonalitate, evenimente speciale, modificari meniu
5. **Competitie**: Mystery shopping digital, benchmark canale competitori

---

## 6. SEMNALE DE ALARMA (cand sa intervii manual)

### 6.1 Interventie Imediata Oprita (Stop-the-Line)

**Managerul de restaurant sau Tehnicul responsabil trebuie sa preia controlul manual cand:**

| Semnal | Protocol |
|--------|----------|
| Clientul solicita explicit "operator uman" de ≥ 2 ori | Transfer instant, notare motiv in CRM |
| Detectie limbaj ofensator sau situatie conflictuala | Blocare automata + alerta manager, interventie umana in < 1 minut |
| Solicitare rezervare > 20 persoane sau eveniment privat | Transfer receptie, agentul nu gestioneaza contracte complexe |
| Mentionare alergii alimentare severe + ambiguitate meniu | Oprire automata, transfer bucatar-sef sau manager sala |
| Clientul repeta aceeasi intrebare ≥ 3 ori cu formulare diferite | Indicatie clară de esec de intelegere, escalare obligatorie |

### 6.2 Interventie Programata (In urmatoarele ore)

| Semnal | Protocol |
|--------|----------|
| Pattern: ≥ 3 clienti aceeasi intrebare fara raspuns satisfacator in 4 ore | Creare urgenta continut + posibila actualizare live |
| Scor sentiment in scadere continua in interval de 2 ore | Analiza contextuala: eveniment extern? Problema operationala reala? |
| Conversatie > 15 minute fara rezolutie | Timeout politicos cu oferta callback sau rezolvare prioritară |

### 6.3 Interventie Strategica (In urmatoarele zile)

| Semnal | Protocol |
|--------|----------|
| Declin sustinut al ratei de conversie rezervare (> 5% in 2 saptamani) | Workshop cross-functional: marketing, operatiuni, IT |
| Feedback recurent: "as vrea sa pot..." / "de ce nu pot..." | Evaluare feature request, prioritizare roadmap |
| Modificare regulamentare (ex: noi reguli ANPC, GDPR update) | Review compliance, actualizare flow-uri si scripturi |

### 6.4 Checklist Decizie Oprire Temporara Agent AI

Se completeaza in caz de incident major:

- [ ] Incidentul afecteaza > 50% din conversatii sau > 10 clienti simultan
- [ ] Exista risc real de dauna reputationala sau financiara
- [ ] Echipa tehnica confirma ca remedierea dureaza > 30 minute
- [ ] Canal alternativ de comunicare este functional (telefon, email, prezenta fizica)
- [ ] Clientii activi sunt informati proactiv despre situatie
- [ ] Log-ul incidentului este pastrat pentru analiza post-mortem

**Decizie finala:** Manager Operational + Tech Lead (ambele semnaturi necesare)

---

## ANEXE

**A. Contacte Escalare**
- Nivel 1 - Support Tehnic: [intern]
- Nivel 2 - ML Engineer: [intern]
- Nivel 3 - Provider AI Enterprise: [contract]
- Nivel 4 - Management Critic: [proprietar]

**B. Link-uri Dashboard**
- Grafana: [URL intern]
- Platforma AI: [URL provider]
- CRM Rezervari: [URL sistem]

**C. Istoric Versiuni**
- v1.0 - Ianuarie 2025 - Lansare initiala monitorizare

---

*Document aprobat de: _________________ Data: _________________*

*Urmatoarea revizuire programata: [data + 3 luni]*