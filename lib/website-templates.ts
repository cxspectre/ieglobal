import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase/client';

function getTemplatesSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type WebsiteTemplate = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  category: string;
  template_url: string;
  thumbnail_url: string | null;
  gallery_urls: string[] | null;
  long_description: string | null;
  features: string[] | null;
  author: string | null;
  page_names: string[] | null;
  sort_order: number;
  published: boolean;
  created_at?: string;
};

export async function getPublishedTemplates(): Promise<WebsiteTemplate[]> {
  const supabase = getTemplatesSupabase();
  const { data, error } = await supabase
    .from('website_templates')
    .select('id, name, slug, description, category, template_url, thumbnail_url, gallery_urls, long_description, features, author, page_names, sort_order, created_at')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching website templates:', error);
    return [];
  }
  return data ?? [];
}

export async function getTemplateBySlug(slug: string): Promise<WebsiteTemplate | null> {
  const supabase = getTemplatesSupabase();
  const { data, error } = await supabase
    .from('website_templates')
    .select('id, name, slug, description, category, template_url, thumbnail_url, gallery_urls, long_description, features, author, page_names, sort_order, created_at')
    .eq('published', true)
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}
