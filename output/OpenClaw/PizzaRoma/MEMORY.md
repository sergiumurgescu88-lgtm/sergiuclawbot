# MEMORY - PizzaRoma

## 1. CE MEMOREAZA AGENTUL (tipuri de informatii)

Agentul AI al PizzaRoma memoreaza sase categorii principale de informatii pentru a asigura o experienta personalizata si eficienta pentru fiecare client. Prima categorie vizeaza **datele clientului**: nume complet, numar de telefon, adrese de livrare preferate (acasa, serviciu, adrese ale prietenilor/familiei), istoricul comenzilor complete cu datele exacte, preferintele alimentare (alergii, intolerante, produse evitate), si modalitatea preferata de plata. A doua categorie se refera la **contextul conversatiei curente**: intentia clientului in momentul respectiv, produsele adaugate in cosul virtual, intrebarile formulate de client si raspunsurile oferite deja pentru a evita repetitiile, precum si eventualele probleme semnalate in timpul interactiunii. A treia categorie acopera **preferintele comportamentale**: frecventa comenzilor, zilele si intervalele orare preferate, valoarea medie a comenzilor, tendinta de a comanda individual sau in grup, si receptivitatea la promotii. A patra categorie memoreaza **feedback-ul si reclamatiile**: evaluarile acordate produselor, sesizarile privind calitatea sau livrarea, si rezolutiile aplicate. A cincea categorie retine **informatii despre sesiunile abandonate**: cosuri nefinalizate cu motivele probabil identificate (pret prea mare, timp de asteptare perceput ca lung, indoieli privind produsele). A sasea categorie pastreaza **date agregate despre tendinte**: produse sezoniere populare, combinatii frecvente de produse, si cereri speciale recurente care ar putea influenta oferta viitoare.

---

## 2. STRUCTURA MEMORIE PE TERMEN SCURT

Memoria pe termen scurt functioneaza ca un buffer activ pentru sesiunea curenta de conversatie si are o durata de viata de maximum 24 de ore de la ultima interactiune. Aceasta este organizata pe trei niveluri. **Nivelul conversatiei active** stocheaza: identificatorul unic al sesiunii, timestamp-ul fiecarui mesaj, intentia detectata la fiecare pas (salut, informare, comandare, reclamatie, intrebare), entitatile extrase (produse mentionate, cantitati, modificari), si starea cosului de cumparaturi in timp real. **Nivelul contextului situational** retine: canalul de comunicare utilizat (aplicatie proprie, WhatsApp, telefon, website), dispozitivul clientului (mobil/desktop), locatia aproximativa detectata pentru estimarea timpului de livrare, si daca este o comanda programata pentru alt moment sau imediata. **Nivelul de rezolutie a ambiguitatilor** memoreaza: produse cu denumiri similare despre care clientul a aratat interes, intrebari la care agentul nu a putut raspunde cu certitudine si pentru care a promis revenirea, si confirmari asteptate din partea clientului (de exemplu, acceptarea unui inlocuitor pentru un produs indisponibil). La finalizarea comenzii sau inchiderea conversatiei, datele relevante sunt transferate in memoria pe termen lung, iar restul sunt eliminate automat pentru a optimiza resursele.

---

## 3. STRUCTURA MEMORIE PE TERMEN LUNG

