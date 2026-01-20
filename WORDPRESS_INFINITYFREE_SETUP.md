# 🚀 Guia Completo: WordPress + WooCommerce no InfinityFree

Este guia vai te ajudar a configurar o WordPress com WooCommerce no InfinityFree e conectar ao seu site em joka.ct.ws.

---

## 📋 Índice

1. [Criar Conta no InfinityFree](#1-criar-conta-no-infinityfree)
2. [Configurar Domínio](#2-configurar-domínio)
3. [Instalar WordPress](#3-instalar-wordpress)
4. [Instalar e Configurar WooCommerce](#4-instalar-e-configurar-woocommerce)
5. [Gerar Chaves API](#5-gerar-chaves-api)
6. [Configurar CORS](#6-configurar-cors)
7. [Testar Integração](#7-testar-integração)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Criar Conta no InfinityFree

### Passo a Passo:

1. **Acesse:** https://infinityfree.net/
2. **Clique em** "Sign Up"
3. **Preencha:**
   - Nome de usuário
   - Email
   - Senha
4. **Verifique** o email de confirmação
5. **Faça login** no painel de controle

---

## 2. Configurar Domínio

### Opção A: Usar Subdomínio Grátis

1. **No painel InfinityFree**, clique em "Create Account"
2. **Escolha** "Use a free subdomain"
3. **Digite:** `store` (ficará: store.joka.ct.ws)
4. **Clique em** "Create Account"

### Opção B: Usar Domínio Próprio

1. **No painel InfinityFree**, clique em "Create Account"
2. **Escolha** "Use your own domain"
3. **Digite:** store.joka.ct.ws
4. **Configure DNS** (veja seção abaixo)

### Configurar DNS (se usar domínio próprio):

1. **Acesse** o painel do seu provedor de DNS
2. **Adicione** registro A ou CNAME:
   ```
   Tipo: A
   Nome: store
   Valor: [IP do InfinityFree]
   TTL: 3600
   ```
3. **Aguarde** propagação (pode levar até 48h)

---

## 3. Instalar WordPress

### Via Softaculous (Recomendado):

1. **No painel InfinityFree**, clique em "Softaculous"
2. **Procure** por "WordPress"
3. **Clique em** "Install"
4. **Preencha:**
   - **Software Setup:**
     - Choose Protocol: `https://` (se tiver SSL)
     - Choose Domain: `store.joka.ct.ws`
     - In Directory: (deixe vazio para instalar na raiz)
   
   - **Site Settings:**
     - Site Name: `JokaTech Store`
     - Site Description: `Loja Online JokaTech`
   
   - **Admin Account:**
     - Admin Username: `admin` (ou outro que preferir)
     - Admin Password: [senha forte]
     - Admin Email: jokadamas616@gmail.com
   
   - **Choose Language:** Portuguese (Brazil)
   
5. **Clique em** "Install"
6. **Aguarde** 2-5 minutos
7. **Anote** as credenciais de acesso

### Via Upload Manual (Alternativa):

1. **Baixe** WordPress: https://wordpress.org/download/
2. **Extraia** o arquivo .zip
3. **Acesse** File Manager no InfinityFree
4. **Navegue** para `/htdocs/`
5. **Faça upload** de todos os arquivos
6. **Crie** banco de dados no painel MySQL
7. **Acesse** http://store.joka.ct.ws/wp-admin/install.php
8. **Siga** o assistente de instalação

---

## 4. Instalar e Configurar WooCommerce

### Instalar WooCommerce:

1. **Acesse:** https://store.joka.ct.ws/wp-admin
2. **Faça login** com suas credenciais
3. **Navegue:** Plugins → Adicionar Novo
4. **Procure** por "WooCommerce"
5. **Clique em** "Instalar Agora"
6. **Clique em** "Ativar"

### Configurar WooCommerce:

1. **O assistente** de configuração vai abrir automaticamente
2. **Preencha:**
   - **Detalhes da Loja:**
     - Endereço: [seu endereço]
     - País: Portugal
     - Moeda: Euro (€)
   
   - **Indústria:** Selecione a categoria do seu negócio
   
   - **Tipos de Produto:** Produtos físicos (ou o que se aplica)
   
   - **Detalhes do Negócio:**
     - Quantos produtos planeia vender: [número]
     - Já vende em outro lugar: [sim/não]
   
3. **Clique em** "Continuar" em cada etapa
4. **Pule** instalação de temas/extensões extras (se quiser)
5. **Clique em** "Concluir configuração"

### Configurar Permalinks (CRÍTICO!):

1. **Navegue:** Configurações → Permalinks
2. **Selecione:** "Nome do artigo"
3. **Clique em** "Guardar alterações"

⚠️ **IMPORTANTE:** Sem isso, a API REST não vai funcionar!

---

## 5. Gerar Chaves API

### Criar Chaves API do WooCommerce:

1. **Navegue:** WooCommerce → Configurações → Avançado → REST API
2. **Clique em** "Adicionar chave"
3. **Preencha:**
   - **Descrição:** `Integração JokaTech Site`
   - **Usuário:** Selecione seu usuário admin
   - **Permissões:** `Leitura/Escrita` (Read/Write)
4. **Clique em** "Gerar chave API"
5. **COPIE IMEDIATAMENTE** as chaves:
   ```
   Consumer key: ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Consumer secret: cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

⚠️ **MUITO IMPORTANTE:** 
- As chaves só aparecem UMA VEZ!
- Salve em local seguro
- Nunca compartilhe publicamente

---

## 6. Configurar CORS

### No WordPress (wp-config.php):

1. **Acesse** File Manager no InfinityFree
2. **Navegue** para a raiz do WordPress
3. **Edite** o arquivo `wp-config.php`
4. **Adicione** antes de `/* That's all, stop editing! */`:

```php
// CORS para integração com joka.ct.ws
header('Access-Control-Allow-Origin: https://joka.ct.ws');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
```

5. **Salve** o arquivo

### No .htaccess (Alternativa):

1. **Acesse** File Manager no InfinityFree
2. **Navegue** para a raiz do WordPress
3. **Edite** o arquivo `.htaccess`
4. **Adicione** no topo (antes das regras do WordPress):

```apache
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "https://joka.ct.ws"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
  Header set Access-Control-Allow-Credentials "true"
</IfModule>
```

5. **Salve** o arquivo

---

## 7. Testar Integração

### Verificar se WordPress está funcionando:

1. **Abra o navegador**
2. **Acesse:** https://store.joka.ct.ws
3. **Deve aparecer:** Página inicial do WordPress/WooCommerce

### Verificar se API REST está ativa:

1. **Abra o navegador**
2. **Acesse:** https://store.joka.ct.ws/wp-json/
3. **Deve aparecer:** JSON com informações da API
4. **Procure** por `"namespaces"` → deve conter `"wc/v3"`

### Testar Chaves API:

1. **Abra** https://joka.ct.ws/admin
2. **Navegue:** Integrações → WooCommerce
3. **Preencha:**
   - **URL da Loja:** `https://store.joka.ct.ws` ou `store.joka.ct.ws`
   - **Consumer Key:** `ck_...`
   - **Consumer Secret:** `cs_...`
   - **Versão da API:** `wc/v3`
   - **Usar SSL:** ✅ (marcado)
4. **Clique em** "Testar Conexão"
5. **Deve aparecer:** ✅ Conexão estabelecida com sucesso!

### Importar Produtos:

1. **Se o teste passou**, clique em "Salvar Conexão"
2. **Configure** as opções de importação
3. **Clique em** "Preview" para ver os primeiros 50 produtos
4. **Clique em** "Importar Todos" para importar tudo

---

## 8. Troubleshooting

### ❌ Erro: "Site não está acessível"

**Causas:**
- WordPress não foi instalado
- Domínio não está apontando corretamente
- Conta InfinityFree suspensa

**Soluções:**
1. Abra https://store.joka.ct.ws no navegador
2. Se aparecer página em branco → instale WordPress
3. Se aparecer erro de DNS → aguarde propagação (até 48h)
4. Se aparecer "Account Suspended" → entre em contato com InfinityFree

---

### ❌ Erro: "API REST não está acessível"

**Causas:**
- Permalinks não configurados
- Arquivo .htaccess corrompido
- mod_rewrite não está ativo

**Soluções:**
1. **WordPress Admin** → Configurações → Permalinks
2. Selecione "Nome do artigo"
3. Clique em "Guardar alterações"
4. Teste novamente

---

### ❌ Erro: "WooCommerce não está instalado"

**Causas:**
- Plugin WooCommerce não foi instalado
- Plugin está desativado

**Soluções:**
1. **WordPress Admin** → Plugins
2. Procure por "WooCommerce"
3. Se não aparecer → instale via "Adicionar Novo"
4. Se aparecer mas está inativo → clique em "Ativar"

---

### ❌ Erro: "Credenciais inválidas (erro 401)"

**Causas:**
- Consumer Key ou Consumer Secret incorretos
- Chaves foram revogadas
- Permissões da chave estão erradas

**Soluções:**
1. **WordPress Admin** → WooCommerce → Configurações → Avançado → REST API
2. Verifique se a chave existe e está ativa
3. Se necessário, **crie uma nova chave**:
   - Descrição: "Nova Integração"
   - Permissões: "Leitura/Escrita"
   - Gerar chave API
4. Copie as novas chaves
5. Cole no site joka.ct.ws/admin
6. Teste novamente

---

### ❌ Erro: "Endpoint não encontrado (erro 404)"

**Causas:**
- Versão da API incorreta
- Permalinks não configurados

**Soluções:**
1. Tente mudar a versão da API para `wc/v3`
2. Reconfigure os permalinks:
   - Configurações → Permalinks → Nome do artigo → Salvar
3. Teste novamente

---

### ❌ Erro de CORS

**Causas:**
- CORS não está configurado no WordPress
- Headers não estão sendo enviados

**Soluções:**
1. **Adicione CORS no wp-config.php** (veja seção 6)
2. **OU adicione no .htaccess** (veja seção 6)
3. **Limpe o cache** do navegador
4. **Teste novamente**

---

### ❌ Erro: "Timeout"

**Causas:**
- Servidor InfinityFree está lento
- Muitos produtos para processar

**Soluções:**
1. **Desmarque** "Usar SSL" temporariamente
2. **Importe em lotes menores**:
   - Clique em "Preview" (apenas 50 produtos)
   - Depois importe o resto
3. **Aguarde** alguns minutos entre importações
4. **Configure** sincronização automática (horária, diária)

---

## 📊 Checklist Final

Antes de começar a usar, verifique:

- [ ] WordPress instalado e funcionando
- [ ] WooCommerce instalado e ativo
- [ ] Permalinks configurados ("Nome do artigo")
- [ ] Chaves API geradas (Consumer Key e Secret)
- [ ] CORS configurado (wp-config.php ou .htaccess)
- [ ] Teste de conexão passou (✅ verde)
- [ ] Conexão salva com sucesso
- [ ] Produtos importados corretamente

---

## 🆘 Suporte

Se ainda tiver problemas:

1. **Verifique** os logs de erro do WordPress:
   - WordPress Admin → Ferramentas → Saúde do Site
   
2. **Verifique** os logs do InfinityFree:
   - Painel InfinityFree → Error Logs

3. **Entre em contato:**
   - Email: jokadamas616@gmail.com
   - WhatsApp: +352 621 717 862

---

## 🎉 Pronto!

Após seguir todos os passos, você terá:

✅ WordPress + WooCommerce funcionando no InfinityFree  
✅ API REST ativa e acessível  
✅ Integração com joka.ct.ws funcionando  
✅ Produtos sincronizados automaticamente  
✅ Gestão completa pelo dashboard  

**Agora é só adicionar produtos no WooCommerce e eles aparecerão automaticamente no seu site!** 🚀
