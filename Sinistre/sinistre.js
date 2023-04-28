var IDconnexion = document.querySelector('h3');

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
            let user = `${response.message[0].nom_clt} ${response.message[0].prenom_clt}`
            IDconnexion.innerHTML = `Vous êtes connecté en tant que : ${user}`
        })
    })
})