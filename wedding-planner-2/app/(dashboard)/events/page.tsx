import { createClient } from '@/lib/supabase/server';
import { EventsManager } from '@/components/events/events-manager';

export default async function EventsPage() {
  const supabase = createClient();
  const { data: events } = await supabase.from('events').select('*').order('sort_order');
  return <EventsManager initialEvents={events ?? []} />;
}
