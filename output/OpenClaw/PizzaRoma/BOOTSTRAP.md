# BOOTSTRAP.md — Ghid de Lansare pentru Agentul AI PizzaRoma

## 1. CHECKLIST PRE-LANSARE (20+ itemi)

### Infrastructură Tehnică
- [ ] **1.1** Serverele de producție configurate cu auto-scaling (minimum 2 instanțe active)
- [ ] **1.2** Certificat SSL valid instalat și testat (HTTPS obligatoriu pentru toate endpoint-urile)
- [ ] **1.3** Baza de date de producție populată cu meniul complet, prețurile actualizate și stocurile reale
- [ ] **1.4** Conexiunea la sistemul POS (point-of-sale) verificată și sincronizată bidirecțional
- [ ] **1.5** Integrarea cu serviciul de plată online (Stripe/Romcard) testată în modul sandbox

### Conținut și Cunoștințe
- [ ] **1.6** Baza de cunoștințe a agentului încărcată cu 100% din întrebările frecvente (FAQ)
- [ ] **1.7** Informații despre alergeni și ingrediente validate de către bucătar-șef
- [ ] **1.8** Programul de funcționare actualizat pentru toate locațiile (inclusiv sărbători)
- [ ] **1.9** Zonele de livrare definite cu precizie (coduri poștale, timpi estimați, costuri)
- [ ] **1.10** Promoțiile active și codurile de reducere configurate cu date de expirare

### Securitate și Conformitate
- [ ] **1.11** Politica GDPR implementată — flux de ștergere a datelor la cerere (dreptul la uitare)
- [ ] **1.12** Jurnal de audit activat pentru toate conversațiile și tranzacțiile
- [ ] **1.13** Autentificare cu roluri pentru administratori (minimum: super-admin, operator, viewer)
- [ ] **1.14** Backup automat zilnic configurat cu retenție de 30 de zile
- [ ] **1.15** Penetration test de bază efectuat (SQL injection, XSS, rate limiting)

### Operațional și Uman
- [ ] **1.16** Echipa de livratori notificată despre fluxul de comenzi noi (notificări push/SMS)
- [ ] **1.17** Cel puțin 2 operatori umani instruiți pentru preluare escaladări (tura zi/noapte)
- [ ] **1.18** Procedură documentată pentru "agentul nu știe" → transfer către operator uman
- [ ] **1.19** Test de acceptanță efectuat cu minimum 5 comenzi reale de test (plătite și anulate)
- [ ] **1.20** Pagină de status publică configurată (status.pizzaroma.ro) pentru transparență incidente
- [ ] **1.21** Notificări SMS/email pentru echipa tehnică la detectare erori critice (PagerDuty/AlertManager)
- [ ] **1.22** Document "Ce face agentul vs. ce face omul" aprobat de management și comunicat echipei

---

## 2. PRIMELE 24 DE ORE (Plan Orar)

| Ora | Activitate | Responsabil | Criteriu de Succes |
|:---|:---|:---|:---|
| **00:00–02:00** | Lansare "silent" — agent activ doar pentru 5% din trafic, monitorizare intensivă | DevOps | Zero erori 500, latență <2s |
| **02:00–06:00** | Perioadă de observare, fără intervenții majore, doar hotfix-uri critice | On-call engineer | Niciun incident P1 |
| **06:00–08:00** | Creștere treptată la 15% trafic, verificare funcționare corectă în orele de vârf matinale | DevOps + QA | Conversii reale procesate cu succes |
| **08:00–10:00** | Briefing echipei operaționale, confirmare sincronizare cu bucătărie | Manager locație | Timp de preparare estimat corect |
| **10:00–12:00** | Expansiune la 50% trafic, activare notificări proactive pentru echipă | DevOps | Alerte false <5% |
| **12:00–14:00** | **PRIMUL VÂRF CRITIC** — 100% trafic, toate mâinile pe punte | Toată echipa | Timp mediu de răspuns agent <3s |
| **14:00–16:00** | Analiză post-vârf, identificare blocaje, ajustări rapide | Product + Tech | Lista de îmbunătățiri documentată |
| **16:00–18:00** | Pregătire al doilea vârf, testare scenarii edge-case (comenzi complexe, modificări) | QA + Operatori | Scenarii testate cu succes |
| **18:00–22:00** | **AL DOILEA VÂRF CRITIC** — monitorizare continuă, intervenție imediată | Toată echipa | Rată de finalizare comandă >95% |
| **22:00–24:00** | Primul raport zilnic, documentare lecții învățate, planificare ziua 2 | Product Manager | Raport distribuit stakeholderilor |

