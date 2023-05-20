let submitConnectForm = document.querySelector(".connectionForm");
let btnConnexion = document.getElementById("btnConnexion");
let inputTxtNumClt = document.querySelector(".numClt");
let inputPwClt = document.querySelector(".pwClt");

let connexion = false;

// retourne la valeur d'un champ input'
function getVal(input) {
  const val = input.value;
  return val;
}

window.addEventListener("load", () => {
  const stockageClientID = sessionStorage.getItem("clientID");
  clientID.push(stockageClientID);
});

submitConnectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(submitConnectForm);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch("/api/clients/num/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const message = await response.json();

    if (message.result && message.result.mdp_clt) {
      const num_clt = message.result.num_clt;
      const response2 = await fetch(`/api/numero-clt/clients/${num_clt}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const message2 = await response2.json();

      if (message2[0]) {
        const newClientID = message2[0].id_clt;
        const newBandeauConnexion = `Bonjour, ${message2[0].nom_clt} ${message2[0].prenom_clt}`;
        sessionStorage.setItem("clientID", newClientID);
        sessionStorage.setItem("bandeauConnexion", newBandeauConnexion);

        submitConnectForm.submit();
      }
    }

  } catch (error) {
    console.error("Error:", error);
  }
});

