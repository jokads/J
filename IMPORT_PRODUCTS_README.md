# 📦 GUIA DE IMPORTAÇÃO DE PRODUTOS

**Importador automático de produtos para WooCommerce via REST API**

---

## 📋 PRÉ-REQUISITOS

### **1. WordPress/WooCommerce instalado e configurado:**
- ✅ WordPress instalado em `https://store.joka.ct.ws`
- ✅ WooCommerce plugin ativo
- ✅ Permalinks configurados como "Post name"
- ✅ Chaves API geradas (Read/Write permissions)

### **2. Node.js instalado:**
```bash
node -v  # Deve retornar v18 ou superior
npm -v   # Deve retornar 9 ou superior
```

### **3. Dependências instaladas:**
```bash
cd scripts/
npm install
```

---

## 🚀 INSTALAÇÃO

### **Passo 1: Instalar Dependências**

```bash
# Navega para a pasta scripts
cd scripts/

# Instala as dependências necessárias
npm install

# Deve instalar:
# - woocommerce-api (cliente API)
# - csv-parser (parser CSV)
# - axios (HTTP client)
# - form-data (upload de ficheiros)
```

### **Passo 2: Configurar Variáveis de Ambiente**

#### **Opção A: Ficheiro .env (recomendado)**

Cria ficheiro `scripts/.env`:

```env
WC_STORE_URL=https://store.joka.ct.ws
WC_CONSUMER_KEY=ck_0be3db85c942bdda38a266f87572326122cddd55
WC_CONSUMER_SECRET=cs_7492e03fc675a317e769e528eec63322dd5e87ce
INPUT_FILE=./products.csv
INPUT_TYPE=csv
```

#### **Opção B: Variáveis na linha de comando**

```bash
export WC_STORE_URL=https://store.joka.ct.ws
export WC_CONSUMER_KEY=ck_xxx
export WC_CONSUMER_SECRET=cs_xxx
```

---

## 📄 PREPARAR FICHEIRO DE PRODUTOS

### **Opção 1: Usar CSV (recomendado)**

Cria ficheiro `scripts/products.csv` baseado no exemplo fornecido:

```csv
name,sku,description,short_description,price,sale_price,stock,category,images,weight,tags
"Produto Exemplo","SKU-001","Descrição longa HTML","Descrição curta","99.99","89.99","50","Categoria1;Categoria2","https://example.com/img1.jpg;https://example.com/img2.jpg","1.5","tag1;tag2"
```

**Campos disponíveis:**
- `name` ✅ (obrigatório) - Nome do produto
- `sku` - Código único do produto
- `description` - Descrição longa (HTML permitido)
- `short_description` - Descrição curta
- `price` - Preço normal (usar ponto para decimais: 99.99)
- `sale_price` - Preço promocional
- `stock` - Quantidade em stock
- `category` - Categorias (separar múltiplas com `;`)
- `images` - URLs de imagens (separar múltiplas com `;`)
- `weight` - Peso em kg
- `length` - Comprimento em cm
- `width` - Largura em cm
- `height` - Altura em cm
- `tax_class` - Classe fiscal (standard, reduced-rate, zero-rate)
- `shipping_class` - Classe de envio
- `tags` - Tags (separar múltiplas com `;`)
- `attributes` - Atributos customizados (JSON string)

### **Opção 2: Usar JSON**

Cria ficheiro `scripts/products.json`:

```json
[
  {
    "name": "Produto Exemplo",
    "sku": "SKU-001",
    "description": "<p>Descrição longa em HTML</p>",
    "short_description": "Descrição curta",
    "price": "99.99",
    "sale_price": "89.99",
    "stock": 50,
    "category": "Categoria1;Categoria2",
    "images": "https://example.com/img1.jpg;https://example.com/img2.jpg",
    "weight": "1.5",
    "tags": "tag1;tag2"
  }
]
```

Depois configura:
```bash
export INPUT_FILE=./products.json
export INPUT_TYPE=json
```

---

## 🎯 USAR O IMPORTADOR

### **Modo 1: Preview (apenas listar, não importar)**

Lista todos os produtos que serão importados **sem** criar no WooCommerce:

```bash
cd scripts/
npm run import:preview

# Ou diretamente:
node import-products.js --preview
```

**Output esperado:**
```
🚀 IMPORTADOR DE PRODUTOS WOOCOMMERCE

🔍 MODO: PREVIEW (apenas listar, não importar)

CSV lido: 10 produtos encontrados
---
Nome: Laptop Gaming Pro X1
SKU: LAPTOP-001
Preço: 2499.99€
Stock: 15
Categorias: Informática, Laptops, Gaming
---
...

📊 ESTATÍSTICAS DA IMPORTAÇÃO
Total processados: 10
```

### **Modo 2: Importar (criar novos produtos)**

Importa produtos para o WooCommerce. **Não atualiza** produtos existentes (skip):

```bash
cd scripts/
npm run import:apply

# Ou diretamente:
node import-products.js --apply
```

