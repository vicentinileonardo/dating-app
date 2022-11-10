function loadUser() { //funzione che carica le informazioni dell'utente che ha fatto il login
	fillFormUpdate();
	fillInterests();
	fillPageFindUser()

	document.getElementById("messageToSend").value = "";
	
	let profile_name = document.getElementById('profile_name').innerHTML;
	let profile_surname = document.getElementById('profile_surname').innerHTML;
	let profile_nickname = document.getElementById('profile_nickname').innerHTML;
	//let profile_birthday = document.getElementById('profile_birthday').innerHTML;
	//let profile_sex = document.getElementById('profile_sex').innerHTML;
	//let profile_orientation = document.getElementById('profile_orientation').innerHTML;
	let profile_bio = document.getElementById('profile_bio').innerHTML;

	let userId = location.search.split('id=')[1]

	fetch('../api/users/' + userId ) //chiamata ad API GET per recuperare le informazioni. 
	.then((resp) => resp.json()) 
	.then(function(user) {
			profile_name += user.name;
			profile_surname += user.surname;
			if(user.nickname) {profile_nickname = user.nickname;}
			if(user.bio){profile_bio = user.bio;}

			document.getElementById('profile_name').innerHTML = profile_name;     
			document.getElementById('profile_surname').innerHTML = profile_surname;         
			if(user.nickname){document.getElementById('profile_nickname').innerHTML = profile_nickname;}
			document.getElementById('profile_birthday').innerHTML = user.birthday.slice(0,10);
			
			

			if(user.sex == "male"){
				document.getElementById('profile_sex').innerHTML = "Maschio";
				document.getElementById("imageProfile").src="../images/icon_avatar_male.png";
			}else if(user.sex == "female"){
				document.getElementById('profile_sex').textContent = "Femmina";
				document.getElementById("imageProfile").src="../images/icon_avatar.png";
			}else if(user.sex == "other"){
				document.getElementById('profile_sex').textContent = "Altro";
				document.getElementById("imageProfile").src="../images/icon_avatar_other.png";
			}

			
			if(user.sex_orientation == "straight"){
				document.getElementById('profile_orientation').textContent = "Etero";  
			}else if(user.sex_orientation == "gay"){
				document.getElementById('profile_orientation').textContent = "Gay";  
			}
			
			if(user.bio){document.getElementById('profile_bio').innerHTML = profile_bio;}
		})
	.catch( error => console.error(error) ); 
}

function fillFormUpdate() { //funzione che carica le informazioni correnti nel form di modifica del profilo. 

	let userId = location.search.split('id=')[1]

	//Reperimento info utente dal database (get su users/:id)
	fetch('../api/users/' + userId )
	.then((resp) => resp.json()) 
	.then(function(user) {

			if(user.nickname){document.getElementById('updateNickname').value = user.nickname};
			//document.getElementById('updateBirthday').value = user.birthday.slice(0,10);
			document.getElementById('updateSex').value = user.sex;
			document.getElementById('updateOrientation').value = user.sex_orientation;
			
			if(user.wantsRelation == true || user.wantsRelation == null){
				document.getElementById('relation').checked = true;
			}else{
				document.getElementById('relation').checked = false;
			}
			
			if(user.bio){document.getElementById('updateBio').value = user.bio};
		})
	.catch( error => console.error(error) ); 

}

