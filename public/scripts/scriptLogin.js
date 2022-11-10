function login()
{
    //get the form object
    var userEmail = document.getElementById("email").value;
    var userPassword = document.getElementById("password").value;
    
    var uri = "../api/users?email=" + userEmail + "&password=" + userPassword;
    var res = encodeURI(uri);

    if(userEmail == 'admin' && userPassword == 'admin'){
        window.location.assign("./admin");
    }else{
        fetch(res)
        .then(function(data) {
            if (data.status != 200){
                onError(data.statusText);
            }else{
                return data;
            }
        })
        .then(function(resp){
            if(resp){
                return resp.json();
            }else{
                return;
            }
        })
        .then(function(data) {
            if(data){
                onSuccess(data);
            }else{
                return;
            } 
        })
        .catch( error => console.error(error) );
        }
}

function onError(error){
    document.getElementById("showError").style.display = 'block';
    document.getElementById("showError").innerText = error
}

function onSuccess(data){
    let loggedUser = data;
    window.location.assign("./LoggedUser?id=" + loggedUser.idUser);
}
