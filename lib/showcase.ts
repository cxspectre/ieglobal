import { tryCreatePublicSupabaseClient } from '@/lib/supabase/factory';

export type ShowcaseItem = {
  id: string;
  sort_order: number;
  project_url: string;
  description: string | null;
  industry_type: string;
  created_at: string;
  updated_at: string;
};

/** Fetch all showcase items for the public page (ordered by sort_order 1–6). */
export async function getShowcaseItems(): Promise<ShowcaseItem[]> {
  const supabase = tryCreatePublicSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('showcase')
    .select('id, sort_order, project_url, description, industry_type, created_at, updated_at')
    .order('sort_order', { ascending: true });

  if (error) return [];
  return (data ?? []) as ShowcaseItem[];
}