function updateUser() { //prende le informazioni nel form di aggiornamento informazioni e fa una chiamata alla PUT, per confermare e 
						//salvare le modifiche effettuate. 
    
	let updateNickname = document.getElementById('updateNickname').value;

	let updatePassword = document.getElementById('updatePassword').value;
	let updatePasswordConfirm = document.getElementById('updateCheckPass').value;

	if (typeof updatePassword != 'string' || updatePassword != updatePasswordConfirm) {
		console.log("Il campo {password} non deve essere vuoto e deve essere uguale al campo {check_password}.");

		document.getElementById("error_message").innerHTML = "Il campo {password} non deve essere vuoto e deve essere uguale al campo {check_password}";
		document.getElementById("error_message").style.display = 'block';

        return;
    }
	
	let updateSex = document.getElementById('updateSex').value;
	let updateOrientation = document.getElementById('updateOrientation').value;
	let updateBio = document.getElementById('updateBio').value;
	
	let updateWantsRelation = document.getElementById('relation').checked.toString();

	//fetch api put su users/:id
	//aggiungere controlli

	let userId = location.search.split('id=')[1];

	let updatedUser = {
		nickname: updateNickname, 
		password: updatePassword,
		check_password: updatePasswordConfirm,
		sex: updateSex, 
		sex_orientation: updateOrientation,
		bio: updateBio,
		wantsRelation: updateWantsRelation
	}  

	let filter = [];
	if(updateNickname){filter.push("nickname")};
	if(updatePassword){ //da aggiungere controllo password frontened 
		filter.push("password");
		filter.push("check_password");
	}
	if(updateBio){filter.push("bio")};
	if(updateSex){filter.push("sex")};
    if(updateOrientation){filter.push("sex_orientation")};
    filter.push("wantsRelation");
	
	fetch('../api/users/' + userId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
		body: JSON.stringify(updatedUser, filter),
    })
    .then((resp) => {
		console.log(resp);
		//refresh pagina 
		window.location.reload();
        return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here
}


function fillInterests(){ //prende gli interessi dal database e li stampa nella pagina per l'aggiunta di interessi. 
	let divInterests = document.getElementById("divInterests1");
	let counter = 0;

	fetch('../api/interests/')
	.then((resp) => resp.json()) 
	.then(function(data){
		console.log(data);
		return data.map(function(interest){
			let interestId = interest.self.substring(interest.self.lastIndexOf('/') + 1);
			
			let inputType = document.createElement("input");
			inputType.id = "interest"+interestId;
			inputType.type = "checkbox";
			inputType.name = "interests"

			let label = document.createElement("label");
			label.className = "pure-material-checkbox";

			
			let span = document.createElement("span");
			span.innerHTML = interest.name;

			label.appendChild(inputType);
			label.appendChild(span);
			divInterests.appendChild(label);
			
			counter++;
			if(counter == 6){
				divInterests = document.getElementById("divInterests2");
			} //siamo a metà*/
			
		})
	}).then(function(){
		checkInterests();
	})
	.catch( error => console.error(error) );
}

function checkInterests(){ //mette un check sulla checkbox dell'interesse corrispondente se lo si trova nell'array di interessi
						   //dell'utente. 
	let userId = location.search.split('id=')[1];
	//await fillInterests();	
	fetch('../api/users/' + userId )
	.then((resp) => resp.json()) 
	.then(function(user) {
		//console.log(user);
		if(user.interests.length){
			for (let i in user.interests){
				if(user.interests[i]!=0){
					//console.log(user.interests[i]);
					let idInterest = "interest" + user.interests[i];
					//console.log(idInterest);
					document.getElementById(idInterest).checked = true;
				}
			}
		}

	})
	.catch( error => console.error(error) );
}

function modifyInterests() { //alla pressione del bottone prende gli interessi che hanno la checkbox "checked" e fa una chiamata PUT
							 //per aggiungere/togliere i nuovi interessi.
	let userId = location.search.split('id=')[1];
	let newInterests = new Array();

	var checkboxes = document.querySelectorAll('input[name="interests"]:checked');
	//console.log(checkboxes);
	for (var checkbox of checkboxes) {
		//console.log(checkbox.id);
		let id = checkbox.id;
		let interestId = parseInt(id.substring(id.lastIndexOf('t') + 1), 10);
		newInterests.push(interestId);
	}
	//console.log(newInterests);


	let updatedUser = {
		interests: newInterests
	}  

	fetch('../api/users/' + userId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
		body: JSON.stringify(updatedUser),
    })
    .then((resp) => {
		console.log(resp);
		//refresh pagina 
		window.location.reload();
		
		document.getElementById("confirm_message").textContent = "Modifiche avvenute con successo!";
		document.getElementById("confirm_message").style.display = "block";
		
		return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here
}



function fillPageFindUser(){ //crea dinamicamente la pagina per la ricerca degli utenti. Prende gli interessi dal DB con una chiamata GET
							 //e poi carica le select per l'età.
	let divInterestsFU = document.getElementById("divInterests1FU");
	let counter = 0;

	fetch('../api/interests/')
	.then((resp) => resp.json()) 
	.then(function(data){
		return data.map(function(interest){
			
			let interestId = interest.self.substring(interest.self.lastIndexOf('/') + 1);

			let inputTypeFU = document.createElement("input");
			inputTypeFU.id = "interestFU"+interestId;
			inputTypeFU.type = "checkbox";
			inputTypeFU.name = "interestsFU"

			let labelFU = document.createElement("label");
			labelFU.className = "pure-material-checkbox";


			let spanFU = document.createElement("span");
			spanFU.innerHTML = interest.name;
			
			labelFU.appendChild(inputTypeFU);
			labelFU.appendChild(spanFU);
		
			divInterestsFU.appendChild(labelFU);
			counter++;
			if(counter == 6){
				divInterestsFU = document.getElementById("divInterests2FU");
			} //siamo a metà

		})

	})
	.catch( error => console.error(error) );

	let selectSex = document.getElementById("not_selected_sex");
	let selectOrientation = document.getElementById("not_selected_orientation");

	selectSex.selected = true;
	selectOrientation.selected = true;

	let minAge = document.getElementById("minAge");
	let maxAge = document.getElementById("maxAge");
	let notSelected = document.createElement("option");
	notSelected.value="not_selected";
	notSelected.innerHTML = "-";
	notSelected.selected = true;

	minAge.appendChild(notSelected);

	let notSelected2 = document.createElement("option");
	notSelected2.value="not_selected";
	notSelected2.innerHTML = "-";
	notSelected2.selected = true;
	maxAge.appendChild(notSelected2);

	for(let i=18; i<100; i++){
		let optionMax = document.createElement("option");
		optionMax.value = i;
		optionMax.innerHTML = i;
		optionMax.id = i;

		let optionMin = document.createElement("option");
		optionMin.value = i;
		optionMin.innerHTML = i;
		optionMin.id = i;


		minAge.appendChild(optionMax);
		maxAge.appendChild(optionMin);
	}

}

function getUsers(){ //alla pressione del tasto "trova utenti" viene chiamata questa funzione che prende i valori selezionati nei vari campi
					 //e fa una chiamata alla GET specificando i parametri nell'URL. Se nessun parametro è specificato, vengono mostrati tutti gli
					 //utenti all'interno del database.

	//prendo gli interessi
	let userId = location.search.split('id=')[1];
	var checkboxes = document.querySelectorAll('input[name="interestsFU"]:checked');
	var interestsToFind = new Array();

	for (var checkbox of checkboxes) {
		let id = checkbox.id;
		let interestId = parseInt(id.substring(id.lastIndexOf('U') + 1), 10);
		interestsToFind.push(interestId);
	}
	//console.log(interestsToFind);
	/*---------------------------------*/

	let sexToSearch = document.getElementById("sexToMatch").value;
	let orientationToSearch = document.getElementById("orientationToMatch").value;
	let minAgetoSearch = document.getElementById("minAge").value;
	let maxAgetoSearch = document.getElementById("maxAge").value;
	let relationToSearch = document.getElementById('relationSearch').checked.toString();

	var path = location.origin;
	path = path + "/api/users/search";
	//console.log(path);
	var url = new URL(path); 
	let params = {sexw: sexToSearch , 
			sexo: orientationToSearch, 
			etamin: minAgetoSearch,
			etamax: maxAgetoSearch,
			intw: interestsToFind,
			idUser: userId,
			relation: relationToSearch 
		}

	Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
	console.log(url);
	
	//var res = encodeURI(url);
	//console.log(res);


	let externalContent = document.getElementById("external_content");
	externalContent.innerHTML = ""; //pulisco la div se no se faccio due chiamate appende tutto di seguito
	document.getElementById("error_message_find").style.display = 'none';

	fetch('../api/users/' + userId )
	.then((resp) => resp.json()) 
	.then(function(user) {
		let matches = {
			MySentMatches: user.sentMatches,
			MyReceivedMatches: user.receivedMatches,
			MyRefusedMatches: user.refusedMatches,
			MyConfirmedMatches: user.confirmedMatches
		}
		return matches;
	})
	.then(function print(matches){
		fetch(url)
    	.then(function(data) {
			if (data.status != 200){
				//onError(data.statusText);
				console.log(data.statusText);
				document.getElementById("error_message_find").style.display = 'block';
				document.getElementById("error_message_find").innerText = data.statusText;
				
				return;
			}else{
				return data;
			}
    	})
		.then(function(resp){
			if(resp)
				return resp.json();
			else
				return;
		})
		.then(function(data) { //in base ai miei array per i match, la stampa viene fatta in modo diverso (vengono modificati i tasti o l'informazione mostrata)
			let sent = matches.MySentMatches;
			let received = matches.MyReceivedMatches;
			let refused = matches.MyRefusedMatches;
			let confirmed = matches.MyConfirmedMatches;

			if(data)
				return data.map(function(user){
					let name = user.name;
					let surname = user.surname;
					let age = user.age;

					let userFound = document.createElement("div");
					userFound.className = "userfound";
					let row = document.createElement("div");
					row.className = "row";

					let column2 = document.createElement("div");
					column2.className = "col-sm-2";

					let profileImage = document.createElement("img");
					if(user.sex == "female"){
						profileImage.src = "../images/icon_avatar.png"; //mettere poi il campo con l'immagine profilo.
					}else if(user.sex == "male"){
						profileImage.src = "../images/icon_avatar_male.png"; //mettere poi il campo con l'immagine profilo.
					}else{
						profileImage.src = "../images/icon_avatar_other.png"; //mettere poi il campo con l'immagine profilo.
					}
					profileImage.className = "imageUserFind";

					let column3 = document.createElement("div");
					column3.className = "col-sm-3";

					let nameH6 = document.createElement("h6");
					nameH6.id = "nameUserFind";
					nameH6.innerHTML = "<b> Nome: </b>" + name;
					
					let surnameH6 = document.createElement("h6");
					surnameH6.id = "surnameUserFind";
					surnameH6.innerHTML = "<b> Cognome: </b>"+ surname;
					
					let ageH6 = document.createElement("h6");
					ageH6.id = "ageUserFind";
					ageH6.innerHTML = "<b> Et&aacute: </b>"+age;

					let column4 = document.createElement("div");
					column4.className = "col-sm-4";
					column4.id = "divButton"+ user.idUser;

					let buttonOK;
					let buttonKO;
					
					if(!checkInArray(received, user.idUser) && !checkInArray(sent, user.idUser) && !checkInArray(refused, user.idUser) && !checkInArray(confirmed, user.idUser)){
						buttonOK = document.createElement("button");
						buttonOK.className = "btn btn-success mybtnSuccess";
						buttonOK.setAttribute("onclick","askForMatch(this);");
						buttonOK.style = "width: 100%;"
						buttonOK.id = "User" + user.idUser;
						buttonOK.innerHTML = "Proponi Match";

						buttonKO = document.createElement("button");
						buttonKO.className = "btn btn-danger mybtnDanger";
						buttonKO.setAttribute("onclick","deleteMatch(this);");
						buttonKO.style = "width: 100%;"
						buttonKO.id = "UserKO" + user.idUser;
						buttonKO.innerHTML = "Annulla Match";
						buttonKO.disabled = true;

						column4.appendChild(buttonOK);
						column4.appendChild(buttonKO);
						
					}else if(checkInArray(sent, user.idUser)){
						buttonOK = document.createElement("button");
						buttonOK.className = "btn btn-success mybtnSuccess";
						buttonOK.setAttribute("onclick","askForMatch(this);");
						buttonOK.style = "width: 100%;"
						buttonOK.id = "User" + user.idUser;
						buttonOK.innerHTML = "Proponi Match";
						buttonOK.disabled = true;
						
						buttonKO = document.createElement("button");
						buttonKO.className = "btn btn-danger mybtnDanger";
						buttonKO.setAttribute("onclick","deleteMatch(this);");
						buttonKO.style = "width: 100%;"
						buttonKO.id = "UserKO" + user.idUser;
						buttonKO.innerHTML = "Annulla Match";

						column4.appendChild(buttonOK);
						column4.appendChild(buttonKO);

					}else if(checkInArray(received, user.idUser)){
						buttonOK = document.createElement("button");
						buttonOK.className = "btn btn-success mybtnSuccess";
						buttonOK.setAttribute("onclick","acceptMatch(this);");
						buttonOK.style = "width: 100%;"
						buttonOK.id = "User" + user.idUser;
						buttonOK.innerHTML = "Accetta Match";

						buttonKO = document.createElement("button");
						buttonKO.className = "btn btn-danger mybtnDanger";
						buttonKO.setAttribute("onclick","refuseMatch(this);");
						buttonKO.style = "width: 100%;"
						buttonKO.id = "UserKO" + user.idUser;
						buttonKO.innerHTML = "Rifiuta Match";

						column4.appendChild(buttonOK);
						column4.appendChild(buttonKO);
					}
					else if(checkInArray(confirmed, user.idUser)){
						let divAlert = document.createElement("div");
						divAlert.className = "alert alert-success";
						divAlert.style.display = "block";
						divAlert.style = "margin: 10px !important;";
						divAlert.innerHTML = "Match gi&aacute; confermato!";

						column4.appendChild(divAlert);
					}else if(checkInArray(refused, user.idUser)){
						let divAlert = document.createElement("div");
						divAlert.className = "alert alert-danger";
						divAlert.style.display = "block";
						divAlert.style = "margin: 10px !important;";
						divAlert.innerHTML = "Match gi&aacute; rifiutato!";

						column4.appendChild(divAlert);

					}

					column3.appendChild(nameH6);
					column3.appendChild(surnameH6);
					column3.appendChild(ageH6);

					column2.appendChild(profileImage);
					
					row.appendChild(column2);
					row.appendChild(column3);
					row.appendChild(column4);

					userFound.appendChild(row);

					externalContent.appendChild(userFound);
				});
			else{
				return;
			}
    })
    .catch( error => console.error(error) );
	})
	.catch( error => console.error(error) );
}

function deleteMatch(button){ //funzione che serve per annullare un match. 
	let userId = location.search.split('id=')[1];
	let userToDelete = button.id.substring(button.id.lastIndexOf('O') + 1);

	let updatedUser = {
		sentMatches: userToDelete,
		flagDelete: true
	} 
	//vegnono fatte due chiamate PUT perchè se rifiuto un match devo toglierlo dai send dell'utente loggato e dai received dell'utente 
	//a cui l'utente loggato l'aveva inviato.
	fetch('../api/users/' + userId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
		body: JSON.stringify(updatedUser),
    })
    .then((resp) => {
		console.log(resp);
		return;
    }).then(function put(){
			let updatedUser2 = {
				receivedMatches: userId,
				flagDelete: true
			}  
			fetch('../api/users/' + userToDelete, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updatedUser2),
			})
			.then((resp) => {
				console.log(resp);
				return;
			})
			.catch( error => console.error(error) ); // If there is any error you will catch them here
		
	})
	.catch( error => console.error(error) ); // If there is any error you will catch them here*/

	switchButtonDelete(button, userToDelete);
}

