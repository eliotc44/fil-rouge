import { supabaseClient, choisirResterConnecte } from "./supabase.js";

export async function pseudoDisponible(pseudo) {
    const { data, error } = await supabaseClient.rpc("pseudo_disponible", { p_pseudo: pseudo });
    if (error) throw error;
    return data;
}

export async function inscrire(email, motDePasse, pseudo, facteurDefautId) {
    choisirResterConnecte(true);
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: motDePasse,
        options: { data: { pseudo: pseudo, facteur_defaut_id: facteurDefautId } }
    });
    if (error) throw error;
    return data;
}

export async function connecter(email, motDePasse, resterConnecte) {
    choisirResterConnecte(resterConnecte);
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: motDePasse
    });
    if (error) throw error;
    return data;
}

/* Déconnecte seulement cet appareil */
export async function deconnecter() {
    const { error } = await supabaseClient.auth.signOut({ scope: "local" });
    if (error) throw error;
}

export async function modifierEmail(email) {
    const { data, error } = await supabaseClient.auth.updateUser({ email: email });
    if (error) throw error;
    return data;
}

export async function modifierMotDePasse(motDePasse) {
    const { error } = await supabaseClient.auth.updateUser({ password: motDePasse });
    if (error) throw error;
}
