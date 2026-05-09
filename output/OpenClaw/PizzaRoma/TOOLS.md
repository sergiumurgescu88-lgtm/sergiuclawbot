# TOOLS - PizzaRoma

## 1. TOOLKIT PRINCIPAL (tool-uri recomandate cu justificare)

Pentru agentul AI al PizzaRoma, specializat pe rezervări online, propun următorul set de instrumente fundamentale. **Dialogflow CX** reprezintă alegerea principală pentru procesarea limbajului natural, oferind gestionare avansată a contextului conversațional — esențială când clientul modifică data rezervării sau numărul de persoane în mijlocul dialogului. Platforma suportă limba română nativ și permite tranziții complexe între intenții. **Make (fost Integromat)** funcționează ca orchestrator pentru automatizări fără cod, conectând sistemele disparate prin scenarii vizuale. Aleg această soluție în defavoarea Zapier-ului datorită costurilor mai accesibile pentru volum mediu și flexibilității superioare în manipularea datelor. **Airtable** servește ca bază de date operațională pentru gestionarea rezervărilor, oferind vizualizări calendaristice intuitive pentru managerul de sală și posibilitatea de a defini relații între mese, intervale orare și preferințe clienți. **Typeform** colectează feedback post-vizită prin formulare conversaționale elegante, integrându-se natural în fluxul de comunicare inițiat de agent. **Calendly** sau soluția nativă de booking gestionează interfața directă de selecție a sloturilor disponibile, reducând frecarea conversațională — clienții vizualizează în timp real ce mese sunt libere.

## 2. INTEGRARI API (ce API-uri sa conecteze)

Conectivitatea API constituie coloana vertebrală a funcționalității agentului. **Google Places API** permite preluarea automată a programului de funcționare, recenziilor existente și fotografiilor locației, informații pe care agentul le utilizează pentru răspunsuri contextuale la întrebări precum "Sunteți deschiși marți seara?". **Twilio API** gestionează confirmările SMS și apelurile telefonice pentru rezervări complexe sau urgențe — notificări automate cu 2 ore înainte de rezervare reduc ratele de no-show cu până la 40%. **Stripe API** procesează garanțiile pentru rezervări în weekend sau sărbători, când cererea depășește capacitatea; suma poate fi reținută sau transformată în voucher la finalul vizitei. **OpenWeatherMap API** oferă date meteo pentru sugestii proactive — agentul poate propune terasa la rezervare când prognoza indică vreme favorabilă. **Google Calendar API** sincronizează rezervările cu sistemul intern al restaurantului, prevenind suprapunerile. **Facebook Messenger API** și **WhatsApp Business API** extind prezența agentului pe canalele preferate de clienți, cu particularitatea că WhatsApp necesită aprobare Meta și costuri per conversație. **SendGrid API** livrează confirmări detaliate prin email, inclusiv harta locației și meniul preliminar.

## 3. FLUXURI AUTOMATIZATE (3-5 fluxuri detaliate)

**Flux 1: Rezervare complet conversațională**
Clientul inițiază dialogul pe site-ul PizzaRoma prin widget-ul chat. Agentul identifică intenția de rezervare, extrage entitățile (data, ora, număr persoane, ocazie specială). Interoghează Airtable pentru disponibilitate. Dacă slotul dorit este ocupat, propune alternative în intervalul ±90 minute. La confirmare, generează cod unic rezervare, trimite SMS prin Twilio și email prin SendGrid, creează eveniment în Google Calendar-ul restaurantului. Actualizează statusul mesei în Airtable. Timp total: sub 45 secunde.

**Flux 2: Reconfirmare inteligentă și gestionare no-show**
Cu 24 de ore înainte, agentul trimite mesaj de reconfirmare cu butoane "Confirm / Modific / Anulez". Răspunsul "Confirm" actualizează statusul și pregătește notificarea bucătarului-șef pentru eventuale alergii menționate. "Modific" redeschide dialogul de selecție slot. "Anulez" eliberează masa, declanșând ofertă flash pe social media pentru slotul recuperat. Non-răspunsul la 24 ore declanșează apel telefonic automat prin Twilio.

