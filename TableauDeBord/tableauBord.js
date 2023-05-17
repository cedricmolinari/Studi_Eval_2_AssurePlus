var elFormSelectDossier = document.querySelector("#formSelectDossier");
var elSelectClient = document.querySelector("#menu-clients");
var elSelectSinistre = document.querySelector("#menu-sinistres");
var btnSubmitCom = document.querySelector("#submitCom");
var arrListeClients = [];
var arrListeSinistres = [];

//au chargement de la page, on charge tous les clients de la BDD
window.addEventListener("load", (event) => {
  fetch("/api/clients/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    response
      .json()
      .then((message) => ({
        message: message,
        status: response.status,
      }))
      .then((response) => {
        arrListeClients.push(response);
        for (let i = 0; i < response.message.length; i++) {
          const elOption = document.createElement("option");
          elOption.setAttribute("id", `${response.message[i].id_clt}`);
          elOption.value = `${response.message[i].num_clt} : ${response.message[i].nom_clt} ${response.message[i].prenom_clt}`;
          elOption.textContent = `${response.message[i].num_clt} : ${response.message[i].nom_clt} ${response.message[i].prenom_clt}`;
          elSelectClient.appendChild(elOption);
        }
      });
  });
});

//menu déroulant liste clients, on sélectionne un des clients chargés
elSelectClient.addEventListener("change", (event) => {
  document.querySelector("#ligneRefSin").innerHTML = ``;
  document.querySelector("#ligneDateSin").innerHTML = ``;
  document.querySelector("#etatSin").innerHTML = ``;
  document.querySelector("#ligneRueSin").innerHTML = ``;
  document.querySelector("#ligneCPSin").innerHTML = ``;
  document.querySelector("#ligneVilleSin").innerHTML = ``;
  document.querySelector("#ligneDmgSin").innerHTML = ``;
  document.querySelector("#ligneRespSin").innerHTML = ``;
  document.querySelector("#ligneComClt").innerHTML = ``;
  document.querySelector("#comRef").value = ``;
  document.querySelector("#lignePhotoSin").innerHTML = ``;
  var clientID;
  for (let i = 0; i < arrListeClients[0].message.length; i++) {
    if (
      arrListeClients[0].message[i].num_clt ==
      event.target.value.substring(0, 3)
    ) {
      clientID = arrListeClients[0].message[i].id_clt;
    }
  }
  fetch(`/api/sinistres/consultation/${clientID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    response
      .json()
      .then((message) => ({
        message: message,
        status: response.status,
      }))
      .then((response) => {
        console.log(response);
        arrListeSinistres.push(response);
        while (
          elSelectSinistre.firstChild &&
          elSelectSinistre.lastChild != document.querySelector("#valSinDefault")
        ) {
          elSelectSinistre.removeChild(elSelectSinistre.lastChild);
        }
        for (let i = 0; i < response.message.result.length; i++) {
          const elOption = document.createElement("option");
          elOption.setAttribute("id", `${response.message.result[i].id_sin}`);
          elOption.value = `${response.message.result[i].reference_sin}`;
          elOption.textContent = `${response.message.result[i].reference_sin}`;
          elSelectSinistre.appendChild(elOption);
        }
      });
  });
});

//menu liste sinistres, on sélectionne l'un des sinistres du client sélectionné
elSelectSinistre.addEventListener("change", (event) => {
  for (let i = 0; i < arrListeSinistres[0].message.result.length; i++) {
    var sinistreID;
    if (
      arrListeSinistres[0].message.result[i].reference_sin == event.target.value
    ) {
      sinistreID = arrListeSinistres[0].message.result[i].id_sin;
    }
  }
});

//on affiche les infos du sinistre sélectionné
var consultationSin = false;
elSelectSinistre.addEventListener("change", (event) => {
  consultationSin = true;
  fetch(
    `/api/sinistres/consultation/encours/${event.target.selectedOptions[0].id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((response) => {
    response
      .json()
      .then((message) => ({
        message: message,
        status: response.status,
      }))
      .then((response) => {
        console.log(response);
        var boolResp = response.message.result.responsable_sin;
        var boolDmg = response.message.result.dommage_corporel_sin;
        document.querySelector(
          "#ligneRefSin"
        ).innerHTML = `${response.message.result.reference_sin}`;
        document.querySelector(
          "#ligneDateSin"
        ).innerHTML = `${response.message.result.date_sin}`;
        document.querySelector(
          "#etatSin"
        ).innerHTML = `${response.message.result.etat_sin}`;
        document.querySelector(
          "#ligneRueSin"
        ).innerHTML = `${response.message.result.rue_sin}`;
        document.querySelector(
          "#ligneCPSin"
        ).innerHTML = `${response.message.result.cp_sin}`;
        document.querySelector(
          "#ligneVilleSin"
        ).innerHTML = `${response.message.result.ville_sin}`;
        document.querySelector("#ligneDmgSin").innerHTML =
          boolDmg === true ? "oui" : "non";
        document.querySelector("#ligneRespSin").innerHTML =
          boolResp === true ? "oui" : "non";
        document.querySelector("#ligneComClt").innerHTML =
          response.message.result.commentaire_sin === null
            ? ""
            : response.message.result.commentaire_sin;
        document.querySelector("#comRef").value =
          response.message.result.commentaire_referent_sin === null
            ? ""
            : response.message.result.commentaire_referent_sin;
        document.querySelector("#lignePhotoSin").innerHTML = ``;
        fetch(
          `/api/declarations/multiple-images/get/${response.message.result.id_sin}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        ).then((response) => {
          response
            .json()
            .then((message) => ({
              message: message,
              status: response.status,
            }))
            .then((response) => {
              for (let j = 0; j < response.message.result.length; j++) {
                //ajoute une image
                var elementImg_DetailSinPhotos = document.createElement("img");
                elementImg_DetailSinPhotos.setAttribute(
                  "id",
                  `imgView${response.message.result[j].id_pho}`
                );
                elementImg_DetailSinPhotos.setAttribute("width", "300");
                elementImg_DetailSinPhotos.setAttribute("height", "300");
                elementImg_DetailSinPhotos.style.margin = "10px"
                document
                  .querySelector("#lignePhotoSin")
                  .appendChild(elementImg_DetailSinPhotos);

                //ajoute un saut de ligne
                var elementBr = document.createElement("br");
                document.querySelector("#lignePhotoSin").appendChild(elementBr);

                //convert byte array to base64
                function _arrayBufferToBase64(buffer) {
                  var binary = "";
                  var bytes = new Uint8Array(buffer);
                  var len = bytes.byteLength;
                  for (var i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                  }
                  return window.btoa(binary);
                }

                //convert base64 to string
                var decodedStringAtoB = window.atob(
                  _arrayBufferToBase64(
                    response.message.result[j].image_pho.data
                  )
                );
                document.getElementById(
                  `imgView${response.message.result[j].id_pho}`
                ).src = `${decodedStringAtoB}`;
              }
            });
        });
      });
  });
});

//ajout d'un commentaire par le référent du dossier quand on clique sur le bouton d'édition
document.querySelector("#modifComRef").addEventListener("click", () => {
  if (consultationSin) {
    //document.querySelector('#selectEtatSin').style.display = '';
    document.querySelector('#submitModifs').removeAttribute('disabled');
    document.querySelector('#submitModifs').innerHTML = 'Cliquer ici pour enregistrer';
    document.querySelector("#comRef").removeAttribute("disabled");
  } else {
    alert("Merci de sélectionner un sinistre");
  }
});

var editionEtatSin = false;
//changement d'état du sinistre
document.querySelector("#modifEtatSin").addEventListener("click", () => {
  if (consultationSin) {
    editionEtatSin = true
    document.querySelector('#submitModifs').removeAttribute('disabled');
    document.querySelector('#submitModifs').innerHTML = 'Cliquer ici pour enregistrer';
    document.querySelector("#etatSin").innerHTML = '';
    const select = document.createElement("select");
    select.setAttribute('id', 'selectEtatSin')
    const optionEnCours = document.createElement("option");
    const optionTermine = document.createElement("option");


    optionEnCours.value = "en_cours";
    optionEnCours.text = "En cours";
    optionTermine.value = "termine";
    optionTermine.text = "Terminé";

    select.appendChild(optionEnCours);
    select.appendChild(optionTermine);

    const etatSin = document.getElementById("etatSin");
    etatSin.parentNode.insertBefore(select, etatSin.nextSibling);
  } else {
    alert("Merci de sélectionner un sinistre");
  }
});

//enregistrer les modifications
document.querySelector('#submitModifs').addEventListener('click', () => {
  document.querySelector('#comRef').setAttribute('disabled', '');

  var valeurComRef = document.querySelector('#comRef').value;
  document.querySelector('#submitModifs').setAttribute('disabled', '');
  document.querySelector('#submitModifs').value = 'Cliquer sur les icones d\'édition pour modifier';

  var sinistreID = document.querySelector('#menu-sinistres').selectedOptions[0].id
  var inputData = { id_sin: sinistreID, commentaire_referent_sin: valeurComRef}
  fetch(`/api/referent/put/com-referent/${sinistreID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inputData),
  }).then((response) => {
    response
      .json()
      .then((message) => ({
        message: message,
        status: response.status,
      }))
      .then((response) => {
        console.log(response);
      })
  })
  if (editionEtatSin) {
    document.querySelector('#selectEtatSin').style.display = 'none';
    document.querySelector('#etatSin').innerHTML = document.querySelector('#selectEtatSin').selectedOptions[0].innerHTML;
    var valeurEtatSin = document.querySelector('#etatSin').innerHTML;
    var inputData = { id_sin: sinistreID, etat_sin: valeurEtatSin}
    console.log(inputData);
    fetch(`/api/referent/put/etat-sinistre/${sinistreID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputData),
    }).then((response) => {
      response
        .json()
        .then((message) => ({
          message: message,
          status: response.status,
        }))
        .then((response) => {
        })
      })
    }
    alert('Modification effectuée !')
    location.reload();

})
