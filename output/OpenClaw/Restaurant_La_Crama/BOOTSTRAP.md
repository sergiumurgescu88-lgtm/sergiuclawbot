# BOOTSTRAP.md — Ghid de Lansare Agent AI Restaurant La Crama

## 1. CHECKLIST PRE-LANSARE (20+ itemi)

### Infrastructură Tehnică
- [ ] **1.1** Configurare server dedicat (minim 4 vCPU, 8GB RAM, SSD 100GB)
- [ ] **1.2** Instalare și securizare container Docker pentru agentul AI
- [ ] **1.3** Configurare certificat SSL valid (Let's Encrypt sau comercial)
- [ ] **1.4** Implementare firewall cu reguli restrictive (doar porturile 443, 22)
- [ ] **1.5** Configurare backup automat zilnic (retenție 30 zile)

### Integrări și API-uri
- [ ] **1.6** Conectare API rezervări sistem existent (Sistemul de Gestionare Restaurant)
- [ ] **1.7** Integrare API meniu actualizabil (sync real-time cu bucătăria)
- [ ] **1.8** Configurare notificări SMS/email (confirmări, reminder-uri)
- [ ] **1.9** Integrare plată online (dacă aplicabil pentru avans rezervări)
- [ ] **1.10** Conectare canal WhatsApp Business API

### Conținut și Cunoștințe
- [ ] **1.11** Încărcare meniu complet cu alergeni, porții, prețuri, fotografii
- [ ] **1.12** Documentare vinuri disponibile (soi, an, regiune, recomandări de asociere)
- [ ] **1.13** Definire politici restaurant (anulări, întârzieri, evenimente private, grupuri mari)
- [ ] **1.14** Configurare răspunsuri pentru întrebări frecvente (program, acces, parcare)
- [ ] **1.15** Încărcare istoric evenimente speciale și oferte sezoniere

### Testare și Calitate
- [ ] **1.16** Testare conversații tipice (rezervare, modificare, anulare, informații)
- [ ] **1.17** Verificare răspunsuri în scenarii edge-case (client nervos, cerere imposibilă)
- [ ] **1.18** Validare acuratețe prețuri și disponibilitate (cross-check cu sistemul live)
- [ ] **1.19** Testare performanță sub încărcare (simulare 50 conversații simultane)
- [ ] **1.20** Verificare conformitate GDPR (politică de confidențialitate, drept de ștergere)
- [ ] **1.21** Semnare off-line de către managerul restaurantului
- [ ] **1.22** Pregătire protocol escaladare către operator uman (disponibilitate 24/7 prima săptămână)

---

## 2. PRIMELE 24 DE ORE (Plan Orar)

| Ora | Activitate | Responsabil |
|:---|:---|:---|
| **00:00–02:00** | Lansare "silent" — agent activ doar pentru testare internă | Echipa tehnică |
| **02:00–06:00** | Monitorizare log-uri, identificare erori critice, hotfix-uri | DevOps |
| **06:00–08:00** | Briefing personal restaurant (chelneri, recepție, manager) | Manager La Crama |
| **08:00–10:00** | Activare canal WhatsApp, testare notificări către personal | Echipa tehnică |
| **10:00–12:00** | Primul contact cu clienți reali (10% din volum, cu supraveghere) | Toată echipa |
| **12:00–14:00** | Interval critic — prânz, monitorizare intensivă | Manager + tehnic |
| **14:00–16:00** | Retrospectivă de prânz, ajustări rapide, update cunoștințe | Echipa completă |
| **16:00–18:00** | Creștere treptată la 50% din volumul estimat | Automat + monitorizare |
| **18:00–20:00** | Interval critic — cină, supraveghere în timp real | Manager + tehnic |
| **20:00–22:00** | Retrospectivă seară, documentare probleme, prioritizare fix-uri | Echipa completă |
| **22:00–24:00** | Stabilizare, raport final ziua 1, plan ajustat ziua 2 | Manager + lead tehnic |

---

## 3. PRIMA SĂPTĂMÂNĂ (Obiective Zilnice)

### Ziua 1 — "Supraviețuire controlată"
- Obiectiv: Zero downtime, toate conversațiile escaladate corect
- KPI țintă: Timp mediu răspuns < 3 secunde, rată escaladare < 30%

### Ziua 2 — "Optimizare flux"
- Obiectiv: Reducere erori de înțelegere a intenției clientului
- Acțiune: Ajustare model NLP pe baza conversațiilor din ziua 1

### Ziua 3 — "Independență parțială"
- Obiectiv: Agentul rezolvă autonom 60% din cazuri fără escaladare
- Test: Scenariu rezervare grup 20+ persoane

### Ziua 4 — "Testare stres"
- Obiectiv: Funcționare corectă sub volum dublu față de estimare
- Simulare: Vineri seară cu eveniment special anunțat

### Ziua 5 — "Feedback clienți"
- Obiectiv: Colectare 20+ feedback-uri directe de la clienți
- Canal: Sondaj post-conversație, scor NPS minim 7/10

### Ziua 6–7 — "Weekend de foc"
- Obiectiv: Performanță stabilă în cel mai aglomerat interval
- Focus: Timp de răspuns menținut, zero pierderi de rezervări

---

## 4. PRIMA LUNĂ (Milestone-uri)

| Săptămâna | Milestone | Metrică de succes |
|:---|:---|:---|
| **Săpt. 1** | Stabilizare tehnică | Uptime 99.9%, zero incidente critice |
| **Săpt. 2** | Optimizare conversațională | Rată rezolvare autonomă > 75% |
| **Săpt. 3** | Integrare completă | Sync bi-direcțional cu toate sistemele HoReCa |
| **Săpt. 4** | Maturitate operațională | Reducere costuri serviciu clienți cu 30%, creștere conversie rezervări cu 15% |

**Milestone final lună 1:** Agentul AI gestionează 80% din interacțiunile inițiale fără intervenție umană, cu satisfacție client măsurată minim 4.2/5.

---

## 5. TESTARE ȘI VALIDARE

### Teste Funcționale
- **Rezervare standard:** Dată, oră, număr persoane, preferințe masă
- **Rezervare complexă:** Meniu predefinit, restricții alimentare, aniversare
- **Modificare și anulare:** În termen legal, cu penalizări unde aplicabil
- **Informații:** Program, accesibilitate, parcare, evenimente viitoare

### Teste Non-funcționale
- **Performanță:** 100 conversații simultane, timp răspuns < 2 secunde
- **Securitate:** Penetration testing, fuzzing input-uri malițioase
- **Disponibilitate:** Failover automat, RTO < 5 minute, RPO < 1 minut

### Validare Business
- Comparare săptămânală: rezervări prin agent vs. rezervări prin telefon
- Analiză: ore de vârf, abandon conversație, motive escaladare
- Interviuri lunare cu personal restaurant pentru feedback calitativ

---

## 6. ROLLBACK PLAN

### Condiții de declanșare
1. Uptime < 95% în orice interval de 4 ore consecutive
2. Pierdere confirmată de rezervări din cauza agentului (minim 3 cazuri)
3. Scandal public sau review negativ viral atribuit exclusiv agentului
4. Breșă de securitate confirmată

### Procedură rollback (maxim 10 minute)

| Pas | Acțiune | Durată |
|:---|:---|:---|
| 1 | Alertă automată către manager și lead tehnic | Instant |
| 2 | Activare mod "fallback" — toate conversații către operator uman | 30 secunde |
| 3 | Păstrare log-uri complete pentru investigație | Automat |
| 4 | Notificare clienți activi: "Vă redirecționăm către un coleg" | 1 minut |
| 5 | Oprire container agent AI, izolare instanță | 2 minute |
| 6 | Restaurare ultima versiune stabilă confirmată | 5 minute |
| 7 | Testare rapidă în mediu izolat | 10 minute |
| 8 | Relansare graduală (10% → 50% → 100%) | 30 minute |

### Post-rollback
- Analiză root-cause în maximum 24 ore
- Plan remediere și retestare în mediu de staging
- Relansare doar cu semnătura managerului + lead tehnic + QA

---

*Document versiune 1.0 — Restaurant La Crama*  
*Aprobat pentru execuție: _______________*  
*Data lansare planificată: _______________*