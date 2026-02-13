-- Migrate template_url from slug.ie-global.net to slug.templates.ie-global.net (subdomain delegation)
UPDATE website_templates
SET template_url = 'https://' || slug || '.templates.ie-global.net'
WHERE slug IS NOT NULL;
