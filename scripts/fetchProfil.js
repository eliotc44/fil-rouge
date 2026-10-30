import { supabaseClient } from "./supabase.js";

export async function getProfil(utilisateurId) {
    const { data, error } = await supabaseClient
        .from("profils")
        .select("*")
        .eq("id", utilisateurId)
        .single();
    if (error) throw error;
    return data;
}

export async function getReglages(utilisateurId) {
    const { data, error } = await supabaseClient
        .from("reglages")
        .select("*")
        .eq("profil_id", utilisateurId)
        .single();
    if (error) throw error;
    return data;
}

export async function modifierReglages(utilisateurId, champs) {
    const { error } = await supabaseClient.from("reglages").update(champs).eq("profil_id", utilisateurId);
    if (error) throw error;
}

export async function modifierProfil(utilisateurId, champs) {
    const { error } = await supabaseClient.from("profils").update(champs).eq("id", utilisateurId);
    if (error) throw error;
}

export async function getStatistiques() {
    const { data, error } = await supabaseClient.from("v_mes_statistiques").select("*").single();
    if (error) throw error;
    return data;
}

export async function getFacteursPreferes() {
    const { data, error } = await supabaseClient
        .from("v_mes_facteurs_preferes")
        .select("*")
        .order("rang")
        .order("nb_messages", { ascending: false });
    if (error) throw error;
    return data;
}

/* Fonction SQL supprimer_mon_compte : voir administrateur/supprimer_compte.sql */
export async function supprimerCompte() {
    const { error } = await supabaseClient.rpc("supprimer_mon_compte");
    if (error) throw error;
}