function refuseMatch(button){ //funzione per rifiutare un match
	let userId = location.search.split('id=')[1];
	let userToRefuse = button.id.substring(button.id.lastIndexOf('O') + 1);


	let updatedUser = {
		refusedMatches: userToRefuse,
		flagRefused: true //devo aggiungere ai refused del logged e togliere dai received del logged
	} 
	//vengono eseguite due chiamate PUT perchè devo inserire l'id dell'utente sia nell'array dei match rifiutati dell'utente loggato
	//che nell'array dei rifiutati dell'utente che è stato rifiutato.
	fetch('../api/users/' + userId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
		body: JSON.stringify(updatedUser),
    })
    .then((resp) => {
		console.log(resp);
		return;
    }).then(function put(){
			let updatedUser2 = {
				refusedMatches: userId,
				flagRefused: false //devo aggiungere ai refused di quello premuto e togliere dai sent di quello del bottone premuto
			}  
			fetch('../api/users/' + userToRefuse, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updatedUser2),
			})
			.then((resp) => {
				console.log(resp);
				return;
			})
			.catch( error => console.error(error) ); // If there is any error you will catch them here
		
	})
	.catch( error => console.error(error) ); // If there is any error you will catch them here*/

	switchButtonRefuse(button, userToRefuse);

}

