// WooCommerce Proxy - Resolve problemas de CORS
// Esta função faz de intermediário entre o site e o WooCommerce

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface WooConfig {
  store_url: string;
  consumer_key: string;
  consumer_secret: string;
  api_version: string;
  use_ssl: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { action, config, endpoint, limit, page } = await req.json();

    console.log('🔍 WooCommerce Proxy:', { action, endpoint, limit, page });

    // Normalizar URL da loja
    let storeUrl = config.store_url.trim();
    if (storeUrl.endsWith('/')) {
      storeUrl = storeUrl.slice(0, -1);
    }
    if (!storeUrl.startsWith('http://') && !storeUrl.startsWith('https://')) {
      storeUrl = config.use_ssl ? `https://${storeUrl}` : `http://${storeUrl}`;
    }

    // Criar auth header
    const auth = btoa(`${config.consumer_key}:${config.consumer_secret}`);

    // AÇÃO: Testar Conexão
    if (action === 'test') {
      console.log('🧪 Testando conexão...');

      // PASSO 1: Verificar se o site está online
      try {
        const siteCheck = await fetch(storeUrl, {
          method: 'GET',
          headers: { 'Accept': 'text/html,application/json' },
          signal: AbortSignal.timeout(10000)
        });

        if (!siteCheck.ok) {
          return new Response(JSON.stringify({
            success: false,
            message: `❌ Site retornou erro ${siteCheck.status}\n\n🔍 Diagnóstico:\n• O domínio existe mas retornou erro\n• Pode estar em manutenção\n\n✅ Soluções:\n1. Abra ${storeUrl} no navegador\n2. Verifique o painel do InfinityFree\n3. Aguarde alguns minutos`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        console.error('❌ Site não acessível:', error);
        return new Response(JSON.stringify({
          success: false,
          message: `❌ Não foi possível aceder a ${storeUrl}\n\n🔍 Possíveis causas:\n1. ⚠️ Site não configurado no InfinityFree\n2. ⚠️ WordPress não instalado\n3. ⚠️ Domínio não aponta corretamente\n4. ⚠️ DNS não propagou (pode demorar 48h)\n\n✅ Soluções:\n1. Aceda ao painel InfinityFree\n2. Abra ${storeUrl} no navegador - deve aparecer WordPress\n3. Instale WordPress via Softaculous\n4. Aguarde propagação DNS (até 48h)\n5. Tente HTTP em vez de HTTPS (desmarque SSL)`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // PASSO 2: Verificar API REST
      try {
        const wpJsonUrl = `${storeUrl}/wp-json/`;
        const wpJsonCheck = await fetch(wpJsonUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10000)
        });

        if (!wpJsonCheck.ok) {
          return new Response(JSON.stringify({
            success: false,
            message: `❌ API REST não acessível (erro ${wpJsonCheck.status})\n\n🔍 Diagnóstico:\n• WordPress instalado mas API não funciona\n• Problema de permalinks ou .htaccess\n\n✅ Soluções:\n1. WordPress admin → Definições → Permalinks\n2. Selecione "Nome do artigo"\n3. Clique "Guardar alterações"\n4. Tente novamente`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const wpJsonData = await wpJsonCheck.json();
        
        if (!wpJsonData.namespaces || !wpJsonData.namespaces.includes('wc/v3')) {
          return new Response(JSON.stringify({
            success: false,
            message: `❌ WooCommerce não instalado ou inativo\n\n🔍 Diagnóstico:\n• WordPress funcional\n• API REST ativa\n• WooCommerce não detetado\n\n✅ Soluções:\n1. WordPress admin → Plugins\n2. Procure "WooCommerce"\n3. Clique "Instalar Agora"\n4. Clique "Ativar"\n5. Tente novamente\n\nNamespaces: ${wpJsonData.namespaces?.join(', ') || 'nenhum'}`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        console.error('❌ Erro API REST:', error);
        return new Response(JSON.stringify({
          success: false,
          message: `❌ API REST não responde\n\n🔍 Possíveis causas:\n1. Permalinks não configurados\n2. .htaccess com problemas\n3. mod_rewrite não ativo\n\n✅ Soluções:\n1. WordPress admin: ${storeUrl}/wp-admin\n2. Definições → Permalinks\n3. Selecione "Nome do artigo"\n4. Clique "Guardar alterações"`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // PASSO 3: Testar credenciais WooCommerce
      try {
        const version = config.api_version || 'wc/v3';
        const testUrl = `${storeUrl}/wp-json/${version}/products?per_page=1`;
        
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
          if (response.status === 401) {
            return new Response(JSON.stringify({
              success: false,
              message: `❌ Credenciais inválidas (erro 401)\n\n🔍 Diagnóstico:\n• Consumer Key ou Secret incorretos\n• Ou chaves foram revogadas\n\n✅ Soluções:\n1. WooCommerce → Definições → Avançado → REST API\n2. Verifique se a chave existe e está ativa\n3. Crie nova chave:\n   - Clique "Adicionar chave"\n   - Descrição: "Integração"\n   - Permissões: "Leitura/Escrita"\n   - Clique "Gerar chave API"\n4. Copie as novas chaves aqui`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          if (response.status === 404) {
            return new Response(JSON.stringify({
              success: false,
              message: `❌ Endpoint não encontrado (erro 404)\n\n🔍 Diagnóstico:\n• Versão API "${version}" não existe\n• Ou permalinks não configurados\n\n✅ Soluções:\n1. Tente mudar versão API para "wc/v3"\n2. Verifique permalinks (Definições → Permalinks)\n3. Tente novamente`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          const errorText = await response.text();
          return new Response(JSON.stringify({
            success: false,
            message: `❌ Erro ao conectar (${response.status})\n\n${errorText.substring(0, 200)}\n\n✅ Verifique:\n• Consumer Key e Secret corretos\n• Permissões em "Leitura/Escrita"\n• Permalinks como "Nome do artigo"`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Buscar informações adicionais
        const totalHeader = response.headers.get('X-WP-Total');
        const totalProducts = totalHeader ? parseInt(totalHeader, 10) : 0;

        let wooVersion = 'Desconhecido';
        try {
          const systemUrl = `${storeUrl}/wp-json/${version}/system_status`;
          const systemResponse = await fetch(systemUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(10000)
          });

          if (systemResponse.ok) {
            const systemData = await systemResponse.json();
            wooVersion = systemData.environment?.version || 'Desconhecido';
          }
        } catch (e) {
          console.warn('Não foi possível obter versão WooCommerce');
        }

        return new Response(JSON.stringify({
          success: true,
          message: '✅ Conexão estabelecida com sucesso!',
          data: {
            totalProducts,
            wooVersion,
            apiVersion: version,
            storeUrl
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Erro ao testar credenciais:', error);
        return new Response(JSON.stringify({
          success: false,
          message: `❌ Erro inesperado: ${error.message}\n\n✅ Tente:\n1. Verificar se site está online\n2. Verificar WordPress instalado\n3. Verificar WooCommerce ativo\n4. Aguardar e tentar novamente`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // AÇÃO: Buscar Produtos
    if (action === 'fetch') {
      try {
        const version = config.api_version || 'wc/v3';
        const productsUrl = `${storeUrl}/wp-json/${version}/products?per_page=${limit || 50}&page=${page || 1}&status=publish&orderby=date&order=desc`;
        
        console.log('📦 Buscando produtos:', productsUrl);

        const response = await fetch(productsUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro ${response.status}: ${errorText.substring(0, 100)}`);
        }

        const products = await response.json();
        const totalProducts = parseInt(response.headers.get('X-WP-Total') || '0');
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');

        console.log(`✅ ${products.length} produtos carregados (${totalProducts} total)`);

        return new Response(JSON.stringify({
          success: true,
          total: totalProducts,
          total_pages: totalPages,
          current_page: page || 1,
          products: products.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            sku: p.sku || `woo-${p.id}`,
            price: p.price || p.regular_price || '0',
            regular_price: p.regular_price || '0',
            sale_price: p.sale_price || null,
            stock: p.stock_quantity || 0,
            stock_status: p.stock_status,
            manage_stock: p.manage_stock,
            image: p.images?.[0]?.src || '',
            images: p.images?.map((img: any) => img.src) || [],
            category: p.categories?.[0]?.name || 'Sem categoria',
            categories: p.categories?.map((cat: any) => cat.name) || [],
            description: p.description || '',
            short_description: p.short_description || '',
            weight: p.weight || null,
            dimensions: p.dimensions || null,
            variations: p.variations || [],
            attributes: p.attributes || [],
            tags: p.tags?.map((tag: any) => tag.name) || []
          }))
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Erro ao buscar produtos:', error);
        return new Response(JSON.stringify({
          success: false,
          message: error.message || 'Erro ao buscar produtos'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    }

    // AÇÃO: Atualizar Produto
    if (action === 'update') {
      try {
        const { productId, productData } = await req.json();
        const version = config.api_version || 'wc/v3';
        const updateUrl = `${storeUrl}/wp-json/${version}/products/${productId}`;
        
        const response = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
          signal: AbortSignal.timeout(20000)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erro ${response.status}`);
        }

        const product = await response.json();
        
        return new Response(JSON.stringify({
          success: true,
          product
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Erro ao atualizar produto:', error);
        return new Response(JSON.stringify({
          success: false,
          message: error.message || 'Erro ao atualizar produto'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    }

    return new Response(JSON.stringify({
      success: false,
      message: 'Ação não reconhecida'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Erro interno do servidor'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});