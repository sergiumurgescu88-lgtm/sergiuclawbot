# HEARTBEAT.md

## Monitorizare Agent AI — Test SRL (Servicii)

---

## 1. METRICI CHEIE (KPI-uri cu valori țintă)

### Eficiență Operațională

| Metrică | Valoare Țintă | Frecvență Măsurare |
|---------|---------------|-------------------|
| Timp mediu de răspuns (MTTR) | < 2 secunde | Real-time |
| Rată de rezolvare la primul contact | ≥ 85% | Zilnic |
| Conversații procesate pe oră | ≥ 120 | Orar |
| Eșecuri tehnice (erori 500/timeout) | < 0.5% | Zilnic |

### Calitate Interacțiune

| Metrică | Valoare Țintă | Frecvență Măsurare |
|---------|---------------|-------------------|
| Scor de satisfacție client (CSAT) | ≥ 4.2 / 5 | Per conversație |
| Rată de escaladare către uman | < 15% | Zilnic |
| Intenție detectată corect (accuracy) | ≥ 92% | Săptămânal |
| Sentiment negativ neadresat | < 8% | Zilnic |

### Securitate și Conformitate

| Metrică | Valoare Țintă | Frecvență Măsurare |
|---------|---------------|-------------------|
| Tentative de prompt injection blocate | 100% | Real-time |
| Date personale expuse accidental | 0 | Continuu |
| Incidente de securitate confirmate | 0 | Continuu |
| Conformitate GDPR — solicitări ștergere | < 24h | Per caz |

### Performanță Business

| Metrică | Valoare Țintă | Frecvență Măsurare |
|---------|---------------|-------------------|
| Reducere cost suport vs. canal uman | ≥ 40% | Lunar |
| Venituri generate prin upsell/cross-sell | ≥ 15.000 RON/lună | Lunar |
| Retenție clienți serviți de AI | ≥ 78% | Trimestrial |

---

## 2. DASHBOARD ZILNIC (ce verifică zilnic)

### Rutina de Dimineață (08:00–08:30)

**Responsabil:** Inginer de monitorizare AI

1. **Verificare stare sistem**
   - Status API: `https://api-ai.testsrl.ro/health`
   - Latență p95 în ultimele 24h
   - Disponibilitate (uptime) — target 99.9%

2. **Analiză conversații nocturne**
   - Volum total și distribuție pe ore
   - Top 10 intenții nerecunoscute
   - Conversații abandonate — investigare cauză

3. **Review alerte automate**
   - Confirmare rezolvare sau escaladare
   - Fals pozitive/negative din sistemul de clasificare

### Rutina de Seară (18:00–18:30)

1. **Rezumat zilnic**
   - Comparativ cu ziua precedentă și media săptămânală
   - Identificare anomalii statistice (> 2 deviații standard)

2. **Pregătire raport pentru management**
   - KPI-urile zilnice într-un singur ecran
   - Decizii necesare pentru ziua următoare

### Instrumente Dashboard

- **Grafana** — vizualizare metrici tehnici
- **Custom Admin Panel** — analiză conversații
- **Slack #ai-alerts** — notificări în timp real

---

## 3. ALERTE ȘI PRAGURI CRITICE

### Nivel CRITIC (pagină imediată, 24/7)

| Condiție | Acțiune Automată | Notificare |
|----------|------------------|------------|
| Uptime < 95% în 5 minute | Failover către instanță secundară | Telefon + SMS: On-call engineer |
| Latență p99 > 10 secunde | Throttling cereri, coadă de așteptare | Telefon + SMS: On-call engineer |
| Erori 5xx > 5% în 10 minute | Rollback la versiunea anterioară | Telefon + SMS: On-call engineer |
| Detectare prompt injection > 3/minut | Blocare IP sursă, log forenzic | Telefon + SMS: On-call engineer + Security |

### Nivel MAJOR (notificare în 15 minute)

| Condiție | Acțiune Automată | Notificare |
|----------|------------------|------------|
| CSAT < 3.5 în ultimele 50 conversații | Flag pentru review manual | Slack + Email: Echipa AI |
| Escaladare umană > 25% în 4 ore | Sugestie ajustare model | Slack + Email: Echipa AI |
| Intenție "plângere formală" > 10/zi | Raport către management | Email: Manager operațiuni |

### Nivel INFORMAȚIONAL (raportare zilnică)

| Condiție | Acțiune | Notificare |
|----------|---------|------------|
| Volum > 150% față de media | Pregătire scalare automată | Dashboard + Email zilnic |
- Nouă intenție detectată frecvent | Sugestie antrenare model | Raport săptămânal |

---

## 4. RAPOARTE SĂPTĂMÂNALE

### Structură Raport (vinerea, ora 16:00)

