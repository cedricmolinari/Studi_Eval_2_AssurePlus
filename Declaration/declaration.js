var IDconnexion = document.querySelector("h3");
var clientID = [];
var okForUploads = [];

document.addEventListener("DOMContentLoaded", function () {
  const bandeauConnexion = sessionStorage.getItem("bandeauConnexion");
  if (bandeauConnexion) {
    document.getElementById("IDconnexion").innerHTML = bandeauConnexion;
  }
});

window.addEventListener("load", () => {
  const stockageClientID = sessionStorage.getItem("clientID");
  clientID.push(stockageClientID);
});

let inputReferenceSin = document.querySelector("#referenceSin");
let inputDateSin = document.querySelector("#dateSin");
let inputImmatSin = document.querySelector("#immatSin");
let inputDommageCorporelSin = document.querySelector("#dommageCorporelSin");
let inputResponsableSin = document.querySelector("#responsableSin");
let inputRueSin = document.querySelector("#rueSin");
let inputVilleSin = document.querySelector("#villeSin");
let inputCPSin = document.querySelector("#CPSin");
let inputFormulaire = document.querySelector("#formID");
let inputCommentaire = document.querySelector("#comID");

let declarationForm = document.querySelector(".form");
let declarationFormCommentaire = document.querySelector(".formCommentaire");
let declarationFormMlpImg = document.querySelector(".formMultipleImg");
let declarationFormFormulaire = document.querySelector(".formFormulaire");

let formatImmatSin = new RegExp("^[A-Z]{2}[-][0-9]{3}[-][A-Z]{2}$");
let formatCP = new RegExp("^[0-9]+$");

var path = document.getElementById("path");
var obPath = document.getElementById("obPath");

//présélectionne la date du jour sur le champ 'date sinistre'
inputDateSin.valueAsDate = new Date();

// retourne la valeur d'un champ input
function getVal(input) {
  const val = input.value;
  return val;
}

//création d'un élément <p> en cas d'erreur de format lors de la saisie dans un des inputs form
function alerteElementP(erreurInput, messageAlerte, divInput) {
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
function checkImmatSin(input) {
  if (!formatImmatSin.test(input)) {
    alerteElementP(
      "erreurNumClt",
      "Le format [AA-000-AA] de la plaque d'immatriculation est incorrect",
      "divImmatSin"
    );
    return false;
  } else {
    return true;
  }
}

//vérifier le format du code postal
function ckeckCPSin(input) {
  if (!formatCP.test(input)) {
    alerteElementP(
      "erreurCPSin",
      "Le code postal ne peut contenir que des chiffres",
      "divCPSin"
    );
    return false;
  } else {
    return true;
  }
}

declarationForm.addEventListener("submit", (event) => {
  event.preventDefault();

  

  checkImmatSin(getVal(inputImmatSin));
  ckeckCPSin(getVal(inputCPSin));

  let declaration =
    checkImmatSin(getVal(inputImmatSin)) && ckeckCPSin(getVal(inputCPSin));

  //empêche la saisie d'une date dans le futur
  let today = Date.now();
  let dateSaisie = inputDateSin;
  let dateSaisieTimestamp = Date.parse(dateSaisie.value);

  if (dateSaisieTimestamp > today) {
    declaration = false;
    alerteElementP(
      "erreurDateSin",
      "La date saisie ne peut pas être postérieure à la date du jour",
      "divDateSin"
    );
  }

  if (declaration) {
    let prefixeRef = inputDateSin.value;
    let suffixeRef = getVal(inputImmatSin).replaceAll("-", "");
    inputReferenceSin.value = prefixeRef + "-" + suffixeRef;

    const formData = new FormData(declarationForm);
    const data = Object.fromEntries(formData);

    fetch(`/api/declaration/${clientID}`, {
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
          alert(response.message.result);
          okForUploads.push(true);
          //on désactive tous les champs du formulaire de déclaration
          inputDateSin.setAttribute("disabled", "");
          inputImmatSin.setAttribute("disabled", "");
          inputDommageCorporelSin.setAttribute("disabled", "");
          inputResponsableSin.setAttribute("disabled", "");
          inputRueSin.setAttribute("disabled", "");
          inputVilleSin.setAttribute("disabled", "");
          inputCPSin.setAttribute("disabled", "");
          inputCommentaire.setAttribute("disabled", "");
          declarationFormMlpImg.style.display = "";
          declarationFormFormulaire.style.display = "";
        });
    });
  }
});

declarationFormMlpImg.addEventListener("submit", (event) => {
  event.preventDefault();
  if (okForUploads[0]) {
    const bodyFormData = new FormData();
    const files = event.target.image_pho.files;
    if (files.length != 0) {
      for (const single_file of files) {
        bodyFormData.append("image_pho", single_file);
      }
    }
    fetch("/api/declarations/multiple-images/", {
      method: "POST",
      body: bodyFormData,
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        if (response.success) {
          alert(response.success);
        }

        var count = response.arrError.length;
        for (let i = 0; i < count; i++) {
          alerteElementP(
            `erreurPhoMlp${i}`,
            response.arrError[i].message,
            "divMlpPhoto"
          );
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    alert("Merci de soumettre un sinistre valide d'abord");
  }
});

declarationFormFormulaire.addEventListener("submit", (event) => {
  if (okForUploads[0]) {
    event.preventDefault();
    const file = event.target.document_form.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append("document_form", file);
    fetch("/api/declarations/single-formulaire/", {
      method: "POST",
      body: bodyFormData,
    }).then((response) => {
      response
        .json()
        .then((message) => ({
          message: message,
          status: response.status,
        }))
        .then((response) => {
          alert(response.message.result);
        });
    });
  } else {
    alert("Merci de soumettre un sinistre valide d'abord");
  }
});
