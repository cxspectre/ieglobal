import { createClient } from '@supabase/supabase-js';
import { getCaseStudies as getMdxCaseStudies, getCaseStudy as getMdxCaseStudy } from '@/lib/mdx';
import { marked } from 'marked';

export type CaseStudyDisplay = {
  slug: string;
  title: string;
  summary: string;
  client: string;
  industry: string;
  services: string[];
  challenge: string;
  outcome: string;
  metrics?: string[];
  coverImage?: string;
  date: string;
  featured: boolean;
  content: string;
};

async function getDbCaseStudies(): Promise<CaseStudyDisplay[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .is('project_id', null)
    .order('case_date', { ascending: false });

  if (error || !data) return [];

  return data.map((row: Record<string, unknown>) => ({
    slug: String(row.slug),
    title: String(row.title),
    summary: String(row.summary || ''),
    client: String(row.client || ''),
    industry: String(row.industry || ''),
    services: Array.isArray(row.services) ? (row.services as string[]) : [],
    challenge: String(row.challenge || ''),
    outcome: String(row.outcome || ''),
    metrics: Array.isArray(row.metrics) ? (row.metrics as string[]) : [],
    coverImage: row.cover_image_url ? String(row.cover_image_url) : undefined,
    date: String(row.case_date || row.created_at),
    featured: Boolean(row.featured),
    content: String(row.case_content || ''),
  }));
}

async function getDbCaseStudy(slug: string): Promise<CaseStudyDisplay | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('slug', slug)
    .is('project_id', null)
    .single();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  const rawContent = String(row.case_content || '');
  const htmlContent = rawContent ? marked(rawContent) as string : '';

  return {
    slug: String(row.slug),
    title: String(row.title),
    summary: String(row.summary || ''),
    client: String(row.client || ''),
    industry: String(row.industry || ''),
    services: Array.isArray(row.services) ? (row.services as string[]) : [],
    challenge: String(row.challenge || ''),
    outcome: String(row.outcome || ''),
    metrics: Array.isArray(row.metrics) ? (row.metrics as string[]) : [],
    coverImage: row.cover_image_url ? String(row.cover_image_url) : undefined,
    date: String(row.case_date || row.created_at),
    featured: Boolean(row.featured),
    content: htmlContent,
  };
}

export async function getAllCaseStudies(): Promise<CaseStudyDisplay[]> {
  const [dbStudies, mdxStudies] = await Promise.all([
    getDbCaseStudies(),
    Promise.resolve(getMdxCaseStudies()),
  ]);
  const dbSlugs = new Set(dbStudies.map((s) => s.slug));
  const mdxOnly = mdxStudies
    .filter((m) => !dbSlugs.has(m.slug))
    .map((m) => ({
      ...m,
      coverImage: m.coverImage,
      outcome: m.outcome || '',
      content: m.content,
    }));
  const combined = [...dbStudies, ...mdxOnly];
  return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudyDisplay | null> {
  const dbStudy = await getDbCaseStudy(slug);
  if (dbStudy) return dbStudy;
  const mdxStudy = getMdxCaseStudy(slug);
  if (mdxStudy) {
    const htmlContent = mdxStudy.content || '';
    return {
      ...mdxStudy,
      outcome: mdxStudy.outcome || '',
      content: htmlContent,
      coverImage: mdxStudy.coverImage,
    };
  }
  return null;
}
