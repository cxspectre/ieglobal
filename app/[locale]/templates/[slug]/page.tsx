import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getTemplateBySlug, getPublishedTemplates } from '@/lib/website-templates';
import { marked } from 'marked';
import { TemplateDetailContent } from './TemplateDetailContent';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const templates = await getPublishedTemplates();
  return templates
    .filter((t) => t.slug)
    .map((t) => ({ slug: t.slug! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);

  if (!template) {
    return { title: 'Template Not Found' };
  }

  return {
    title: `${template.name} – Website Template`,
    description: template.description ?? `Explore the ${template.name} website template.`,
    openGraph: {
      title: `${template.name} – IE Global Templates`,
      description: template.description ?? undefined,
    },
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

  return (
    <TemplateDetailContent
      template={template}
      allImages={allImages}
      longDescriptionHtml={longDescriptionHtml}
      features={features}
      pageNames={pageNames}
    />
  );
}
