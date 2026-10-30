-- Suppression de son propre compte (bouton « Supprimer mon compte » des réglages).
-- À exécuter une fois dans Supabase > SQL Editor.
-- Supprimer l'utilisateur efface en cascade son profil, ses réglages et ses messages.
-- Les photos déjà envoyées restent dans le bucket « photos » (à nettoyer à la main si besoin).

create or replace function public.supprimer_mon_compte()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.supprimer_mon_compte() from public, anon;
grant  execute on function public.supprimer_mon_compte() to authenticated;
