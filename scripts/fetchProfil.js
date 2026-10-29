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
<<<<<<< HEAD

export async function getReglages(utilisateurId) {
    const { data, error } = await supabaseClient
        .from("reglages")
        .select("*")
        .eq("profil_id", utilisateurId)
        .single();
    if (error) throw error;
    return data;
}
=======
>>>>>>> a5aa8dc3df95c058b766e8b2b3640667a841363d
