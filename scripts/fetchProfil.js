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
