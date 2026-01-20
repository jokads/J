# 🏗️ GUIA DE BUILD - JOKATECH

## 📦 COMANDOS DE BUILD

### 1️⃣ Build para InfinityFree (joka.ct.ws)

```bash
npm run build:infinityfree
```

**O que faz:**
- Compila o projeto React
- Base path: `/` (raiz)
- Otimiza para produção
- Remove console.logs
- Minifica código
- Gera pasta `out/`

**Resultado:**
```
out/
├── index.html
├── .htaccess (copiado automaticamente)
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [imagens]
└── vite.svg
```

### 2️⃣ Build para GitHub Pages (store.joka.ct.ws)

```bash
npm run build:github
```

**O que faz:**
- Compila o projeto React
- Base path: `/A/` (subpasta)
- Otimiza para produção
- Remove console.logs
- Minifica código
- Gera pasta `out/`

**Resultado:**
```
out/
├── index.html (com base="/A/")
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [imagens]
└── vite.svg
```

### 3️⃣ Build padrão (desenvolvimento)

```bash
npm run build
```

**O que faz:**
- Build padrão sem otimizações agressivas
- Mantém source maps
- Mantém console.logs
- Base path: `/`

---

## 🚀 PROCESSO COMPLETO DE DEPLOY

### Para InfinityFree (joka.ct.ws):

```bash
# 1. Build
npm run build:infinityfree

# 2. Verificar pasta out/
ls -la out/

# 3. Upload via FTP ou File Manager
# - Conectar ao InfinityFree
# - Navegar para /htdocs/
# - Upload de TODOS os arquivos da pasta out/
# - Incluir .htaccess

# 4. Testar
# Abrir: https://joka.ct.ws
```

### Para GitHub Pages (store.joka.ct.ws):

```bash
# 1. Build
npm run build:github

# 2. Navegar para pasta out
cd out

# 3. Inicializar Git
git init
git add .
git commit -m "Deploy JokaTech Store"

# 4. Push para GitHub
git branch -M main
git remote add origin https://github.com/[seu-usuario]/jokatech-store.git
git push -u origin main

# 5. Configurar GitHub Pages
# - Repositório → Settings → Pages
# - Source: main branch
# - Custom domain: store.joka.ct.ws

# 6. Testar
# Abrir: https://store.joka.ct.ws
```

---

## 📋 CHECKLIST PRÉ-BUILD

Antes de fazer build, verificar:

- [ ] Todas as alterações commitadas
- [ ] Testes passando
- [ ] Sem erros no console
- [ ] Variáveis de ambiente configuradas (.env)
- [ ] WooCommerce credentials corretas
- [ ] Google Analytics ID correto
- [ ] Domínios corretos no código

---

## 🔍 VERIFICAÇÃO PÓS-BUILD

Após build, verificar pasta `out/`:

### Arquivos obrigatórios:
- [ ] `index.html` existe
- [ ] `.htaccess` existe (InfinityFree)
- [ ] Pasta `assets/` existe
- [ ] Arquivos JS minificados
- [ ] Arquivos CSS minificados
- [ ] Imagens otimizadas

### Tamanhos esperados:
- `index.html`: ~5-10 KB
- JS principal: ~200-500 KB (gzipped)
- CSS principal: ~50-100 KB (gzipped)
- Total: ~1-2 MB

### Verificar index.html:

```bash
# Verificar se Google Analytics está presente
grep "G-57LNHRWX42" out/index.html

# Verificar se base path está correto
grep 'base href' out/index.html

# Verificar se scripts estão minificados
grep 'assets/index-' out/index.html
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find module 'cross-env'"

**Solução:**
```bash
npm install --save-dev cross-env
```

### Erro: "Build failed"

**Solução:**
```bash
# Limpar cache
rm -rf node_modules
rm -rf out
rm package-lock.json

# Reinstalar
npm install

# Tentar novamente
npm run build:infinityfree
```

### Erro: "Out of memory"

**Solução:**
```bash
# Aumentar memória do Node
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build:infinityfree
```

### Build muito lento

**Solução:**
```bash
# Desabilitar source maps
# Em vite.config.ts, mudar:
sourcemap: false
```

---

## 📊 OTIMIZAÇÕES

### Tamanho do bundle:

Para analisar tamanho do bundle:

```bash
npm run build:infinityfree
npx vite-bundle-visualizer
```

### Performance:

- ✅ Code splitting ativo
- ✅ Tree shaking ativo
- ✅ Minificação ativa
- ✅ Compressão gzip ativa
- ✅ Cache de assets ativo
- ✅ Lazy loading de rotas

### Melhorias futuras:

- [ ] Implementar PWA
- [ ] Adicionar service worker
- [ ] Otimizar imagens (WebP)
- [ ] Implementar lazy loading de imagens
- [ ] Adicionar preload de recursos críticos

---

## 🎯 METAS DE PERFORMANCE

### Lighthouse Score (objetivo):

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### Core Web Vitals:

- LCP (Largest Contentful Paint): &lt; 2.5s
- FID (First Input Delay): &lt; 100ms
- CLS (Cumulative Layout Shift): &lt; 0.1

---

## 📞 SUPORTE

Problemas com build?

- Email: jokadamas616@gmail.com
- WhatsApp: +352 621 717 862

---

## ✅ PRONTO!

Agora você pode fazer build e deploy do projeto! 🚀

**Comandos rápidos:**

```bash
# InfinityFree
npm run build:infinityfree

# GitHub Pages
npm run build:github

# Desenvolvimento
npm run dev
```
