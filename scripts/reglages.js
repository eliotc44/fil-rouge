import { deconnecter, modifierEmail, modifierMotDePasse, pseudoDisponible } from "./auth.js";
import { getAllFacteurs } from "./cache.js";
import { afficherFacteurs } from "./facteurCard.js";
import { getProfil, getReglages, modifierProfil, modifierReglages, supprimerCompte } from "./fetchProfil.js";
import {
    afficherErreur, effacerErreur, afficherSucces, effacerSucces, signalerErreur, effacerSignal, initToggles,
    normaliserPseudo, pseudoEstValide, MESSAGE_PSEUDO_INVALIDE
} from "./formulaire.js";

/* ---------------------------------------------------------
   Déconnexion, suppression du compte, navigation
--------------------------------------------------------- */

function initDeconnexion() {
    const bouton = document.getElementById("logoutButton");
    bouton.addEventListener("click", async () => {
        effacerSignal(bouton);
        try {
            await deconnecter();
            window.location.replace("./connexion.html");
        } catch (erreur) {
            console.error("Erreur déconnexion :", erreur);
            signalerErreur(bouton, "La déconnexion n’a pas abouti, réessayez.");
        }
    });
}

function initSuppression() {
    const bouton = document.getElementById("deleteButton");
    bouton.addEventListener("click", async () => {
        effacerSignal(bouton);
        if (!window.confirm("Supprimer définitivement votre compte et tous vos messages ?")) return;
        try {
            await supprimerCompte();
            await deconnecter().catch((erreur) => console.error("Erreur déconnexion :", erreur));
            window.location.replace("./inscription.html");
        } catch (erreur) {
            console.error("Erreur suppression du compte :", erreur);
            signalerErreur(bouton, "Le compte n’a pas pu être supprimé, réessayez.");
        }
    });
}

function initNavigation() {
    const liens = document.querySelectorAll(".settings-nav a");
    for (let lien of liens) {
        lien.addEventListener("click", () => {
            for (let autre of liens) autre.removeAttribute("aria-current");
            lien.setAttribute("aria-current", "true");
        });
    }
}

/* ---------------------------------------------------------
   Compte : pseudo, e-mail, mot de passe
--------------------------------------------------------- */

function getMessageErreurCompte(erreur) {
    const message = (erreur.message ?? "").toLowerCase();
    if (message.includes("duplicate") || message.includes("unique")) return "Ce pseudo est déjà pris.";
    if (message.includes("different from the old")) return "Le nouveau mot de passe doit être différent de l’ancien.";
    if (message.includes("already") && message.includes("email")) return "Cette adresse e-mail est déjà utilisée.";
    return "Les modifications n’ont pas pu être enregistrées, réessayez.";
}

async function enregistrerCompte(evt, formulaire, moi) {
    evt.preventDefault();
    effacerErreur(formulaire);
    effacerSucces(formulaire);

    const champs = formulaire.elements;
    const pseudo = normaliserPseudo(champs.pseudo.value);
    const email = champs.email.value.trim();
    const motDePasse = champs.password.value;
    champs.pseudo.value = pseudo;

    if (!pseudoEstValide(pseudo)) {
        afficherErreur(formulaire, MESSAGE_PSEUDO_INVALIDE);
        return;
    }
    if (motDePasse && (motDePasse.length < 8 || !/\d/.test(motDePasse))) {
        afficherErreur(formulaire, "Le mot de passe doit contenir 8 caractères minimum, dont un chiffre.");
        return;
    }
    if (motDePasse !== champs.passwordConfirm.value) {
        afficherErreur(formulaire, "Les mots de passe ne correspondent pas.");
        return;
    }

    const bouton = formulaire.querySelector("[type='submit']");
    bouton.disabled = true;
    try {
        if (pseudo !== moi.profil.pseudo) {
            if (!(await pseudoDisponible(pseudo))) {
                afficherErreur(formulaire, "Ce pseudo est déjà pris.");
                return;
            }
            const champsProfil = { pseudo: pseudo };
            if (moi.profil.nom_affiche === moi.profil.pseudo) champsProfil.nom_affiche = pseudo;
            await modifierProfil(moi.utilisateur.id, champsProfil);
            Object.assign(moi.profil, champsProfil);
        }

        let message = "Modifications enregistrées.";
        if (email !== moi.utilisateur.email) {
            const resultat = await modifierEmail(email);
            if (resultat.user?.new_email) {
                message = "Modifications enregistrées. Confirmez le changement d’adresse avec le lien reçu par e-mail.";
            } else {
                moi.utilisateur.email = email;
            }
        }
        if (motDePasse) {
            await modifierMotDePasse(motDePasse);
            champs.password.value = "";
            champs.passwordConfirm.value = "";
        }
        afficherSucces(formulaire, message);
    } catch (erreur) {
        console.error("Erreur enregistrement du compte :", erreur);
        afficherErreur(formulaire, getMessageErreurCompte(erreur));
    } finally {
        bouton.disabled = false;
    }
}

function initCompte(moi) {
    const formulaire = document.getElementById("accountForm");
    formulaire.elements.pseudo.value = moi.profil.pseudo;
    formulaire.elements.email.value = moi.utilisateur.email;
    formulaire.addEventListener("submit", (evt) => enregistrerCompte(evt, formulaire, moi));
}

/* ---------------------------------------------------------
   Notifications, confidentialité, facteur par défaut
--------------------------------------------------------- */

function initInterrupteurs(section, valeurs, enregistrer) {
    for (let interrupteur of section.querySelectorAll("input[type='checkbox']")) {
        interrupteur.checked = Boolean(valeurs[interrupteur.name]);
    }
    initToggles(section, enregistrer);
}

function initFacteurDefaut(facteurs, reglages, utilisateurId) {
    const liste = document.getElementById("defaultCourier");
    const defaut = facteurs.find((facteur) => facteur.id === reglages.facteur_defaut_id);
    afficherFacteurs(liste, facteurs, true, defaut?.slug ?? "eric");

    let precedent = String(defaut?.id ?? facteurs.find((facteur) => facteur.slug === "eric")?.id);
    liste.addEventListener("change", async (evt) => {
        effacerSignal(liste);
        try {
            await modifierReglages(utilisateurId, { facteur_defaut_id: Number(evt.target.value) });
            precedent = evt.target.value;
        } catch (erreur) {
            console.error("Erreur enregistrement du facteur par défaut :", erreur);
            liste.querySelector(`input[value="${precedent}"]`).checked = true;
            signalerErreur(liste, "Le facteur par défaut n’a pas pu être enregistré, réessayez.");
        }
    });
}

export async function initReglages(profil, utilisateur) {
    initDeconnexion();
    initSuppression();
    initNavigation();

    try {
        const [moiProfil, reglages, facteurs] = await Promise.all([
            profil ?? getProfil(utilisateur.id), getReglages(utilisateur.id), getAllFacteurs()
        ]);
        const moi = { profil: moiProfil, utilisateur: utilisateur };

        initCompte(moi);
        initInterrupteurs(document.getElementById("notifications"), reglages, (nom, valeur) =>
            modifierReglages(utilisateur.id, { [nom]: valeur })
        );
        initInterrupteurs(document.getElementById("confidentialite"), moiProfil, (nom, valeur) =>
            modifierProfil(utilisateur.id, { [nom]: valeur })
        );
        initFacteurDefaut(facteurs, reglages, utilisateur.id);
    } catch (erreur) {
        console.error("Erreur chargement des réglages :", erreur);
        signalerErreur(document.querySelector(".settings-nav"), "Vos réglages n’ont pas pu être chargés, rechargez la page.");
    }
}
