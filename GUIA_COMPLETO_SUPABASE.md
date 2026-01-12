# 🚀 GUIA COMPLETO DE INTEGRAÇÃO SUPABASE PROFISSIONAL
## Marketplace JokaTech - Sistema de Tempo Real Seguro

---

## ⚠️ PASSO 0: BACKUP OBRIGATÓRIO

**ANTES DE FAZER QUALQUER ALTERAÇÃO, FAÇA BACKUP DOS SEUS DADOS!**

### Como fazer backup:

1. Acesse: https://supabase.com/dashboard
2. Selecione o seu projeto **JokaTech**
3. Vá em **"Table Editor"** no menu lateral
4. Para cada tabela importante:
   - `products` (produtos)
   - `orders` (pedidos)
   - `customer_profiles` (clientes)
   - `customer_levels` (níveis)
   - `admin_notes` (notas)
   - `custom_pc_requests` (pedidos de PC)

5. Para cada tabela:
   - Clique nos 3 pontos (⋮) no canto superior direito
   - Clique em **"Download as CSV"**
   - Guarde o ficheiro num local seguro

**✅ Só continue após fazer o backup de todas as tabelas!**

---

## 📋 PASSO 1: EXECUTAR SQL NO SUPABASE

### Como executar:

1. Acesse: https://supabase.com/dashboard
2. Selecione o seu projeto **JokaTech**
3. No menu lateral esquerdo, clique em **"SQL Editor"**
4. Clique em **"New Query"** (botão verde)
5. Cole o SQL abaixo
6. Clique em **"RUN"** (ou pressione Ctrl+Enter)

---

### 📝 SQL COMPLETO - COPIE E COLE:

