# 🔧 TROUBLESHOOTING: WORDPRESS + WOOCOMMERCE

**Guia completo de resolução de problemas comuns**

---

## 📋 ÍNDICE

1. [Problemas de Instalação](#problemas-de-instalação)
2. [Problemas de API](#problemas-de-api)
3. [Problemas de CORS](#problemas-de-cors)
4. [Problemas de Permalinks](#problemas-de-permalinks)
5. [Problemas de Importação](#problemas-de-importação)
6. [Problemas de Performance](#problemas-de-performance)
7. [Problemas de InfinityFree](#problemas-de-infinityfree)

---

## 🚨 PROBLEMAS DE INSTALAÇÃO

### **Problema 1: Softaculous não instala WordPress**

**Sintomas:**
- Instalação fica travada em "Installing..."
- Erro: "Installation failed"

**Soluções:**

```bash
1. Verifica espaço em disco:
   VistaPanel → Disk Space
   → Deve ter pelo menos 500MB livres

2. Verifica limites:
   VistaPanel → Account Settings
   → Inodes limit: não pode estar no máximo

3. Tenta instalação manual:
   - Download WordPress: https://wordpress.org/download/
   - Upload via File Manager para /htdocs
   - Extrai ficheiros
   - Cria base de dados MySQL no VistaPanel
   - Acede: https://store.joka.ct.ws/wp-admin/install.php
```

### **Problema 2: "Error establishing database connection"**

**Sintomas:**
- Após instalação, site mostra erro de base de dados

**Soluções:**

```php
1. Verifica wp-config.php:
   File Manager → /htdocs/wp-config.php
   
   Confirma:
   define('DB_NAME', 'epiz_xxxxx_db123'); // Nome correto da BD
   define('DB_USER', 'epiz_xxxxx_user');  // User correto
   define('DB_PASSWORD', 'senha_correta'); // Senha correta
   define('DB_HOST', 'sql123.epizy.com'); // Host correto (não localhost!)

2. Testa conexão MySQL:
   VistaPanel → MySQL Databases
   → PhpMyAdmin → Tenta fazer login
   → Se não conseguir, recria user/password

3. Aguarda propagação:
   Base de dados pode demorar 5-10 minutos após criação
```

### **Problema 3: Página em branco após instalação**

**Sintomas:**
- Site mostra página completamente branca
- Sem mensagem de erro

**Soluções:**

```php
1. Ativa debug no wp-config.php:
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   define('WP_DEBUG_DISPLAY', true);
   
   Depois acede novamente e vê o erro mostrado

2. Aumenta memory limit:
   define('WP_MEMORY_LIMIT', '256M');

3. Verifica permissões de ficheiros:
   Pastas: 755
   Ficheiros: 644
   
   Via SSH (se tiveres acesso):
   find /htdocs -type d -exec chmod 755 {} \;
   find /htdocs -type f -exec chmod 644 {} \;

4. Desativa todos os plugins:
   File Manager → /htdocs/wp-content/plugins/
   → Renomeia pasta para "plugins-disabled"
   → Tenta aceder novamente
```

---

## 🔌 PROBLEMAS DE API

### **Problema 1: Erro 404 em /wp-json/**

**Sintomas:**
```bash
curl https://store.joka.ct.ws/wp-json/
# Retorna: 404 Not Found
```

**Causa:** Permalinks não configurados

**Solução:**

```bash
1. WordPress Admin → Definições → Permalinks
2. Seleciona: "Nome do post" (Post name)
3. Clica: "Guardar alterações"
4. Aguarda 30 segundos
5. Testa novamente:
   curl -I https://store.joka.ct.ws/wp-json/
   → Deve retornar: HTTP/2 200 ✅

6. Se ainda der erro, verifica .htaccess:
   File Manager → /htdocs/.htaccess
   → Deve conter regras WordPress (ver exemplo em DEPLOY_WORDPRESS_COMPLETE.md)

7. Se .htaccess não existe, cria manualmente:
   File Manager → Create New File → .htaccess
   → Cola conteúdo do guia de deploy
```

### **Problema 2: Erro 401 Unauthorized**

**Sintomas:**
```bash
curl -u ck_xxx:cs_xxx https://store.joka.ct.ws/wp-json/wc/v3/products
# Retorna: 401 Unauthorized
```

**Causas possíveis:**

```bash
1. Chaves API inválidas
   → Solução: Gera novas chaves no WordPress Admin

2. Authorization header não está a passar
   → Solução: Adiciona no .htaccess:
   SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
   
   Ou:
   RewriteEngine On
   RewriteCond %{HTTP:Authorization} ^(.*)
   RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]

3. Servidor bloqueia Authorization header
   → Solução: Usa queryStringAuth:
   
   No import-products.js:
   const WooCommerce = new WooCommerceAPI({
     // ...
     queryStringAuth: true, // ✅ Adiciona isto
   });
```

### **Problema 3: Erro "woocommerce_rest_cannot_view"**

**Sintomas:**
```json
{
  "code": "woocommerce_rest_cannot_view",
  "message": "Sorry, you cannot list resources.",
  "data": {"status": 401}
}
```

**Causa:** Chaves API sem permissões corretas

**Solução:**

```bash
1. WordPress Admin → WooCommerce → Configurações
2. Tab "Avançado" → "REST API"
3. Clica na chave API que estás a usar
4. Permissions: Seleciona "Read/Write" ✅
5. Clica "Gerar chave API novamente" (regenerate)
6. Copia NOVAS chaves (as antigas ficam inválidas)
7. Atualiza no teu .env:
   WC_CONSUMER_KEY=ck_[nova_chave]
   WC_CONSUMER_SECRET=cs_[nova_chave]
```

### **Problema 4: Erro "rest_no_route"**

**Sintomas:**
```json
{
  "code": "rest_no_route",
  "message": "No route was found matching the URL and request method",
  "data": {"status": 404}
}
```

**Causas possíveis:**

```bash
1. URL incorreta
   ❌ Errado: https://store.joka.ct.ws/wc/v3/products
   ✅ Correto: https://store.joka.ct.ws/wp-json/wc/v3/products

2. Versão API incorreta
   ❌ wc/v2 (deprecated)
   ✅ wc/v3 (atual)

3. WooCommerce não instalado/ativo
   → Verifica: WordPress Admin → Plugins
   → WooCommerce deve estar "Active"

4. Permalinks não configurados
   → Ver solução no Problema 1 desta secção
```

---

## 🌐 PROBLEMAS DE CORS

### **Problema 1: Erro "CORS policy" no browser**

**Sintomas:**
```
Access to fetch at 'https://store.joka.ct.ws/wp-json/wc/v3/products' 
from origin 'https://joka.ct.ws' has been blocked by CORS policy
```

**Causa:** Headers CORS não configurados

**Solução:**

```php
1. Adiciona no wp-config.php (ANTES de "That's all"):

header('Access-Control-Allow-Origin: https://joka.ct.ws');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    status_header(200);
    exit();
}

2. OU adiciona no .htaccess:

<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "https://joka.ct.ws"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header always set Access-Control-Allow-Credentials "true"
</IfModule>

3. Testa:
curl -I -H "Origin: https://joka.ct.ws" https://store.joka.ct.ws/wp-json/

Deve retornar:
Access-Control-Allow-Origin: https://joka.ct.ws ✅

4. Se não funcionar, instala plugin:
WordPress Admin → Plugins → Add New
→ Procura: "WP CORS"
→ Instala e ativa
→ Configurações: Allowed Origins = https://joka.ct.ws
```

### **Problema 2: Preflight OPTIONS falha**

**Sintomas:**
```
Browser envia OPTIONS request
Servidor retorna 403 ou 404
```

**Solução:**

```php
1. Adiciona handler para OPTIONS no wp-config.php:

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: https://joka.ct.ws');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    status_header(200);
    exit();
}

2. Adiciona no .htaccess (no início):

RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]
```

---

## 🔗 PROBLEMAS DE PERMALINKS

### **Problema 1: Permalinks não salvam**

**Sintomas:**
- Configuras "Post name" e salvas
- Ao voltar, está em "Plain" novamente

**Causa:** .htaccess não é gravável

**Solução:**

```bash
1. Verifica permissões de .htaccess:
   File Manager → .htaccess → Permissions
   → Deve ser 644 (rw-r--r--)
   
   Se não for, muda para 644

2. Se .htaccess não existe, cria:
   File Manager → Create New File → .htaccess
   → Permissions: 644
   → Adiciona conteúdo WordPress base

3. Tenta salvar permalinks novamente

4. Se ainda não funcionar, adiciona MANUALMENTE no .htaccess:

# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
```

### **Problema 2: Posts/Pages dão 404**

**Sintomas:**
- Homepage funciona
- Qualquer post/page dá erro 404

**Causa:** mod_rewrite não ativo ou .htaccess não funciona

**Solução:**

```bash
1. Testa se mod_rewrite está ativo:
   Cria ficheiro test-rewrite.php em /htdocs:
   
   <?php
   if (function_exists('apache_get_modules')) {
       $modules = apache_get_modules();
       if (in_array('mod_rewrite', $modules)) {
           echo 'mod_rewrite está ATIVO ✅';
       } else {
           echo 'mod_rewrite NÃO está ativo ❌';
       }
   } else {
       echo 'Não é possível verificar (pode estar ativo na mesma)';
   }
   
   Acede: https://store.joka.ct.ws/test-rewrite.php

2. Se mod_rewrite NÃO está ativo:
   → InfinityFree: mod_rewrite está ativo por padrão
   → Problema pode ser AllowOverride no servidor
   → Contacta suporte InfinityFree

3. Se mod_rewrite está ativo mas não funciona:
   → Usa "Plain" permalinks (não ideal, mas funciona):
   Permalinks → Plain → Save
   URLs ficam: ?p=123

4. Alternativa - usa nginx-style permalinks:
   Permalinks → Custom Structure:
   /index.php/%postname%/
```

---

## 📦 PROBLEMAS DE IMPORTAÇÃO

### **Problema 1: Importação muito lenta**

**Sintomas:**
- Demora mais de 1 segundo por produto

**Soluções:**

```javascript
1. Reduz delay no import-products.js:
   await new Promise(resolve => setTimeout(resolve, 200)); // 200ms em vez de 500ms

2. Desativa plugins desnecessários durante importação:
   WordPress Admin → Plugins
   → Desativa temporariamente: SEO, Cache, Analytics

3. Aumenta limites PHP:
   .htaccess (adiciona):
   php_value max_execution_time 600
   php_value memory_limit 512M

4. Usa batch import (importar em lotes):
   
   # Importa primeiros 100
   head -n 101 products.csv > batch1.csv
   INPUT_FILE=batch1.csv node import-products.js --apply
   
   # Depois próximos 100
   sed -n '102,201p' products.csv > batch2.csv
   INPUT_FILE=batch2.csv node import-products.js --apply
```

### **Problema 2: Imagens não importam**

**Sintomas:**
- Produtos criados mas sem imagens

**Causas e soluções:**

```bash
1. URLs inválidas:
   → Verifica se URLs são públicas e acessíveis
   → Testa: curl -I https://url-da-imagem.jpg
   → Deve retornar 200 OK

2. URLs HTTP em vez de HTTPS:
   → Muda todas para HTTPS
   → InfinityFree pode bloquear HTTP externo

3. Servidor bloqueia downloads externos:
   → InfinityFree tem limite de requests externos
   → Solução: Upload manual de imagens
   
   WordPress Admin → Media → Add New
   → Upload todas as imagens
   → Depois importa produtos referenciando URLs locais:
   https://store.joka.ct.ws/wp-content/uploads/2024/01/imagem.jpg

4. Tamanho de imagem muito grande:
   → InfinityFree limita upload a ~10MB
   → Redimensiona imagens antes:
   
   # Linux/Mac (requer imagemagick):
   mogrify -resize 1920x1920\> *.jpg
```

### **Problema 3: Erro "SKU already exists"**

**Sintomas:**
```json
{
  "code": "product_invalid_sku",
  "message": "Product SKU is already in use"
}
```

**Causa:** SKU duplicado

**Soluções:**

```bash
1. Se queres atualizar produto existente:
   node import-products.js --apply --update

2. Se queres criar novo produto:
   → Muda o SKU no CSV para ser único
   → Ou remove campo SKU (será gerado automaticamente)

3. Encontra produto com SKU duplicado:
   WordPress Admin → Products → Search: [SKU]
   → Apaga ou edita o existente
```

### **Problema 4: Categorias não criadas**

**Sintomas:**
- Produtos importados mas sem categorias

**Solução:**

```javascript
1. Verifica formato no CSV:
   category → "Informática;Laptops;Gaming"
   (separar com ; e sem espaços extra)

2. Se categorias têm acentos:
   → Confirma que CSV está em UTF-8
   → No Excel: Save As → CSV UTF-8

3. Cria categorias manualmente primeiro:
   WordPress Admin → Products → Categories
   → Cria todas as categorias necessárias
   → Depois importa produtos (vão usar as existentes)

4. Script para criar categorias automaticamente:
   
   // Adiciona no import-products.js (antes de processar produtos):
   async function ensureCategories(categoryNames) {
     for (const name of categoryNames) {
       // Verifica se existe
       const existing = await WooCommerce.get(`products/categories?search=${name}`);
       if (existing.length === 0) {
         // Cria
         await WooCommerce.post('products/categories', { name });
       }
     }
   }
```

---

## ⚡ PROBLEMAS DE PERFORMANCE

### **Problema 1: Site muito lento**

**Soluções:**

```php
1. Instala plugin de cache:
   → W3 Total Cache (grátis)
   → WP Super Cache (grátis)
   → LiteSpeed Cache (se servidor tiver LiteSpeed)

2. Otimiza imagens:
   → Plugin Smush (comprime imagens automaticamente)
   → Ou usa TinyPNG antes de upload

3. Ativa compressão GZIP (.htaccess):
   Já incluído no .htaccess fornecido ✅

4. Limita revisões de posts (wp-config.php):
   define('WP_POST_REVISIONS', 3);

5. Limpa base de dados:
   Plugin: WP-Optimize
   → Remove revisões antigas, spam, transients

6. Desativa plugins não usados:
   → Jetpack (pesado)
   → Akismet (se não tens comentários)
   → Hello Dolly (inútil)

7. Usa CDN gratuito:
   → Cloudflare (grátis)
   → Adiciona site ao Cloudflare
   → Muda DNS para apontar para Cloudflare
```

### **Problema 2: Timeout errors**

**Sintomas:**
```
504 Gateway Timeout
502 Bad Gateway
500 Internal Server Error
```

**Soluções:**

```php
1. Aumenta limites no .htaccess:
   php_value max_execution_time 300
   php_value max_input_time 300
   php_value memory_limit 256M

2. Aumenta limites no wp-config.php:
   define('WP_MEMORY_LIMIT', '256M');
   define('WP_MAX_MEMORY_LIMIT', '512M');

3. Se acontece na importação:
   → Importa em lotes menores
   → Aumenta delay entre requests

4. Se acontece no admin:
   → Desativa plugins um por um para identificar culpado
   → Atualiza WordPress e plugins

5. InfinityFree tem limites:
   → Max execution time: 60s (não pode aumentar muito)
   → Hits/hora: 50.000
   → Se exceder, aguarda 1 hora ou upgrade para premium
```

---

## 🌐 PROBLEMAS ESPECÍFICOS DO INFINITYFREE

### **Problema 1: "CPU Limit Exceeded"**

**Sintomas:**
```
508 Resource Limit Is Reached
Your account has exceeded its CPU usage limit
```

**Causa:** Conta gratuita tem limite de CPU

**Soluções:**

```bash
1. Aguarda 1 hora (limite é por hora, não diário)

2. Otimiza para usar menos CPU:
   → Instala plugin de cache
   → Reduz frequência de cron jobs
   → Desativa WP-Cron e usa cron real:
   
   wp-config.php:
   define('DISABLE_WP_CRON', true);

3. Limita requests:
   → Não faças muitas importações seguidas
   → Usa delay maior entre requests (1000ms)

4. Considera upgrade:
   → InfinityFree Premium (sem limites CPU)
   → Ou migra para outro hosting (Hostinger, SiteGround)
```

### **Problema 2: Ficheiros desaparecem**

**Sintomas:**
- Uploads/plugins desaparecem após alguns dias

**Causa:** InfinityFree apaga contas inativas

**Solução:**

```bash
1. Mantém conta ativa:
   → Faz login no VistaPanel semanalmente
   → Ou cria script que acede ao site diariamente:
   
   # Cron job no teu PC/servidor:
   0 8 * * * curl -s https://store.joka.ct.ws/ > /dev/null

2. Backups regulares:
   → Plugin UpdraftPlus (backups automáticos)
   → Ou download manual semanal via FTP

3. Confirma email de ativação:
   → InfinityFree envia emails a cada 30 dias
   → SEMPRE clica no link de confirmação
```

### **Problema 3: "Account Suspended"**

**Sintomas:**
```
This Account Has Been Suspended
Contact your hosting provider for more information
```

**Causas possíveis:**

```bash
1. Não clicou no email de ativação mensal
   → InfinityFree envia email a cada 30 dias
   → DEVE clicar no link para manter ativa
   → Solução: Contacta suporte para reativar

2. Violou Terms of Service:
   → Phishing, malware, spam
   → Proxy, VPN, TOR exit node
   → Revê: https://www.infinityfree.net/tos

3. Abuso de recursos:
   → Excesso de CPU/bandwidth consistente
   → Solução: Otimiza ou faz upgrade

4. Domínio expirado:
   → Subdomínio .ct.ws pode expirar
   → Renova no VistaPanel → Domains
```

### **Problema 4: SSL não funciona (HTTPS)**

**Sintomas:**
```
https://store.joka.ct.ws → "Not Secure" ou erro certificado
```

**Solução:**

```bash
1. Ativa SSL no VistaPanel:
   Security → SSL Certificates
   → Deve mostrar "Free InfinityFree SSL" → ACTIVE
   
   Se não estiver ativo:
   → Clica "Activate"
   → Aguarda 10-30 minutos

2. Força HTTPS no WordPress:
   wp-config.php (adiciona):
   define('FORCE_SSL_ADMIN', true);
   
   if (strpos($_SERVER['HTTP_X_FORWARDED_PROTO'], 'https') !== false) {
       $_SERVER['HTTPS'] = 'on';
   }

3. Atualiza URLs na base de dados:
   WordPress Admin → Settings → General
   → WordPress Address (URL): https://store.joka.ct.ws
   → Site Address (URL): https://store.joka.ct.ws
   → Save

4. Redireciona HTTP → HTTPS (.htaccess no início):
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 📞 RECURSOS ADICIONAIS

### **Documentação Oficial:**
- WordPress: https://wordpress.org/documentation/
- WooCommerce: https://woocommerce.com/documentation/
- WooCommerce REST API: https://woocommerce.github.io/woocommerce-rest-api-docs/

### **Suporte InfinityFree:**
- Fórum: https://forum.infinityfree.net/
- Knowledge Base: https://infinityfree.net/support/

### **Ferramentas de Teste:**
- REST API: Postman (https://www.postman.com/)
- CORS: https://www.test-cors.org/
- SSL: https://www.ssllabs.com/ssltest/

### **Ficheiros deste pacote:**
```bash
DEPLOY_WORDPRESS_COMPLETE.md  → Instalação passo a passo
IMPORT_PRODUCTS_README.md     → Guia de importação
TROUBLESHOOTING_WOOCOMMERCE.md → Este ficheiro (resolução problemas)
BUILD_GUIDE.md                → Deploy frontend
scripts/import-products.js    → Script de importação
scripts/test-woocommerce-api.sh → Teste da API
```

---

## ✅ CHECKLIST DE DIAGNÓSTICO

Quando tiveres um problema, segue esta ordem:

```bash
1. ✅ WordPress está instalado e acessível?
   → Acede: https://store.joka.ct.ws
   → Deve mostrar site WordPress (não erro)

2. ✅ Permalinks configurados?
   → Settings → Permalinks → "Post name"
   → Teste: curl -I https://store.joka.ct.ws/wp-json/
   → Deve: 200 OK

3. ✅ WooCommerce instalado e ativo?
   → Plugins → WooCommerce → Active

4. ✅ Chaves API criadas?
   → WooCommerce → Settings → Advanced → REST API
   → Deve ter pelo menos 1 chave

5. ✅ Chaves API têm permissões Read/Write?
   → Edita chave → Permissions: Read/Write

6. ✅ CORS configurado?
   → curl -I -H "Origin: https://joka.ct.ws" https://store.joka.ct.ws/wp-json/
   → Deve: Access-Control-Allow-Origin: https://joka.ct.ws

7. ✅ API funciona?
   → cd scripts/
   → ./test-woocommerce-api.sh
   → Todos os testes devem passar

8. ✅ Se tudo acima passou e ainda não funciona:
   → Lê erro específico
   → Procura neste ficheiro
   → Ou contacta suporte
```

---

**AGORA TENS TUDO PARA RESOLVER QUALQUER PROBLEMA!** 🚀

Se encontrares um erro não documentado aqui, segue este processo:

1. **Copia mensagem de erro completa**
2. **Google:** "[erro] + woocommerce + infinityfree"
3. **Verifica logs:** File Manager → /htdocs/wp-content/debug.log
4. **Pergunta no fórum:** https://forum.infinityfree.net/
