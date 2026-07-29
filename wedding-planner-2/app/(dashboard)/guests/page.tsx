import { createClient } from '@/lib/supabase/server';
import { GuestsView } from '@/components/guests/guests-view';

export default async function GuestsPage() {
  const supabase = createClient();
  const { data: guests } = await supabase.from('guests').select('*').order('full_name');
  return <GuestsView initialGuests={guests ?? []} />;
}