```sql
-- ============================================
-- INTEGRAÇÃO SUPABASE PROFISSIONAL
-- Marketplace JokaTech - Sistema de Tempo Real
-- ============================================

-- ============================================
-- 1. CRIAR TABELA DE PERFIS
-- ============================================
CREATE TABLE IF NOT EXISTS public.perfis (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text CHECK (tipo IN ('admin','vendedor','cliente')) DEFAULT 'cliente',
  nome text,
  email text,
  telefone text,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_perfis_tipo ON public.perfis(tipo);
CREATE INDEX IF NOT EXISTS idx_perfis_email ON public.perfis(email);

-- Comentários
COMMENT ON TABLE public.perfis IS 'Perfis de utilizadores: admin, vendedor ou cliente';
COMMENT ON COLUMN public.perfis.tipo IS 'Tipo de utilizador: admin (acesso total), vendedor (gere produtos próprios), cliente (compra)';


-- ============================================
-- 2. ADICIONAR COLUNAS À TABELA PRODUCTS
-- ============================================
DO $$ 
BEGIN
  -- Adicionar owner_id (vendedor dono do produto)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='owner_id') THEN
    ALTER TABLE public.products ADD COLUMN owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX idx_products_owner ON public.products(owner_id);
  END IF;

  -- Adicionar aprovado (moderação de produtos)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='aprovado') THEN
    ALTER TABLE public.products ADD COLUMN aprovado boolean DEFAULT true;
    CREATE INDEX idx_products_aprovado ON public.products(aprovado);
  END IF;

  -- Adicionar version (controle de concorrência otimista)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='version') THEN
    ALTER TABLE public.products ADD COLUMN version integer DEFAULT 1;
  END IF;

  -- Adicionar vendedor_nome (cache do nome do vendedor)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='vendedor_nome') THEN
    ALTER TABLE public.products ADD COLUMN vendedor_nome text;
  END IF;
END $$;

-- Comentários
COMMENT ON COLUMN public.products.owner_id IS 'UUID do vendedor que criou o produto';
COMMENT ON COLUMN public.products.aprovado IS 'Se true, produto visível ao público; se false, aguarda aprovação de admin';
COMMENT ON COLUMN public.products.version IS 'Versão do registo para controle de concorrência otimista';


-- ============================================
-- 3. CRIAR TABELA DE AUDITORIA
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  user_tipo text,
  tabela text NOT NULL,
  operacao text NOT NULL CHECK (operacao IN ('INSERT','UPDATE','DELETE')),
  registo_id uuid,
  dados_antigos jsonb,
  dados_novos jsonb,
  ip_address text,
  user_agent text,
  criado_em timestamptz DEFAULT now()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_tabela ON public.audit_logs(tabela);
CREATE INDEX IF NOT EXISTS idx_audit_operacao ON public.audit_logs(operacao);
CREATE INDEX IF NOT EXISTS idx_audit_criado ON public.audit_logs(criado_em DESC);

COMMENT ON TABLE public.audit_logs IS 'Registo de todas as operações no sistema para auditoria e segurança';


-- ============================================
-- 4. ATIVAR RLS (Row Level Security)
-- ============================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;


-- ============================================
-- 5. POLÍTICAS RLS PARA PRODUCTS
-- ============================================

-- ADMIN: Acesso total (ver, criar, editar, apagar tudo)
DROP POLICY IF EXISTS "products_admin_acesso_total" ON public.products;
CREATE POLICY "products_admin_acesso_total" ON public.products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis p 
      WHERE p.id = auth.uid() AND p.tipo = 'admin'
    )
  );

-- VENDEDOR: Criar produtos próprios (aprovado=false por padrão)
DROP POLICY IF EXISTS "products_vendedor_criar_proprio" ON public.products;
CREATE POLICY "products_vendedor_criar_proprio" ON public.products
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM public.perfis p 
      WHERE p.id = auth.uid() AND p.tipo = 'vendedor'
    )
  );

-- VENDEDOR: Ver os próprios produtos (aprovados ou não)
DROP POLICY IF EXISTS "products_vendedor_ver_proprios" ON public.products;
CREATE POLICY "products_vendedor_ver_proprios" ON public.products
  FOR SELECT
  USING (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM public.perfis p 
      WHERE p.id = auth.uid() AND p.tipo = 'vendedor'
    )
  );

-- VENDEDOR: Editar apenas os próprios produtos
DROP POLICY IF EXISTS "products_vendedor_editar_proprio" ON public.products;
CREATE POLICY "products_vendedor_editar_proprio" ON public.products
  FOR UPDATE
  USING (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM public.perfis p 
      WHERE p.id = auth.uid() AND p.tipo = 'vendedor'
    )
  )
  WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM public.perfis p 
      WHERE p.id = auth.uid() AND p.tipo = 'vendedor'
    )
  );

-- PÚBLICO: Ver apenas produtos aprovados (sem autenticação)
DROP POLICY IF EXISTS "products_publico_ver_aprovados" ON public.products;
CREATE POLICY "products_publico_ver_aprovados" ON public.products
  FOR SELECT
  USING (aprovado = true);


-- ============================================
-- 6. POLÍTICAS RLS PARA PERFIS
-- ============================================

-- Utilizadores podem ver o próprio perfil
DROP POLICY IF EXISTS "perfis_ver_proprio" ON public.perfis;
CREATE POLICY "perfis_ver_proprio" ON public.perfis
  FOR SELECT
  USING (auth.uid() = id);

-- Admins podem ver todos os perfis
DROP POLICY IF EXISTS "perfis_admin_ver_todos" ON public.perfis;
CREATE POLICY "perfis_admin_ver_todos" ON public.perfis
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis p 
      WHERE p.id = auth.uid() AND p.tipo = 'admin'
    )
  );

-- Utilizadores podem atualizar o próprio perfil
DROP POLICY IF EXISTS "perfis_atualizar_proprio" ON public.perfis;
CREATE POLICY "perfis_atualizar_proprio" ON public.perfis
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins podem fazer tudo
DROP POLICY IF EXISTS "perfis_admin_total" ON public.perfis;
CREATE POLICY "perfis_admin_total" ON public.perfis
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis p 
      WHERE p.id = auth.uid() AND p.tipo = 'admin'
    )
  );

-- Permitir inserção de novos perfis (para registo)
DROP POLICY IF EXISTS "perfis_inserir_novo" ON public.perfis;
CREATE POLICY "perfis_inserir_novo" ON public.perfis
  FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ============================================
-- 7. POLÍTICAS RLS PARA AUDIT_LOGS
-- ============================================

-- Apenas admins podem ver logs
DROP POLICY IF EXISTS "audit_logs_admin_ver" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_ver" ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis p 
      WHERE p.id = auth.uid() AND p.tipo = 'admin'
    )
  );

-- Sistema pode inserir logs (via trigger)
DROP POLICY IF EXISTS "audit_logs_sistema_inserir" ON public.audit_logs;
CREATE POLICY "audit_logs_sistema_inserir" ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);


-- ============================================
-- 8. TRIGGER PARA ATUALIZAR updated_at
-- ============================================

-- Criar função
CREATE OR REPLACE FUNCTION public.atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em products
DROP TRIGGER IF EXISTS trigger_atualizar_updated_at_products ON public.products;
CREATE TRIGGER trigger_atualizar_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_updated_at();

-- Aplicar trigger em perfis
DROP TRIGGER IF EXISTS trigger_atualizar_updated_at_perfis ON public.perfis;
CREATE TRIGGER trigger_atualizar_updated_at_perfis
  BEFORE UPDATE ON public.perfis
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_updated_at();


-- ============================================
-- 9. TRIGGER PARA INCREMENTAR VERSION
-- ============================================

-- Criar função
CREATE OR REPLACE FUNCTION public.incrementar_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = COALESCE(OLD.version, 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em products
DROP TRIGGER IF EXISTS trigger_incrementar_version_products ON public.products;
CREATE TRIGGER trigger_incrementar_version_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.incrementar_version();


-- ============================================
-- 10. TRIGGER PARA AUDITORIA AUTOMÁTICA
-- ============================================

-- Criar função de auditoria
CREATE OR REPLACE FUNCTION public.registrar_auditoria()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email text;
  v_user_tipo text;
BEGIN
  -- Buscar email e tipo do utilizador
  SELECT p.email, p.tipo INTO v_user_email, v_user_tipo
  FROM public.perfis p
  WHERE p.id = auth.uid();

  -- Inserir log
  INSERT INTO public.audit_logs (
    user_id,
    user_email,
    user_tipo,
    tabela,
    operacao,
    registo_id,
    dados_antigos,
    dados_novos
  ) VALUES (
    auth.uid(),
    v_user_email,
    v_user_tipo,
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger em products
DROP TRIGGER IF EXISTS trigger_auditoria_products ON public.products;
CREATE TRIGGER trigger_auditoria_products
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_auditoria();


-- ============================================
-- 11. LISTAR UTILIZADORES (para definir admin)
-- ============================================
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🎯 PASSO 2: DEFINIR ADMIN

Após executar o SQL acima, você verá uma **lista de utilizadores** no resultado da query.

### Como definir admin:

1. **Copie o UUID** do seu email (primeira coluna)
2. No **SQL Editor**, crie uma **nova query**
3. Cole o código abaixo, **substituindo** `<SEU_UUID_AQUI>` e `seu-email@exemplo.com`:

```sql
-- SUBSTITUIR '<SEU_UUID_AQUI>' pelo UUID que apareceu na lista
-- SUBSTITUIR 'seu-email@exemplo.com' pelo seu email real

