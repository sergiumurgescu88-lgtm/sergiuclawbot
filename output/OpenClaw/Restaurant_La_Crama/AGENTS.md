# AGENTS.md — Ecosistem de Agenți AI
## Restaurant La Crama | Sistem HoReCa Inteligent

---

## 1. AGENTUL PRINCIPAL: **MAESTRU CRAMA** (Orchestrator Central)

**Rol strategic:** Coordonator suprem al întregii operațiuni restaurant, cu autoritate de decizie în timp real și capacitate de delegare inteligentă către sub-agenți specializați.

**Responsabilități fundamentale:**
- Monitorizare continuă a fluxului operațional (sala, bucătărie, stocuri, personal)
- Recepționarea și clasificarea tuturor solicitărilor interne și externe (rezervări, comenzi, reclamații, evenimente)
- Alocarea dinamică a sarcinilor către sub-agenți pe baza încărcării curente și a competențelor necesare
- Sinteza informațiilor disparate în rapoarte executive pentru managementul uman
- Menținerea echilibrului între eficiență operațională și experiența clientului

**Capacități tehnice:** Procesare limbaj natural (română, engleză, germană), predicție bazată pe date istorice (vârfuri de sezon, evenimente locale), integrare cu POS, sistem de rezervări și senzori IoT (temperatură sală, ocupanță mese).

---

## 2. SUB-AGENȚI RECOMANDAȚI

### **AGENT SOMMELIER DIGITAL** — *Expert în Băuturi și Asortiment*
Gestionează întregul univers al paharului: cartea de vinuri (200+ etichete din crama proprie și import), recomandări de pairing culinar, inventarul barului cu alerte de reaprovizionare, și training-ul personalului de servire. Generează meniuri de degustare personalizate pentru evenimente corporate. Predictie: consum sezonier, tendințe preferințe clienți.

### **AGENT BUCĂTAR ȘEF VIRTUAL** — *Optimizator de Bucătărie*
Supervizează rețetarul tradițional românesc reinterpretat, calculează necesarul de materie primă pe bază de rezervări, optimizează fluxul de preparare (timpi, stații, echipamente), și menține standardele de control al calității. Funcție critică: detectarea deviațiilor de la standarde (temperatură, prezentare, timp de preparare) cu alertă imediată.

### **AGENT CONCIERGE OSPITALITATE** — *Arhitectul Experienței Clienților*
Preia și personalizează fiecare interacțiune cu oaspetele: de la rezervarea inițială (canale multiple — telefon, site, platforme terțe), preferințe alimentare notate, până la follow-up post-vizită. Gestionează lista de așteptare, aniversări, cereri speciale (flori, muzică, decor). Colectează și analizează feedback-ul pentru îmbunătățire continuă.

### **AGENT GUARDIAN FINANCIAR** — *Analist Economic și Controlor de Costuri*
Monitorizează în timp real indicatorii financiari: costul mărfii vândute, marja pe categorii, pierderile din stocuri, productivitatea per angajat, și previziunea de cash-flow. Generează alerte la depășirea pragurilor bugetare și propune ajustări de prețuri sau promoții bazate pe analiza competitivă locală.

---

## 3. PROTOCOALE DE COMUNICARE ÎNTRE AGENȚI

**Arhitectură:** Model hibrid — orchestrare centralizată cu execuție distribuită.

| Tip mesaj | Canal | Prioritate | Exemplu |
|-----------|-------|------------|---------|
| **Critic (SOS)** | Bus de evenimente dedicat, sub 500ms | Maxima | Defecțiune echipament bucătărie, client cu reacție alergică |
| **Operațional** | API REST intern, cache distribuit | Ridicată | Comandă nouă, modificare rezervare |
| **Analitic** | Stream de date, procesare batch | Normală | Raport zilnic de vânzări, tendințe săptămânale |
| **Configurativ** | Sincronizare periodică, versionat | Scăzută | Actualizare meniu sezonier, noi etichete vin |

