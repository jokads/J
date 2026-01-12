-- ============================================
-- 🔥 JOKATECH - DATABASE SETUP COMPLETO
-- ============================================
-- Este arquivo contém TODAS as tabelas e configurações necessárias
-- Execute este arquivo UMA VEZ no Supabase SQL Editor
-- ============================================

-- 1️⃣ TABELA: company_info (Configurações do Site)
CREATE TABLE IF NOT EXISTS company_info (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  
  -- 🔥 CORRIGIDO: Todas as colunas agora são NULLABLE ou têm DEFAULT
  section TEXT DEFAULT 'general',
  
  -- Informações Gerais
  name TEXT DEFAULT 'JokaTech',
  description TEXT DEFAULT 'Especialistas em PCs Gaming de Alto Desempenho',
  logo_url TEXT DEFAULT 'https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/cb4831d791909a4a7679c925d26faa2b.png',
  favicon_url TEXT,
  address TEXT DEFAULT 'Luxembourg City, Luxembourg',
  
  -- Contatos
  email_primary TEXT DEFAULT 'jokadas69@gmail.com',
  email_secondary TEXT DEFAULT 'jokadaskz69@gmail.com',
  phone_primary TEXT DEFAULT '+352 621 717 862',
  phone_secondary TEXT DEFAULT '+352 621 377 168',
  whatsapp_primary TEXT DEFAULT '+352621717862',
  whatsapp_secondary TEXT DEFAULT '+352621377168',
  telegram_bot_token TEXT DEFAULT '8338585182:AAFg15iJyOOTpKiBBYg-opqBcEvc3nfCInQ',
  telegram_chat_id TEXT DEFAULT '7343664374',
  
  -- Redes Sociais
  facebook_url TEXT DEFAULT 'https://www.facebook.com/jokatech',
  instagram_url TEXT DEFAULT 'https://www.instagram.com/jokatech',
  vinted_url TEXT DEFAULT 'https://www.vinted.com/jokatech',
  snapchat_url TEXT DEFAULT 'https://www.snapchat.com/add/hitill1die?share_id=nWonN10a6d0&locale=pt-PT',
  telegram_url TEXT DEFAULT 'https://t.me/jokatech_bot',
  
  -- Métodos de Pagamento
  accept_visa BOOLEAN DEFAULT true,
  accept_mastercard BOOLEAN DEFAULT true,
  accept_apple_pay BOOLEAN DEFAULT true,
  accept_google_pay BOOLEAN DEFAULT true,
  accept_paypal BOOLEAN DEFAULT true,
  paypal_email TEXT DEFAULT 'jokadas69@gmail.com',
  
  -- Envio Grátis
  free_shipping_enabled BOOLEAN DEFAULT true,
  free_shipping_minimum DECIMAL(10,2) DEFAULT 50.00,
  
  -- Textos das Páginas
  about_text TEXT,
  terms_text TEXT,
  privacy_text TEXT,
  
  -- Hero Section
  hero_title TEXT DEFAULT 'Bem-vindo à JokaTech',
  hero_subtitle TEXT DEFAULT 'Os Melhores PCs Gaming de Alto Desempenho',
  hero_button_text TEXT DEFAULT 'Ver Produtos',
  
  -- 🔥 NOVO: Taxa de Montagem de PC
  assembly_fee DECIMAL(10,2) DEFAULT 50.00,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🔥 CORRIGIDO: Inserir dados padrão com TODOS os campos
INSERT INTO company_info (
  id,
  section,
  name,
  description,
  logo_url,
  address,
  email_primary,
  email_secondary,
  phone_primary,
  phone_secondary,
  whatsapp_primary,
  whatsapp_secondary,
  telegram_bot_token,
  telegram_chat_id,
  facebook_url,
  instagram_url,
  vinted_url,
  snapchat_url,
  telegram_url,
  accept_visa,
  accept_mastercard,
  accept_apple_pay,
  accept_google_pay,
  accept_paypal,
  paypal_email,
  free_shipping_enabled,
  free_shipping_minimum,
  hero_title,
  hero_subtitle,
  hero_button_text,
  assembly_fee
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'general',
  'JokaTech',
  'Especialistas em PCs Gaming de Alto Desempenho',
  'https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/cb4831d791909a4a7679c925d26faa2b.png',
  'Luxembourg City, Luxembourg',
  'jokadas69@gmail.com',
  'jokadaskz69@gmail.com',
  '+352 621 717 862',
  '+352 621 377 168',
  '+352621717862',
  '+352621377168',
  '8338585182:AAFg15iJyOOTpKiBBYg-opqBcEvc3nfCInQ',
  '7343664374',
  'https://www.facebook.com/jokatech',
  'https://www.instagram.com/jokatech',
  'https://www.vinted.com/jokatech',
  'https://www.snapchat.com/add/hitill1die?share_id=nWonN10a6d0&locale=pt-PT',
  'https://t.me/jokatech_bot',
  true,
  true,
  true,
  true,
  true,
  'jokadas69@gmail.com',
  true,
  50.00,
  'Bem-vindo à JokaTech',
  'Os Melhores PCs Gaming de Alto Desempenho',
  'Ver Produtos',
  50.00
)
ON CONFLICT (id) DO UPDATE SET
  section = EXCLUDED.section,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  assembly_fee = EXCLUDED.assembly_fee;

-- 2️⃣ TABELA: news (Notícias/Novidades)
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author TEXT DEFAULT 'JokaTech',
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3️⃣ TABELA: categories (Categorias Editáveis)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO categories (name, display_order) VALUES
  ('CPU', 1),
  ('GPU', 2),
  ('RAM', 3),
  ('SSD', 4),
  ('Placa-Mãe', 5),
  ('Fonte', 6),
  ('Torre', 7),
  ('PC Completo', 8),
  ('PC Portátil', 9),
  ('Monitor', 10),
  ('Ventilador', 11),
  ('Fone', 12),
  ('Microfone', 13),
  ('Periférico', 14),
  ('Tapete', 15),
  ('Suporte', 16),
  ('Cabos', 17)
ON CONFLICT (name) DO NOTHING;

-- 4️⃣ ADICIONAR COLUNAS DE CONTROLE DE USUÁRIOS (se não existirem)
DO $$ 
BEGIN
  -- Adicionar coluna is_banned
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='is_banned') THEN
    ALTER TABLE perfis ADD COLUMN is_banned BOOLEAN DEFAULT false;
  END IF;
  
  -- Adicionar coluna is_suspended
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='is_suspended') THEN
    ALTER TABLE perfis ADD COLUMN is_suspended BOOLEAN DEFAULT false;
  END IF;
  
  -- Adicionar coluna suspension_reason
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='suspension_reason') THEN
    ALTER TABLE perfis ADD COLUMN suspension_reason TEXT;
  END IF;
  
  -- Adicionar coluna suspension_until
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='suspension_until') THEN
    ALTER TABLE perfis ADD COLUMN suspension_until TIMESTAMPTZ;
  END IF;
  
  -- Adicionar coluna admin_notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='admin_notes') THEN
    ALTER TABLE perfis ADD COLUMN admin_notes TEXT;
  END IF;
  
  -- Adicionar colunas de permissões
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='can_manage_products') THEN
    ALTER TABLE perfis ADD COLUMN can_manage_products BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='can_manage_orders') THEN
    ALTER TABLE perfis ADD COLUMN can_manage_orders BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='can_manage_customers') THEN
    ALTER TABLE perfis ADD COLUMN can_manage_customers BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='can_manage_team') THEN
    ALTER TABLE perfis ADD COLUMN can_manage_team BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='can_manage_settings') THEN
    ALTER TABLE perfis ADD COLUMN can_manage_settings BOOLEAN DEFAULT false;
  END IF;
  
  -- 🔥 NOVO: Adicionar coluna seller_status para aprovar vendedores
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='seller_status') THEN
    ALTER TABLE perfis ADD COLUMN seller_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- 5️⃣ ADICIONAR COLUNAS EM custom_pc_requests (se não existirem)
