let inputNom = document.querySelector('#nom');
let inputPrenom = document.querySelector('#prenom');
let inputEmail = document.querySelector('#email');
let inputNumclient = document.querySelector('#numclient');
let inputMotdepasse = document.querySelector('#motdepasse');
let inputNumerotel = document.querySelector('#numerotel');
let elPlogConditions = document.querySelector('#logConditions');

let btnValinscription = document.querySelector('#valinscription');
let inscriptionForm = document.querySelector('.form');

let mediumPassword = new RegExp('((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))')

let inscription = false

// retourne la valeur d'un champ input
function getVal(input) {
  const val = input.value;
  return val;
}

//vérifier le format du mdp
function StrengthChecker(PasswordParameter) {
  if(!mediumPassword.test(PasswordParameter)) {
    inscription = false
    alert("Format du mot de passe invalide");
  } else {
    inscription = true
  }
}

//mettre en place un hash/salt du mdp quand on le crée en database : https://www.makeuseof.com/nodejs-bcrypt-hash-verify-salt-password/

inscriptionForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(inscriptionForm);
    const data = Object.fromEntries(formData);
    console.log(JSON.stringify(data));

    StrengthChecker(getVal(inputMotdepasse))
    if (inscription) {
      fetch('http://localhost:3000/api/clients/', {
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
      .then(alert("Inscription réussie, merci de vous connecter"))
      .then(window.location.assign("http://localhost:3000/Connexion/connexion.html"))
      .catch((error) => {
        console.error('Error:', error);
      });
    }
})