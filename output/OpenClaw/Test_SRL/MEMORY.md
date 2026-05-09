# MEMORY.md - Test SRL (Servicii)

## 1. CE MEMOREAZA AGENTUL (tipuri de informatii)

Agentul AI al Test SRL memoreaza sase categorii principale de informatii:

**a) Date identitate companie:** denumire completa, CUI, adresa sediu, date contact, istoric fondare, domeniu principal de activitate CAEN, certificari si acreditari detinute.

**b) Date clienti si prospecti:** nume, prenume, functie, companie, istoric interactiuni, preferinte comunicare, proiecte anterioare, feedback acordat, nivel de satisfactie, potential de dezvoltare colaborare.

**c) Detalii servicii oferite:** portofoliu complet cu specificatii tehnice, termene de executie, resurse necesare, subcontractori implicati, garantii post-serviciu.

**d) Context operational:** programari active, deadline-uri urgente, incidente in desfasurare, solicitari speciale in asteptare, stocuri materiale, disponibilitate echipe.

**e) Conversatii si intentii:** subiecte discutate, intrebari frecvente, obiectii intalnite, promisiuni facute, follow-up-uri programate.

**f) Informatii pietei si competitie:** tarife practicate de competitori, tendinte cerere, sezonalitate, reglementari noi, oportunitati identificate.

---

## 2. STRUCTURA MEMORIE PE TERMEN SCURT

Memoria pe termen scurt (MTS) retine contextul conversatiei curente si datele cu expirare imediata. Durata de viata: 24-72 ore, cu refresh la fiecare interactiune.

| Camp | Format | Exemplu |
|------|--------|---------|
| ID sesiune | UUID | SES-2024-0615-084732 |
| Canal comunicare | Enum | WhatsApp / Telefon / Email / Formular web |
| Timestamp initiere | ISO 8601 | 2024-06-15T08:47:32+03:00 |
| Nume interlocutor | Text | "Andrei Popescu, director tehnic la Construcții Delta SA" |
| Scop contact | Categorie | "Solicitare oferta servicii de curățare industrială" |
| Obiecte discutie | Lista ordonata | 1. Suprafață 2.400 mp hala 2. Termen execuție 5 zile 3. Disponibilitate săptămâna viitoare |
| Stare conversatie | Status | "În așteptare documentație tehnică" |
| Actiuni promise | Lista cu deadline | "- Trimite oferta până miercuri 12:00" |
| Emotie detectata | Scala 1-5 | 4 (client nerăbdător, presiune timp) |
| Conflict potentia | Boolean | TRUE - client a menționat preț mai mic la competitorul CleanPro |

**Regula de arhivare MTS:** La finalizare conversatie, datele se evalueaza pentru promovare in MTL sau stergere. Promovarea necesita scor de relevanta ≥ 3/5.

---

## 3. STRUCTURA MEMORIE PE TERMEN LUNG

Memoria pe termen lung (MTL) stocheaza informatii cu valabilitate extinsa, organizata pe patru straturi:

**Stratul Factual (permanent):**
- Fisa companiei Test SRL: infiintata 2012, 47 angajati, 3 sedii (Bucuresti, Cluj, Timisoara), cifra afaceri 2023: 4.2 milioane RON
- Gama servicii: curatare industriala, dezinfectie, deratizare, dezinsectie, curatare fatade, intretinere spatii verzi
- Echipamente proprii: 12 autospeciale, 3 platforme lucru la inaltime, drone inspectie

**Stratul Relational (actualizat lunar):**
- Baza clienti activi: 156 entitati, 23 cu contract cadru anual
- Top 10 clienti dupa valoare, contacti cheie, aniversari contracte
- Istoric litigii, reclamatii ANPC, rezolvari aplicare

**Stratul Operational (actualizat zilnic):**
- Calendar programari 90 zile in avans
- Stocuri consumabile si materiale active
- Incidente deschise si status rezolvare

