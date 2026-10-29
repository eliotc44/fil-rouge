import { afficherLoader, afficherMessageErreur } from "./domUtil.js";
import { getSuivis } from "./fetchMessages.js";
import { afficherSuivis, animerSuivis } from "./suiviCard.js";

const LIBELLES_FILTRES = { tous: "Tous", envoyes: "Envoyés", recus: "Reçus" };

let suivis = [];
let filtre = "tous";
let minuteur = null;

function getSuivisFiltres() {
    if (filtre === "envoyes") return suivis.filter((suivi) => suivi.est_envoye_par_moi);
    if (filtre === "recus") return suivis.filter((suivi) => !suivi.est_envoye_par_moi);
    return suivis;
}

function afficherCompteurs() {
    const nombres = {
        tous: suivis.length,
        envoyes: suivis.filter((suivi) => suivi.est_envoye_par_moi).length,
        recus: suivis.filter((suivi) => !suivi.est_envoye_par_moi).length
    };
    for (let bouton of document.querySelectorAll(".filters button")) {
        bouton.textContent = `${LIBELLES_FILTRES[bouton.value]} (${nombres[bouton.value]})`;
    }

    const total = nombres.tous;
    document.getElementById("trackingCount").textContent =
        total === 0 ? "Aucun message n’est actuellement entre les mains de nos facteurs"
        : total === 1 ? "1 message est actuellement entre les mains de nos facteurs"
        : `${total} messages sont actuellement entre les mains de nos facteurs`;
}

async function afficherListe() {
    clearInterval(minuteur);
    const liste = document.getElementById("trackingList");
    afficherCompteurs();
    const elements = await afficherSuivis(liste, getSuivisFiltres());
    minuteur = animerSuivis(elements, recharger);
}

async function recharger() {
    try {
        suivis = await getSuivis();
        await afficherListe();
    } catch (erreur) {
        console.error("Erreur chargement des suivis :", erreur);
        afficherMessageErreur(document.getElementById("trackingList"), "Les suivis n’ont pas pu être chargés, recharge la page.");
    }
}

export async function initSuivi() {
    for (let bouton of document.querySelectorAll(".filters button")) {
        bouton.addEventListener("click", () => {
            filtre = bouton.value;
            for (let autre of document.querySelectorAll(".filters button")) {
                autre.setAttribute("aria-pressed", String(autre === bouton));
            }
            afficherListe();
        });
    }
    afficherLoader(document.getElementById("trackingList"));
    await recharger();
}
