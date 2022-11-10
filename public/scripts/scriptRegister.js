function register()
{
    //get the form object
    var userName = document.getElementById("u_name").value;
    var userSurname = document.getElementById("surname").value;
    var userEmail = document.getElementById("email").value;
    var userPassword = document.getElementById("password").value;
    var userCheckPassword = document.getElementById("check_password").value;
    var userBirthday = document.getElementById("birthday").value;
    var userSex = document.getElementById("sex").value;
    var userSexOrientation = document.getElementById("sex_orientation").value;

    fetch('../api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {u_name: userName, surname: userSurname, email: userEmail, password: userPassword, check_password: userCheckPassword, birthday: userBirthday, sex: userSex, sex_orientation: userSexOrientation } ),
    })    
    .then( function (resp){
        console.log(resp);
        if (resp.status != 201){
            onError(resp.statusText);
        }else{
            onSuccess();
        }
    })
    .catch( error => console.error(error) );
}


function onError(error){
    document.getElementById("showError").style.display = 'block';
    document.getElementById("showError").innerText = error;
}

function onSuccess(){
    window.location.assign("./login")
}







