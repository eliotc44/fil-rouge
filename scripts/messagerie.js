import { getAllFacteurs } from "./cache.js";
import { afficherLoader, afficherMessageErreur, afficherMessageVide } from "./domUtil.js";
import {
    createConversationItem, createContactItem, createConversationHeader,
    createDaySeparator, createBulle, createTransitCard, updateTransitCard
} from "./bulle.js";
import { afficherFacteurs } from "./facteurCard.js";
import {
    getConversations, getMessages, ouvrirConversation, envoyerMessage, envoyerPhoto,
    marquerConversationLue, getUrlPhoto, rechercherProfils, ecouterMessages
} from "./fetchMessages.js";
import { getReglages } from "./fetchProfil.js";
import { afficherErreur, effacerErreur } from "./formulaire.js";
import { animerSuivis } from "./suiviCard.js";
import { estMemeJour } from "./temps.js";

const TAILLE_MAX_PHOTO = 5 * 1024 * 1024;
const ECRAN_BUREAU = window.matchMedia("(min-width: 75rem)");
/* Au clavier physique, Entrée envoie ; sur téléphone, Entrée va à la ligne */
const ENTREE_ENVOIE = window.matchMedia("(hover: hover)");

const etat = {
    utilisateur: null,
    facteurs: [],
    conversations: [],
    conversationId: null,
    recherche: "",
    fichier: null,
    minuteur: null,
    delaiRecherche: null,
    delaiRechargement: null
};

function getConversationActive() {
    return etat.conversations.find((conversation) => conversation.id === etat.conversationId);
}

function getFacteurChoisi() {
    const choix = document.getElementById("composerForm").elements.facteur;
    return etat.facteurs.find((facteur) => String(facteur.id) === choix?.value);
}

function getNomContact(conversation) {
    return conversation.contact_nom || conversation.contact_pseudo;
}

/* ---------------------------------------------------------
   Liste des conversations
--------------------------------------------------------- */

function afficherListe() {
    const liste = document.getElementById("conversationList");
    const terme = etat.recherche.trim().toLowerCase();
    const visibles = etat.conversations.filter((conversation) =>
        !terme || [conversation.contact_nom, conversation.contact_pseudo, conversation.apercu]
            .some((texte) => (texte ?? "").toLowerCase().includes(terme))
    );

    if (visibles.length === 0 && !terme) {
        afficherMessageVide(liste, "Aucune conversation pour l’instant. Cherchez quelqu’un pour en commencer une.");
        return;
    }
    liste.replaceChildren(...visibles.map((conversation) =>
        createConversationItem(conversation, conversation.id === etat.conversationId)
    ));
}

async function chargerConversations() {
    try {
        etat.conversations = await getConversations();
        afficherListe();
        if (etat.recherche.trim().length >= 2) await chercherPersonnes(etat.recherche);
    } catch (erreur) {
        console.error("Erreur chargement des conversations :", erreur);
        afficherMessageErreur(document.getElementById("conversationList"), "Les conversations n’ont pas pu être chargées, recharge la page.");
    }
}

/* Les personnes qui ne sont pas encore dans une conversation, sous les résultats */
async function chercherPersonnes(terme) {
    try {
        const connus = etat.conversations.map((conversation) => conversation.contact_id);
        const profils = (await rechercherProfils(terme, etat.utilisateur.id))
            .filter((profil) => !connus.includes(profil.id));
        if (terme !== etat.recherche) return;

        const liste = document.getElementById("conversationList");
        for (let ancien of liste.querySelectorAll("[data-profil-id]")) ancien.closest("li").remove();
        liste.append(...profils.map((profil) => createContactItem(profil)));
    } catch (erreur) {
        console.error("Erreur recherche de personnes :", erreur);
    }
}

function initRecherche() {
    const champ = document.getElementById("searchInput");
    champ.addEventListener("input", () => {
        etat.recherche = champ.value;
        afficherListe();
        clearTimeout(etat.delaiRecherche);
        etat.delaiRecherche = setTimeout(() => chercherPersonnes(etat.recherche), 300);
    });

    document.getElementById("newConversation").addEventListener("click", (evt) => {
        evt.preventDefault();
        champ.focus();
    });

    document.getElementById("conversationList").addEventListener("click", async (evt) => {
        const lien = evt.target.closest("a.conversation-item");
        if (!lien) return;
        evt.preventDefault();

        if (lien.dataset.profilId) {
            await demarrerConversation(lien.dataset.profilId);
            return;
        }
        selectionnerConversation(new URL(lien.href).searchParams.get("c"), true);
    });
}

async function demarrerConversation(profilId) {
    try {
        const id = await ouvrirConversation(profilId);
        document.getElementById("searchInput").value = "";
        etat.recherche = "";
        await chargerConversations();
        await selectionnerConversation(id, true);
    } catch (erreur) {
        console.error("Erreur ouverture de la conversation :", erreur);
        afficherMessageErreur(document.getElementById("conversationList"), "La conversation n’a pas pu être ouverte, réessaie.");
    }
}

