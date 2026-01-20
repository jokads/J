// API Client para WooCommerce - Usa Edge Function como Proxy (resolve CORS!)

import { supabase } from '../lib/supabase';

const EDGE_FUNCTION_URL = 'https://vxlhwibkbptkthrnznqi.supabase.co/functions/v1/woocommerce-proxy';

interface WooCredentials {
  store_url: string;
  consumer_key: string;
  consumer_secret: string;
  api_version: string;
  use_ssl: boolean;
  products_only: boolean;
}

interface WooCommerceCredentials {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  apiVersion: string;
  useSsl: boolean;
}

interface WooCommerceTestResult {
  success: boolean;
  message: string;
  data?: {
    totalProducts: number;
    wooVersion: string;
    apiVersion: string;
    storeUrl: string;
  };
}

interface ImportOptions {
  update_existing: boolean;
  create_new: boolean;
  sync_stock_only: boolean;
  import_images: boolean;
}

/**
 * Testa a conexão com a API WooCommerce usando Edge Function (resolve CORS!)
 */
export async function testWooCommerceConnection(
  credentials: WooCommerceCredentials
): Promise<WooCommerceTestResult> {
  try {
    const { storeUrl, consumerKey, consumerSecret, apiVersion, useSsl } = credentials;

    if (!storeUrl || !consumerKey || !consumerSecret) {
      return {
        success: false,
        message: '❌ Preencha todos os campos obrigatórios (URL, Consumer Key e Consumer Secret)',
      };
    }

    console.log('🔍 Testando conexão via Edge Function...');

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'test',
        config: {
          store_url: storeUrl,
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
          api_version: apiVersion || 'wc/v3',
          use_ssl: useSsl
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', response.status, errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Resultado do teste:', result);

    return result;

  } catch (error: any) {
    console.error('❌ Erro ao testar conexão:', error);
    
    return {
      success: false,
      message: `❌ Erro inesperado ao testar conexão\n\nDetalhes: ${error.message}\n\n✅ Tente:\n1. Verificar se o site está online: abra no navegador\n2. Verificar se o WordPress está instalado\n3. Verificar se o WooCommerce está ativo\n4. Aguardar alguns minutos e tentar novamente`,
    };
  }
}

/**
 * Buscar produtos do WooCommerce usando Edge Function (resolve CORS!)
 */