Memoria pe termen lung este arhitectata ca o baza de date relationala cu actualizare continua si stocare persistenta. **Profilul clientului (retentie: permanenta)** contine: identificator anonimizat, data primei interactiuni, numarul total de comenzi, valoarea cumulata, segmentul de client (ocazional, regulat, VIP, inactiv), si scorul de loialitate calculat dinamic. **Istoricul detaliat al comenzilor (retentie: 3 ani)** include: fiecare comanda cu data, ora, produsele exacte cu personalizarile aplicate, pretul platit, metoda de plata, timpul de livrare efectiv versus estimat, si statusul final (livrata cu succes, anulata, returnata). **Arborele preferintelor gastronomice (retentie: actualizare continua)** mapeaza: tipurile de crusta preferate, topping-urile frecvent adaugate sau eliminate, nivelul de condimente preferat, produsele niciodata comandate (posibile aversiuni), si produsele noi incercate cu evaluarea implicita (comandate repetat sau abandonate dupa o singura incercare). **Jurnalul interactiunilor cu serviciul clienti (retentie: 5 ani)** inregistreaza: toate conversatiile, timpii de raspuns, satisfactia declarata sau inferata, escaladarile catre operatori umani cu motivul si rezolutia, si compensatiile acordate. **Modelul predictiv individual (retentie: regenerare saptamanala)** sintetizeaza: probabilitatea de comanda in urmatoarele 7/14/30 de zile, produsele cu cel mai mare potential de interes, momentul optim pentru trimiterea unei oferte personalizate, si riscul de abandon al clientului.

---

## 4. REGULI DE ACTUALIZARE MEMORIE

Actualizarea memoriei urmeaza protocoale stricte pentru a asigura acuratetea si conformitatea cu GDPR. **Regula prioritatii sursei**: informatiile declarate explicit de client suprascriu inferentele agentului; informatiile din sistemul de comenzi suprascriu ambele; exceptie fac datele de contact unde confirmarea prin SMS sau email este obligatorie. **Regula granularitatii**: fiecare inregistrare primeste un nivel de incredere (1-5) si o sursa documentata; informatiile cu incredere sub 3 sunt marcate pentru verificare si nu declanseaza actiuni automate. **Regula temporalitatii**: preferintele alimentare sunt reconfirmate anual; adresele de livrare sunt validate la fiecare a treia utilizare sau la sesizarea unui esec de livrare; datele de contact sunt verificate la fiecare 6 luni prin mesaj pasiv (de exemplu, "Apasati 1 pentru a confirma ca acesta este inca numarul dumneavoastra"). **Regula anonimizarii**: la 3 ani de inactivitate, profilul este pseudonimizat (numele real inlocuit cu identificator numeric, numarul de telefon partial mascat); la 5 ani de inactivitate, datele personale sunt sterse, pastrandu-se doar statistici agregate. **Regula opt-out-ului**: orice client poate solicita stergerea completa prin comanda "Sterge datele mele" sau echivalent; confirmarea se face in maximum 72 de ore cu raport de executie. **Regula sincronizarii**: modificarile din memoria pe termen scurt se propaga in cea lunga in maximum 15 minute dupa inchiderea sesiunii; conflictele sunt rezolvate prin timestamp, cu notificare catre administrator daca discrepanta este majora.

---

## 5. INFORMATII CRITICE BUSINESS

Aceste informatii sunt stocate in memorie cu acces imediat si actualizare in timp real, avand prioritate maxima in raspunsuri.

**Program si zone**: Luni-Joi 10:00-23:00, Vineri-Sambata 10:00-24:00, Duminica 11:00-22:30. Livrare gratuita in raza de 3 km pentru comenzi peste 50 lei; intre 3-6 km, taxa 10 lei sau livrare gratuita peste 80 lei. Zonele limitrofe doar ridicare personala.

**Structura preturi**: Pizza clasica 32-45 lei (Margherita 32, Quattro Formaggi 42, Capricciosa 40, Diavola 45); pizza premium 48-58 lei (trufe, fructe de mare, prosciutto crudo); paste 28-38 lei; salate 24-32 lei; deserturi 16-22 lei; bauturi racoritoare 8-14 lei; bere artizanala 12-18 lei.

**Politici comanda**: timp estimat de preparare 20-30 minute, livrare 15-40 minute in functie de zona. Comanda minima pentru livrare: 35 lei. Acceptam plata cash, card la livrare, card online, Revolut, Google Pay. Reducere 10% pentru ridicare personala. Program fidelitate: 1 punct la fiecare 10 lei cheltuiti, 100 puncte = 20 lei reducere.

