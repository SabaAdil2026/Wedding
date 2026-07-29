-- ============================================================================
-- SEED DATA — run AFTER 001_init.sql and after you've created your first
-- admin user through the app's sign-up screen. Replace the admin email below.
-- ============================================================================

-- 1. Promote your first user to admin (run this after you sign up once):
-- update profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');

-- 2. Default wedding events
insert into events (name, slug, event_date, color_theme, sort_order) values
  ('Haldi', 'haldi', '2026-11-13', 'haldi', 1),
  ('Sangeet', 'sangeet', '2026-11-14', 'sangeet', 2),
  ('Nikah', 'nikah', '2026-11-16', 'nikah', 3),
  ('Reception', 'reception', '2026-11-17', 'reception', 4)
on conflict (slug) do nothing;

-- 3. Default budget categories per event
insert into budget_categories (event_id, name, planned_amount)
select e.id, cat.name, 0
from events e
cross join (values ('Venue'),('Catering'),('Decor'),('Attire'),('Photography'),('Misc')) as cat(name)
on conflict do nothing;

-- 4. Seed one booking row per required category, per relevant event (Nikah as default event)
insert into bookings (event_id, category, status)
select (select id from events where slug = 'nikah'), cat, 'Not Booked'
from unnest(enum_range(null::booking_category)) as cat
on conflict do nothing;

-- 5. Default shopping categories are just free-text on insert from the app —
--    no seed rows needed, but here are a few starter examples:
insert into shopping_items (event_id, name, category, quantity, budget)
select (select id from events where slug = 'nikah'), item.name, item.category, 1, item.budget
from (values
  ('Bridal Lehenga', 'Clothes', 150000),
  ('Groom Sherwani', 'Clothes', 80000),
  ('Wedding Cards (500 pcs)', 'Wedding Cards', 40000),
  ('Stage Flowers', 'Flowers', 60000)
) as item(name, category, budget)
on conflict do nothing;
