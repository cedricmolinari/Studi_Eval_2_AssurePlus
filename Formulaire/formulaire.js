document.addEventListener('DOMContentLoaded', function() {
  const bandeauConnexion = sessionStorage.getItem('bandeauConnexion');
  if (bandeauConnexion) {
    document.getElementById('IDconnexion').innerHTML = bandeauConnexion;
  }
});