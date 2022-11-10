const express = require('express');
const router = express.Router();
const db = require('./db/db.js');
const Interest = require('./models/interest.js');
const User = require('./models/user');

router.get('', async (req, res) => {
    let interests = await getAllInterests();
    interests = interests.map( (interest) => {
        return {
            self: '/api/interests/' + interest.idInterest,
            name: interest.name,
            description: interest.description
        };
    });
    res.status(200).json(interests);   
});

router.get('/:idInterest', async (req, res) => {
    let idInterest = parseInt(req.params.idInterest, 10);
    
    if (!Number.isInteger(idInterest)) {
        return res.status(400).json({ error: "L'id deve essere numerico" });
    }
    if (idInterest < 0) {
        return res.status(400).json({ error: "L'id deve essere un valore intero maggiore di 0" });
    }
    
    let interest = await findInterestById(idInterest);
    
    if (!interest) {
        return res.status(404).json({ error : 'Interesse non trovato' });
    }
    
    interest.self = '/api/interests/' + interest.idInterest;
    
    interest = ( ({self, name, description  }) => ({ self, name, description }) )(interest);

    return res.status(200).json(interest);
});

router.delete('/:idInterest', async (req,res) => {
    let filterString = req.params.idInterest;
    console.log(filterString);
    let interestExists = await findInterestById(req.params.idInterest);
    
    if(interestExists) {
        await Interest.findOneAndDelete({idInterest: filterString }, function (err, docs) { 
            if (err){ 
                console.log(err);
                return res.status(500).json({error: 'Errore server'});
            } 
            else{ 
                console.log("Interesse cancellato: ", docs); 
                res.status(204).json({message: 'Interesse con id ' + filterString + ' eliminato con successo'});
            } 
        }); 
    }
    else {
        return res.status(404).json({error: 'Interesse non trovato'});
    }
});

router.post('', async (req, res) => {
    let interest = {
        name:  req.body.name,
        description: req.body.description
    };

    // CONTROLLI SULL'INPUT

    if (!interest.name || typeof interest.name != 'string') {
        res.status(400).json({ error: 'Il campo {name} non può essere vuoto.' });
        return;
    }
    if (!hasOnlyLetters(interest.name)) {
        res.status(400).json({ error: 'Il campo {name} non può contenere numeri o simboli speciali.' });
        return;
    }
    if (!interest.description || typeof interest.description != 'string') {
        res.status(400).json({ error: 'Il campo {description} deve essere una stringa non vuota.' });
        return;
    }
    
    try{
        let interestExist = await findInterestByName(interest.name);
              
        if(interestExist){
            res.statusMessage = "L'interesse che sta provando ad inserire è già presente nel database";
            res.status(409).json({ error: "L'interesse che sta provando ad inserire è già presente nel database" });
            return;
        }
        interest = await insertInterest(interest);

        res.location("/api/interests/" + interest.idInterest).status(201).json(interest);
    }
    catch(err){
        res.status(500).send();
    }
});

router.put('/:idInterest', async(req, res) => {
	let interest = {
		idInterest: parseInt(req.params.idInterest, 10),
		name: req.body.name,
		description: req.body.description
	};

	if (!Number.isInteger(interest.idInterest)) {
		return res.status(400).json({ error: "L'id deve essere numerico" });
	}

    if (interest.idInterest <= 0) {
    	return res.status(400).json({ error: "L'id deve essere un valore intero maggiore di 0" });
	}

	if (!interest.name || typeof interest.name != 'string') {
        return res.status(400).json({ error: 'Il campo {name} non può essere vuoto.' });
    }

    if (!hasOnlyLetters(interest.name)) {
        return res.status(400).json({ error: 'Il campo {name} non può contenere numeri o simboli speciali.' });
    }

    if (!interest.description || typeof interest.description != 'string') {
        return res.status(400).json({ error: 'Il campo {description} deve essere una stringa non vuota.' });
    }

	let interestToUpdate = await Interest.findOneAndUpdate({idInterest: interest.idInterest}, interest, {new:true, useFindAndModify:false}, function(err) {if(err){return res.status(500).send(err);}});

	if(!interestToUpdate) {
		return res.status(404).json({ error : 'Interesse non trovato' });
	}

	return res.status(200).json(interestToUpdate);
});

router.get('/:idInterest/users', async (req, res) => {
    let idInterest = req.params.idInterest;
    
    console.log(idInterest); // DEBUG
    
    let users = await User.find({});
    users = users.map(user => {
        return {
            self: '/api/users/' + user.idUser,
            idUser: user.idUser,
            interests: String(user.interests).split(',').map(Number) // è necessario che interest sia inserito nel db nel formato "1,2,3"
        }
    });
    
    let usersWithInterest = [];
    
    for (var x = 0; x < users.length; x++) { // Controllo tutti gli utenti
        for (var y = 0; y < users[x].interests.length; y++) { // Controllo tutti gli interessi dell'utente
            if(users[x].interests[y] == idInterest){ // Se l'utente possiede l'interesse con l'iid specificato
                usersWithInterest.push(users[x].idUser); // Lo aggiungo alla lista degli utenti con quell'interesse
                break; // Smetto di controllare gli interessi di questo utente
            } 
        }
    }
        
    console.log(usersWithInterest); // DEBUG
    
    if(usersWithInterest.length <= 0) return res.status(404).json({ error: "Nessun utente con interesse " + idInterest + " trovato" });
    else return res.status(200).json(usersWithInterest);
});

// Funzione per controllare che una stringa contiene solamente lettere e non numeri o caratteri speciali.
function hasOnlyLetters(string){
    return /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u.test(string);
}

function insertInterest(interest) {
    let interesse = new Interest({
        name: interest.name,
        description: interest.description
    });

    return interesse.save();
}

function findInterestByName(name) {
    return Interest.findOne({name: name});
}

function findInterestById(idInterest) {
    return Interest.findOne({idInterest: idInterest});
}

function getAllInterests() {
    return Interest.find();
}

module.exports = router;
