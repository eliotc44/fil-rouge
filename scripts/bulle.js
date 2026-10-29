import { createNode, IMAGE_PAR_DEFAUT } from "./domUtil.js";
import { afficherTexteLivre, getResumeEffet } from "./effets.js";
import { formaterHeure, formaterDuree, formaterJour, formaterHeureConversation } from "./temps.js";

/* ---- conversation-item ---- */

function getItemTemplate(avecHeure, avecBadge) {
    const enfants = [
        { tag: "img", class: "avatar", attrs: { srcKey: "avatarSrc", alt: "", width: "48", height: "48" } },
        { tag: "strong", dataKey: "nom" },
        { tag: "p", dataKey: "apercu" }
    ];
    if (avecHeure) enfants.push({ tag: "time", dataKey: "heure", attrs: { datetimeKey: "dateIso" } });
    if (avecBadge) enfants.push({ tag: "span", class: "unread-badge", dataKey: "nonLus" });
    return {
        tag: "li",
        children: [
            {
                tag: "a",
                class: "conversation-item",
                attrs: { hrefKey: "lien", "aria-currentKey": "courant" },
                children: enfants
            }
        ]
    };
}

function getApercu(conversation) {
    if (conversation.apercu_type === "photo") return "Photo";
    if (conversation.apercu) return conversation.apercu;
    return conversation.en_route > 0 ? "Courrier en route…" : "Nouvelle conversation";
}

export function createConversationItem(conversation, actif = false) {
    const date = conversation.apercu_at ? new Date(conversation.apercu_at) : null;
    return createNode(getItemTemplate(Boolean(date), conversation.non_lus > 0), {
        lien: `./messagerie.html?c=${conversation.id}`,
        courant: actif ? "true" : "",
        avatarSrc: conversation.contact_avatar || IMAGE_PAR_DEFAUT,
        nom: conversation.contact_nom || conversation.contact_pseudo,
        apercu: getApercu(conversation),
        heure: date ? formaterHeureConversation(date) : "",
        dateIso: date ? date.toISOString() : "",
        nonLus: conversation.non_lus
    });
}

/* Résultat de recherche : quelqu’un avec qui il n’y a pas encore de conversation */
const contactTemplate = {
    tag: "li",
    children: [
        {
            tag: "a",
            class: "conversation-item",
            attrs: { href: "#", "data-profil-idKey": "id" },
            children: [
                { tag: "img", class: "avatar", attrs: { srcKey: "avatarSrc", alt: "", width: "48", height: "48" } },
                { tag: "strong", dataKey: "nom" },
                { tag: "p", text: "Démarrer une conversation" }
            ]
        }
    ]
};

export function createContactItem(profil) {
    return createNode(contactTemplate, {
        id: profil.id,
        avatarSrc: profil.avatar_url || IMAGE_PAR_DEFAUT,
        nom: profil.nom_affiche || profil.pseudo
    });
}

/* ---- conversation-header ---- */

function getEnteteTemplate(avecEnRoute) {
    const enfants = [
        {
            tag: "button",
            class: "back-button",
            text: "‹",
            attrs: { type: "button", "aria-label": "Retour aux conversations" }
        },
        { tag: "img", class: "avatar", attrs: { srcKey: "avatarSrc", alt: "", width: "52", height: "52" } },
        { tag: "h2", dataKey: "nom" }
    ];
    if (avecEnRoute) enfants.push({ tag: "p", dataKey: "enRoute" });
    enfants.push({ tag: "a", class: "btn btn-outline", text: "Voir le suivi", attrs: { href: "./suivi.html" } });
    return { tag: "header", class: "conversation-header", attrs: { id: "conversationHeader" }, children: enfants };
}

export function createConversationHeader(conversation) {
    const nombre = conversation.en_route;
    return createNode(getEnteteTemplate(nombre > 0), {
        avatarSrc: conversation.contact_avatar || IMAGE_PAR_DEFAUT,
        nom: conversation.contact_nom || conversation.contact_pseudo,
        enRoute: `${nombre} message${nombre > 1 ? "s" : ""} en route vers vous`
    });
}

/* ---- day-separator ---- */

export function createDaySeparator(date) {
    return createNode({
        tag: "li",
        class: "day-separator",
        children: [{ tag: "time", dataKey: "jour", attrs: { datetimeKey: "dateIso" } }]
    }, { jour: formaterJour(date), dateIso: date.toISOString() });
}

/* ---- bubble ---- */

