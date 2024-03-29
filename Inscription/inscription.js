let inputNumClt = document.querySelector("#numClt");
let inputMdpClt = document.querySelector("#mdpClt");
let inputNomClt = document.querySelector("#nomClt");
let inputPrenomClt = document.querySelector("#prenomClt");
let inputCPClt = document.querySelector("#CPClt");
let inputMailClt = document.querySelector("#mailClt");
let inputTelClt = document.querySelector("#telClt");

let elPlogConditions = document.querySelector("#logConditions");

let btnValinscription = document.querySelector("#valinscription");
let inscriptionForm = document.querySelector(".form");

let formatPassword = new RegExp(
  "((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))"
);
let formatNumClt = new RegExp("^[0-9]+$");
let formatCP = new RegExp("^[0-9]+$");
var formatMail = new RegExp(
  /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
);

let inscription = false;

// retourne la valeur d'un champ input
function getVal(input) {
  const val = input.value;
  return val;
}

//création d'un élément <p> en cas d'erreur de format lors de la saisie dans un des inputs form
function alerteElementP(erreurInput, messageAlerte, divInput) {
  console.log(erreurInput, messageAlerte, divInput);
  if (document.getElementById(erreurInput) == undefined) {
    var elementP = document.createElement("p");
    var message = document.createTextNode(messageAlerte);
    elementP.appendChild(message);
    elementP.setAttribute("id", erreurInput);
    var element = document.getElementById(divInput);
    element.appendChild(elementP);
  }
}

//vérifier le format du num clt
function checkNumClt(input) {
  if (!formatNumClt.test(input)) {
    alerteElementP(
      "erreurNumClt",
      "Le numéro client ne peut contenir que des chiffres",
      "divNumClt"
    );
    return false;
  } else {
    return true;
  }
}

//vérifier le format du mdp
function ckeckMdpClt(input) {
  console.log(input);
  if (!formatPassword.test(input)) {
    alerteElementP(
      "erreurMdpClt",
      "Format de mot de passe incorrect",
      "divMdpClt"
    );
    return false;
  } else {
    return true;
  }
}

//vérifier le format du code postal
function ckeckCPClt(input) {
  if (!formatCP.test(input)) {
    alerteElementP(
      "erreurCPClt",
      "Le code postal ne peut contenir que des chiffres",
      "divCPClt"
    );
    return false;
  } else {
    return true;
  }
}

//vérifier le format de l'adresse mail
function checkMailClt(input) {
  if (!formatMail.test(input)) {
    alerteElementP(
      "erreurMailClt",
      "Le format du mail est incorrect",
      "divMailClt"
    );
    return false;
  } else {
    return true;
  }
}

inscriptionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(inscriptionForm);
  const data = Object.fromEntries(formData);

  checkNumClt(getVal(inputNumClt));
  ckeckMdpClt(getVal(inputMdpClt));
  ckeckCPClt(getVal(inputCPClt));
  checkMailClt(getVal(inputMailClt));

  let inscription =
    checkNumClt(getVal(inputNumClt)) &&
    ckeckMdpClt(getVal(inputMdpClt)) &&
    ckeckCPClt(getVal(inputCPClt)) &&
    checkMailClt(getVal(inputMailClt));

  if (inscription) {
    fetch("/api/clients/", {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => {
      response
        .json()
        .then((message) => ({
          message: message,
          status: response.status,
        }))
        .then((response) => {
          if (
            response.message.message ==
            "Numéro client et/ou adresse mail déjà enregistrée, merci de vous connecter"
          ) {
            alert(response.message.message);
            window.location.href = "../Connexion/connexion.html";
          } else if (
            response.message.result ==
            "Inscription réussie, vous pouvez maintenant vous connecter"
          ) {
            alert(response.message.result);
            window.location.href = "../Connexion/connexion.html";
          }
        });
    });
  }
});
