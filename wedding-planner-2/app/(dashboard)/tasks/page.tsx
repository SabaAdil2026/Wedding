import { createClient } from '@/lib/supabase/server';
import { TasksView } from '@/components/tasks/tasks-view';

export default async function TasksPage() {
  const supabase = createClient();
  const [{ data: tasks }, { data: events }, { data: profiles }] = await Promise.all([
    supabase.from('tasks').select('*, task_assignees(profile_id)').order('due_date'),
    supabase.from('events').select('*').eq('is_archived', false).order('sort_order'),
    supabase.from('profiles').select('*'),
  ]);

  return <TasksView initialTasks={tasks ?? []} events={events ?? []} profiles={profiles ?? []} />;
}
