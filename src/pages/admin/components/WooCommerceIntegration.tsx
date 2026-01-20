
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { testWooCommerceConnection, fetchWooCommerceProducts, importWooCommerceProducts } from '../../../api/woocommerce';

interface WooCommerceIntegrationProps {
  darkMode: boolean;
}

interface WooCredentials {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  apiVersion: string;
  useSsl: boolean;
  onlyProducts: boolean;
}

export default function WooCommerceIntegration({ darkMode }: WooCommerceIntegrationProps) {
  // 🎯 Estados principais - SIMPLIFICADOS
  const [credentials, setCredentials] = useState<WooCredentials>({
    storeUrl: '',
    consumerKey: '',
    consumerSecret: '',
    apiVersion: 'wc/v3',
    useSsl: true,
    onlyProducts: true
  });

  const [isConnected, setIsConnected] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [loading, setLoading] = useState(true);
  const [previewProducts, setPreviewProducts] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Carregar configuração existente
  useEffect(() => {
    loadConnection();
  }, []);

  const loadConnection = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('integrations_woocommerce')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar:', error);
      } else if (data) {
        setIsConnected(true);
        setCredentials({
          storeUrl: data.store_url || '',
          consumerKey: '••••••••', // Mascarar
          consumerSecret: '••••••••', // Mascarar
          apiVersion: data.api_version || 'wc/v3',
          useSsl: data.use_ssl ?? true,
          onlyProducts: data.products_only ?? true
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO PARA MUDAR CHECKBOX SSL - SIMPLIFICADA
  const handleSslChange = (checked: boolean) => {
    console.log('🔒 SSL alterado para:', checked);
    setCredentials(prev => ({ ...prev, useSsl: checked }));
  };

  // ✅ FUNÇÃO PARA MUDAR CHECKBOX APENAS PRODUTOS - SIMPLIFICADA
  const handleOnlyProductsChange = (checked: boolean) => {
    console.log('📦 Apenas Produtos alterado para:', checked);
    setCredentials(prev => ({ ...prev, onlyProducts: checked }));
  };

  // Testar conexão
  const handleTestConnection = async () => {
    if (!credentials.storeUrl || !credentials.consumerKey || !credentials.consumerSecret) {
      alert('❌ Preencha todos os campos obrigatórios!');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      console.log('🔍 Testando conexão...');
      const result = await testWooCommerceConnection(credentials);
      
      setTestResult(result);
      
      if (result.success) {
        alert('✅ Conexão bem-sucedida!\n\nAgora clique em "Salvar Conexão" para guardar.');
      } else {
        alert(`❌ Erro na conexão:\n\n${result.message}`);
      }
    } catch (error: any) {
      console.error('Erro ao testar:', error);
      setTestResult({
        success: false,
        message: error.message || 'Erro inesperado'
      });
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  // Salvar conexão
  const handleSaveConnection = async () => {
    if (!testResult?.success) {
      alert('❌ Primeiro teste a conexão!');
      return;
    }

    setSaving(true);

    try {
      const cleanKey = credentials.consumerKey.replace(/•/g, '');
      const cleanSecret = credentials.consumerSecret.replace(/•/g, '');

      const { error } = await supabase
        .from('integrations_woocommerce')
        .upsert({
          store_url: credentials.storeUrl.trim(),
          consumer_key: cleanKey,
          consumer_secret: cleanSecret,
          api_version: credentials.apiVersion,
          use_ssl: credentials.useSsl,
          products_only: credentials.onlyProducts,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('✅ Conexão salva!\n\nAgora pode importar produtos.');
      await loadConnection();
    } catch (error: any) {
      alert(`❌ Erro ao salvar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Carregar preview
  const handleLoadPreview = async () => {
    setImporting(true);
    
    try {
      const result = await fetchWooCommerceProducts(50);
      
      if (result.success) {
        setPreviewProducts(result.products || []);
        setShowPreview(true);
        alert(`✅ Preview carregado!\n\n${result.products?.length || 0} produtos encontrados.`);
      } else {
        alert(`❌ Erro:\n\n${result.message}`);
      }
    } catch (error: any) {
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Importar todos
  const handleImportAll = async () => {
    if (!confirm('Importar TODOS os produtos?\n\nPode demorar alguns minutos.')) {
      return;
    }

    setImporting(true);

    try {
      const result = await importWooCommerceProducts('full', {
        update_existing: true,
        create_new: true,
        sync_stock_only: false,
        import_images: true
      });

      if (result.success) {
        alert(`✅ Importação concluída!\n\nProcessados: ${result.processed}/${result.total}\nCriados: ${result.created}\nAtualizados: ${result.updated}`);
      } else {
        alert(`❌ Erro:\n\n${result.message}`);
      }
    } catch (error: any) {
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Desconectar
  const handleDisconnect = async () => {
    if (!confirm('Desconectar o WooCommerce?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('integrations_woocommerce')
        .delete()
        .match({ store_url: credentials.storeUrl });

      if (error) throw error;

      setIsConnected(false);
      setCredentials({
        storeUrl: '',
        consumerKey: '',
        consumerSecret: '',
        apiVersion: 'wc/v3',
        useSsl: true,
        onlyProducts: true
      });
      setTestResult(null);
      setPreviewProducts([]);
      setShowPreview(false);

      alert('✅ Desconectado!');
    } catch (error: any) {
      alert(`❌ Erro: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#b62bff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🎯 HEADER */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
              🛒 Integração WooCommerce
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Conecte sua loja WordPress + WooCommerce
            </p>
          </div>
          {isConnected && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 rounded-lg border border-green-500/30">
              <i className="ri-checkbox-circle-fill text-xl"></i>
              <span className="font-medium">Conectado</span>
            </div>
          )}
        </div>

        {/* 📚 GUIA COMPLETO - EXPANDIDO COM SOLUÇÃO DO SEU PROBLEMA */}
        {showGuide && (
          <div className={`${darkMode ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300'} border-2 rounded-xl p-6 mb-6`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <i className="ri-book-open-fill text-blue-500 text-3xl mt-1"></i>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-600 dark:text-blue-400 text-xl mb-4">
                    📘 Guia Completo: Como Configurar WordPress no InfinityFree
                  </h3>
                  
                  {/* PASSO 1 */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">1</span>
                      <h4 className="font-bold text-lg">Criar Conta no InfinityFree</h4>
                    </div>
                    <div className={`ml-10 space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>• Aceda: <a href="https://infinityfree.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">infinityfree.net</a></p>
                      <p>• Registe-se com email válido</p>
                      <p>• Confirme o email de verificação</p>
                      <p>• Faça login no painel de controle</p>
                    </div>
                  </div>

                  {/* PASSO 2 - SEU PROBLEMA ESPECÍFICO */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">2</span>
                      <h4 className="font-bold text-lg">⚠️ IMPORTANTE: Configurar Domínio Corretamente</h4>
                    </div>
                    <div className={`ml-10 space-y-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className={`${darkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-400'} border-l-4 p-3 rounded`}>
                        <p className="font-bold text-yellow-600 dark:text-yellow-400 mb-2">🚨 O SEU PROBLEMA:</p>
                        <p className="mb-2">Está tentando acessar <code className="bg-black/20 px-2 py-0.5 rounded">joka.ct.ws/wp</code> mas o WordPress não responde!</p>
                        <p className="font-bold text-green-600 dark:text-green-400">✅ SOLUÇÃO:</p>
                      </div>
                      <p className="font-bold">Opção A - Subdomínio Separado (RECOMENDADO):</p>
                      <ol className="list-decimal ml-6 space-y-1">
                        <li>No InfinityFree, crie conta de hosting separada</li>
                        <li>Use subdomínio: <code className="bg-black/20 px-2 py-0.5 rounded font-bold">store.joka.ct.ws</code></li>
                        <li>Instale WordPress nesta conta</li>
                        <li>WordPress ficará em: <code className="bg-black/20 px-2 py-0.5 rounded font-bold">https://store.joka.ct.ws</code></li>
                        <li>API em: <code className="bg-black/20 px-2 py-0.5 rounded font-bold">https://store.joka.ct.ws/wp-json/wc/v3/</code></li>
                      </ol>
                      <p className="font-bold mt-3">Opção B - Mesmo Domínio (Mais Complexo):</p>
                      <ol className="list-decimal ml-6 space-y-1">
                        <li>Crie pasta /wp no File Manager</li>
                        <li>Instale WordPress manualmente na pasta /wp</li>
                        <li>Configure .htaccess corretamente</li>
                        <li>WordPress em: <code className="bg-black/20 px-2 py-0.5 rounded">https://joka.ct.ws/wp</code></li>
                        <li>⚠️ Mais difícil de configurar permalinks</li>
                      </ol>
                      <div className={`${darkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-400'} border-l-4 p-3 rounded mt-3`}>
                        <p className="font-bold text-green-600 dark:text-green-400">💡 RECOMENDAÇÃO:</p>
                        <p>Use a Opção A (subdomínio separado) - é MUITO mais fácil e funciona melhor!</p>
                      </div>
                    </div>
                  </div>

                  {/* PASSO 3 */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">3</span>
                      <h4 className="font-bold text-lg">Instalar WordPress via Softaculous</h4>
                    </div>
                    <div className={`ml-10 space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>• No painel InfinityFree, clique "Softaculous"</p>
                      <p>• Procure "WordPress" e clique "Install"</p>
                      <p>• Escolha protocolo: <strong>https://</strong></p>
                      <p>• Escolha domínio: <strong>store.joka.ct.ws</strong></p>
                      <p>• Deixe "In Directory" VAZIO (muito importante!)</p>
                      <p>• Defina nome do site, admin username e password</p>
                      <p>• Clique "Install"</p>
                      <p>• Aguarde 2-5 minutos</p>
                      <p>• Teste: abra <code className="bg-black/20 px-2 py-0.5 rounded">https://store.joka.ct.ws</code> no navegador</p>
                    </div>
                  </div>

                  {/* PASSO 4 */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">4</span>
                      <h4 className="font-bold text-lg">Instalar WooCommerce Plugin</h4>
                    </div>
                    <div className={`ml-10 space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>• Faça login no WordPress: <code className="bg-black/20 px-2 py-0.5 rounded">https://store.joka.ct.ws/wp-admin</code></p>
                      <p>• Vá para: Plugins → Adicionar Novo</p>
                      <p>• Procure "WooCommerce"</p>
                      <p>• Clique "Instalar Agora" → "Ativar"</p>
                      <p>• Siga o assistente de configuração (pode pular)</p>
                      <p>• Configure moeda, país, etc.</p>
                    </div>
                  </div>

                  {/* PASSO 5 - CRÍTICO */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full font-bold">5</span>
                      <h4 className="font-bold text-lg">⚠️ CRÍTICO: Configurar Permalinks</h4>
                    </div>
                    <div className={`ml-10 space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className={`${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-400'} border-l-4 p-3 rounded mb-3`}>
                        <p className="font-bold text-red-600 dark:text-red-400">🚨 SEM ISTO A API NÃO FUNCIONA!</p>
                      </div>
                      <p>• WordPress → Definições → Permalinks</p>
                      <p>• Selecione: <strong>"Nome do post"</strong></p>
                      <p>• Clique "Salvar alterações"</p>
                      <p>• Teste: abra <code className="bg-black/20 px-2 py-0.5 rounded">https://store.joka.ct.ws/wp-json/</code></p>
                      <p>• Deve mostrar JSON (não erro 404!)</p>
                    </div>
                  </div>

                  {/* PASSO 6 */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">6</span>
                      <h4 className="font-bold text-lg">Gerar Chaves API do WooCommerce</h4>
                    </div>
                    <div className={`ml-10 space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>• WooCommerce → Configurações → Avançado → REST API</p>
                      <p>• Clique "Adicionar chave"</p>
                      <p>• Descrição: <strong>"Integração JokaTech"</strong></p>
                      <p>• Utilizador: <strong>(seu admin)</strong></p>
                      <p>• Permissões: <strong>Leitura/Escrita</strong></p>
                      <p>• Clique "Gerar chave API"</p>
                      <p>• ⚠️ COPIE as chaves AGORA (só aparecem uma vez!):</p>
                      <p className="ml-4">- Consumer Key: <code className="bg-black/20 px-2 py-0.5 rounded">ck_...</code></p>
                      <p className="ml-4">- Consumer Secret: <code className="bg-black/20 px-2 py-0.5 rounded">cs_...</code></p>
                    </div>
                  </div>

                  {/* PASSO 7 */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">7</span>
                      <h4 className="font-bold text-lg">Configurar CORS (Anti-bloqueio)</h4>
                    </div>
                    <div className={`ml-10 space-y-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p className="font-bold">No InfinityFree File Manager:</p>
                      <p>1. Abra o ficheiro: <code className="bg-black/20 px-2 py-0.5 rounded">wp-config.php</code></p>
                      <p>2. Adicione ANTES de <code className="bg-black/20 px-2 py-0.5 rounded">/* That's all, stop editing! */</code>:</p>
                      <pre className={`${darkMode ? 'bg-gray-900' : 'bg-gray-800'} text-green-400 p-3 rounded mt-2 overflow-x-auto text-xs`}>
{`// CORS para integração com joka.ct.ws
header('Access-Control-Allow-Origin: https://joka.ct.ws');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}`}
                      </pre>
                      <p>3. Salve o ficheiro</p>
                    </div>
                  </div>

                  {/* PASSO 8 */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold">8</span>
                      <h4 className="font-bold text-lg">Conectar Aqui Embaixo</h4>
                    </div>
                    <div className={`ml-10 space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>• Cole a URL: <code className="bg-black/20 px-2 py-0.5 rounded font-bold">https://store.joka.ct.ws</code></p>
                      <p>• Cole o Consumer Key</p>
                      <p>• Cole o Consumer Secret</p>
                      <p>• ✅ Marque "Usar SSL"</p>
                      <p>• ✅ Marque "Sincronizar apenas produtos"</p>
                      <p>• Clique "Testar Conexão"</p>
                      <p>• Se sucesso (✅), clique "Salvar Conexão"</p>
                      <p>• Depois clique "Importar Todos"</p>
                    </div>
                  </div>

                  {/* TROUBLESHOOTING */}
                  <div className={`${darkMode ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-50 border-orange-400'} border-l-4 p-4 rounded mt-6`}>
                    <p className="font-bold text-orange-600 dark:text-orange-400 mb-2">🆘 Se der erro:</p>
                    <ul className="space-y-1 text-xs">
                      <li>❌ <strong>Erro 404:</strong> Permalinks não configurados (Passo 5)</li>
                      <li>❌ <strong>Erro CORS:</strong> wp-config.php não editado (Passo 7)</li>
                      <li>❌ <strong>Erro 401:</strong> Chaves API erradas (Passo 6)</li>
                      <li>❌ <strong>Site não responde:</strong> WordPress não instalado corretamente (Passo 3)</li>
                      <li>❌ <strong>Timeout:</strong> Desmarque "Usar SSL" temporariamente</li>
                    </ul>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors ml-4`}
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
          </div>
        )}

        {!showGuide && (
          <button
            onClick={() => setShowGuide(true)}
            className={`mb-6 px-4 py-2 ${darkMode ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-50 text-blue-600 border-blue-300'} border-2 rounded-lg hover:opacity-80 transition-opacity flex items-center gap-2 font-medium`}
          >
            <i className="ri-book-open-line text-xl"></i>
            Mostrar Guia Completo de Instalação
          </button>
        )}

        {/* 📝 FORMULÁRIO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* URL */}
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              🌐 URL da Loja WooCommerce *
            </label>
            <input
              type="text"
              value={credentials.storeUrl}
              onChange={(e) => {
                console.log('📝 URL:', e.target.value);
                setCredentials(prev => ({ ...prev, storeUrl: e.target.value }));
              }}
              placeholder="https://store.joka.ct.ws"
              className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border-2 focus:outline-none focus:ring-2 focus:ring-[#b62bff] focus:border-transparent transition-all`}
            />
          </div>

          {/* Consumer Key */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              🔑 Consumer Key *
            </label>
            <input
              type="text"
              value={credentials.consumerKey}
              onChange={(e) => {
                console.log('📝 Consumer Key alterada');
                setCredentials(prev => ({ ...prev, consumerKey: e.target.value }));
              }}
              placeholder="ck_xxxxxxxxxxxxxxxx"
              className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border-2 focus:outline-none focus:ring-2 focus:ring-[#b62bff] focus:border-transparent font-mono text-sm transition-all`}
            />
          </div>

          {/* Consumer Secret */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              🔐 Consumer Secret *
            </label>
            <input
              type="password"
              value={credentials.consumerSecret}
              onChange={(e) => {
                console.log('📝 Consumer Secret alterada');
                setCredentials(prev => ({ ...prev, consumerSecret: e.target.value }));
              }}
              placeholder="cs_xxxxxxxxxxxxxxxx"
              className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border-2 focus:outline-none focus:ring-2 focus:ring-[#b62bff] focus:border-transparent font-mono text-sm transition-all`}
            />
          </div>

          {/* Versão API */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              ⚙️ Versão da API
            </label>
            <select
              value={credentials.apiVersion}
              onChange={(e) => {
                console.log('📝 API Version:', e.target.value);
                setCredentials(prev => ({ ...prev, apiVersion: e.target.value }));
              }}
              className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border-2 focus:outline-none focus:ring-2 focus:ring-[#b62bff] focus:border-transparent transition-all cursor-pointer`}
            >
              <option value="wc/v3">wc/v3 (Recomendado)</option>
              <option value="wc/v2">wc/v2</option>
              <option value="wc/v1">wc/v1</option>
            </select>
          </div>

          {/* ✅ CHECKBOXES - RECONSTRUÍDOS DO ZERO */}
          <div className="flex flex-col gap-4">
            {/* SSL Checkbox */}
            <div 
              onClick={() => handleSslChange(!credentials.useSsl)}
              className="flex items-start gap-3 cursor-pointer select-none group"
            >
              <div className="relative flex items-center justify-center w-6 h-6 mt-0.5">
                <input
                  type="checkbox"
                  checked={credentials.useSsl}
                  onChange={(e) => handleSslChange(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-6 h-6 text-[#b62bff] bg-transparent border-2 border-gray-400 rounded cursor-pointer focus:ring-2 focus:ring-[#b62bff] focus:ring-offset-2 checked:bg-[#b62bff] checked:border-[#b62bff] transition-all appearance-none"
                  style={{
                    backgroundImage: credentials.useSsl ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd'/%3E%3C/svg%3E")` : 'none',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              </div>
              <div className="flex-1">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} group-hover:text-[#b62bff] transition-colors`}>
                  🔒 Usar SSL (HTTPS)
                </span>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Recomendado para produção
                </p>
              </div>
            </div>

            {/* Only Products Checkbox */}
            <div 
              onClick={() => handleOnlyProductsChange(!credentials.onlyProducts)}
              className="flex items-start gap-3 cursor-pointer select-none group"
            >
              <div className="relative flex items-center justify-center w-6 h-6 mt-0.5">
                <input
                  type="checkbox"
                  checked={credentials.onlyProducts}
                  onChange={(e) => handleOnlyProductsChange(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-6 h-6 text-[#b62bff] bg-transparent border-2 border-gray-400 rounded cursor-pointer focus:ring-2 focus:ring-[#b62bff] focus:ring-offset-2 checked:bg-[#b62bff] checked:border-[#b62bff] transition-all appearance-none"
                  style={{
                    backgroundImage: credentials.onlyProducts ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd'/%3E%3C/svg%3E")` : 'none',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              </div>
              <div className="flex-1">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} group-hover:text-[#b62bff] transition-colors`}>
                  📦 Sincronizar apenas produtos
                </span>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Ignora pedidos e clientes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 BOTÕES */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleTestConnection}
            disabled={testing || !credentials.storeUrl || !credentials.consumerKey || !credentials.consumerSecret}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap font-medium shadow-lg transition-all"
          >
            {testing ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Testando...
              </>
            ) : (
              <>
                <i className="ri-plug-line"></i>
                Testar Conexão
              </>
            )}
          </button>

          <button
            onClick={handleSaveConnection}
            disabled={saving || !testResult?.success}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap font-medium shadow-lg transition-all"
          >
            {saving ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Salvando...
              </>
            ) : (
              <>
                <i className="ri-save-line"></i>
                Salvar Conexão
              </>
            )}
          </button>

          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 whitespace-nowrap font-medium shadow-lg transition-all"
            >
              <i className="ri-link-unlink"></i>
              Desconectar
            </button>
          )}
        </div>

        {/* Resultado do Teste */}
        {testResult && (
          <div className={`mt-6 p-4 rounded-lg border-2 ${testResult.success ? (darkMode ? 'bg-green-900/20 border-green-600' : 'bg-green-50 border-green-400') : (darkMode ? 'bg-red-900/20 border-red-600' : 'bg-red-50 border-red-400')}`}>
            <div className="flex items-start gap-3">
              <i className={`${testResult.success ? 'ri-checkbox-circle-fill text-green-500' : 'ri-error-warning-fill text-red-500'} text-3xl mt-0.5`}></i>
              <div className="flex-1">
                <pre className={`text-sm whitespace-pre-wrap font-sans ${testResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`} style={{ fontFamily: 'inherit' }}>
                  {testResult.message}
                </pre>
                {testResult.success && testResult.data && (
                  <div className={`mt-3 space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p>📦 Produtos: <strong>{testResult.data.totalProducts}</strong></p>
                    <p>🔗 URL: <strong>{testResult.data.storeUrl}</strong></p>
                    <p>⚙️ WooCommerce: <strong>{testResult.data.wooVersion}</strong></p>
                    <p>📡 API: <strong>{testResult.data.apiVersion}</strong></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Importação */}
      {isConnected && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <i className="ri-download-cloud-line text-[#ff6a00]"></i>
            Importação de Produtos
          </h3>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleLoadPreview}
              disabled={importing}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap font-medium shadow-lg"
            >
              {importing ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Carregando...
                </>
              ) : (
                <>
                  <i className="ri-eye-line"></i>
                  Preview (50 produtos)
                </>
              )}
            </button>

            <button
              onClick={handleImportAll}
              disabled={importing}
              className="px-6 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2 whitespace-nowrap font-medium shadow-lg"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Importando...
                </>
              ) : (
                <>
                  <i className="ri-download-line"></i>
                  Importar Todos
                </>
              )}
            </button>
          </div>

          {/* Preview */}
          {showPreview && previewProducts.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg">Preview ({previewProducts.length} produtos)</h4>
                <button
                  onClick={() => setShowPreview(false)}
                  className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-100'}>
                    <tr>
                      <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Imagem</th>
                      <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Nome</th>
                      <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>SKU</th>
                      <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Preço</th>
                      <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewProducts.slice(0, 10).map((product, index) => (
                      <tr key={index} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="px-4 py-3">
                          <div className={`w-12 h-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded overflow-hidden`}>
                            {product.image && (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                        </td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{product.name}</td>
                        <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{product.sku || '-'}</td>
                        <td className="px-4 py-3 text-[#b62bff] font-medium">€{product.price}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{product.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
