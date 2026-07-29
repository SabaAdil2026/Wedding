-- ============================================================================
-- SABA AND ADIL'S WEDDING PLANNER — Core Schema
-- Run this in Supabase SQL Editor (or via `supabase db push`)
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- ENUM TYPES
-- ----------------------------------------------------------------------------
create type user_role as enum ('admin', 'family', 'volunteer');
create type task_priority as enum ('Critical', 'High', 'Medium', 'Low');
create type task_status as enum ('Not Started', 'In Progress', 'Waiting', 'Blocked', 'Completed', 'Cancelled');
create type guest_side as enum ('Bride', 'Groom', 'Both');
create type guest_group as enum ('Family', 'Friends', 'VIP');
create type rsvp_status as enum ('Pending', 'Confirmed', 'Declined');
create type booking_status as enum ('Not Booked', 'Enquired', 'Negotiating', 'Booked', 'Confirmed', 'Cancelled');
create type booking_category as enum (
  'Makeup Artist','Wedding Clothes','Decoration','Veg Food Catering','Non Veg Food Catering',
  'Photographer','Videographer','Mehendi Artist','DJ / Sound','Lighting','Transportation',
  'Venue','Invitation Cards Printing','Accommodation / Guest Hotel','Others'
);

-- ----------------------------------------------------------------------------
-- PROFILES (extends auth.users)
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  phone text,
  role user_role not null default 'volunteer',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- EVENTS (dynamic workspaces: Sangeet, Haldi, Nikah, Reception, custom...)
-- ----------------------------------------------------------------------------
create table events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  event_date date,
  color_theme text not null default 'sangeet', -- sangeet | haldi | nikah | reception | custom
  description text,
  is_archived boolean not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  sort_order int not null default 0
);