function askForMatch(button){ //funzione per proporre un match. 
	let userId = location.search.split('id=')[1];
	let userToMatch = button.id.substring(button.id.lastIndexOf('r') + 1);

	console.log("UsertoMatch" + userToMatch);

	let updatedUser = {
		sentMatches: userToMatch
	}  
	//vengono eseguite due chiamate PUT perchè l'id dell'utente va inserito nell'array dei match inviati dell'utente loggato
	//e dei match ricevuti di quello a cui è stato inviato effettivamente il match
	fetch('../api/users/' + userId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
		body: JSON.stringify(updatedUser),
    })
    .then((resp) => {
		//console.log(resp);
		//refresh pagina 
		//window.location.reload();
		
		//document.getElementById("confirm_message").textContent = "Modifiche avvenute con successo!";
		//document.getElementById("confirm_message").style.display = "block";
		
		return;
    }).then(function put(){
			let updatedUser2 = {
				receivedMatches: userId
			}  
			fetch('../api/users/' + userToMatch, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updatedUser2),
			})
			.then((resp) => {
				//console.log(resp);
				//refresh pagina 
				//window.location.reload();
				
				//document.getElementById("confirm_message").textContent = "Modifiche avvenute con successo!";
				//document.getElementById("confirm_message").style.display = "block";
				
				return;
			})
			.catch( error => console.error(error) ); // If there is any error you will catch them here
		
	})
	.catch( error => console.error(error) ); // If there is any error you will catch them here

	switchButtonAsk(button, userToMatch);
}

function acceptMatch(button){ //funzione per accettare il match.
	let userId = location.search.split('id=')[1];
	let userToAccept = button.id.substring(button.id.lastIndexOf('r') + 1);

	let updatedUser = {
		confirmedMatches: userToAccept,
		flagConfirmed: true //devo aggiungere ai confirmed del logged e togliere dai received del logged
	} 

	//vengono eseguite due chiamate PUT perchè il match confermato va inserito nell'array dei match confermati sia dell'utente loggato sia
	//nell'array di confermati anche dell'altro user. Inoltre, va tolto dall'array degli inviati di uno e dall'array dei ricevuti dell'altro.
	fetch('../api/users/' + userId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
		body: JSON.stringify(updatedUser),
    })
    .then((resp) => {
		console.log(resp);
		return;
    }).then(function put(){
			let updatedUser2 = {
				confirmedMatches: userId,
				flagConfirmed: false //devo aggiungere ai confirmed di quello premuto e togliere dai sent di quello del bottone premuto
			}  
			fetch('../api/users/' + userToAccept, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updatedUser2),
			})
			.then((resp) => {
				console.log(resp);
				return;
			})
			.catch( error => console.error(error) ); // If there is any error you will catch them here
		
	})
	.catch( error => console.error(error) ); // If there is any error you will catch them here*/

	switchButtonAccept(button, userToAccept);
}

