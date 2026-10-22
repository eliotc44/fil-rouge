import { supabaseClient } from "./supabase.js";

const CLE_CACHE = "oops_facteurs";
const DUREE_CACHE = 60 * 60 * 1000;

let facteursEnMemoire = null;

function lireStockage() {
    try {
        const stocke = JSON.parse(localStorage.getItem(CLE_CACHE));
        if (stocke && Date.now() - stocke.date < DUREE_CACHE) return stocke.facteurs;
    } catch (erreur) {
        console.error("Erreur lecture du cache des facteurs :", erreur);
    }
    return null;
}

function ecrireStockage(facteurs) {
    try {
        localStorage.setItem(CLE_CACHE, JSON.stringify({ date: Date.now(), facteurs: facteurs }));
    } catch (erreur) {
        console.error("Erreur écriture du cache des facteurs :", erreur);
    }
}

export async function getAllFacteurs() {
    if (facteursEnMemoire) return facteursEnMemoire;

    facteursEnMemoire = lireStockage();
    if (facteursEnMemoire) return facteursEnMemoire;

    const { data, error } = await supabaseClient.from("facteurs").select("*").order("ordre");
    if (error) throw error;

    facteursEnMemoire = data;
    ecrireStockage(data);
    return data;
}

export async function getFacteurParSlug(slug) {
    const facteurs = await getAllFacteurs();
    return facteurs.find((facteur) => facteur.slug === slug);
}

export function clearCache() {
    facteursEnMemoire = null;
    localStorage.removeItem(CLE_CACHE);
}
