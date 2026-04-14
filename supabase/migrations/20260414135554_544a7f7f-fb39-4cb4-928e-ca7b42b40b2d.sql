
-- Create a dedicated storage bucket for popup notice images
INSERT INTO storage.buckets (id, name, public) VALUES ('popup-notice-images', 'popup-notice-images', true);

-- Allow anyone to view popup notice images (public bucket)
CREATE POLICY "Popup notice images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'popup-notice-images');

-- Allow authenticated/anon users to upload popup notice images
CREATE POLICY "Anyone can upload popup notice images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'popup-notice-images');

-- Allow updating popup notice images
CREATE POLICY "Anyone can update popup notice images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'popup-notice-images');

-- Allow deleting popup notice images
CREATE POLICY "Anyone can delete popup notice images"
ON storage.objects FOR DELETE
USING (bucket_id = 'popup-notice-images');