function fetchToMatches(){ //stampa i match nella pagina di match. I match sono divisi nelle quattro colonne e hanno tasti o div che mostrano il 
						   //il loro stato.
	let userId = location.search.split('id=')[1];

	let columnSent = document.getElementById("sentMatch");
	let columnReceived = document.getElementById("receivedMatch");
	let columnConfirmed = document.getElementById("confirmedMatch");
	let columnRefused = document.getElementById("refusedMatch");

	columnSent.innerHTML="<center> Inviati </center> <br/> ";
	columnReceived.innerHTML="<center> Ricevuti </center> <br/> ";
	columnConfirmed.innerHTML="<center> Confermati </center> <br/> ";
	columnRefused.innerHTML="<center> Rifiutati </center> <br/>";

	fetch('../api/users/' + userId)
	.then((resp) => resp.json()) 
	.then(function(user) {
		let matches = {
			MySentMatches: user.sentMatches,
			MyReceivedMatches: user.receivedMatches,
			MyRefusedMatches: user.refusedMatches,
			MyConfirmedMatches: user.confirmedMatches,
		}
		return matches;
	})
	.then(function print(matches){
		let sent = matches.MySentMatches;
		let received = matches.MyReceivedMatches;
		let refused = matches.MyRefusedMatches;
		let confirmed = matches.MyConfirmedMatches;

		fetch("../api/users/")
    	.then(function(data) {
			if (data.status != 200){
				//onError(data.statusText);
				//console.log(data.statusText);
				//document.getElementById("error_message_find").style.display = 'block';
				//document.getElementById("error_message_find").innerText = data.statusText;
				
				return;
			}else{
				return data;
			}
    	})
		.then(function(resp){
			if(resp)
				return resp.json();
			else
				return;
		})
		.then(function(data) {

			
			if(data){
				let sent = matches.MySentMatches;
				let received = matches.MyReceivedMatches;
				let refused = matches.MyRefusedMatches;
				let confirmed = matches.MyConfirmedMatches;
			
				return data.map(function(user){
					let flag;
					//console.log("SOPRA");
					//console.log(sent);
					let uid = user.self.substring(user.self.lastIndexOf('/') + 1);
					//console.log(uid);
					if(checkInArray(sent, uid) || checkInArray(received, uid) || checkInArray(confirmed, uid) || checkInArray(refused, uid)){
						let name = user.u_name;
						//console.log(name);
						let surname = user.surname;
						let age = user.age;

						//let userFound = document.createElement("div");
						//userFound.className = "userfound";
						let row = document.createElement("div");
						row.className = "row cardProfile";

						let column3 = document.createElement("span");
						column3.className = "col-sm-3";

						let profileImage = document.createElement("img");
						if(user.sex == "female"){
							profileImage.src = "../images/icon_avatar.png"; //mettere poi il campo con l'immagine profilo.
						}else if(user.sex == "male"){
							profileImage.src = "../images/icon_avatar_male.png"; //mettere poi il campo con l'immagine profilo.
						}else{
							profileImage.src = "../images/icon_avatar_other.png"; //mettere poi il campo con l'immagine profilo.
						}
						profileImage.className = "img-responsive profileImageInMatch";

						let column3_2 = document.createElement("span");
						column3_2.className = "col-sm-3";

						let nameH5 = document.createElement("h5");
						nameH5.id = "PageMatchNameUserFind";
						nameH5.innerHTML = "<b> Nome: </b>" + name;
						
						let surnameH5 = document.createElement("h5");
						surnameH5.id = "PageMatchSurnameUserFind";
						surnameH5.innerHTML = "<b> Cognome: </b>"+ surname;
						
						let ageH5 = document.createElement("h5");
						ageH5.id = "PageMatchAgeUserFind";
						ageH5.innerHTML = "<b> Et&aacute: </b>"+age;

						let column6 = document.createElement("span");
						column6.className = "col-sm-6 buttonMatches";
						column6.id = "PageMatchDivButton"+ uid;

						let buttonOK;
						let buttonKO;
						
						if(checkInArray(sent, uid)){
							buttonOK = document.createElement("button");
							buttonOK.className = "btn btn-success mybtnSuccess";
							buttonOK.setAttribute("onclick","askForMatch(this);");
							buttonOK.style = "width: 100%;"
							buttonOK.id = "PageMatchUser" + uid;
							buttonOK.innerHTML = "Proponi Match";
							buttonOK.disabled = true;
							
							buttonKO = document.createElement("button");
							buttonKO.className = "btn btn-danger mybtnDanger";
							buttonKO.setAttribute("onclick","deleteMatch(this);");
							buttonKO.style = "width: 100%;"
							buttonKO.id = "PageMatchUserKO" + uid;
							buttonKO.innerHTML = "Annulla Match";

							column6.appendChild(buttonOK);
							column6.appendChild(buttonKO);

							flag = 1;

						}else if(checkInArray(received, uid)){
							buttonOK = document.createElement("button");
							buttonOK.className = "btn btn-success mybtnSuccess";
							buttonOK.setAttribute("onclick","acceptMatch(this);");
							buttonOK.style = "width: 100%;"
							buttonOK.id = "PageMatchUser" + uid;
							buttonOK.innerHTML = "Accetta Match";

							buttonKO = document.createElement("button");
							buttonKO.className = "btn btn-danger mybtnDanger";
							buttonKO.setAttribute("onclick","refuseMatch(this);");
							buttonKO.style = "width: 100%;"
							buttonKO.id = "PageMatchUserKO" + uid;
							buttonKO.innerHTML = "Rifiuta Match";

							column6.appendChild(buttonOK);
							column6.appendChild(buttonKO);
							
							flag = 2;
						}
						else if(checkInArray(confirmed, uid)){
							let divAlert = document.createElement("div");
							divAlert.className = "alert alert-success";
							divAlert.style.display = "block";
							divAlert.style = "margin: 10px !important;";
							divAlert.innerHTML = "Match gi&aacute; confermato!";

							column6.appendChild(divAlert);

							flag = 3;
						}else if(checkInArray(refused, uid)){
							let divAlert = document.createElement("div");
							divAlert.className = "alert alert-danger";
							divAlert.style.display = "block";
							divAlert.style = "margin: 10px !important;";
							divAlert.innerHTML = "Match gi&aacute; rifiutato!";

							column6.appendChild(divAlert);

							flag = 4;

						}

						column3_2.appendChild(nameH5);
						column3_2.appendChild(surnameH5);
						column3_2.appendChild(ageH5);

						column3.appendChild(profileImage);
						
						row.appendChild(column3);
						row.appendChild(column3_2);
						row.appendChild(column6);

						//userFound.appendChild(row);

						if(flag == 1){
							columnSent.appendChild(row);
						}else if(flag == 2){
							columnReceived.appendChild(row);
						}else if (flag == 3){
							columnConfirmed.appendChild(row);
						}else if(flag == 4){
							columnRefused.appendChild(row);
						}
					}
				});
			}else{
				return;
			}
    })
    .catch( error => console.error(error) );
	})
	.catch( error => console.error(error) );
}

