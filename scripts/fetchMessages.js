import { supabaseClient } from "./supabase.js";

export async function getSuivis(limite) {
    let requete = supabaseClient.from("v_suivis").select("*").order("envoye_at");
    if (limite) requete = requete.limit(limite);
    const { data, error } = await requete;
    if (error) throw error;
    return data;
}

/* La conversation avec des messages livrés non lus la plus récente, ou rien */
export async function getConversationNonLue() {
    const { data, error } = await supabaseClient
        .from("v_conversations")
        .select("*")
        .gt("non_lus", 0)
        .order("dernier_message_at", { ascending: false })
        .limit(1);
    if (error) throw error;
    return data[0] ?? null;
}
