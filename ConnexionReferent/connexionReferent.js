let submitConnectForm = document.querySelector('#connectionForm');
let btnConnexion = document.getElementById('#btnConnexion')
let inputUser = document.querySelector('#user')
let inputPw = document.querySelector('#pw')

let connexion = false

// retourne la valeur d'un champ input'
function getVal(input) {
    const val = input.value;
    return val;
}


submitConnectForm.addEventListener('submit', event => {
    
    event.preventDefault();
    const formData = new FormData(submitConnectForm);
    const data = Object.fromEntries(formData);
    console.log(JSON.stringify(data));

    
    fetch('/api/referents/connexion', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        })

        .then((response) => {
            response.json()
            .then(message => ({
                message: message,
                status: response.status
            }))
            .then(response => {
                console.log(response.message);
                connexion = response.message.password_ut

                if (!connexion) {
    
                    // ajout d'un message dans le DOM pour signaler le problème
                    if (document.getElementById('erreurConnexion') == undefined) {
                        var elementP = document.createElement("p");
                        var message = document.createTextNode("Combinaison utilisateur et mot de passe incorrecte");
                        elementP.appendChild(message);
                        elementP.setAttribute("id", "erreurConnexion")
                        var element = document.getElementById("new");
                        element.appendChild(elementP);
                    }
                    
                } else {
                    console.log('vous etes connecté !');
                    connexion = true
                }
            })
    
            .then((() => {
                if (connexion) {
                    submitConnectForm.submit();
                } else {
                    btnConnexion.removeAttribute("onclick")
                }
            }))
        })

        .catch((error) => {
            console.error('Error:', error);
        });
})