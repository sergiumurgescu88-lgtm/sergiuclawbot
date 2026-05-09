# AGENTS.md - Ecosistemul de Agenți PizzaRoma

## Prezentare Generală

PizzaRoma operează un ecosistem de agenți inteligenți orchestrat pentru optimizarea operațiunilor unui restaurant cu livrare, integrând comenzi online, gestiunea bucătăriei, logistica de livrare și relația cu clienții. Arhitectura urmărește autonomia decizională la nivel operațional, cu supraveghere umană pentru excepții critice.

---

## 1. AGENTUL PRINCIPAL: **Maestro** (Orchestrator Central)

**Rol:** Coordonator suprem al ecosistemului, punct unic de intrare pentru toate fluxurile operaționale și decizionale.

**Responsabilități:**
- Primește și clasifică toate solicitările (comenzi noi, reclamații, alerte stoc, incidente livrare)
- Distribuie task-urile către sub-agenții specializați conform capacității și priorității
- Menține starea globală a sistemului în timp real (comenzi active, timpi de așteptare, disponibilitate ingrediente)
- Ia decizii de nivel mediu: reprogramarea livrărilor, ajustarea dinamică a meniului, propuneri de upselling
- Generează rapoarte zilnice de performanță pentru managementul uman
- Intervine în blocajele inter-agent (deadlock-uri de resurse, conflicte de prioritate)

Maestro operează pe un ciclu de 30 de secunde, reevaluând constant starea sistemului și optimizând alocarea resurselor.

---

## 2. SUB-AGENȚI RECOMANDAȚI

### 2.1 **ChefBot** (Agentul Bucătăriei)
Specializat în managementul producției culinare. Gestionează cozile de preparare, timpii de gătire, alocarea stațiilor de lucru (cuptor, blat, topping) și coordonarea cu stocurile. Calculează ETA-uri precise pentru fiecare comandă și semnalează deviații. Integrează rețetele standardizate și menține consistența calității.

### 2.2 **RiderSync** (Agentul Logisticii)
Responsabil pentru optimizarea rutelor de livrare, alocarea curierilor, și monitorizarea în timp real. Utilizează algoritmi de vehicle routing cu ferestre de timp dinamice. Gestionează statusurile: "pregătit", "ridicat", "în livrare", "livrare confirmată". Coordonează zonele de acoperire și propune extinderi sau restrângeri bazate pe date.

### 2.3 **PantryGuard** (Agentul Inventarului)
Supraveghează nivelurile de stoc pentru toate ingredientele, previzionează consumul prin modele predictive, generează comenzi de aprovizionare automate cu praguri de siguranță. Semnalează alerte de expirare, gestionează loturile FIFO și calculează costul real per pizza. Integrează datele cu ChefBot pentru modificări dinamice ale meniului (hide items indisponibile).

### 2.4 **ClientVoice** (Agentul Relațiilor cu Clienții)
Interfață conversațională multicanal (chat, telefon, aplicație). Procesează comenzi noi, modificări în timp real, întrebări frecvente și inițiază rezolvarea reclamațiilor. Menține istoricul preferințelor clienților pentru personalizare. Escalează către Maestro cazurile complexe sau cu valoare ridicată de recuperare.

---

## 3. PROTOCOALE DE COMUNICARE ÎNTRE AGENȚI

**Model:** Arhitectură hibridă publish-subscribe și request-response.

| Protocol | Utilizare | Frecvență |
|----------|-----------|-----------|
| **Heartbeat** | Stare de viață și capacitate | La 10 secunde |
| **Event Stream** | Evenimente de business (comandă nouă, livrare finalizată) | Real-time |
| **Command Channel** | Instrucțiuni directe cu confirmare | La nevoie |
| **Sync Batch** | Sincronizare stocuri, rapoarte agregate | La 5 minute |

**Format mesaje:** JSON standardizat cu header (timestamp, agent-sursă, prioritate, TTL) și payload specific domeniului. Toate comunicațiile sunt persistate în jurnalul de audit pentru 90 de zile.

**Reziliență:** Dacă un agent devine neresponsiv după 3 heartbeat-uri consecutive, Maestro declanșează protocolul de failover, redistribuind responsabilitățile și alertând echipa tehnică.

---

## 4. IERARHIE ȘI ESCALADARE

```
Nivel 0: Sub-agenții (autonomie operațională)
    ↓ [excepție nerezolvată sau depășire prag]
Nivel 1: Maestro (decizie de nivel mediu, mediere)
    ↓ [incident critic, pierdere financiară potențială, siguranță alimentară]
Nivel 2: Manager Uman de Tura (intervenție în timp real)
    ↓ [escaladare strategică, modificare politici]
Nivel 3: Director Operațional / Proprietar
```

**Criterii de escaladare automată:**
- Timp de livrare estimat depășește 90 de minute
- Stoc critic sub 2 ore de operare
- Reclamație client cu valoare comandă >200 RON
- Eșec livrare consecutive pentru același curier (>2)
- Anomalie detectată în fluxul financiar

---

## 5. SCENARII DE COLABORARE

### Scenariul A: Comandă Complexă de Grup
Clientul plasează comandă pentru 8 pizza variate. ClientVoice validează și transmite către Maestro. Acesta consultă PantryGuard pentru disponibilitate, apoi distribuie către ChefBot cu prioritizare în coadă. ChefBot confirmă slot-ul de preparare, Maestro calculează ETA final și notifică RiderSync pentru alocarea curierului. Toți agenții raportează progresul în timp real către ClientVoice pentru informarea clientului.

### Scenariul B: Ruptură de Stoc Improvizată
PantryGuard detectează epuizarea măslinelor. Semnalează instant Maestro, care comandă ChefBot să ascundă produsele afectate din fluxul activ. ClientVoice ajustează răspunsurile pentru comenzi noi. Maestro generează comandă de urgență către furnizor și notifică managerul uman pentru decizia de substituire temporară.

### Scenariul C: Furtună - Disfuncționalitate Livrare
RiderSync detectează întârzieri masive din cauza vremii. Propune restrângerea zonei de livrare și prelungirea ETA-urilor. Maestro aprobă și comandă ClientVoice să notifice clienții afectați cu oferte compensatorii. PantryGuard ajustează previziunea de consum pentru seară. Managerul uman este informat pentru decizia de suspendare temporară a livrărilor.

---

## 6. METRICI DE PERFORMANȚĂ

| Domeniu | Metrică | Țintă | Frecvență Evaluare |
|---------|---------|-------|-------------------|
| **Operațional** | Timp mediu preparare | <15 min | Orar |
| | Timp mediu livrare | <35 min | Orar |
| | Rata comenzilor la timp (>95% din ETA) | >92% | Zilnic |
| **Calitate** | Rata reclamațiilor / total comenzi | <2% | Săptămânal |
| | Scor mediu recenzii clienți | >4.5/5 | Lunar |
| **Eficiență** | Cost ingrediente / venit | <28% | Lunar |
| | Rata de utilizare a curierilor | >75% | Zilnic |
| **Sistem** | Timp de răspuns agenți | <500ms | Continuu |
| | Disponibilitate ecosistem | >99.5% | Lunar |
| | Rata escaladărilor justificate | >80% | Săptămânal |

**Revizuire arhitecturală:** Ecosistemul este evaluat trimestrial pentru ajustarea numărului de sub-agenți, refinarea protocoalelor și identificarea oportunităților de adăugare a unui al cincilea agent specializat (propunere: **PromoMind** pentru optimizarea dinamică a campaniilor marketing).

---

*Document versiune 1.0 | PizzaRoma Tech Operations*