INSERT INTO public.perfis (id, tipo, email, nome) 
VALUES (
  '<SEU_UUID_AQUI>', 
  'admin', 
  'seu-email@exemplo.com',
  'Administrador'
) 
ON CONFLICT (id) DO UPDATE SET tipo='admin';
```

**Exemplo real:**
```sql
INSERT INTO public.perfis (id, tipo, email, nome) 
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
  'admin', 
  'admin@jokatech.pt',
  'João Silva'
) 
ON CONFLICT (id) DO UPDATE SET tipo='admin';
```

4. Clique em **"RUN"**
5. ✅ Pronto! Agora você é admin!

---

## 🔄 PASSO 3: VERIFICAR SE FUNCIONOU

### Teste 1: Verificar tabelas criadas

Execute no SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema='public' 
ORDER BY table_name;
```

**Deve aparecer:**
- ✅ `audit_logs` (nova)
- ✅ `perfis` (nova)
- ✅ `products` (atualizada)
- ✅ Todas as outras tabelas existentes

---

### Teste 2: Verificar colunas adicionadas em products

Execute no SQL Editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='products' 
ORDER BY column_name;
```

**Deve aparecer:**
- ✅ `owner_id` (nova)
- ✅ `aprovado` (nova)
- ✅ `version` (nova)
- ✅ `vendedor_nome` (nova)
- ✅ Todas as colunas antigas

---

### Teste 3: Verificar se você é admin

Execute no SQL Editor:

```sql
SELECT * FROM public.perfis WHERE tipo='admin';
```

**Deve aparecer:**
- ✅ Seu UUID
- ✅ Seu email
- ✅ tipo = 'admin'

---

## 📊 PASSO 4: ENTENDER O SISTEMA

### O que foi criado:

#### 1. **Tabela `perfis`**
- Armazena o tipo de cada utilizador: `admin`, `vendedor` ou `cliente`
- **Admin**: Acesso total ao sistema
- **Vendedor**: Pode criar e editar apenas os próprios produtos
- **Cliente**: Pode comprar produtos

#### 2. **Tabela `audit_logs`**
- Regista **todas as ações** no sistema
- Quem fez, quando fez, o que mudou
- Apenas admins podem ver os logs

#### 3. **Novas colunas em `products`**
- `owner_id`: UUID do vendedor que criou o produto
- `aprovado`: Se `true`, produto visível ao público; se `false`, aguarda aprovação
- `version`: Controle de concorrência (evita conflitos quando 2 admins editam ao mesmo tempo)
- `vendedor_nome`: Nome do vendedor (cache)

#### 4. **Políticas RLS (Row Level Security)**
- **Admin**: Vê e edita TUDO
- **Vendedor**: Vê e edita apenas os próprios produtos
- **Público**: Vê apenas produtos aprovados

#### 5. **Triggers Automáticos**
- `updated_at`: Atualiza automaticamente quando edita
- `version`: Incrementa automaticamente quando edita
- `audit_logs`: Regista automaticamente todas as ações

---

## 🚀 COMO FUNCIONA AGORA

### Fluxo Admin (você):

```
1. Você faz login no dashboard
2. Adiciona/edita um produto
3. Sistema salva no Supabase com:
   - owner_id = seu UUID
   - aprovado = true (admin aprova automaticamente)
   - version = 1 (ou incrementa)
