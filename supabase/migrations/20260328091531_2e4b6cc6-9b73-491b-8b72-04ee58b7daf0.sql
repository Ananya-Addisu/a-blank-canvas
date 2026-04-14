
insert into storage.buckets (id, name, public)
values ('content-images', 'content-images', true)
on conflict (id) do nothing;

CREATE POLICY "Anyone can upload content images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'content-images');

CREATE POLICY "Anyone can view content images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'content-images');
