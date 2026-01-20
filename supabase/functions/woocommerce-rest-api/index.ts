// 🎯 WOOCOMMERCE REST API EMULATOR
// Esta função simula uma API REST WooCommerce completa
// Permite que o WooCommerce oficial se conecte ao teu site joka.ct.ws

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wc-webhook-signature',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    console.log('🔍 WooCommerce API Request:', req.method, path);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // 🎯 ROTA: /wp-json/ (Descoberta de API)
    if (path === '/wp-json/' || path === '/wp-json') {
      return new Response(JSON.stringify({
        name: 'JokaTech REST API',
        description: 'API REST compatível com WooCommerce',
        url: 'https://joka.ct.ws/wp-json/',
        home: 'https://joka.ct.ws',
        gmt_offset: 0,
        timezone_string: 'Europe/Lisbon',
        namespaces: [
          'wc/v3',
          'wc/v2',
          'wc/v1',
          'wp/v2'
        ],
        authentication: {
          oauth1: {
            request: 'https://joka.ct.ws/oauth1/request',
            authorize: 'https://joka.ct.ws/oauth1/authorize',
            access: 'https://joka.ct.ws/oauth1/access',
            version: '0.1'
          },
          oauth2: false,
          basic: true
        },
        routes: {
          '/wc/v3': {
            namespace: 'wc/v3',
            methods: ['GET'],
            endpoints: [
              {
                methods: ['GET'],
                args: {}
              }
            ],
            _links: {
              self: [{ href: 'https://joka.ct.ws/wp-json/wc/v3' }]
            }
          },
          '/wc/v3/products': {
            namespace: 'wc/v3',
            methods: ['GET', 'POST'],
            endpoints: [
              {
                methods: ['GET'],
                args: {
                  context: {
                    description: 'Scope under which the request is made.',
                    type: 'string',
                    enum: ['view', 'edit'],
                    default: 'view'
                  },
                  page: {
                    description: 'Current page of the collection.',
                    type: 'integer',
                    default: 1
                  },
                  per_page: {
                    description: 'Maximum number of items to be returned.',
                    type: 'integer',
                    default: 10,
                    maximum: 100
                  },
                  search: {
                    description: 'Limit results to those matching a string.',
                    type: 'string'
                  }
                }
              },
              {
                methods: ['POST'],
                args: {}
              }
            ],
            _links: {
              self: [{ href: 'https://joka.ct.ws/wp-json/wc/v3/products' }]
            }
          },
          '/wc/v3/products/categories': {
            namespace: 'wc/v3',
            methods: ['GET', 'POST'],
            _links: {
              self: [{ href: 'https://joka.ct.ws/wp-json/wc/v3/products/categories' }]
            }
          },
          '/wc/v3/orders': {
            namespace: 'wc/v3',
            methods: ['GET', 'POST'],
            _links: {
              self: [{ href: 'https://joka.ct.ws/wp-json/wc/v3/orders' }]
            }
          },
          '/wc/v3/system_status': {
            namespace: 'wc/v3',
            methods: ['GET'],
            _links: {
              self: [{ href: 'https://joka.ct.ws/wp-json/wc/v3/system_status' }]
            }
          }
        },
        _links: {
          help: [{ href: 'https://developer.wordpress.org/rest-api/' }]
        }
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-WP-Total': '1',
          'X-WP-TotalPages': '1'
        }
      });
    }

    // 🎯 ROTA: /wc/v3 (Namespace Root)
    if (path === '/wc/v3' || path === '/wc/v3/') {
      return new Response(JSON.stringify({
        namespace: 'wc/v3',
        routes: {
          '/wc/v3': {
            namespace: 'wc/v3',
            methods: ['GET'],
            _links: { self: [{ href: 'https://joka.ct.ws/wp-json/wc/v3' }] }
          },
          '/wc/v3/products': {
            namespace: 'wc/v3',
            methods: ['GET', 'POST'],
            _links: { self: [{ href: 'https://joka.ct.ws/wp-json/wc/v3/products' }] }
          },
          '/wc/v3/products/categories': {
            namespace: 'wc/v3',
            methods: ['GET', 'POST'],
            _links: { self: [{ href: 'https://joka.ct.ws/wp-json/wc/v3/products/categories' }] }
          },
          '/wc/v3/orders': {
            namespace: 'wc/v3',
            methods: ['GET', 'POST'],
            _links: { self: [{ href: 'https://joka.ct.ws/wp-json/wc/v3/orders' }] }
          }
        },
        _links: {
          up: [{ href: 'https://joka.ct.ws/wp-json/' }]
        }
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // 🎯 ROTA: /wc/v3/products (Listar/Criar Produtos)
    if (path === '/wc/v3/products' || path === '/wc/v3/products/') {
      if (req.method === 'GET') {
        // Buscar produtos do Supabase
        const page = parseInt(url.searchParams.get('page') || '1');
        const perPage = parseInt(url.searchParams.get('per_page') || '10');
        const search = url.searchParams.get('search');
        
        let query = supabaseClient
          .from('products')
          .select('*', { count: 'exact' });

        if (search) {
          query = query.ilike('name', `%${search}%`);
        }

        const { data: products, error, count } = await query
          .range((page - 1) * perPage, page * perPage - 1)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Converter para formato WooCommerce
        const wooProducts = (products || []).map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
          permalink: `https://joka.ct.ws/product/${p.slug || p.id}`,
          date_created: p.created_at,
          date_modified: p.updated_at,
          type: 'simple',
          status: 'publish',
          featured: p.featured || false,
          catalog_visibility: 'visible',
          description: p.description || '',
          short_description: p.short_description || '',
          sku: p.sku || `JOKA-${p.id}`,
          price: p.price?.toString() || '0',
          regular_price: p.price?.toString() || '0',
          sale_price: p.sale_price?.toString() || '',
          on_sale: !!p.sale_price && p.sale_price < p.price,
          purchasable: true,
          total_sales: 0,
          virtual: false,
          downloadable: false,
          downloads: [],
          download_limit: -1,
          download_expiry: -1,
          external_url: '',
          button_text: '',
          tax_status: 'taxable',
          tax_class: '',
          manage_stock: p.manage_stock || false,
          stock_quantity: p.stock || null,
          stock_status: p.stock_status || 'instock',
          backorders: 'no',
          backorders_allowed: false,
          backordered: false,
          sold_individually: false,
          weight: p.weight || '',
          dimensions: p.dimensions || { length: '', width: '', height: '' },
          shipping_required: true,
          shipping_taxable: true,
          shipping_class: '',
          shipping_class_id: 0,
          reviews_allowed: true,
          average_rating: '0.00',
          rating_count: 0,
          related_ids: [],
          upsell_ids: [],
          cross_sell_ids: [],
          parent_id: 0,
          purchase_note: '',
          categories: p.category ? [{ id: p.category_id, name: p.category, slug: p.category.toLowerCase() }] : [],
          tags: [],
          images: p.images ? p.images.map((img: string, idx: number) => ({
            id: idx,
            src: img,
            name: `${p.name} - Image ${idx + 1}`,
            alt: p.name
          })) : [],
          attributes: [],
          default_attributes: [],
          variations: [],
          grouped_products: [],
          menu_order: 0,
          meta_data: [],
          _links: {
            self: [{ href: `https://joka.ct.ws/wp-json/wc/v3/products/${p.id}` }],
            collection: [{ href: 'https://joka.ct.ws/wp-json/wc/v3/products' }]
          }
        }));

        const totalPages = Math.ceil((count || 0) / perPage);

        return new Response(JSON.stringify(wooProducts), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-WP-Total': (count || 0).toString(),
            'X-WP-TotalPages': totalPages.toString()
          }
        });
      }

      if (req.method === 'POST') {
        // Criar produto
        const productData = await req.json();
        
        const { data: newProduct, error } = await supabaseClient
          .from('products')
          .insert({
            name: productData.name,
            slug: productData.slug || productData.name.toLowerCase().replace(/\s+/g, '-'),
            description: productData.description || '',
            short_description: productData.short_description || '',
            price: parseFloat(productData.regular_price || productData.price || '0'),
            sale_price: productData.sale_price ? parseFloat(productData.sale_price) : null,
            sku: productData.sku || `JOKA-${Date.now()}`,
            stock: productData.stock_quantity || 0,
            stock_status: productData.stock_status || 'instock',
            manage_stock: productData.manage_stock || false,
            images: productData.images?.map((img: any) => img.src) || [],
            category: productData.categories?.[0]?.name || null,
            featured: productData.featured || false,
            weight: productData.weight || null,
            dimensions: productData.dimensions || null
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          id: newProduct.id,
          name: newProduct.name,
          status: 'publish',
          message: 'Produto criado com sucesso'
        }), {
          status: 201,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }

    // 🎯 ROTA: /wc/v3/products/{id} (Produto específico)
    const productMatch = path.match(/^\/wc\/v3\/products\/(\d+)\/?$/);
    if (productMatch) {
      const productId = parseInt(productMatch[1]);

      if (req.method === 'GET') {
        const { data: product, error } = await supabaseClient
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error || !product) {
          return new Response(JSON.stringify({
            code: 'woocommerce_rest_product_invalid_id',
            message: 'ID de produto inválido.',
            data: { status: 404 }
          }), {
            status: 404,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        const wooProduct = {
          id: product.id,
          name: product.name,
          slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
          price: product.price?.toString() || '0',
          regular_price: product.price?.toString() || '0',
          sale_price: product.sale_price?.toString() || '',
          description: product.description || '',
          short_description: product.short_description || '',
          sku: product.sku,
          stock: product.stock,
          stock_status: product.stock_status,
          images: product.images?.map((img: string, idx: number) => ({
            id: idx,
            src: img,
            name: `${product.name} - Image ${idx + 1}`
          })) || [],
          categories: product.category ? [{ id: product.category_id, name: product.category }] : []
        };

        return new Response(JSON.stringify(wooProduct), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      if (req.method === 'PUT' || req.method === 'PATCH') {
        const updates = await req.json();
        
        const updateData: any = {};
        if (updates.name) updateData.name = updates.name;
        if (updates.description) updateData.description = updates.description;
        if (updates.short_description) updateData.short_description = updates.short_description;
        if (updates.regular_price || updates.price) updateData.price = parseFloat(updates.regular_price || updates.price);
        if (updates.sale_price) updateData.sale_price = parseFloat(updates.sale_price);
        if (updates.sku) updateData.sku = updates.sku;
        if (updates.stock_quantity !== undefined) updateData.stock = updates.stock_quantity;
        if (updates.stock_status) updateData.stock_status = updates.stock_status;
        if (updates.images) updateData.images = updates.images.map((img: any) => img.src);

        const { data: updated, error } = await supabaseClient
          .from('products')
          .update(updateData)
          .eq('id', productId)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          id: updated.id,
          name: updated.name,
          message: 'Produto atualizado com sucesso'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      if (req.method === 'DELETE') {
        const { error } = await supabaseClient
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) throw error;

        return new Response(JSON.stringify({
          id: productId,
          message: 'Produto deletado com sucesso'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }

    // 🎯 ROTA: /wc/v3/products/categories
    if (path === '/wc/v3/products/categories' || path === '/wc/v3/products/categories/') {
      const { data: categories, error } = await supabaseClient
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      const wooCategories = (categories || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
        parent: 0,
        description: cat.description || '',
        display: 'default',
        image: cat.image ? { id: 0, src: cat.image, name: cat.name, alt: cat.name } : null,
        menu_order: 0,
        count: 0,
        _links: {
          self: [{ href: `https://joka.ct.ws/wp-json/wc/v3/products/categories/${cat.id}` }],
          collection: [{ href: 'https://joka.ct.ws/wp-json/wc/v3/products/categories' }]
        }
      }));

      return new Response(JSON.stringify(wooCategories), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // 🎯 ROTA: /wc/v3/system_status
    if (path === '/wc/v3/system_status' || path === '/wc/v3/system_status/') {
      return new Response(JSON.stringify({
        environment: {
          home_url: 'https://joka.ct.ws',
          site_url: 'https://joka.ct.ws',
          version: '3.0.0',
          log_directory: '/logs/',
          log_directory_writable: true,
          wp_version: '6.4',
          wp_multisite: false,
          wp_memory_limit: 256000000,
          wp_debug_mode: false,
          wp_cron: true,
          language: 'pt_PT',
          server_info: 'Supabase Edge Functions',
          php_version: '8.2.0',
          php_post_max_size: 20971520,
          php_max_execution_time: 300,
          php_max_input_vars: 1000,
          curl_version: '8.0.0',
          suhosin_installed: false,
          max_upload_size: 20971520,
          mysql_version: '15.1',
          mysql_version_string: 'PostgreSQL 15.1',
          default_timezone: 'UTC',
          fsockopen_or_curl_enabled: true,
          soapclient_enabled: true,
          domdocument_enabled: true,
          gzip_enabled: true,
          mbstring_enabled: true,
          remote_post_successful: true,
          remote_post_response: '200',
          remote_get_successful: true,
          remote_get_response: '200'
        },
        database: {
          wc_database_version: '8.0.0',
          database_prefix: 'wp_',
          maxmind_geoip_database: 'N/A',
          database_tables: {},
          database_size: {
            data: 5242880,
            index: 1048576
          }
        },
        active_plugins: [
          'woocommerce/woocommerce.php'
        ],
        theme: {
          name: 'JokaTech',
          version: '1.0.0',
          version_latest: '1.0.0',
          author_url: 'https://joka.ct.ws',
          is_child_theme: false,
          has_woocommerce_support: true,
          has_woocommerce_file: true,
          has_outdated_templates: false,
          overrides: [],
          parent_name: '',
          parent_version: '',
          parent_author_url: ''
        },
        settings: {
          api_enabled: true,
          force_ssl: true,
          currency: 'EUR',
          currency_symbol: '€',
          currency_position: 'right_space',
          thousand_separator: ' ',
          decimal_separator: ',',
          number_of_decimals: 2,
          geolocation_enabled: false,
          taxonomies: {
            product_cat: 'product_cat',
            product_tag: 'product_tag'
          },
          product_visibility_terms: {}
        },
        security: {
          secure_connection: true,
          hide_errors: true
        },
        pages: []
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // 404 - Rota não encontrada
    return new Response(JSON.stringify({
      code: 'rest_no_route',
      message: 'No route was found matching the URL and request method.',
      data: { status: 404 }
    }), {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    return new Response(JSON.stringify({
      code: 'internal_server_error',
      message: error.message || 'Erro interno do servidor',
      data: { status: 500 }
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
