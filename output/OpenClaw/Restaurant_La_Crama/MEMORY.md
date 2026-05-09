# MEMORY - Restaurant La Crama

## 1. CE MEMOREAZA AGENTUL (tipuri de informatii)

Agentul AI al Restaurantului La Crama memoreaza si gestioneaza sase categorii principale de informatii pentru a asigura o experienta personalizata si eficienta a clientilor.

**Informatii despre clienti:** nume, numar de telefon, adresa de email, preferinte alimentare (vegetarian, vegan, fara gluten, alergii), feluri de mancare preferate din meniu, bauturi favorite, istoricul rezervarilor (date, numar de persoane, ocazii speciale), feedback anterior si nivelul de satisfactie. Se memoreaza, de asemenea, aniversarile, zilele de nastere si evenimentele importante ale clientilor fideli.

**Informatii despre rezervari:** data si ora solicitate, numar de persoane, zona preferata in restaurant (terasa, sala principala, crama de vinuri, etaj), ocazia evenimentului (intalnire de afaceri, aniversare, cina romantica, botez), solicitari speciale (decor floral, tort personalizat, meniu adaptat), statusul confirmarii si istoricul modificarilor.

**Informatii despre comenzi:** detalii ale comenzilor la pachet sau cu livrare, adrese de livrare frecvente, metode de plata preferate, timpi medii de asteptare acceptati si incidente anterioare legate de livrare.

**Informatii contextuale conversatie:** subiectul discutiei curente, intentia detectata a clientului, obiectii sau nelamuriri exprimate, promisiuni facute de agent si stadiul de rezolvare al solicitarilor.

**Informatii despre meniu si disponibilitate:** preparate temporar indisponibile, modificari de pret, preparate noi adaugate, ingrediente de sezon si recomandari ale bucatarului-sef pentru perioada curenta.

**Informatii despre evenimente si promotii:** evenimente culturale organizate (seri de degustare de vinuri, cine cu muzica live), meniuri speciale pentru sarbatori, pachete promotionale active si perioadele de valabilitate.

---

## 2. STRUCTURA MEMORIE PE TERMEN SCURT

Memoria pe termen scurt functioneaza ca buffer activ pentru sesiunea curenta de conversatie si are o durata de viata de maximum 60 de minute de la ultima interactiune.

| Camp | Descriere | Exemplu |
|------|-----------|---------|
| `session_id` | Identificator unic conversatie | `lc-2024-0315-084732` |
| `timestamp_start` | Ora initiere conversatie | `15.03.2024, 08:47:32` |
| `client_detected` | Status identificare client | `necunoscut` / `fidel` / `VIP` |
| `intentie_principala` | Scopul contactului | `rezervare` / `comanda` / `informatii` |
| `parametri_colectati` | Date extrase din conversatie | `{"data": "20.03", "persoane": 4, "ora": null}` |
| `parametri_lipsa` | Informatii necesare pentru finalizare | `["ora_preferata", "telefon_contact"]` |
| `context_stack` | Istoric recent al mesajelor (ultimele 10) | Array cu rol si continut |
| `obiectii_active` | Probleme nerezolvate exprimate | `["terasa ocupata la ora dorita"]` |
| `actiune_asteptata` | Pasul urmator din flux | `propune_alternative_orar` |

Memoria pe termen scurt se reseteaza complet la inchiderea sesiunii, cu exceptia datelor validate care sunt propagate catre memoria pe termen lung.

---

## 3. STRUCTURA MEMORIE PE TERMEN LUNG

Memoria pe termen lung persista in sistemul de management al relatiei cu clientii (CRM) si este structurata pe trei niveluri de profunzime.

**Nivelul 1 - Profil Client (retentie permanenta):**
- `client_id`: identificator unic
- `profil_contact`: nume, telefon, email, sursa primului contact
- `segment`: ocazional / frecvent / VIP / corporate
- `data_inregistrare`: prima interactiune
- `preferinte_baza`: restrictii alimentare permanente, zona preferata

