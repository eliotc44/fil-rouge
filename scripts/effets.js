import { createNode } from "./domUtil.js";

const POLICES = ["var(--font-title)", "var(--font-text)"];
const COULEURS = ["var(--red)", "var(--blue)", "var(--black1)"];

function tirer(liste) {
    return liste[Math.floor(Math.random() * liste.length)];
}

/* Emma : chaque caractère reçoit une police et une couleur au hasard */
export function appliquerPoliceAleatoire(conteneur, texte) {
    conteneur.replaceChildren();
    for (let caractere of texte) {
        const span = createNode({ tag: "span", text: caractere });
        span.style.setProperty("--char-font", tirer(POLICES));
        span.style.setProperty("--char-color", tirer(COULEURS));
        conteneur.append(span);
    }
}
