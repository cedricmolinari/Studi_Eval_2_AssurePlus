/* let inputNom = document.querySelector('#nom').value;
let inputPrenom = document.querySelector('#prenom').value;
let inputEmail = document.querySelector('#email').value;
let inputNumclient = document.querySelector('#numclient').value;
let inputMotdepasse = document.querySelector('#motdepasse').value;
let inputNumerotel = document.querySelector('#numerotel').value; */
let btnValinscription = document.querySelector('#valinscription');
let inscriptionForm = document.querySelector('.form');

//mettre en place un hash/salt du mdp quand on le crée en database : https://www.makeuseof.com/nodejs-bcrypt-hash-verify-salt-password/

/* inscriptionForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(inscriptionForm);
    const data = Object.fromEntries(formData);
    console.log(JSON.stringify(data));
    
    fetch('../index.js/clients', {
    method: 'POST', // or 'PUT'
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
})
*/

fetch('../app.js', {
  method: 'GET', // or 'PUT'
  headers: {
      'Content-Type': 'application/json'
  }
  })
  .then((response) => console.log(response.json()))
  .catch((error) => {
    console.error('Error:', error);
  });
 