import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase/client';
import { normalizeStorageUrl, normalizeStorageUrls } from './supabase/storage-url';

/** Anon-key client for template reads; null when Supabase env vars are absent (e.g. during build). */
function getTemplatesSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient<Database>(url, anonKey);
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

/** Rewrites image URLs stored under a retired storage host so they resolve today. */
function withCurrentStorageHost(template: WebsiteTemplate): WebsiteTemplate {
  return {
    ...template,
    thumbnail_url: normalizeStorageUrl(template.thumbnail_url),
    gallery_urls: normalizeStorageUrls(template.gallery_urls),
  };
}

export async function getPublishedTemplates(): Promise<WebsiteTemplate[]> {
  const supabase = getTemplatesSupabase();
  if (!supabase) return [];
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
  return (data ?? []).map(withCurrentStorageHost);
}

export async function getTemplateBySlug(slug: string): Promise<WebsiteTemplate | null> {
  const supabase = getTemplatesSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('website_templates')
    .select('id, name, slug, description, category, template_url, thumbnail_url, gallery_urls, long_description, features, author, page_names, sort_order, created_at')
    .eq('published', true)
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return withCurrentStorageHost(data);
}
