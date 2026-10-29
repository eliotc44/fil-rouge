import { inscrire, pseudoDisponible } from "./auth.js";
import { getAllFacteurs } from "./cache.js";
import { afficherLoader } from "./domUtil.js";
import { afficherFacteurs } from "./facteurCard.js";
import {
    afficherErreur, effacerErreur, afficherErreurChamp, effacerErreurChamp,
    normaliserPseudo, pseudoEstValide
} from "./formulaire.js";

async function verifierPseudo(champ) {
    effacerErreurChamp(champ);
    if (champ.value === "") return true;

    if (!pseudoEstValide(champ.value)) {
        afficherErreurChamp(champ, "3 à 30 caractères : lettres minuscules, chiffres, point ou tiret bas.");
        return false;
    }
    try {
        if (await pseudoDisponible(champ.value)) return true;
        afficherErreurChamp(champ, "Ce pseudo est déjà pris.");
        return false;
    } catch (erreur) {
        console.error("Erreur vérification du pseudo :", erreur);
        return true;
    }
}

function getMessageErreur(erreur) {
    const message = (erreur.message ?? "").toLowerCase();
    if (message.includes("already registered")) return "Cette adresse e-mail est déjà utilisée.";
    if (message.includes("database error")) return "Ce pseudo n’est pas valide ou est déjà pris.";
    return "L’inscription n’a pas abouti, réessaie.";
}

async function envoyerInscription(evt, formulaire) {
    evt.preventDefault();
    effacerErreur(formulaire);

    const champs = formulaire.elements;
    champs.pseudo.value = normaliserPseudo(champs.pseudo.value);
    if (!(await verifierPseudo(champs.pseudo))) return;

    const motDePasse = champs.password.value;
    if (!/\d/.test(motDePasse)) {
        afficherErreur(formulaire, "Le mot de passe doit contenir au moins un chiffre.");
        return;
    }
    if (motDePasse !== champs.passwordConfirm.value) {
        afficherErreur(formulaire, "Les mots de passe ne correspondent pas.");
        return;
    }
    if (!champs.facteur?.value) {
        afficherErreur(formulaire, "Choisis un facteur par défaut.");
        return;
    }

    const bouton = formulaire.querySelector("[type='submit']");
    bouton.disabled = true;
    try {
        const resultat = await inscrire(
            champs.email.value.trim(), motDePasse, champs.pseudo.value, Number(champs.facteur.value)
        );
        if (resultat.session) {
            window.location.replace("./index.html");
            return;
        }
        afficherErreur(formulaire, "Compte créé : confirme ton adresse e-mail, puis connecte-toi.");
    } catch (erreur) {
        console.error("Erreur inscription :", erreur);
        afficherErreur(formulaire, getMessageErreur(erreur));
    }
    bouton.disabled = false;
}

export async function initInscription() {
    const formulaire = document.getElementById("signupForm");
    const pseudo = formulaire.elements.pseudo;

    pseudo.addEventListener("blur", () => {
        pseudo.value = normaliserPseudo(pseudo.value);
        verifierPseudo(pseudo);
    });
    formulaire.addEventListener("submit", (evt) => envoyerInscription(evt, formulaire));

    const choix = document.getElementById("signupCouriers");
    afficherLoader(choix);
    try {
        afficherFacteurs(choix, await getAllFacteurs(), true);
    } catch (erreur) {
        console.error("Erreur chargement des facteurs :", erreur);
        choix.replaceChildren();
        afficherErreur(formulaire, "Les facteurs n’ont pas pu être chargés, recharge la page.");
    }
}
