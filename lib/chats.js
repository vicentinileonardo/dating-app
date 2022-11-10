const express = require('express');
const router = express.Router();
const db = require('./db/db.js');
const Chat = require('./models/chat.js');
const User = require('./models/user.js');

router.get('', async(req, res) => {
	let idUserSend = parseInt(req.query.idUserSend, 10);
    let idUserRecv = parseInt(req.query.idUserRecv, 10);
    
    //console.log(idUserSend);
    //console.log(idUserRecv);

	if(!Number.isInteger(idUserSend)) {
		res.status(400).json({error: 'Il parametro {idUserSend} deve essere un numero'});
		return;
	}

	if(idUserSend <= 0) {
		res.status(400).json({error: 'Il parametro {idUserSend} deve essere maggiore di 0'});
		return;
	}
	
	if(!(await doesUserExist(idUserSend))) {
		res.status(403).json({error: 'Utente sender non esiste'});
		return;
	}

	if(!Number.isInteger(idUserRecv)) {
		res.status(400).json({error: 'Il parametro {idUserRecv} deve essere un numero'});
		return;
	}

	if(idUserRecv <= 0) {
		res.status(400).json({error: 'Il parametro {idUserRecv} deve essere maggiore di 0'});
		return;
	}
	
	if(!(await doesUserExist(idUserRecv))) {
		res.status(403).json({error: 'Utente receiver non esiste'});
		return;
	}
	
    let chat = await getChatBetweenTwoUsers(idUserSend, idUserRecv);
    if(chat){
        chat = chatDTO(chat);
	    res.status(200).json(chat);
    }else{
        res.status(404).json({error: 'La chat tra utente con {idUserSend} e utente con {idUserRecv} non esiste'});
		return;
    }
});

router.get('/:idUserSend', async(req, res) => {
	let idUserSend = parseInt(req.params.idUserSend, 10);

	if(!Number.isInteger(idUserSend)) {
		res.status(400).json({error: 'Il parametro {idUserSend} deve essere un numero intero'});
		return;
	}

	if(idUserSend <= 0) {
		res.status(400).json({error: 'Il parametro {idUserSend} deve avere un valore superiore a 0'});
		return;
	}
	
	if(!(await doesUserExist(idUserSend))) {
		res.status(403).json({error: 'L\'utente non esiste'});
		return;
	}
	
	let chats = await getChatsOfUser(idUserSend);

	for(let i=0; i<chats.length ;i++) {
		chats[i] = chatDTO(chats[i]);
	}

	res.status(200).json(chats);
});

router.get('/:idUserSend/:idChat', async(req, res) => {
	let idUserSend = parseInt(req.params.idUserSend, 10);
	let idChat = parseInt(req.params.idChat, 10);

	if(!Number.isInteger(idUserSend)) {
		res.status(400).json({error: 'Il campo {idUserSend} deve essere un numero'});
		return;
	}

	if(idUserSend <= 0) {
		res.status(400).json({error: 'Il campo {idUserSend} deve essere un numero maggiore di 0'});
		return;
	}

	if(!Number.isInteger(idChat)) {
		res.status(400).json({error: 'Il campo {idChat} deve essere un numero'});
		return;
	}

	if(idChat <= 0) {
		res.status(400).json({error: 'Il campo {idChat} deve essere un numero maggiore di 0'});
		return;
	}

	if((await doesUserExist(idUserSend)) == null) {
		res.status(403).json({error: 'L\'utente con id {idUserSend} non esiste'});
		return;
	}

	let chat = await getChat(idChat);

	if(!chat) {
		res.status(404).json({error: 'La chat con id uguale a {idChat} non esiste'});
		return;
	}

	chat = chatDTO(chat);
	res.status(200).json(chat);
});

