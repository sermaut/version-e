-- Create storage bucket for weekly program uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'weekly-programs',
  'weekly-programs',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/mp3']
);

-- Create RLS policies for weekly programs bucket
CREATE POLICY "Anyone can view weekly program files"
ON storage.objects FOR SELECT
USING (bucket_id = 'weekly-programs');

CREATE POLICY "Authenticated users can upload weekly program files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'weekly-programs');

CREATE POLICY "Authenticated users can update their weekly program files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'weekly-programs');

CREATE POLICY "Authenticated users can delete weekly program files"
ON storage.objects FOR DELETE
USING (bucket_id = 'weekly-programs');

-- Create table for weekly program content
CREATE TABLE public.weekly_program_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  image_url text NOT NULL,
  audio_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '6 days'),
  is_deleted boolean NOT NULL DEFAULT false
);

-- Enable RLS on weekly_program_content
ALTER TABLE public.weekly_program_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for weekly_program_content
CREATE POLICY "Anyone can view weekly program content"
ON public.weekly_program_content FOR SELECT
USING (NOT is_deleted AND expires_at > now());

CREATE POLICY "Authenticated users can insert weekly program content"
ON public.weekly_program_content FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update weekly program content"
ON public.weekly_program_content FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete weekly program content"
ON public.weekly_program_content FOR DELETE
USING (true);

-- Create index for faster queries
CREATE INDEX idx_weekly_program_group_id ON public.weekly_program_content(group_id);
CREATE INDEX idx_weekly_program_expires_at ON public.weekly_program_content(expires_at);

-- Create function to soft delete expired content
CREATE OR REPLACE FUNCTION public.soft_delete_expired_weekly_programs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.weekly_program_content
  SET is_deleted = true
  WHERE expires_at <= now() AND is_deleted = false;
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_weekly_program_content_updated_at
BEFORE UPDATE ON public.weekly_program_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();