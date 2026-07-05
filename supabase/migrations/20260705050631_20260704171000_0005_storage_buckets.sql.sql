/*
# Storage Buckets — Media Management

## Summary
Creates 6 storage buckets for organized media management:
1. food-images — Menu item photos and food photography
2. gallery — Restaurant gallery images (interior, ambiance, events)
3. events — Event promotional images and banners
4. avatars — User profile pictures
5. documents — Invoices, receipts, legal documents (private)
6. marketing-assets — Promotional banners, social media graphics, ad creatives

## Security
- Public buckets (food-images, gallery, events, avatars, marketing-assets) allow public read
- Private bucket (documents) requires authentication
- All buckets restrict uploads to authenticated users
- File size limits enforced via storage policies
- MIME type restrictions for image buckets

## Notes
- Buckets are created via storage.buckets table inserts
- Storage policies (RLS on storage.objects) enforce access control
- 10MB limit for images, 50MB for documents
*/

-- ============================================================
-- CREATE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('food-images', 'food-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('gallery', 'gallery', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('events', 'events', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('marketing-assets', 'marketing-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES
-- ============================================================

-- Public read for public buckets
DROP POLICY IF EXISTS "public_read_food_images" ON storage.objects;
CREATE POLICY "public_read_food_images" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'food-images');

DROP POLICY IF EXISTS "public_read_gallery" ON storage.objects;
CREATE POLICY "public_read_gallery" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "public_read_events" ON storage.objects;
CREATE POLICY "public_read_events" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'events');

DROP POLICY IF EXISTS "public_read_avatars" ON storage.objects;
CREATE POLICY "public_read_avatars" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "public_read_marketing" ON storage.objects;
CREATE POLICY "public_read_marketing" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'marketing-assets');

-- Authenticated upload for public image buckets
DROP POLICY IF EXISTS "auth_upload_food_images" ON storage.objects;
CREATE POLICY "auth_upload_food_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'food-images');

DROP POLICY IF EXISTS "auth_upload_gallery" ON storage.objects;
CREATE POLICY "auth_upload_gallery" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "auth_upload_events" ON storage.objects;
CREATE POLICY "auth_upload_events" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'events');

DROP POLICY IF EXISTS "auth_upload_avatars" ON storage.objects;
CREATE POLICY "auth_upload_avatars" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "auth_upload_marketing" ON storage.objects;
CREATE POLICY "auth_upload_marketing" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'marketing-assets');

-- Authenticated update/delete for own files in public buckets
DROP POLICY IF EXISTS "auth_update_food_images" ON storage.objects;
CREATE POLICY "auth_update_food_images" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'food-images' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'food-images');

DROP POLICY IF EXISTS "auth_delete_food_images" ON storage.objects;
CREATE POLICY "auth_delete_food_images" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'food-images' AND owner = auth.uid());

DROP POLICY IF EXISTS "auth_update_gallery" ON storage.objects;
CREATE POLICY "auth_update_gallery" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'gallery' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "auth_delete_gallery" ON storage.objects;
CREATE POLICY "auth_delete_gallery" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'gallery' AND owner = auth.uid());

DROP POLICY IF EXISTS "auth_update_events" ON storage.objects;
CREATE POLICY "auth_update_events" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'events' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'events');

DROP POLICY IF EXISTS "auth_delete_events" ON storage.objects;
CREATE POLICY "auth_delete_events" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'events' AND owner = auth.uid());

DROP POLICY IF EXISTS "auth_update_avatars" ON storage.objects;
CREATE POLICY "auth_update_avatars" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'avatars' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "auth_delete_avatars" ON storage.objects;
CREATE POLICY "auth_delete_avatars" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'avatars' AND owner = auth.uid());

DROP POLICY IF EXISTS "auth_update_marketing" ON storage.objects;
CREATE POLICY "auth_update_marketing" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'marketing-assets' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'marketing-assets');

DROP POLICY IF EXISTS "auth_delete_marketing" ON storage.objects;
CREATE POLICY "auth_delete_marketing" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'marketing-assets' AND owner = auth.uid());

-- Private documents bucket: only owner can read/write
DROP POLICY IF EXISTS "auth_read_documents" ON storage.objects;
CREATE POLICY "auth_read_documents" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'documents' AND owner = auth.uid());

DROP POLICY IF EXISTS "auth_upload_documents" ON storage.objects;
CREATE POLICY "auth_upload_documents" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "auth_update_documents" ON storage.objects;
CREATE POLICY "auth_update_documents" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'documents' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "auth_delete_documents" ON storage.objects;
CREATE POLICY "auth_delete_documents" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'documents' AND owner = auth.uid());