router.post('', async(req, res) => {
	let idUserSend = parseInt(req.body.idUserSend, 10);
	let idUserRecv = parseInt(req.body.idUserRecv, 10);

	if(!Number.isInteger(idUserSend)) {
		res.status(400).json({error: 'Il campo {idUserSend} deve essere un numero'});
		return;
	}

	if(idUserSend <= 0) {
		res.status(400).json({error: 'Il campo {idUserSend} deve essere un numero maggiore di 0'});
		return;
	}

	if(!Number.isInteger(idUserRecv)) {
		res.status(400).json({error: 'Il campo {idUserRecv} deve essere un numero'});
		return;
	}

	if(idUserRecv <= 0) {
		res.status(400).json({error: 'Il campo {idUserRecv} deve essere un numero maggiore di 0'});
		return;
	}

	if(idUserSend == idUserRecv) {
		res.status(403).json({error: 'Il campo {idUserSend} non deve essere uguale a {idUserRecv}'});
		return;
	}

	let ret = await createChat(idUserSend, idUserRecv);
	
	if(ret.serverError) {
		res.status(500).json({error: 'Errore del server'});
		return;
	} else if(ret.chatAlreadyExist) {
		res.status(409).json({error: 'Questa chat è già esistente'});
		return;
	} else if(ret.firstUserDoesntExist) {
		res.status(403).json({error: 'L\'utente con id {idUserSend} non è registrato'});
		return;
	} else if(ret.secondUserDoesntExist) {
		res.status(403).json({error: 'L\'utente con id {idUserRecv} non è registrato'});
		return;
	}

	ret.chat = chatDTO(ret.chat);
	res.location('/api/chats/' + idUserSend + '/' + ret.chat.idChat).status(201).json(ret.chat);
});

router.put('/:idUserSend/:idChat', async(req, res) => {
	let idUserSend = parseInt(req.params.idUserSend, 10);
	let idChat = parseInt(req.params.idChat, 10);
    let msg = req.body.message;
    let time = req.body.time;

	if(!Number.isInteger(idUserSend)) {
		res.status(400).json({error: 'Il parametro {idUserSend} deve essere un numero intero'});
		return;
	}

	if(idUserSend <= 0) {
		res.status(400).json({error: 'Il parametro {idUserSend} deve essere un valore superiore a 0'});
		return;
	}

	if(!Number.isInteger(idChat)) {
		res.status(400).json({error: 'Il parametro {idChat} deve essere un numero intero'});
		return;
	}

	if(idChat <= 0) {
		res.status(400).json({error: 'Il parametro {idChat} deve essere un valore superiore a 0'});
		return;
	}

	if(!msg) {
		res.status(400).json({error: 'Il campo {message} deve contenere qualcosa'});
		return;
	}
	
	if((await doesUserExist(idUserSend)) == null) {
		res.status(403).json({error: 'Utente non trovato'});
		return;
	}

	let chat = await getChat(idChat);

	if(!chat) {
		res.status(404).json({error: 'Chat non trovata'});
		return;
	}

	await addMessageToChat(chat, msg, time);

	chat = chatDTO(chat);
	res.status(200).json(chat);
});

router.put('/:idUserSend/:idChat/newMessages', async(req, res) => {
	let idUserSend = parseInt(req.params.idUserSend, 10);
	let idChat = parseInt(req.params.idChat, 10);

	if(!Number.isInteger(idUserSend)) {
		res.status(400).json({error: 'Il parametro {idUserSend} deve essere un numero intero'});
		return;
	}

	if(idUserSend <= 0) {
		res.status(400).json({error: 'Il parametro {idUserSend} deve avere un valore superiore a 0'});
		return;
	}

	if(!Number.isInteger(idChat)) {
		res.status(400).json({error: 'Il parametro {idChat} deve essere un numero intero'});
		return;
	}

	if(idChat <= 0) {
		res.status(400).json({error: 'Il parametro {idChat} deve avere un valore superiore a 0'});
		return;
	}
	
	if((await doesUserExist(idUserSend)) == null) {
		res.status(403).json({error: 'L\'utente non esiste'});
		return;
	}

	let chat = await getChat(idChat);

	if(!chat) {
		res.status(404).json({error: 'La chat non esiste'});
		return;
	}

	let newMessages = messagesDTO(chat.newMessages);
	for(let i=0; i<newMessages.length ;i++) {
		chat.messages.push(newMessages[i]);
	}
	chat.newMessages = [];
	await updateChat(chat);

	chat = chatDTO(chat);
	res.status(200).json(chat);
});

