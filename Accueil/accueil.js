/* let btnGetResultats = document.querySelector('.getResultats');
let btnPostInscription = document.querySelector('.form')


btnGetResultats.addEventListener('submit', event => {
    event.preventDefault()
    fetch('http://localhost:3000/api/test/', {
        method: 'GET', // or 'PUT'
        headers: {
            'Content-Type': 'application/json'
        }
        })
        .then((response) => 
            console.log(response.json())
        )
        .catch((error) => {
            console.error('Error:', error);
        });
})

btnPostInscription.addEventListener('submit', event => {
    event.preventDefault()
    const formData = new FormData(btnPostInscription);
    const data = Object.fromEntries(formData);
    console.log(JSON.stringify(data));
    fetch('http://localhost:3000/api/test/', {
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
}) */