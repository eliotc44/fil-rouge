import { createNode, IMAGE_PAR_DEFAUT } from "./domUtil.js";

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

/* choix faux : <li> d’une liste ; choix vrai : <label> avec bouton radio */
export function createFacteurChip(facteur, choix = false) {
    const data = { ...facteur, avatarSrc: facteur.avatar_url || IMAGE_PAR_DEFAUT };
    const dom = createNode(choix ? chipChoixTemplate : chipTemplate, data);
    dom.style.setProperty("--courier-color", facteur.couleur);
    return dom;
}

export function afficherFacteurs(conteneur, facteurs, choix = false, slugCoche = "eric") {
    conteneur.replaceChildren();
    for (let facteur of facteurs) {
        const chip = createFacteurChip(facteur, choix);
        if (choix && facteur.slug === slugCoche) chip.querySelector("input").checked = true;
        conteneur.append(chip);
    }
}
