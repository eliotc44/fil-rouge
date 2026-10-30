import { getAllFacteurs } from "./cache.js";
import { createNode, IMAGE_PAR_DEFAUT, afficherLoader, afficherMessageErreur, afficherMessageVide } from "./domUtil.js";
import { getStatistiques, getFacteursPreferes } from "./fetchProfil.js";

const identiteTemplate = {
    tag: "div",
    children: [
        { tag: "h1", dataKey: "nom" },
        {
            tag: "p",
            children: [
                { tag: "span", dataKey: "identifiant" },
                { tag: "time", dataKey: "depuis", attrs: { datetimeKey: "creeLe" } }
            ]
        },
        {
            tag: "ul",
            class: "badges",
            children: [
                { tag: "li", dataKey: "badgeFacteur" },
                { tag: "li", dataKey: "badgeEnvois" }
            ]
        }
    ]
};

const statTemplate = {
    tag: "li",
    children: [
        { tag: "strong", dataKey: "valeur" },
        { tag: "span", dataKey: "libelle" }
    ]
};

const infoTemplate = {
    tag: "div",
    children: [
        { tag: "dt", dataKey: "libelle" },
        { tag: "dd", dataKey: "valeur" }
    ]
};

const rangTemplate = {
    tag: "li",
    children: [
        { tag: "strong", dataKey: "rang" },
        {
            tag: "span",
            class: "courier-chip",
            children: [
                { tag: "img", class: "avatar", attrs: { srcKey: "avatarSrc", alt: "", width: "34", height: "34" } },
                { tag: "span", dataKey: "nom" },
                { tag: "small", dataKey: "delai" }
            ]
        },
        { tag: "data", dataKey: "envois", attrs: { valueKey: "nbMessages" } }
    ]
};

function formaterEnvois(nombre) {
    return `${nombre} envoi${nombre > 1 ? "s" : ""}`;
}

function createIdentite(profil, facteurPrefere, nbEnvois) {
    const creeLe = new Date(profil.created_at);
    return createNode(identiteTemplate, {
        nom: profil.nom_affiche || profil.pseudo,
        identifiant: `@${profil.pseudo} · membre depuis `,
        depuis: creeLe.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
        creeLe: creeLe.toISOString(),
        badgeFacteur: `Facteur préféré : ${facteurPrefere ? facteurPrefere.nom : "aucun"}`,
        badgeEnvois: formaterEnvois(nbEnvois ?? 0)
    });
}

function afficherStats(conteneur, statistiques) {
    const lignes = [
        [statistiques.messages_envoyes, "messages envoyés"],
        [statistiques.messages_recus, "messages reçus"],
        [statistiques.mots_perdus, "mots perdus par Lisa"],
        [statistiques.anecdotes, "anecdotes de Gwendoline"]
    ];
    conteneur.replaceChildren(...lignes.map(([valeur, libelle]) =>
        createNode(statTemplate, { valeur: valeur ?? 0, libelle: libelle })
    ));
}

function afficherInfos(conteneur, profil, utilisateur) {
    const lignes = [
        ["Pseudo", profil.pseudo],
        ["Adresse e-mail", utilisateur.email],
        ["Bio", profil.bio || "Non renseignée"]
    ];
    conteneur.replaceChildren(...lignes.map(([libelle, valeur]) =>
        createNode(infoTemplate, { libelle: libelle, valeur: valeur })
    ));
}

function createRang(ligne, facteur) {
    const dom = createNode(rangTemplate, {
        rang: `#${ligne.rang}`,
        avatarSrc: facteur?.avatar_url || IMAGE_PAR_DEFAUT,
        nom: ligne.nom,
        delai: ligne.delai_affiche,
        envois: formaterEnvois(ligne.nb_messages),
        nbMessages: ligne.nb_messages
    });
    dom.style.setProperty("--courier-color", ligne.couleur);
    if (ligne.rang === 1) dom.querySelector(".courier-chip").classList.add("active");
    return dom;
}

function afficherRangs(conteneur, preferes, facteurs) {
    if (preferes.length === 0) {
        afficherMessageVide(conteneur, "Aucun message livré pour l’instant : vos facteurs préférés apparaîtront ici.");
        return;
    }
    conteneur.replaceChildren(...preferes.map((ligne) =>
        createRang(ligne, facteurs.find((facteur) => facteur.id === ligne.facteur_id))
    ));
}

export async function initProfil(profil, utilisateur) {
    const identite = document.getElementById("profileIdentity");
    if (!profil) {
        afficherMessageErreur(identite, "Votre profil n’a pas pu être chargé, rechargez la page.");
        return;
    }

    document.querySelector(".profile-hero .avatar").src = profil.avatar_url || IMAGE_PAR_DEFAUT;
    afficherInfos(document.getElementById("profileInfo"), profil, utilisateur);

    const stats = document.getElementById("profileStats");
    const rangs = document.getElementById("rankList");
    afficherLoader(stats);
    afficherLoader(rangs);

    let statistiques = null;
    let preferes = [];
    try {
        let facteurs;
        [statistiques, preferes, facteurs] = await Promise.all([
            getStatistiques(), getFacteursPreferes(), getAllFacteurs()
        ]);
        afficherStats(stats, statistiques);
        afficherRangs(rangs, preferes, facteurs);
    } catch (erreur) {
        console.error("Erreur chargement des statistiques :", erreur);
        afficherMessageErreur(stats, "Les statistiques n’ont pas pu être chargées, rechargez la page.");
        afficherMessageErreur(rangs, "Le classement n’a pas pu être chargé, rechargez la page.");
    }

    identite.replaceWith(createIdentite(profil, preferes[0], statistiques?.messages_envoyes));
}