**Politici speciale**: alergenii sunt specificati obligatoriu pentru fiecare produs la solicitare; modificarea ingredientelor este posibila cu exceptia preparatelor marcate "reteta fixa" (pizza Quattro Formaggi, tiramisu); produsele cu alcool nu se livreaza catre persoane sub 18 ani (verificare la livrare). Reclamatii: daca produsul nu corespunde descrierii sau este deteriorat in transport, se inlocuieste gratuit sau se acorda voucher echivalent; pentru intarzieri peste 20 minute fata de estimare, se acorda automat 15% reducere la urmatoarea comanda.

---

## 6. RASPUNSURI STANDARD (10+ situatii frecvente)

**1. Salut initial**: "Buna ziua si bine ati venit la PizzaRoma! 🍕 Sunt asistentul digital si va ajut cu comanda, informatii sau orice intrebare aveti. Cu ce va pot fi de ajutor astazi?"

**2. Client necunoscut returnat**: "Bine ati revenit la PizzaRoma! Ultima data ati comandat [produs principal] pe [data]. Doriti sa repetati comanda sau explorati meniul?"

**3. Client fidel identificat**: "Buna ziua, [nume]! Va multumim ca sunteti alaturi de noi — aveti deja [X] puncte in cont. Comanda dumneavoastra obisnuita, [produs frecvent], este disponibila. O adaugam?"

**4. Produs indisponibil**: "Ne pare rau, [produs] nu este momentan disponibil din cauza [motiv scurt: lipsa ingredient proaspat/termen de valabilitate]. Va recomandam [alternativa 1] cu profil similar sau [alternativa 2], foarte apreciata de clienti cu preferinte asemanatoare. Asteptam confirmarea dumneavoastra."

**5. Intarziere livrare**: "Va informam ca livrarea comenzii [numar] va intarzia aproximativ [X] minute din cauza [trafic intens/volum mare comenzi]. Ne cerem scuze pentru inconvenient; conform politicii noastre, beneficiati automat de 15% reducere la urmatoarea comanda, aplicata in cont."

**6. Reclamatie calitate**: "Ne pare foarte rau pentru experienta neplacuta. Pentru a rezolva rapid: puteti descrie problema sau trimite o fotografie? Oferim inlocuire imediata cu livrare prioritara sau voucher integral pentru produsul respectiv, la alegerea dumneavoastra."

**7. Solicitare modificare ingrediente**: "Confirmam: doriti [pasta/pizza] [nume] fara [ingredient eliminat], cu extra [ingredient adaugat]. Costul suplimentar este [0/3/5] lei. Modificarea este posibila / Nu putem aplica aceasta modificare deoarece [produsul face parte din retetele fixe/motiv tehnic]."

**8. Comanda grup/nerulata**: "Pentru comenzi de grup, va propunem: consultati meniul si imi comunicati selectiile, sau trimiteti acest link [link] prietenilor pentru a adauga independent in cosul comun. Confirm finalul cand sunteti gata."

**9. Intrebare alergeni**: "[Produs] contine explicit: [lista alergeni din reteta]. Nu contine [alergen solicitat], insa va informam ca lucram intr-o bucatarie unde se manipuleaza [gluten/lactoza/fructe de mare/nuci] — risc de contaminare incrucisata nu poate fi eliminat complet."

**10. Inchidere conversatie fara comanda**: "Va multumim pentru interesul acordat PizzaRoma! Daca doriti sa reveniti, comanda anterioara ramane salvata 24 de ore. O zi minunata!"

**11. Solicitare stergere date**: "Am inregistrat solicitarea de stergere a datelor personale. In maximum 72 de ore veti primi confirmarea completa pe email/SMS. Pana atunci, puteti continua sa utilizati serviciul normal."

**12. Program sarbatori/exceptii**: "In [data/sarbatoare], PizzaRoma functioneaza cu program special: [ore modificate]. Recomandam plasarea comenzii in avans pentru a garanta intervalul preferat. Meniul complet este disponibil / Meniul este limitat la [categorie] in aceasta perioada."