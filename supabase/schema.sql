-- PanelCert database schema.
-- Run this against a fresh Supabase (Postgres) project. See README.md for setup.

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  lemonsqueezy_order_id text not null unique,
  customer_id uuid not null references customers(id),
  product_slug text not null,
  tier_slug text not null,
  amount_total_cents integer not null,
  currency text not null default 'USD',
  status text not null check (status in ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists downloads (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  file_key text not null,
  download_count integer not null default 0,
  last_downloaded_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_customer_id on orders(customer_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_downloads_order_id on downloads(order_id);

-- Row-level security: the app only ever talks to this schema via the
-- service role key from server-side code, so RLS stays enabled with no
-- public policies — direct client access is denied by default.
alter table customers enable row level security;
alter table orders enable row level security;
alter table downloads enable row level security;
