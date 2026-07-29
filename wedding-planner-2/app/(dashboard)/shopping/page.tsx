import { createClient } from '@/lib/supabase/server';
import { ShoppingListView } from '@/components/shopping/shopping-list-view';

export default async function ShoppingPage() {
  const supabase = createClient();
  const [{ data: items }, { data: profiles }] = await Promise.all([
    supabase.from('shopping_items').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*'),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Shopping Planner</h1>
        <p className="text-sm text-muted-foreground">Across all wedding events</p>
      </div>
      <ShoppingListView initialItems={items ?? []} profiles={profiles ?? []} />
    </div>
  );
}
