var infoConnexion = document.querySelector("h3");
var infoSinistreDetail = document.querySelector("fieldset");
var tableauSinistres = document.querySelector("tbody");
var boutonModifDonnees = document.querySelector("#modifDonnees");
var boutonNouvellePhoto = document.querySelector("#btnNouvellePhoto");
var formNouvellePhoto = document.querySelector("#formAjoutPhoto");
var boutonNouveauFormulaire = document.querySelector("#btnNouveauFormulaire");
var formNouveauFormulaire = document.querySelector("#formAjoutFormulaire");
var boutonSaveModif = document.querySelector("#saveModif");
var colRef = document.querySelector("#ref");
var colDate = document.querySelector("#date");
var colEtat = document.querySelector("#etat");
var disabledElements = [];
var arrSinistresID = [];
var arrSinistreIDSelect = [];
var arrPhotosID = [];
var formulaireID = [];
var clientID;
var modifEnCours = false;
let j = -1;

boutonModifDonnees.style.display = 'none';
formNouvellePhoto.style.display = 'none';
formNouveauFormulaire.style.display = 'none';

document.addEventListener("DOMContentLoaded", function () {
  const bandeauConnexion = sessionStorage.getItem("bandeauConnexion");
  if (bandeauConnexion) {
    document.getElementById("IDconnexion").innerHTML = bandeauConnexion;
  }
});

