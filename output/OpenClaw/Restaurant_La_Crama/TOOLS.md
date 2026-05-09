# TOOLS.md - Restaurant La Crama

## 1. TOOLKIT PRINCIPAL (tool-uri recomandate cu justificare)

**Chatbot & AI Conversațional: Voiceflow sau Botpress**
Voiceflow reprezintă alegerea optimă pentru La Crama datorită interfeței vizuale intuitive care permite echipei restaurantului să modifice fluxurile conversaționale fără cunoștințe de programare. Platforma suportă integrări native cu majoritatea canalelor de comunicare relevante pentru HoReCa (WhatsApp, Messenger, site web) și oferă capabilități avansate de NLU (Natural Language Understanding) pentru recunoașterea intențiilor clienților în limba română. Costul accesibil pentru IMM-uri și posibilitatea de a gestiona atât scenarii simple de rezervare, cât și conversații complexe cu ramificații multiple îl recomandă pentru un restaurant cu specific tradițional care dorește să-și păstreze identitatea caldă, autentică în interacțiunile digitale.

**Sistem de Rezervări: Resy sau custom prin Cal.com**
Resy oferă o soluție consacrată în industria restaurantelor, cu funcționalități specifice: gestionarea meselor, turnuri de așteptare, preferințe clienți (aniversări, alergii, locuri preferate). Alternativa Cal.com permite personalizare superioară și costuri reduse pentru implementări pe piața locală românească, fiind open-source și auto-găzduit. Pentru La Crama, recomandăm o abordare hibridă: Cal.com pentru rezervările online directe și un sistem proprietar integrat cu POS-ul pentru gestionarea internă a mesei.

**CRM: HubSpot Operations Hub (Starter)**
Necesar pentru centralizarea istoricului interacțiunilor cu clienții. Permite segmentarea automată a clienților fideli, trackingul frecvenței vizitelor și declanșarea de campanii personalizate (ex: "La mulți ani" cu ofertă de aniversare, reactivare clienți inactivi peste 60 de zile). Integrarea nativă cu majoritatea platformelor de marketing automation justifică investiția.

---

## 2. INTEGRĂRI API (ce API-uri să conecteze)

| API | Scop | Date schimbate |
|-----|------|---------------|
| **Google Calendar API** | Sincronizare disponibilitate mese | Evenimente rezervate, blocări, evenimente speciale |
| **Twilio API** | SMS confirmare și reminder rezervări | Confirmări, coduri OTP, notificări anulare |
| **WhatsApp Business API** | Canal principal de comunicare | Conversații, template-uri notificări, media |
| **Stripe/Raiffeisen ePayment** | Plăți avans garantare rezervare | Tokenizare carduri, preautorizări, refunduri |
| **OpenWeatherMap API** | Contextualizare oferte | Vreme reală pentru recomandări terasă/interior |
| **Google Places API** | Informații direcționare și recenzii | Rute, program, răspuns automat la recenzii |
| **SmartBill/Facturare API** | Emitere facturi fiscale | Date comenzi, clienți, produse |

Conectarea la **Google Calendar API** este critică pentru a evita suprarezervările și pentru a permite echipei de la fața locului să vizualizeze în timp real ocuparea restaurantului în instrumentele deja familiare. **Twilio API** asigură reach-ul către clienții care nu utilizează smartphone-uri sau preferă SMS-ul clasic. **WhatsApp Business API** devine coloana vertebrală a comunicării, dat fiind penetrarea masivă a aplicației în România.

---

## 3. FLUXURI AUTOMATIZATE (3-5 fluxuri detaliate)

### Fluxul 1: Rezervare Complet Automată (End-to-End)

**Declanșator:** Client inițiază conversație pe orice canal (site, WhatsApp, Messenger)

**Pași:**
1. Agentul AI salută și identifică intenția de rezervare prin NLU
2. Colectează parametrii: dată, oră, număr persoane, ocazie specială, preferințe loc (terasă/salon/foisor)
3. Interoghează API-ul de rezervări pentru disponibilitate în intervalul ±30 minute
4. Prezintă opțiuni clientului cu descriere vizuală a zonelor restaurantului
5. La selecție, solicită date contact (nume, telefon, email) și confirmă politica de anulare (24h)
6. Generează rezervare cu status "provizoriu" și trimite cod de confirmare via SMS (Twilio)
7. Clientul confirmă prin reply cu codul sau click link
8. Statusul devine "confirmat", se adaugă în Google Calendar, se trimite card digital cu detalii și buton "Adaugă în calendar"
9. Reminder automat cu 24h înainte și cu 2h înainte de rezervare