**Nivelul 2 - Istoric Interactiuni (retentie 24 de luni):**
- `rezervari`: array cu toate rezervarile, statusul si feedback-ul
- `comenzi`: istoric comenzi la pachet/livrare cu valori si frecventa
- `evenimente`: participari la seri tematice, degustari
- `conversatii_AI`: sumarizari ale interactiunilor relevante
- `satisfactie`: scor NPS mediu si evolutie in timp

**Nivelul 3 - Insight-uri Derivate (actualizare continua):**
- `lifetime_value`: valoare estimata totala a clientului
- `risc_churn`: probabilitate de pierdere a clientului
- `next_best_action`: actiune recomandata (reactiveaza, upsell, fidelizeaza)
- `preferinte_predictive`: preferinte inferate din comportament
- `momente_optime_contact`: zile si intervale orare cu rata maxima de raspuns

---

## 4. REGULI DE ACTUALIZARE MEMORIE

**Prioritate 1 - Validare inainte de stocare:** Orice informatie noua necesita confirmare explicita sau implicita de minim doua surse inainte de a suprascrie date existente. Numarul de telefon se valideaza prin format, numele prin recunoastere in baza de date sau confirmare directa.

**Prioritate 2 - Ierarhia surselor:** Informatiile furnizate direct de client > informatiile inferate de agent > informatiile din sisteme externe. O contradictie declanseaza o intrebare de clarificare catre client.

**Prioritate 3 - Temporalitate:** Datele cu caracter temporal (preturi, program, disponibilitate) se actualizeaza automat din sistemul de operare la fiecare 15 minute. Preferintele clientilor se actualizeaza doar la confirmare post-eveniment.

**Prioritate 4 - Protectia datelor:** Informatiile despre starea de sanatate (alergii, intolerante) se stocheaza criptat si se acceseaza doar in contextul pregatirii comenzilor. Clientul poate solicita stergerea completa a profilului conform GDPR.

**Prioritate 5 - Consolidare zilnica:** La ora 03:00, sistemul ruleaza procesul de arhivare care transfera sesiunile inchise din memoria scurta in memoria lunga, genereaza insight-uri noi si actualizeaza scorurile predictive.

---

## 5. INFORMATII CRITICE BUSINESS

Aceste informatii sunt incarcate ca sistem prompt la fiecare sesiune si au prioritate maxima de acuratete.

| Domeniu | Detalii |
|---------|---------|
| **Program functionare** | Luni-Joi: 10:00-23:00; Vineri-Sambata: 10:00-24:00; Duminica: 12:00-22:00. Bucataria se inchide cu 30 minute inainte de ora de inchidere. |
| **Capacitate** | 85 locuri interior, 40 locuri terasa, 20 locuri crama de vinuri (doar cu rezervare). Sala de evenimente etaj: 50 locuri. |
| **Politica rezervari** | Confirmare telefonica cu 24h in avans pentru grupe >6 persoane. Garantare cu card pentru grupe >10. Anulare gratuita pana la 4h inainte. |
| **Preturi orientative** | Starter: 28-45 RON; Fel principal: 58-95 RON; Desert: 25-38 RON; Meniu degustare 5 feluri: 185 RON. Preturile includ TVA. |
| **Livrare** | Zona 0-3 km: gratuit, minim 80 RON. Zona 3-7 km: 15 RON, minim 120 RON. Peste 7 km: nu se livreaza. Timp estimat: 45-60 minute. |
| **Plata** | Cash, card, voucher cadou La Crama, plata online pentru comenzi. Nu se accepta tichete de masa. |
| **Politica speciala** | Clientii pot aduce vin propriu contra taxa de sticlă 35 RON (doar vinuri care nu exista in meniul nostru). |

---

## 6. RASPUNSURI STANDARD (10+ situatii frecvente)

