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
