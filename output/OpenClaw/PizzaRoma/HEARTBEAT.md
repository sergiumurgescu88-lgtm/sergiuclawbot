# HEARTBEAT - PizzaRoma

## Sistem de Monitorizare pentru Agentul AI al Restaurantului

---

## 1. METRICI CHEIE (KPI-uri cu valori țintă)

### Metrici de Conversație și Interacțiune

| Indicator | Valoare Țintă | Frecvență Măsurare |
|-----------|---------------|-------------------|
| Rata de rezolvare la primul contact (FCR) | ≥ 85% | Zilnic |
| Timp mediu de răspuns inițial | ≤ 3 secunde | Real-time |
| Timp mediu de gestionare a unei comenzi | ≤ 4 minute | Zilnic |
| Rata de completare a comenzilor fără transfer uman | ≥ 78% | Zilnic |
| Scor de satisfacție client (CSAT post-interacțiune) | ≥ 4.2/5 | Continuu |
| Rata de abandon al conversației | ≤ 8% | Zilnic |
| Număr mediu de mesaje per conversație | 6-12 mesaje | Săptămânal |

### Metrici de Business și Conversie

| Indicator | Valoare Țintă | Frecvență Măsurare |
|-----------|---------------|-------------------|
| Valoarea medie a comenzii prin agent (AOV) | ≥ 65 RON | Zilnic |
| Rata de conversie din conversație în comandă | ≥ 62% | Zilnic |
| Rata de retenție a clienților recurenți | ≥ 45% | Lunar |
| Numărul de comenzi procesate pe oră (vârf: 18:00-21:00) | ≥ 25/oră | Real-time |
| Reduceri acordate nejustificat | ≤ 2% din comenzi | Zilnic |
| Upselling și cross-selling reușit | ≥ 15% din comenzi | Săptămânal |

### Metrici Tehnice și Operaționale

| Indicator | Valoare Țintă | Frecvență Măsurare |
|-----------|---------------|-------------------|
| Disponibilitate sistem (uptime) | ≥ 99.5% | Continuu |
| Latență API medie | ≤ 150ms | Real-time |
| Rata de erori tehnice (5xx, timeout) | ≤ 0.5% | Real-time |
| Acuratețe înțelegere intenție client (NLU) | ≥ 92% | Zilnic |
| Acuratețe extragere entități (adresă, telefon, produse) | ≥ 95% | Zilnic |

---

## 2. DASHBOARD ZILNIC (ce verifică zilnic)

### Verificare de Dimineață (09:00-09:30)

**Status Sistem:**
- Verificare uptime nocturn și eventuale întreruperi
- Validare conectivitate cu POS restaurant, sistem de livrare, gateway plată
- Testare rapidă: comandă test cu produs fictiv (anulată automat)
- Verificare stocuri sincronizate corect în baza de cunoștințe

**Indicatori Overnight:**
- Comenzi procesate în intervalul 22:00-10:00 (program precomenzi)
- Erori raportate automat pe email/SMS
- Feedback negativ primit (sub 3 stele) necesitând follow-up

### Monitorizare Continuă (09:30-23:00)

**Panel Principal - Vizualizare Real-Time:**
```
┌─────────────────────────────────────────┐
│  COMENZI ASTĂZI: 47    |    VÂNZĂRI: 3,247 RON  │
│  CONVERSAȚII ACTIVE: 8  |    COZI AȘTEPTARE: 2   │
│  TIMP MEDIU RĂSPUNS: 1.8s (🟢 OK)       │
│  SATISFACȚIE SESIUNE: 4.6/5 (🟢 OK)     │
└─────────────────────────────────────────┘
```

**Verificări la Fiecare 2 Ore:**
- Analiză conversații marcate cu "necesită atenție" de către sistem
- Verificare comenzi cu valoare anormală (prea mici: <20 RON sau prea mari: >300 RON)
- Monitorizare pattern-uri de întrebări frecvente noi (semnal de gap în cunoștințe)
- Validare promoții active și mesaje corect transmise

### Verificare de Seară (22:30-23:00)

- Rezumat zilnic: comenzi, venituri, incidente
- Arhivare conversații pentru analiză
- Pregătire raport pentru management
- Activare notificări pentru precomenzi dimineață

