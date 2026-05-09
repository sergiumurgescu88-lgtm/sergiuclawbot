# TOOLS.md - NeoTerm.ro (Servicii Locale)
## Document de Configurare pentru Agentul AI

---

## 1. TOOLKIT PRINCIPAL (Tool-uri Recomandate cu Justificare)

### **NocoDB / Baserow (Baza de Date No-Code)**
**Justificare:** NeoTerm.ro gestionează o rețea extinsă de instalatori, service-uri și furnizori locali de soluții termice. NocoDB permite transformarea instantanee a foilor de calcul în baze de date relaționale, esențial pentru a menține evidența partenerilor pe județe, orașe și specializări (centrale termice, panouri solare, instalații sanitare). Agentul AI poate interoga în timp real disponibilitatea unui instalator autorizat în zona clientului, eliminând latența manuală.

### **n8n (Automatizare Workflow)**
**Justificare:** Motorul central al agentului. Spre deosebire de Zapier sau Make, n8n oferă self-hosting (conformitate GDPR), noduri personalizabile pentru API-urile locale și costuri predictibile la scară. Permite construirea fluxurilor condiționale complexe: dacă un client solicită "urgentă", agentul declanșează notificare SMS către cel mai apropiat tehnician disponibil; dacă solicitarea este "informațională", trimite broșura PDF și programează follow-up în 48 de ore.

### **PocketBase (Backend Lightweight)**
**Justificare:** Pentru gestionarea autentificării utilizatorilor, preferințelor de comunicare și istoricului de interacțiuni. Rulează într-un singur fișier executabil, ideal pentru infrastructura românească unde resursele DevOps pot fi limitate. Sincronizarea cu n8n permite actualizarea profilului clientului după fiecare conversație.

### **Qdrant / Weaviate (Vector Database)**
**Justificare:** Stocarea și căutarea semantică a documentației tehnice (fișe produse, manuale de instalare, certificări ISO). Când un client întreabă "Ce centrală e compatibilă cu radiatoarele din aluminiu vechi?", agentul caută în spațiul vectorial și returnează răspunsul contextualizat, nu generic.

---

## 2. INTEGRĂRI API (Ce API-uri să Conecteze)

| API | Scop | Date Transferate |
|-----|------|------------------|
| **Google Places API** | Validare adrese și geocodare | Adresa clientului → coordonate GPS pentru atribuirea celui mai apropiat service |
| **OpenWeatherMap API** | Contextualizare recomandări | Temperatura prognozată → sugestii proactive (ex: "În București vor fi -15°C săptămâna viitoare, verificați antigelul") |
| **ANRE API (dacă disponibil) / scraper reglementat** | Verificare autorizații | Cod unic partener → validare certificare gaze/electricitate |
| **Twilio / Vonage API** | SMS și apeluri vocale | Confirmări programări, reminder-uri service, coduri OTP |
| **WhatsApp Business API (via 360dialog/BSP)** | Canal preferat al românilor | Conversații asincrone, trimitere facturi, poze cu defecțiuni |
| **FAN Courier / Cargus API** | Logistică piese de schimb | AWB tracking, estimare livrare piesă comandată |
| **Stripe / MobilPay** | Plăți online | Link de plată pentru avansuri sau servicii finalizate |

---

## 3. FLUXURI AUTOMATIZATE (5 Fluxuri Detaliate)

### **Flux 1: Qualificare Lead și Atribuire Service (Inbound)**
**Declanșator:** Mesaj prin formular web, WhatsApp sau telefon.

**Pași:**
1. Agentul AI extrage entitățile: tipul echipamentului (centrală/panou solar/pompă de căldură), simptomul (nu încălzește/scurge/zgomot), localitatea, urgența (1-5).
2. Interogare NocoDB: tehnicieni autorizați pentru marca respectivă, în rază de 30 km, cu rating >4.2.
3. Dacă urgența ≥4: SMS instant către primii 3 tehnicieni disponibili cu link de acceptare (timeout 15 minute).
4. Dacă urgența ≤3: email programare cu 3 sloturi propuse, sincronizate cu calendarul Google/Outlook al tehnicianului.
5. Actualizare status lead în CRM: "Atribuit", "În așteptare confirmare", "Reprogramat necesar".

### **Flux 2: Follow-up Post-Intervenție (Customer Success)**
**Declanșator:** Status job marcat "Finalizat" de tehnician.

**Pași:**
1. Delay 24 ore (timp de stabilizare sistem).
2. Agentul AI trimite mesaj WhatsApp: "Cum funcționează centrala după intervenția de ieri? Răspundeți 1-5 sau descrieți."
3. Dacă rating 1-2: escalare imediată către manager + ofertă vizită gratuită de verificare.
4. Dacă rating 4-5: solicitare recenzie Google Business (link personalizat UTM).
5. Dacă fără răspuns în 72 ore: apel automat programat.

### **Flux 3: Conținut Educațional Proactiv (Content)**
**Declanșator:** Date calendaristice + condiții meteo + segmentare utilizator.

