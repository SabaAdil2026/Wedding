import { createClient } from '@/lib/supabase/server';
import { BookingsView } from '@/components/bookings/bookings-view';

export default async function BookingsPage() {
  const supabase = createClient();
  const [{ data: bookings }, { data: events }] = await Promise.all([
    supabase.from('bookings').select('*').order('category'),
    supabase.from('events').select('*').eq('is_archived', false).order('sort_order'),
  ]);

  return <BookingsView initialBookings={bookings ?? []} events={events ?? []} />;
}
