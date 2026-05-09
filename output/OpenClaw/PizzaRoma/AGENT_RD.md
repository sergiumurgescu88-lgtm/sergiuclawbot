# AGENT_RD.md — Document R&D pentru Agentul AI al PizzaRoma

## 1. ANALIZĂ COMPETITIVĂ (agenți AI similari în industrie)

Piața agenților AI pentru restaurante a înregistrat o creștere accelerată în 2023-2024. **Domino's Pizza** deține liderul cu "Dom", asistentul vocal multicanal capabil să proceseze comenzi complexe prin Alexa, Google Assistant și aplicația proprie. **Pizza Hut** a implementat soluția "Pepper" în Japonia — un robot umanoid fizic, însă cu funcționalități limitate la interacțiunea față-în-față. **McDonald's** a achiziționat Apprente (2019) și Dynamic Yield, dezvoltând sisteme de voice-ordering cu timp de răspuns sub 300ms.

În România, competiția este încă fragmentată. **5ToGo** utilizează chatboți simpli pe Facebook Messenger pentru programări. **KFC România** experimentează cu kiosk-uri inteligente, fără componentă conversațională avansată. **Glovo și Tazz** dețin avantajul datelor agregate, însă agenții lor sunt generaliști, nepersonalizați pe branduri individuale.

**Lacune identificate în piață:** lipsa agenților care integrează preferințele nutriționale, istoricul comenzilor și contextul temporal (vreme, evenimente locale) într-un singur flux conversațional. PizzaRoma poate diferenția printr-un agent "cu memorie emoțională" — care recunoaște clienți recurenți și adaptează tonul.

---

## 2. EXPERIMENTE RECOMANDATE (A/B tests)

| Experiment | Grup de control | Grup de test | Metrică principală | Durată |
|------------|---------------|--------------|-------------------|--------|
| **E-1: Ton conversațional** | Formal ("Comanda dumneavoastră a fost înregistrată") | Familiar, cu umor contextual ("Pizza Quattro Stagioni, ca de obicei, sau încercăm ceva nou azi?") | Rata de conversie | 4 săptămâni |
| **E-2: Upselling inteligent** | Upselling generic ("Doriți și o băutură?") | Upselling bazat pe coșul curent + istoric (ex: "Clienții care iau Quattro Formaggi adaugă des Ciabatta cu usturoi") | Valoare medie comandă | 6 săptămâni |
| **E-3: Proactivitate** | Agent reactiv (răspunde doar la inițiere client) | Agent proactiv (notificare: "Văd că sunteți în zonă — comanda obișnuită e gata în 12 minute") | Rata de retenție | 8 săptămâni |
| **E-4: Vizualizare AR** | Meniu text + imagini statice | Preview AR al pizzei personalizate înainte de comandă | Rata de abandon coș | 3 luni |

---

## 3. TEHNOLOGII EMERGENTE RELEVANTE

**Multimodal LLMs (GPT-4V, Gemini Pro Vision)** — permit analiza fotografiilor trimise de clienți ("Arată-mi ce ai mai gătit azi") și generarea de răspunsuri contextualizate vizual. Recomand pilot în Q2 2025 pentru recunoașterea automată a ingredientelor preferate.

**Voice Cloning etic (ElevenLabs, PlayHT)** — posibilitatea de a da agentului o voce consistentă, recognoscibilă, asociată brandului PizzaRoma. **Atenție:** necesită consimțământ explicit și transparență totală.

**RAG (Retrieval-Augmented Generation) cu grafuri de cunoștințe** — înlocuiește bazele de date vectoriale simple cu structuri care înțeleg relații complexe: "clientul X preferă crusta subțire → crusta subțire se coace mai repede → estimare livrare ajustată".

**Edge AI pentru kiosk-uri** — rularea modelului local reduce latența și elimină dependența de conexiune. Framework-uri: TensorFlow Lite, ONNX Runtime.

**Blockchain pentru trasabilitate ingrediente** — opțional, pentru segmentul premium: clientul poate întreba agentul "De unde provin roșiile de pe pizza mea?" și primi răspuns verificabil.

---

## 4. ROADMAP EVOLUȚIE AGENT (6-12 luni)

**Faza 1: Consolidare (Lunile 1-3)**
- Stabilizare NLP pentru dialecte românești (inclusiv regionalisme: "piftie", "mămăliguță")
- Integrare completă cu sistemul POS existent
- Implementare feedback loop uman-in-the-loop pentru 15% conversații edge-case

**Faza 2: Personalizare (Lunile 4-6)**
- Lansare "Memorie pe termen lung" — agentul recunoaște preferințe stabile (alergii, adrese frecvente)
- A/B test E-1 și E-2
- Pilot voice ordering pentru 20% din traficul telefonic

**Faza 3: Proactivitate (Lunile 7-9)**
- Implementare E-3: notificări contextuale bazate pe geofencing
- Integrare calendar — "Vedeți că aveți meci diseară. Comandați acum pentru a evita așteptarea?"
- Testare AR menu (E-4) în 2 locații pilot

**Faza 4: Autonomie (Lunile 10-12)**
- Agent capabil să negocieze în limită de buget ("Am 50 lei, ce-mi recomanzi pentru 4 persoane?")
- Predicție demand-driven pentru optimizare stocuri
- Evaluare extindere la francize PizzaRoma

---

## 5. IPOTEZE DE TESTAT

**H1:** Clienții sub 30 de ani au rată de conversie cu 25% mai mare când agentul folosește emoji și limbaj informal.

**H2:** Recomandările bazate pe "clienți similari" (collaborative filtering) outperformează recomandările bazate doar pe istoric individual pentru clienți cu <5 comenzi.

**H3:** Transparența explicabilă ("Vă recomand Quattro Formaggi pentru că ați apreciat Gorgonzola în trecut") crește trustul cu 15% vs. recomandări opace.

**H4:** Clienții acceptă să plătească premium (10-15%) pentru "experiență conversațională superioară" — necesită validare prin sondaj conjoint.

**H5:** Agentul proactiv în zilele cu vreme rea ("Plouă — livrarea poate întârzia 10 minute, vă oferim 10% discount pentru răbdare") reduce ratele de complaint cu 40%.

---

## 6. RESURSE DE ÎNVĂȚARE

**Cursuri și certificări:**
- "Conversational AI Design" — Google Cloud (gratuit, 20 ore)
- "Building LLM Applications" — DeepLearning.AI (Andrew Ng)
- "Ethics of AI" — Helsinki University (relevant pentru deciziile de voice cloning)

**Comunități și evenimente:**
- RomAI (comunitate românească AI) — meetup-uri lunare în București/Cluj
- MLOps Community — practici de deployment la scară
- Restaurant Technology Network — trenduri verticale specifice

**Benchmark-uri și date:**
- Stanford HAI AI Index Report 2024 — capitolul "AI in Services"
- Gartner Hype Cycle for Artificial Intelligence 2024
- Date interne: raport lunar de conversie, NPS post-interacțiune agent, timp mediu rezolvare (MTTR)

**Lecturi obligatorii echipă:**
- "The Alignment Problem" — Brian Christian (riscuri AI)
- "Designing Voice User Interfaces" — Cathy Pearl (principii VUI)
- Paper: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" — Lewis et al., 2020

---

*Document întocmit: [data] | Responsabil R&D: [nume] | Următoarea revizuire: trimestrial sau la finalizarea fiecărei faze din roadmap.*