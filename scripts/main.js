import { getUtilisateur, exigerConnexion } from "./supabase.js";
import { getProfil } from "./fetchProfil.js";
import { afficherEntete } from "./entete.js";
import { afficherFooter } from "./footer.js";
import { initConnexion } from "./connexion.js";
import { initInscription } from "./inscription.js";
import { initLivreurs } from "./livreurs.js";

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

    afficherFooter();

    const utilisateur = pageConnectee ? await exigerConnexion() : await getUtilisateur();
    if (pageConnectee && !utilisateur) return;
    if (utilisateur && PAGES_PUBLIQUES_DECONNECTEES.includes(page)) {
        window.location.replace("./index.html");
        return;
    }

    afficherEntete(await getProfilConnecte(utilisateur), page);

    /* ---- PAGE CONNEXION ---- */
    if (page === "connexion.html") initConnexion();

    /* ---- PAGE INSCRIPTION ---- */
    if (page === "inscription.html") initInscription();

    /* ---- PAGE NOS LIVREURS ---- */
    if (page === "nos-livreurs.html") initLivreurs();
}

init();
