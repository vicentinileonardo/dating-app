const express = require('express');
const router = express.Router();
const db = require('./db/db.js');
const Interest = require('./models/interest.js');
const User = require('./models/user.js');

router.get('/search', async (req, res) => {
    
    let sexWanted = req.query.sexw; // Indica il sesso degli utenti da trovare
    let sexOrientation = req.query.sexo; // Indica l'orientamento sessuale degli utenti da trovare
    let etaMin = req.query.etamin; // Indica l'età minima degli utenti da trovare
    let etaMax = req.query.etamax; // Indica l'età massima degli utenti da trovare
    let relation = req.query.relation; // Indica se si vuole trovare utenti che cercano una relazione oppure no.
    let idUser = req.query.idUser;
    let interestsWanted; // Indica gli interessi che devono possedere gli utenti da trovare
    let users; // Array degli utenti trovati senza considerare gli interessi
    
    
    if(!(sexWanted == 'male') && !(sexWanted == 'female') && !(sexWanted == 'other') && !(sexWanted == 'not_selected')){
		res.statusMessage = "Il campo {Sesso} può contenere solamente i seguenti valori: male, female, other.";
        res.status(400).json({ error: 'Il campo {Sesso} può contenere solamente i seguenti valori: male, female, other, not_selected.' });
        return;
    }
    
    if(!(sexOrientation == 'straight') && !(sexOrientation == 'gay') && !(sexOrientation == 'not_selected')){
		res.statusMessage = "Il campo {Orientamento sessuale} può contenere solamente i seguenti valori: straight, gay, not_selected.";
        res.status(400).json({ error: 'Il campo {Orientamento sessuale} può contenere solamente i seguenti valori: straight, gay, not_selected.' });
        return;
    }
    
    if(!(etaMin) || !(etaMin == 'not_selected') && !(/\d/.test(etaMin))){ // Controllo che etaMin sia inserito o "not_selected" oppure un valore numerico intero.
		res.statusMessage = "Il campo {età minima} deve contenere un valore numerico intero o not_selected.";
        res.status(400).json({ error: 'Il campo {età minima} deve contenere un valore numerico intero o not_selected.' });
        return;
    }
    
    if(!(etaMax) || !(etaMax == 'not_selected') && !(/\d/.test(etaMax))){ // Controllo che etaMax sia inserito o "not_selected" oppure un valore numerico intero.
		res.statusMessage = "Il campo {età massima} deve contenere un valore numerico intero o not_selected.";
        res.status(400).json({ error: 'Il campo {età massima} deve contenere un valore numerico intero o not_selected.' });
        return;
    }
    
    if(etaMin && etaMin!="not_selected" && etaMax && etaMax!="not_selected"){
        if(etaMax<etaMin){
            res.statusMessage = "Il campo {età minima} deve essere minore del campo {età massima}.";
            return res.status(400).json({ error: "Il campo {età minima} deve essere minore del campo {età massima}." });
        }
        if(etaMin < 18 || etaMin > 99){
            res.statusMessage = "Il campo {età minima} deve essere compreso tra 18 e 99 (estremi inclusi).";
            return res.status(400).json({ error: "Il campo {età minima} deve essere compreso tra 18 e 99 (estremi inclusi)." });
        }
        if(etaMax < 18 || etaMax > 99){
            res.statusMessage = "Il campo {età massima} deve essere compreso tra 18 e 99 (estremi inclusi).";
            return res.status(400).json({ error: "Il campo {età massima} deve essere compreso tra 18 e 99 (estremi inclusi)." });
        }
    }
    
    if(!(relation) || !(relation == 'true') && !(relation == 'false')){
		res.statusMessage = "Il campo {relation} non può essere vuoto e può contenere solamente i seguenti valori: true, false.";
        res.status(400).json({ error: 'Il campo {relation} non può essere vuoto e può contenere solamente i seguenti valori: true, false.' });
        return;
    }

    if(req.query.intw){ // Se sono stati inseriti interessi nella richiesta GET (come stringa nel formato "1,2,3,...") vengono convertiti in un array di Numbers
        interestsWanted = String(req.query.intw).split(',').map(Number);
    }
    else{ // In caso negativo, viene creato un array vuoto
        interestsWanted = [];
    }
    
    if(sexWanted=='not_selected' && sexOrientation=='not_selected' && etaMin=='not_selected' && etaMax=='not_selected'){ // Se non ci sono parametri selezionati allora vengono ritornati utenti solamente in base a se vogliono una relazione o meno
        users = await User.find({idUser: { $ne: idUser }, wantsRelation: relation});
    }else if(sexWanted=='not_selected' || sexOrientation=='not_selected' || etaMin=='not_selected' || etaMax=='not_selected'){ // Se uno o più parametri non sono selezionati allora viene costruita una query che tiene conto solo dei parametri inseriti
        
        if(sexWanted =='not_selected'){
           sexWanted = {$exists: true};
        } 
        
        if(sexOrientation=='not_selected'){
            sexOrientation = {$exists: true};
        } 
        
        if(etaMin == 'not_selected'){
            etaMin = 18;
        }

        if(etaMax == 'not_selected'){
            etaMax = 99;
        }

        users = await User.find({idUser: { $ne: idUser }, sex: sexWanted, sex_orientation: sexOrientation, age: { $gte: etaMin, $lte: etaMax }, wantsRelation: relation});

    }else{ // Se tutti i parametri sono stati inseriti allora viene eseguita una ricerca in base ai parametri inseriti
        users = await User.find({idUser: { $ne: idUser }, sex: sexWanted, sex_orientation: sexOrientation, age: { $gte: etaMin, $lte: etaMax }, wantsRelation: relation});
    }

    users = users.map(user => {
        return {
            name: user.name,
            surname: user.surname,
            idUser: user.idUser,
            sex: user.sex,
            sex_orientation: user.sex_orientation,
            birthday: user.birthday,
            age: user.age,
            interests: user.interests,
            wantsRelation: user.wantsRelation
        }
    });
    
    if(interestsWanted.length <= 0){ // Se non sono stati inseriti interessi nei parametri
        if(users.length <= 0){ // ... e non sono stati trovati utenti nella ricerca, viene ritornato un messaggio di errore 404
            res.statusMessage = "Nessun utente con le caratteristiche richieste.";
            return res.status(404).json({ error: "Nessun utente con le caratteristiche richieste." });
        } 
        else return res.status(200).json(users); // ... e sono stati trovati utenti nella ricerca, vengono restituiti i dati degli users trovati
    }
    
    var acceptedUsers = []; // Array degli utenti trovati considerando anche gli interessi
    var isContained; // Variabile per indicare se un utente possiede l'interesse specificato nei parametri
    
    
    for(var x = 0; x < users.length; x++){ // Ciclo sugli utenti trovati nella ricerca
    
        isContained = true;
    
        for(var y = 0; y < interestsWanted.length; y++){ // Ciclo sugli interessi passati nei parametri
            if(!(users[x].interests.includes(interestsWanted[y]))){ // Se l'utente non possiede l'interesse attuale viene settata la variabile isContained in modo da non inserirlo in acceptedUsers poiché non possiede uno degli interessi specificati nei parametri della ricerca
                isContained = false;
                break;
            }
        }
        
        if(isContained) acceptedUsers.push(users[x]); // Se l'utente possiede tutti gli interessi specificati nei parametri, viene inserito nella lista degli utenti da ritornare
    }
    
    if(acceptedUsers.length <= 0){ // Se non sono presenti utenti con tutti i parametri specificati e con tutti gli interessi specificati, allora viene ritornato un errore 404
        res.statusMessage = "Nessun utente con le caratteristiche richieste.";
        return res.status(404).json({ error: "Nessun utente con le caratteristiche richieste." });
    } 
    else return res.status(200).json(acceptedUsers); // Se sono presenti utenti con tutti i parametri specificati e con tutti gli interessi specificati, allora viene ritornata la lista degli utenti con relativi dati
    
});