**Excepții:** Dacă nu există disponibilitate, oferă lista de așteptare cu notificare automată la eliberare. Dacă rezervarea este pentru >8 persoane, transferă către manager pentru confirmare manuală și meniu pre-selectat.

---

### Fluxul 2: Suport Clienți Proactiv și Reactive

**Declanșator:** Mesaj client sau eveniment sistem

**Scenarii gestionate:**

*A) Modificare/anulare rezervare existentă*
- Clientul trimite "Nu mai pot veni mâine la 20:00"
- AI identifică rezervarea după numărul de telefon și dată/oră menționată
- Procesează anularea conform politicii (fără penalizare >24h, reține garanția <24h)
- Confirmă anularea și oferă link pentru reprogramare cu prioritate

*B) Întrebări frecvente*
- Meniu, alergeni, program, acces persoane cu dizabilități, parcare
- Răspunsuri din bază de cunoștințe actualizată automat din site
- Escaladare la uman doar pentru situații nerezolvate în 2 încercări

*C) Recenzii post-vizită*
- 24h după rezervare finalizată, trimite solicitare review Google/Facebook
- Dacă review negativ (<3 stele), alertează managerul în <15 minute cu contextul rezervării
- Generează răspuns preliminar personalizat pentru aprobare rapidă

---

### Fluxul 3: Optimizare Ocupare și Reducere No-Show

**Declanșator:** Evenimente calendar sau condiții business

**Pași:**
1. Monitorizare continuă a ratei de ocupare pe intervale orare
2. Dacă ocupare <60% pentru seara următoare, declanșează campanie automată:
   - Segmentează clienții fideli din CRM cu preferință pentru ziua respectivă
   - Generează ofertă contextuală: "Terasa liberă mâine seară - 15% reducere pentru rezervări până la ora 18:00"
   - Distribuie pe WhatsApp/SMS cu link rezervare directă
3. Pentru rezervări cu istoric no-show, solicită garanție prin preautorizare card (50 lei/persoană)
4. Dacă clientul nu confirmă în 4h după reminder 24h, rezervarea trece în "necesită verificare" și se apelează telefonic

---

### Fluxul 4: Evenimente Speciale și Meniuri Sezoniere

**Declanșator:** Adăugare eveniment în sistem de către echipa La Crama

**Pași:**
1. Managerul introduce în backend: Revelion 2025, meniu special, preț, capacitate, data deschiderii rezervărilor
2. Sistemul generează automat:
   - Pagină de prezentare cu galerie foto și formular de interes
   - Flux de rezervare cu plată integrală avans
   - Lista de așteptare cu prioritizare clienți VIP
3. Notificare automată către clienții care au participat la evenimentul similar anterior
4. Gestionare rate: early bird (primele 20 rezervări), preț standard, last minute dacă rămân locuri
5. Confirmări cu bilete digitale și check-in QR la intrare

---

### Fluxul 5: Feedback Loop și Îmbunătățire Continuă

**Declanșator:** Finalizare interacțiune sau rezervare

**Pași:**
1. După fiecare rezervare onorată, trimite sondaj NPS (1 întrebare) prin WhatsApp
2. Colectează și structurează feedback-ul în dashboard
3. Identifică automat pattern-uri: "timp de așteptare", "servire", "mâncare", "atmosferă"
4. Generează raport săptămânal pentru management cu trenduri și alerte
5. Ajustează răspunsurile AI pe baza întrebărilor frecvente noi detectate
6. Actualizează bază de cunoștințe cu informații din conversații (supervizat)

---

## 4. TOOL-URI DE COMUNICARE

**WhatsApp Business API (prin 360dialog sau Wati)**
Canal principal cu 90%+ penetrare în România. Permite template-uri verificate pentru notificări proactive, sesiuni de conversație de 24h pentru suport, și integrare catalog produse pentru meniu interactiv. Cost per conversație ~0.05-0.08 EUR.

**SMS (Twilio sau local Nexmo/Vonage)**
Backup pentru clienți fără WhatsApp și pentru mesaje critice (coduri, alerte). Garantează livrarea în condiții de rețea limitată.

**Email (SendGrid sau Brevo)**
Confirmări detaliate, newsletter lunar cu evenimente, meniuri sezoniere. Segmentare automată după frecvență vizite și preferințe culinare.

**Notificări Push (OneSignal)**
Pentru aplicația mobilă proprie (dacă se dezvoltă) sau PWA. Re-angajare clienți cu oferte personalizate bazate pe proximitate geografică.

