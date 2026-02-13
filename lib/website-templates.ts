import { createServerSupabaseClient } from './supabase/server';

export type WebsiteTemplate = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  template_url: string;
  thumbnail_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export async function getPublishedTemplates(): Promise<WebsiteTemplate[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await (supabase as any)
    .from('website_templates')
    .select('id, name, description, category, template_url, thumbnail_url, sort_order')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching website templates:', error);
    return [];
  }
  return data ?? [];
}
