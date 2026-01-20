#!/usr/bin/env node

/**
 * ================================================
 * SCRIPT DE IMPORTAÇÃO DE PRODUTOS WOOCOMMERCE
 * ================================================
 * 
 * Importa produtos de CSV/JSON para WooCommerce via REST API
 * 
 * USO:
 *   node import-products.js --preview          (listar produtos sem importar)
 *   node import-products.js --apply            (importar produtos)
 *   node import-products.js --apply --update   (atualizar produtos existentes)
 * 
 * REQUISITOS:
 *   npm install woocommerce-api csv-parser axios form-data
 */

const WooCommerceAPI = require('woocommerce-api');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');
const FormData = require('form-data');

// ===== CONFIGURAÇÃO =====
const CONFIG = {
  // URL da loja WooCommerce
  storeUrl: process.env.WC_STORE_URL || 'https://store.joka.ct.ws',
  
  // Chaves API (obtidas no WordPress Admin)
  consumerKey: process.env.WC_CONSUMER_KEY || 'ck_XXXXX',
  consumerSecret: process.env.WC_CONSUMER_SECRET || 'cs_XXXXX',
  
  // Versão da API
  version: 'wc/v3',
  
  // Ficheiro de entrada
  inputFile: process.env.INPUT_FILE || './products.csv',
  
  // Tipo de ficheiro: 'csv' ou 'json'
  inputType: process.env.INPUT_TYPE || 'csv',
  
  // Log detalhado
  verbose: true,
};

// ===== MAPEAMENTO DE CAMPOS =====
// Ajusta conforme teu CSV/JSON
const FIELD_MAPPING = {
  // CSV Column → WooCommerce Field
  'name': 'name',                    // Nome do produto
  'sku': 'sku',                      // SKU único
  'description': 'description',      // Descrição longa (HTML permitido)
  'short_description': 'short_description', // Descrição curta
  'price': 'regular_price',          // Preço normal
  'sale_price': 'sale_price',        // Preço promocional
  'stock': 'stock_quantity',         // Quantidade em stock
  'category': 'categories',          // Categorias (separadas por ;)
  'images': 'images',                // URLs de imagens (separadas por ;)
  'weight': 'weight',                // Peso (kg)
  'length': 'length',                // Comprimento (cm)
  'width': 'width',                  // Largura (cm)
  'height': 'height',                // Altura (cm)
  'tax_class': 'tax_class',          // Classe fiscal (standard, reduced-rate, zero-rate)
  'shipping_class': 'shipping_class', // Classe de envio
  'tags': 'tags',                    // Tags (separadas por ;)
  'attributes': 'attributes',        // Atributos customizados (JSON string)
};

// ===== INICIALIZAR WOOCOMMERCE API =====
const WooCommerce = new WooCommerceAPI({
  url: CONFIG.storeUrl,
  consumerKey: CONFIG.consumerKey,
  consumerSecret: CONFIG.consumerSecret,
  wpAPI: true,
  version: CONFIG.version,
  queryStringAuth: true, // InfinityFree pode precisar disto
});

// ===== ESTATÍSTICAS =====
const stats = {
  total: 0,
  created: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
  errorDetails: [],
};

// ===== LOG HELPER =====
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }[level] || 'ℹ️';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
  
  // Escrever em ficheiro de log
  fs.appendFileSync(
    './import-log.txt',
    `[${timestamp}] [${level.toUpperCase()}] ${message}\n`
  );
}

// ===== LER CSV =====
async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        log(`CSV lido: ${results.length} produtos encontrados`, 'success');
        resolve(results);
      })
      .on('error', reject);
  });
}

// ===== LER JSON =====
async function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const products = JSON.parse(data);
    log(`JSON lido: ${products.length} produtos encontrados`, 'success');
    return Array.isArray(products) ? products : [products];
  } catch (error) {
    log(`Erro ao ler JSON: ${error.message}`, 'error');
    throw error;
  }
}

