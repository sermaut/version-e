-- Criar tabela de registros de presença nos ensaios
CREATE TABLE IF NOT EXISTS public.rehearsal_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  rehearsal_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.members(id),
  month_year text NOT NULL,
  UNIQUE(group_id, member_id, rehearsal_date)
);

-- Index para melhor performance
CREATE INDEX IF NOT EXISTS idx_rehearsal_attendance_group ON public.rehearsal_attendance(group_id);
CREATE INDEX IF NOT EXISTS idx_rehearsal_attendance_month ON public.rehearsal_attendance(month_year);
CREATE INDEX IF NOT EXISTS idx_rehearsal_attendance_date ON public.rehearsal_attendance(rehearsal_date);

-- Habilitar RLS
ALTER TABLE public.rehearsal_attendance ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view attendance records"
  ON public.rehearsal_attendance FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert attendance"
  ON public.rehearsal_attendance FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete attendance"
  ON public.rehearsal_attendance FOR DELETE
  USING (true);

-- Função para limpar registros antigos (executar mensalmente)
CREATE OR REPLACE FUNCTION public.clean_old_rehearsal_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.rehearsal_attendance
  WHERE month_year < to_char(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM');
END;
$$;