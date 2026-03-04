
-- Create storage bucket for chat documents
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-documents', 'chat-documents', false);

-- RLS policies for chat-documents bucket
CREATE POLICY "Users can upload their own chat documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own chat documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own chat documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