---

## 3. PRIMA SĂPTĂMÂNĂ (Obiective Zilnice)

| Zi | Obiectiv Principal | Metrică Țintă |
|:---|:---|:---|
| **Ziua 1** | Stabilitate fundamentală | Uptime 99.9%, zero incidente de securitate |
| **Ziua 2** | Optimizare latență | Timp mediu de răspuns <1.5 secunde |
| **Ziua 3** | Rafinare înțelegere limbaj natural | Rata de rezolvare fără escaladare >80% |
| **Ziua 4** | Testare scenarii de stres | Funcționare corectă la 3x trafic normal |
| **Ziua 5** | Feedback primii clienți reali | NPS colectat de la minimum 50 clienți |
| **Ziua 6** | Iterație bazată pe feedback | Top 3 probleme identificate rezolvate |
| **Ziua 7** | Raport săptămânal și planificare sprint 2 | Document de evoluție aprobat de management |

---

## 4. PRIMA LUNĂ (Milestone-uri)

| Săptămâna | Milestone | Indicatori Cheie |
|:---|:---|:---|
| **Săptămâna 1–2** | **"Agentul supraviețuiește"** | Uptime >99.5%, rata de eroare <1%, toate comenzile procesate fără pierderi financiare |
| **Săptămâna 3** | **"Agentul învață"** | Implementare sistem de învățare din conversații (feedback loop operatori), creștere cu 15% a răspunsurilor corecte din prima |
| **Săptămâna 4** | **"Agentul scalează"** | Capacitate demonstrată de a gestiona 2x volumul zilei de lansare fără degradare, primul A/B test de personalizare activat |

**Milestone transversal lună 1:** Obținerea explicită a consimțământului GDPR pentru 100% din noile conversații, cu audit trail complet.

---

## 5. TESTARE ȘI VALIDARE

### Teste Automate (CI/CD Pipeline)
- **Unit tests:** >90% coverage pentru modulele de procesare comandă
- **Integration tests:** Verificare end-to-end pentru fiecare integrare externă (POS, plată, SMS)
- **Contract tests:** Validare API cu fiecare furnizor înainte de fiecare deploy

### Teste Manuale
- **"Mystery shopper" digital:** 10 scenarii săptămânale executate de echipa QA (ex: client furios, comandă ambiguă, cerere de anulare)
- **Teste de accesibilitate:** Funcționare corectă cu screen reader, contrast vizual adecvat

### Validare Business
- **Reconciliere zilnică:** Comparare comenzi agent vs. comenzi înregistrate în POS vs. încasări
- **Verificare bucătărie:** Confirmare că instrucțiunile transmise de agent sunt pregătibile fără interpretare

---

## 6. ROLLBACK PLAN

### Declanșare
Rollback-ul se activează automat sau manual la:
- Uptime <95% în interval de 15 minute
- Eșec la procesarea plăților >1% din tranzacții
- Scurgere de date personale (orice incident de securitate confirmat)
- Decizie explicită a Incident Commander

### Procedură de Rollback (Timp țintă: <5 minute)

| Pas | Acțiune | Durată Estimată |
|:---|:---|:---|
| 1 | Activare flag dezactivare agent (`/emergency/disable`) | 10 secunde |
| 2 | Redirecționare trafic către formularul clasic de comandă + număr telefon | 20 secunde |
| 3 | Notificare automată: echipa tehnică, management, operatori call center | 30 secunde |
| 4 | Păstrare conversații active în coadă de procesare (fără pierderi) | 1 minut |
| 5 | Restaurare versiune stabilă anterioară (blue-green deployment) | 2 minute |
| 6 | Verificare sănătate sistem, reactivare treptată | 1 minut |

### Comunicare în Criză
- **Clienți:** Banner pe site + mesaj în chat: *"Agentul nostru AI face o pauză scurtă. Comandați la [telefon] sau completați formularul."*
- **Intern:** Canal Slack #incidente-pizzaroma, update la fiecare 10 minute până la rezolvare
- **Post-incident:** Raport RCA (Root Cause Analysis) în 24 de ore, acțiuni preventive în 72 de ore

### Revenire după Rollback
Revenirea la agentul AI necesită:
- Reproducere și rezolvare problemei în mediul de staging
- Test de regresie complet
- Aprobare explicită a Technical Lead + Product Manager
- Lansare în fereastră de mentenanță programată (preferabil 02:00–06:00)

---

*Document versiune 1.0 — aprobat pentru lansare PizzaRoma Agent AI*
*Ultima actualizare: [DATA] | Proprietar: Echipa Product & Engineering*