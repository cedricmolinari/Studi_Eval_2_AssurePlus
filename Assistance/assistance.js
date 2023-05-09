//affiche l'utilisateur connecté dans le bandeau
document.addEventListener("DOMContentLoaded", function () {
  const bandeauConnexion = sessionStorage.getItem("bandeauConnexion");
  if (bandeauConnexion) {
    document.getElementById("IDconnexion").innerHTML = bandeauConnexion;
  }

  const listeGaragesDiv = document.getElementById("listeGarages");
  var listeGarages = [];

  // Fonction exemple trouverGarageLePlusProche
  const trouverGarageLePlusProche = async () => {
    // Demander à l'utilisateur d'entrer son adresse
    var adresseClient = userInput.value;

    // Vérifier si l'utilisateur a entré une adresse
    if (adresseClient !== null && adresseClient.trim() !== "") {
    } else {
      alert("Aucune adresse saisie.");
    }

    // Recherche des coordonnées géographiques de l'adresse du client
    var geocoder = new google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: adresseClient }, function (results, status) {
        if (status == "OK") {
          var lat = results[0].geometry.location.lat();
          var lng = results[0].geometry.location.lng();

          // Recherche des garages à proximité
          var service = new google.maps.places.PlacesService(
            document.createElement("div")
          );
          service.nearbySearch(
            {
              location: { lat: lat, lng: lng },
              radius: 20000, // rayon de recherche en mètres
              type: ["car_repair"], // type de point d'intérêt recherché
            },
            function (results, status) {
              for (let i = 0; i < results.length; i++) {
                if (status == "OK") {
                  // Récupération du garage le plus proche
                  var garageLePlusProche = results[i];
                  var motRecherche = "garage";
                  var motRechercheAlter = "auto";
                  if (
                    garageLePlusProche.name
                      .toLowerCase()
                      .includes(motRecherche.toLowerCase()) ||
                    garageLePlusProche.name
                      .toLowerCase()
                      .includes(motRechercheAlter.toLowerCase())
                  ) {
                    listeGarages.push(
                      `${garageLePlusProche.name} : ${garageLePlusProche.vicinity}`
                    );
                  }
                } else {
                  alert(
                    "Une erreur s'est produite lors de la recherche des garages : " +
                      status
                  );
                }
              }
              resolve(listeGarages);
            }
          );
        } else {
          alert(
            "Une erreur s'est produite lors de la géolocalisation : " + status
          );
        }
      });
    });
  };

  const afficherGarages = async (event) => {
    event.preventDefault();
    listeGarages = [];
    listeGarages = await trouverGarageLePlusProche();
    listeGaragesDiv.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = "Voici la liste des garages";
    listeGaragesDiv.appendChild(title);

    listeGarages.forEach((element, index) => {
      const splitElement = element.split(":");
      const elementP = document.createElement("p");

      const boldText = document.createElement("strong");
      boldText.textContent = `${splitElement[0].trim()} : `;
      elementP.appendChild(boldText);

      const italicText = document.createElement("em");
      italicText.textContent = splitElement[1].trim();
      elementP.appendChild(italicText);

      listeGaragesDiv.appendChild(elementP);

      const phoneNumber = generateRandomPhoneNumber();
      const phoneNumberP = document.createElement("p");
      phoneNumberP.textContent = phoneNumber;
      listeGaragesDiv.appendChild(phoneNumberP);
    });
  };

  const generateRandomPhoneNumber = () => {
    let phoneNumber = "+3387";
    for (let i = 0; i < 6; i++) {
      phoneNumber += Math.floor(Math.random() * 10);
    }
    return phoneNumber;
  };

  document.querySelector("#form").addEventListener("submit", afficherGarages);
});