function switchButtonDelete(button, id){ //funzione che scambia i bottoni se annullo un match
	let string = "UserKO" + id;

	if(button.id == string){
		button.disabled = true;
		document.getElementById("User"+id).disabled = false;
	}else{
		button.disabled = true;
		document.getElementById("PageMatchUser"+id).disabled = false;
		if(document.getElementById("User"+id)!=null){ //serve se ho già stampato qualcosa nella pagina trova utenti
			document.getElementById("User"+id).disabled = false;
			document.getElementById("UserKO"+id).disabled = true;
		}
	}
}


function switchButtonRefuse(button, id){ //funzione per mostrare informazioni se rifiuto un match
	let string = "UserKO" + id;

	if(button.id == string){
		document.getElementById("User"+id).style.display = 'none';
		document.getElementById("UserKO"+id).style.display = 'none';

		let divAlert = document.createElement("div");
		divAlert.className = "alert alert-danger";
		divAlert.style.display = "block";
		divAlert.style = "margin: 10px !important;";
		divAlert.innerHTML = "Hai rifiutato il match!";

		let column4 = document.getElementById("divButton"+id);
		column4.appendChild(divAlert);
	}else{
		document.getElementById("PageMatchUser"+id).style.display = 'none';
		document.getElementById("PageMatchUserKO"+id).style.display = 'none';

		let divAlert = document.createElement("div");
		divAlert.className = "alert alert-danger";
		divAlert.style.display = "block";
		divAlert.style = "margin: 10px !important;";
		divAlert.innerHTML = "Hai rifiutato il match!";

		let column4 = document.getElementById("PageMatchDivButton"+id);
		column4.appendChild(divAlert);

		if(document.getElementById("divButton"+id)!=null){ //serve se ho già stampato qualcosa nella pagina trova utenti
			let divAlert = document.createElement("div");
			divAlert.className = "alert alert-danger";
			divAlert.style.display = "block";
			divAlert.style = "margin: 10px !important;";
			divAlert.innerHTML = "Hai rifiutato il match!";

			document.getElementById("User"+id).style.display = 'none';
			document.getElementById("UserKO"+id).style.display = 'none';

			let column4 = document.getElementById("divButton"+id);
			column4.appendChild(divAlert);
		}
	}
}

function switchButtonAsk(button, id){ //funzione per scambiare bottoni se propongo un match
	let string = "User" + id;

	if(button.id == string){
		button.disabled = true;
		document.getElementById("UserKO"+id).disabled = false;
	}else{
		button.disabled = true;
		document.getElementById("PageMatchUserKO"+id).disabled = false;
		if(document.getElementById("User"+id)!=null){ //serve se ho già stampato qualcosa nella pagina trova utenti
			document.getElementById("User"+id).disabled = false;
			document.getElementById("UserKO"+id).disabled = true;
		}
	}
}

function switchButtonAccept(button, id){ //funzione per mostrare informazioni quando un match viene accettato.
	let string = "User" + id;

	if(button.id == string){
		document.getElementById("User"+id).style.display = 'none';
		document.getElementById("UserKO"+id).style.display = 'none';

		let divAlert = document.createElement("div");
		divAlert.className = "alert alert-success";
		divAlert.style.display = "block";
		divAlert.style = "margin: 10px !important;";
		divAlert.innerHTML = "Hai accettato il match!";

		let column4 = document.getElementById("divButton"+id);
		column4.appendChild(divAlert);
	}else{
		document.getElementById("PageMatchUser"+id).style.display = 'none';
		document.getElementById("PageMatchUserKO"+id).style.display = 'none';

		let divAlert = document.createElement("div");
		divAlert.className = "alert alert-success";
		divAlert.style.display = "block";
		divAlert.style = "margin: 10px !important;";
		divAlert.innerHTML = "Hai accettato il match!";

		let column4 = document.getElementById("PageMatchDivButton"+id);
		column4.appendChild(divAlert);

		if(document.getElementById("divButton"+id)!=null){ //serve se ho già stampato qualcosa nella pagina trova utenti
			let divAlert = document.createElement("div");
			divAlert.className = "alert alert-success";
			divAlert.style.display = "block";
			divAlert.style = "margin: 10px !important;";
			divAlert.innerHTML = "Hai accettato il match!";

			document.getElementById("User"+id).style.display = 'none';
			document.getElementById("UserKO"+id).style.display = 'none';

			let column4 = document.getElementById("divButton"+id);
			column4.appendChild(divAlert);
		}
	}
}