router.get('', async (req, res) => {
    let users;

    if(req.query.email == ""){
        res.statusMessage = "Il campo email non può essere vuoto.";
        return res.status(400).json('Il campo email non può essere vuoto.');
    }

    if(req.query.password == ""){
        res.statusMessage = "Il campo password non può essere vuoto.";
        return res.status(400).json('Il campo password non può essere vuoto.');
    }

    if (req.query.email && req.query.password) {
    
        //console.log(req.query.email);
        //console.log(req.query.password);
        users = await User.findOne({email: req.query.email});
        
        //console.log(users);
        
        if(!users){
            res.statusMessage = "Utente non trovato.";
            return res.status(404).json('Utente non trovato');
        }
        
        if(!(users.password === req.query.password)){
            res.statusMessage = "La password inserita non è corretta.";
            return res.status(401).json('La password inserita non è corretta');
        } 
    }else {
        users = await User.find({});
        users = users.map( (user) => {
            return {
                self: '/api/users/' + user.idUser,
                u_name: user.name,
                surname: user.surname,
                nickname: user.nickname,
                email: user.email,
                birthday: user.birthday,
		        age: user.age,
                sex: user.sex,
                sex_orientation: user.sex_orientation,
                bio: user.bio,
                wantsRelation: user.wantsRelation,
                interests: user.interests,
                sentMatches: user.sentMatches, 
                receivedMatches: user.receivedMatches, 
                confirmedMatches: user.confirmedMatches, 
                refusedMatches: user.refusedMatches     
            };
        });
    }
    
    return res.status(200).json(users);  
});

