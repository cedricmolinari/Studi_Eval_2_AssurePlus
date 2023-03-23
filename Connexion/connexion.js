let submitConnectForm = document.querySelector('.connectionForm');
let btnConnexion = document.getElementById('btnConnexion')
let inputTxtNumClt = document.querySelector('.numClt')
let inputPwClt = document.querySelector('.pwClt')

let connexion = false

// retourne la valeur du champ num_clt
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
        },
        })
        .then(function(response) {
            
            return response.json()
        })
        .then((function(json) {
            //console.log(json[0])
            if (json[0] === undefined) {
                console.log('client inexistant');
                connexion = false
                
            } else if (json[0].mdp_clt === getVal(inputPwClt)) {
                console.log('client trouvé !');
                connexion = true
            } else {
                console.log('Mdp incorrect');
            }
        }))

        .then((function(json) {
            if (connexion) {
                btnConnexion.setAttribute("onclick", "location.href = 'http://localhost:3000/Sinistre/sinistre.html'");
                submitConnectForm.submit();
            } else {
                btnConnexion.removeAttribute("onclick")
            }
        }))

        .catch((error) => {
            console.error('Error:', error);
        });
})