var stockageClientID;
window.addEventListener("load", () => {
  stockageClientID = sessionStorage.getItem("clientID");
});

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
      let ID = `${stockageClientID}`;
      infoConnexion.setAttribute("id", ID);
      clientID = infoConnexion.getAttribute("id");
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
            //ajoute tous les sinistres du client connecté
            function createMouseOverHandler(element) {
              return function () {
                element.style.color = "white";
              };
            }

            function createMouseOutHandler(element) {
              return function () {
                element.style.color = "";
              };
            }

            for (let i = 0; i < response.message.result.length; i++) {
              if (response.message.result[i].etat_sin == "En cours") {
                j = j + 1;
                arrSinistresID.push(response.message.result[i].id_sin);

                var elementP_Ref = document.createElement("p");
                var refSinistre = document.createTextNode(
                  response.message.result[i].reference_sin
                );
                elementP_Ref.appendChild(refSinistre);
                elementP_Ref.setAttribute("id", `ref_${j}`);
                colRef.appendChild(elementP_Ref);

                // Ajouter les styles pour l'élément p
                elementP_Ref.style.cursor = "pointer";

                elementP_Ref.addEventListener(
                  "mouseover",
                  createMouseOverHandler(elementP_Ref)
                );
                elementP_Ref.addEventListener(
                  "mouseout",
                  createMouseOutHandler(elementP_Ref)
                );

                var elementP_Date = document.createElement("p");
                var dateSinistre = document.createTextNode(
                  response.message.result[i].date_sin
                );
                elementP_Date.appendChild(dateSinistre);
                colDate.appendChild(elementP_Date);

                var elementP_Etat = document.createElement("p");
                var etatSinistre = document.createTextNode(
                  response.message.result[i].etat_sin
                );
                elementP_Etat.appendChild(etatSinistre);
                colEtat.appendChild(elementP_Etat);
              }
            }

            var refSinList = document
              .querySelector("#ref")
              .querySelectorAll("p");

            //affiche les informations du sinistre sur lequel l'utilisateur clique
            refSinList.forEach((element) => {
              element.addEventListener("click", (e) => {
                if (modifEnCours == false) {
                  disabledElements = [];
                  //on affiche les boutons modifier et ajout photo
                  boutonModifDonnees.style.display = "";
                  formNouvellePhoto.style.display = "";
                  formNouveauFormulaire.style.display = "";

                  //on met la référence du sinistre en cours de consultation dans le fieldset
                  document.querySelector(
                    "legend"
                  ).innerHTML = `Référence sinistre : ${e.target.innerHTML}`;
                  //on commence par supprimer les détails de sinistre ajoutés lors de précédents clics si nécessaire
                  while (
                    infoSinistreDetail.firstChild &&
                    infoSinistreDetail.lastChild !=
                      document.querySelector("legend")
                  ) {
                    infoSinistreDetail.removeChild(
                      infoSinistreDetail.lastChild
                    );
                  }
                  arrSinistreIDSelect =
                    arrSinistresID[e.target.id.charAt(e.target.id.length - 1)];
                  fetch(
                    `/api/sinistres/consultation/encours/${arrSinistreIDSelect}`,
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
                        //<--- AJOUTE LES ELEMENTS QUAND ON CLIQUE SUR UNE REF DE SINISTRE --->
                        var elementP_DetailSinRue = document.createElement("p");
                        var elementInput_DetailSinRue =
                          document.createElement("input");
                        elementP_DetailSinRue.innerHTML = "Rue";
                        elementInput_DetailSinRue.type = "text";
                        elementInput_DetailSinRue.value = `${response.message.result.rue_sin}`;
                        elementInput_DetailSinRue.setAttribute("disabled", "");
                        elementInput_DetailSinRue.setAttribute("size", "50");
                        elementInput_DetailSinRue.setAttribute(
                          "id",
                          "DetailSinRue"
                        );
                        elementInput_DetailSinRue.classList.add(
                          "form-control",
                          "mx-auto"
                        );
                        elementInput_DetailSinRue.style.maxWidth = "35%";

                        var formGroup = document.createElement("div");
                        formGroup.classList.add("form-group", "text-center");
                        formGroup.appendChild(elementP_DetailSinRue);
                        formGroup.appendChild(elementInput_DetailSinRue);

                        var container = document.createElement("div");
                        container.classList.add("container");
                        container.appendChild(formGroup);

                        infoSinistreDetail.appendChild(container);

                        disabledElements.push(elementInput_DetailSinRue.id);

                        //ajoute le code postal
                        var elementP_DetailSinCP = document.createElement("p");
                        var elementInput_DetailSinCP =
                          document.createElement("input");
                        elementP_DetailSinCP.innerHTML = "Code postal";
                        elementInput_DetailSinCP.type = "text";
                        elementInput_DetailSinCP.value = `${response.message.result.cp_sin}`;
                        elementInput_DetailSinCP.setAttribute("disabled", "");
                        elementInput_DetailSinCP.setAttribute("size", "50");
                        elementInput_DetailSinCP.setAttribute(
                          "id",
                          "DetailSinCP"
                        );
                        elementInput_DetailSinCP.classList.add(
                          "form-control",
                          "mx-auto"
                        );
                        elementInput_DetailSinCP.style.maxWidth = "35%";

                        var formGroupCP = document.createElement("div");
                        formGroupCP.classList.add("form-group", "text-center");
                        formGroupCP.appendChild(elementP_DetailSinCP);
                        formGroupCP.appendChild(elementInput_DetailSinCP);

                        var containerCP = document.createElement("div");
                        containerCP.classList.add("container");
                        containerCP.appendChild(formGroupCP);

                        infoSinistreDetail.appendChild(containerCP);

                        disabledElements.push(elementInput_DetailSinCP.id);

                        //ajoute la ville
                        var elementP_DetailSinVille =
                          document.createElement("p");
                        var elementInput_DetailSinVille =
                          document.createElement("input");
                        elementP_DetailSinVille.innerHTML = "Ville";
                        elementInput_DetailSinVille.type = "text";
                        elementInput_DetailSinVille.value = `${response.message.result.ville_sin}`;
                        elementInput_DetailSinVille.setAttribute(
                          "disabled",
                          ""
                        );
                        elementInput_DetailSinVille.setAttribute("size", "50");
                        elementInput_DetailSinVille.setAttribute(
                          "id",
                          "DetailSinVille"
                        );
                        elementInput_DetailSinVille.classList.add(
                          "form-control",
                          "mx-auto"
                        );
                        elementInput_DetailSinVille.style.maxWidth = "35%";

                        var formGroupVille = document.createElement("div");
                        formGroupVille.classList.add(
                          "form-group",
                          "text-center"
                        );
                        formGroupVille.appendChild(elementP_DetailSinVille);
                        formGroupVille.appendChild(elementInput_DetailSinVille);

                        var containerVille = document.createElement("div");
                        containerVille.classList.add("container");
                        containerVille.appendChild(formGroupVille);

                        infoSinistreDetail.appendChild(containerVille);

                        disabledElements.push(elementInput_DetailSinVille.id);

                        //ajoute le dommage corporel
                        var elementLabel_DetailSinDmgCorpo =
                          document.createElement("label");
                        elementLabel_DetailSinDmgCorpo.for = "DmgCorp";
                        elementLabel_DetailSinDmgCorpo.innerHTML =
                          "Dommage corporel :";

                        var elementSelect_DetailSinDmgCorpo =
                          document.createElement("select");
                        elementSelect_DetailSinDmgCorpo.setAttribute(
                          "disabled",
                          ""
                        );
                        elementSelect_DetailSinDmgCorpo.setAttribute(
                          "id",
                          "DmgCorp"
                        );
                        elementSelect_DetailSinDmgCorpo.classList.add(
                          "form-control",
                          "mx-auto"
                        );
                        elementSelect_DetailSinDmgCorpo.style.width = "50%";

                        var elementOption1_DetailDmgCorpo =
                          document.createElement("option");
                        var elementOption2_DetailDmgCorpo =
                          document.createElement("option");
                        elementOption1_DetailDmgCorpo.value = response.message
                          .result.dommage_corporel_sin
                          ? "oui"
                          : "non";
                        elementOption1_DetailDmgCorpo.innerHTML = response
                          .message.result.dommage_corporel_sin
                          ? "oui"
                          : "non";
                        elementOption1_DetailDmgCorpo.setAttribute(
                          "selected",
                          ""
                        );
                        elementOption2_DetailDmgCorpo.value = response.message
                          .result.dommage_corporel_sin
                          ? "non"
                          : "oui";
                        elementOption2_DetailDmgCorpo.innerHTML = response
                          .message.result.dommage_corporel_sin
                          ? "non"
                          : "oui";

                        var formGroupDmg = document.createElement("div");
                        formGroupDmg.classList.add("form-group", "text-center");
                        formGroupDmg.appendChild(
                          elementLabel_DetailSinDmgCorpo
                        );
                        formGroupDmg.appendChild(
                          elementSelect_DetailSinDmgCorpo
                        );

                        var containerDmg = document.createElement("div");
                        containerDmg.classList.add(
                          "container",
                          "d-flex",
                          "justify-content-center"
                        );
                        containerDmg.appendChild(formGroupDmg);

                        infoSinistreDetail.appendChild(containerDmg);

                        elementSelect_DetailSinDmgCorpo.appendChild(
                          elementOption1_DetailDmgCorpo
                        );
                        elementSelect_DetailSinDmgCorpo.appendChild(
                          elementOption2_DetailDmgCorpo
                        );

                        disabledElements.push(
                          elementSelect_DetailSinDmgCorpo.id
                        );

                        //ajoute un saut de ligne
                        var elementBr = document.createElement("br");
                        infoSinistreDetail.appendChild(elementBr);

                        //ajoute la responsabilité
                        var elementLabel_DetailSinResp =
                          document.createElement("label");
                        elementLabel_DetailSinResp.for = "Resp";
                        elementLabel_DetailSinResp.innerHTML =
                          "Accident responsable : ";

                        var elementSelect_DetailSinResp =
                          document.createElement("select");
                        elementSelect_DetailSinResp.setAttribute(
                          "disabled",
                          ""
                        );
                        elementSelect_DetailSinResp.setAttribute("id", "Resp");
                        elementSelect_DetailSinResp.classList.add(
                          "form-control",
                          "mx-auto"
                        );
                        elementSelect_DetailSinResp.style.width = "50%";

                        var elementOption1_DetailResp =
                          document.createElement("option");
                        var elementOption2_DetailResp =
                          document.createElement("option");

                        elementOption1_DetailResp.value = response.message
                          .result.responsable_sin
                          ? "oui"
                          : "non";
                        elementOption1_DetailResp.innerHTML = response.message
                          .result.responsable_sin
                          ? "oui"
                          : "non";
                        elementOption1_DetailResp.setAttribute("selected", "");

                        elementOption2_DetailResp.value = response.message
                          .result.responsable_sin
                          ? "non"
                          : "oui";
                        elementOption2_DetailResp.innerHTML = response.message
                          .result.responsable_sin
                          ? "non"
                          : "oui";

                        var formGroupResp = document.createElement("div");
                        formGroupResp.classList.add(
                          "form-group",
                          "text-center"
                        );
                        formGroupResp.appendChild(elementLabel_DetailSinResp);
                        formGroupResp.appendChild(elementSelect_DetailSinResp);

                        var containerResp = document.createElement("div");
                        containerResp.classList.add(
                          "container",
                          "d-flex",
                          "justify-content-center"
                        );
                        containerResp.appendChild(formGroupResp);

                        infoSinistreDetail.appendChild(containerResp);

                        elementSelect_DetailSinResp.appendChild(
                          elementOption1_DetailResp
                        );
                        elementSelect_DetailSinResp.appendChild(
                          elementOption2_DetailResp
                        );

                        disabledElements.push(elementSelect_DetailSinResp.id);

                        //ajoute le commentaire envoyé
                        var elementDiv_DetailSinCommentaire =
                          document.createElement("div");
                        elementDiv_DetailSinCommentaire.classList.add(
                          "container",
                          "d-flex",
                          "justify-content-center",
                          "flex-column",
                          "align-items-center"
                        );

                        var elementP_DetailSinCommentaire =
                          document.createElement("p");
                        elementP_DetailSinCommentaire.innerHTML =
                          "Commentaire envoyé : ";
                        elementP_DetailSinCommentaire.classList.add(
                          "text-center"
                        );

                        var elementInput_DetailSinCommentaire =
                          document.createElement("input");
                        elementInput_DetailSinCommentaire.type = "text";
                        elementInput_DetailSinCommentaire.classList.add(
                          "form-control",
                          "text-center"
                        );
                        elementInput_DetailSinCommentaire.value = `${
                          response.message.result.commentaire_sin == null
                            ? ""
                            : response.message.result.commentaire_sin
                        }`;
                        elementInput_DetailSinCommentaire.setAttribute(
                          "disabled",
                          ""
                        );
                        elementInput_DetailSinCommentaire.setAttribute(
                          "id",
                          "DetailSinCommentaire"
                        );

                        elementDiv_DetailSinCommentaire.appendChild(
                          elementP_DetailSinCommentaire
                        );
                        elementDiv_DetailSinCommentaire.appendChild(
                          elementInput_DetailSinCommentaire
                        );

                        infoSinistreDetail.appendChild(
                          elementDiv_DetailSinCommentaire
                        );

                        disabledElements.push(
                          elementInput_DetailSinCommentaire.id
                        );

                        //ajoute le commentaire référent
                        var elementDiv_DetailSinCommentaireRef =
                          document.createElement("div");
                        elementDiv_DetailSinCommentaireRef.classList.add(
                          "container",
                          "d-flex",
                          "justify-content-center",
                          "flex-column",
                          "align-items-center"
                        );

                        var elementP_DetailSinCommentaireRef =
                          document.createElement("p");
                        elementP_DetailSinCommentaireRef.innerHTML =
                          "Commentaire référent sinistre : ";
                        elementP_DetailSinCommentaireRef.classList.add(
                          "text-center"
                        );

                        var elementInput_DetailSinCommentaireRef =
                          document.createElement("input");
                        elementInput_DetailSinCommentaireRef.type = "text";
                        elementInput_DetailSinCommentaireRef.classList.add(
                          "form-control",
                          "text-center"
                        );
                        elementInput_DetailSinCommentaireRef.style.border =
                          "1px solid red";

                        elementInput_DetailSinCommentaireRef.value = `${
                          response.message.result.commentaire_referent_sin ==
                          null
                            ? ""
                            : response.message.result.commentaire_referent_sin
                        }`;
                        elementInput_DetailSinCommentaireRef.setAttribute(
                          "disabled",
                          ""
                        );
                        elementInput_DetailSinCommentaireRef.setAttribute(
                          "id",
                          "DetailSinCommentaireRef"
                        );

                        elementDiv_DetailSinCommentaireRef.appendChild(
                          elementP_DetailSinCommentaireRef
                        );
                        elementDiv_DetailSinCommentaireRef.appendChild(
                          elementInput_DetailSinCommentaireRef
                        );

                        infoSinistreDetail.appendChild(
                          elementDiv_DetailSinCommentaireRef
                        );

                        //ajoute les photos
                        fetch(
                          `/api/declarations/multiple-images/get/${response.message.result.id_sin}`,
                          {
                            method: "GET",
                            headers: {
                              "Content-Type": "application/json",
                            },
                          }
                        )
                          .then((response) => {
                            return response.json();
                          })
                          .then((response) => {
                            var elementP_DetailSinPhotos =
                              document.createElement("p");
                            elementP_DetailSinPhotos.innerHTML = "Photos : ";
                            elementP_DetailSinPhotos.classList.add(
                              "text-center"
                            );

                            infoSinistreDetail.appendChild(
                              elementP_DetailSinPhotos
                            );

                            var imagesContainer = document.createElement("div");
                            imagesContainer.style.display = "flex";
                            imagesContainer.style.justifyContent = "center";
                            imagesContainer.style.flexWrap = "wrap";

                            infoSinistreDetail.appendChild(imagesContainer);

                            for (let j = 0; j < response.result.length; j++) {
                              //ajoute une image
                              var elementDiv = document.createElement("div");
                              elementDiv.style.position = "relative";
                              elementDiv.style.width = "auto";
                              elementDiv.style.margin = "10px";

                              // Ajoute une photo
                              var elementImg_DetailSinPhotos =
                                document.createElement("img");
                              elementImg_DetailSinPhotos.setAttribute(
                                "id",
                                `imgView${response.result[j].id_pho}`
                              );
                              elementImg_DetailSinPhotos.classList.add(
                                "img-fluid"
                              );
                              elementImg_DetailSinPhotos.style.width = "200px";
                              elementImg_DetailSinPhotos.style.height = "200px";

                              // Set the source of the image to the URL of the image in the Digital Ocean Space
                              let imageUrl = `https://uploadphotos.fra1.digitaloceanspaces.com/${response.result[j].libelle_pho}`; // Remplacer 'libelle_pho' par le champ contenant le nom de l'image
                              elementImg_DetailSinPhotos.src = imageUrl;

                              elementDiv.appendChild(
                                elementImg_DetailSinPhotos
                              );
                              imagesContainer.appendChild(elementDiv);

                              // Ajoute un bouton delete sur les photos
                              var elementInput_BtnDeletePhotos =
                                document.createElement("input");
                              elementInput_BtnDeletePhotos.type = "button";
                              elementInput_BtnDeletePhotos.value = "X";
                              elementInput_BtnDeletePhotos.setAttribute(
                                "alt",
                                "Supprimer cette photo"
                              );
                              elementInput_BtnDeletePhotos.setAttribute(
                                "title",
                                "Supprimer cette photo"
                              );
                              elementInput_BtnDeletePhotos.setAttribute(
                                "disabled",
                                ""
                              );
                              elementInput_BtnDeletePhotos.setAttribute(
                                "id",
                                `BtnDeletePhotos${response.result[j].id_pho}`
                              );
                              elementInput_BtnDeletePhotos.classList.add(
                                "position-absolute"
                              );
                              elementInput_BtnDeletePhotos.style.top = "0";
                              elementInput_BtnDeletePhotos.style.right = "0";
                              elementDiv.appendChild(
                                elementInput_BtnDeletePhotos
                              );
                              disabledElements.push(
                                elementInput_BtnDeletePhotos.id
                              );
                            }
                          })
                          .catch((error) => {
                            console.error("Error:", error);
                          });
                        fetch(
                          `/api/declarations/single-formulaire/get/${response.message.result.id_sin}`,
                          {
                            method: "GET",
                            headers: {
                              "Content-Type": "application/json",
                            },
                          }
                        )
                          .then((response) => {
                            return response.json();
                          })
                          .then((response) => {
                            if (response.result.length > 0) {

                              //ajoute un formulaire
                              var elementDivForm = document.createElement("div");
                              elementDivForm.style.position = "relative";
                              elementDivForm.style.width = "auto";
                              elementDivForm.style.margin = "10px";
                              elementDivForm.classList.add(
                                "justify-content-center"
                              );
                              infoSinistreDetail.appendChild(elementDivForm);
  
                              let imageUrl = `https://uploadphotos.fra1.digitaloceanspaces.com/${response.result[0].libelle_form}`;
                              
                              formulaireID.push(response.result[0].id_form)
                              var elementA = document.createElement("a");
                              elementA.setAttribute(
                                "id",
                                "LinkFormulaire"
                              );
                              elementA.href = imageUrl;
                              
                              elementA.textContent = "Télécharger le formulaire";
                              elementDivForm.appendChild(elementA);
  
                              // Ajoute un bouton de suppression
                              var deleteButton = document.createElement("input");
                              deleteButton.type = 'button';
                              deleteButton.setAttribute(
                                "disabled",
                                ""
                              );
                              deleteButton.setAttribute(
                                "id",
                                "BtnDeleteFormulaire"
                              );
                              deleteButton.value = "X";
                              deleteButton.style.marginLeft = "10px";
                              elementDivForm.appendChild(deleteButton);
                              disabledElements.push(
                                deleteButton.id
                              );
                            }
                          })
                          .catch((error) => {
                            console.error("Error:", error);
                          });
                      });
                  });
                } else {
                  alert(
                    "Merci d'annuler les modifications avant de sélectionner un autre sinistre"
                  );
                }
              });
            });
          });
      });
    });
});
var arrImgSinElements = [];
var addedElements = disabledElements;
//fait disparaitre le bouton modifier les données et ajoute le bouton sauvegarder les modifications
boutonModifDonnees.addEventListener("click", (e) => {
  e.preventDefault();
  modifEnCours = true;
  boutonModifDonnees.style.display = "none";
  if (document.querySelector("#saveModif") == null) {
    var elementInput_BtnSaveModifs = document.createElement("input");
    elementInput_BtnSaveModifs.type = "button";
    elementInput_BtnSaveModifs.value = "Sauvegarder les modifications";
    elementInput_BtnSaveModifs.setAttribute("id", "saveModif");
    document
      .querySelector("#formGestionModifs")
      .appendChild(elementInput_BtnSaveModifs);
  }
  if (document.querySelector("#cancelModif") == null) {
    var elementInput_BtnAnnuleModifs = document.createElement("input");
    elementInput_BtnAnnuleModifs.type = "button";
    elementInput_BtnAnnuleModifs.value = "Annuler";
    elementInput_BtnAnnuleModifs.setAttribute("id", "cancelModif");
    document
      .querySelector("#formGestionModifs")
      .appendChild(elementInput_BtnAnnuleModifs);
  }

  elementInput_BtnAnnuleModifs.addEventListener("click", (e) => {
    location.reload();
  });

  //active tous les éléments pour pouvoir les modifier
  disabledElements.forEach((element) => {
    element = document.querySelector(`#${element}`);
    element.removeAttribute("disabled");
    if (element.id.includes("Photo")) {
      arrImgSinElements.push(element);
    }
  });
  arrImgSinElements.forEach((element) => {
    element.addEventListener("click", (e) => {
      var getIDPhoFromDeleteBtn = e.target.id.substring(
        e.target.id.indexOf("s") + 1
      );
      var elImgToDelete = document.getElementById(
        `imgView${getIDPhoFromDeleteBtn}`
      );
      var elDeleteToDelete = document.getElementById(e.target.id);

      // Vérifie si l'élément HTML a été trouvé
      if (elImgToDelete !== null) {
        // Supprime l'élément HTML
        arrPhotosID.push(`imgView${getIDPhoFromDeleteBtn}`);
        elImgToDelete.remove();
        elDeleteToDelete.remove();
      }
    });
  });
  if (document.querySelector('#LinkFormulaire') != undefined) {

    document.querySelector('#BtnDeleteFormulaire').addEventListener("click", (e) => {
      document.querySelector('#LinkFormulaire').remove();
      document.querySelector('#BtnDeleteFormulaire').remove();
    })
  }
  document.querySelector("#saveModif").addEventListener("click", () => {
    var imgData;
    for (let i = 0; i < arrPhotosID.length; i++) {
      imgData = {
        sinistre_id: `${arrSinistreIDSelect}`,
        id_pho: `${arrPhotosID[i].substring(arrPhotosID[i].indexOf("w") + 1)}`,
      };
      fetch(
        `/api/modif-declaration/multiple-images/post/${arrSinistreIDSelect}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(imgData),
        }
      ).then((response) => {
        response
          .json()
          .then((message) => ({
            message: message,
            status: response.status,
          }))
          .then((response) => {});
      });
    }
    var formData;
    formData = {
      sinistre_id: `${arrSinistreIDSelect}`,
      id_form: formulaireID[0],
    };
    fetch(
      `/api/modif-declaration/single-formulaire/post/${formulaireID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    ).then((response) => {
      response
        .json()
        .then((message) => ({
          message: message,
          status: response.status,
        }))
        .then((response) => {});
    });
  
    var inputData;
    //enregistre la modification de la rue
    var rueElement = document.getElementById("DetailSinRue");
    var rueValue = rueElement.value;
    inputData = { id_sin: `${arrSinistreIDSelect}`, rue_sin: `${rueValue}` };
    fetch(`/api/modif-declaration/put/rue/${arrSinistreIDSelect}`, {
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
        .then((response) => {});
    });

    //enregistre la modification du code postal
    var CPElement = document.getElementById("DetailSinCP");
    var CPValue = CPElement.value;
    inputData = { id_sin: `${arrSinistreIDSelect}`, cp_sin: `${CPValue}` };
    fetch(`/api/modif-declaration/put/code-postal/${arrSinistreIDSelect}`, {
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
        .then((response) => {});
    });

    //enregistre la modification de la ville
    var villeElement = document.getElementById("DetailSinVille");
    var villeValue = villeElement.value;
    inputData = {
      id_sin: `${arrSinistreIDSelect}`,
      ville_sin: `${villeValue}`,
    };
    fetch(`/api/modif-declaration/put/ville/${arrSinistreIDSelect}`, {
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
        .then((response) => {});
    });

    //enregistre la màj du dommage corporel
    const selectDmgElement = document.getElementById("DmgCorp");
    const selectedDmgOption =
      selectDmgElement.options[selectDmgElement.selectedIndex];
    const selectedDmgValue = selectedDmgOption.value;
    inputData = {
      id_sin: `${arrSinistreIDSelect}`,
      dommage_corporel_sin: `${selectedDmgValue == "oui" ? true : false}`,
    };
    fetch(`/api/modif-declaration/put/dommage-corp/${arrSinistreIDSelect}`, {
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
        .then((response) => {});
    });

    //enregistre la modification de la responsabilité
    const selectRespElement = document.getElementById("Resp");
    const selectedRespOption =
      selectRespElement.options[selectRespElement.selectedIndex];
    const selectedRespValue = selectedRespOption.value;
    inputData = {
      id_sin: `${arrSinistreIDSelect}`,
      responsable_sin: `${selectedRespValue == "oui" ? true : false}`,
    };
    fetch(`/api/modif-declaration/put/responsabilite/${arrSinistreIDSelect}`, {
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
        .then((response) => {});
    });
    //enregistre la modification du commentaire
    const selectCommentaireElement = document.getElementById(
      "DetailSinCommentaire"
    );
    const selectedCommentaireValue = selectCommentaireElement.value;
    inputData = {
      id_sin: `${arrSinistreIDSelect}`,
      commentaire_sin: `${selectedCommentaireValue}`,
    };
    fetch(`/api/modif-declaration/put/commentaire/${arrSinistreIDSelect}`, {
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
        .then((response) => {});
    });
    alert("Vos modification ont bien été enregistrées");
    location.reload();
  });
});

boutonNouvellePhoto.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const bodyFormData = new FormData();
  bodyFormData.append("image_pho", file);
  fetch(`/api/declarations/single-image/${arrSinistreIDSelect}`, {
    method: "POST",
    body: bodyFormData,
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.error) {
        switch (response.error) {
          case "limite du nombre de photos dépassée (5)":
            alert("Vous ne pouvez pas ajouter plus de 5 photos");
            break;
          default:
            if (response.error.slice(-15) == "(limite : 2 mo)") {
              alert("Le fichier est trop volumineux (limite de 2mo)");
            } else {
              alert(response.error);
            }
        }
      } else if (response.success) {
        alert(response.success);
        boutonNouvellePhoto.form.reset();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

boutonNouveauFormulaire.addEventListener("change", (e) => {
  const fileForm = e.target.files[0];
  const bodyFormDataForm = new FormData();
  bodyFormDataForm.append("document_form", fileForm);
  fetch(`/api/declarations/single-formulaire/post/${arrSinistreIDSelect}`, {
    method: "POST",
    body: bodyFormDataForm,
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.error) {
        switch (response.error) {
          case "limite du nombre de formulaire dépassée (1)":
            alert("Vous ne pouvez pas ajouter plus de 1 formulaire");
            break;
          default:
            if (response.error.slice(-15) == "(limite : 2 mo)") {
              alert("Le fichier est trop volumineux (limite de 2mo)");
            } else {
              alert(response.error);
            }
        }
      } else if (response.success) {
        alert(response.success);
        boutonNouveauFormulaire.form.reset();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