router.get('/:idUser', async (req, res) => {
    
    let idUser = parseInt(req.params.idUser, 10);
    
    //handling id invalido
    if (!Number.isInteger(idUser)) {
        res.status(400).json({ error: 'Field {idUser} must be a number' });
        return;
    }
    if (idUser <= 0) {
        res.status(400).json({ error: 'Field {idUser} must be a number greater than 0' });
        return;
    }

    //TODO: controllo cookies o tokens per autenticazione e error handling di conseguenza "401: unauthorized"
    //TODO: eventualmente riservare id specifici non accessibili(area riservata) "403:Forbidden"

    let user = await findById(idUser); //integrazione con mongoDB

    //handling utente non trovato
    if (!user) {
        res.status(404).json({ error : 'User not found' });
        return;
    } 
    
    user.self = '/api/users/' + user.idUser //aggiunta location risorsa
    
    //mapping per rimuovere i campi password e conferma password
    user = ( ({self, name, surname, email, birthday, age, sex, sex_orientation, nickname, bio, interests, sentMatches, receivedMatches, confirmedMatches, refusedMatches, wantsRelation}) => ({ self, name, surname, email, birthday, age, sex, sex_orientation, nickname, bio, interests, sentMatches, receivedMatches, confirmedMatches, refusedMatches, wantsRelation}) )(user);
        
    res.status(200).json(user);
});

