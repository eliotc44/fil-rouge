import { createNode, IMAGE_PAR_DEFAUT, afficherMessageVide } from "./domUtil.js";
import { getAllFacteurs } from "./cache.js";
import { formaterCompteARebours, getDureeIso, formaterArrivee } from "./temps.js";

const PERSONNE = (avatarKey, nomKey) => ({
    tag: "figure",
    children: [
        { tag: "img", class: "avatar", attrs: { srcKey: avatarKey, alt: "", width: "60", height: "60" } },
        { tag: "figcaption", dataKey: nomKey }
    ]
});

/* Bob : pas d’heure d’arrivée, donc un <span> à la place du <time> */
function getSuiviTemplate(avecArrivee) {
    return {
        tag: "li",
        children: [
            {
                tag: "article",
                class: "tracking-card",
                children: [
                    {
                        tag: "div",
                        class: "tracking-route",
                        children: [
                            PERSONNE("expediteurAvatar", "expediteurNom"),
                            {
                                tag: "div",
                                class: "tracking-progress",
                                attrs: {
                                    role: "progressbar",
                                    "aria-label": "Progression de la livraison",
                                    "aria-valuemin": "0",
                                    "aria-valuemax": "100"
                                },
                                children: [
                                    { tag: "img", class: "avatar", attrs: { srcKey: "facteurAvatar", alt: "", width: "40", height: "40" } }
                                ]
                            },
                            avecArrivee
                                ? { tag: "time", dataKey: "compteARebours", attrs: { datetimeKey: "dureeIso" } }
                                : { tag: "span", dataKey: "compteARebours" },
                            PERSONNE("destinataireAvatar", "destinataireNom")
                        ]
                    },
                    { tag: "p", dataKey: "operePar" },
                    { tag: "p", class: "tracking-status", dataKey: "statut" },
                    { tag: "a", class: "btn btn-outline", text: "Détails", attrs: { hrefKey: "lien" } }
                ]
            }
        ]
    };
}

function getStatut(suivi, reste) {
    if (!suivi.arrivee_prevue_at) return `Arrivée prévue : quand ${suivi.facteur_nom} voudra`;
    if (reste < 60000) {
        const secondes = Math.max(1, Math.ceil(reste / 1000));
        return `Arrivée dans ${secondes} seconde${secondes > 1 ? "s" : ""} !`;
    }
    return `Arrivée prévue ${formaterArrivee(new Date(suivi.arrivee_prevue_at))}`;
}

export async function createSuiviCard(suivi) {
    const facteurs = await getAllFacteurs();
    const facteur = facteurs.find((f) => f.id === suivi.facteur_id);
    const avecArrivee = Boolean(suivi.arrivee_prevue_at);
    const reste = avecArrivee ? new Date(suivi.arrivee_prevue_at) - Date.now() : 0;

    const data = {
        expediteurNom: suivi.est_envoye_par_moi ? "Vous" : suivi.expediteur_nom || suivi.expediteur_pseudo,
        expediteurAvatar: suivi.expediteur_avatar || IMAGE_PAR_DEFAUT,
        destinataireNom: suivi.est_envoye_par_moi ? suivi.destinataire_nom || suivi.destinataire_pseudo : "Vous",
        destinataireAvatar: suivi.destinataire_avatar || IMAGE_PAR_DEFAUT,
        facteurAvatar: facteur?.avatar_url || IMAGE_PAR_DEFAUT,
        operePar: `Livraison opérée par ${suivi.facteur_nom}`,
        lien: `./messagerie.html?c=${suivi.conversation_id}`,
        compteARebours: avecArrivee ? formaterCompteARebours(reste) : "??:??:??",
        dureeIso: getDureeIso(reste),
        statut: getStatut(suivi, reste)
    };

    const dom = createNode(getSuiviTemplate(avecArrivee), data);
    dom.querySelector(".tracking-progress").style.setProperty("--courier-color", suivi.facteur_couleur);
    updateSuiviCard(dom, suivi);
    return dom;
}

/* Renvoie faux quand le message est arrivé */
export function updateSuiviCard(carte, suivi) {
    const barre = carte.querySelector(".tracking-progress");
    if (!suivi.arrivee_prevue_at) {
        barre.style.setProperty("--progress", 0.5);
        barre.removeAttribute("aria-valuenow");
        return true;
    }

    const maintenant = Date.now();
    const depart = new Date(suivi.envoye_at);
    const arrivee = new Date(suivi.arrivee_prevue_at);
    const reste = arrivee - maintenant;
    const progression = Math.min(1, Math.max(0, (maintenant - depart) / (arrivee - depart)));

    barre.style.setProperty("--progress", progression);
    barre.setAttribute("aria-valuenow", Math.round(progression * 100));

    const compte = carte.querySelector(".tracking-route time");
    compte.textContent = formaterCompteARebours(reste);
    compte.setAttribute("datetime", getDureeIso(reste));
    carte.querySelector(".tracking-status").textContent = getStatut(suivi, reste);
    return reste > 0;
}

/* Fabrique les cartes dans le conteneur et renvoie [{ carte, suivi }] pour animerSuivis */
export async function afficherSuivis(conteneur, suivis) {
    if (suivis.length === 0) {
        afficherMessageVide(conteneur, "Aucun message en route pour le moment.");
        return [];
    }
    const cartes = await Promise.all(suivis.map((suivi) => createSuiviCard(suivi)));
    conteneur.replaceChildren(...cartes);
    return suivis.map((suivi, i) => ({ carte: cartes[i], suivi: suivi }));
}

/*
 * Met les cartes à jour chaque seconde. quandArrive : un message est arrivé,
 * ou (toutes les 15 s) il y a un facteur à l’heure cachée : la page recharge la liste.
 */
export function animerSuivis(elements, quandArrive) {
    let secondes = 0;
    const minuteur = setInterval(() => {
        secondes++;
        for (let { carte, suivi } of elements) {
            if (!updateSuiviCard(carte, suivi)) {
                clearInterval(minuteur);
                setTimeout(quandArrive, 1500);
                return;
            }
        }
        if (secondes % 15 === 0 && elements.some(({ suivi }) => !suivi.arrivee_prevue_at)) {
            clearInterval(minuteur);
            quandArrive();
        }
    }, 1000);
    return minuteur;
}
