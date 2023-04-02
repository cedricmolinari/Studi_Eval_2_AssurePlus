import { decryptPassword } from './decryptPassword.js';
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
            const obj = JSON.parse(json.result.mdp_clt);
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
                console.log(json);
                connexion = true
            } else {
                console.log('Mdp incorrect');
                console.log(json);
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

        .then((function(json) {
            if (connexion) {
                //btnConnexion.setAttribute("onclick", "location.href = 'http://localhost:3000/Sinistre/sinistre.html'");
                //submitConnectForm.submit();
            } else {
                btnConnexion.removeAttribute("onclick")
            }
        }))

        .catch((error) => {
            console.error('Error:', error);
        });
})

