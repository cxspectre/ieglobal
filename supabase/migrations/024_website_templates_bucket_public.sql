-- Make website-templates bucket public so thumbnails and template files
-- can be loaded via <img src="..."> and public URLs without auth
UPDATE storage.buckets
SET public = true
WHERE id = 'website-templates';
