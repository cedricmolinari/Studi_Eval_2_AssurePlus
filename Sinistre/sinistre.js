var IDconnexion = document.querySelector('.navbar-brand');

function getQueryParam(paramName) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(paramName);
  }

const num_clt = getQueryParam('num_clt');


document.addEventListener('DOMContentLoaded', function() {
    const bandeauConnexion = sessionStorage.getItem('bandeauConnexion');
    if (bandeauConnexion) {
      document.getElementById('IDconnexion').innerHTML = bandeauConnexion;
    }
  });