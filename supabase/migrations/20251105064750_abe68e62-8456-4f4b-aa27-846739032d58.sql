-- Atualizar tipos de role e partition para TEXT
-- Isso permite flexibilidade total mantendo compatibilidade com dados existentes

-- Converter role de ENUM para TEXT
ALTER TABLE public.members 
  ALTER COLUMN role TYPE text USING role::text;

-- Converter partition de ENUM para TEXT  
ALTER TABLE public.members 
  ALTER COLUMN partition TYPE text USING partition::text;

-- Atualizar valores antigos para novos padrões (opcional, mantém compatibilidade)
UPDATE public.members 
SET role = CASE 
  WHEN role = 'membro' THEN 'membro_simples'
  WHEN role = 'vice_presidente' THEN 'vice_presidente_1'
  WHEN role = 'secretario' THEN 'secretario_1'
  WHEN role = 'tesoureiro' THEN 'financeiro'
  ELSE role
END
WHERE role IN ('membro', 'vice_presidente', 'secretario', 'tesoureiro');

UPDATE public.members
SET partition = CASE
  WHEN partition = 'contralto' THEN 'alto'
  WHEN partition = 'baixo' THEN 'base'
  ELSE partition
END
WHERE partition IN ('contralto', 'baixo');

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.members.role IS 'Função do membro dentro do grupo - valores hierárquicos de 7 níveis';
COMMENT ON COLUMN public.members.partition IS 'Partição musical do membro - vozes, metais, madeiras ou percussão';