**Voce (Voximplant sau integrare PBX existent)**
Fallback pentru situații complexe: AI preia apelul, identifică intenția, rezolvă dacă poate, transferă către operator uman cu context complet. Util în orele de vârf când telefonul restaurantului este permanent ocupat.

---

## 5. TOOL-URI DE ANALYTICS

**Google Analytics 4 + BigQuery**
Tracking comportament pe site: de la vizualizare meniu la inițiere și finalizare rezervare. Funnel analysis pentru identificarea abandonului. BigQuery pentru query-uri complexe și integrare cu alte surse.

**Mixpanel sau Amplitude**
Analytics produs pentru interacțiunile cu chatbot-ul: cele mai frecvente intenții, rate de succes per flux, timp mediu de rezolvare, puncte de abandon în conversație. Permite A/B testing al mesajelor și fluxurilor.

**Tableau sau Looker Studio**
Dashboard-uri executive pentru managementul La Crama:
- Ocupare zilnică/săptămânală/lunară vs. target
- Venit mediu per masă, per client, per interval orar
- Rata de conversie rezervări (vizită site → rezervare confirmată)
- NPS trend și categorizare feedback
- Cost de achiziție client per canal

**Hotjar sau Microsoft Clarity**
Heatmaps și înregistrări sesiuni pentru optimizarea experienței de rezervare pe site. Identifică elemente de UI care generează confuzie.

**Monitorizare AI-specific: Langfuse sau LangSmith**
Dacă se dezvoltă componente LLM custom, aceste tool-uri oferă observabilitate: tracing complet al conversațiilor, evaluare calitate răspunsuri, detectare halucinații, cost tracking per model utilizat.

---

## 6. CONFIGURARE TEHNICĂ RECOMANDATĂ

**Infrastructură Cloud:**
- **Provider:** AWS sau Google Cloud Platform (GCP) pentru regiunea europeană (Frankfurt sau Varșovia) — conformitate GDPR, latență <50ms pentru utilizatori români.
- **Arhitectură:** Serverless (AWS Lambda / Cloud Functions) pentru procesarea evenimentelor, cu scale-to-zero pentru optimizare costuri în perioadele de inactivitate (noaptea, 02:00-10:00).
- **Bază de date:** PostgreSQL (RDS/Cloud SQL) pentru date tranzacționale rezervări, Redis pentru caching sesiuni și rate limiting.
- **Stocare:** S3/Cloud Storage pentru documente, imagini meniu, înregistrări conversații (criptate, cu retenție conform politicii GDPR).

**Securitate și Conformitate:**
- Certificat SSL/TLS pentru toate domeniile și subdomeniile.
- Criptare end-to-end pentru datele sensibile: numere card (tokenizare prin Stripe), CNP pentru facturare.
- Anonizare date în medii de test și development.
- Implementare "Right to be forgotten" — ștergere automată a datelor personale la solicitare în 30 zile.
- Audit log complet pentru accesul la datele clienților.

**Disponibilitate și Performanță:**
- Target SLA: 99.9% uptime (maxim 8.7h downtime/an acceptabil).
- Load balancing pentru distribuția traficului în orele de vârf (vineri 16:00-20:00, weekend).
- Backup automat zilnic cu retenție 30 zile, testare restaurare lunară.
- CDN (CloudFront/Cloudflare) pentru asset-uri statice și reducere latență globală.

**Dezvoltare și Deployment:**
- CI/CD prin GitHub Actions sau GitLab CI: testare automată, linting, deploy staging → producție cu aprobare manuală.
- Infrastructure as Code (Terraform sau Pulumi) pentru replicabilitate și documentare implicită.
- Containerizare (Docker) pentru consistență între medii.

**Integrare cu Ecosistemul Existent:**
- Conector către sistemul POS actual (probabil SmartBill, Gomag sau similar) pentru sincronizare stocuri și raportare financiară.
- POS-ul rămâne sursa de adevăr pentru produse și prețuri; chatbot-ul citește via API, nu duplică datele.
- Imprimantă termică dedicată în bucătărie/bar pentru rezervări speciale (tort aniversar, meniu degustare) — integrare prin webhook.

**Buget Estimativ Lunar (scalabil):**
- Infrastructură cloud: 150-400 EUR (funcție de trafic)
- Licențe platforme (Voiceflow, HubSpot, Twilio): 200-500 EUR
- WhatsApp Business API: ~100 EUR (funcție de volum conversații)
- Total: 450-1000 EUR lunar pentru operațiune completă, amortizabil prin reducerea costurilor cu personal receptie și creșterea ratei de ocupare cu 15-20%.