create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  ip inet,
  user_agent text,
  is_spam boolean not null default false,
  spam_reasons text[] not null default '{}'::text[],
  delivery_status text not null default 'not_sent',
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint contact_messages_delivery_status_check
    check (delivery_status in ('not_sent', 'blocked', 'sent', 'failed'))
);

create index if not exists idx_contact_messages_created_at
  on public.contact_messages (created_at desc);

create index if not exists idx_contact_messages_email_created_at
  on public.contact_messages (email, created_at desc);

create index if not exists idx_contact_messages_ip_created_at
  on public.contact_messages (ip, created_at desc);
