
import { useEffect, useState } from 'react';

interface ApiInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  gmt_offset: number;
  timezone_string: string;
  namespaces: string[];
  authentication: {
    oauth1: boolean;
    oauth2: boolean;
    basic: boolean;
    'application-passwords': boolean;
  };
  routes: {
    [key: string]: {
      namespace: string;
      methods: string[];
      endpoints: Array<{
        methods: string[];
        args: Record<string, unknown>;
      }>;
      _links?: {
        self: string;
      };
    };
  };
}

export default function WpJsonApiDiscovery() {
  const [apiInfo] = useState<ApiInfo>({
    name: 'JokaTech REST API',
    description: 'WooCommerce REST API - E-commerce Platform',
    url: 'https://joka.ct.ws/wp-json/',
    home: 'https://joka.ct.ws',
    gmt_offset: 0,
    timezone_string: 'UTC',
    namespaces: ['wc/v3', 'wc/v2', 'wc/v1', 'wp/v2', 'wc/store', 'oembed/1.0'],
    authentication: {
      oauth1: true,
      oauth2: false,
      basic: true,
      'application-passwords': true,
    },
    routes: {
      '/': {
        namespace: '',
        methods: ['GET'],
        endpoints: [
          {
            methods: ['GET'],
            args: {
              context: {
                required: false,
                default: 'view',
              },
            },
          },
        ],
        _links: {
          self: 'https://joka.ct.ws/wp-json/',
        },
      },
      '/wc/v3': {
        namespace: 'wc/v3',
        methods: ['GET'],
        endpoints: [
          {
            methods: ['GET'],
            args: {},
          },
        ],
        _links: {
          self: 'https://joka.ct.ws/wp-json/wc/v3',
        },
      },
      '/wc/v3/products': {
        namespace: 'wc/v3',
        methods: ['GET', 'POST'],
        endpoints: [
          {
            methods: ['GET'],
            args: {
              context: {
                required: false,
                default: 'view',
              },
              page: {
                required: false,
                default: 1,
              },
              per_page: {
                required: false,
                default: 10,
              },
              search: {
                required: false,
              },
              after: {
                required: false,
              },
              before: {
                required: false,
              },
              exclude: {
                required: false,
              },
              include: {
                required: false,
              },
              offset: {
                required: false,
              },
              order: {
                required: false,
                default: 'desc',
              },
              orderby: {
                required: false,
                default: 'date',
              },
              parent: {
                required: false,
              },
              parent_exclude: {
                required: false,
              },
              slug: {
                required: false,
              },
              status: {
                required: false,
                default: 'any',
              },
              type: {
                required: false,
              },
              sku: {
                required: false,
              },
              featured: {
                required: false,
              },
              category: {
                required: false,
              },
              tag: {
                required: false,
              },
              shipping_class: {
                required: false,
              },
              attribute: {
                required: false,
              },
              attribute_term: {
                required: false,
              },
              tax_class: {
                required: false,
              },
              on_sale: {
                required: false,
              },
              min_price: {
                required: false,
              },
              max_price: {
                required: false,
              },
              stock_status: {
                required: false,
              },
            },
          },
          {
            methods: ['POST'],
            args: {
              name: {
                required: true,
              },
              type: {
                required: false,
                default: 'simple',
              },
              status: {
                required: false,
                default: 'publish',
              },
              featured: {
                required: false,
                default: false,
              },
              catalog_visibility: {
                required: false,
                default: 'visible',
              },
              description: {
                required: false,
              },
              short_description: {
                required: false,
              },
              sku: {
                required: false,
              },
              regular_price: {
                required: false,
              },
              sale_price: {
                required: false,
              },
              date_on_sale_from: {
                required: false,
              },
              date_on_sale_to: {
                required: false,
              },
              virtual: {
                required: false,
                default: false,
              },
              downloadable: {
                required: false,
                default: false,
              },
              downloads: {
                required: false,
              },
              download_limit: {
                required: false,
                default: -1,
              },
              download_expiry: {
                required: false,
                default: -1,
              },
              external_url: {
                required: false,
              },
              button_text: {
                required: false,
              },
              tax_status: {
                required: false,
                default: 'taxable',
              },
              tax_class: {
                required: false,
              },
              manage_stock: {
                required: false,
                default: false,
              },
              stock_quantity: {
                required: false,
              },
              stock_status: {
                required: false,
                default: 'instock',
              },
              backorders: {
                required: false,
                default: 'no',
              },
              sold_individually: {
                required: false,
                default: false,
              },
              weight: {
                required: false,
              },
              dimensions: {
                required: false,
              },
              shipping_class: {
                required: false,
              },
              reviews_allowed: {
                required: false,
                default: true,
              },
              upsell_ids: {
                required: false,
              },
              cross_sell_ids: {
                required: false,
              },
              parent_id: {
                required: false,
              },
              purchase_note: {
                required: false,
              },
              categories: {
                required: false,
              },
              tags: {
                required: false,
              },
              images: {
                required: false,
              },
              attributes: {
                required: false,
              },
              default_attributes: {
                required: false,
              },
              menu_order: {
                required: false,
              },
              meta_data: {
                required: false,
              },
            },
          },
        ],
        _links: {
          self: 'https://joka.ct.ws/wp-json/wc/v3/products',
        },
      },
      '/wc/v3/products/(?P<id>[\\d]+)': {
        namespace: 'wc/v3',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        endpoints: [
          {
            methods: ['GET'],
            args: {
              id: {
                required: false,
              },
              context: {
                required: false,
                default: 'view',
              },
            },
          },
          {
            methods: ['POST', 'PUT', 'PATCH'],
            args: {
              id: {
                required: false,
              },
              name: {
                required: false,
              },
              type: {
                required: false,
              },
              status: {
                required: false,
              },
              featured: {
                required: false,
              },
              catalog_visibility: {
                required: false,
              },
              description: {
                required: false,
              },
              short_description: {
                required: false,
              },
              sku: {
                required: false,
              },
              regular_price: {
                required: false,
              },
              sale_price: {
                required: false,
              },
              date_on_sale_from: {
                required: false,
              },
              date_on_sale_to: {
                required: false,
              },
              virtual: {
                required: false,
              },
              downloadable: {
                required: false,
              },
              downloads: {
                required: false,
              },
              download_limit: {
                required: false,
              },
              download_expiry: {
                required: false,
              },
              external_url: {
                required: false,
              },
              button_text: {
                required: false,
              },
              tax_status: {
                required: false,
              },
              tax_class: {
                required: false,
              },
              manage_stock: {
                required: false,
              },
              stock_quantity: {
                required: false,
              },
              stock_status: {
                required: false,
              },
              backorders: {
                required: false,
              },
              sold_individually: {
                required: false,
              },
              weight: {
                required: false,
              },
              dimensions: {
                required: false,
              },
              shipping_class: {
                required: false,
              },
              reviews_allowed: {
                required: false,
              },
              upsell_ids: {
                required: false,
              },
              cross_sell_ids: {
                required: false,
              },
              parent_id: {
                required: false,
              },
              purchase_note: {
                required: false,
              },
              categories: {
                required: false,
              },
              tags: {
                required: false,
              },
              images: {
                required: false,
              },
              attributes: {
                required: false,
              },
              default_attributes: {
                required: false,
              },
              menu_order: {
                required: false,
              },
              meta_data: {
                required: false,
              },
            },
          },
          {
            methods: ['DELETE'],
            args: {
              id: {
                required: false,
              },
              force: {
                required: false,
                default: false,
              },
            },
          },
        ],
      },
      '/wc/v3/products/categories': {
        namespace: 'wc/v3',
        methods: ['GET', 'POST'],
        endpoints: [
          {
            methods: ['GET'],
            args: {
              context: {
                required: false,
                default: 'view',
              },
              page: {
                required: false,
                default: 1,
              },
              per_page: {
                required: false,
                default: 10,
              },
              search: {
                required: false,
              },
              exclude: {
                required: false,
              },
              include: {
                required: false,
              },
              order: {
                required: false,
                default: 'asc',
              },
              orderby: {
                required: false,
                default: 'name',
              },
              hide_empty: {
                required: false,
                default: false,
              },
              parent: {
                required: false,
              },
              product: {
                required: false,
              },
              slug: {
                required: false,
              },
            },
          },
          {
            methods: ['POST'],
            args: {
              name: {
                required: true,
              },
              slug: {
                required: false,
              },
              parent: {
                required: false,
              },
              description: {
                required: false,
              },
              display: {
                required: false,
                default: 'default',
              },
              image: {
                required: false,
              },
              menu_order: {
                required: false,
              },
            },
          },
        ],
        _links: {
          self: 'https://joka.ct.ws/wp-json/wc/v3/products/categories',
        },
      },
      '/wc/v3/orders': {
        namespace: 'wc/v3',
        methods: ['GET', 'POST'],
        endpoints: [
          {
            methods: ['GET'],
            args: {
              context: {
                required: false,
                default: 'view',
              },
              page: {
                required: false,
                default: 1,
              },
              per_page: {
                required: false,
                default: 10,
              },
              search: {
                required: false,
              },
              after: {
                required: false,
              },
              before: {
                required: false,
              },
              exclude: {
                required: false,
              },
              include: {
                required: false,
              },
              offset: {
                required: false,
              },
              order: {
                required: false,
                default: 'desc',
              },
              orderby: {
                required: false,
                default: 'date',
              },
              parent: {
                required: false,
              },
              parent_exclude: {
                required: false,
              },
              status: {
                required: false,
                default: 'any',
              },
              customer: {
                required: false,
              },
              product: {
                required: false,
              },
              dp: {
                required: false,
                default: 2,
              },
            },
          },
          {
            methods: ['POST'],
            args: {
              parent_id: {
                required: false,
              },
              status: {
                required: false,
                default: 'pending',
              },
              currency: {
                required: false,
                default: 'EUR',
              },
              customer_id: {
                required: false,
                default: 0,
              },
              customer_note: {
                required: false,
              },
              billing: {
                required: false,
              },
              shipping: {
                required: false,
              },
              payment_method: {
                required: false,
              },
              payment_method_title: {
                required: false,
              },
              transaction_id: {
                required: false,
              },
              meta_data: {
                required: false,
              },
              line_items: {
                required: false,
              },
              shipping_lines: {
                required: false,
              },
              fee_lines: {
                required: false,
              },
              coupon_lines: {
                required: false,
              },
              set_paid: {
                required: false,
                default: false,
              },
            },
          },
        ],
        _links: {
          self: 'https://joka.ct.ws/wp-json/wc/v3/orders',
        },
      },
      '/wc/v3/customers': {
        namespace: 'wc/v3',
        methods: ['GET', 'POST'],
        endpoints: [
          {
            methods: ['GET'],
            args: {
              context: {
                required: false,
                default: 'view',
              },
              page: {
                required: false,
                default: 1,
              },
              per_page: {
                required: false,
                default: 10,
              },
              search: {
                required: false,
              },
              exclude: {
                required: false,
              },
              include: {
                required: false,
              },
              offset: {
                required: false,
              },
              order: {
                required: false,
                default: 'asc',
              },
              orderby: {
                required: false,
                default: 'name',
              },
              email: {
                required: false,
              },
              role: {
                required: false,
                default: 'all',
              },
            },
          },
          {
            methods: ['POST'],
            args: {
              email: {
                required: true,
              },
              first_name: {
                required: false,
              },
              last_name: {
                required: false,
              },
              username: {
                required: false,
              },
              password: {
                required: false,
              },
              billing: {
                required: false,
              },
              shipping: {
                required: false,
              },
              meta_data: {
                required: false,
              },
            },
          },
        ],
        _links: {
          self: 'https://joka.ct.ws/wp-json/wc/v3/customers',
        },
      },
      '/wc/v3/system_status': {
        namespace: 'wc/v3',
        methods: ['GET'],
        endpoints: [
          {
            methods: ['GET'],
            args: {
              context: {
                required: false,
                default: 'view',
              },
            },
          },
        ],
        _links: {
          self: 'https://joka.ct.ws/wp-json/wc/v3/system_status',
        },
      },
      '/wp/v2': {
        namespace: 'wp/v2',
        methods: ['GET'],
        endpoints: [
          {
            methods: ['GET'],
            args: {},
          },
        ],
        _links: {
          self: 'https://joka.ct.ws/wp-json/wp/v2',
        },
      },
    },
  });

  useEffect(() => {
    // Detectar se é uma requisição automatizada (WooCommerce.com, Postman, curl, etc.)
    const userAgent = navigator.userAgent.toLowerCase();
    const isAutomated =
      userAgent.includes('curl') ||
      userAgent.includes('postman') ||
      userAgent.includes('woocommerce') ||
      userAgent.includes('wordpress') ||
      document.referrer.includes('woocommerce.com') ||
      document.referrer.includes('wordpress.com');

    // Se for uma requisição automatizada, retornar JSON puro
    if (isAutomated) {
      // Redirecionar para a API Edge Function
      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        window.location.href = `${supabaseUrl}/functions/v1/woocommerce-rest-api`;
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-6 shadow-lg">
            <i className="ri-cloud-line text-white text-4xl"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {apiInfo.name}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {apiInfo.description}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-medium">API Online</span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-link text-purple-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Base URL
              </h3>
            </div>
            <code className="text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-lg block break-all">
              {apiInfo.url}
            </code>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-shield-keyhole-line text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Autenticação
              </h3>
            </div>
            <div className="space-y-2">
              {Object.entries(apiInfo.authentication).map(([key, value]) =>
                value ? (
                  <div key={key} className="flex items-center gap-2">
                    <i className="ri-checkbox-circle-fill text-green-500"></i>
                    <span className="text-sm text-gray-700 capitalize">
                      {key.replace('-', ' ')}
                    </span>
                  </div>
                ) : null
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-apps-line text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Namespaces
              </h3>
            </div>
            <div className="space-y-2">
              {apiInfo.namespaces.slice(0, 4).map((ns) => (
                <code
                  key={ns}
                  className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded block"
                >
                  {ns}
                </code>
              ))}
            </div>
          </div>
        </div>

        {/* Endpoints Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <i className="ri-route-line"></i>
              Endpoints Disponíveis
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(apiInfo.routes).map(([path, route]) => (
                <div
                  key={path}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <code className="text-sm font-mono text-gray-900 flex-1 break-all">
                      {path}
                    </code>
                    <span className="ml-4 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded whitespace-nowrap">
                      {route.namespace || 'root'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {route.methods.map((method) => (
                      <span
                        key={method}
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          method === 'GET'
                            ? 'bg-blue-100 text-blue-700'
                            : method === 'POST'
                              ? 'bg-green-100 text-green-700'
                              : method === 'PUT' || method === 'PATCH'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Como Conectar */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <i className="ri-plug-line"></i>
            Como Conectar o WooCommerce.com
          </h2>
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                Aceda ao WooCommerce.com
              </h3>
              <p className="text-white/90 text-sm pl-8">
                Vá para: WooCommerce.com → Conectar Loja
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">
                  2
                </span>
                Digite a URL da Loja
              </h3>
              <code className="block bg-black/30 px-4 py-2 rounded mt-2 text-sm">
                https://joka.ct.ws
              </code>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">
                  3
                </span>
                Sistema Detecta Automaticamente
              </h3>
              <p className="text-white/90 text-sm pl-8">
                A API REST será descoberta e validada automaticamente
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">
                  4
                </span>
                Autorize a Conexão
              </h3>
              <p className="text-white/90 text-sm pl-8">
                Siga as instruções para autorizar a conexão e gerar as chaves
                API
              </p>
            </div>
          </div>
        </div>

        {/* Testar API */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <i className="ri-terminal-box-line"></i>
            Testar API via cURL
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Descoberta de API:
              </label>
              <code className="block bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                curl -I https://joka.ct.ws/wp-json/
              </code>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Listar Produtos:
              </label>
              <code className="block bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                curl https://joka.ct.ws/wp-json/wc/v3/products
              </code>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                System Status:
              </label>
              <code className="block bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                curl https://joka.ct.ws/wp-json/wc/v3/system_status
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">
            <i className="ri-information-line"></i> Documentação completa
            disponível no dashboard
          </p>
          <a
            href="/admin"
            className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-2"
          >
            <i className="ri-dashboard-line"></i>
            Ir para Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
