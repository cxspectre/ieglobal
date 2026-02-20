import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getTemplateBySlug, getPublishedTemplates } from '@/lib/website-templates';
import { marked } from 'marked';
import { TemplateDetailContent } from './TemplateDetailContent';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// Revalidate so new templates and updates appear
export const revalidate = 60;

export async function generateStaticParams() {
  const templates = await getPublishedTemplates();
  return templates
    .filter((t) => t.slug)
    .map((t) => ({ slug: t.slug! }));
}

const BASE = 'https://ie-global.net';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);

  if (!template) {
    return { title: 'Template Not Found' };
  }

  const title = `${template.name} – Website Template | IE Global`;
  const description =
    template.description ??
    `${template.name} – responsive website template. ${template.category} design. Explore and use this template for your next project.`;

  return {
    title,
    description,
    keywords: [
      template.name,
      'website template',
      template.category,
      'responsive template',
      'free website template',
    ].filter(Boolean),
    openGraph: {
      title: `${template.name} – IE Global Templates`,
      description,
      url: `${BASE}/templates/${slug}`,
      siteName: 'IE Global',
      type: 'website',
      images: template.thumbnail_url
        ? [{ url: template.thumbnail_url, width: 1200, height: 630, alt: template.name }]
        : undefined,
    },
    alternates: { canonical: `${BASE}/templates/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  const allImages: string[] = [];
  if (template.thumbnail_url) allImages.push(template.thumbnail_url);
  if (Array.isArray(template.gallery_urls)) allImages.push(...template.gallery_urls);

  const longDescriptionHtml = template.long_description
    ? marked(template.long_description, { gfm: true }) as string
    : null;

  const features = Array.isArray(template.features) ? template.features : [];
  const pageNames = Array.isArray(template.page_names) ? template.page_names : [];

  const creativeWorkJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: template.name,
    description: template.description ?? `${template.name} website template – ${template.category}.`,
    url: `${BASE}/templates/${slug}`,
    image: template.thumbnail_url ?? undefined,
    author: template.author ? { '@type': 'Organization', name: template.author } : undefined,
    genre: template.category,
    keywords: [template.name, 'website template', template.category].filter(Boolean).join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkJsonLd) }}
      />
      <TemplateDetailContent
      template={template}
      allImages={allImages}
      longDescriptionHtml={longDescriptionHtml}
      features={features}
        pageNames={pageNames}
      />
    </>
  );
}
