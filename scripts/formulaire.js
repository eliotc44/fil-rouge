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
