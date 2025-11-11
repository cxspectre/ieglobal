import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

export type CaseStudy = {
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

export type Insight = {
  slug: string;
  title: string;
  summary: string;
  category: 'AI & Data' | 'Customer Experience' | 'Pricing & GTM' | 'Operating Model' | 'Engineering';
  tags?: string[];
  author: string;
  date: string;
  readingTime?: number;
  coverImage?: string;
  featured: boolean;
  content: string;
};

export function getCaseStudies(): CaseStudy[] {
  const caseStudiesDir = path.join(contentDirectory, 'case-studies');
  
  if (!fs.existsSync(caseStudiesDir)) {
    return [];
  }

  const files = fs.readdirSync(caseStudiesDir);
  const caseStudies = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '');
      const fullPath = path.join(caseStudiesDir, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        summary: data.summary,
        client: data.client,
        industry: data.industry,
        services: data.services || [],
        challenge: data.challenge,
        outcome: data.outcome,
        metrics: data.metrics,
        coverImage: data.coverImage,
        date: data.date,
        featured: data.featured || false,
        content,
      };
    });

  return caseStudies.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getCaseStudy(slug: string): CaseStudy | null {
  try {
    const fullPath = path.join(contentDirectory, 'case-studies', `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      summary: data.summary,
      client: data.client,
      industry: data.industry,
      services: data.services || [],
      challenge: data.challenge,
      outcome: data.outcome,
      metrics: data.metrics,
      coverImage: data.coverImage,
      date: data.date,
      featured: data.featured || false,
      content,
    };
  } catch {
    return null;
  }
}

export function getInsights(): Insight[] {
  const insightsDir = path.join(contentDirectory, 'insights');
  
  if (!fs.existsSync(insightsDir)) {
    return [];
  }

  const files = fs.readdirSync(insightsDir);
  const insights = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '');
      const fullPath = path.join(insightsDir, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        summary: data.summary,
        category: data.category,
        tags: data.tags || [],
        author: data.author,
        date: data.date,
        readingTime: data.readingTime,
        coverImage: data.coverImage,
        featured: data.featured || false,
        content,
      };
    });

  return insights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getInsight(slug: string): Insight | null {
  try {
    const fullPath = path.join(contentDirectory, 'insights', `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      summary: data.summary,
      category: data.category,
      tags: data.tags || [],
      author: data.author,
      date: data.date,
      readingTime: data.readingTime,
      coverImage: data.coverImage,
      featured: data.featured || false,
      content,
    };
  } catch {
    return null;
  }
}