router.delete('/:idUserSend/:idChat', async(req, res) => {
	let idUserSend = parseInt(req.params.idUserSend, 10);
	let idChat = parseInt(req.params.idChat, 10);
	let deleteForBothUsers = req.body.deleteForBothUsers;

	if(!Number.isInteger(idUserSend)) {
		res.status(400).json({error: 'Il campo {idUserSend} deve essere un numero'});
		return;
	}

	if(idUserSend <= 0) {
		res.status(400).json({error: 'Il campo {idUserSend} deve essere un numero maggiore di 0'});
		return;
	}

	if(!Number.isInteger(idChat)) {
		res.status(400).json({error: 'Il campo {idChat} deve essere un numero'});
		return;
	}

	if(idChat <= 0) {
		res.status(400).json({error: 'Il campo {idChat} deve essere un numero maggiore di 0'});
		return;
	}
	
	if(!(await doesUserExist(idUserSend))) {
		res.status(403).json({error: 'L\'utente non esiste'});
		return;
	}

	let chat = await deleteChat(idChat, deleteForBothUsers);
	chat = chatDTO(chat);
	res.status(204).json(chat);
});

async function createChat(idUserSend, idUserRecv) {
	let chatUser1 = new Chat({idUserSend: idUserSend, 
							  idUserRecv: idUserRecv, 
							  messages: [],
							  newMessages: []});
	let chatUser2 = new Chat({idUserSend: idUserRecv, 
							  idUserRecv: idUserSend, 
							  messages: [],
							  newMessages: []});
	let ret;

	if(await doesUserExist(idUserSend)) {
		if(await doesUserExist(idUserRecv)) {
			if(!(await getChatBetweenTwoUsers(idUserSend, idUserRecv))) {
				if((chatUser1 = await insertChat(chatUser1))) {
					if((chatUser2 = await insertChat(chatUser2))) {
						ret = {chat: chatUser1};
					} else {
						await removeChat(chatUser1);
						ret = {serverError: true};
					}
				} else {
					ret = {serverError: true};
				}
			} else {
				ret = {chatAlreadyExist: true};
			}
		} else {
			ret = {secondUserDoesntExist: true};
		}
	} else {
		ret = {firstUserDoesntExist: true};
	}

	return ret;
}

function doesUserExist(idUser) {
	return User.findOne({idUser: idUser});
}

async function addMessageToChat(chatUser1, msg, timeStamp) {
	let chatUser2 = await getChatBetweenTwoUsers(chatUser1.idUserRecv, chatUser1.idUserSend);

	chatUser1.newMessages.push({sendOrRecv: 1,
                             message: msg,
                             time: timeStamp});
	chatUser2.newMessages.push({sendOrRecv: 0,
                             message: msg,
                             time: timeStamp});

	await updateChat(chatUser1);
	await updateChat(chatUser2);
}

async function deleteChat(idChat, deleteForBothUsers) {
	let chatUser1 = await getChat(idChat);
	let chatUser2; 

	chatUser1.messages = [];
	await updateChat(chatUser1);

	if(deleteForBothUsers) {
		chatUser2 = await getChatBetweenTwoUsers(chatUser1.idUserRecv, chatUser1.idUserSend);
		chatUser2.messages = [];
		await updateChat(chatUser2);
	}

	return chatUser1;
}

function getChatsOfUser(idUserSend) {
	return Chat.find({idUserSend: idUserSend});
}

function getChat(idChat) {
	return Chat.findOne({idChat: idChat});
}

function getChatBetweenTwoUsers(idUserSend, idUserRecv) {
	return Chat.findOne({idUserSend: idUserSend, idUserRecv: idUserRecv});
}

function insertChat(chat) {
	return chat.save();
}

function removeChat(chat) {
	return Chat.findOneAndDelete({idChat: chat.idChat});
}

function updateChat(chat) {
	return Chat.findOneAndUpdate({idChat: chat.idChat}, chat, {new:true, useFindAndModify:false});
}

function chatDTO(chat) {
	return {
		self: '/api/chats/' + chat.idUserSend + '/' + chat.idChat,
		idUserRecv: chat.idUserRecv,
        messages: messagesDTO(chat.messages),
        newMessages: messagesDTO(chat.newMessages)
	}
}

function messagesDTO(messages) {
	let ret = [];

	for(let i=0; i<messages.length ;i++) {
		ret.push({sendOrRecv: messages[i].sendOrRecv,
                  message: messages[i].message,
                  time: messages[i].time});
	}

	return ret;
}

module.exports = router;
