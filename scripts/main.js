import { getUtilisateur, exigerConnexion } from "./supabase.js";
import { getProfil } from "./fetchProfil.js";
import { initEntete, initMenu } from "./entete.js";
import { initConnexion } from "./connexion.js";
import { initInscription } from "./inscription.js";

const PAGES_CONNECTEES = ["index.html", "suivi.html", "messagerie.html", "profil.html", "reglages.html"];
const PAGES_PUBLIQUES_DECONNECTEES = ["connexion.html", "inscription.html"];

async function getProfilConnecte(utilisateur) {
    if (!utilisateur) return null;
    try {
        return await getProfil(utilisateur.id);
    } catch (erreur) {
        console.error("Erreur chargement du profil :", erreur);
        return null;
    }
}

async function init() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    const pageConnectee = PAGES_CONNECTEES.includes(page);

    initMenu();

    const utilisateur = pageConnectee ? await exigerConnexion() : await getUtilisateur();
    if (pageConnectee && !utilisateur) return;
    if (utilisateur && PAGES_PUBLIQUES_DECONNECTEES.includes(page)) {
        window.location.replace("./index.html");
        return;
    }

    initEntete(await getProfilConnecte(utilisateur));

    /* ---- PAGE CONNEXION ---- */
    if (page === "connexion.html") initConnexion();

    /* ---- PAGE INSCRIPTION ---- */
    if (page === "inscription.html") initInscription();
}

init();