**Flux 3: Upselling contextual post-rezervare**
La 2 ore după confirmare, agentul analizează ocazia (aniversare = propunere tort personalizat; grup >8 persoane = meniu degustare; rezervare 20:00 vineri = sugestie aperitiv prosecco). Trimite ofertă prin canalul preferat al clientului cu link direct de precomandă. Integrare Stripe pentru plată anticipată. Comanda se transmite în sistemul POS al restaurantului.

**Flux 4: Recuperare feedback și generare recenzie**
La 2 ore post-vizită (detectată prin checkout POS sau estimare durată), agentul trimite Typeform scurt (3 întrebări: notă, ce a lipsit, recomandare). Scoruri 4-5 stele declanșează invitație Google Reviews cu link direct. Scoruri 1-3 alertează managerul pe WhatsApp cu transcript conversație și detalii rezervare pentru intervenție proactivă.

**Flux 5: Sincronizare multi-platformă și prevenire suprabooking**
Webhook-uri Airtable la fiecare modificare propagă instant datele către Google Calendar, sistemul POS și platformele de delivery (Tazz, Glovo) pentru mese disponibile. Dacă o rezervare telefonică manuală intră în conflict cu una online, algoritmul prioritizează plasarea temporală și notifică ambele părți cu soluții alternative.

## 4. TOOL-URI DE COMUNICARE

**Intercom** sau **Crisp** pentru widget-ul live de pe site, cu handoff inteligent la agent uman pentru solicitări neobișnuite. **WhatsApp Business Platform** pentru comunicații asincrone — clienții pot reveni la conversație oricând, istoricul fiind păstrat. **Slack** intern pentru alerte echipei: rezervări VIP, alergii severe semnalate, solicitări speciale (flori la masă, decor aniversar). **Google Business Messages** pentru clienții care descoperă restaurantul prin Căutare Google sau Maps, permițând rezervare fără părăsirea ecosistemului Google.

## 5. TOOL-URI DE ANALYTICS

**Google Analytics 4** cu evenimente custom pentru conversații initiate, rezervări finalizate, abandonuri pe etapă. **Mixpanel** pentru analiza cohortelor: rate conversie după canal de provenire, valoare medie rezervare, frecvență revenire. **Hotjar** înregistrează sesiuni pe widget chat pentru identificare puncte de frecare în UX conversațional. **Airtable Analytics** oferă dashboarduri operaționale: grad ocupare pe intervale, durată medie ședere, preferințe mese. **Custom NLP monitoring** track-ește intențiile nerecunoscute pentru antrenare continuă — cuvinte noi de argou, expresii regionale.

## 6. CONFIGURARE TEHNICA RECOMANDATA

Arhitectura propune **frontend** React/Vue pentru widget embedabil, comunicând prin WebSocket cu backend-ul. **Backend** Node.js sau Python (FastAPI) găzduit pe **Google Cloud Run** pentru scalare automată zero-to-N — esențial în vineri seara când traficul poate crește 10x față de o zi obișnuită. **Redis** ca layer de caching pentru disponibilitatea meselor, reducând interogările Airtable. **PostgreSQL** în paralel cu Airtable pentru date tranzacționale critice, Airtable rămânând sursa de adevăr pentru operațiuni. **Docker** containerizează toate serviciile; **GitHub Actions** automatizează CI/CD. Securitate: criptare AES-256 pentru date personale, conformitate GDPR cu ștergere automată la cerere prin API endpoint dedicat. Backup zilnic automatizat în Cloud Storage cu retenție 30 zile. Monitorizare prin **UptimeRobot** și **Sentry** pentru alerte în timp real. Buget estimat infrastructură: 150-300 EUR/lună pentru volum mediu (500-2000 rezervări/lună), scalând proporțional cu creșterea.