---

## 3. ALERTE ȘI PRAGURI CRITICE

### Nivel CRITIC (Intervenție Imediată)

| Condiție | Canal Alertare | Timp de Răspuns Așteptat |
|----------|---------------|-------------------------|
| Uptime sistem < 95% în ultima oră | SMS + Apel telefonic + Slack | 5 minute |
| Zero comenzi procesate în ultima oră (interval activ) | SMS + Apel telefonic | 10 minute |
| Rata erori > 5% în ultimele 15 minute | Slack + SMS | 15 minute |
| Plată procesată eronat (sumă dublată, client debitat greșit) | Apel telefonic imediat | Instant |
| Date personale client expuse în log (GDPR breach) | Apel telefonic + Email securitate | Instant |

### Nivel AVERTIZARE (Intervenție în 1-2 Ore)

| Condiție | Canal Alertare | Acțiune |
|----------|---------------|---------|
| CSAT sesiune curentă < 3.0/5 timp de 30 minute | Slack | Analiză conversații, posibilă ajustare |
| Timp mediu răspuns > 8 secunde timp de 20 minute | Slack | Verificare load, scalare automată |
| Rata abandon conversație > 15% în ultima oră | Email + Slack | Investigare puncte de fricțiune |
| Produs popular marcat "indisponibil" eronat | Slack | Verificare stoc real |
| 3+ feedback-uri negative identice pe aceeași temă | Email | Identificare bug sau informație eronată |

### Nivel INFORMARE (Revedere Zilnică/Săptămânală)

| Condiție | Canal Alertare |
|----------|---------------|
| AOV sub țintă 3 zile consecutive | Email zilnic |
| Trend descendent upselling | Raport săptămânal |
| Creștere întrebări despre produs nou | Email zilnic |

---

## 4. RAPOARTE SĂPTĂMÂNALE

### Raport Operațional (Luni, 08:00)

**Distribuit către:** Manager Restaurant, Manager Operațiuni

**Conținut:**
- Total comenzi AI vs. comenzi telefonice vs. comenzi aplicație
- Comparativ săptămâna precedentă (trend)
- Ore de vârf și capacitate de procesare
- Erori critice și timpi de rezolvare
- Starea sistemelor integrate

### Raport Experiență Client (Miercuri, 10:00)

**Distribuit către:** Manager Marketing, Manager Restaurant

**Conținut:**
- Analiză CSAT detaliată pe categorii (viteză, acuratețe, politețe)
- Word cloud din feedback text liber
- Top 5 puncte de frustrare identificate
- Top 5 momente de deliciu (surprise and delight)
- Segmentare: clienți noi vs. recurenți vs. reactivați

### Raport Tehnic și Îmbunătățire (Vineri, 14:00)

**Distribuit către:** Echipa Tehnică, Product Owner

**Conținut:**
- Metrici NLU: intenții confundate frecvent, entități ratate
- Conversații eșuate: clasificare pe cauză (nu a înțeles, nu a putut, client insatisafcut)
- Oportunități de antrenare identificate (minimum 50 exemple noi/săptămână)
- Performance API și recomandări optimizare
- Datorie tehnică și prioritizare

### Raport Business (Vineri, 16:00)

**Distribuit către:** Proprietar, Director General

**Conținut:**
- Venituri generate prin canal AI și contribuție la total
- Impact promoții: cost vs. venit incremental
- Comparativ cu obiective lunare
- Proiecție și recomandări strategice

---

## 5. OPTIMIZARE CONTINUĂ (proces de îmbunătățire)

### Ciclu Săptămânal de Învățare

```
LUNI      → Analiză date săptămâna trecută
MARȚI     → Workshop intern: 3 lucruri care au funcționat, 3 de îmbunătățit
MIERCURI  → Definire experimente A/B (maxim 2 simultan)
JOI       → Implementare modificări în mediu de test
VINERI    → Lansare experimente, baseline measurement
```

### Proces de Adăugare în Baza de Cunoștințe

