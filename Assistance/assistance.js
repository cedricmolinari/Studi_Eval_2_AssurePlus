document.addEventListener('DOMContentLoaded', function() {
  const bandeauConnexion = sessionStorage.getItem('bandeauConnexion');
  if (bandeauConnexion) {
    document.getElementById('IDconnexion').innerHTML = bandeauConnexion;
  }
});

/* // trouverGarage.js
function obtenirCoordonnees(adresse, callback) {
  var url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(adresse);

  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.length > 0) {
        var lat = parseFloat(data[0].lat);
        var lng = parseFloat(data[0].lon);
        callback(null, { lat: lat, lng: lng });
      } else {
        callback('Adresse non trouvée', null);
      }
    })
    .catch(function(error) {
      callback('Erreur de l\'API Nominatim', null);
    });
}

function trouverGaragesProches(coordonnees, callback) {
  var bbox = (coordonnees.lng - 5) + ',' + (coordonnees.lat - 5) + ',' + (coordonnees.lng + 5) + ',' + (coordonnees.lat + 5);
  var query = '[out:json][timeout:25];(node["amenity"="bakery"](' + bbox + '););out body;';
  console.log(query);
  fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query)
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      var garages = data.elements.map(function(element) {
        return {
          lat: element.lat,
          lng: element.lon,
          name: element.tags.name || 'Garage sans nom'
        };
      });
      callback(null, garages);
    })
    .catch(function(error) {
      callback('Erreur de l\'API Overpass', null);
    });
}

function trouverGarageLePlusProche() {
  var adresseClient = '20 boulevard Hôpital 75005 Paris';

  obtenirCoordonnees(adresseClient, function(erreurGeolocalisation, coordonnees) {
    console.log(coordonnees);
    if (erreurGeolocalisation) {
      console.log('Erreur de géolocalisation :', erreurGeolocalisation);
      return;
    }

    trouverGaragesProches(coordonnees, function(erreurRecherche, garages) {
      console.log(coordonnees);
      console.log(garages);
      if (erreurRecherche) {
        console.log('Erreur lors de la recherche des garages :', erreurRecherche);
        return;
      }

      if (garages.length > 0) {
        console.log('Garage le plus proche :', garages[0]);
      } else {
        console.log('Aucun garage trouvé à proximité');
      }
    });
  });
} */

/* nouveau code */
// trouverGarage.js
function obtenirCoordonnees(adresse, callback) {
  var url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(adresse);

  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.length > 0) {
        var lat = parseFloat(data[0].lat);
        var lng = parseFloat(data[0].lon);
        callback(null, { lat: lat, lng: lng });
      } else {
        callback('Adresse non trouvée', null);
      }
    })
    .catch(function(error) {
      callback('Erreur de l\'API Nominatim', null);
    });
}

function trouverGaragesProches(coordonnees, callback) {
  var bbox = (coordonnees.lng - 1) + ',' + (coordonnees.lat - 1) + ',' + (coordonnees.lng + 1) + ',' + (coordonnees.lat + 1);
  var query = '[out:json][timeout:25];(node["shop"="car_repair"](' + bbox + '););out body;';
  //console.log(bbox);
  fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query)
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      var garages = data.elements.map(function(element) {
        return {
          element,
          lat: element.lat,
          lng: element.lon,
          name: element.tags.name || 'Garage sans nom'
        };
      });
      callback(null, garages);
    })
    .catch(function(error) {
      callback('Erreur de l\'API Overpass', null);
    });
}

function distance(lat1, lon1, lat2, lon2) {
  var R = 6371; // Rayon de la Terre en km
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function trouverGarageLePlusProche() {
  var adresseClient = '101 voie Liberté 57160 Scy Chazelles';
  //var adresseClient = '10 rue de la Paix, Paris';

  obtenirCoordonnees(adresseClient, function(erreurGeolocalisation, coordonnees) {
    //console.log(coordonnees);
    if (erreurGeolocalisation) {
      console.log('Erreur de géolocalisation :', erreurGeolocalisation);
      return;
    }

    trouverGaragesProches(coordonnees, function(erreurRecherche, garages) {
      console.log(garages);
      if (erreurRecherche) {
        console.log('Erreur lors de la recherche des garages :', erreurRecherche);
        return;
      }

      if (garages.length > 0) {
        garages.sort(function(a, b) {
          var distanceA = distance(coordonnees.lat, coordonnees.lng, a.lat, a.lng);
          var distanceB = distance(coordonnees.lat, coordonnees.lng, b.lat, b.lng);
          return distanceA - distanceB;
        });

        console.log('Garage le plus proche :', garages[0]);
      } else {
        console.log('Aucun garage trouvé à proximité');
      }
    });
  });
}

trouverGarageLePlusProche();


