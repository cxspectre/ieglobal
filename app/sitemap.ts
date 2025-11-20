import { MetadataRoute } from 'next';
import { getCaseStudies } from '@/lib/mdx';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ie-global.net';
  const caseStudies = getCaseStudies();

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/approach',
    '/services',
    '/case-studies',
    '/careers',
    '/contact',
    '/privacy',
    '/terms',
    '/imprint',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Case study pages
  const caseStudyPages = caseStudies.map((study) => ({
    url: `${baseUrl}/case-studies/${study.slug}`,
    lastModified: new Date(study.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...caseStudyPages];
}

