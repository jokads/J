# 🚀 INSTRUÇÕES DE DEPLOY - JOKATECH

## 📋 RESUMO

Este projeto está configurado para deploy em **2 domínios**:

1. **joka.ct.ws** (InfinityFree) - Site principal React
2. **store.joka.ct.ws** (GitHub Pages) - Loja WooCommerce WordPress

---

## 🔧 CONFIGURAÇÃO WOOCOMMERCE

### ✅ Credenciais já configuradas no código:

```env
VITE_WOOCOMMERCE_URL="https://store.joka.ct.ws"
VITE_WOOCOMMERCE_CONSUMER_KEY="ck_0be3db85c942bdda38a266f87572326122cddd55"
VITE_WOOCOMMERCE_CONSUMER_SECRET="cs_7492e03fc675a317e769e528eec63322dd5e87ce"
```

### 📝 Passos no WordPress (store.joka.ct.ws):

1. **Instalar WordPress no InfinityFree ou GitHub Pages**
2. **Instalar WooCommerce**:
   - Plugins → Adicionar Novo → "WooCommerce"
   - Ativar plugin

3. **Configurar Permalinks**:
   - Definições → Permalinks
   - Selecionar "Nome do artigo"
   - Salvar

4. **Criar chaves API** (já criadas, mas para referência):
   - WooCommerce → Definições → Avançado → REST API
   - Adicionar chave
   - Descrição: "Integração JokaTech"
   - Permissões: **Leitura/Escrita**
   - Gerar chave

5. **Configurar CORS no WordPress**:
   - Adicionar ao `wp-config.php`:
   ```php
   header('Access-Control-Allow-Origin: https://joka.ct.ws');
   header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
   header('Access-Control-Allow-Headers: Content-Type, Authorization');
   ```

---

## 📦 BUILD PARA PRODUÇÃO

### 1️⃣ Build para InfinityFree (joka.ct.ws)

```bash
# Configurar variável de ambiente
export DEPLOY_TARGET=infinityfree

# Ou no Windows:
set DEPLOY_TARGET=infinityfree

# Build
npm run build

# Resultado: pasta /out com todos os arquivos
```

**Arquivos gerados:**
- `out/index.html` - Página principal
- `out/assets/` - CSS, JS, imagens
- `out/.htaccess` - Configuração Apache (já incluído)

### 2️⃣ Build para GitHub Pages (store.joka.ct.ws)

```bash
# Configurar variável de ambiente
export DEPLOY_TARGET=github

# Ou no Windows:
set DEPLOY_TARGET=github

# Build
npm run build

# Resultado: pasta /out com base path /A/
```

---

## 🌐 DEPLOY NO INFINITYFREE (joka.ct.ws)

### Passo a Passo:

1. **Aceder ao painel InfinityFree**:
   - https://infinityfree.net/
   - Login na sua conta

2. **Abrir File Manager**:
   - Control Panel → File Manager
   - Ou usar FTP (FileZilla)

3. **Navegar para htdocs**:
   - Pasta raiz: `/htdocs/`

4. **Upload dos arquivos**:
   - Fazer upload de **TODOS** os arquivos da pasta `out/`
   - Incluindo `.htaccess`
   - Estrutura final:
   ```
   /htdocs/
   ├── index.html
   ├── .htaccess
   ├── assets/
   │   ├── index-[hash].js
   │   ├── index-[hash].css
   │   └── ...
   └── vite.svg
   ```

5. **Verificar permissões**:
   - `.htaccess` deve ter permissão 644
   - Pastas devem ter permissão 755

6. **Testar**:
   - Abrir https://joka.ct.ws
   - Verificar se carrega corretamente

### 📡 Configuração FTP (alternativa):

```
Host: ftpupload.net (ou o fornecido pelo InfinityFree)
Username: [seu username]
Password: [sua password]
Port: 21
```

---

## 🐙 DEPLOY NO GITHUB PAGES (store.joka.ct.ws)

### Passo a Passo:

1. **Criar repositório no GitHub**:
   - Nome: `jokatech-store` (ou qualquer nome)
   - Público ou Privado

2. **Fazer upload dos arquivos**:
   ```bash
   cd out
   git init
   git add .
   git commit -m "Deploy JokaTech Store"
   git branch -M main
   git remote add origin https://github.com/[seu-usuario]/jokatech-store.git
   git push -u origin main
   ```

3. **Configurar GitHub Pages**:
   - Repositório → Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `root`
   - Save