function loadConfirmedMatch(){ //carica l'array dei match confermati nella colonna di destra nella pagina di chat. 
	let userId = location.search.split('id=')[1];
	let columnMatch = document.getElementById("userMatched");

	fetch('../api/users/' + userId)
	.then((resp) => resp.json()) 
	.then(function(user) {
		let matches = {
			MyConfirmedMatches: user.confirmedMatches,
		}
		//console.log(matches);
		return matches;
	})
	.then(function print(matches){
		fetch("../api/users/")
    	.then(function(data) {
			if (data.status != 200){
				return;
			}else{
				return data;
			}
    	})
		.then(function(resp){
			if(resp)
				return resp.json();
			else
				return;
		})
		.then(function(data) {
			if(data){
				let confirmed = matches.MyConfirmedMatches;
				return data.map(function(user){
					let uid = user.self.substring(user.self.lastIndexOf('/') + 1);
					
					if(checkInArray(confirmed, uid)){
						if(!document.getElementById(uid+"Div")) {
							let name = user.u_name;
							//console.log(name);
							let surname = user.surname;
							let age = user.age;

							let row = document.createElement("div");
							row.id = uid+"Div";
							row.className = "row cardProfile";

							let column3 = document.createElement("span");
							column3.className = "col-sm-3";

							let profileImage = document.createElement("img");
							if(user.sex == "female"){
								profileImage.src = "../images/icon_avatar.png"; //mettere poi il campo con l'immagine profilo.
							}else if(user.sex == "male"){
								profileImage.src = "../images/icon_avatar_male.png"; //mettere poi il campo con l'immagine profilo.
							}else{
								profileImage.src = "../images/icon_avatar_other.png"; //mettere poi il campo con l'immagine profilo.
							}
							profileImage.className = "img-responsive profileImageInMatch";

							let column3_2 = document.createElement("span");
							column3_2.className = "col-sm-3";

							let nameH5 = document.createElement("h5");
							nameH5.id = "PageChatNameUser";
							nameH5.innerHTML = "<b> Nome: </b>" + name;
							
							let surnameH5 = document.createElement("h5");
							surnameH5.id = "PageChatSurnameUser";
							surnameH5.innerHTML = "<b> Cognome: </b>"+ surname;
							
							let ageH5 = document.createElement("h5");
							ageH5.id = "PageChatAgeUser";
							ageH5.innerHTML = "<b> Et&aacute: </b>"+age;

							let column6 = document.createElement("span");
							column6.className = "col-sm-6 buttonMatches";
							column6.id = "PageChatDivButton"+ uid;

							let buttonOK = document.createElement("button");
							buttonOK.className = "btn btn-dark";
							buttonOK.style = "width: 100%;";
							buttonOK.setAttribute("onclick","chat(this);");
							buttonOK.id = "PageChatUser" + uid;
							buttonOK.innerHTML = "Chat";

							let par = document.createElement("p");
							par.id = uid + 'Notifiche';
							par.style = "color: red;";

							column3_2.appendChild(nameH5);
							column3_2.appendChild(surnameH5);
							column3_2.appendChild(ageH5);

							column3.appendChild(profileImage);
							
							column6.appendChild(buttonOK);
							column6.appendChild(par);
							
							row.appendChild(column3);
							row.appendChild(column3_2);
							row.appendChild(column6);

							columnMatch.appendChild(row);
						}
						
						let path = location.origin;
						path = path + "/api/chats";
						let url = new URL(path); 
						let params = {idUserSend: userId,  idUserRecv: uid};
					
						Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

						fetch(url)
						.then(function(data) {
							if(data.status == 200) {
								return data.json();
							}
							return;
						})
						.then(function(data) {
							if(data) {
								document.getElementById(uid+'Notifiche').innerHTML = "Hai " + data.newMessages.length + " nuovi messaggi";
							}
							return;
						});
					}
				});
			}else{
				return;
			}
    })
    .catch( error => console.error(error) );
	})
	.catch( error => console.error(error) );
}

function chat (button){ //alla pressione del tasto "chat" viene chiamata questa funzione che carica i messaggi se la chat e' già attiva
						//oppure crea effettivamente la chat. 
	let divInviaMessaggio = document.getElementById("send_message");
	divInviaMessaggio.style.display = "block";
	//button.className = "btn btn-success btnSuccess";

	let userLogged = location.search.split('id=')[1];
	let userToChat = button.id.substring(button.id.lastIndexOf('r') + 1);
	let divMessages = document.getElementById("showMessages");

	let buttonSend = document.getElementsByName("ButtonSend")[0];
	buttonSend.id = "ButtonSend"+userToChat;

	divMessages.innerHTML = "";
	//console.log(userLogged);
	//console.log(userToChat);

	var path = location.origin;
	path = path + "/api/chats";
	//console.log(path);
	var url = new URL(path); 
	let params = {idUserSend: userLogged, 
				  idUserRecv: userToChat
				}

	Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
	console.log(url);
	
	fetch(url)
	.then(function(data) {
		if (data.status == 404){
			let newChat = {
				idUserSend: userLogged,
				idUserRecv: userToChat,
			}

			fetch('../api/chats/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newChat),
			})
			.then((resp) => {
				//console.log("Primo then" + resp.json());

				return resp;
			})
			.catch( error => console.error(error) );
			
			return;
		}else if(data.status == 200){
			//fetch dei messaggi
			fetch("../api/chats/" + userLogged)
			.then(function(data) {
				if (data.status != 200){
					return;
				}else{
					return data;
				}
			})
			.then(function(resp){
				if(resp)
					return resp.json();
				else
					return;
			})
			.then(function(data) {
				if(data){
					return data.map(function(chat){
						if(chat.idUserRecv == userToChat){
							let arrayMessage = chat.messages;
							let idChat = chat.self.substring(chat.self.lastIndexOf('/') + 1);
							document.getElementById('idCurrentChat').value = idChat;

							for(let i in arrayMessage){
								//i nostri darker, quelli ricevuti normali.

								let container = document.createElement("div");
								
								let img = document.createElement("img");
								img.style = "width:100%;";

								let paragraph = document.createElement("p");
								paragraph.innerHTML = arrayMessage[i].message;

								let span = document.createElement("span");
								span.innerHTML = arrayMessage[i].time;

								if(arrayMessage[i].sendOrRecv == 1){
									container.className = "containerMessages darker";
									span.className = "time-left"
									img.className = "right";
									img.src = "./images/icon_chat_send.png";
								}else{
									container.className = "containerMessages";
									span.className = "time-right"
									img.src = "./images/icon_chat_received.png";
								}
								container.appendChild(img);
								container.appendChild(paragraph);
								container.appendChild(span);

								divMessages.appendChild(container);
							}
							//console.log(arrayMessage);

							scrollToBottom('showMessages');
						}
					})
				}
			}).catch( error => console.error(error) );
			
		}else{
			return;
		}
	})
	.then(function(resp){
		if(resp){
			//console.log("Secondo then" +resp.json());
			return resp;
		}else
			return;
	}).catch( error => console.error(error) );
}

