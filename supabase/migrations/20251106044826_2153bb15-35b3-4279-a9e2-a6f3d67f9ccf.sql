-- Fase 3: Database Security Functions e RLS Policies

-- Função para obter nível de role do membro
CREATE OR REPLACE FUNCTION public.get_member_role_level(p_member_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_level INTEGER;
BEGIN
  -- Buscar role do membro
  SELECT role INTO v_role
  FROM public.members
  WHERE id = p_member_id;
  
  IF v_role IS NULL THEN
    RETURN 999; -- Sem permissão
  END IF;
  
  -- Calcular nível baseado na role
  IF v_role IN ('presidente', 'vice_presidente_1', 'vice_presidente_2', 'secretario_1', 'secretario_2') THEN
    RETURN 1;
  ELSIF v_role IN ('inspector', 'inspector_adj', 'coordenador', 'coordenador_adj') THEN
    RETURN 2;
  ELSIF v_role = 'dirigente_tecnico' THEN
    RETURN 3;
  ELSIF v_role IN ('chefe_particao', 'chefe_categoria') THEN
    RETURN 4;
  ELSIF v_role IN ('protocolo', 'relacao_publica', 'evangelista', 'conselheiro', 'disciplinador') THEN
    RETURN 5;
  ELSIF v_role = 'financeiro' THEN
    RETURN 6;
  ELSE
    RETURN 7; -- membro_simples
  END IF;
END;
$$;

-- Função para verificar se membro é líder de categoria
CREATE OR REPLACE FUNCTION public.is_category_leader(p_category_id UUID, p_member_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.category_roles
    WHERE category_id = p_category_id
      AND member_id = p_member_id
      AND is_active = true
  );
$$;

-- Função para verificar se membro é líder do grupo
CREATE OR REPLACE FUNCTION public.is_group_leader(p_group_id UUID, p_member_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.groups
    WHERE id = p_group_id
      AND (
        president_id = p_member_id OR
        vice_president_1_id = p_member_id OR
        vice_president_2_id = p_member_id OR
        secretary_1_id = p_member_id OR
        secretary_2_id = p_member_id
      )
  );
$$;

-- Adicionar categoria aos eventos de pagamento (para Nível 6)
ALTER TABLE public.payment_events 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.financial_categories(id);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_payment_events_category_id ON public.payment_events(category_id);

-- Adicionar campo created_by_member para rastrear quem criou
ALTER TABLE public.payment_events
ADD COLUMN IF NOT EXISTS created_by_member_id UUID REFERENCES public.members(id);

ALTER TABLE public.financial_transactions
ADD COLUMN IF NOT EXISTS created_by_member_id UUID REFERENCES public.members(id);

-- Comentários para documentação
COMMENT ON FUNCTION public.get_member_role_level IS 'Retorna o nível hierárquico (1-7) baseado na role do membro';
COMMENT ON FUNCTION public.is_category_leader IS 'Verifica se o membro é líder de uma categoria financeira específica';
COMMENT ON FUNCTION public.is_group_leader IS 'Verifica se o membro é líder (presidente, vice ou secretário) do grupo';
COMMENT ON COLUMN public.payment_events.category_id IS 'Categoria financeira associada ao evento (para líderes de categoria - Nível 6)';
COMMENT ON COLUMN public.payment_events.created_by_member_id IS 'ID do membro que criou o evento';
COMMENT ON COLUMN public.financial_transactions.created_by_member_id IS 'ID do membro que criou a transação';