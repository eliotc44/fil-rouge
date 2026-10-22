import { connecter } from "./auth.js";
import { getAllFacteurs } from "./cache.js";
import { afficherLoader } from "./domUtil.js";
import { afficherFacteurs } from "./facteurCard.js";
import { afficherErreur, effacerErreur } from "./formulaire.js";

async function envoyerConnexion(evt, formulaire) {
    evt.preventDefault();
    effacerErreur(formulaire);

    const champs = formulaire.elements;
    const bouton = formulaire.querySelector("[type='submit']");
    bouton.disabled = true;
    try {
        await connecter(champs.email.value.trim(), champs.password.value, champs.remember.checked);
        window.location.replace("./index.html");
    } catch (erreur) {
        console.error("Erreur connexion :", erreur);
        afficherErreur(formulaire, "Adresse e-mail ou mot de passe incorrect.");
        bouton.disabled = false;
    }
}

export async function initConnexion() {
    const formulaire = document.getElementById("loginForm");
    formulaire.addEventListener("submit", (evt) => envoyerConnexion(evt, formulaire));

    const liste = document.getElementById("activeCouriers");
    afficherLoader(liste);
    try {
        const facteurs = await getAllFacteurs();
        afficherFacteurs(liste, facteurs.slice(0, 3));
    } catch (erreur) {
        console.error("Erreur chargement des facteurs :", erreur);
        liste.replaceChildren();
    }
}