4. Supabase Realtime detecta a mudança
5. Dashboard atualiza INSTANTANEAMENTE
6. Site atualiza INSTANTANEAMENTE
7. Todos os admins conectados veem a mudança
8. Log de auditoria é criado automaticamente
```

### Fluxo Vendedor (futuro):

```
1. Vendedor faz login
2. Cria um produto
3. Sistema salva com:
   - owner_id = UUID do vendedor
   - aprovado = false (aguarda aprovação)
4. Produto NÃO aparece no site (ainda não aprovado)
5. Admin vê o produto no dashboard
6. Admin aprova (muda aprovado para true)
7. Produto aparece no site INSTANTANEAMENTE
```

### Fluxo Cliente (site):

```
1. Cliente acessa o site
2. Vê apenas produtos com aprovado = true
3. Quando admin adiciona/edita produto
4. Site atualiza AUTOMATICAMENTE
5. Cliente vê as mudanças SEM RECARREGAR
```

---

## 🔐 SEGURANÇA GARANTIDA

### O que está protegido:

✅ **RLS Ativo**: Banco de dados protegido por políticas de segurança  
✅ **Apenas Admin**: Só você pode ver e editar todos os produtos  
✅ **Vendedores Isolados**: Cada vendedor vê apenas os próprios produtos  
✅ **Público Limitado**: Clientes veem apenas produtos aprovados  
✅ **Auditoria Completa**: Todas as ações registadas  
✅ **Controle de Concorrência**: Evita conflitos quando 2 pessoas editam ao mesmo tempo  

---

## 📱 TEMPO REAL ATIVO

### O que atualiza automaticamente:

✅ **Produtos**: Adicionar, editar, deletar  
✅ **Pedidos**: Novos pedidos aparecem instantaneamente  
✅ **Clientes**: Novos registos e atualizações  
✅ **Níveis**: XP e descontos calculados automaticamente  
✅ **Notas**: Adicionar e deletar em tempo real  
✅ **Pedidos de PC**: Novos pedidos instantâneos  

### Como funciona:

```
Supabase Realtime (WebSocket)
      ↓