**Stratul Invatare (actualizat continuu):**
- Pattern-uri intrebari clienti (clusterizate tematic)
- Eficacitate raspunsuri (rata conversie, satisfactie)
- Ajustari necesare proceduri

---

## 4. REGULI DE ACTUALIZARE MEMORIE

**4.1. Sursa si validitate:**
- Informatiile introduse manual de administratori au prioritate maxima
- Date extrase automat din conversatii necesita confirmare umana daca implica obligatii financiare sau contractuale
- Informatiile contradictorii se semnaleaza pentru clarificare, nu se suprascriu automat

**4.2. Frecventa actualizarii:**
| Tip informatie | Frecventa | Responsabil |
|----------------|-----------|-------------|
| Preturi servicii | La modificare tarif | Departament Vanzari |
| Program lucru / urgente | Zilnic, ora 07:00 | Dispecerat |
| Date clienti noi | In 24 ore de la prima interactiune | Agent AI + validare CRM |
| Stocuri materiale | In timp real | Sistem ERP integrat |
| Politici returnari/garantii | La revizuire interna | Management calitate |

**4.3. Mecanism de uitare controlata:**
- Date clienti inactivi 36 luni: arhivare, nu stergere
- Oferte nesusces nefinalizate: retinere 24 luni pentru analiza pierderi
- Conversatii nesemnificative (informatii generale, fara actiune): stergere post-30 zile

**4.4. Securitate si conformitate GDPR:**
- Consimtamant explicit pentru prelucrare date cu caracter personal
- Drept la uitare implementat: comanda "STERGE DATELE MELE" declanseaza procedura in 72 ore
- Jurnal modificari accesibil clientului la cerere

---

## 5. INFORMATII CRITICE BUSINESS

**5.1. Tarife standard (valabile 01.07.2024):**

| Serviciu | Unitate | Pret fara TVA | Conditii |
|----------|---------|---------------|----------|
| Curatare industriala hala | mp | 8-15 RON | Functie de grad murdarie, minim 500 mp |
| Dezinfectie spatii publice | mp | 5-12 RON | Include raport DSP la cerere |
| Deratizare | locatie | 350-900 RON | Functie de suprafata, 3 interventii incluse |
| Dezinsectie | locatie | 280-700 RON | Sezon aprilie-octombrie |
| Curatare fatada | mp vertical | 25-45 RON | Necesita inspectie prealabila |
| Intretinere spatii verzi | mp/luna | 3-8 RON | Contract minim 12 luni |

*Reduceri: 5% plata in avans, 10% contract anual, 15% pachet combinat 3+ servicii*

**5.2. Program si disponibilitate:**
- Program standard: L-V 08:00-18:00, S 09:00-14:00 (doar urgente)
- Dispecerat non-stop: 0372.123.456
- Interventii urgente: timp raspuns 2 ore in Bucuresti si Ilfov, 4 ore in Cluj/Timisoara, 24 ore national
- Programari standard: minim 48 ore in avans

**5.3. Politici esentiale:**
- Garantie servicii: 30 zile, reinterventie gratuita daca nu sunt indepliniti parametrii
- Anulare programare: gratuita cu 24 ore inainte, 50% taxa in termen mai scurt
- Acces locatie: clientul asigura utilitati functionale, iluminat, acces auto
- Subcontractare: maxim 30% din valoare contract, doar parteneri certificati
- Asigurare RCA servicii: 1.000.000 RON, Societatea de Asigurari X

---

## 6. RASPUNSURI STANDARD (10+ situatii frecvente)

**R1. Cerere oferta initiala:**
*"Buna ziua! Va multumim pentru interesul acordat Test SRL. Pentru a pregati oferta personalizata, avem nevoie de: tip spatiu/suprafata, localitate, serviciu dorit, termen dorit, frecventa (unica/recurenta). Un coleg va reveni cu oferta in maximum 24 ore lucratoare. Pentru urgente, apelati 0372.123.456."*