**Pași:**
1. În octombrie: segment "Clienți centrale vechi >8 ani" primește ghid "5 semne că trebuie înlocuită centrala înainte de iarnă".
2. După prima îngheț în zonă: segment "Clienți pompe de căldură" primește checklist "Pregătire mod iarnă".
3. Conținutul este generat din template-uri A/B testate, personalizat cu nume și model echipament.
4. Tracking: deschidere, click pe "Programează verificare", conversie în lead.

### **Flux 4: Gestionare Recenzii și Reputație Online**
**Declanșator:** Notificare API Google Business / Facebook.

**Pași:**
1. Agentul AI clasifică recenzia: pozitivă/negativă/neutră prin analiză sentiment.
2. Pozitivă: răspuns personalizat în <2 ore, cu mulțumire și menționare serviciului specific.
3. Negativă: extragere probleme concrete, creare ticket intern, notificare manager + tehnician implicat. Răspuns public diplomatic în <4 ore, cu invitație offline la rezolvare.
4. Trend analizat săptămânal: alertă dacă scorul mediu scade sub 4.0 pe orice platformă.

### **Flux 5: Reaprovizionare Inteligentă Piese (B2B Intern)**
**Declanșator:** Stoc piesă < prag minim în sistemul depozitului partener.

**Pași:**
1. Agentul AI calculează sezonalitatea (ex: cerere crescută pompe de recirculare în noiembrie).
2. Generează comandă propusă către furnizor cu cantitate ajustată predictiv.
3. Notificare manager aprovizionare pentru confirmare.
4. La recepție: scanare cod bare, actualizare stoc, notificare tehnicieni că piesele solicitate recent sunt disponibile.

---

## 4. TOOL-URI DE COMUNICARE

| Tool | Funcție în Ecosistemul NeoTerm |
|------|-------------------------------|
| **Crisp / Chatwoot** | Chat live pe site cu handoff inteligent: bot rezolvă 70% (FAQ, programări), om preia pentru complex/emoțional |
| **Brevo (fost Sendinblue)** | Email marketing transacțional + campanii: facturi, newslettere sezoniere, reactivare clienți inactivi 12 luni |
| **WhatsApp Business API** | Canal principal: confirmări, reminder-uri, suport foto/video (client trimite poză cu eroare pe display centrală) |
| **Aircall / CloudTalk** | Telefonie VoIP cu IVR inteligent: "Spuneți sau tastați codul poștal pentru a fi redirecționat către service-ul din zonă" |
| **Loom / BombBomb** | Mesaje video personalizate de la tehnicieni: "Am verificat centrala dvs., iată ce am constatat..." |

---

## 5. TOOL-URI DE ANALYTICS

### **Plausible Analytics (Web)**
**Justificare:** Conformitate GDPR fără cookie banner, esențial pentru încrederea utilizatorilor români sensibili la privacy. Urmărește: surse trafic, pagini de conversie (cerere ofertă vs. apel telefonic), timp pe articole de blog.

### **PostHog (Product Analytics)**
**Justificare:** Înregistrare sesiuni, funnel-uri de conversie, heatmaps pe fluxul de programare. Identifică unde abandonează utilizatorii: la selectarea orei? la introducerea adresei?

### **Metabase (Dashboard-uri Interne)**
**Justificare:** Vizualizări pentru management: cost per lead pe canal, timp mediu răspuns agent AI, satisfacție pe tehnician, penetrare pe județe (unde extindem rețeaua?).

### **Uptime Kuma**
**Justificare:** Monitorizare 24/7 a tuturor serviciilor critice: site, API-uri interne, webhook-uri n8n. Alertă pe Telegram/SMS la downtime.

---

## 6. CONFIGURARE TEHNICĂ RECOMANDATĂ

### **Infrastructură**
- **Hosting:** Hetzner Cloud (Falkenstein sau Nuremberg) sau furnizor românesc certificat (M247, Claxnet) pentru date în UE.
- **Containerizare:** Docker Compose pentru dezvoltare, Kubernetes (k3s) pentru producție la scalare.
- **Reverse Proxy:** Traefik cu Let's Encrypt automat, rate limiting la 100 req/min pe IP pentru protecție bot.

### **Model AI**
- **LLM Principal:** GPT-4o via Azure OpenAI Service (data residency UE) sau Mistral Large prin API european.
- **Fallback:** Llama 3.1 70B self-hosted pe GPU Hetzner pentru date sensibile (conversații cu detalii financiare).
- **Embeddings:** text-embedding-3-large pentru documentația tehnică în Qdrant.

### **Securitate și Conformitate**
- Criptare AES-256 la stocare, TLS 1.3 în tranzit.
- Jurnalizare completă a deciziilor agentului AI (explicabilitate pentru disputele clienți).
- Backup zilnic criptat în S3 compatibil (Exoscale, Storj), test de restore lunar.

### **Scalare**
- Arhitectură microservicii comunicate prin message queue (Redis/RabbitMQ).
- Auto-scaling la nivel de container pentru vârfurile de trafic (luni dimineața, primele înghețuri).
- CDN pentru assets statice și documentație tehnică: BunnyCDN sau Cloudflare (plan gratuit suficient inițial).

---

*Document versiune 1.0 - Revizuit trimestrial în funcție de metricile de performanță ale agentului și feedback-ul echipei operaționale NeoTerm.ro.*