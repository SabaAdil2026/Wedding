import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('is_archived', false)
    .order('sort_order');

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar profile={profile} events={events ?? []} />
      <div className="flex flex-1 flex-col lg:pl-72">
        <Topbar profile={profile} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
