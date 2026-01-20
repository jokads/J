# 🚀 GUIA COMPLETO DE DEPLOY: WordPress + WooCommerce

**Versão:** 1.0  
**Domínios:**  
- Frontend SPA: `https://joka.ct.ws` (InfinityFree)  
- Backend WooCommerce: `https://store.joka.ct.ws` (InfinityFree/GitHub Pages)  
- Repositório: `https://github.com/jokads/J`

---

## 📋 ÍNDICE

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação WordPress/WooCommerce](#instalação-wordpresswoocommerce)
3. [Configuração Domínios e DNS](#configuração-domínios-e-dns)
4. [Configuração Ficheiros (.htaccess, wp-config.php)](#configuração-ficheiros)
5. [Gerar Chaves API WooCommerce](#gerar-chaves-api-woocommerce)
6. [Deploy Frontend SPA](#deploy-frontend-spa)
7. [Validação e Testes](#validação-e-testes)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 PRÉ-REQUISITOS

### **Contas Necessárias:**
- ✅ **InfinityFree Account** (principal): `joka.ct.ws`
- ✅ **InfinityFree Account** (WooCommerce): `store.joka.ct.ws` (RECOMENDADO)
- ✅ **GitHub Account**: `jokads/J`

### **Ferramentas Locais:**
```bash
✅ Node.js v18+ (npm -v)
✅ Git (git --version)
✅ cURL (curl --version)
✅ Editor de texto (VS Code recomendado)
```

### **Opções de Arquitetura:**

#### **OPÇÃO A: Subdomínio Separado (RECOMENDADO! ⭐)**
```
Frontend SPA:     https://joka.ct.ws (InfinityFree conta principal)
Backend WP:       https://store.joka.ct.ws (InfinityFree conta separada)

✅ Permalinks funcionam perfeitamente
✅ API REST 100% funcional
✅ Sem conflitos com SPA
✅ Fácil de configurar
✅ Melhor performance
✅ Isolamento total
```

#### **OPÇÃO B: Subpasta (MAIS COMPLEXO ⚠️)**
```
Frontend SPA:     https://joka.ct.ws (raiz)
Backend WP:       https://joka.ct.ws/wp (subpasta)

⚠️ Permalinks mais difíceis
⚠️ Conflitos de .htaccess
⚠️ Requer configuração avançada
⚠️ CORS mais complexo
```

**→ Este guia usa OPÇÃO A (subdomínio separado)**

---

## 📦 INSTALAÇÃO WORDPRESS/WOOCOMMERCE

### **Passo 1: Criar Conta InfinityFree para WooCommerce**

1. **Acede:** https://infinityfree.net
2. **Clica:** "Sign Up" (registo gratuito)
3. **Preenche:**
   - Email
   - Password
   - Username

4. **Confirma email** (verifica caixa de entrada e spam)

5. **Login** no painel VistaPanel

### **Passo 2: Criar Subdomínio `store.joka.ct.ws`**

#### **No VistaPanel:**

1. **Vai para:** "Domains" → "Subdomains"

2. **Preenche:**
   ```
   Subdomain: store
   Domain: joka.ct.ws
   Document Root: /htdocs
   ```

3. **Clica:** "Create Subdomain"

4. **Aguarda:** 5-10 minutos para propagação DNS

5. **Testa:** Acede `https://store.joka.ct.ws`
   - Deve mostrar página padrão InfinityFree ou erro 404 (normal)

### **Passo 3: Instalar WordPress via Softaculous**

#### **No VistaPanel:**

1. **Vai para:** "Software" → "Softaculous Apps Installer"

2. **Procura:** "WordPress" → Clica no ícone

3. **Clica:** "Install Now"

4. **Configuração da Instalação:**

```yaml
Choose Installation URL:
  Protocol: https:// ✅ (importante!)
  Choose Domain: store.joka.ct.ws ✅
  In Directory: (DEIXAR VAZIO!) ✅

Site Settings:
  Site Name: JokaTech Store
  Site Description: Backend WooCommerce para JokaTech
  
Admin Account:
  Admin Username: jokaadmin (guarda isto!)
  Admin Password: [SENHA FORTE - guarda isto!]
  Admin Email: teu@email.com
  
Advanced Options:
  Database Name: (automático - deixar sugerido)
  Table Prefix: wp_ (padrão)
  Disable Update Notifications: No
  Auto Upgrade: Yes (recomendado)
  Automated Backups: Yes (se disponível)
  
Email Installation Details to: teu@email.com
```

5. **Clica:** "Install"

6. **Aguarda:** 2-5 minutos

7. **Copia:**
   - URL Admin: `https://store.joka.ct.ws/wp-admin`
   - Username: `jokaadmin`
   - Password: `[a senha que definiste]`

8. **Testa Login:**
   - Acede: `https://store.joka.ct.ws/wp-admin`
   - Login com credenciais
   - ✅ Deve entrar no painel WordPress!

### **Passo 4: Instalar WooCommerce Plugin**

#### **No WordPress Admin:**

1. **Vai para:** "Plugins" → "Add New"

2. **Procura:** "WooCommerce"

3. **Clica:** "Install Now" no "WooCommerce" by Automattic

4. **Clica:** "Activate"

5. **Wizard de Setup aparece:**

```yaml
Store Details:
  Country/Region: Luxembourg (ou France)
  Address: [teu endereço comercial]
  City: [cidade]
  Postcode: [código postal]
  
Industry:
  Seleciona: Technology / Electronics (ou adequado)
  
Product Types:
  Seleciona: Physical products ✅
  
Business Details:
  Currently selling: No / Yes (conforme aplicável)
  Number of products: [quantidade aproximada]
  
Theme:
  Skip this (vamos usar via API apenas)
  
Jetpack:
  Skip this (não é necessário)
```

6. **Finaliza Wizard**

7. **WooCommerce instalado!** ✅

### **Passo 5: Instalar Plugins Adicionais (Opcionais)**

#### **A. Plugin CORS Headers (se necessário):**

1. **Plugins** → "Add New"
2. **Procura:** "WP CORS"
3. **Instala:** "WP CORS" by Shazahm
4. **Ativa**

#### **B. Plugin JWT Authentication (para futuro):**

```bash
1. Plugins → Add New
2. Procura: "JWT Authentication for WP REST API"
3. Instala e Ativa
```

---

## 🌐 CONFIGURAÇÃO DOMÍNIOS E DNS

### **Verificar DNS do Subdomínio:**

```bash
# No terminal local:
nslookup store.joka.ct.ws

# Deve retornar IP do InfinityFree
# Exemplo: 185.27.134.xxx
```

### **Configurar CNAME (se usar GitHub Pages - Alternativo):**

Se decidires hospedar WordPress em GitHub Pages (não recomendado para WP, mas possível para estáticos):

1. **Cria ficheiro:** `CNAME` na raiz do repo
2. **Conteúdo:**
   ```
   store.joka.ct.ws
   ```
3. **No DNS Provider do domínio principal:**
   ```
   Type: CNAME
   Name: store
   Value: jokads.github.io
   TTL: 3600
   ```

**→ Para WordPress, usa InfinityFree diretamente (mais simples)**

---

## ⚙️ CONFIGURAÇÃO FICHEIROS

### **A. Configurar Permalinks (CRÍTICO! 🚨)**

#### **No WordPress Admin:**

1. **Vai para:** "Settings" → "Permalinks"

2. **Seleciona:** "Post name" ✅

3. **Custom Structure deve mostrar:** `/%postname%/`

4. **Clica:** "Save Changes"

5. **Testa imediatamente:**
   ```bash
   curl -I https://store.joka.ct.ws/wp-json/
   
   # Deve retornar:
   HTTP/2 200 ✅
   Content-Type: application/json; charset=UTF-8 ✅
   
   # Se retornar 404 ❌ → Permalinks não estão a funcionar!
   ```

### **B. Configurar wp-config.php**

#### **No File Manager do InfinityFree:**

1. **Acede:** VistaPanel → "Files" → "File Manager"

2. **Navega:** `/htdocs/wp-config.php`

3. **Clica:** "Edit"

4. **LOCALIZA esta linha:**
   ```php
   /* That's all, stop editing! Happy publishing. */
   ```

5. **ADICIONA ANTES dessa linha:**

```php
/**
 * ================================================
 * CONFIGURAÇÕES PERSONALIZADAS JOKATECH
 * ================================================
 */

// ===== CORS HEADERS (permite API calls de joka.ct.ws) =====
header('Access-Control-Allow-Origin: https://joka.ct.ws');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400'); // 24 horas

// Responde OPTIONS preflight imediatamente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    status_header(200);
    exit();
}

// ===== SEGURANÇA =====
// Força HTTPS (já deve estar, mas garantir)
define('FORCE_SSL_ADMIN', true);
if (strpos($_SERVER['HTTP_X_FORWARDED_PROTO'], 'https') !== false) {
    $_SERVER['HTTPS'] = 'on';
}

// Segurança adicional
define('DISALLOW_FILE_EDIT', true); // Desabilita editor de ficheiros no admin
define('WP_DEBUG', false); // Produção = sem debug
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);

// ===== DESABILITAR WP-CRON (usar cron real) =====
define('DISABLE_WP_CRON', true);

// ===== REDIS DESABILITADO (InfinityFree não tem Redis) =====
define('WP_REDIS_DISABLED', true);

// ===== REST API: Permitir autenticação via headers =====
define('JWT_AUTH_SECRET_KEY', 'gera-chave-aleatoria-aqui-32-caracteres-minimo');
define('JWT_AUTH_CORS_ENABLE', true);

// ===== PERFORMANCE =====
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');
define('WP_POST_REVISIONS', 3); // Limitar revisões

// ===== URLS (garantir que estão corretos) =====
// Normalmente Softaculous já configura, mas confirmar:
// define('WP_HOME', 'https://store.joka.ct.ws');
// define('WP_SITEURL', 'https://store.joka.ct.ws');

/* That's all, stop editing! Happy publishing. */
```

6. **IMPORTANTE - Gerar JWT Secret:**
   ```bash
   # No terminal local, gera string aleatória:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Copia o resultado e substitui 'gera-chave-aleatoria-aqui...'
   ```

7. **Salva ficheiro**

8. **Verifica se site ainda funciona:**
   - Acede: `https://store.joka.ct.ws`
   - Acede: `https://store.joka.ct.ws/wp-admin`
   - ✅ Ambos devem funcionar!

### **C. Configurar .htaccess no WordPress**

#### **No File Manager:**

1. **Navega:** `/htdocs/.htaccess`

2. **Clica:** "Edit"

3. **Substitui TODO conteúdo por:**

```apache
# ================================================
# .HTACCESS OTIMIZADO - store.joka.ct.ws
# WordPress + WooCommerce + REST API
# ================================================

# ===== SEGURANÇA BÁSICA =====
# Prevenir listagem de diretórios
Options -Indexes

# Bloquear acesso a ficheiros sensíveis
<FilesMatch "^\.*(htaccess|htpasswd|ini|log|sh|sql|conf|bak)$">
    Require all denied
</FilesMatch>

# Proteger wp-config.php
<Files wp-config.php>
    Require all denied
</Files>

# ===== REST API: PERMITIR AUTHORIZATION HEADER =====
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1

# Ou se o acima não funcionar, tenta:
RewriteEngine On
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]

# ===== CORS HEADERS (importante para API calls do frontend) =====
<IfModule mod_headers.c>
    # Permitir origem específica
    Header always set Access-Control-Allow-Origin "https://joka.ct.ws"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-WP-Nonce"
    Header always set Access-Control-Allow-Credentials "true"
    Header always set Access-Control-Max-Age "86400"
    
    # Segurança adicional
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# ===== TIPOS MIME (importante para .js, .mjs, .css) =====
<IfModule mod_mime.c>
    AddType application/javascript .js .mjs
    AddType text/css .css
    AddType application/json .json
    AddType image/svg+xml .svg .svgz
    AddType application/font-woff2 .woff2
    AddType application/font-woff .woff
    AddType application/font-ttf .ttf
</IfModule>

# ===== COMPRESSÃO GZIP (performance) =====
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript
    AddOutputFilterByType DEFLATE application/xml application/xhtml+xml application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# ===== CACHE BROWSER (performance) =====
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/font-woff2 "access plus 1 year"
    ExpiresByType application/json "access plus 0 seconds"
</IfModule>

# ===== WORDPRESS STANDARD REWRITES =====
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

# ===== PHP SETTINGS (se permitido pelo InfinityFree) =====
<IfModule mod_php7.c>
    php_value upload_max_filesize 64M
    php_value post_max_size 64M
    php_value max_execution_time 300
    php_value max_input_time 300
    php_value memory_limit 256M
</IfModule>
