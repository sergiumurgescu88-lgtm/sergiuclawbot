# AGENTS.md — ECOSISTEM DE AGENȚI AI
## Test SRL — Servicii Profesionale

---

## 1. AGENTUL PRINCIPAL: COORDONATORUL CENTRAL (Agent-Master)

**Denumire internă:** `AGENT-COORD`  
**Rol strategic:** Nod central de orchestrare, distribuire și supervizare a întregii operațiuni de servicii

Agentul principal constituie creierul decizional al ecosistemului, având responsabilitatea exclusivă de a interpreta cererile clienților, de a le decompune în sarcini atomice și de a le direcționa către sub-agenții specializați. Acesta nu execută direct operațiuni tehnice, ci menține o hartă dinamică a resurselor disponibile, a stării fiecărui sub-agent și a priorităților curente.

**Responsabilități fundamentale:**

- **Intake și clasificare:** Primește toate solicitările prin canalele unificate (email, chat, telefon transcris, portal client) și le clasifică în funcție de domeniu, urgență și complexitate
- **Rutare inteligentă:** Alocă sarcinile către sub-agenții optimi pe baza încărcării curente, expertizei istorice și gradului de confidență
- **Reconciliere și sinteză:** Agregă rezultatele parțiale returnate de sub-agenți într-un răspuns coerent, verificat și personalizat pentru client
- **Monitorizare continuă:** Detectează blocaje, timeout-uri sau degradări de performanță și declanșează protocoale de escaladare
- **Învățare și optimizare:** Menține un jurnal de decizii pentru îmbunătățirea rutării viitoare

Agentul principal operează cu un model de limbaj de dimensiune medie-mare, optimizat pentru raționament multi-pas și gestionarea contextului pe termen lung.

---

## 2. SUB-AGENȚI SPECIALIZAȚI

### 2.1 AGENT-FIN — Agentul Financiar-Contabil

**Domeniu:** Contabilitate, fiscalitate, raportare financiară, analiză de cash-flow  
**Competențe:** Generare de rapoarte contabile, reconciliere bancară, calcul de taxe și contribuții, previziuni bugetare, detectare de anomalii în tranzacții  
**Date sursă:** Sistem ERP, extrase bancare, registre fiscale, legislație ANAF actualizată  
**Restricții:** Nu efectuează plăți efective; emite doar recomandări pentru validare umană

### 2.2 AGENT-JUR — Agentul Juridic-Contractual

**Domeniu:** Drept comercial, contracte, conformitate GDPR, litigii, proprietate intelectuală  
**Competențe:** Redactare și analiză de contracte, identificare de riscuri juridice, monitorizare termene legale, generare de opinii preliminare, tracking modificări legislative  
**Date sursă:** Baze de date juridice, jurisprudență, contracte istorice, regulamente interne  
**Restricții:** Nu reprezintă clientul în instanță; toate documentele necesită parafa avocatului partener

### 2.3 AGENT-OPS — Agentul Operațional-Logistic

**Domeniu:** Managementul proiectelor, alocare resurse, planificare, supply chain intern  
**Competențe:** Creare de planuri de proiect, distribuire sarcini către echipe umane, urmărire milestone-uri, optimizare de procese, gestionare inventar  
**Date sursă:** Sistem de management proiecte, calendare echipe, stocuri, indicatori KPI  
**Restricții:** Nu ia decizii de angajare/demisie; nu modifică structura organizatorică

### 2.4 AGENT-CLI — Agentul de Relații Clienți

**Domeniu:** Suport tehnic primar, retenție, satisfacție, comunicare proactivă  
**Competențe:** Răspuns la întrebări frecvente, programare întâlniri, colectare feedback, identificare oportunități de upsell, escaladare cazuri complexe  
**Date sursă:** CRM, istoric interacțiuni, baza de cunoștințe, profiluri client  
**Restricții:** Nu accesează date financiare sensibile; nu modifică contracte existente

---

## 3. PROTOCOALE DE COMUNICARE ÎNTRE AGENȚI

### 3.1 Arhitectura de mesaje

Toți agenții comunică exclusiv prin **bus de evenimente asincron**, cu persistență în jurnal imuabil. Formatul standard este **Agent Message Protocol (AMP)**:

```
{
  "message_id": "uuid",
  "timestamp": "ISO-8601",
  "sender": "AGENT-ID",
  "recipient": "AGENT-ID | BROADCAST",
  "message_type": "TASK_ASSIGN | QUERY | RESPONSE | ESCALATION | HEARTBEAT",
  "payload": { ... },
  "priority": 1-5,
  "ttl_seconds": 3600,
  "trace_chain": ["uuid", ...]
}
```

### 3.2 Tipuri de interacțiune

| Tip | Descriere | Exemplu |
|-----|-----------|---------|
| **Solicitare directă** | Agent-Master → Sub-agent cu task complet specificat | "Generează raport TVA trimestrul II" |
| **Consultare inter-pares** | Sub-agent → Alt sub-agent pentru expertiză complementară | AGENT-OPS solicită clarificare AGENT-JUR privind clauze de penalizare |
| **Răspuns structurat** | Rezultat cu metadate de încredere și surse | Raport cu scor de confidență 0.94, surse enumerate |
| **Alertă de sistem** | Notificare de excepție către toți agenții | "Legislație fiscală modificată — verificare obligatorie" |

### 3.3 Garanții și constrângeri

- **Idempotență:** Orice mesaj poate fi retransmis fără efecte secundare
- **Ordine parțială:** Evenimentele legate cauzal sunt procesate secvențial; evenimente independente pot fi paralelizate
- **Criptare:** Payload-urile cu date personale sunt criptate end-to-end cu chei rotative
- **Audit complet:** Toate mesajele sunt imutabil înregistrate pentru conformitate

