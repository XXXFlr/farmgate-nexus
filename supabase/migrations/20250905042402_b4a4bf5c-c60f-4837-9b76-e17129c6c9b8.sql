-- Create storage bucket for market images
INSERT INTO storage.buckets (id, name, public) VALUES ('market-images', 'market-images', true);

-- Create policies for market image uploads
CREATE POLICY "Users can view all market images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'market-images');

CREATE POLICY "Users can upload their own market images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'market-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own market images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'market-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own market images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'market-images' AND auth.uid()::text = (storage.foldername(name))[1]);