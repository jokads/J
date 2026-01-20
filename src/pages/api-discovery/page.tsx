// 🎯 API DISCOVERY PAGE
// Esta página expõe informações da API REST para o WooCommerce detectar automaticamente

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ApiInfo {
  name: string;
  description: string;
  url: string;
  namespaces: string[];
  authentication: {
    oauth1: boolean;
    oauth2: boolean;
    basic: boolean;
  };
  routes: {
    [key: string]: {
      methods: string[];
      endpoints: Array<{
        methods: string[];
        args: any;
      }>;
    };
  };
}

export default function ApiDiscoveryPage() {
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApiInfo();
  }, []);

  const loadApiInfo = async () => {
    try {
      // Buscar produtos do Supabase para contar
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: categoriesCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      const baseUrl = window.location.origin;

      const info: ApiInfo = {
        name: 'JokaTech REST API',
        description: 'API REST compatível com WooCommerce para gestão de produtos, categorias e pedidos',
        url: `${baseUrl}/wp-json/`,
        namespaces: [
          'wc/v3',
          'wc/v2',
          'wc/v1',
          'wp/v2'
        ],
        authentication: {
          oauth1: true,
          oauth2: false,
          basic: true
        },
        routes: {
          '/wc/v3': {
            methods: ['GET'],
            endpoints: [
              {
                methods: ['GET'],
                args: {}
              }
            ]
          },
          '/wc/v3/products': {
            methods: ['GET', 'POST'],
            endpoints: [
              {
                methods: ['GET', 'POST'],
                args: {
                  per_page: {
                    description: 'Número máximo de items a retornar',
                    type: 'integer',
                    default: 10
                  },
                  page: {
                    description: 'Página atual da coleção',
                    type: 'integer',
                    default: 1
                  }
                }
              }
            ]
          },
          '/wc/v3/products/(?P<id>[\\d]+)': {
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            endpoints: [
              {
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                args: {}
              }
            ]
          },
          '/wc/v3/products/categories': {
            methods: ['GET', 'POST'],
            endpoints: [
              {
                methods: ['GET', 'POST'],
                args: {}
              }
            ]
          },
          '/wc/v3/orders': {
            methods: ['GET', 'POST'],
            endpoints: [
              {
                methods: ['GET', 'POST'],
                args: {}
              }
            ]
          },
          '/wc/v3/system_status': {
            methods: ['GET'],
            endpoints: [
              {
                methods: ['GET'],
                args: {}
              }
            ]
          }
        }
      };

      setApiInfo(info);
    } catch (error) {
      console.error('Erro ao carregar API info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se acessar via navegador, mostra interface bonita
  const isJsonRequest = window.location.search.includes('format=json') || 
                        document.referrer.includes('wp-admin') ||
                        navigator.userAgent.toLowerCase().includes('woocommerce');

  if (isJsonRequest && apiInfo) {
    // Retornar JSON puro para WooCommerce
    return (
      <pre style={{ 
        fontFamily: 'monospace', 
        fontSize: '12px', 
        padding: '20px',
        backgroundColor: '#1a1a1a',
        color: '#00ff00',
        overflow: 'auto'
      }}>
        {JSON.stringify(apiInfo, null, 2)}
      </pre>
    );
  }

  // Interface bonita para humanos
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-6 shadow-2xl">
            <i className="ri-code-s-slash-line text-4xl"></i>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            JokaTech REST API
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            API REST compatível com WooCommerce para gestão completa de produtos, categorias e pedidos
          </p>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Status da API</span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-3xl font-bold text-green-400">Online</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Versão</span>
              <i className="ri-git-branch-line text-purple-400 text-xl"></i>
            </div>
            <p className="text-3xl font-bold text-purple-400">v3</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Autenticação</span>
              <i className="ri-shield-check-line text-blue-400 text-xl"></i>
            </div>
            <p className="text-3xl font-bold text-blue-400">OAuth / Basic</p>
          </div>
        </div>

        {/* Namespaces */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <i className="ri-folders-line text-purple-400"></i>
            Namespaces Disponíveis
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {apiInfo?.namespaces.map((ns, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg p-4 border border-purple-500/30">
                <code className="text-purple-300 font-mono font-bold">/{ns}</code>
              </div>
            ))}
          </div>
        </div>

        {/* Endpoints */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <i className="ri-route-line text-blue-400"></i>
            Endpoints Principais
          </h2>
          <div className="space-y-4">
            {apiInfo && Object.entries(apiInfo.routes).map(([route, info], index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <code className="text-blue-300 font-mono font-bold">{route}</code>
                    <div className="flex gap-2 mt-2">
                      {info.methods.map((method, i) => (
                        <span key={i} className={`px-3 py-1 rounded-full text-xs font-bold ${
                          method === 'GET' ? 'bg-green-600/30 text-green-300' :
                          method === 'POST' ? 'bg-yellow-600/30 text-yellow-300' :
                          method === 'PUT' || method === 'PATCH' ? 'bg-blue-600/30 text-blue-300' :
                          'bg-red-600/30 text-red-300'
                        }`}>
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Como Conectar */}
        <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-8 border-2 border-purple-500/30">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <i className="ri-plug-line text-purple-400"></i>
            Como Conectar o WooCommerce
          </h2>
          
          <div className="space-y-6">
            {/* Passo 1 */}
            <div className="bg-gray-900/50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-full font-bold">1</span>
                <h3 className="text-xl font-bold">URL da API</h3>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <code className="text-green-400">{window.location.origin}/wp-json/wc/v3/</code>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="bg-gray-900/50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-full font-bold">2</span>
                <h3 className="text-xl font-bold">Gerar Chaves API</h3>
              </div>
              <p className="text-gray-300 mb-3">
                Vá para: <strong>Dashboard → Integrações → WooCommerce</strong>
              </p>
              <p className="text-gray-400 text-sm">
                As chaves serão geradas automaticamente e guardadas de forma segura no Supabase.
              </p>
            </div>

            {/* Passo 3 */}
            <div className="bg-gray-900/50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-full font-bold">3</span>
                <h3 className="text-xl font-bold">Testar Conexão</h3>
              </div>
              <p className="text-gray-300">
                Use o botão "Testar Conexão" no dashboard para validar a integração.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p className="mb-2">
            <i className="ri-information-line"></i> Para acesso via JSON, adicione <code className="bg-gray-800 px-2 py-1 rounded">?format=json</code> à URL
          </p>
          <a 
            href="/admin" 
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            <i className="ri-dashboard-line"></i>
            Ir para o Dashboard Admin
          </a>
        </div>
      </div>
    </div>
  );
}
