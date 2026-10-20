-- Applied to SSS_Brain (zmiikssbwzkukfqqxjew) on 2026-10-20 as migration paycheck_salary_submissions.
-- Kept here as the record; paycheck-ingest (supabase/functions/paycheck-ingest) is deployed to SSS_Brain, not this app's project.
create table if not exists public.salary_submissions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitter_hash text not null,               -- salted hash of the email so one person counts once per bracket; never the email
  department text not null,
  position text not null,
  yacht_size text not null,
  yacht_type text,
  monthly_eur integer not null check (monthly_eur between 500 and 60000),
  band_low_eur integer,
  band_high_eur integer,
  pay_position text check (pay_position in ('below','inside','above')),
  source text not null default 'paycheck',
  unique (submitter_hash, position, yacht_size)
);
comment on table public.salary_submissions is 'Pay shared on the salary calculator pay check (paycheck-ingest). No names or emails. Shown back only as bracket stats once 5+ crew have shared.';
alter table public.salary_submissions enable row level security;   -- no policies: service role only
revoke all on public.salary_submissions from anon, authenticated;
create index if not exists salary_submissions_bracket on public.salary_submissions (position, yacht_size);

create or replace function public.paycheck_bracket_stats(p_position text, p_yacht_size text)
returns jsonb language sql stable security definer set search_path = public as $$
  select case when count(*) >= 5 then jsonb_build_object(
      'n', count(*),
      'p25', round(percentile_cont(0.25) within group (order by monthly_eur) / 50) * 50,
      'median', round(percentile_cont(0.5) within group (order by monthly_eur) / 50) * 50,
      'p75', round(percentile_cont(0.75) within group (order by monthly_eur) / 50) * 50)
    else jsonb_build_object('n', count(*)) end
  from salary_submissions
  where position = p_position and yacht_size = p_yacht_size and updated_at > now() - interval '24 months';
$$;
revoke execute on function public.paycheck_bracket_stats(text, text) from public, anon, authenticated;
grant execute on function public.paycheck_bracket_stats(text, text) to service_role;
