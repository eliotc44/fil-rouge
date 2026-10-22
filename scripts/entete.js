import { IMAGE_PAR_DEFAUT } from "./domUtil.js";

/* profil vide : visiteur déconnecté (bouton S’inscrire / Se connecter) */
export function initEntete(profil) {
    const lienProfil = document.querySelector(".main-nav .avatar-link");
    const boutonCompte = document.querySelector(".main-nav .btn");
    const itemProfil = lienProfil.closest("li");
    const itemBouton = boutonCompte.closest("li");

    itemProfil.hidden = !profil;
    itemBouton.hidden = Boolean(profil);
    if (!profil) return;

    lienProfil.querySelector("img").src = profil.avatar_url || IMAGE_PAR_DEFAUT;
    lienProfil.querySelector("span").textContent = profil.nom_affiche || profil.pseudo;
}

export function initMenu() {
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