4. **Configurar domínio customizado**:
   - Custom domain: `store.joka.ct.ws`
   - Enforce HTTPS: ✅

5. **Configurar DNS no InfinityFree**:
   - Control Panel → DNS Management
   - Adicionar CNAME:
   ```
   Type: CNAME
   Name: store
   Value: [seu-usuario].github.io
   TTL: 3600
   ```

6. **Aguardar propagação DNS** (até 48h)

7. **Testar**:
   - Abrir https://store.joka.ct.ws
   - Verificar se carrega WordPress

---

## 🔍 VERIFICAÇÃO PÓS-DEPLOY

### ✅ Checklist:

- [ ] Site principal carrega em https://joka.ct.ws
- [ ] WordPress carrega em https://store.joka.ct.ws
- [ ] WooCommerce está ativo
- [ ] API REST funciona: https://store.joka.ct.ws/wp-json/wc/v3/products
- [ ] CORS configurado (testar no dashboard admin)
- [ ] Google Analytics rastreando (verificar em 24h)
- [ ] Todas as páginas funcionam (routing)
- [ ] Imagens carregam corretamente
- [ ] Formulários funcionam
- [ ] Carrinho de compras funciona

### 🧪 Testar Integração WooCommerce:

1. Aceder ao dashboard admin: https://joka.ct.ws/admin
2. Login com credenciais
3. Ir em "Integrações" → "WooCommerce"
4. Clicar em "Testar Conexão"
5. Deve aparecer: ✅ Conexão estabelecida com sucesso!
6. Importar produtos

---

## 🐛 TROUBLESHOOTING

### Problema: Site não carrega (404)

**Solução:**
- Verificar se `.htaccess` foi enviado
- Verificar permissões (644 para arquivos, 755 para pastas)
- Verificar se `mod_rewrite` está ativo no servidor

### Problema: CORS error ao conectar WooCommerce

**Solução:**
- Adicionar headers CORS no WordPress `wp-config.php`
- Verificar se `.htaccess` tem configuração CORS
- Testar com HTTP primeiro (desmarcar "Usar SSL")

### Problema: Google Analytics não rastreia

**Solução:**
- Aguardar 24-48h para dados aparecerem
- Verificar se código está no `index.html`
- Testar com Google Tag Assistant

### Problema: Imagens não carregam

**Solução:**
- Verificar caminhos das imagens (devem ser relativos)
- Verificar se pasta `assets/` foi enviada
- Limpar cache do navegador

### Problema: Routing não funciona (404 em rotas)

**Solução:**
- Verificar se `.htaccess` tem regras de rewrite
- Verificar se `mod_rewrite` está ativo
- Testar com `index.html#/rota` (fallback)

---

## 📊 MONITORAMENTO

### Google Analytics:
- Dashboard: https://analytics.google.com
- Property ID: G-57LNHRWX42
- Dados disponíveis em 24-48h

### InfinityFree:
- Control Panel: https://infinityfree.net/
- Estatísticas de uso
- Logs de erro

### GitHub Pages:
- Repositório → Settings → Pages
- Status do deploy
- Logs de build

---

## 🔐 SEGURANÇA

### ✅ Implementado:

- ✅ Removido "Powered by Readdy" do footer
- ✅ Credenciais WooCommerce no código (seguro para frontend)
- ✅ Google Analytics configurado
- ✅ CORS configurado para WooCommerce
- ✅ Headers de segurança no `.htaccess`
- ✅ Proteção de arquivos sensíveis
- ✅ HTTPS enforced (quando disponível)

### ⚠️ Recomendações:

- Não compartilhar credenciais WooCommerce publicamente
- Fazer backup regular do banco de dados
- Monitorar logs de erro
- Atualizar WordPress e plugins regularmente

---

## 📞 SUPORTE

### Contatos:
- Email: jokadamas616@gmail.com
- WhatsApp: +352 621 717 862

### Links Úteis:
- InfinityFree: https://infinityfree.net/
- GitHub Pages: https://pages.github.com/
- WooCommerce Docs: https://woocommerce.com/documentation/

---

## 🎉 PRONTO!

Seu site está configurado e pronto para deploy! 🚀

**Próximos passos:**
1. Build do projeto (`npm run build`)
2. Upload para InfinityFree
3. Configurar WordPress no store.joka.ct.ws
4. Testar integração WooCommerce
5. Adicionar produtos
6. Lançar! 🎊
