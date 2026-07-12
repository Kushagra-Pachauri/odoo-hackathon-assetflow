create type asset_status as enum ('available','allocated','reserved','under_maintenance','lost','retired','disposed');
create type user_role as enum ('employee','department_head','asset_manager','admin');

create table departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_department_id uuid references departments(id),
  head_employee_id uuid,
  status text default 'active'
);

create table employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  department_id uuid references departments(id),
  role user_role default 'employee',
  status text default 'active'
);
alter table departments add constraint fk_head foreign key (head_employee_id) references employees(id);

create table asset_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  custom_fields jsonb default '{}'
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  asset_tag text unique not null,
  name text not null,
  category_id uuid references asset_categories(id),
  serial_number text,
  acquisition_date date,
  acquisition_cost numeric,
  condition text,
  location text,
  is_bookable boolean default false,
  status asset_status default 'available',
  photo_url text
);

create table allocations (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id),
  employee_id uuid references employees(id),
  department_id uuid references departments(id),
  allocated_at timestamptz default now(),
  expected_return_date date,
  actual_return_date date,
  return_condition_notes text,
  status text default 'active'
);
create unique index one_active_allocation_per_asset on allocations (asset_id) where status = 'active';

create table transfer_requests (
  id uuid primary key default gen_random_uuid(),
  allocation_id uuid references allocations(id),
  requested_to_employee_id uuid references employees(id),
  requested_by uuid references employees(id),
  approved_by uuid references employees(id),
  status text default 'requested',
  created_at timestamptz default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id),
  booked_by uuid references employees(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text default 'upcoming',
  purpose text
);
create extension if not exists btree_gist;
alter table bookings add constraint no_overlapping_bookings
  exclude using gist (asset_id with =, tstzrange(starts_at, ends_at) with &&)
  where (status != 'cancelled');

create table maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id),
  raised_by uuid references employees(id),
  issue_description text,
  priority text,
  photo_url text,
  status text default 'pending',
  approved_by uuid references employees(id),
  technician text,
  resolved_at timestamptz
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  type text, message text,
  related_entity_type text, related_entity_id uuid,
  read boolean default false, created_at timestamptz default now()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);