export async function fetchWooCommerceProductsDirect(
  credentials: WooCredentials,
  limit: number = 50,
  page: number = 1
) {
  try {
    console.log(`🔍 Buscando produtos via Edge Function (página ${page}, limite ${limit})...`);
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'fetch',
        config: credentials,
        limit,
        page
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ ${result.products?.length || 0} produtos carregados`);
    
    return result;
  } catch (error: any) {
    console.error('❌ Erro ao buscar produtos:', error);
    return {
      success: false,
      message: error.message || 'Erro ao buscar produtos',
      products: []
    };
  }
}

/**
 * Buscar produtos do WooCommerce (preview) - Mantém compatibilidade com código existente
 */
export async function fetchWooCommerceProducts(limit: number = 50) {
  try {
    // Buscar credenciais do Supabase
    const { data: config, error } = await supabase
      .from('integrations_woocommerce')
      .select('*')
      .maybeSingle();

    if (error || !config) {
      throw new Error('Configuração WooCommerce não encontrada. Por favor, conecte primeiro.');
    }

    const credentials: WooCredentials = {
      store_url: config.store_url,
      consumer_key: config.consumer_key,
      consumer_secret: config.consumer_secret,
      api_version: config.api_version || 'wc/v3',
      use_ssl: config.use_ssl ?? true,
      products_only: config.products_only ?? true
    };

    return await fetchWooCommerceProductsDirect(credentials, limit);
  } catch (error: any) {
    console.error('Erro ao buscar produtos:', error);
    return {
      success: false,
      message: error.message || 'Erro ao buscar produtos',
      products: []
    };
  }
}

/**
 * Atualizar produto no WooCommerce usando Edge Function
 */
export async function updateWooCommerceProduct(
  credentials: WooCredentials,
  productId: number,
  productData: Partial<{
    name: string;
    sku: string;
    regular_price: string;
    sale_price: string;
    description: string;
    short_description: string;
    stock_quantity: number;
    manage_stock: boolean;
    images: Array<{ src: string }>;
  }>
) {
  try {
    console.log('🔍 Atualizando produto ID:', productId);
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update',
        config: credentials,
        productId,
        productData
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Produto atualizado com sucesso!');
    
    return result;
  } catch (error: any) {
    console.error('❌ Erro ao atualizar produto:', error);
    return {
      success: false,
      message: error.message || 'Erro ao atualizar produto'
    };
  }
}

/**
 * Atualizar apenas stock de um produto
 */
export async function updateWooCommerceStock(
  credentials: WooCredentials,
  productId: number,
  stockQuantity: number
) {
  return updateWooCommerceProduct(credentials, productId, {
    stock_quantity: stockQuantity,
    manage_stock: true
  });
}

/**
 * Atualizar apenas preço de um produto
 */
export async function updateWooCommercePrice(
  credentials: WooCredentials,
  productId: number,
  regularPrice: string,
  salePrice?: string
) {
  return updateWooCommerceProduct(credentials, productId, {
    regular_price: regularPrice,
    sale_price: salePrice
  });
}

/**
 * Importar produtos do WooCommerce
 */
export async function importWooCommerceProducts(
  mode: 'preview' | 'full',
  options: ImportOptions,
  categoryMapping: Record<string, string> = {}
) {
  try {
    // Criar job de importação
    const { data: job, error: jobError } = await supabase
      .from('woocommerce_import_jobs')
      .insert({
        status: 'pending',
        total_items: 0,
        processed_items: 0
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Buscar produtos
    const limit = mode === 'preview' ? 50 : 1000;
    const result = await fetchWooCommerceProducts(limit);
    
    if (!result.success) {
      throw new Error(result.message);
    }

    // Atualizar job com total de items
    await supabase
      .from('woocommerce_import_jobs')
      .update({
        status: 'running',
        total_items: result.products.length
      })
      .eq('id', job.id);

    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    // Processar cada produto
    for (const product of result.products) {
      try {
        // Verificar se produto já existe (por SKU)
        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .eq('sku', product.sku)
          .maybeSingle();

        if (existing && options.update_existing) {
          // Atualizar produto existente
          const updateData: any = {
            title: product.name,
            updated_at: new Date().toISOString()
          };

          if (options.sync_stock_only) {
            // Apenas atualizar stock
            updateData.stock = product.stock || 0;
          } else {
            // Atualização completa
            updateData.description = product.description;
            updateData.price = parseFloat(product.price) || 0;
            updateData.stock = product.stock || 0;
            updateData.weight = product.weight;
            updateData.dimensions = product.dimensions;
            
            if (options.import_images && product.images.length > 0) {
              updateData.images = product.images;
            }
          }

          const { error: updateError } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', existing.id);

          if (updateError) throw updateError;

          // Atualizar mapeamento
          await supabase
            .from('product_mappings')
            .upsert({
              woo_product_id: product.id,
              local_product_id: existing.id,
              sku: product.sku,
              last_synced_at: new Date().toISOString()
            });

          updatedCount++;

        } else if (!existing && options.create_new) {
          // Criar novo produto
          const { data: newProduct, error: createError } = await supabase
            .from('products')
            .insert({
              title: product.name,
              description: product.description,
              sku: product.sku,
              price: parseFloat(product.price) || 0,
              stock: product.stock || 0,
              weight: product.weight,
              dimensions: product.dimensions,
              images: options.import_images ? product.images : [],
              is_active: true,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) throw createError;

          if (newProduct) {
            // Criar mapeamento
            await supabase
              .from('product_mappings')
              .insert({
                woo_product_id: product.id,
                local_product_id: newProduct.id,
                sku: product.sku,
                last_synced_at: new Date().toISOString()
              });

            createdCount++;
          }
        }

        processedCount++;

        // Atualizar progresso do job a cada 10 produtos
        if (processedCount % 10 === 0) {
          await supabase
            .from('woocommerce_import_jobs')
            .update({ processed_items: processedCount })
            .eq('id', job.id);
        }

      } catch (error: any) {
        console.error(`Erro ao processar produto ${product.sku}:`, error);
        errors.push(`${product.sku}: ${error.message}`);
      }
    }

    // Finalizar job
    await supabase
      .from('woocommerce_import_jobs')
      .update({
        status: errors.length > 0 && processedCount === 0 ? 'failed' : 'completed',
        processed_items: processedCount,
        completed_at: new Date().toISOString(),
        error_message: errors.length > 0 ? errors.slice(0, 5).join('; ') : null
      })
      .eq('id', job.id);

    // Atualizar último sync
    await supabase
      .from('integrations_woocommerce')
      .update({ last_sync_at: new Date().toISOString() })
      .limit(1);

    // Salvar no localStorage para debug panel
    localStorage.setItem('last_woo_sync', JSON.stringify({
      timestamp: new Date().toISOString(),
      processed: processedCount,
      created: createdCount,
      updated: updatedCount,
      errors: errors.length
    }));

    return {
      success: true,
      job_id: job.id,
      processed: processedCount,
      created: createdCount,
      updated: updatedCount,
      total: result.products.length,
      errors
    };

  } catch (error: any) {
    console.error('Erro ao importar produtos:', error);
    return {
      success: false,
      message: error.message || 'Erro ao importar produtos'
    };
  }
}

/**
 * Buscar status de um job de importação
 */
export async function getImportJobStatus(jobId: string) {
  try {
    const { data, error } = await supabase
      .from('woocommerce_import_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw error;

    return {
      success: true,
      job: data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Erro ao buscar status do job'
    };
  }
}

/**
 * Verificar saúde da conexão WooCommerce
 */
export async function checkWooCommerceHealth() {
  try {
    const { data: config, error } = await supabase
      .from('integrations_woocommerce')
      .select('*')
      .maybeSingle();

    if (error || !config) {
      return {
        connected: false,
        message: 'Não conectado'
      };
    }

    return {
      connected: true,
      message: 'Conectado',
      last_sync: config.last_sync_at
    };
  } catch (error) {
    return {
      connected: false,
      message: 'Erro ao verificar conexão'
    };
  }
}

export default {
  testWooCommerceConnection,
  fetchWooCommerceProducts,
  importWooCommerceProducts,
  getImportJobStatus,
  checkWooCommerceHealth
};
