function loadInterests(){
    let selectElimina = document.getElementById("interestToDelete");
    let selectModifca = document.getElementById("interestToModify");

    document.getElementById("updateNameInterest").value = "";
    document.getElementById("updateDescriptionInterest").value = "";
    document.getElementById("nameInterest").value = "";
    document.getElementById("descriptionInterest").value = "";

    fetch('../api/interests/')
	.then((resp) => resp.json()) 
	.then(function(data){
		//console.log(data);
		return data.map(function(interest){
			let interestId = interest.self.substring(interest.self.lastIndexOf('/') + 1);
            
            let optionElimina = document.createElement("option");
            optionElimina.id = "InterestToDelete" + interestId;
            optionElimina.value = "InterestToDelete" + interestId;
            optionElimina.innerHTML = interest.name;

            let optionModifica = document.createElement("option");
            optionModifica.id = "InterestToModify" + interestId;
            optionModifica.value = "InterestToModify"+interestId;
            optionModifica.innerHTML = interest.name;

            selectElimina.appendChild(optionElimina);
            selectModifca.appendChild(optionModifica);

		})
	})
	.catch( error => console.error(error) );
}

function insertNewInterest(){
    let name = document.getElementById("nameInterest").value;
    let desc = document.getElementById("descriptionInterest").value;

    fetch('../api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {name: name, description: desc} ),
    })    
    .then( function (resp){
        console.log(resp);
        if (resp.status != 201){
            onErrorInsert(resp.statusText);
        }else{
            onSuccess();
        }
    })
    .catch( error => console.error(error) );
}

function deleteInterest(){
    let selectElimina = document.getElementById("interestToDelete").value;
    let interestId = parseInt(selectElimina.substring(selectElimina.lastIndexOf('e') + 1), 10);

    if(selectElimina == "not_selected"){
        onErrorDelete("Prego, seleziona un interesse da eliminare.");
    }else{
        fetch('../api/interests/'+interestId, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        })    
        .then( function (resp){
            console.log(resp);
            if (resp.status != 204){
                onErrorDelete(resp.statusText);
            }else{
                onSuccess();
            }
        })
        .catch( error => console.error(error) );
    }
    //console.log(interestId);
}

function modifyInterest(){
    let selectModifica = document.getElementById("interestToModify").value;
    let interestId = parseInt(selectModifica.substring(selectModifica.lastIndexOf('y') + 1), 10);


    let newName = document.getElementById("updateNameInterest").value;
    let newDescription = document.getElementById("updateDescriptionInterest").value;
  
    let updateInterest = {
        name: newName,
        description: newDescription
    }

    fetch('../api/interests/' + interestId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
		body: JSON.stringify(updateInterest),
    })
    .then((resp) => {
		if (resp.status != 200){
            onErrorModify(resp.statusText);
        }else{
            onSuccess();
        }
		
		return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here

    console.log(interestId);
}

function onErrorInsert(error){
    document.getElementById("showErrorInsert").style.display = 'block';
    document.getElementById("showErrorInsert").innerText = error;
}


function onErrorDelete(error){
    document.getElementById("showErrorDelete").style.display = 'block';
    document.getElementById("showErrorDelete").innerText = error;
}

function onErrorModify(error){
    document.getElementById("showErrorModify").style.display = 'block';
    document.getElementById("showErrorModify").innerText = error;
}

function onSuccess(){
    window.location.reload();
}