**S1 - Cerere rezervare fara disponibilitate:** "Va multumesc pentru interesul acordat Restaurantului La Crama. Din pacate, pentru data de [DATA] la ora [ORA] nu mai avem disponibilitate in zona preferata. Va pot propune urmatoarele alternative: [ALTERNATIVE]. Daca niciuna nu convine, va pot notifica pe lista de asteptare in cazul unei anulari."

**S2 - Confirmare rezervare:** "Rezervarea dumneavoastra a fost inregistrata cu succes. Detalii: [NUME], [DATA] ora [ORA], [NR_PERSOANE] persoane, zona [ZONA]. Va asteptam cu drag! Pentru orice modificare, contactati-ne la 0372.xxx.xxx."

**S3 - Intrebare despre alergeni:** "Va confirmam ca preparatul [PREPARAT] contine urmatorii alergeni: [LISTA]. Bucatarul nostru poate adapta reteta eliminand [INGREDIENTE]. Va rugam sa mentionati restrictia la confirmarea rezervarii pentru a notifica echipa din bucatarie."

**S4 - Comanda la pachet:** "Am inregistrat comanda: [DETALII]. Timp estimat de pregatire: [MINUTE]. Modalitati de ridicare: la bar sau livrare la adresa [daca in zona]. Total de plata: [SUMA]. Confirmati comanda?"

**S5 - Reclamatie calitate:** "Ne pare profund rau pentru experienta dumneavoastra. Imi poteti oferi detalii despre preparatul si data vizitei? Vom transmite imediat feedback-ul managerului de sala si bucatarului-sef. Solutiile pe care le putem oferi: [inlocuire/refund/voucher]."

**S6 - Eveniment privat:** "Pentru evenimente private, va punem la dispozitie sala de la etaj (50 locuri) sau intreg restaurantul (in afara orelor de functionare). Pachetele pornesc de la 220 RON/persoana si includ: meniu personalizat, decor de baza, sonorizare. Va pot programa o vizionare cu managerul de evenimente?"

**S7 - Meniu degustare vinuri:** "Serile noastre de degustare au loc in crama de vinuri, in fiecare joi de la 19:00. Pachetul include 5 sortimente de vin (75ml fiecare) insotite de platou de branzeturi si preparate asortate. Pret: 145 RON/persoana. Rezervare obligatorie cu minim 48h in avans."

**S8 - Client fidel nerecunoscut initial:** "Buna ziua! Ma bucur sa va recunosc, [NUME]. Ultima data ne-ati vizitat pe [DATA], cand ati servit [PREPARAT]. Aveti o rezervare noua sau doriti sa explorati noutatile din meniu?"

**S9 - Solicitare meniu copii:** "Dispunem de meniu dedicat copiilor (3-12 ani) cu portii adaptate si preparate familiare: paste cu unt, snitel de pui, piure si legume. Preturi: 28-35 RON. Scaune inalte disponibile la cerere. Va rugam sa mentionati la rezervare."

**S10 - Anulare rezervare din partea restaurantului:** "Va contactam cu regret pentru a va informa ca, din motive [tehnice/forta majora], trebuie sa anulam rezervarea dumneavoastra din [DATA]. Va oferim prioritate la reprogramare si un voucher de 15% reducere ca semn de scuze. Care sunt urmatoarele date convenabile?"

**S11 - Intrebare despre parcare:** "Restaurantul dispune de 15 locuri de parcare proprii in curtea interioara. In weekend si serile cu evenimente, recomandam rezervarea locului de parcare odata cu rezervarea mesei. Alternativa: parcare publica pe Strada Viilor, la 150m."

**S12 - Solicitare factura fiscala:** "Factura fiscala se poate emite la momentul platii sau in maximum 5 zile lucratoare de la data consumatiei, pe baza bonului fiscal. Avem nevoie de: denumire firma, CUI, adresa si cont bancar. Doriti sa transmiteti datele acum?"