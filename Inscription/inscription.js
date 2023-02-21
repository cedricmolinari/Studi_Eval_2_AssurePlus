/* let inputNom = document.querySelector('#nom').value;
let inputPrenom = document.querySelector('#prenom').value;
let inputEmail = document.querySelector('#email').value;
let inputNumclient = document.querySelector('#numclient').value;
let inputMotdepasse = document.querySelector('#motdepasse').value;
let inputNumerotel = document.querySelector('#numerotel').value; */
let btnValinscription = document.querySelector('#valinscription');
let inscriptionForm = document.querySelector('.form');

console.log(inscriptionForm);

inscriptionForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(inscriptionForm);
    const data = Object.fromEntries(formData);
    console.log(JSON.stringify(data));

    fetch('http://localhost:3000/clients', {
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
