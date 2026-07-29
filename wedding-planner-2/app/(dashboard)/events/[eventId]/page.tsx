import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EventHub } from '@/components/events/event-hub';

export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  const supabase = createClient();
  const { data: event } = await supabase.from('events').select('*').eq('id', params.eventId).single();
  if (!event) notFound();

  const [{ data: tasks }, { data: shopping }, { data: budgetCategories }, { data: budgetExpenses }, { data: profiles }, { data: notes }] = await Promise.all([
    supabase.from('tasks').select('*, task_assignees(profile_id)').eq('event_id', event.id).order('due_date'),
    supabase.from('shopping_items').select('*').eq('event_id', event.id),
    supabase.from('budget_categories').select('*').eq('event_id', event.id),
    supabase.from('budget_expenses').select('*').eq('event_id', event.id),
    supabase.from('profiles').select('*'),
    supabase.from('quick_notes').select('*, profiles(full_name)').eq('event_id', event.id).order('created_at', { ascending: false }),
  ]);
  const { data: events } = await supabase.from('events').select('*').eq('is_archived', false);

  return (
    <EventHub
      event={event}
      tasks={tasks ?? []}
      shopping={shopping ?? []}
      budgetCategories={budgetCategories ?? []}
      budgetExpenses={budgetExpenses ?? []}
      profiles={profiles ?? []}
      notes={notes ?? []}
      events={events ?? []}
    />
  );
}
