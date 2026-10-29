import { createNode } from "./domUtil.js";

const LIENS = [
    ["Accueil", "./index.html"],
    ["Suivi des messages", "./suivi.html"],
    ["Nos livreurs", "./nos-livreurs.html"],
    ["Messagerie", "./messagerie.html"],
    ["Profil", "./profil.html"],
    ["Réglages", "./reglages.html"]
];

const footerTemplate = {
    tag: "footer",
    class: "site-footer",
    attrs: { id: "footer" },
    children: [
        {
            tag: "div",
            class: "footer-brand",
            children: [
                { tag: "img", class: "logo", attrs: { src: "./images/svg/logo.svg", alt: "", width: "106", height: "106" } },
                { tag: "img", class: "cap", attrs: { src: "./images/svg/casquette.svg", alt: "", width: "189", height: "96" } }
            ]
        },
        {
            tag: "nav",
            class: "footer-nav",
            attrs: { "aria-label": "Navigation du pied de page" },
            children: [
                {
                    tag: "ul",
                    children: LIENS.map(([texte, href]) => ({
                        tag: "li",
                        children: [{ tag: "a", text: texte, attrs: { href: href } }]
                    }))
                }
            ]
        },
        {
            tag: "div",
            class: "footer-legal",
            children: [
                { tag: "p", text: "© 2026 OOPS Livraison — Projet fil-rouge 8WEB101" },
                { tag: "p", text: "Aucun message n’a été maltraité… ou presque." }
            ]
        }
    ]
};

export function createFooter() {
    return createNode(footerTemplate);
}

/* La messagerie n’a pas de pied de page : pas de #footer dans la page */
export function afficherFooter() {
    const footer = document.getElementById("footer");
    if (footer) footer.replaceWith(createFooter());
}
