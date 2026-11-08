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

/* ---- Effets dans le texte livré d’une bulle ---- */

/* parties : [{ texte, balise, classe }] ; balise vide : texte simple. Un espace sépare les parties. */
function ajouterParties(conteneur, parties) {
    parties.forEach((partie, i) => {
        if (i > 0) conteneur.append(" ");
        if (!partie.balise) {
            conteneur.append(partie.texte);
            return;
        }
        conteneur.append(createNode({ tag: partie.balise, class: partie.classe, text: partie.texte }));
    });
}

/* Eric : retrouve ses mots dans le texte et les souligne */
function afficherMotsAjoutes(conteneur, texte, mots) {
    const jetons = texte.split(/\s+/);
    const restants = [...mots];
    const parties = [];
    let i = 0;
    while (i < jetons.length) {
        const rang = restants.findIndex((mot) => {
            const taille = mot.split(/\s+/).length;
            return jetons.slice(i, i + taille).join(" ") === mot;
        });
        if (rang === -1) {
            parties.push({ texte: jetons[i] });
            i++;
            continue;
        }
        const mot = restants.splice(rang, 1)[0];
        parties.push({ texte: mot, balise: "ins", classe: "added-word" });
        i += mot.split(/\s+/).length;
    }
    ajouterParties(conteneur, parties);
}

/* Lisa : les « ____ » deviennent des mots perdus */
function afficherMotsPerdus(conteneur, texte) {
    ajouterParties(conteneur, texte.split(" ").map((mot) =>
        mot === "____" ? { texte: mot, balise: "span", classe: "lost-word" } : { texte: mot }
    ));
}

/* Gwendoline : le texte, puis son « PS de … : anecdote » */
function afficherAnecdote(conteneur, texte, anecdote) {
    const coupure = anecdote ? texte.lastIndexOf("\n\nPS de ") : -1;
    if (coupure === -1) {
        conteneur.append(texte);
        return;
    }
    conteneur.append(texte.slice(0, coupure));
    conteneur.append(createNode({ tag: "span", class: "anecdote", text: texte.slice(coupure + 2) }));
}

/* Sur une bulle rouge (mes envois), le rouge et le bleu d’Emma ne se liraient pas */
const COULEURS_SUR_ROUGE = {
    "#B6302E": "var(--white)",
    "#3A2FFF": "var(--grey)"
};

/* Emma : une police et une couleur par caractère, tirées par la base */
function afficherStyles(conteneur, texte, styles, surRouge) {
    Array.from(texte).forEach((caractere, i) => {
        const span = createNode({ tag: "span", text: caractere });
        const style = styles[i];
        if (style) {
            const couleur = surRouge ? COULEURS_SUR_ROUGE[style.couleur.toUpperCase()] : null;
            span.style.setProperty("--char-font", `"${style.police}"`);
            span.style.setProperty("--char-color", couleur ?? style.couleur);
        }
        conteneur.append(span);
    });
}

export function afficherTexteLivre(conteneur, message) {
    const texte = message.texte_livre ?? "";
    const effets = message.effets ?? {};
    conteneur.replaceChildren();

    if (message.facteur_effet === "ajout_mots" && effets.mots_ajoutes) {
        afficherMotsAjoutes(conteneur, texte, effets.mots_ajoutes);
    } else if (message.facteur_effet === "suppression_mots") {
        afficherMotsPerdus(conteneur, texte);
    } else if (message.facteur_effet === "anecdote") {
        afficherAnecdote(conteneur, texte, effets.anecdote);
    } else if (message.facteur_effet === "police_aleatoire" && effets.styles) {
        afficherStyles(conteneur, texte, effets.styles, message.est_envoye_par_moi);
    } else {
        conteneur.append(texte);
    }
}

/* « 1 mot ajouté », « 3 mots perdus », « anecdote ajoutée », « photo ajoutée » */
export function getResumeEffet(message) {
    const effets = message.effets ?? {};
    if (message.facteur_effet === "ajout_mots" && effets.mots_ajoutes) {
        const nombre = effets.mots_ajoutes.length;
        return `${nombre} mot${nombre > 1 ? "s" : ""} ajouté${nombre > 1 ? "s" : ""}`;
    }
    if (message.facteur_effet === "suppression_mots") {
        const nombre = effets.mots_perdus ?? 0;
        return `${nombre} mot${nombre > 1 ? "s" : ""} perdu${nombre > 1 ? "s" : ""}`;
    }
    if (message.facteur_effet === "anecdote" && effets.anecdote) return "anecdote ajoutée";
    if (message.facteur_effet === "photo_par_dessus") return "photo ajoutée";
    if (message.facteur_effet === "police_aleatoire") return "style aléatoire";
    return "";
}