/* ---------------------------------------------------------
   Conversation ouverte : en-tête, fil, lecture
--------------------------------------------------------- */

function afficherEtatVide() {
    document.getElementById("conversationHeader").replaceChildren();
    afficherMessageVide(document.getElementById("thread"), "Choisissez une conversation, ou cherchez quelqu’un pour en commencer une.");
    document.getElementById("composerForm").hidden = true;
}

function afficherEntete() {
    const conversation = getConversationActive();
    const entete = document.getElementById("conversationHeader");
    if (conversation) entete.replaceWith(createConversationHeader(conversation));
}

async function selectionnerConversation(id, pousserHistorique) {
    if (!etat.conversations.some((conversation) => conversation.id === id)) return;

    etat.conversationId = id;
    if (pousserHistorique) history.pushState({}, "", `?c=${id}`);
    document.getElementById("content").classList.add("open");
    document.getElementById("composerForm").hidden = false;
    afficherEntete();
    afficherListe();
    await chargerFil(true);
}

function fermerConversation(pousserHistorique) {
    etat.conversationId = null;
    clearInterval(etat.minuteur);
    document.getElementById("content").classList.remove("open");
    if (pousserHistorique) history.pushState({}, "", location.pathname);
    afficherListe();
}

/* Les bulles dans l’ordre où elles apparaissent : mes envois au départ, les réceptions à l’arrivée */
async function construireFil(messages, conversation) {
    const instant = (message) => new Date(message.est_envoye_par_moi ? message.envoye_at : message.arrivee_prevue_at);
    const bulles = messages
        .filter((message) => message.est_envoye_par_moi || message.est_livre)
        .sort((a, b) => instant(a) - instant(b));
    const transits = messages
        .filter((message) => !message.est_envoye_par_moi && !message.est_livre)
        .sort((a, b) => new Date(a.arrivee_prevue_at ?? "9999") - new Date(b.arrivee_prevue_at ?? "9999"));

    const urls = await Promise.all(bulles.map((message) =>
        message.type === "photo" && message.photo_path
            ? getUrlPhoto(message.photo_path).catch((erreur) => {
                console.error("Erreur chargement de la photo :", erreur);
                return null;
            })
            : null
    ));

    const noeuds = [];
    let jourPrecedent = null;
    bulles.forEach((message, i) => {
        const date = instant(message);
        if (!jourPrecedent || !estMemeJour(date, jourPrecedent)) noeuds.push(createDaySeparator(date));
        jourPrecedent = date;
        const facteur = etat.facteurs.find((f) => f.id === message.facteur_id);
        noeuds.push(createBulle(message, { urlPhoto: urls[i], facteur: facteur }));
    });

    const cartes = transits.map((message) => ({
        carte: createTransitCard(message, etat.facteurs.find((f) => f.id === message.facteur_id), getNomContact(conversation)),
        suivi: message
    }));
    noeuds.push(...cartes.map(({ carte }) => carte));
    return { noeuds, cartes };
}

async function chargerFil(versLeBas = false) {
    const id = etat.conversationId;
    const conversation = getConversationActive();
    if (!id || !conversation) return;

    clearInterval(etat.minuteur);
    const fil = document.getElementById("thread");
    if (versLeBas) afficherLoader(fil);
    const etaitEnBas = fil.scrollHeight - fil.scrollTop - fil.clientHeight < 80;

    try {
        const messages = await getMessages(id);
        if (id !== etat.conversationId) return;

        const { noeuds, cartes } = await construireFil(messages, conversation);
        if (id !== etat.conversationId) return;

        if (noeuds.length === 0) {
            afficherMessageVide(fil, "Aucun message pour l’instant. Écrivez le premier, un facteur le portera.");
        } else {
            fil.replaceChildren(...noeuds);
        }
        if (versLeBas || etaitEnBas) fil.scrollTop = fil.scrollHeight;
        if (cartes.length > 0) etat.minuteur = animerSuivis(cartes, rechargerTout, updateTransitCard);

        if (messages.some((message) => !message.est_envoye_par_moi && message.est_livre && !message.lu_at)) {
            await marquerLue(id);
        }
    } catch (erreur) {
        console.error("Erreur chargement des messages :", erreur);
        afficherMessageErreur(fil, "Les messages n’ont pas pu être chargés, réessaie.");
    }
}

async function marquerLue(id) {
    try {
        await marquerConversationLue(id);
        etat.conversations = await getConversations();
        afficherListe();
        afficherEntete();
    } catch (erreur) {
        console.error("Erreur marquage des messages lus :", erreur);
    }
}

async function rechargerTout() {
    await chargerConversations();
    afficherEntete();
    await chargerFil();
}

/* ---------------------------------------------------------
   Composeur : facteur, photo, envoi
--------------------------------------------------------- */