1. **Identificare:** Conversații nerezolvate sau rezolvate incorect
2. **Extragere:** Minimum 3 exemple reale de formulări client
3. **Redactare:** Răspuns validat de manager restaurant (ton, acuratețe, conformitate)
4. **Testare:** Verificare în mediu sandbox cu 5 variații
5. **Deploy:** Lansare graduală (10% → 50% → 100% trafic)
6. **Monitorizare:** Urmărire metrici 48 ore post-lansare

### Calendar de Revizuire

| Componentă | Frecvență | Responsabil |
|------------|-----------|-------------|
| Meniu și prețuri | La fiecare modificare | Manager Restaurant |
| Informații alergeni și ingrediente | Lunar | Bucătar Șef |
| Timpi estimați livrare | Săptămânal | Manager Livrări |
| Răspunsuri la întrebări frecvente | Săptămânal | Echipa AI + Manager |
| Tone of voice și personalitate | Trimestrial | Marketing |
| Model NLU fundamental | Semestrial | Echipa Tehnică |

### Experimente Active Permanente

- **Variantă A/B răspunsuri:** Testare formulări pentru upselling ("Doriți și o băutură?" vs. "Completează perfect cu...")
- **Timing promoții:** Moment optim în conversație pentru oferte
- **Proactiv vs. reactiv:** Agentul inițiază sugestii vs. așteaptă cerere client

---

## 6. SEMNALE DE ALARMĂ (când să intervii manual)

### Intervenție Imediată Oprită (Stop-the-Line)

| Semnal | Ce să faci |
|--------|-----------|
| Client raportează simptome alimentare presupus legate de produs | Preia imediat, escaladează la manager, documentează toate detaliile |
| Agentul confirmă o comandă cu adresă incompletă sau ambiguă | Verificare manuală, contact telefonic client înainte de preparare |
| Discrepanță între suma comunicată client și suma încasată | Blochează comanda, investighează, contactează client |
| Agentul "halucinează" produs inexistent în meniu | Oprește imediat, verifică integritatea bazei de date, retrimite meniul validat |

### Intervenție în Urma Analizei

| Semnal | Ce să faci |
|--------|-----------|
| Pattern: 5+ clienți întreabă același lucru într-o zi | Adaugă răspuns în baza de cunoștințe în aceeași zi |
| Client recurent comportament anormal (comandă radical diferită, limbaj confuz) | Verificare istoric, posibil contact uman de confirmare |
| Review negativ menționează interacțiune cu agentul | Analiză conversație completă, răspuns management, lecție învățată |
| Comandă cu 10+ produse identice (posibil test sau eroare) | Verificare telefonică obligatorie |

### Indicatori de "Drift" al Agentului (Degradare Graduală)

| Semnal | Semnificație |
|--------|-------------|
| Creștere lentă a timpului mediu de conversație (peste 2 săptămâni) | Agentul devine indecis sau verbose |
| Scădere graduală a ratei de rezolvare fără transfer | Acumulare de cazuri edge-case nerezolvate |
| Creștere a folosirii formulărilor generice ("Vă rugăm să așteptați") | Degradare calitate răspunsuri, posibil overfitting |
| Clienți care cer explicit "vreau să vorbesc cu un om" mai des | Pierdere încredere în agent |

### Verificare de Sănătate Lunară (Health Check)

**Teste Manuale Obligatorii:**
- 10 scenarii de conversație tipice (comandă standard, modificare, anulare, reclamație)
- 5 scenarii de stres (client nervos, adresă incompletă, produs terminat)
- 3 scenarii noi (situații apărute în ultima lună)

**Scor de Sănătate:** Fiecare scenariu notat 1-5. Scor total < 40/50 declanșează audit complet.

---

## Anexă: Contacte și Escaladare

| Rol | Contact | Disponibilitate |
|-----|---------|---------------|
| Manager Tehnic Agent AI | [tel] | 24/7 pentru critic |
| Manager Restaurant PizzaRoma | [tel] | 09:00-23:00 |
| Suport Platformă AI | [email] | Ticket, SLA 4 ore |
| Responsabil Date Personale (DPO) | [tel] | L-V 09:00-18:00 |

---

*Document revizuit: [data]*
*Următoarea revizuire: [data + 3 luni]*
*Versiune: 1.0*