**Output esperado:**
```
✅ MODO: APLICAR (importar produtos)

[1/10] Processando: Laptop Gaming Pro X1
ℹ️ Criando produto: Laptop Gaming Pro X1
✅ Produto criado: Laptop Gaming Pro X1

[2/10] Processando: Mouse Wireless Ergonómico
⏭️ Produto já existe (skip): Mouse Wireless Ergonómico (SKU: MOUSE-001)
...

📊 ESTATÍSTICAS DA IMPORTAÇÃO
Total processados: 10
✅ Criados: 8
⏭️ Ignorados: 2 (já existiam)
❌ Erros: 0
```

### **Modo 3: Importar + Atualizar**

Importa **e atualiza** produtos existentes:

```bash
cd scripts/
npm run import:update

# Ou diretamente:
node import-products.js --apply --update
```

**Comportamento:**
- Produtos novos → **cria**
- Produtos existentes (mesmo SKU) → **atualiza**

---

## 📊 LOGS E DEPURAÇÃO

### **Ficheiro de Log**

Todas as operações são registadas em `scripts/import-log.txt`:

```bash
# Ver log completo
cat scripts/import-log.txt

# Ver apenas erros
grep ERROR scripts/import-log.txt

# Ver apenas sucessos
grep SUCCESS scripts/import-log.txt
```

### **Exemplo de log:**

```
[2024-01-15T10:30:00.000Z] [INFO] === INÍCIO DA IMPORTAÇÃO ===
[2024-01-15T10:30:00.123Z] [INFO] Loja: https://store.joka.ct.ws
[2024-01-15T10:30:00.456Z] [SUCCESS] CSV lido: 10 produtos encontrados
[2024-01-15T10:30:01.789Z] [INFO] Criando produto: Laptop Gaming Pro X1
[2024-01-15T10:30:02.345Z] [SUCCESS] ✅ Produto criado: Laptop Gaming Pro X1
[2024-01-15T10:30:03.678Z] [WARNING] ⏭️ Produto já existe (skip): Mouse Wireless
[2024-01-15T10:30:15.000Z] [SUCCESS] === FIM DA IMPORTAÇÃO ===
```

---

## 🔧 CONFIGURAÇÃO AVANÇADA

### **Ajustar Mapeamento de Campos**

Edita o ficheiro `import-products.js` na secção `FIELD_MAPPING`:

```javascript
const FIELD_MAPPING = {
  // Teu CSV → WooCommerce
  'nome_produto': 'name',        // Se teu CSV usa "nome_produto"
  'codigo': 'sku',               // Se teu CSV usa "codigo"
  'preco_venda': 'regular_price',// Se teu CSV usa "preco_venda"
  // ...
};
```

### **Ajustar Delay Entre Requests**

Para evitar rate limiting do servidor, ajusta o delay:

```javascript
// No final da função processAllProducts()
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo
```

### **Modo Verbose (Debug)**

Ativa logs detalhados:

```javascript
const CONFIG = {
  // ...
  verbose: true, // ✅ Ativa logs detalhados
};
```

---

## ⚠️ TROUBLESHOOTING

### **Erro: "Consumer Key não configurado"**

**Problema:** Variáveis de ambiente não definidas

**Solução:**
```bash
export WC_CONSUMER_KEY=ck_xxx
export WC_CONSUMER_SECRET=cs_xxx
node import-products.js --preview
```

### **Erro: "woocommerce_rest_cannot_create"**

**Problema:** Chaves API sem permissões de escrita

**Solução:**
1. WordPress Admin → WooCommerce → Settings → Advanced → REST API
2. Edita a chave API
3. Permissions: **Read/Write** ✅
4. Save changes

### **Erro: "404 Not Found" ou "Endpoint does not exist"**

**Problema:** Permalinks não configurados

**Solução:**
1. WordPress Admin → Settings → Permalinks
2. Seleciona: **Post name** ✅
3. Save changes
4. Testa: `curl -I https://store.joka.ct.ws/wp-json/`
   - Deve retornar `200 OK`

### **Erro: "Request failed with status code 401"**

**Problema:** Chaves API inválidas ou expiradas

**Solução:**
1. Gera novas chaves API no WordPress Admin
2. Atualiza as variáveis de ambiente
3. Tenta novamente

### **Erro: "ENOENT: no such file or directory 'products.csv'"**

**Problema:** Ficheiro de produtos não encontrado

**Solução:**
```bash
# Verifica se o ficheiro existe
ls -la scripts/products.csv

# Se não existe, cria baseado no exemplo
cp scripts/products-example.csv scripts/products.csv

# Edita com os teus produtos
nano scripts/products.csv
```

### **Erro: "Unable to verify certificate" (SSL)**

**Problema:** Certificado SSL inválido (InfinityFree gratuito)

**Solução temporária:**
```javascript
// No import-products.js, adiciona no CONFIG:
const WooCommerce = new WooCommerceAPI({
  // ... outras configs
  verifySsl: false, // ⚠️ Apenas para desenvolvimento!
});
```

