// Optional helper script: promotes a user to admin by email using the
// service role key. Run with: node scripts/seed.mjs you@example.com
//
// Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in your
// environment (e.g. `export $(cat .env.local | xargs)` before running).

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2];

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}
if (!email) {
  console.error('Usage: node scripts/seed.mjs you@example.com');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
if (userErr) { console.error(userErr); process.exit(1); }

const user = users.users.find((u) => u.email === email);
if (!user) {
  console.error(`No user found with email ${email}. Sign up in the app first, then re-run this script.`);
  process.exit(1);
}

const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
if (error) { console.error(error); process.exit(1); }

console.log(`✅ ${email} is now an admin.`);