DO $$ 
BEGIN
  -- Adicionar coluna rejection_reason
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_pc_requests' AND column_name='rejection_reason') THEN
    ALTER TABLE custom_pc_requests ADD COLUMN rejection_reason TEXT;
  END IF;
  
  -- Adicionar coluna updated_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_pc_requests' AND column_name='updated_at') THEN
    ALTER TABLE custom_pc_requests ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 6️⃣ TABELA: seller_messages (Mensagens entre Vendedor e Admin)
CREATE TABLE IF NOT EXISTS seller_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_email TEXT NOT NULL,
  buyer_email TEXT,
  buyer_name TEXT,
  product_id UUID,
  product_name TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7️⃣ RLS (Row Level Security) - Políticas de Segurança
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_messages ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler company_info
DROP POLICY IF EXISTS "Anyone can read company_info" ON company_info;
CREATE POLICY "Anyone can read company_info" ON company_info
  FOR SELECT USING (true);

-- Política: Apenas admins podem editar company_info
DROP POLICY IF EXISTS "Only admins can update company_info" ON company_info;
CREATE POLICY "Only admins can update company_info" ON company_info
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM perfis
      WHERE perfis.id = auth.uid()
      AND (perfis.is_admin = true OR perfis.is_super_admin = true)
    )
  );

