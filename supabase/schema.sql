-- Simulateur d'entreprise de Compta PME : base Supabase pour jouer en ligne (phase S5, préparée le 21.11.2026).
-- À exécuter une fois dans l'éditeur SQL du projet Supabase de l'enseignant (région Europe).
--
-- Données anonymes seulement (accord de l'enseignant du 20.11.2026) : code de partie, noms d'entreprise choisis par
-- les groupes, décisions, situations et résultats du jeu. Jamais de nom d'élève, de saisie comptable ni de note.
--
-- Accès :
-- - l'enseignant, connecté (lien reçu par e-mail), lit et écrit ses propres parties (règles RLS ci-dessous) ;
-- - les groupes ne sont pas connectés : ils passent seulement par les fonctions rejoindre_partie, deposer_decisions et
--   lire_resultats, avec le code de partie et leur code d'équipe secret. Ils n'ont aucun accès direct aux tables.
-- Le calcul des tours reste dans le navigateur de l'enseignant (moteur testé de Compta PME) : la base ne fait que
-- stocker et transmettre.

create extension if not exists pgcrypto;

create table if not exists sim_parties (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z2-9]{6}$'),
  enseignant uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nom text not null,
  numero_tour int not null default 1,
  affichage text not null default 'classement' check (affichage in ('classement', 'sansRang', 'cache')),
  termine boolean not null default false,
  cree_le timestamptz not null default now()
);

create table if not exists sim_equipes (
  partie_id uuid not null references sim_parties (id) on delete cascade,
  entreprise_id text not null,
  nom text not null,
  -- SHA-256 du code d'équipe (le code lui-même n'est jamais stocké).
  code_hash text not null,
  primary key (partie_id, entreprise_id)
);

create table if not exists sim_situations (
  partie_id uuid not null references sim_parties (id) on delete cascade,
  entreprise_id text not null,
  numero_tour int not null,
  situation jsonb not null,
  primary key (partie_id, entreprise_id)
);

create table if not exists sim_decisions (
  partie_id uuid not null references sim_parties (id) on delete cascade,
  entreprise_id text not null,
  numero_tour int not null,
  decisions jsonb not null,
  recu_le timestamptz not null default now(),
  primary key (partie_id, entreprise_id, numero_tour)
);

create table if not exists sim_resultats (
  partie_id uuid not null references sim_parties (id) on delete cascade,
  numero_tour int not null,
  -- Tableau à projeter, déjà filtré selon l'option d'affichage de la partie.
  tableau jsonb not null,
  primary key (partie_id, numero_tour)
);

alter table sim_parties enable row level security;
alter table sim_equipes enable row level security;
alter table sim_situations enable row level security;
alter table sim_decisions enable row level security;
alter table sim_resultats enable row level security;

-- L'enseignant gère ses parties et tout ce qui en dépend.
create policy enseignant_parties on sim_parties for all to authenticated
  using (enseignant = auth.uid()) with check (enseignant = auth.uid());
create policy enseignant_equipes on sim_equipes for all to authenticated
  using (exists (select 1 from sim_parties p where p.id = partie_id and p.enseignant = auth.uid()))
  with check (exists (select 1 from sim_parties p where p.id = partie_id and p.enseignant = auth.uid()));
create policy enseignant_situations on sim_situations for all to authenticated
  using (exists (select 1 from sim_parties p where p.id = partie_id and p.enseignant = auth.uid()))
  with check (exists (select 1 from sim_parties p where p.id = partie_id and p.enseignant = auth.uid()));
create policy enseignant_decisions on sim_decisions for all to authenticated
  using (exists (select 1 from sim_parties p where p.id = partie_id and p.enseignant = auth.uid()))
  with check (exists (select 1 from sim_parties p where p.id = partie_id and p.enseignant = auth.uid()));
create policy enseignant_resultats on sim_resultats for all to authenticated
  using (exists (select 1 from sim_parties p where p.id = partie_id and p.enseignant = auth.uid()))
  with check (exists (select 1 from sim_parties p where p.id = partie_id and p.enseignant = auth.uid()));

-- Groupe : vérifie le code de partie et le code d'équipe ; renvoie l'équipe ou rien.
create or replace function sim_equipe(p_code text, p_code_equipe text)
returns table (partie_id uuid, entreprise_id text, numero_tour int)
language sql security definer set search_path = public, extensions stable as $$
  select p.id, e.entreprise_id, p.numero_tour
  from sim_parties p join sim_equipes e on e.partie_id = p.id
  where p.code = upper(p_code) and not p.termine
    and e.code_hash = encode(digest(upper(p_code_equipe), 'sha256'), 'hex');
$$;
revoke all on function sim_equipe(text, text) from public, anon, authenticated;

-- Groupe : sa situation pour le tour en cours.
create or replace function rejoindre_partie(p_code text, p_code_equipe text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare eq record; sit jsonb;
begin
  select * into eq from sim_equipe(p_code, p_code_equipe);
  if not found then raise exception 'Code de partie ou code d''équipe incorrect.' using errcode = 'P0001'; end if;
  select s.situation into sit from sim_situations s
    where s.partie_id = eq.partie_id and s.entreprise_id = eq.entreprise_id and s.numero_tour = eq.numero_tour;
  return jsonb_build_object('entrepriseId', eq.entreprise_id, 'numeroTour', eq.numero_tour, 'situation', sit);
end $$;

-- Groupe : dépose (ou remplace) ses décisions pour le tour en cours.
create or replace function deposer_decisions(p_code text, p_code_equipe text, p_tour int, p_decisions jsonb)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare eq record;
begin
  select * into eq from sim_equipe(p_code, p_code_equipe);
  if not found then raise exception 'Code de partie ou code d''équipe incorrect.' using errcode = 'P0001'; end if;
  if p_tour <> eq.numero_tour then raise exception 'Ce tour est déjà calculé : rechargez votre situation.' using errcode = 'P0001'; end if;
  if octet_length(p_decisions::text) > 4000 then raise exception 'Décisions trop volumineuses.' using errcode = 'P0001'; end if;
  insert into sim_decisions (partie_id, entreprise_id, numero_tour, decisions)
    values (eq.partie_id, eq.entreprise_id, p_tour, p_decisions)
    on conflict (partie_id, entreprise_id, numero_tour) do update set decisions = excluded.decisions, recu_le = now();
end $$;

-- Groupe : dernier tableau des résultats (selon l'option d'affichage de la partie, déjà appliquée par l'enseignant).
create or replace function lire_resultats(p_code text, p_code_equipe text)
returns jsonb language plpgsql security definer set search_path = public, extensions stable as $$
declare eq record; t jsonb;
begin
  select * into eq from sim_equipe(p_code, p_code_equipe);
  if not found then raise exception 'Code de partie ou code d''équipe incorrect.' using errcode = 'P0001'; end if;
  select r.tableau into t from sim_resultats r where r.partie_id = eq.partie_id order by r.numero_tour desc limit 1;
  return t;
end $$;

grant execute on function rejoindre_partie(text, text) to anon, authenticated;
grant execute on function deposer_decisions(text, text, int, jsonb) to anon, authenticated;
grant execute on function lire_resultats(text, text) to anon, authenticated;
