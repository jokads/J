-- ============================================
-- 🔥 CORRIGIR TABELA PERFIS - ADICIONAR COLUNAS DE VENDEDOR
-- ============================================
-- Execute este arquivo no Supabase SQL Editor
-- ============================================

-- Adicionar colunas de vendedor na tabela perfis
DO $$ 
BEGIN
  -- Adicionar coluna store_name (Nome da Loja)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='store_name') THEN
    ALTER TABLE perfis ADD COLUMN store_name TEXT;
  END IF;
  
  -- Adicionar coluna store_description (Descrição da Loja)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='store_description') THEN
    ALTER TABLE perfis ADD COLUMN store_description TEXT;
  END IF;
  
  -- Adicionar coluna phone (Telefone)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='phone') THEN
    ALTER TABLE perfis ADD COLUMN phone TEXT;
  END IF;
  
  -- Adicionar coluna address (Endereço)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='address') THEN
    ALTER TABLE perfis ADD COLUMN address TEXT;
  END IF;
END $$;

-- ============================================
-- ✅ PRONTO! Agora o Dashboard Vendedor funcionará!
-- ============================================