### **Produtos importados sem imagens**

**Problema:** URLs de imagens inválidas ou inacessíveis

**Solução:**
1. Verifica se URLs são públicas e acessíveis
2. Testa no browser: copia URL e abre
3. Usa URLs HTTPS (não HTTP)
4. Considera fazer upload manual de imagens para WordPress Media Library

---

## 📚 EXEMPLOS PRÁTICOS

### **Exemplo 1: Importar 1000 produtos de CSV**

```bash
# 1. Prepara CSV com 1000 produtos
nano scripts/products.csv

# 2. Preview para verificar
npm run import:preview | less

# 3. Importa (demora ~8 minutos com delay de 500ms)
npm run import:apply

# 4. Verifica log
tail -f scripts/import-log.txt
```

### **Exemplo 2: Atualizar preços de produtos existentes**

```bash
# 1. Exporta produtos atuais do WooCommerce (via plugin ou manualmente)

# 2. Atualiza preços no CSV
# Mantém os SKUs iguais para identificar produtos

# 3. Importa com modo update
npm run import:update

# Produtos com mesmo SKU terão preços atualizados
```

### **Exemplo 3: Importar de JSON externo**

```bash
# 1. Baixa JSON de API externa
curl https://api.fornecedor.com/products > scripts/products.json

# 2. Configura para usar JSON
export INPUT_FILE=./products.json
export INPUT_TYPE=json

# 3. Importa
node import-products.js --apply
```

### **Exemplo 4: Importar apenas produtos de uma categoria**

Edita `import-products.js` e adiciona filtro:

```javascript
async function processAllProducts(products, mode, allowUpdate) {
  // Filtrar apenas categoria "Electronics"
  products = products.filter(p => {
    return p.category && p.category.includes('Electronics');
  });
  
  log(`Produtos filtrados: ${products.length}`, 'info');
  
  // ... resto do código
}
```

---

## 🔄 SINCRONIZAÇÃO AUTOMÁTICA (CRON)

Para sincronizar produtos periodicamente (ex: diariamente):

### **Opção A: Cron Linux/Mac**

```bash
# Edita crontab
crontab -e

# Adiciona linha (executa diariamente às 2h da manhã):
0 2 * * * cd /caminho/para/scripts && /usr/bin/node import-products.js --apply --update >> /var/log/wc-import.log 2>&1
```

### **Opção B: GitHub Actions**

Cria `.github/workflows/sync-products.yml`:

```yaml
name: Sync WooCommerce Products

on:
  schedule:
    - cron: '0 2 * * *' # Diariamente às 2h UTC
  workflow_dispatch: # Permite execução manual

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd scripts
          npm install
      
      - name: Import products
        env:
          WC_STORE_URL: ${{ secrets.WC_STORE_URL }}
          WC_CONSUMER_KEY: ${{ secrets.WC_CONSUMER_KEY }}
          WC_CONSUMER_SECRET: ${{ secrets.WC_CONSUMER_SECRET }}
        run: |
          cd scripts
          node import-products.js --apply --update
      
      - name: Upload logs
        uses: actions/upload-artifact@v3
        with:
          name: import-logs
          path: scripts/import-log.txt
```

### **Opção C: WP-Cron (WordPress)**

Cria plugin WordPress customizado ou adiciona em `functions.php`:

```php
// Agendar importação diária
add_action('wp', 'schedule_product_import');
function schedule_product_import() {
    if (!wp_next_scheduled('daily_product_import')) {
        wp_schedule_event(time(), 'daily', 'daily_product_import');
    }
}

add_action('daily_product_import', 'run_product_import');
function run_product_import() {
    // Executa script Node.js
    $output = shell_exec('cd /path/to/scripts && node import-products.js --apply --update 2>&1');
    error_log('Product Import: ' . $output);
}
```

---

## 📞 SUPORTE

### **Problemas comuns resolvidos em:**
- `DEPLOY_WORDPRESS_COMPLETE.md` - Setup WordPress/WooCommerce
- `TROUBLESHOOTING.md` - Resolução de problemas
- `BUILD_GUIDE.md` - Deploy do frontend

### **Teste a API antes de importar:**
```bash
cd scripts/
chmod +x test-woocommerce-api.sh
./test-woocommerce-api.sh
```

---

## ✅ CHECKLIST ANTES DE IMPORTAR

```
✅ WordPress instalado em store.joka.ct.ws
✅ WooCommerce plugin ativo
✅ Permalinks = "Post name"
✅ Chaves API geradas (Read/Write)
✅ CORS configurado no wp-config.php
✅ Teste da API passou (test-woocommerce-api.sh)
✅ Ficheiro products.csv preparado
✅ Dependências instaladas (npm install)
✅ Variáveis de ambiente configuradas
✅ Preview executado com sucesso (--preview)
```

**Agora estás pronto para importar!** 🚀

```bash
npm run import:apply
```