router.post('', async (req, res) => {

    let user = {
        u_name: req.body.u_name,
        surname: req.body.surname,
        email: req.body.email,
        password: req.body.password,
        birthday: req.body.birthday,
	    age: getAge(req.body.birthday),
        sex: req.body.sex,
        sex_orientation: req.body.sex_orientation
    };

    let check_password = req.body.check_password
    
    // CONTROLLI SULL'INPUT
    
    
    if (!user.u_name || typeof user.u_name != 'string') {
		res.statusMessage = "Il campo {u_name} non può essere vuoto.";
        res.status(400).json({ error: 'Il campo {u_name} non può essere vuoto.' });
        return;
    }
    if (!hasOnlyLetters(user.u_name)) {
		res.statusMessage = "Il campo {u_name} non può contenere numeri o simboli speciali.";
        res.status(400).json({ error: 'Il campo {u_name} non può contenere numeri o simboli speciali.' });
        return;
    }
    if (!user.surname || typeof user.surname != 'string') {
		res.statusMessage = "Il campo {surname} non può essere vuoto.";
        res.status(400).json({ error: 'Il campo {surname} non può essere vuoto.' });
        return;
    }
    if (!hasOnlyLetters(user.surname)) {
		res.statusMessage = "Il campo {surname} non può contenere numeri o simboli speciali.";
        res.status(400).json({ error: 'Il campo {surname} non può contenere numeri o simboli speciali.' });
        return;
    }
    if (!user.email || typeof user.email != 'string') {
		res.statusMessage = "Il campo {email} non può essere vuoto.";
        res.status(400).json({ error: 'Il campo {email} non può essere vuoto.' });
        return;
    }
    if (!checkIfEmailInString(user.email)) {
		res.statusMessage = "Il campo {email} deve contenere un indirizzo e-mail valido.";
        res.status(400).json({ error: 'Il campo {email} deve contenere un indirizzo e-mail valido.' });
        return;
    }
    if (!user.password || typeof user.password != 'string' || user.password != check_password) {
		res.statusMessage = "Il campo {password} non deve essere vuoto e deve essere uguale al campo {check_password}.";
        res.status(400).json({ error: 'Il campo {password} non deve essere vuoto e deve essere uguale al campo {check_password}.' });
        return;
    }
    if (!user.birthday || typeof user.birthday != 'string' || !user.age) {
		res.statusMessage = "Il campo {birthday} non può essere vuoto.";
        res.status(400).json({ error: 'Il campo {birthday} non può essere vuoto e deve contenere una data valida.' });
        return;
    }
    if (user.age < 18) {
		res.statusMessage = "Il campo {birthday} indica un utente non maggiorenne.";
        res.status(400).json({ error: 'Il campo {birthday} indica un utente non maggiorenne.' });
        return;
    }
    if (user.age > 99) {
		res.statusMessage = "L'eta' non deve essere superiore a 99 anni";
        res.status(400).json({ error: "L'eta' non deve essere superiore a 99 anni" });
        return;
    }
    if (!user.sex || typeof user.sex != 'string') {
		res.statusMessage = "Il campo {sex} non può essere vuoto.";
        res.status(400).json({ error: 'Il campo {sex} non può essere vuoto.' });
        return;
    }
    if(!(user.sex == 'male') && !(user.sex == 'female') && !(user.sex == 'other')){
		res.statusMessage = "Il campo {sex} può contenere solamente i seguenti valori: male, female, other.";
        res.status(400).json({ error: 'Il campo {sex} può contenere solamente i seguenti valori: male, female, other.' });
        return;
    }
    if (!user.sex_orientation || typeof user.sex_orientation != 'string') {
		res.statusMessage = "Il campo {sex_orientation} non può essere vuoto.";
        res.status(400).json({ error: 'Il campo {sex_orientation} non può essere vuoto.' });
        return;
    }
    if(!(user.sex_orientation == 'straight') && !(user.sex_orientation == 'gay')){
		res.statusMessage = "Il campo {sex_orientation} può contenere solamente i seguenti valori: straight, gay.";
        res.status(400).json({ error: 'Il campo {sex_orientation} può contenere solamente i seguenti valori: straight, gay.' });
        return;
    }
    
    // DEBUG

    //console.log(user);
    
    // OPERAZIONI DB
    let isPresent;
   
    isPresent = await findByEmail(user.email);

    if(isPresent){  //this email is already registered, can't insert, return already
        res.statusMessage = "L'e-mail inserita è già utilizzata da un altro utente.";
        return res.status(409).json({ error: "L'e-mail inserita è già utilizzata da un altro utente." });
    } 

    let inserted;
    try{
        inserted = await insert(user);
         
        if(!inserted){
            res.statusMessage = "Errore server, utente non inserito";
            return res.status(500).json({ error: "Errore server, utente non inserito" });
        }
        
        res.location("/api/users/" + inserted.idUser).status(201).json(inserted);
    }
    catch(err){
        res.statusMessage = "Errore server";
        return res.status(500).json("Errore server");
    }

});