-- ----------------------------------------------------------------------------
-- TASKS
-- ----------------------------------------------------------------------------
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  name text not null,
  description text,
  category text,
  priority task_priority not null default 'Medium',
  status task_status not null default 'Not Started',
  due_date date,
  completion int not null default 0 check (completion between 0 and 100),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table task_assignees (
  task_id uuid references tasks(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  primary key (task_id, profile_id)
);

create table task_checklist_items (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  label text not null,
  is_done boolean not null default false,
  sort_order int not null default 0
);

create table task_comments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  author_id uuid references profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- SHOPPING LIST
-- ----------------------------------------------------------------------------
create table shopping_items (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  name text not null,
  category text not null, -- Clothes, Jewelry, Decorations, Flowers, Food, Return Gifts, Wedding Cards, Stage, Lighting, Other
  quantity int not null default 1,
  budget numeric(12,2) not null default 0,
  actual_price numeric(12,2),
  store text,
  is_purchased boolean not null default false,
  assigned_to uuid references profiles(id),
  receipt_url text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- BUDGET
-- ----------------------------------------------------------------------------
create table budget_categories (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  name text not null,
  planned_amount numeric(12,2) not null default 0
);

create table budget_expenses (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references budget_categories(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  vendor_name text,
  description text,
  amount numeric(12,2) not null default 0,
  is_advance boolean not null default false,
  paid_on date default current_date,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- GUESTS
-- ----------------------------------------------------------------------------
create table guests (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text,
  side guest_side not null default 'Both',
  guest_group guest_group not null default 'Family',
  rsvp_status rsvp_status not null default 'Pending',
  invitation_sent boolean not null default false,
  plus_ones int not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- VENDORS (general contact directory)
-- ----------------------------------------------------------------------------
create table vendors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  category text not null,
  advance_paid numeric(12,2) not null default 0,
  balance numeric(12,2) not null default 0,
  rating int check (rating between 1 and 5),
  notes text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CRITICAL BOOKING TRACKER
-- ----------------------------------------------------------------------------
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  category booking_category not null,
  custom_category_name text, -- used when category = 'Others'
  vendor_name text,
  status booking_status not null default 'Not Booked',
  booking_date date,
  contract_signed boolean not null default false,
  advance_paid numeric(12,2) not null default 0,
  balance_due numeric(12,2) not null default 0,
  final_payment_due_date date,
  contact_person text,
  contact_phone text,
  trial_scheduled_date timestamptz,
  fitting_dates timestamptz[],
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lead-time reference table (days before wedding each category should ideally be booked by)
create table booking_lead_times (
  category booking_category primary key,
  ideal_lead_days int not null
);

insert into booking_lead_times (category, ideal_lead_days) values
  ('Venue', 270),
  ('Non Veg Food Catering', 270),
  ('Veg Food Catering', 270),
  ('Decoration', 180),
  ('Photographer', 180),
  ('Videographer', 180),
  ('DJ / Sound', 150),
  ('Accommodation / Guest Hotel', 150),
  ('Transportation', 120),
  ('Makeup Artist', 120),
  ('Wedding Clothes', 120),
  ('Mehendi Artist', 90),
  ('Invitation Cards Printing', 90),
  ('Lighting', 90),
  ('Others', 60);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS & ACTIVITY LOG
-- ----------------------------------------------------------------------------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table activity_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);

create table quick_notes (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  author_id uuid references profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- TRIGGERS: auto-create profile on signup, auto-update timestamps, activity log
-- ============================================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 'volunteer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_set_updated_at before update on tasks
  for each row execute procedure set_updated_at();
create trigger bookings_set_updated_at before update on bookings
  for each row execute procedure set_updated_at();

-- Notify assignees on task assignment
create or replace function notify_task_assignment()
returns trigger as $$
begin
  insert into notifications (profile_id, title, body, link)
  select new.profile_id, 'New Task Assigned',
    (select name from tasks where id = new.task_id),
    '/tasks?task=' || new.task_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_task_assigned after insert on task_assignees
  for each row execute procedure notify_task_assignment();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table profiles enable row level security;
alter table events enable row level security;
alter table tasks enable row level security;
alter table task_assignees enable row level security;
alter table task_checklist_items enable row level security;
alter table task_comments enable row level security;
alter table shopping_items enable row level security;
alter table budget_categories enable row level security;
alter table budget_expenses enable row level security;
alter table guests enable row level security;
alter table vendors enable row level security;
alter table bookings enable row level security;
alter table booking_lead_times enable row level security;
alter table notifications enable row level security;
alter table activity_log enable row level security;
alter table quick_notes enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

-- Everyone authenticated can READ almost everything (it's a small shared family planner)
create policy "read profiles" on profiles for select using (auth.role() = 'authenticated');
create policy "update own profile" on profiles for update using (auth.uid() = id);
create policy "admin manage profiles" on profiles for all using (is_admin());

create policy "read events" on events for select using (auth.role() = 'authenticated');
create policy "admin manage events" on events for all using (is_admin()) with check (is_admin());

create policy "read tasks" on tasks for select using (auth.role() = 'authenticated');
create policy "admin manage tasks" on tasks for all using (is_admin()) with check (is_admin());
create policy "assignee update own task" on tasks for update using (
  is_admin() or exists (select 1 from task_assignees ta where ta.task_id = tasks.id and ta.profile_id = auth.uid())
);

create policy "read task_assignees" on task_assignees for select using (auth.role() = 'authenticated');
create policy "admin manage task_assignees" on task_assignees for all using (is_admin()) with check (is_admin());

create policy "read checklist" on task_checklist_items for select using (auth.role() = 'authenticated');
create policy "manage own task checklist" on task_checklist_items for all using (
  is_admin() or exists (select 1 from task_assignees ta where ta.task_id = task_checklist_items.task_id and ta.profile_id = auth.uid())
);

create policy "read comments" on task_comments for select using (auth.role() = 'authenticated');
create policy "insert own comments" on task_comments for insert with check (auth.uid() = author_id);
create policy "admin manage comments" on task_comments for all using (is_admin());

create policy "read shopping" on shopping_items for select using (auth.role() = 'authenticated');
create policy "admin manage shopping" on shopping_items for all using (is_admin()) with check (is_admin());
create policy "assignee update shopping item" on shopping_items for update using (
  is_admin() or assigned_to = auth.uid()
);

create policy "read budget_categories" on budget_categories for select using (auth.role() = 'authenticated');
create policy "admin manage budget_categories" on budget_categories for all using (is_admin()) with check (is_admin());

create policy "read budget_expenses" on budget_expenses for select using (auth.role() = 'authenticated');
create policy "admin manage budget_expenses" on budget_expenses for all using (is_admin()) with check (is_admin());

create policy "read guests" on guests for select using (auth.role() = 'authenticated');
create policy "admin manage guests" on guests for all using (is_admin()) with check (is_admin());

create policy "read vendors" on vendors for select using (auth.role() = 'authenticated');
create policy "admin manage vendors" on vendors for all using (is_admin()) with check (is_admin());

create policy "read bookings" on bookings for select using (auth.role() = 'authenticated');
create policy "admin manage bookings" on bookings for all using (is_admin()) with check (is_admin());

create policy "read lead times" on booking_lead_times for select using (auth.role() = 'authenticated');
create policy "admin manage lead times" on booking_lead_times for all using (is_admin());

create policy "read own notifications" on notifications for select using (profile_id = auth.uid());
create policy "update own notifications" on notifications for update using (profile_id = auth.uid());
create policy "system insert notifications" on notifications for insert with check (true);

create policy "read activity log" on activity_log for select using (auth.role() = 'authenticated');
create policy "insert activity log" on activity_log for insert with check (auth.uid() = actor_id);

create policy "read quick notes" on quick_notes for select using (auth.role() = 'authenticated');
create policy "insert own quick notes" on quick_notes for insert with check (auth.uid() = author_id);
create policy "admin manage quick notes" on quick_notes for all using (is_admin());

-- ============================================================================
-- REALTIME: enable replication on key tables
-- ============================================================================
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table shopping_items;
alter publication supabase_realtime add table budget_expenses;
alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table guests;
alter publication supabase_realtime add table activity_log;

-- ============================================================================
-- STORAGE BUCKETS (run once — safe if already exists)
-- ============================================================================
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('files', 'files', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "authenticated read receipts" on storage.objects for select
  using (bucket_id = 'receipts' and auth.role() = 'authenticated');
create policy "authenticated upload receipts" on storage.objects for insert
  with check (bucket_id = 'receipts' and auth.role() = 'authenticated');

create policy "authenticated read files" on storage.objects for select
  using (bucket_id = 'files' and auth.role() = 'authenticated');
create policy "authenticated upload files" on storage.objects for insert
  with check (bucket_id = 'files' and auth.role() = 'authenticated');

create policy "authenticated read avatars" on storage.objects for select
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "authenticated upload own avatar" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
