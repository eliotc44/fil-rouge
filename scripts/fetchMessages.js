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
<<<<<<< HEAD

export async function getConversations() {
    const { data, error } = await supabaseClient
        .from("v_conversations")
        .select("*")
        .order("dernier_message_at", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return data;
}

export async function getMessages(conversationId) {
    const { data, error } = await supabaseClient
        .from("v_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("envoye_at");
    if (error) throw error;
    return data;
}

export async function ouvrirConversation(autreProfilId) {
    const { data, error } = await supabaseClient.rpc("ouvrir_conversation", { p_autre_profil_id: autreProfilId });
    if (error) throw error;
    return data;
}

export async function envoyerMessage(conversationId, facteurId, texte) {
    const { data, error } = await supabaseClient.rpc("envoyer_message", {
        p_conversation_id: conversationId,
        p_facteur_id: facteurId,
        p_texte: texte
    });
    if (error) throw error;
    return data;
}

export async function envoyerPhoto(conversationId, facteurId, fichier, utilisateurId) {
    const chemin = `${utilisateurId}/${crypto.randomUUID()}.jpg`;
    const { error: erreurFichier } = await supabaseClient.storage.from("photos").upload(chemin, fichier);
    if (erreurFichier) throw erreurFichier;

    const { data, error } = await supabaseClient.rpc("envoyer_message", {
        p_conversation_id: conversationId,
        p_facteur_id: facteurId,
        p_photo_path: chemin
    });
    if (error) throw error;
    return data;
}

export async function marquerConversationLue(conversationId) {
    const { data, error } = await supabaseClient.rpc("marquer_conversation_lue", { p_conversation_id: conversationId });
    if (error) throw error;
    return data;
}

/* La photo est dans un bucket privé : on demande un lien temporaire d’une heure */
export async function getUrlPhoto(chemin) {
    const { data, error } = await supabaseClient.storage.from("photos").createSignedUrl(chemin, 3600);
    if (error) throw error;
    return data.signedUrl;
}

/* Les autres personnes qui acceptent d’apparaître dans la recherche */
export async function rechercherProfils(terme, monId) {
    const propre = terme.replace(/[^\p{L}\p{N}._ -]/gu, "").trim().replace(/ +/g, "*");
    if (propre.length < 2) return [];
    const { data, error } = await supabaseClient
        .from("profils")
        .select("id, pseudo, nom_affiche, avatar_url")
        .eq("visible_dans_recherche", true)
        .neq("id", monId)
        .or(`pseudo.ilike.*${propre}*,nom_affiche.ilike.*${propre}*`)
        .limit(8);
    if (error) throw error;
    return data;
}

/* Un message part ou arrive : la page recharge ce qu’elle affiche */
export function ecouterMessages(rappel) {
    return supabaseClient
        .channel("messages")
        .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, rappel)
        .subscribe();
}
=======
>>>>>>> a5aa8dc3df95c058b766e8b2b3640667a841363d