router.put('/:idUser', async (req, res) => {
    filterString = req.params.idUser;
    flagDelete = req.body.flagDelete;
    flagConfirmed = req.body.flagConfirmed;
    flagRefused = req.body.flagRefused;

    let userOLD = await User.findOne({idUser: filterString}, // Viene ricercato un utente con id specificato nel DB ...
        function(err){
            if (err) return res.status(500).send(err);
        });
    
    if (!userOLD) return res.status(404).json({error: "User not Found"}); // ... Se non è presente nel DB viene ritornato un messaggio di errore 404
    
    
    // Queste variabili temporanee contengono i valori che andranno a sostituire i vecchi valori dell'utente con l'id specificato
    var u_name_NEW;
    var surname_NEW;
    var nickname_NEW;
    var password_NEW;
    var birthday_NEW;
    var age_NEW;
    var sex_NEW;
    var sex_orientation_NEW;
    var wantsRelation_NEW;
    var bio_NEW;
    var interests_NEW;
    var sentMatches_NEW;
    var receivedMatches_NEW;
    var confirmedMatches_NEW;
    var refusedMatches_NEW;
    
    // Se sono stati inseriti valori nella PUT da modificare vengono assegnati alle corrispettive variabili. Se un parametro non è presente nella PUT viene assegnato il valore già presente nel DB.
    if(req.body.u_name){ u_name_NEW = req.body.u_name; }
    else { u_name_NEW = userOLD.name; }
    
    if(req.body.surname){ surname_NEW = req.body.surname; }
    else { surname_NEW = userOLD.surname; }
    
    if(req.body.nickname){ nickname_NEW = req.body.nickname; }
    else { nickname_NEW = userOLD.nickname; }
    
    if(req.body.password){ password_NEW = req.body.password; }
    else { password_NEW = userOLD.password; }
    
    if(req.body.birthday){ birthday_NEW = req.body.birthday; }
    else { birthday_NEW = userOLD.birthday; }
    
    try{
        age_NEW = getAge(birthday_NEW); // Calcolo dell'età dell'user in base alla data di nascita
    }
    catch(err){
        console.log("Errore legato alla funzione getAge.")
        console.log(err);
        return res.status(500).json({error: 'Errore server'});
    }
    
    if(req.body.sex){ sex_NEW = req.body.sex; }
    else { sex_NEW = userOLD.sex; }
    
    if(req.body.sex_orientation){ sex_orientation_NEW = req.body.sex_orientation; }
    else { sex_orientation_NEW = userOLD.sex_orientation; }
    
    if(req.body.wantsRelation){ wantsRelation_NEW = req.body.wantsRelation; }
    else { wantsRelation_NEW = userOLD.wantsRelation; }
    
    if(req.body.bio){ bio_NEW = req.body.bio; }
    else { bio_NEW = userOLD.bio; }
    
    if(req.body.interests){ interests_NEW = String(req.body.interests).split(',').map(Number); } // Gli interessi (passati come stringa nel formato "1,2,3,...") vengono convertiti in un array
    else { interests_NEW = userOLD.interests; }
    
    // CONTROLLI SUI VALORI INSERITI
    if (!hasOnlyLetters(u_name_NEW)) {
		res.statusMessage = "Il campo {u_name} non può contenere numeri o simboli speciali.";
        res.status(400).json({ error: 'Il campo {u_name} non può contenere numeri o simboli speciali.' });
        return;
    }
    if (!hasOnlyLetters(surname_NEW)) {
		res.statusMessage = "Il campo {surname} non può contenere numeri o simboli speciali.";
        res.status(400).json({ error: 'Il campo {surname} non può contenere numeri o simboli speciali.' });
        return;
    }
    if(Number.isNaN(age_NEW)){
        res.statusMessage = "Data di nascita non valida.";
        res.status(400).json({ error: "Data di nascita non valida." });
        return;
    }
    if (age_NEW < 18) {
		res.statusMessage = "L'età non deve essere minore di 18 anni.";
        res.status(400).json({ error: "L'età non deve essere minore di 18 anni." });
        return;
    }
    if (age_NEW > 99) {
		res.statusMessage = "L'eta' non deve essere superiore a 99 anni.";
        res.status(400).json({ error: "L'eta' non deve essere superiore a 99 anni." });
        return;
    }
    if(!(sex_NEW == 'male') && !(sex_NEW == 'female') && !(sex_NEW == 'other')){
		res.statusMessage = "Il campo {sex} può contenere solamente i seguenti valori: male, female, other.";
        res.status(400).json({ error: 'Il campo {sex} può contenere solamente i seguenti valori: male, female, other.' });
        return;
    }
    if(!(sex_orientation_NEW == 'straight') && !(sex_orientation_NEW == 'gay')){
		res.statusMessage = "Il campo {sex_orientation} può contenere solamente i seguenti valori: straight, gay.";
        res.status(400).json({ error: 'Il campo {sex_orientation} può contenere solamente i seguenti valori: straight, gay.' });
        return;
    }
    if(!(typeof wantsRelation_NEW == "boolean") && !(wantsRelation_NEW == 'true') && !(wantsRelation_NEW == 'false')){
		res.statusMessage = "Il campo {relation} non può essere vuoto e può contenere solamente i seguenti valori: true, false.";
        res.status(400).json({ error: 'Il campo {relation} non può essere vuoto e può contenere solamente i seguenti valori: true, false.' });
        return;
    }

    if(flagConfirmed){ //true
        if(req.body.confirmedMatches){
            let confirmedMatches_OLD = userOLD.confirmedMatches;
            confirmedMatches_NEW = confirmedMatches_OLD;

            let array = String(req.body.confirmedMatches).split(',').map(Number);

            for(let i in array){
                if(!checkInArray(confirmedMatches_OLD, array[i])){
                    confirmedMatches_NEW.push(array[i]);
                }
            }

            let receivedMatches_OLD = userOLD.receivedMatches;
            receivedMatches_NEW = receivedMatches_OLD;
            
            for(let i in array){
                let index = receivedMatches_NEW.indexOf(array[i]);
                if(index > -1){
                    receivedMatches_NEW.splice(index, 1);
                }
            }
        }else{
            confirmedMatches_NEW = userOLD.confirmedMatches;
            receivedMatches_NEW = userOLD.receivedMatches;
        }
    }else{ //false
        if(req.body.confirmedMatches){
            let confirmedMatches_OLD = userOLD.confirmedMatches;
            confirmedMatches_NEW = confirmedMatches_OLD;

            let array = String(req.body.confirmedMatches).split(',').map(Number);

            for(let i in array){
                if(!checkInArray(confirmedMatches_OLD, array[i])){
                    confirmedMatches_NEW.push(array[i]);
                }
            }

            let sentMatches_OLD = userOLD.sentMatches;
            sentMatches_NEW = sentMatches_OLD;
            
            for(let i in array){
                let index = sentMatches_NEW.indexOf(array[i]);
                if(index > -1){
                    sentMatches_NEW.splice(index, 1);
                }
            }
        }else{
            confirmedMatches_NEW = userOLD.confirmedMatches;
            sentMatches_NEW = userOLD.sentMatches;
        }
    }

    if(flagRefused){ //true
        if(req.body.refusedMatches){
            let refusedMatches_OLD = userOLD.refusedMatches;
            refusedMatches_NEW = refusedMatches_OLD;

            let array = String(req.body.refusedMatches).split(',').map(Number);

            for(let i in array){
                if(!checkInArray(refusedMatches_OLD, array[i])){
                    refusedMatches_NEW.push(array[i]);
                }
            }

            let receivedMatches_OLD = userOLD.receivedMatches;
            receivedMatches_NEW = receivedMatches_OLD;
            
            for(let i in array){
                let index = receivedMatches_NEW.indexOf(array[i]);
                if(index > -1){
                    receivedMatches_NEW.splice(index, 1);
                }
            }
        }else{
            refusedMatches_NEW = userOLD.refusedMatches;
            receivedMatches_NEW = userOLD.receivedMatches;
        }
    }else{ //false
        if(req.body.refusedMatches){
            let refusedMatches_OLD = userOLD.refusedMatches;
            refusedMatches_NEW = refusedMatches_OLD;

            let array = String(req.body.refusedMatches).split(',').map(Number);

            for(let i in array){
                if(!checkInArray(refusedMatches_OLD, array[i])){
                    refusedMatches_NEW.push(array[i]);
                }
            }

            let sentMatches_OLD = userOLD.sentMatches;
            sentMatches_NEW = sentMatches_OLD;
            
            for(let i in array){
                let index = sentMatches_NEW.indexOf(array[i]);
                if(index > -1){
                    sentMatches_NEW.splice(index, 1);
                }
            }
        }else{
            refusedMatches_NEW = userOLD.refusedMatches;
            sentMatches_NEW = userOLD.sentMatches;
        }
    }


    if(flagDelete){
        if(req.body.sentMatches){
            let sentMatches_OLD = userOLD.sentMatches;
            sentMatches_NEW = sentMatches_OLD;
            let array = String(req.body.sentMatches).split(',').map(Number);
            
            for(let i in array){
                let index = sentMatches_NEW.indexOf(array[i]);
                if(index > -1){
                    sentMatches_NEW.splice(index, 1);
                }
            }
        }else{
            sentMatches_NEW = userOLD.sentMatches;
        }

        if(req.body.receivedMatches){
            let receivedMatches_OLD = userOLD.receivedMatches;
            receivedMatches_NEW = receivedMatches_OLD;
            let array = String(req.body.receivedMatches).split(',').map(Number);
            
            for(let i in array){
                let index = receivedMatches_NEW.indexOf(array[i]);
                if(index > -1){
                    receivedMatches_NEW.splice(index, 1);
                }
            }
        }else{
            receivedMatches_NEW = userOLD.receivedMatches;
        }

    }else{
        if(req.body.sentMatches){
            let sentMatches_OLD = userOLD.sentMatches;
            sentMatches_NEW = sentMatches_OLD;
            let array = String(req.body.sentMatches).split(',').map(Number);
            
            for(let i in array){
                if(!checkInArray(sentMatches_OLD, array[i])){
                    sentMatches_NEW.push(array[i]);
                }
            }
            
        }else{
            sentMatches_NEW = userOLD.sentMatches;
        }
    
        if(req.body.receivedMatches){
            let receivedMatches_OLD = userOLD.receivedMatches;
            receivedMatches_NEW = receivedMatches_OLD;
            
            let array = String(req.body.receivedMatches).split(',').map(Number);
            
            for(let i in array){
                if(!checkInArray(receivedMatches_OLD, array[i])){
                    receivedMatches_NEW.push(array[i]);
                }
            }
            
        }else{
            receivedMatches_NEW = userOLD.receivedMatches;
        }
    }
    
    let userNEW = { // Costruzione dell'utente con i nuovi parametri
        name: u_name_NEW,
        surname: surname_NEW,
        nickname: nickname_NEW,
        password: password_NEW,
        birthday: birthday_NEW,
        age: getAge(birthday_NEW),
        sex: sex_NEW,
        sex_orientation: sex_orientation_NEW,
        wantsRelation: wantsRelation_NEW,
        bio : bio_NEW,
        interests: interests_NEW,
        sentMatches: sentMatches_NEW,
        receivedMatches: receivedMatches_NEW,
        confirmedMatches: confirmedMatches_NEW, 
        refusedMatches: refusedMatches_NEW
    };
    
    let updatedUser = await User.findOneAndUpdate({idUser: filterString}, userNEW, {
        new: true,
        useFindAndModify : false
    },
    function(err){
      if (err) return res.status(500).send(err);
    }
    );
    
    if (!updatedUser) return res.status(404).json({error: "User not Found"});
    
    //console.log(updatedUser);
    
    res.status(200).json(updatedUser);
});


