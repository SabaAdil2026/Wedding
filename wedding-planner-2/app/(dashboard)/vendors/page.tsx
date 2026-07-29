import { createClient } from '@/lib/supabase/server';
import { VendorsView } from '@/components/vendors/vendors-view';

export default async function VendorsPage() {
  const supabase = createClient();
  const { data: vendors } = await supabase.from('vendors').select('*').order('name');
  return <VendorsView initialVendors={vendors ?? []} />;
}
