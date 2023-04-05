let submitConnectForm = document.querySelector('.connectionForm');
let btnConnexion = document.getElementById('btnConnexion')
let inputTxtNumClt = document.querySelector('.numClt')
let inputPwClt = document.querySelector('.pwClt')

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

    
    fetch('http://localhost:3000/api/clients/num/', {
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
                console.log(response.message.result.mdp_clt);
                connexion = response.message.result.mdp_clt

                if (!connexion) {
    
                    // ajout d'un message dans le DOM pour signaler le problème
                    if (document.getElementById('erreurConnexion') == undefined) {
                        var elementP = document.createElement("p");
                        var message = document.createTextNode("Combinaison client et mot de passe inexistante");
                        elementP.appendChild(message);
                        elementP.setAttribute("id", "erreurConnexion")
                        var element = document.getElementById("new");
                        element.appendChild(elementP);
                    }
                    
                } else {
                    console.log('client trouvé !');
                    connexion = true
                }
            })
    
            .then((() => {
                if (connexion) {
                    //btnConnexion.setAttribute("onclick", "location.href = 'http://localhost:3000/Sinistre/sinistre.html'")
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

/* submitConnectForm.addEventListener('submit', event => {
    
    
    event.preventDefault()

    
    fetch('http://localhost:3000/api/clients/num/' + getVal(inputTxtNumClt), {
        method: 'GET', // or 'PUT'
        headers: {
            'Content-Type': 'application/json'
        }
        })
        .then(function(response) {
            
            return response.json()
        })
        .then((function(json) {
            const obj = JSON.parse(json);
            console.log(obj);
            if (json.result === undefined) {
                connexion = false

                // ajout d'un message dans le DOM pour signaler le problème
                if (document.getElementById('erreurConnexion') == undefined) {
                    console.log(json);
                    var elementP = document.createElement("p");
                    var message = document.createTextNode("Combinaison client et mot de passe inexistante");
                    elementP.appendChild(message);
                    elementP.setAttribute("id", "erreurConnexion")
                    var element = document.getElementById("new");
                    element.appendChild(elementP);
                }
                
            } else if (json.result.mdp_clt === getVal(inputPwClt)) {
                console.log('client trouvé !');
                connexion = true
            } else {
                console.log('Mdp incorrect');
                console.log(json);
                connexion = false
                // ajout d'un message dans le DOM pour signaler le problème
                if (document.getElementById('erreurConnexion') == undefined) {
                    var elementP = document.createElement("p");
                    var message = document.createTextNode("Combinaison client et mot de passe inexistante");
                    elementP.appendChild(message);
                    elementP.setAttribute("id", "erreurConnexion")
                    var element = document.getElementById("new");
                    element.appendChild(elementP);
                }
            }
        }))

        .then((() => {
            if (connexion) {
                //btnConnexion.setAttribute("onclick", "location.href = 'http://localhost:3000/Sinistre/sinistre.html'")
                //submitConnectForm.submit();
            } else {
                btnConnexion.removeAttribute("onclick")
            }
            
        }))

        .catch((error) => {
            console.error('Error:', error);
        });
}) */

