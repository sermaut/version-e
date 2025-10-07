-- 1. Criar enum para roles de categoria
CREATE TYPE public.category_role AS ENUM ('presidente', 'secretario', 'auxiliar');

-- 2. Criar tabela category_roles
CREATE TABLE public.category_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.financial_categories(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  role public.category_role NOT NULL,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.members(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(category_id, member_id, role)
);

-- 3. Adicionar coluna is_locked às categorias financeiras
ALTER TABLE public.financial_categories 
ADD COLUMN is_locked BOOLEAN NOT NULL DEFAULT false;

-- 4. Índices para performance
CREATE INDEX idx_category_roles_category ON public.category_roles(category_id);
CREATE INDEX idx_category_roles_member ON public.category_roles(member_id);
CREATE INDEX idx_category_roles_group ON public.category_roles(group_id);

-- 5. Habilitar RLS
ALTER TABLE public.category_roles ENABLE ROW LEVEL SECURITY;

-- 6. Função para verificar se membro pode gerenciar categoria
CREATE OR REPLACE FUNCTION public.can_manage_category(
  p_category_id UUID,
  p_member_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.category_roles cr
    WHERE cr.category_id = p_category_id
      AND cr.member_id = p_member_id
      AND cr.is_active = true
  ) OR EXISTS (
    -- Líderes do grupo também podem gerenciar
    SELECT 1
    FROM public.financial_categories fc
    JOIN public.groups g ON fc.group_id = g.id
    WHERE fc.id = p_category_id
      AND (
        g.president_id = p_member_id OR
        g.vice_president_1_id = p_member_id OR
        g.vice_president_2_id = p_member_id
      )
  );
$$;

-- 7. RLS Policies para category_roles
CREATE POLICY "Todos podem ver roles de categorias"
  ON public.category_roles
  FOR SELECT
  USING (true);

CREATE POLICY "Líderes de grupo podem gerenciar roles"
  ON public.category_roles
  FOR ALL
  USING (
    group_id IN (
      SELECT g.id
      FROM public.groups g
      JOIN public.members m ON (
        g.president_id = m.id OR
        g.vice_president_1_id = m.id OR
        g.vice_president_2_id = m.id
      )
    )
  );

-- 8. Atualizar RLS de financial_transactions para verificar permissões
DROP POLICY IF EXISTS "Temporary public write access for financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Temporary public update access for financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Temporary public delete access for financial transactions" ON public.financial_transactions;

CREATE POLICY "Usuários autorizados podem criar transações"
  ON public.financial_transactions
  FOR INSERT
  WITH CHECK (
    -- Se categoria não está bloqueada, todos podem adicionar
    (SELECT NOT COALESCE(is_locked, false) FROM public.financial_categories WHERE id = category_id)
    OR
    -- Ou se o usuário tem permissão na categoria
    EXISTS (
      SELECT 1
      FROM public.category_roles cr
      WHERE cr.category_id = financial_transactions.category_id
        AND cr.is_active = true
    )
  );

CREATE POLICY "Usuários autorizados podem atualizar transações"
  ON public.financial_transactions
  FOR UPDATE
  USING (
    (SELECT NOT COALESCE(is_locked, false) FROM public.financial_categories WHERE id = category_id)
    OR
    EXISTS (
      SELECT 1
      FROM public.category_roles cr
      WHERE cr.category_id = financial_transactions.category_id
        AND cr.is_active = true
    )
  );

CREATE POLICY "Usuários autorizados podem deletar transações"
  ON public.financial_transactions
  FOR DELETE
  USING (
    (SELECT NOT COALESCE(is_locked, false) FROM public.financial_categories WHERE id = category_id)
    OR
    EXISTS (
      SELECT 1
      FROM public.category_roles cr
      WHERE cr.category_id = financial_transactions.category_id
        AND cr.is_active = true
    )
  );