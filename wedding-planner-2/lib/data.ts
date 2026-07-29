import { createClient } from '@/lib/supabase/server';
import { getTaskUrgency, getBookingUrgency } from '@/lib/utils';

export async function getDashboardData() {
  const supabase = createClient();

  const [
    { data: tasks },
    { data: events },
    { data: shopping },
    { data: bookings },
    { data: budgetExpenses },
    { data: budgetCategories },
    { data: activity },
  ] = await Promise.all([
    supabase.from('tasks').select('*, task_assignees(profile_id)').order('due_date', { ascending: true }),
    supabase.from('events').select('*').eq('is_archived', false).order('sort_order'),
    supabase.from('shopping_items').select('*'),
    supabase.from('bookings').select('*'),
    supabase.from('budget_expenses').select('*'),
    supabase.from('budget_categories').select('*'),
    supabase.from('activity_log').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(8),
  ]);

  const allTasks = tasks ?? [];
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === 'Completed').length;
  const overallCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const urgentTasks = allTasks
    .filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled')
    .map((t) => ({ ...t, urgency: getTaskUrgency(t.due_date, t.status) }))
    .filter((t) => t.urgency === 'critical' || t.urgency === 'urgent')
    .slice(0, 8);

  const todaysTasks = allTasks.filter((t) => t.due_date === todayStr);

  const upcomingDeadlines = allTasks
    .filter((t) => t.due_date && t.due_date > todayStr && t.status !== 'Completed')
    .slice(0, 6);

  const totalBudget = (budgetCategories ?? []).reduce((sum, c) => sum + Number(c.planned_amount), 0);
  const totalSpent = (budgetExpenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0);

  const purchasedItems = (shopping ?? []).filter((s) => s.is_purchased).length;
  const totalShoppingItems = (shopping ?? []).length;

  const allBookings = bookings ?? [];
  const confirmedBookings = allBookings.filter((b) => b.status === 'Booked' || b.status === 'Confirmed').length;
  const overdueBookings = allBookings.filter((b) => {
    const u = getBookingUrgency(b.category, b.status, today);
    return u.isOverdue;
  });

  const eventsWithProgress = (events ?? []).map((event) => {
    const eventTasks = allTasks.filter((t) => t.event_id === event.id);
    const done = eventTasks.filter((t) => t.status === 'Completed').length;
    const pct = eventTasks.length > 0 ? Math.round((done / eventTasks.length) * 100) : 0;
    return { ...event, taskCount: eventTasks.length, completion: pct };
  });

  return {
    overallCompletion,
    totalTasks,
    completedTasks,
    urgentTasks,
    todaysTasks,
    upcomingDeadlines,
    totalBudget,
    totalSpent,
    purchasedItems,
    totalShoppingItems,
    totalBookings: allBookings.length,
    confirmedBookings,
    overdueBookings,
    eventsWithProgress,
    activity: activity ?? [],
  };
}