// ===== TRANSFORMAR DADOS =====
function transformProduct(rawProduct) {
  const product = {
    name: rawProduct[FIELD_MAPPING.name] || 'Produto Sem Nome',
    type: 'simple',
    status: 'publish',
    catalog_visibility: 'visible',
    manage_stock: true,
  };
  
  // SKU
  if (rawProduct[FIELD_MAPPING.sku]) {
    product.sku = String(rawProduct[FIELD_MAPPING.sku]).trim();
  }
  
  // Descrições
  if (rawProduct[FIELD_MAPPING.description]) {
    product.description = rawProduct[FIELD_MAPPING.description];
  }
  if (rawProduct[FIELD_MAPPING.short_description]) {
    product.short_description = rawProduct[FIELD_MAPPING.short_description];
  }
  
  // Preços
  if (rawProduct[FIELD_MAPPING.price]) {
    product.regular_price = String(parseFloat(rawProduct[FIELD_MAPPING.price]).toFixed(2));
  }
  if (rawProduct[FIELD_MAPPING.sale_price]) {
    product.sale_price = String(parseFloat(rawProduct[FIELD_MAPPING.sale_price]).toFixed(2));
  }
  
  // Stock
  if (rawProduct[FIELD_MAPPING.stock]) {
    product.stock_quantity = parseInt(rawProduct[FIELD_MAPPING.stock], 10);
    product.stock_status = product.stock_quantity > 0 ? 'instock' : 'outofstock';
  }
  
  // Categorias (separadas por ; no CSV)
  if (rawProduct[FIELD_MAPPING.category]) {
    const categories = String(rawProduct[FIELD_MAPPING.category])
      .split(';')
      .map(cat => ({ name: cat.trim() }));
    product.categories = categories;
  }
  
  // Tags (separadas por ; no CSV)
  if (rawProduct[FIELD_MAPPING.tags]) {
    const tags = String(rawProduct[FIELD_MAPPING.tags])
      .split(';')
      .map(tag => ({ name: tag.trim() }));
    product.tags = tags;
  }
  
  // Imagens (URLs separadas por ; no CSV)
  if (rawProduct[FIELD_MAPPING.images]) {
    const imageUrls = String(rawProduct[FIELD_MAPPING.images])
      .split(';')
      .map(url => url.trim())
      .filter(url => url);
    
    product.images = imageUrls.map(url => ({ src: url }));
  }
  
  // Dimensões
  if (rawProduct[FIELD_MAPPING.weight]) {
    product.weight = String(rawProduct[FIELD_MAPPING.weight]);
  }
  if (rawProduct[FIELD_MAPPING.length]) {
    product.dimensions = product.dimensions || {};
    product.dimensions.length = String(rawProduct[FIELD_MAPPING.length]);
  }
  if (rawProduct[FIELD_MAPPING.width]) {
    product.dimensions = product.dimensions || {};
    product.dimensions.width = String(rawProduct[FIELD_MAPPING.width]);
  }
  if (rawProduct[FIELD_MAPPING.height]) {
    product.dimensions = product.dimensions || {};
    product.dimensions.height = String(rawProduct[FIELD_MAPPING.height]);
  }
  
  // Tax class
  if (rawProduct[FIELD_MAPPING.tax_class]) {
    product.tax_class = rawProduct[FIELD_MAPPING.tax_class];
  }
  
  // Shipping class
  if (rawProduct[FIELD_MAPPING.shipping_class]) {
    product.shipping_class = rawProduct[FIELD_MAPPING.shipping_class];
  }
  
  // Atributos customizados (se vier como JSON string)
  if (rawProduct[FIELD_MAPPING.attributes]) {
    try {
      product.attributes = JSON.parse(rawProduct[FIELD_MAPPING.attributes]);
    } catch (e) {
      log(`Aviso: Atributos inválidos para ${product.name}`, 'warning');
    }
  }
  
  return product;
}

// ===== VERIFICAR SE PRODUTO EXISTE (por SKU) =====
async function findProductBySku(sku) {
  return new Promise((resolve, reject) => {
    WooCommerce.get(`products?sku=${sku}`, (err, data, res) => {
      if (err) {
        reject(err);
      } else {
        const products = JSON.parse(res);
        resolve(products.length > 0 ? products[0] : null);
      }
    });
  });
}

// ===== CRIAR PRODUTO =====
async function createProduct(productData) {
  return new Promise((resolve, reject) => {
    WooCommerce.post('products', productData, (err, data, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(res));
      }
    });
  });
}

// ===== ATUALIZAR PRODUTO =====
async function updateProduct(productId, productData) {
  return new Promise((resolve, reject) => {
    WooCommerce.put(`products/${productId}`, productData, (err, data, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(res));
      }
    });
  });
}

// ===== PROCESSAR UM PRODUTO =====
async function processProduct(rawProduct, mode, allowUpdate) {
  try {
    const productData = transformProduct(rawProduct);
    
    // Preview mode: apenas listar
    if (mode === 'preview') {
      console.log('---');
      console.log(`Nome: ${productData.name}`);
      console.log(`SKU: ${productData.sku || 'N/A'}`);
      console.log(`Preço: ${productData.regular_price || 'N/A'}€`);
      console.log(`Stock: ${productData.stock_quantity || 'N/A'}`);
      console.log(`Categorias: ${productData.categories?.map(c => c.name).join(', ') || 'N/A'}`);
      stats.total++;
      return;
    }
    
    // Apply mode: criar ou atualizar
    if (productData.sku) {
      // Verificar se já existe
      const existing = await findProductBySku(productData.sku);
      
      if (existing) {
        if (allowUpdate) {
          log(`Atualizando produto: ${productData.name} (SKU: ${productData.sku})`, 'info');
          await updateProduct(existing.id, productData);
          stats.updated++;
          log(`✅ Produto atualizado: ${productData.name}`, 'success');
        } else {
          log(`⏭️  Produto já existe (skip): ${productData.name} (SKU: ${productData.sku})`, 'warning');
          stats.skipped++;
        }
      } else {
        // Criar novo
        log(`Criando produto: ${productData.name}`, 'info');
        await createProduct(productData);
        stats.created++;
        log(`✅ Produto criado: ${productData.name}`, 'success');
      }
    } else {
      // Sem SKU: sempre criar novo
      log(`Criando produto sem SKU: ${productData.name}`, 'info');
      await createProduct(productData);
      stats.created++;
      log(`✅ Produto criado: ${productData.name}`, 'success');
    }
    
    stats.total++;
    
  } catch (error) {
    stats.errors++;
    const errorMsg = `Erro ao processar "${rawProduct.name || 'produto'}": ${error.message}`;
    log(errorMsg, 'error');
    stats.errorDetails.push(errorMsg);
  }
}

