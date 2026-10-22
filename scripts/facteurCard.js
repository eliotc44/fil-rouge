import { createNode, IMAGE_PAR_DEFAUT } from "./domUtil.js";
import { appliquerPoliceAleatoire } from "./effets.js";

const AVATAR = { tag: "img", class: "avatar", attrs: { srcKey: "avatarSrc", alt: "", width: "34", height: "34" } };
const NOM = { tag: "span", dataKey: "nom" };
const DELAI = { tag: "small", dataKey: "delai_affiche" };

const chipTemplate = {
    tag: "li",
    class: "courier-chip",
    children: [AVATAR, NOM, DELAI]
};

const chipChoixTemplate = {
    tag: "label",
    class: "courier-chip",
    children: [
        { tag: "input", class: "visually-hidden", attrs: { type: "radio", name: "facteur", valueKey: "id" } },
        AVATAR, NOM, DELAI
    ]
};

const carteTemplate = {
    tag: "li",
    children: [
        {
            tag: "article",
            class: "courier-card",
            children: [
                { tag: "img", class: "avatar", attrs: { srcKey: "avatarSrc", alt: "", width: "72", height: "72" } },
                { tag: "h3", dataKey: "titre" },
                { tag: "p", dataKey: "description" },
                { tag: "p", class: "delay-badge", dataKey: "delai_affiche" }
            ]
        }
    ]
};

const ligneTemplate = {
    tag: "tr",
    children: [
        {
            tag: "th",
            attrs: { scope: "row" },
            children: [
                { tag: "img", class: "avatar", attrs: { srcKey: "avatarSrc", alt: "", width: "36", height: "36" } },
                { tag: "span", dataKey: "nom" }
            ]
        },
        { tag: "td", dataKey: "delai_affiche" },
        { tag: "td", dataKey: "libelleEffet" }
    ]
};

const LIBELLES_EFFET = {
    ajout_mots: "Ajoute des mots au hasard dans votre message",
    suppression_mots: "Perd des mots en chemin",
    anecdote: "Ajoute ses anecdotes dans le message",
    photo_par_dessus: "Colle sa photo par-dessus la vôtre",
    police_aleatoire: "Police et couleur aléatoires pour chaque caractère"
};

function getLibelleEffet(facteur) {
    if (facteur.effet === "aucun") {
        return facteur.delai_cache ? "Livraison nickel (quand il arrive)" : "Livraison nickel";
    }
    return LIBELLES_EFFET[facteur.effet] ?? "";
}

function getDonnees(facteur) {
    return { ...facteur, avatarSrc: facteur.avatar_url || IMAGE_PAR_DEFAUT };
}

/* choix faux : <li> d’une liste ; choix vrai : <label> avec bouton radio */
export function createFacteurChip(facteur, choix = false) {
    const dom = createNode(choix ? chipChoixTemplate : chipTemplate, getDonnees(facteur));
    dom.style.setProperty("--courier-color", facteur.couleur);
    return dom;
}

export function createFacteurCard(facteur) {
    const data = { ...getDonnees(facteur), titre: `${facteur.nom} | ${facteur.surnom}` };
    const dom = createNode(carteTemplate, data);
    dom.querySelector(".courier-card").style.setProperty("--courier-color", facteur.couleur);
    return dom;
}

function createLigneFacteur(facteur) {
    const libelle = getLibelleEffet(facteur);
    const dom = createNode(ligneTemplate, { ...getDonnees(facteur), libelleEffet: libelle });
    dom.style.setProperty("--courier-color", facteur.couleur);
    if (facteur.effet === "police_aleatoire") appliquerPoliceAleatoire(dom.lastElementChild, libelle);
    return dom;
}

export function createTableauFacteurs(facteurs) {
    const lignes = document.createDocumentFragment();
    for (let facteur of facteurs) lignes.append(createLigneFacteur(facteur));
    return lignes;
}

export function afficherFacteurs(conteneur, facteurs, choix = false, slugCoche = "eric") {
    conteneur.replaceChildren();
    for (let facteur of facteurs) {
        const chip = createFacteurChip(facteur, choix);
        if (choix && facteur.slug === slugCoche) chip.querySelector("input").checked = true;
        conteneur.append(chip);
    }
}

export function afficherFacteurCards(conteneur, facteurs) {
    conteneur.replaceChildren();
    for (let facteur of facteurs) conteneur.append(createFacteurCard(facteur));
}

export function afficherTableauFacteurs(conteneur, facteurs) {
    conteneur.replaceChildren(createTableauFacteurs(facteurs));
}