async function sendMessage(button){ //questa funzione è chiamata quando si preme il tasto invia e serve per caricare effettivamente il messaggio.
	let userLogged = location.search.split('id=')[1];
	let userToChat = button.id.substring(button.id.lastIndexOf('d') + 1);
	let messageToSend = document.getElementById("messageToSend").value;
	document.getElementById("messageToSend").value = '';
	
	var today = new Date();
	
	let minuti;

	if(today.getMinutes() < 10){
		minuti = "0" + today.getMinutes();
	}else{
		minuti = today.getMinutes();
	}
	
	var currentTime = today.getHours() + ":" + minuti;
	
	let newMessage = {
		message: messageToSend,
		time: currentTime
	}

	if(newMessage.message) {
		fetch("../api/chats/" + userLogged)
		.then(function(data) {
			if (data.status != 200){
				return;
			}else{
				return data;
			}
		})
		.then(function(resp){
			if(resp)
				return resp.json();
			else
				return;
		})
		.then(function(data) {
			if(data){
				return data.map(function(chat){
					if(chat.idUserRecv == userToChat){
						let idChat = chat.self.substring(chat.self.lastIndexOf('/') + 1);
						//console.log(idChat);
						fetch('../api/chats/' + userLogged + '/' + idChat, { //chiamata PUT per inviare il messaggio effettivamente. 
							method: 'PUT',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify(newMessage),
						})
						.then((resp) => {
							//console.log(resp);
							return;
						})
						.catch( error => console.error(error) ); // If there is any error you will catch them here
						
					}
				})
			}
		}).catch( error => console.error(error) );
	}
}

async function getMessages(userLogged, idChat){ //funzione che fa una GET alla chat per caricare i messaggi tra quei due utenti. 
	let divMessages = document.getElementById("showMessages");

	if(!userLogged) {
		userLogged = location.search.split('id=')[1];
	}

	if(!idChat) {
		idChat = document.getElementById('idCurrentChat').value;
	}

	if(userLogged && idChat) {
		fetch("../api/chats/" + userLogged + "/" + idChat)
		.then(function(data) {
			if (data.status != 200){
				return;
			}else{
				return data;
			}
		})
		.then(function(resp){
			if(resp)
				return resp.json();
			else
				return;
		})
		.then(function(data) {
			if(data){
				let arrayMessage = data.newMessages;
				
				if(arrayMessage.length > 0) {
					fetch('../api/chats/' + userLogged + '/' + idChat + '/newMessages', {method: 'PUT'}).then(function(resp) { return; });
				}

				for(let i in arrayMessage){
					//i nostri darker, quelli ricevuti normali.

					let container = document.createElement("div");
					//container.className = "containerMessages";
					
					let img = document.createElement("img");
					img.style = "width:100%;";

					let paragraph = document.createElement("p");
					paragraph.innerHTML = arrayMessage[i].message;

					let span = document.createElement("span");
					//span.className = "time-right";
					span.innerHTML = arrayMessage[i].time;

					if(arrayMessage[i].sendOrRecv == 1){
						img.src = "./images/icon_chat_send.png";
						container.className = "containerMessages darker";
						span.className = "time-left"
						img.className = "right";
					}else{
						img.src = "./images/icon_chat_received.png";
						container.className = "containerMessages";
						span.className = "time-right"
					}
					container.appendChild(img);
					container.appendChild(paragraph);
					container.appendChild(span);

					divMessages.appendChild(container);
				}
				//console.log(arrayMessage);

				if(arrayMessage.length > 0) {
					scrollToBottom('showMessages');
				}
			}else{
				return;
			}
		}).catch( error => console.error(error) );
	}
}

function checkInArray(array, value){ //funzione di utility per controllare se un valore è contenuto in un array. 
	for(let i in array){
		if(array[i] == value)
			return true;
	}

	return false;
}

function scrollToBottom (id) { //mette la div dei messaggi sempre verso il fondo.
	var div = document.getElementById(id);
	div.scrollTop = div.scrollHeight - div.clientHeight;
 }

document.addEventListener('DOMContentLoaded', function() {
	setInterval(loadConfirmedMatch, 3000); //richiama la funzione ogni 3 secondi per caricare eventuali nuovi match confermati 
	setInterval(getMessages, 1500); //ricarica i messaggi ogni secondo e mezzo per simulare una chat in tempo reale.
	loadConfirmedMatch();
	loadUser();
  });