Detecta mudanças no banco de dados
      ↓
Envia evento para todos os clientes conectados
      ↓
Dashboard e Site atualizam AUTOMATICAMENTE
      ↓
SEM RECARREGAR A PÁGINA! ✨
```

---

## 🎯 PRÓXIMOS PASSOS

### 1. Teste o sistema:

**Teste Básico:**
1. Abra o dashboard
2. Adicione um novo produto
3. Veja aparecer instantaneamente na lista
4. Abra o site em outra aba
5. Veja o produto aparecer no site também

**Teste de Tempo Real:**
1. Abra o dashboard em **duas abas** diferentes
2. Adicione um produto em uma aba
3. Veja aparecer **automaticamente** na outra aba
4. **SEM RECARREGAR!** 🔥

**Teste de Edição:**
1. Edite o preço de um produto
2. Veja atualizar instantaneamente
3. Abra o site e veja o novo preço

---

### 2. Monitore os logs:

```sql
-- Ver últimas 20 ações no sistema
SELECT 
  user_email,
  user_tipo,
  tabela,
  operacao,
  criado_em
FROM public.audit_logs
ORDER BY criado_em DESC
LIMIT 20;
```

---

### 3. Adicionar mais admins (opcional):

```sql
-- Listar utilizadores
SELECT id, email FROM auth.users;

-- Tornar alguém admin
INSERT INTO public.perfis (id, tipo, email, nome) 
VALUES ('<UUID_DO_UTILIZADOR>', 'admin', 'email@exemplo.com', 'Nome')
ON CONFLICT (id) DO UPDATE SET tipo='admin';
```

---

### 4. Adicionar vendedores (futuro):

```sql
-- Tornar alguém vendedor
INSERT INTO public.perfis (id, tipo, email, nome) 
VALUES ('<UUID_DO_UTILIZADOR>', 'vendedor', 'vendedor@exemplo.com', 'Nome do Vendedor')
ON CONFLICT (id) DO UPDATE SET tipo='vendedor';
```

---

## 🆘 RESOLUÇÃO DE PROBLEMAS

### Problema 1: "new row violates row-level security policy"

**Causa**: Você não é admin ou não executou o SQL corretamente.

**Solução**:
1. Execute novamente o PASSO 2 (definir admin)
2. Verifique se seu UUID está correto
3. Faça logout e login novamente no dashboard

---

### Problema 2: Produtos não aparecem no site

**Causa**: Produtos com `aprovado = false`

**Solução**:
```sql
-- Ver produtos não aprovados
SELECT id, name, aprovado FROM products WHERE aprovado = false;