**Secțiunea A: Performanță Tehnică**
- Uptime săptămânal și incidente cu durata de indisponibilitate
- Evoluție latență (grafic p50, p95, p99)
- Consum resurse: CPU, memorie, GPU (dacă aplicabil)
- Costuri infrastructură vs. buget

**Secțiunea B: Calitate Conversație**
- Distribuție scoruri CSAT (histogramă)
- Analiză conversații cu scor < 3: categorizare cauze
- Progres în acuratețea intențiilor (comparativ cu săptămâna trecută)
- Top 20 întrebări fără răspuns satisfăcător

**Secțiunea C: Impact Business**
- Conversii măsurabile atribuite agentului AI
- Economii estimate vs. cost canal uman
- Tendință retenție clienți segment AI vs. non-AI

**Secțiunea D: Îmbunătățiri Implementate**
- Ce s-a livrat în săptămâna curentă
- Experimente A/B în desfășurare
- Plan săptămâna viitoare

### Distribuție
- **CEO, CTO:** Sumar executiv (1 pagină)
- **Echipa AI:** Raport complet cu date brute
- **Departament Operațiuni:** Secțiunile B și C

---

## 5. OPTIMIZARE CONTINUĂ (proces de îmbunătățire)

### Ciclu PDCA Adaptat pentru AI

**PLAN (Luni)**
- Review raport săptămânal
- Prioritizare oportunități îmbunătățire
- Definire experimente A/B (maxim 3 paralele)

**DO (Marți–Joi)**
- Implementare modificări în mediu de staging
- Testare cu set de date istorice (regresie)
- Deploy gradual: 5% → 25% → 50% → 100% trafic

**CHECK (Vineri)**
- Evaluare metrici experiment vs. control
- Validare statistică (p < 0.05 sau prag practic definit)
- Decizie: promovare, iterare sau abandon

**ACT (Vineri după-amiază)**
- Documentare lecții învățate în `AI_KNOWLEDGE_BASE.md`
- Actualizare modele de baseline
- Planificare ciclu următor

### Proces de Retraining Model

| Declanșator | Frecvență | Responsabil |
|-------------|-----------|-------------|
| Acuratețe intenții < 90% în 3 zile consecutive | Ad-hoc | Data Scientist |
| Acumulare 500+ conversații etichetate manual | Bilunar | Data Scientist |
| Lansare serviciu nou sau sezon cu pattern diferit | Ad-hoc | Product Manager + Data Scientist |
| Review trimestrial planificat | Trimestrial | Echipa completă AI |

### Benchmark Extern
- Participare trimestrială la benchmark-uri industrie (dacă disponibile)
- Comparare cu soluții competitive prin mystery shopping

---

## 6. SEMNALE DE ALARMĂ (când să intervii manual)

### Intervenție Imediată Oprită

| Semnal | Cauză Probabilă | Acțiune |
|--------|-----------------|---------|
| Răspunsuri repetitive identice (> 5 la rând) | Loop în logica conversațională | Oprire serviciu, investigare, hotfix |
| Răspunsuri cu conținut neadecuat (toxic, ilegal, discriminatory) | Corupere model sau prompt injection reușit | Oprire serviciu, investigare legală, notificare DPO |
| Refuz sistematic să proceseze anumiți clienți | Bias detectat sau filtru defect | Oprire serviciu, audit complet |
| Solicitări de plată sau date bancare în conversație | Compromitere securitate sau phishing | Oprire serviciu, incident securitate, notificare autorități |

### Intervenție în 4 Ore

| Semnal | Cauză Probabilă | Acțiune |
|--------|-----------------|---------|
| CSAT în scădere accelerată (> 0.3 puncte în 2 zile) | Schimbare neașteptată comportament clienți sau degradare model | Analiză root cause, posibil rollback |
| Creștere bruscă volum "nu înțeleg" | Lansare campanie marketing fără notificare echipă AI | Adăugare rapidă intenții, comunicare internă |
| Escaladare umană pentru aceeași problemă > 20% | Soluția AI insuficientă pentru caz respectiv | Design flow specializat sau delegare completă uman |

### Intervenție în 24 Ore

| Semnal | Cauză Probabilă | Acțiune |
|--------|-----------------|---------|
| Scădere graduală utilizare voluntară | Percepție negativă consolidată | Research calitativ clienți, redesign experiență |
| Creștere cost per conversație | Ineficiență tehnică sau model supradimensionat | Optimizare arhitectură, review furnizori |

### Escaladare Către Management

- Orice incident cu potențial mediatizare negativă
- Depășire buget cu > 20% fără aprobare prealabilă
- Conflict între metrici (ex: creștere eficiență, scădere satisfacție)

---

*Document actualizat: [data ultimei revizuiri]*
*Responsabil mentenanță: [nume, rol]*
*Următoarea revizuire programată: [data]*