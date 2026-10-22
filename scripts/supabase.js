const SUPABASE_URL = "https://ooszqyrlavcqvzdweryo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_cQJQmfxoCHASZofnFja6fA_fb6x_91T";
const CLE_RESTER_CONNECTE = "oops_rester_connecte";

function resterConnecte() {
    return localStorage.getItem(CLE_RESTER_CONNECTE) !== "0";
}

export function choisirResterConnecte(oui) {
    localStorage.setItem(CLE_RESTER_CONNECTE, oui ? "1" : "0");
}

/* Session gardée dans localStorage (rester connecté) ou sessionStorage (fin à la fermeture de l’onglet) */
const stockageSession = {
    getItem(cle) {
        return sessionStorage.getItem(cle) ?? localStorage.getItem(cle);
    },
    setItem(cle, valeur) {
        const garde = resterConnecte() ? localStorage : sessionStorage;
        const efface = resterConnecte() ? sessionStorage : localStorage;
        garde.setItem(cle, valeur);
        efface.removeItem(cle);
    },
    removeItem(cle) {
        sessionStorage.removeItem(cle);
        localStorage.removeItem(cle);
    }
};

export const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { storage: stockageSession }
});

export async function getUtilisateur() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
        console.error("Erreur lecture de la session :", error);
        return null;
    }
    return data.session?.user ?? null;
}

export async function exigerConnexion() {
    const utilisateur = await getUtilisateur();
    if (!utilisateur) window.location.replace("./connexion.html");
    return utilisateur;
}