router.delete('/:idUser', async (req,res) => {
    
    let filterString = parseInt(req.params.idUser, 10);	
    	
    //handling id invalido	
    if (!Number.isInteger(filterString)) {	
        res.status(400).json({ error: 'Il parametro {idUser} deve essere numerico' });	
        return;	
    }	
    if (filterString < 0) {	
        res.status(400).json({ error: 'Il parametro {idUser} deve essere maggiore di 0' });	
        return;	
    }
    
    let userExists = await findById(req.params.idUser);
    
    if(userExists) {
        User.findOneAndDelete({idUser: filterString }, function (err, docs) { 
            if (err){ 
                console.log(err);
                return res.status(500).json({error: 'Errore server'});
            } 
            else{ 
                console.log("Utente cancellato: ", docs); 
                res.status(204).json({message: 'Utente con id ' + filterString + 'eliminato con successo'});
            } 
        }); 
    }
    else return res.status(404).json({error: 'Utente non trovato'});
});

// Funzione per il controllo della struttura della e-mail inserita.
// https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function checkIfEmailInString(text) {
    // eslint-disable-next-line
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(text);
}

// Funzione per il controllo della maggiore età sulla data di nascita.
function ageCheck() {
    var currentdate = new Date();
    var yyyy=currentdate.getFullYear()-18;
    var mm;
    var gg;
    if(currentdate.getMonth()<10){
      mm="0"+(currentdate.getMonth()+1);
    }else{
      mm=(currentdate.getMonth()+1);
    }
    if(currentdate.getDate()<10){
      gg="0"+currentdate.getDate();
    }else{
      gg=currentdate.getDate();
    }

    var datetime =  yyyy + "-"
                  + mm + "-"
                  + gg;
    return datetime;
}

