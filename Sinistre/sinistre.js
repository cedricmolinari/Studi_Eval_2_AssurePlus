var IDconnexion = document.querySelector('h3');

function getQueryParam(paramName) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(paramName);
  }

const num_clt = getQueryParam('num_clt');
console.log('Numéro client:', num_clt);


  

window.addEventListener("load", () => {
    fetch('http://localhost:3000/api/clients/', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      },
    })
    .then((response) => {
        response.json().then(message => ({
            message: message,
            status: response.status
        })).then(response => {
            console.log(response.message);
            var cltIndiceArray;
            for (let i = 0; i < response.message.length; i++) {
                if (response.message[i].num_clt == num_clt) {
                    cltIndiceArray = i;
                }
            }
            let user = `${response.message[cltIndiceArray].nom_clt} ${response.message[cltIndiceArray].prenom_clt}`
            IDconnexion.innerHTML = `Vous êtes connecté en tant que : ${user}`
            sessionStorage.setItem('bandeauConnexion', IDconnexion.innerHTML);
            sessionStorage.setItem('clientID', response.message[cltIndiceArray].id_clt);
        })
    })
}) 