import { createNode } from "./domUtil.js";

const MOTIF_PSEUDO = /^[a-z0-9._]{3,30}$/;

export function normaliserPseudo(valeur) {
    return valeur.trim().toLowerCase();
}

export function pseudoEstValide(pseudo) {
    return MOTIF_PSEUDO.test(pseudo);
}

/* Erreur du formulaire : le .field-error enfant direct du form */
export function afficherErreur(formulaire, message) {
    const zone = formulaire.querySelector(":scope > .field-error");
    zone.textContent = message;
    zone.hidden = false;
}

export function effacerErreur(formulaire) {
    const zone = formulaire.querySelector(":scope > .field-error");
    zone.textContent = "";
    zone.hidden = true;
}

/* Erreur d’un champ : le .field-error du même .field */
export function afficherErreurChamp(champ, message) {
    const zone = champ.closest(".field").querySelector(".field-error");
    zone.textContent = message;
    zone.hidden = false;
    champ.setAttribute("aria-invalid", "true");
}

export function effacerErreurChamp(champ) {
    const zone = champ.closest(".field").querySelector(".field-error");
    zone.textContent = "";
    zone.hidden = true;
    champ.removeAttribute("aria-invalid");
}

export const MESSAGE_PSEUDO_INVALIDE = "3 à 30 caractères : lettres minuscules, chiffres, point ou tiret bas.";

/* Confirmation du formulaire : le [role="status"] enfant direct du form */
export function afficherSucces(formulaire, message) {
    const zone = formulaire.querySelector(":scope > [role='status']");
    zone.textContent = message;
    zone.hidden = false;
}

export function effacerSucces(formulaire) {
    const zone = formulaire.querySelector(":scope > [role='status']");
    zone.textContent = "";
    zone.hidden = true;
}

/* Erreur juste après un élément (liste d’interrupteurs, bouton) */
export function signalerErreur(element, message) {
    let zone = element.nextElementSibling;
    if (!zone?.classList.contains("field-error")) {
        zone = createNode({ tag: "p", class: "field-error", attrs: { role: "alert" } });
        element.after(zone);
    }
    zone.textContent = message;
}

export function effacerSignal(element) {
    const zone = element.nextElementSibling;
    if (zone?.classList.contains("field-error")) zone.remove();
}

/* enregistrer(nom, valeur) : si l’enregistrement échoue, l’interrupteur revient en arrière */
export function initToggles(conteneur, enregistrer) {
    for (let interrupteur of conteneur.querySelectorAll("input[type='checkbox']")) {
        interrupteur.addEventListener("change", async () => {
            const liste = interrupteur.closest("ul");
            effacerSignal(liste);
            try {
                await enregistrer(interrupteur.name, interrupteur.checked);
            } catch (erreur) {
                console.error("Erreur enregistrement du réglage :", erreur);
                interrupteur.checked = !interrupteur.checked;
                signalerErreur(liste, "Le réglage n’a pas pu être enregistré, réessayez.");
            }
        });
    }
}
