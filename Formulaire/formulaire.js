document.addEventListener('DOMContentLoaded', function() {
  const bandeauConnexion = sessionStorage.getItem('bandeauConnexion');
  if (bandeauConnexion) {
    console.log(bandeauConnexion);
    document.getElementById('IDconnexion').innerHTML = bandeauConnexion;
  }
});