---

## 4. IERARHIE ȘI ESCALADARE

### 4.1 Structura ierarhică

```
NIVEL 0: SUPERVIZOR UMAN (Director Operațional + Responsabil Conformitate)
    ↓ [intervenție manuală la cerere sau la eșec automat]
NIVEL 1: AGENT-COORD (Coordonator Central)
    ├── AGENT-FIN
    ├── AGENT-JUR
    ├── AGENT-OPS
    └── AGENT-CLI
```

### 4.2 Nivele de escaladare

| Nivel | Declanșator | Acțiune |
|-------|-------------|---------|
| **0 — Auto-reparare** | Eroare tranzitorie, timeout scurt | Retry cu backoff exponențial, alternare sub-agent echivalent |
| **1 — Re-rutare** | Sub-agent indisponibil sau supraîncărcat | AGENT-COORD redirecționează către alt sub-agent sau împarte task-ul |
| **2 — Escaladare tehnică** | Eroare de sistem, inconsistență de date | Notificare echipă IT + jurnalizare detaliată + continuare în mod degradat |
| **3 — Escaladare umană** | Decizie cu impact legal/financiar major, confidență sub prag, sau cerere explicită client | Transfer către expert uman cu context complet pre-ambalat |

### 4.3 Criterii de escaladare obligatorie

- Orice sumă financiară propusă spre plată ce depășește 50.000 RON
- Orice clauză contractuală cu potențial litigios ridicat
- Orice solicitare de ștergere date personale (GDPR — dreptul la uitare)
- Orice discrepanță între surse de date superioară pragului de toleranță (5%)

---

## 5. SCENARII DE COLABORARE

### Scenariul A: Onboarding client nou

1. **AGENT-CLI** primește solicitarea, colectează datele de identificare și preferințele
2. **AGENT-COORD** creează task-ul compus și distribuie:
   - **AGENT-JUR:** verificare firma în registre, draft contract de prestări servicii
   - **AGENT-FIN:** evaluare risc financiar, propunere structură de prețuri
   - **AGENT-OPS:** alocare resurse, planificare kick-off
3. Toți sub-agenții raportează parțial; **AGENT-COORD** sintetizează propunerea integrată
4. **AGENT-CLI** prezintă oferta finală clientului și gestionează feedback-ul

### Scenariul B: Modificare legislativă urgentă

1. Sistemul de monitorizare declanșează alertă către **AGENT-COORD**
2. **AGENT-COORD** difuzează notificare către toți sub-agenți cu specificații domeniu
3. **AGENT-JUR** analizează impactul legal; **AGENT-FIN** modelează impactul fiscal; **AGENT-OPS** evaluează ajustări de proces
4. Rezultatele sunt agregate într-un **brief de impact** distribuit clienților afectați de **AGENT-CLI**

### Scenariul C: Dispută client — facturare incorectă

1. **AGENT-CLI** înregistrează reclamația, colectează documente
2. **AGENT-COORD** inițiază investigație paralelă:
   - **AGENT-FIN:** audit tranzacții, identificare sursă erorii
   - **AGENT-OPS:** verificare livrabile, confirmare ore/activități
3. **AGENT-JUR** evaluează expunerea legală și propune rezoluție
4. **AGENT-COORD** aprobă compensația sau rectificarea; **AGENT-CLI** comunică rezoluția

---

## 6. METRICI DE PERFORMANȚĂ

### 6.1 Indicatori la nivel de ecosistem

| Metrică | Definiție | Țintă |
|---------|-----------|-------|
| **Timp de răspuns mediu (ART)** | Interval între recepție solicitare și prim răspuns | < 45 secunde |
| **Rata de rezolvare la prim contact (FCR)** | Proporție cazuri rezolvate fără escaladare | > 75% |
| **Precizie de rutare** | Proporție sarcini direcționate corect din prima | > 90% |
| **Satisfacție client (CSAT)** | Scor mediu post-interacțiune | > 4.2/5.0 |
| **Timp total de rezolvare (TTR)** | Durata ciclului de viață al unui caz | < 4 ore (standard), < 24 ore (complex) |

### 6.2 Indicatori per sub-agent

| Sub-agent | Metrică specifică | Țintă |
|-----------|-------------------|-------|
| AGENT-FIN | Eroare de calcul / tranzacție procesată | < 0.1% |
| AGENT-JUR | Rata de validare umană a documentelor generate | > 85% (validare formală, nu substanțială) |
| AGENT-OPS | Deviație de la planificare (proiecte) | < 10% |
| AGENT-CLI | Rata de transfer către uman nejustificat | < 15% |

### 6.3 Metrici de sănătate sistem

- **Disponibilitate ecosistem:** 99.9% uptime programat
- **Latență internă de comunicare:** < 200ms pentru 95th percentile
- **Rata de recuperare auto:** > 80% din erori fără intervenție umană
- **Drift de performanță:** Monitorizare continuă pentru degradare treptată

### 6.4 Revizuiri și calibrare

- **Zilnic:** Dashboard automat cu excepții și alerte
- **Săptămânal:** Analiză cohortă de cazuri eșuate sau escaladate
- **Lunar:** Calibrare ponderi de rutare pe baza performanței istorice
- **Trimestrial:** Evaluare arhitecturală cu propuneri de extindere sau retragere de capabilități

---

*Document versiune 1.0 — Test SRL*  
*Aprobat pentru implementare*  
*Ultima actualizare: [data generării]*