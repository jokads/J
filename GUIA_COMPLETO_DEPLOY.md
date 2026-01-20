# 📦 GUIA COMPLETO DE DEPLOY E CONFIGURAÇÃO

**Projeto:** E-commerce Completo com React + Vite + TypeScript + Supabase + WooCommerce + Stripe  
**Versão:** 1.0.0  
**Última Atualização:** 2024

---

## 📋 ÍNDICE

1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação Local](#instalação-local)
4. [Deploy para GitHub Pages](#deploy-para-github-pages)
5. [Deploy para InfinityFree](#deploy-para-infinityfree)
6. [Configuração do Supabase](#configuração-do-supabase)
7. [Integração WooCommerce](#integração-woocommerce)
8. [Configuração do Stripe](#configuração-do-stripe)
9. [Sistema de IVA/TVA](#sistema-de-ivatva)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL DO PROJETO

### **Arquitetura:**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   GitHub     │  │  InfinityFree│  │    Vercel    │     │
│  │    Pages     │  │   (joka.ct.ws)│  │   (Opção)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Supabase)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │ Edge Functions│  │     Auth     │     │
│  │   Database   │  │   (Stripe)    │  │   (Users)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  INTEGRAÇÕES EXTERNAS                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  WooCommerce │  │    Stripe    │  │   Webhooks   │     │
│  │ (store.joka) │  │  (Payments)  │  │  (Sync Auto) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### **Tecnologias:**

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Pagamentos:** Stripe
- **E-commerce:** WooCommerce (opcional)
- **Deploy:** GitHub Pages, InfinityFree, Vercel

---

## 🔧 PRÉ-REQUISITOS

### **Software Necessário:**

```bash
# Node.js 18+ (Recomendado: 20.x)
node --version  # Deve retornar v20.x.x ou superior

# npm 9+ (vem com Node.js)
npm --version   # Deve retornar 9.x.x ou superior

# Git
git --version   # Qualquer versão recente
```

### **Contas Necessárias:**

- ✅ **GitHub** - Para repositório e GitHub Pages
- ✅ **Supabase** - Para banco de dados e backend
- ✅ **Stripe** - Para pagamentos (modo teste grátis)
- ⚠️ **InfinityFree** - Opcional, para hosting alternativo
- ⚠️ **WordPress/WooCommerce** - Opcional, para integração de produtos

---

## 💻 INSTALAÇÃO LOCAL

### **Passo 1: Clonar o Repositório**

```bash
# Se já tem o repositório
cd caminho/para/seu/projeto

# Se vai clonar do GitHub
git clone https://github.com/jokads/A.git
cd A
```

### **Passo 2: Instalar Dependências**

```bash
npm install
```

**Tempo estimado:** 2-3 minutos

### **Passo 3: Configurar Variáveis de Ambiente**

Crie o arquivo `.env` na raiz do projeto:

```env
# Supabase Configuration
VITE_PUBLIC_SUPABASE_URL="https://SEU_PROJETO.supabase.co"
VITE_PUBLIC_SUPABASE_ANON_KEY="sua_anon_key_aqui"

# Readdy.ai Configuration
VITE_PROJECT_ID="seu_projeto_id"
VITE_VERSION_ID="1"
VITE_READDY_AI_DOMAIN="https://readdy.ai"
```

**⚠️ IMPORTANTE:** Nunca commite o arquivo `.env` no Git!

### **Passo 4: Iniciar Servidor de Desenvolvimento**

```bash
npm run dev
```

Acesse: `http://localhost:3000/`

**✅ Sucesso:** Página inicial carrega sem erros

---

## 🚀 DEPLOY PARA GITHUB PAGES

### **Passo 1: Criar Repositório no GitHub**

1. Acesse: https://github.com/new
2. **Nome do repositório:** `A` (ou outro nome)
3. **Visibilidade:** Público ou Privado
4. **NÃO** inicialize com README, .gitignore ou licença
5. Clique em **Create repository**

### **Passo 2: Conectar Repositório Local**

```bash
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "Initial commit: E-commerce completo"

# Adicionar remote do GitHub
git remote add origin https://github.com/jokads/A.git

# Enviar para GitHub
git branch -M main
git push -u origin main
```

### **Passo 3: Configurar GitHub Pages**

1. Acesse: `https://github.com/jokads/A/settings/pages`
2. **Source:** Deploy from a branch
3. **Branch:** `gh-pages` / `root`
4. Clique em **Save**

### **Passo 4: Build e Deploy**

```bash
# Build otimizado para GitHub Pages
npm run build:github

# Deploy automático
npm run deploy:github
```

**Tempo estimado:** 1-2 minutos

### **Passo 5: Verificar Deploy**

Aguarde 1-2 minutos e acesse:

```
https://jokads.github.io/A/
```

**✅ Sucesso:** Site carrega completamente  
**❌ Erro:** Veja seção [Troubleshooting](#troubleshooting)

---

## 🌐 DEPLOY PARA INFINITYFREE

### **Passo 1: Criar Conta no InfinityFree**

1. Acesse: https://infinityfree.net/
2. Clique em **Sign Up**
3. Preencha os dados e confirme o email
4. Crie uma conta de hosting

### **Passo 2: Configurar Domínio**

Você receberá um domínio gratuito:
```
joka.ct.ws
```

Ou pode usar domínio próprio.

### **Passo 3: Build para InfinityFree**

```bash
# Build otimizado para InfinityFree
npm run build:infinityfree
```

Isso gera a pasta `out/` com todos os arquivos.

### **Passo 4: Upload via FTP**

**Opção A: FileZilla (Recomendado)**

1. Baixe: https://filezilla-project.org/
2. Instale e abra o FileZilla
3. Conecte ao InfinityFree:
   - **Host:** `ftpupload.net`
   - **Usuário:** Seu username do InfinityFree
   - **Senha:** Sua senha do InfinityFree
   - **Porta:** 21
4. Navegue até `/htdocs/`
5. **Limpe** a pasta `htdocs/` (apague tudo)
6. Arraste **TODO** o conteúdo de `out/` para `htdocs/`
7. Copie o arquivo `.htaccess` da raiz do projeto para `htdocs/`

**Opção B: Painel de Controle do InfinityFree**

1. Acesse o painel do InfinityFree
2. Vá em **File Manager**
3. Navegue até `htdocs/`
4. Apague todos os arquivos existentes
5. Clique em **Upload**
6. Selecione todos os arquivos da pasta `out/`
7. Aguarde o upload completar
8. Faça upload do `.htaccess` separadamente

### **Passo 5: Configurar .htaccess**

Certifique-se que o arquivo `.htaccess` está em `htdocs/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# GZIP Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/x-javascript "access plus 1 month"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

### **Passo 6: Verificar Deploy**

Acesse: `https://joka.ct.ws`

**✅ Sucesso:** Site carrega completamente  
**❌ Erro:** Veja seção [Troubleshooting](#troubleshooting)

---

## 🗄️ CONFIGURAÇÃO DO SUPABASE

### **Passo 1: Criar Projeto no Supabase**

1. Acesse: https://supabase.com/
2. Clique em **Start your project**
3. Faça login com GitHub
4. Clique em **New Project**
5. Preencha:
   - **Name:** `ecommerce-joka` (ou outro nome)
   - **Database Password:** Gere uma senha forte
   - **Region:** Escolha o mais próximo (Europe West)
6. Clique em **Create new project**

**Tempo estimado:** 2-3 minutos

### **Passo 2: Obter Credenciais**

1. No painel do Supabase, vá em **Settings** → **API**
2. Copie:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...`
3. Cole no arquivo `.env`:

```env
VITE_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
VITE_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
```

### **Passo 3: Criar Tabelas**

Execute os seguintes SQLs no **SQL Editor** do Supabase:

```sql
-- Tabela de Produtos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  promotional_price DECIMAL(10,2),
  category_id UUID REFERENCES categories(id),
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  sku TEXT UNIQUE,
  barcode TEXT,
  weight DECIMAL(10,2),
  dimensions TEXT,
  status TEXT DEFAULT 'active',
  type TEXT DEFAULT 'physical',
  tax_rate DECIMAL(5,2) DEFAULT 23,
  tax_enabled BOOLEAN DEFAULT true,
  country_origin TEXT,
  warehouse_location TEXT,
  is_dropshipping BOOLEAN DEFAULT false,
  images TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  tags TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Categorias
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  image TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_intent_id TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  shipping_address JSONB,
  billing_address JSONB,
  customer_email TEXT,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Itens do Pedido
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Configurações de IVA
CREATE TABLE tax_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  tax_type TEXT DEFAULT 'vat',
  rate DECIMAL(5,2) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  applies_to TEXT DEFAULT 'all',
  product_categories TEXT,
  min_amount DECIMAL(10,2) DEFAULT 0,
  max_amount DECIMAL(10,2) DEFAULT 0,
  is_compound BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Transações Financeiras
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Integração WooCommerce
CREATE TABLE integrations_woocommerce (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_url TEXT NOT NULL,
  consumer_key TEXT NOT NULL,
  consumer_secret TEXT NOT NULL,
  api_version TEXT DEFAULT 'wc/v3',
  use_ssl BOOLEAN DEFAULT true,
  products_only BOOLEAN DEFAULT true,
  sync_schedule TEXT DEFAULT 'manual',
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Mapeamento de Produtos WooCommerce
CREATE TABLE product_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  woo_product_id INTEGER NOT NULL,
  local_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT,
  last_synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Jobs de Importação WooCommerce
CREATE TABLE woocommerce_import_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT DEFAULT 'pending',
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Índices para Performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_tax_settings_country ON tax_settings(country);
CREATE INDEX idx_product_mappings_woo ON product_mappings(woo_product_id);
```

### **Passo 4: Configurar RLS (Row Level Security)**

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para Produtos (público pode ler, apenas admin pode escrever)
CREATE POLICY "Produtos são visíveis para todos"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Apenas admins podem criar produtos"
  ON products FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Apenas admins podem atualizar produtos"
  ON products FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para Pedidos (usuários veem apenas seus pedidos)
CREATE POLICY "Usuários veem apenas seus pedidos"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Usuários podem criar pedidos"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para Categorias (público pode ler)
CREATE POLICY "Categorias são visíveis para todos"
  ON categories FOR SELECT
  USING (true);

-- Políticas para IVA (público pode ler, apenas admin pode escrever)
CREATE POLICY "Configurações de IVA são visíveis para todos"
  ON tax_settings FOR SELECT
  USING (true);

CREATE POLICY "Apenas admins podem gerenciar IVA"
  ON tax_settings FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### **Passo 5: Criar Edge Functions (Stripe)**

No terminal, dentro da pasta do projeto:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Link com seu projeto
supabase link --project-ref SEU_PROJECT_REF

# Deploy das Edge Functions
supabase functions deploy process-stripe-payment
supabase functions deploy stripe-webhook
```

**✅ Sucesso:** Functions deployadas  
**❌ Erro:** Verifique se o Supabase CLI está instalado

---

## 🛒 INTEGRAÇÃO WOOCOMMERCE

### **Passo 1: Instalar WordPress no InfinityFree**

1. Acesse o painel do InfinityFree
2. Vá em **Softaculous Apps Installer**
3. Procure por **WordPress**
4. Clique em **Install**
5. Preencha:
   - **Choose Installation URL:** `https://store.joka.ct.ws`
   - **Site Name:** Sua Loja
   - **Admin Username:** admin
   - **Admin Password:** Senha forte
   - **Admin Email:** seu@email.com
6. Clique em **Install**

**Tempo estimado:** 5-10 minutos

### **Passo 2: Instalar WooCommerce**

1. Acesse: `https://store.joka.ct.ws/wp-admin`
2. Faça login com as credenciais criadas
3. Vá em **Plugins** → **Adicionar Novo**
4. Pesquise "WooCommerce"
5. Clique em **Instalar Agora**
6. Clique em **Ativar**
7. Siga o assistente de configuração do WooCommerce

### **Passo 3: Configurar Permalinks**

1. No WordPress, vá em **Configurações** → **Permalinks**
2. Selecione **Nome do post**
3. Clique em **Salvar alterações**

**⚠️ CRÍTICO:** Sem isso, a API REST não funciona!

### **Passo 4: Gerar Chaves de API**

1. No WordPress, vá em **WooCommerce** → **Configurações**
2. Clique na aba **Avançado**
3. Clique em **REST API**
4. Clique em **Adicionar chave**
5. Preencha:
   - **Descrição:** Integração E-commerce
   - **Utilizador:** Seu usuário admin
   - **Permissões:** **Leitura/Escrita**
6. Clique em **Gerar chave de API**
7. **COPIE IMEDIATAMENTE:**
   - **Consumer Key:** `ck_xxxxx`
   - **Consumer Secret:** `cs_xxxxx`

**⚠️ IMPORTANTE:** Você só verá o Consumer Secret UMA VEZ!

### **Passo 5: Configurar CORS**

**Método 1: Plugin Code Snippets (Recomendado)**

1. Instale o plugin **Code Snippets**
2. Vá em **Snippets** → **Adicionar Novo**
3. **Título:** CORS para E-commerce
4. **Código:**

```php
<?php
add_action('rest_api_init', function () {
    $allowed_origins = [
        'https://jokads.github.io',
        'https://joka.ct.ws'
    ];
    
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce");
        header("Access-Control-Allow-Credentials: true");
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
}, 15);
```

5. Marque **Executar snippet em todos os lugares**
6. Clique em **Salvar alterações e ativar**

### **Passo 6: Testar Conexão**

1. Acesse seu dashboard: `https://jokads.github.io/A/admin`
2. Vá em **Integrações** → **WooCommerce**
3. Preencha:
   - **URL da Loja:** `https://store.joka.ct.ws`
   - **Consumer Key:** `ck_xxxxx`
   - **Consumer Secret:** `cs_xxxxx`
   - **Versão da API:** `wc/v3`
   - ✅ **Usar SSL (HTTPS)**
4. Clique em **Testar Conexão**

**✅ Sucesso:** Conexão estabelecida!  
**❌ Erro:** Veja seção [Troubleshooting](#troubleshooting)

### **Passo 7: Importar Produtos**

1. No dashboard, clique em **Preview (50 produtos)**
2. Verifique se os produtos aparecem
3. Clique em **Importar Todos**
4. Aguarde a importação completar
5. Vá em **Produtos** para ver os produtos importados

---

## 💳 CONFIGURAÇÃO DO STRIPE

### **Passo 1: Criar Conta no Stripe**

1. Acesse: https://stripe.com/
2. Clique em **Sign up**
3. Preencha os dados e confirme o email
4. Complete o cadastro da empresa

### **Passo 2: Obter Chaves de API**

1. No dashboard do Stripe, vá em **Developers** → **API keys**
2. **Modo Teste:**
   - **Publishable key:** `pk_test_xxxxx`
   - **Secret key:** `sk_test_xxxxx`
3. **Modo Produção (quando ativar):**
   - **Publishable key:** `pk_live_xxxxx`
   - **Secret key:** `sk_live_xxxxx`

### **Passo 3: Adicionar Secret no Supabase**

1. No Supabase, vá em **Settings** → **Edge Functions** → **Secrets**
2. Adicione:
   - **Name:** `STRIPE_SECRET_KEY`
   - **Value:** `sk_test_xxxxx` (ou `sk_live_xxxxx` em produção)
3. Clique em **Add secret**

### **Passo 4: Configurar Webhook (Produção)**

1. No Stripe, vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. **Endpoint URL:** `https://SEU_PROJETO.supabase.co/functions/v1/stripe-webhook`
4. **Events to send:**
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
5. Clique em **Add endpoint**
6. Copie o **Signing secret:** `whsec_xxxxx`
7. Adicione no Supabase:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_xxxxx`

### **Passo 5: Testar Pagamento**

1. Acesse seu site
2. Adicione produtos ao carrinho
3. Vá para o checkout
4. Use cartão de teste:
   - **Número:** `4242 4242 4242 4242`
   - **Validade:** `12/25`
   - **CVV:** `123`
   - **Nome:** TESTE USUARIO
5. Clique em **Confirmar e Pagar**

**✅ Sucesso:** Pagamento processado!  
**❌ Erro:** Veja seção [Troubleshooting](#troubleshooting)

---

## 💰 SISTEMA DE IVA/TVA

### **Funcionalidades:**

- ✅ **Toggle Global:** Ativar/desativar IVA globalmente
- ✅ **Regras por País:** Configurar taxas diferentes por país
- ✅ **Controle Individual:** Ativar/desativar IVA por produto
- ✅ **Cálculo Automático:** IVA calculado automaticamente no checkout
- ✅ **Breakdown Detalhado:** Mostra preço sem IVA, IVA e total
- ✅ **IOSS Ready:** Conformidade com regulamentação UE

### **Como Configurar:**

#### **1. Ativar IVA Globalmente**

1. Acesse: Dashboard → **Impostos**
2. No topo, ative o toggle **IVA/TVA Global**
3. Quando ativo: IVA será calculado em todos os produtos
4. Quando desativo: Nenhum IVA será cobrado

#### **2. Criar Regras de IVA**

1. Clique em **Nova Regra de IVA**
2. Preencha:
   - **Nome:** IVA Portugal Standard
   - **País:** Portugal
   - **Taxa:** 23%
   - **Tipo:** IVA / VAT
   - ✅ **Regra Ativa**
   - ✅ **Definir como padrão**
3. Clique em **Salvar Regra**

**Exemplo de Regras:**

| País | Taxa | Tipo | Aplica-se a |
|------|------|------|-------------|
| Portugal | 23% | IVA | Todos os produtos |
| Portugal | 13% | IVA | Produtos alimentares |
| Portugal | 6% | IVA | Livros e jornais |
| França | 20% | TVA | Todos os produtos |
| Alemanha | 19% | MwSt | Todos os produtos |

#### **3. Configurar IVA por Produto**

1. Vá em **Produtos** → **Editar Produto**
2. Na seção **Preços & Financeiro**:
   - **Preço de Venda (sem IVA):** €100.00
   - **IVA/TVA neste Produto:** ✅ ATIVO
   - **Taxa IVA:** 23% (ou selecione outra)
3. O sistema mostra:
   - Preço sem IVA: €100.00
   - IVA (23%): €23.00
   - **Preço com IVA: €123.00**
4. Clique em **Salvar Produto**

#### **4. Desativar IVA em Produto Específico**

1. Edite o produto
2. Desative o toggle **IVA/TVA neste Produto**
3. O produto será vendido sem IVA
4. Útil para: Produtos isentos, exportações, etc.

### **Como Funciona no Checkout:**

```
┌─────────────────────────────────────┐
│  RESUMO DO PEDIDO                   │
├─────────────────────────────────────┤
│  Produto A (€100 + IVA 23%)         │
│  Subtotal: €100.00                  │
│  IVA (23%): €23.00                  │
│  ─────────────────────────────────  │
│  Total: €123.00                     │
│                                     │
│  Produto B (€50 - Isento IVA)       │
│  Subtotal: €50.00                   │
│  IVA: €0.00                         │
│  ─────────────────────────────────  │
│  Total: €50.00                      │
│                                     │
│  ═════════════════════════════════  │
│  TOTAL DO PEDIDO: €173.00           │
│  (IVA incluído: €23.00)             │
└─────────────────────────────────────┘
```

### **Conformidade Legal:**

✅ **IOSS (Import One-Stop Shop):**
- Sistema preparado para vendas B2C na UE
- Cálculo automático de IVA por país de destino
- Breakdown detalhado para declaração fiscal

✅ **Dropshipping:**
- Suporte a produtos de diferentes origens
- Cálculo de IVA baseado no país de destino
- Identificação de produtos dropshipping

✅ **Relatórios:**
- Total de IVA cobrado por período
- Breakdown por país
- Exportação para contabilidade

---

## 🐛 TROUBLESHOOTING

### **Problema: Página em branco no GitHub Pages**

**Causa:** Basename incorreto no build

**Solução:**
```bash
# Garantir que está usando o build correto
npm run build:github
npm run deploy:github
```

---

### **Problema: 404 ao navegar no InfinityFree**

**Causa:** `.htaccess` não configurado

**Solução:**
1. Verifique se `.htaccess` existe em `htdocs/`
2. Verifique permissões: 644
3. Verifique conteúdo (veja seção InfinityFree)

---

### **Problema: Assets não carregam (404)**

**Causa:** Arquivos não foram enviados corretamente

**Solução:**
1. Verifique se a pasta `assets/` existe
2. Verifique permissões: pastas 755, arquivos 644
3. Re-upload dos arquivos

---

### **Problema: Erro CORS ao conectar WooCommerce**

**Causa:** CORS não configurado no WordPress

**Solução:**
1. Verifique se o snippet CORS está ativo
2. Limpe cache do navegador
3. Teste em modo anônimo

---

### **Problema: "401 Unauthorized" no WooCommerce**

**Causa:** Credenciais inválidas

**Solução:**
1. Gere novas chaves no WordPress
2. Copie com cuidado (sem espaços)
3. Verifique permissões: "Leitura/Escrita"

---

### **Problema: Pagamento Stripe falha**

**Causa:** Secret key não configurada

**Solução:**
1. Verifique se `STRIPE_SECRET_KEY` está no Supabase
2. Verifique se está usando a chave correta (test/live)
3. Verifique logs no Stripe Dashboard

---

### **Problema: IVA não está sendo calculado**

**Causa:** IVA global desativado ou produto sem IVA

**Solução:**
1. Verifique se o toggle global está ATIVO
2. Verifique se o produto tem IVA ativado
3. Verifique se existe regra de IVA para o país

---

## 📊 CHECKLIST FINAL

### **Deploy GitHub Pages:**
- [ ] ✅ Repositório criado
- [ ] ✅ GitHub Pages ativado
- [ ] ✅ `npm run build:github` executado
- [ ] ✅ `npm run deploy:github` executado
- [ ] ✅ Site acessível em `https://jokads.github.io/A/`

### **Deploy InfinityFree:**
- [ ] ✅ Conta criada
- [ ] ✅ `npm run build:infinityfree` executado
- [ ] ✅ Arquivos enviados via FTP
- [ ] ✅ `.htaccess` configurado
- [ ] ✅ Site acessível em `https://joka.ct.ws`

### **Supabase:**
- [ ] ✅ Projeto criado
- [ ] ✅ Tabelas criadas
- [ ] ✅ RLS configurado
- [ ] ✅ Edge Functions deployadas
- [ ] ✅ Credenciais no `.env`

### **WooCommerce:**
- [ ] ✅ WordPress instalado
- [ ] ✅ WooCommerce ativo
- [ ] ✅ Permalinks configurados
- [ ] ✅ Chaves de API geradas
- [ ] ✅ CORS configurado
- [ ] ✅ Conexão testada
- [ ] ✅ Produtos importados

### **Stripe:**
- [ ] ✅ Conta criada
- [ ] ✅ Chaves obtidas
- [ ] ✅ Secret no Supabase
- [ ] ✅ Webhook configurado (produção)
- [ ] ✅ Pagamento testado

### **IVA/TVA:**
- [ ] ✅ Toggle global ativado
- [ ] ✅ Regras criadas
- [ ] ✅ Produtos configurados
- [ ] ✅ Cálculo testado no checkout

---

## 🎉 CONCLUSÃO

Parabéns! Seu e-commerce está completamente configurado e pronto para produção!

**O que você tem agora:**

✅ **Frontend Profissional:** React + TypeScript + TailwindCSS  
✅ **Backend Robusto:** Supabase com PostgreSQL  
✅ **Pagamentos Seguros:** Stripe com webhook  
✅ **Integração WooCommerce:** Sincronização automática de produtos  
✅ **Sistema de IVA:** Conformidade legal total  
✅ **Deploy em 2 Ambientes:** GitHub Pages + InfinityFree  
✅ **Performance Otimizada:** Build minificado e cache  
✅ **Segurança Máxima:** RLS, HTTPS, validações  

**Próximos Passos:**

1. 🎨 Personalizar design e cores
2. 📦 Adicionar mais produtos
3. 📧 Configurar emails transacionais
4. 📊 Configurar Google Analytics
5. 🚀 Ativar modo produção no Stripe
6. 📱 Testar em dispositivos móveis
7. 🔍 Otimizar SEO
8. 📈 Monitorar vendas e métricas

**Suporte:**

- 📧 Email: suporte@exemplo.com
- 💬 Discord: https://discord.gg/exemplo
- 📚 Documentação: https://docs.exemplo.com

---

**Versão:** 1.0.0  
**Última Atualização:** 2024  
**Licença:** MIT

**Desenvolvido com ❤️ para empreendedores digitais**