// ===== PROCESSAR TODOS OS PRODUTOS =====
async function processAllProducts(products, mode, allowUpdate) {
  log(`Iniciando processamento de ${products.length} produtos...`, 'info');
  log(`Modo: ${mode}`, 'info');
  if (mode === 'apply') {
    log(`Permitir atualizações: ${allowUpdate ? 'SIM' : 'NÃO'}`, 'info');
  }
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    log(`\n[${i + 1}/${products.length}] Processando: ${product.name || product[FIELD_MAPPING.name] || 'Produto'}`, 'info');
    await processProduct(product, mode, allowUpdate);
    
    // Delay entre requests (evitar rate limiting)
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// ===== MOSTRAR ESTATÍSTICAS =====
function showStats() {
  console.log('\n');
  console.log('================================================');
  console.log('📊 ESTATÍSTICAS DA IMPORTAÇÃO');
  console.log('================================================');
  console.log(`Total processados: ${stats.total}`);
  console.log(`✅ Criados: ${stats.created}`);
  console.log(`🔄 Atualizados: ${stats.updated}`);
  console.log(`⏭️  Ignorados: ${stats.skipped}`);
  console.log(`❌ Erros: ${stats.errors}`);
  console.log('================================================');
  
  if (stats.errors > 0) {
    console.log('\n❌ DETALHES DOS ERROS:');
    stats.errorDetails.forEach((err, i) => {
      console.log(`${i + 1}. ${err}`);
    });
  }
  
  console.log('\n📄 Log completo salvo em: ./import-log.txt\n');
}

// ===== VALIDAR CONFIGURAÇÃO =====
function validateConfig() {
  const errors = [];
  
  if (CONFIG.consumerKey === 'ck_XXXXX') {
    errors.push('Consumer Key não configurado! Define WC_CONSUMER_KEY');
  }
  if (CONFIG.consumerSecret === 'cs_XXXXX') {
    errors.push('Consumer Secret não configurado! Define WC_CONSUMER_SECRET');
  }
  if (!fs.existsSync(CONFIG.inputFile)) {
    errors.push(`Ficheiro não encontrado: ${CONFIG.inputFile}`);
  }
  
  if (errors.length > 0) {
    console.error('\n❌ ERROS DE CONFIGURAÇÃO:\n');
    errors.forEach(err => console.error(`   - ${err}`));
    console.error('\n💡 EXEMPLO DE USO:\n');
    console.error('   WC_CONSUMER_KEY=ck_xxx WC_CONSUMER_SECRET=cs_xxx node import-products.js --preview\n');
    process.exit(1);
  }
}

// ===== MAIN =====
async function main() {
  console.log('\n🚀 IMPORTADOR DE PRODUTOS WOOCOMMERCE\n');
  
  // Parse argumentos
  const args = process.argv.slice(2);
  const mode = args.includes('--apply') ? 'apply' : 'preview';
  const allowUpdate = args.includes('--update');
  
  if (mode === 'preview') {
    console.log('🔍 MODO: PREVIEW (apenas listar, não importar)\n');
  } else {
    console.log('✅ MODO: APLICAR (importar produtos)\n');
  }
  
  // Validar configuração
  validateConfig();
  
  // Limpar log anterior
  if (fs.existsSync('./import-log.txt')) {
    fs.unlinkSync('./import-log.txt');
  }
  
  log('=== INÍCIO DA IMPORTAÇÃO ===', 'info');
  log(`Loja: ${CONFIG.storeUrl}`, 'info');
  log(`Ficheiro: ${CONFIG.inputFile}`, 'info');
  log(`Tipo: ${CONFIG.inputType}`, 'info');
  
  try {
    // Ler produtos do ficheiro
    let products;
    if (CONFIG.inputType === 'csv') {
      products = await readCSV(CONFIG.inputFile);
    } else if (CONFIG.inputType === 'json') {
      products = await readJSON(CONFIG.inputFile);
    } else {
      throw new Error(`Tipo de ficheiro inválido: ${CONFIG.inputType}`);
    }
    
    if (products.length === 0) {
      log('Nenhum produto encontrado no ficheiro!', 'warning');
      process.exit(0);
    }
    
    // Processar produtos
    await processAllProducts(products, mode, allowUpdate);
    
    // Mostrar estatísticas
    showStats();
    
    log('=== FIM DA IMPORTAÇÃO ===', 'success');
    
    process.exit(stats.errors > 0 ? 1 : 0);
    
  } catch (error) {
    log(`Erro fatal: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Executar
main();