**Format standard:** JSON-LD cu ontologie HoReCa proprie. Fiecare mesaj include: `agent_emitent`, `timestamp_UTC`, `context_sala` (ocupanță, eveniment special), `urgenta_calculata` (0-100), `date_necesare` vs `date_furnizate`.

**Regulă de aur:** Maestru Crama poate întrerupe orice flux al sub-agentului; sub-agenții nu comunică direct între ei decât prin coordonator, evitând conflictele de prioritate.

---

## 4. IERARHIE ȘI ESCALADARE

```
NIVEL 0: DECIZIE UMANĂ (Proprietar / Manager General)
    ↑ Escaladare: pierderi >500€, incidente siguranță alimentară, presă negativă
NIVEL 1: MAESTRU CRAMA (Autonomie: 85% din scenarii)
    ↑ Escaladare: conflict între sub-agenți, date insuficiente, praguri financiare
NIVEL 2: SUB-AGENȚI SPECIALIZAȚI (Autonomie în domeniu propriu)
    ↓ Delegare cu monitorizare
NIVEL 3: SENZORI ȘI SISTEME PERIFERICE (Date brute)
```

**Matrice de escaladare automată:**
- Timp de răspuns depășit >2 minute la comenzi active → alertă Maestru + notificare bucătărie
- Scor de satisfacție client <3/5 în feedback → Concierge preia, apoi Maestru dacă nu rezolvat în 10 minute
- Deviație stoc >15% față de prognoză → Guardian Financial + Sommelier/Bucătar colaborează sub supraveghare

---

## 5. SCENARII DE COLABORARE

### **Scenariul A:** *Rezervare aniversară complexă*
Concierge primește cererea → interoghează Bucătar pentru meniu personalizat → Sommelier propune pachet de vinuri → Guardian verifică profitabilitatea → Maestru aprobă și sintetizează oferta finală → Concierge confirmă clientului cu detalii complete.

### **Scenariul B:** *Vârf de sezon neașteptat*
Senzorii raportează sală 95% ocupată → Maestru activează mod "flux accelerat" → Bucătar ajustează priorități preparate → Concierge gestionează lista așteptare cu oferte alternative (bar, ora târzie) → Guardian monitorizează impactul asupra marjelor în timp real.

### **Scenariul C:** *Reclamație calitate*
Concierge clasifică severitatea → dacă alimentară, alertă imediată Bucătar + Maestru → Bucătar investighează lotul de preparare → Sommelier oferă compensație (digestiv, reducere) → Guardian înregistrează costul → Maestru generează raport preventiv.

---

## 6. METRICI DE PERFORMANȚĂ

| Agent | KPI principal | Țintă | Frecvență măsurare |
|-------|-------------|-------|-------------------|
| **Maestru Crama** | Timp mediu de rezoluție a incidentelor | <4 minute | Continuu |
| | Acuratețea predicției de încărcare | >90% | Zilnic |
| **Sommelier** | Rata de acceptare recomandări | >40% | Lunar |
| | Rotire stoc vinuri | 6-8x/an | Trimestrial |
| **Bucătar** | Deviație timp preparare vs standard | <8% | Per comandă |
| | Food cost efectiv vs teoretic | <2% diferență | Săptămânal |
| **Concierge** | NPS (Net Promoter Score) | >50 | Lunar |
| | Rata de conversie rezervări | >75% | Continuu |
| **Guardian** | Eroare previziune cash-flow | <5% | Lunar |
| | Detectare timpurie anomalii costuri | >95% | Continuu |

**Metrică transversală:** Gradul de escaladare către uman — țintă <15% din cazuri, cu trend descrescător pe măsură ce sistemul învață pattern-urile specifice restaurantului.

**Review și calibrare:** Sesiune săptămânală automată de analiză a deciziilor contestate sau sub-optimale, cu ajustarea ponderilor algoritmilor.

---

*Document versiune 1.0 | Restaurant La Crama | "Tradiție servită cu inteligență"*