function getBulleTemplate(message, urlPhoto) {
    const classes = ["bubble", message.est_envoye_par_moi ? "bubble-sent" : "bubble-received"];
    const enfants = [];
    if (message.type === "photo") {
        classes.push("bubble-photo");
        const photo = [{ tag: "img", attrs: { srcKey: "photoSrc", alt: "Photo envoyée", width: "400", height: "250" } }];
        if (message.effets?.photo_facteur) {
            photo.push({ tag: "img", class: "courier-photo", attrs: { srcKey: "facteurSrc", alt: "", width: "176", height: "176" } });
        }
        enfants.push({ tag: "figure", children: photo });
    } else {
        enfants.push({ tag: "p" });
    }

    const enRoute = message.est_envoye_par_moi && !message.est_livre;
    enfants.push({
        tag: "p",
        class: "bubble-meta",
        children: enRoute
            ? [{ tag: "span", dataKey: "enRoute" }]
            : [{ tag: "time", dataKey: "heure", attrs: { datetimeKey: "dateIso" } }, { tag: "span", dataKey: "suiteMeta" }]
    });
    return { tag: "li", class: classes.join(" "), children: enfants };
}

/* options : { urlPhoto, facteur } — facteur sert à la photo collée par Peter */
export function createBulle(message, options = {}) {
    const instant = new Date(message.est_envoye_par_moi ? message.envoye_at : message.arrivee_prevue_at);
    const suite = ["livré par " + message.facteur_nom, getResumeEffet(message)].filter(Boolean);
    const data = {
        photoSrc: options.urlPhoto || IMAGE_PAR_DEFAUT,
        facteurSrc: options.facteur?.avatar_url || IMAGE_PAR_DEFAUT,
        heure: formaterHeure(instant),
        dateIso: instant.toISOString(),
        suiteMeta: " · " + suite.join(" · "),
        enRoute: `En route avec ${message.facteur_nom}`
    };

    const dom = createNode(getBulleTemplate(message, options.urlPhoto), data);
    dom.style.setProperty("--courier-color", message.facteur_couleur);
    if (message.type === "photo") {
        const effets = message.effets ?? {};
        const photoFacteur = dom.querySelector(".courier-photo");
        if (photoFacteur) {
            photoFacteur.style.setProperty("--rotation", `${effets.rotation ?? 0}deg`);
            photoFacteur.style.setProperty("--x", `${(effets.x ?? 0.4) * 100}%`);
            photoFacteur.style.setProperty("--y", `${(effets.y ?? 0.3) * 100}%`);
        }
    } else {
        afficherTexteLivre(dom.firstElementChild, message);
    }
    return dom;
}

/* ---- transit-card ---- */

const transitTemplate = {
    tag: "li",
    class: "transit-card",
    children: [
        {
            tag: "span",
            class: "courier-chip active",
            children: [
                { tag: "img", class: "avatar", attrs: { srcKey: "avatarSrc", alt: "", width: "34", height: "34" } },
                { tag: "span", dataKey: "nom" },
                { tag: "small", dataKey: "delai" }
            ]
        },
        { tag: "p", dataKey: "texte" },
        {
            tag: "div",
            class: "tracking-progress",
            attrs: {
                role: "progressbar",
                "aria-label": "Progression de la livraison",
                "aria-valuemin": "0",
                "aria-valuemax": "100"
            }
        },
        { tag: "p", class: "tracking-status", dataKey: "statut" }
    ]
};

export function createTransitCard(message, facteur, contactNom) {
    const dom = createNode(transitTemplate, {
        avatarSrc: facteur?.avatar_url || IMAGE_PAR_DEFAUT,
        nom: message.facteur_nom,
        delai: facteur?.delai_affiche ?? "",
        texte: `${message.facteur_nom} arrive avec la réponse de ${contactNom}`,
        statut: ""
    });
    dom.style.setProperty("--courier-color", message.facteur_couleur);
    updateTransitCard(dom, message);
    return dom;
}

/* Renvoie faux quand le message est arrivé */
export function updateTransitCard(carte, message) {
    const barre = carte.querySelector(".tracking-progress");
    const statut = carte.querySelector(".tracking-status");
    if (!message.arrivee_prevue_at) {
        barre.style.setProperty("--progress", 0.5);
        barre.removeAttribute("aria-valuenow");
        statut.textContent = `Arrivée : quand ${message.facteur_nom} voudra`;
        return true;
    }

    const maintenant = Date.now();
    const depart = new Date(message.envoye_at);
    const arrivee = new Date(message.arrivee_prevue_at);
    const progression = Math.min(1, Math.max(0, (maintenant - depart) / (arrivee - depart)));
    barre.style.setProperty("--progress", progression);
    barre.setAttribute("aria-valuenow", Math.round(progression * 100));
    statut.textContent = `Arrivée dans ${formaterDuree(arrivee - maintenant)}`;
    return arrivee - maintenant > 0;
}
