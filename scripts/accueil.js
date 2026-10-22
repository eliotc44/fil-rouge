import { getAllFacteurs } from "./cache.js";
import { afficherLoader, afficherMessageErreur } from "./domUtil.js";
import { afficherBandeauCourrier } from "./entete.js";
import { afficherFacteurs, afficherFacteurCards } from "./facteurCard.js";
import { getSuivis, getConversationNonLue } from "./fetchMessages.js";
import { afficherSuivis, animerSuivis } from "./suiviCard.js";

let minuteurSuivis = null;

async function chargerFacteurs() {
    const enService = document.getElementById("activeCouriers");
    const cartes = document.getElementById("courierList");
    afficherLoader(enService);
    afficherLoader(cartes);
    try {
        const facteurs = (await getAllFacteurs()).slice(0, 3);
        afficherFacteurs(enService, facteurs);
        afficherFacteurCards(cartes, facteurs);
    } catch (erreur) {
        console.error("Erreur chargement des facteurs :", erreur);
        enService.replaceChildren();
        afficherMessageErreur(cartes, "Les facteurs n’ont pas pu être chargés, recharge la page.");
    }
}

async function chargerSuivis() {
    clearInterval(minuteurSuivis);
    const liste = document.getElementById("trackingList");
    try {
        const suivis = await getSuivis(3);
        const elements = await afficherSuivis(liste, suivis);
        minuteurSuivis = animerSuivis(elements, chargerSuivis);
    } catch (erreur) {
        console.error("Erreur chargement des suivis :", erreur);
        afficherMessageErreur(liste, "Les suivis n’ont pas pu être chargés, recharge la page.");
    }
}

async function chargerBandeau() {
    try {
        const conversation = await getConversationNonLue();
        if (conversation) afficherBandeauCourrier(conversation);
    } catch (erreur) {
        console.error("Erreur chargement du bandeau :", erreur);
    }
}

export async function initAccueil(profil) {
    const nom = profil?.nom_affiche || profil?.pseudo;
    document.querySelector(".hero h1").textContent = nom
        ? `Heureux de vous revoir, ${nom}`
        : "Heureux de vous revoir";

    afficherLoader(document.getElementById("trackingList"));
    await Promise.all([chargerFacteurs(), chargerSuivis(), chargerBandeau()]);
}
