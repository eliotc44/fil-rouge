import { createNode } from "./domUtil.js";

const AVATAR = {
    tag: "img",
    class: "avatar",
    attrs: { srcKey: "avatar_url", alt: "", width: "34", height: "34" }
};
const NOM = { tag: "span", dataKey: "nom" };
const DELAI = { tag: "small", dataKey: "delai_affiche" };

/* choix faux : <li> d’une liste ; choix vrai : <label> avec bouton radio */
export function createFacteurChip(facteur, choix = false) {
    if (!choix) {
        return createNode({
            tag: "li",
            class: "courier-chip",
            vars: { "--courier-color": "couleur" },
            children: [AVATAR, NOM, DELAI]
        }, facteur);
    }
    return createNode({
        tag: "label",
        class: "courier-chip",
        vars: { "--courier-color": "couleur" },
        children: [
            {
                tag: "input",
                class: "visually-hidden",
                attrs: { type: "radio", name: "facteur", valueKey: "id" }
            },
            AVATAR, NOM, DELAI
        ]
    }, facteur);
}

export function afficherFacteurs(conteneur, facteurs, choix = false, slugCoche = "eric") {
    conteneur.replaceChildren();
    for (let facteur of facteurs) {
        const chip = createFacteurChip(facteur, choix);
        if (choix && facteur.slug === slugCoche) chip.querySelector("input").checked = true;
        conteneur.append(chip);
    }
}
