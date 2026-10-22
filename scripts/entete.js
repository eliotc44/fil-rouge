import { createNode, IMAGE_PAR_DEFAUT } from "./domUtil.js";

const itemAccueil = {
    tag: "li",
    children: [
        { tag: "a", text: "Accueil", attrs: { href: "./index.html", "aria-currentKey": "courantAccueil" } }
    ]
};

const itemMessages = {
    tag: "li",
    children: [
        {
            tag: "a",
            class: "nav-cta",
            text: "Messages",
            attrs: { href: "./messagerie.html", "aria-currentKey": "courantMessages" }
        }
    ]
};

const itemLivreurs = {
    tag: "li",
    children: [
        {
            tag: "a",
            attrs: { href: "./nos-livreurs.html", "aria-currentKey": "courantLivreurs" },
            children: [
                {
                    tag: "img",
                    class: "cap",
                    attrs: { src: "./images/svg/casquette.svg", alt: "", width: "28", height: "14" }
                },
                { tag: "span", text: "Nos livreurs" }
            ]
        }
    ]
};

const itemProfil = {
    tag: "li",
    children: [
        {
            tag: "a",
            class: "avatar-link",
            attrs: { href: "./profil.html", "aria-currentKey": "courantProfil" },
            children: [
                { tag: "img", class: "avatar", attrs: { srcKey: "avatarSrc", alt: "", width: "30", height: "30" } },
                { tag: "span", dataKey: "nomProfil" }
            ]
        }
    ]
};

const itemCompte = {
    tag: "li",
    children: [
        { tag: "a", class: "btn btn-outline", dataKey: "compteTexte", attrs: { hrefKey: "compteHref" } }
    ]
};

function getEnteteTemplate(connecte) {
    return {
        tag: "header",
        class: "site-header",
        attrs: { id: "header" },
        children: [
            {
                tag: "a",
                attrs: { href: "./index.html" },
                children: [
                    {
                        tag: "img",
                        class: "logo",
                        attrs: { src: "./images/svg/logo.svg", alt: "OOPS Livraison, accueil", width: "49", height: "49" }
                    }
                ]
            },
            {
                tag: "button",
                class: "menu-toggle",
                attrs: {
                    type: "button",
                    "aria-expanded": "false",
                    "aria-controls": "mainNav",
                    "aria-label": "Menu"
                },
                children: [
                    { tag: "img", attrs: { src: "./images/svg/burger.svg", alt: "", width: "32", height: "32" } },
                    { tag: "img", attrs: { src: "./images/svg/close.svg", alt: "", width: "32", height: "32", hidden: "" } }
                ]
            },
            {
                tag: "nav",
                class: "main-nav",
                attrs: { id: "mainNav", "aria-label": "Navigation principale" },
                children: [
                    {
                        tag: "ul",
                        children: [itemAccueil, itemMessages, itemLivreurs, connecte ? itemProfil : itemCompte]
                    }
                ]
            }
        ]
    };
}

/* profil vide : visiteur déconnecté, bouton S’inscrire (ou Se connecter sur la page d’inscription) */
export function createEntete(profil, page) {
    const surInscription = page === "inscription.html";
    const data = {
        courantAccueil: page === "index.html" ? "page" : "",
        courantMessages: page === "messagerie.html" ? "page" : "",
        courantLivreurs: page === "nos-livreurs.html" ? "page" : "",
        courantProfil: page === "profil.html" ? "page" : "",
        avatarSrc: profil?.avatar_url || IMAGE_PAR_DEFAUT,
        nomProfil: profil?.nom_affiche || profil?.pseudo || "",
        compteHref: surInscription ? "./connexion.html" : "./inscription.html",
        compteTexte: surInscription ? "Se connecter" : "S’inscrire"
    };
    return createNode(getEnteteTemplate(Boolean(profil)), data);
}

function initMenu() {
    const bouton = document.querySelector(".menu-toggle");
    const navigation = document.getElementById("mainNav");
    const [iconeBurger, iconeCroix] = bouton.querySelectorAll("img");

    function basculer(ouvert) {
        bouton.setAttribute("aria-expanded", String(ouvert));
        iconeBurger.hidden = ouvert;
        iconeCroix.hidden = !ouvert;
    }

    bouton.addEventListener("click", () => {
        basculer(bouton.getAttribute("aria-expanded") !== "true");
    });
    navigation.addEventListener("click", (evt) => {
        if (evt.target.closest("a")) basculer(false);
    });
    document.addEventListener("keydown", (evt) => {
        if (evt.key === "Escape") basculer(false);
    });
}

export function afficherEntete(profil, page) {
    document.getElementById("header").replaceWith(createEntete(profil, page));
    initMenu();
}