-- Política: Todos podem ler categorias ativas
DROP POLICY IF EXISTS "Anyone can read active categories" ON categories;
CREATE POLICY "Anyone can read active categories" ON categories
  FOR SELECT USING (is_active = true OR EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND (perfis.is_admin = true OR perfis.is_super_admin = true)
  ));

-- Política: Apenas admins podem gerenciar categorias
DROP POLICY IF EXISTS "Only admins can manage categories" ON categories;
CREATE POLICY "Only admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM perfis
      WHERE perfis.id = auth.uid()
      AND (perfis.is_admin = true OR perfis.is_super_admin = true)
    )
  );

-- Política: Todos podem ler notícias publicadas
DROP POLICY IF EXISTS "Anyone can read published news" ON news;
CREATE POLICY "Anyone can read published news" ON news
  FOR SELECT USING (published = true OR EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND (perfis.is_admin = true OR perfis.is_super_admin = true)
  ));

-- Política: Apenas admins podem gerenciar notícias
DROP POLICY IF EXISTS "Only admins can manage news" ON news;
CREATE POLICY "Only admins can manage news" ON news
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM perfis
      WHERE perfis.id = auth.uid()
      AND (perfis.is_admin = true OR perfis.is_super_admin = true)
    )
  );

-- Política: Vendedores podem ler suas mensagens
DROP POLICY IF EXISTS "Sellers can read their messages" ON seller_messages;
CREATE POLICY "Sellers can read their messages" ON seller_messages
  FOR SELECT USING (
    seller_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM perfis
      WHERE perfis.id = auth.uid()
      AND (perfis.is_admin = true OR perfis.is_super_admin = true)
    )
  );

-- Política: Qualquer um pode criar mensagens
DROP POLICY IF EXISTS "Anyone can create messages" ON seller_messages;
CREATE POLICY "Anyone can create messages" ON seller_messages
  FOR INSERT WITH CHECK (true);

-- 8️⃣ ÍNDICES para Performance
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news(featured);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_seller_messages_seller ON seller_messages(seller_email);
CREATE INDEX IF NOT EXISTS idx_seller_messages_status ON seller_messages(status);
CREATE INDEX IF NOT EXISTS idx_perfis_banned ON perfis(is_banned);
CREATE INDEX IF NOT EXISTS idx_perfis_suspended ON perfis(is_suspended);
CREATE INDEX IF NOT EXISTS idx_perfis_seller_status ON perfis(seller_status);

-- ============================================
-- ✅ SETUP COMPLETO E CORRIGIDO!
-- ============================================
-- Agora você pode usar o Dashboard Admin para:
-- 1. ✅ Editar configurações do site em tempo real
-- 2. ✅ Gerenciar notícias/novidades
-- 3. ✅ Banir/suspender usuários
-- 4. ✅ Controlar permissões da equipe
-- 5. ✅ Ver mensagens de vendedores
-- 6. ✅ Gerenciar categorias (adicionar/editar/remover)
-- 7. ✅ Controlar taxa de montagem de PC
-- 8. ✅ Aprovar/rejeitar vendedores
-- ============================================