**R2. Intarziere echipa:**
*"Va informam ca echipa programata pentru [data/ora] intarzie aproximativ [X] minute din cauza [motiv]. Noua ora estimata: [ora]. Ne cerem scuze pentru inconvenient. Daca noua ora nu este convenabila, reprogramam la: [variante]."*

**R3. Reclamatie calitate:**
*"Ne pare rau ca serviciul nu a corespuns asteptarilor. Inregistram reclamatia numarul [R-XXXX] si programam reinterventie gratuita in maximum 48 ore. Daca doriti, un manager va contacta telefonic in 2 ore pentru detalii suplimentare."*

**R4. Solicitare pret mai mic:**
*"Intelegem importanta bugetului. Pretul afisat include: materiale certificate, echipamente profesionale, personal instruit, garantie 30 zile, raportare completa. Putem propune: [a] reducere 5% plata in avans [b] contract pe termen lung cu discount progresiv [c] pachet servicii combinate. Care varianta va intereseaza?"*

**R5. Disponibilitate imediata:**
*"Pentru astazi/termen urgent, verific disponibilitatea si revin in 15 minute. Alternativ, pentru interventii de urgenta (incident sanitar, risc biologic), dispeceratul nostru non-stop poate mobiliza echipa in 2 ore in zona acoperita. Cost suplimentar urgenta: 50% tarif standard. Confirmati solicitarea?"*

**R6. Confirmare programare:**
*"Confirmam programarea: [serviciu], [data], [interval orar], la adresa [adresa]. Contact responsabil: [nume], telefon [numar]. Echipa va sosi in uniforma Test SRL, cu ecuson identificare. Va rugam asigurati accesul si utilitatile. Pentru modificari, apelati cu 24 ore inainte."*

**R7. Intrebari certificate/substante:**
*"Utilizam exclusiv biocide autorizate de Ministerul Sanatatii si UE, conform Regulamentului (UE) nr. 528/2012. Fisele de securitate si certificatele de autorizare sunt disponibile la cerere. La finalul interventiei, primiti raport cu produsele aplicate, concentratii si timpi de actiune."*

**R8. Refuz serviciu (zona neacoperita/domeniu necorespunzator):**
*"Regretam, dar in prezent nu acoperim [zona/domeniu]. Zone active: Bucuresti, Ilfov, Cluj, Timisoara si raza 50 km. Pentru [domeniu], va recomandam [colaborator verificat, daca exista] sau [asociatie profesionala]. Va putem notifica cand extindem acoperirea?"*

**R9. Solicitare factura/contract:**
*"Documentele solicitate se emit in maximum 5 zile lucratoare de la finalizarea serviciului. Factura electronica se trimite pe emailul din contract. Pentru urgente contabile, contactati facturare@testsrl.ro cu numarul comenzii [CO-XXXX]."*

**R10. Feedback post-serviciu:**
*"Va multumim ca ati ales Test SRL! Va rugam acordati 2 minute pentru evaluare: [link scurt]. Fiecare feedback ne ajuta sa ne imbunatatim. Pentru orice nelamurire, managerul de cont [nume] este disponibil la [telefon]."*

**R11. Intrebare COVID/protocoale sanitare:**
*"Aplicam protocoale actualizate conform OMS si autoritatilor romane. Echipamentele de protectie sunt obligatorii pentru personal. La cerere, efectuam testare suprafete ATP si eliberam declaratie de dezinfectie. Nu efectuam teste PCR sau rapide."*

**R12. Prelungire contract:**
*"Contractul dumneavoastra [numar] expira in [data]. Pentru prelungire, oferim: [conditii preferentiale]. Un consultant va contacta cu 30 zile inainte de expirare. Pentru modificari de servicii sau frecventa, apelati direct [numar dedicat]."*

---

*Document actualizat: 15 iunie 2024 | Versiune: 3.2 | Aprobat: Director General Test SRL*