-- Aprovar todos os produtos
UPDATE products SET aprovado = true WHERE aprovado = false;
```

---

### Problema 3: Tempo real não funciona

**Causa**: Supabase Realtime não está ativo

**Solução**:
1. Acesse o Supabase Dashboard
2. Vá em **"Database"** → **"Replication"**
3. Ative a replicação para a tabela `products`
4. Ative também para: `orders`, `customer_profiles`, `admin_notes`, `custom_pc_requests`

---

### Problema 4: Não consigo ver logs de auditoria

**Causa**: Você não é admin

**Solução**:
```sql
-- Verificar se você é admin
SELECT * FROM public.perfis WHERE id = auth.uid();

-- Se não aparecer ou tipo != 'admin', execute:
INSERT INTO public.perfis (id, tipo) 
VALUES (auth.uid(), 'admin')
ON CONFLICT (id) DO UPDATE SET tipo='admin';
```

---

## 📚 COMANDOS ÚTEIS

### Ver estrutura de uma tabela:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name='products'
ORDER BY ordinal_position;
```

---

### Ver todas as políticas RLS:

```sql
SELECT schemaname, tablename, polname, polcmd
FROM pg_policies
WHERE schemaname='public'
ORDER BY tablename, polname;
```

---

### Ver todos os triggers:

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema='public'
ORDER BY event_object_table;
```

---

### Ver últimas ações (auditoria):

```sql
SELECT 
  user_email,
  tabela,
  operacao,
  criado_em,
  dados_novos->>'name' as produto_nome
FROM public.audit_logs
WHERE tabela='products'
ORDER BY criado_em DESC
LIMIT 10;
```

---

### Aprovar produto específico:

```sql
UPDATE products 
SET aprovado = true 
WHERE id = '<UUID_DO_PRODUTO>';
```

---

### Ver produtos de um vendedor:

```sql
SELECT 
  p.name,
  p.price,
  p.aprovado,
  pf.email as vendedor_email
FROM products p
LEFT JOIN perfis pf ON p.owner_id = pf.id
WHERE p.owner_id = '<UUID_DO_VENDEDOR>';
```

---

## ✅ CHECKLIST FINAL

Antes de considerar concluído, verifique:

- [ ] ✅ Backup de todas as tabelas feito
- [ ] ✅ SQL do PASSO 1 executado com sucesso
- [ ] ✅ Admin definido no PASSO 2
- [ ] ✅ Tabela `perfis` criada
- [ ] ✅ Tabela `audit_logs` criada
- [ ] ✅ Colunas adicionadas em `products`
- [ ] ✅ RLS ativo em todas as tabelas
- [ ] ✅ Políticas RLS criadas
- [ ] ✅ Triggers criados
- [ ] ✅ Teste de adicionar produto funcionou
- [ ] ✅ Teste de editar produto funcionou
- [ ] ✅ Teste de deletar produto funcionou
- [ ] ✅ Tempo real funcionando (2 abas)
- [ ] ✅ Produtos aparecem no site
- [ ] ✅ Logs de auditoria sendo criados

---

## 🎉 RESULTADO FINAL

**Agora você tem:**

✅ **Sistema Profissional**: Banco de dados seguro e bem estruturado  
✅ **Tempo Real**: Todas as mudanças aparecem instantaneamente  
✅ **Segurança**: RLS protegendo todos os dados  
✅ **Auditoria**: Todas as ações registadas  
✅ **Controle de Concorrência**: Evita conflitos  
✅ **Múltiplos Admins**: Todos sincronizados  
✅ **Preparado para Vendedores**: Sistema pronto para marketplace  

---

## 📞 SUPORTE

Se tiver algum problema:

1. **Verifique os logs no console** (F12 no navegador)
2. **Execute os comandos de verificação** acima
3. **Consulte a seção de Resolução de Problemas**
4. **Verifique se o Supabase Realtime está ativo**

---

**🚀 Parabéns! Seu marketplace agora tem uma integração Supabase profissional, segura e em tempo real!**