// Funzione per calcolare l'età di un utente dalla data di nascita
function getAge(dateString) { // dateString dovrebbe essere o una Date oppure una stringa nel formato "yyyy-mm-dd"

  var now = new Date();

  var yearNow = now.getFullYear();
  var monthNow = now.getMonth();
  var dateNow = now.getDate();

  var yearBirth;
  var monthBirth;
  var dateBirth;
  
  //console.log(typeof dateString);
  
  if(!dateString){
    return NaN;
  }

  if(dateString instanceof Date){
    yearBirth = dateString.getFullYear();
    monthBirth = dateString.getMonth();
    dateBirth = dateString.getDate();
  }
  else{
    
    if(!hasOnlyNumbers(dateString.substring(0,4)) || !hasOnlyNumbers(dateString.substring(5,7)) || !hasOnlyNumbers(dateString.substring(8,10)) || dateString.length != 10){ // Controllo che la stringa della data contenga solo valori numerici interi nella sua struttura, in caso negativo la funzione ritorna NaN
        return NaN;
    }
    
    // Prelevo i valori numerici dalla struttura della stringa
    yearBirth = parseInt(dateString.substring(0,4));
    monthBirth = parseInt(dateString.substring(5,7));
    dateBirth = parseInt(dateString.substring(8,10));
    
    if(Number.isNaN(yearBirth) || Number.isNaN(monthBirth) || Number.isNaN(dateBirth)){ // Controllo che ogni valore della data sia stato correttamente rilevato, in caso negativo la funzione ritorna NaN
        return NaN;
    }
  }
  
  age = yearNow - yearBirth;

  if ( monthNow < (monthBirth - 1)){ age--; }
  if (((monthBirth - 1) == monthNow) && (dateNow < dateBirth)){ age--; }
  
  return age;
}

