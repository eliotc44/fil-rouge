import { getAllFacteurs } from "./cache.js";
import { afficherLoader, afficherMessageErreur } from "./domUtil.js";
import { afficherFacteurCards, afficherTableauFacteurs } from "./facteurCard.js";

export async function initLivreurs() {
    const liste = document.getElementById("courierList");
    const tableau = document.getElementById("courierTable");

    afficherLoader(liste);
    try {
        const facteurs = await getAllFacteurs();
        afficherFacteurCards(liste, facteurs);
        afficherTableauFacteurs(tableau, facteurs);
    } catch (erreur) {
        console.error("Erreur chargement des facteurs :", erreur);
        afficherMessageErreur(liste, "Les facteurs n’ont pas pu être chargés, recharge la page.");
    }
}
