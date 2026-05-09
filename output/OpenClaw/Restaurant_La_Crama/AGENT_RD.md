# AGENT R&D - Restaurant La Crama

## 1. ANALIZA COMPETITIVĂ (agenți AI similari în industrie)

Piața agenților AI pentru HoReCa din România și regiune este încă în fază incipientă, însă apar soluții notabile. **Tazz/Bolt Food** dețin chatboți de comandă baz pe reguli, limitați la fluxuri liniare. **Glovo** experimentează recomandări alimentare prin ML, dar fără personalizare contextuală profundă. La nivel internațional, **Presto** (SUA) oferă voice AI pentru drive-thru, iar **Kea** procesează comenzi telefonice pentru lanțuri precum Domino's. **ConverseNow** automatizează 90% din interacțiunile vocale la quick-service restaurants.

Pentru restaurante fine dining și tradiționale românești, există un gol semnificativ: majoritatea soluțiilor vizează fast-food, nu experiențe gastronomice personalizate. **OpenTable** și **Resy** integrează AI basic pentru rezervări, dar lipsesc agenți care să înțeleagă specificul cultural al bucătăriei românești — de la preparate regionale (ciorbă de burtă, sarmale în foi de varză vs. viță) la ritualul ospitalității tradiționale. **La Crama** poate diferenția prin un agent care îmbină cunoștințe despre vinuri autohtone (Fetească Neagră, Grasă de Cotnari), sezonabilitatea ingredientelor și istoria culinară a zonei.

Competiția indirectă include și asistenții vocali generaliști (Alexa, Google Assistant) folosiți sporadic pentru căutări restaurant, dar cu rată scăzută de conversie în rezervări.

---

## 2. EXPERIMENTE RECOMANDATE (A/B tests)

**E1: Personalizare vs. Eficiență în Rezervări**
- Variantă A: Agent rapid, sub 60 secunde pentru confirmare rezervare
- Variantă B: Agent explorator, 2-3 minute cu întrebări despre preferințe (ocazie, alergii, preferințe vinuri)
- Metrici: rată conversie, valoare medie comandă, satisfacție raportată

**E2: Ton Conversațional — Tradițional vs. Modern**
- Variantă A: Limbaj cald, folosire "dumneavoastră", referințe la "crama noastră", povești despre rețete moștenite
- Variantă B: Ton concis, emoji-uri moderate, structură tip bullet points
- Segmentare: clienți sub 35 ani vs. peste 55 ani

**E3: Proactivitate în Upselling**
- Variantă A: Upselling explicit ("Doriți și un pahar de Fetească?")
- Variantă B: Upselling contextual, bazat pe perechea mâncare-vin din istoric
- Control: fără upselling

**E4: Canal de Interacțiune**
- Test paralel WhatsApp vs. apel telefonic vs. widget website
- Măsurare: preferință demografică, complexitate interacțiuni rezolvate

**E5: Rezolvare Probleme — Escalare Umană**
- Variantă A: Escalare imediată la nemulțumiri detectate (sentiment analysis < -0.3)
- Variantă B: Agent încearcă rezolvare autonomă cu oferte compensatorii
- Metric cheie: rata de retenție post-incident

---

## 3. TEHNOLOGII EMERGENTE RELEVANTE

**RAG (Retrieval-Augmented Generation) cu surse multiple**
Integrare meniu actualizat, stoc vinuri în timp real, recenzii recente Google Maps, evenimente locale (festivaluri, sărbători). Esențial pentru a evita "halucinațiile" despre disponibilitate.

**Voice Cloning etic pentru brand**
Creare voice persona consistentă cu identitatea La Crama — posibil colaborare cu voice actor local, nu sintetizare generică. Tehnologii precum ElevenLabs permit acest lucru cu garanții anti-deepfake.

**Multimodal AI**
Analiză foto a preparatelor pentru recomandări vizuale ("Arată similar cu ce ați comandat luna trecută"). Util pentru clienți internaționali nefamiliarizați cu terminologia românească.

