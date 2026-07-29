import { createClient } from '@/lib/supabase/server';
import { BudgetView } from '@/components/budget/budget-view';

export default async function BudgetPage() {
  const supabase = createClient();
  const [{ data: categories }, { data: expenses }] = await Promise.all([
    supabase.from('budget_categories').select('*'),
    supabase.from('budget_expenses').select('*').order('paid_on', { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Budget Management</h1>
        <p className="text-sm text-muted-foreground">Across all wedding events</p>
      </div>
      <BudgetView categories={categories ?? []} expenses={expenses ?? []} />
    </div>
  );
}