function majComposeur() {
    const formulaire = document.getElementById("composerForm");
    const facteur = getFacteurChoisi();
    const champ = formulaire.elements.message;
    const photoSeule = facteur?.type_contenu === "photo";

    champ.disabled = photoSeule;
    champ.required = !photoSeule;
    champ.placeholder = photoSeule
        ? `${facteur.nom} ne livre que des photos : ajoutez-en une.`
        : "Votre message…";
    if (!photoSeule && etat.fichier) viderPhoto();

    const estimation = facteur
        ? `Livraison estimée : ${facteur.delai_affiche} avec ${facteur.nom} (contenu susceptible d’être modifié)`
        : "";
    document.getElementById("composerHint").textContent = etat.fichier
        ? `Photo prête à partir : ${etat.fichier.name}. ${estimation}`
        : estimation;
}

function viderPhoto() {
    etat.fichier = null;
    document.getElementById("composerForm").elements.photo.value = "";
}

function choisirPhoto(fichier) {
    const formulaire = document.getElementById("composerForm");
    effacerErreur(formulaire);
    if (!fichier) {
        viderPhoto();
    } else if (fichier.size > TAILLE_MAX_PHOTO) {
        viderPhoto();
        afficherErreur(formulaire, "Cette photo est trop lourde (5 Mo maximum).");
    } else {
        etat.fichier = fichier;
        const peter = etat.facteurs.find((facteur) => facteur.type_contenu === "photo");
        const bouton = peter && formulaire.querySelector(`input[name="facteur"][value="${peter.id}"]`);
        if (bouton) bouton.checked = true;
    }
    majComposeur();
}

async function envoyer(evt) {
    evt.preventDefault();
    const formulaire = evt.currentTarget;
    effacerErreur(formulaire);

    const facteur = getFacteurChoisi();
    if (!facteur || !etat.conversationId) return;
    if (facteur.type_contenu === "photo" && !etat.fichier) {
        afficherErreur(formulaire, `${facteur.nom} ne livre que des photos : ajoutez-en une.`);
        return;
    }

    const bouton = formulaire.querySelector("[type='submit']");
    bouton.disabled = true;
    try {
        if (facteur.type_contenu === "photo") {
            await envoyerPhoto(etat.conversationId, facteur.id, etat.fichier, etat.utilisateur.id);
        } else {
            await envoyerMessage(etat.conversationId, facteur.id, formulaire.elements.message.value);
        }
        formulaire.elements.message.value = "";
        viderPhoto();
        majComposeur();
        await Promise.all([chargerConversations(), chargerFil(true)]);
    } catch (erreur) {
        console.error("Erreur envoi :", erreur);
        afficherErreur(formulaire, "Le facteur n’a pas pu partir, réessaie.");
    }
    bouton.disabled = false;
}

function initComposeur(slugDefaut) {
    const formulaire = document.getElementById("composerForm");
    afficherFacteurs(document.getElementById("composerCouriers"), etat.facteurs, true, slugDefaut);
    majComposeur();

    formulaire.addEventListener("change", (evt) => {
        if (evt.target.name === "photo") choisirPhoto(evt.target.files[0]);
        if (evt.target.name === "facteur") majComposeur();
    });
    formulaire.elements.message.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter" && !evt.shiftKey && ENTREE_ENVOIE.matches) {
            evt.preventDefault();
            formulaire.requestSubmit();
        }
    });
    formulaire.addEventListener("submit", envoyer);
}

/* ---------------------------------------------------------
   Navigation et temps réel
--------------------------------------------------------- */

function initNavigation() {
    document.getElementById("content").addEventListener("click", (evt) => {
        if (evt.target.closest(".back-button")) fermerConversation(true);
    });
    window.addEventListener("popstate", () => {
        const id = new URLSearchParams(location.search).get("c");
        if (id) selectionnerConversation(id, false);
        else fermerConversation(false);
    });
}

function initTempsReel() {
    ecouterMessages(() => {
        clearTimeout(etat.delaiRechargement);
        etat.delaiRechargement = setTimeout(rechargerTout, 400);
    });
}

export async function initMessagerie(utilisateur) {
    etat.utilisateur = utilisateur;
    const liste = document.getElementById("conversationList");
    afficherLoader(liste);

    try {
        const [facteurs, reglages, conversations] = await Promise.all([
            getAllFacteurs(), getReglages(utilisateur.id), getConversations()
        ]);
        etat.facteurs = facteurs;
        etat.conversations = conversations;

        const facteurDefaut = facteurs.find((facteur) => facteur.id === reglages.facteur_defaut_id);
        initComposeur(facteurDefaut?.slug ?? "eric");
    } catch (erreur) {
        console.error("Erreur chargement de la messagerie :", erreur);
        afficherMessageErreur(liste, "La messagerie n’a pas pu être chargée, recharge la page.");
        return;
    }

    afficherListe();
    initRecherche();
    initNavigation();
    initTempsReel();

    const demande = new URLSearchParams(location.search).get("c");
    const id = demande ?? (ECRAN_BUREAU.matches ? etat.conversations[0]?.id : null);
    if (id && etat.conversations.some((conversation) => conversation.id === id)) {
        await selectionnerConversation(id, false);
    } else if (ECRAN_BUREAU.matches) {
        afficherEtatVide();
    }
}