**LLM-uri locale / edge deployment**
Modele precum Llama 3.1 sau Mistral rulat local pentru date sensibile (preferințe alimentare, istoric medical alergii), reducând dependența de API-uri externe și îmbunătățind GDPR compliance.

**Predictive analytics pentru sezonalitate**
Antrenare pe date 3-5 ani: predicție aglomerație, optimizare stocuri, personalizare oferte în funcție de vreme (ex: promovare ciorbe răcoroase în zile caniculare).

---

## 4. ROADMAP EVOLUȚIE AGENT (6-12 luni)

**Luna 1-2: MVP — Rezervări și Informații de Bază**
- Chatbot text pentru rezervări, program, locație
- Integrare calendar restaurant
- FAQ automat despre meniu și alergeni

**Luna 3-4: Personalizare și Context**
- Memorare preferințe utilizator (CRM light)
- Recomandări bazate pe istoric
- Notificări proactice: "Mâine avem sarmale în foi de viță, preferata dumneavoastră"

**Luna 5-6: Canale Multiple și Voice**
- Extindere WhatsApp Business API
- Pilot voice pentru apeluri telefonice în ore non-peak
- Integrare Tazz/Bolt pentru comenzi la pachet

**Luna 7-9: Intelligence Operațională**
- Predicție no-show cu trigger reconfirmare automată
- Optimizare masă în funcție de dimensiune grup și preferințe
- Feedback loop: analiză recenzii pentru identificare pattern-uri

**Luna 10-12: Ecosistem și Autonomie Avansată**
- Agent proactiv pentru evenimente speciale (Revelion, Paște) — propunere meniu personalizat, rezervare automată
- Integrare cu furnizori locali pentru "provenienta ingredientelor" storytelling
- Capacitate de negociere light pentru grupuri mari (>20 persoane)

---

## 5. IPOTEZE DE TESTAT

**H1:** Clienții care interacționează cu agentul de 3+ ori au valoare medie cu 25% mai mare decât cei cu o singură interacțiune (ipoteza familiarității).

**H2:** Recomandările de vinuri bazate pe profil aromatic (nu doar tip strugure) cresc rata de acceptare cu 40%.

**H3:** Clienții internaționali preferă explicații etimologice ale preparatelor ("mămăligă = polenta românească, din mălai de măcinare grosieră") vs. simpla traducere.

**H4:** Timpul de răspuns sub 10 secunde în conversație este mai important decât acuratețea perfectă pentru segmentul sub 30 ani.

**H5:** Agentul care "greșește" grațios și cere clarificare generează mai multă încredere decât cel care oferă răspunsuri confiante dar potențial eronate.

**H6:** Notificările contextuale (ex: "Ați rezervat de ziua soției anul trecut — doriți să repetăm aranjamentul?") au rată de conversie dublă față de promoțiile generice.

---

## 6. RESURSE DE ÎNVĂȚARE

**Cursuri și Certificări:**
- "Conversational AI with RAG" — DeepLearning.AI (Andrew Ng)
- "Building AI Agents" — Scrimba / LangChain Academy
- Certificare WhatsApp Business API — Meta Blueprint

**Comunități și Evenimente:**
- RoAI (Romanian AI Association) — meetups lunare București/Cluj
- MLOps Community — cazuri de studiu implementare retail/food
- Web Summit Lisbon / How to Web — track-uri dedicate AI în servicii

**Publicații și Research:**
- Papers With Code — secțiunea "Dialogue Systems" și "Recommendation Systems"
- Harvard Business Review — seria "AI in Customer Service" (2023-2024)
- Rapoarte Gartner: "Predicts 2024: AI Technologies" — secțiunea conversational AI

**Benchmark-uri Industrie:**
- Restaurant Technology Network (RTN) — standardizare metrici AI HoReCa
- National Restaurant Association (SUA) — raport anual "State of Restaurant Technology"

**Resurse Locale Relevante:**
- Studii de caz ANIS (Asociația Industriei Software) — implementări AI în companii românești
- Programe de finanțare POC/Innovation — pentru experimente cu buget controlat

---

*Document versiune 1.0 — revizuit trimestrial sau la finalizarea fiecărui experiment major.*