// Funzione per controllare che una stringa contiene solamente lettere e non numeri o caratteri speciali.
function hasOnlyLetters(string){
    return /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u.test(string);
}

// Funzione per controllare che una stringa possiede solamente valori numerici interi.
function hasOnlyNumbers(string){
    return /^\d+$/.test(string);
}

function checkInArray(arrayOLD, value){
    for(let i in arrayOLD){
        if(arrayOLD[i] == value)
            return true;
    }

    return false;
}

function findByEmail(userEmail){
   
    try{
        return User.findOne({email: userEmail})
    }
    catch (err) {
        //console.log(JSON.stringify(err));
        return false;
    }

}

function insert(user){

    const utente = new User({
        name: user.u_name,
        surname: user.surname,
        email: user.email,
        password: user.password,
        birthday: user.birthday,
        age: user.age,
        sex: user.sex,
        sex_orientation: user.sex_orientation,
        wantsRelation: true
    });

    return utente.save();

}

function findById(idUser){
    try {
        return User.findOne({idUser:idUser})
    }
    catch (err) {
        //console.log(JSON.stringify(err));
        return false;
    }
}

function checkPassword(email, psw) {
    let user = findByEmail(email);

    if(!user) {
        return 2;                   //the user does not exist, must register first
    } else if(user.psw != psw) {
        return 1;                   //the password is not correct
    }
    return 0;                       //the password is correct
}

function getUser(email) {
    let user = findByEmail(email)
    return userDTO(user);
}

module.exports = router;
