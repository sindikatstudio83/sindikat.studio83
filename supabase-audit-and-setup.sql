-- supabase-audit-and-setup.sql
-- Pokrenuti zadnji, nakon svih ostalih migracija.
-- Idempotentno: sigurno za ponovljeno pokretanje.

create table if not exists public.admin_audit_log (
  id           bigserial primary key,
  admin_id     uuid references auth.users(id) on delete set null,
  action       text not null,
  target_table text,
  target_id    text,
  old_value    jsonb,
  new_value    jsonb,
  note         text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_admin_audit_log_admin
  on public.admin_audit_log (admin_id, created_at desc);

create index if not exists idx_admin_audit_log_action
  on public.admin_audit_log (action, created_at desc);

create index if not exists idx_admin_audit_log_target
  on public.admin_audit_log (target_table, target_id);

alter table public.admin_audit_log enable row level security;

drop policy if exists "audit_admin_read" on public.admin_audit_log;
create policy "audit_admin_read" on public.admin_audit_log
  for select to authenticated
  using (public.is_admin());

drop policy if exists "audit_admin_insert" on public.admin_audit_log;
create policy "audit_admin_insert" on public.admin_audit_log
  for insert to authenticated
  with check (public.is_admin());

create or replace function public.log_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role then
    insert into public.admin_audit_log
      (admin_id, action, target_table, target_id, old_value, new_value)
    values (
      auth.uid(),
      'role_change',
      'profiles',
      new.id::text,
      jsonb_build_object('role', old.role),
      jsonb_build_object('role', new.role)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_role_change on public.profiles;
create trigger trg_log_role_change
  after update of role on public.profiles
  for each row execute function public.log_role_change();

create or replace function public.log_company_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.approved is distinct from new.approved then
    insert into public.admin_audit_log
      (admin_id, action, target_table, target_id, old_value, new_value)
    values (
      auth.uid(),
      case when new.approved then 'company_approved' else 'company_hidden' end,
      'companies',
      new.id::text,
      jsonb_build_object('approved', old.approved, 'name', old.name),
      jsonb_build_object('approved', new.approved, 'name', new.name)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_company_approval on public.companies;
create trigger trg_log_company_approval
  after update of approved on public.companies
  for each row execute function public.log_company_approval();

create or replace function public.log_job_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.admin_audit_log
      (admin_id, action, target_table, target_id, old_value, new_value)
    values (
      auth.uid(),
      'job_status_change',
      'jobs',
      new.id::text,
      jsonb_build_object('status', old.status, 'title', old.title),
      jsonb_build_object('status', new.status, 'title', new.title)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_job_status on public.jobs;
create trigger trg_log_job_status
  after update of status on public.jobs
  for each row execute function public.log_job_status_change();

create or replace function public.admin_read_audit_log(
  p_limit integer default 50,
  p_offset integer default 0,
  p_action text default null,
  p_table text default null
)
returns table (
  id bigint,
  admin_email text,
  action text,
  target_table text,
  target_id text,
  old_value jsonb,
  new_value jsonb,
  note text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'unauthorized';
  end if;

  return query
    select
      l.id,
      u.email as admin_email,
      l.action,
      l.target_table,
      l.target_id,
      l.old_value,
      l.new_value,
      l.note,
      l.created_at
    from public.admin_audit_log l
    left join auth.users u on u.id = l.admin_id
    where (p_action is null or l.action = p_action)
      and (p_table is null or l.target_table = p_table)
    order by l.created_at desc
    limit p_limit
    offset p_offset;
end;
$$;

select 'supabase-audit-and-setup.sql: OK' as migration_status;
