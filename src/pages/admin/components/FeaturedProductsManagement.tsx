import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  stock: number;
  slug: string;
  featured?: boolean;
  is_active: boolean;
  display_order?: number;
  category_id?: string;
  sku?: string;
}

interface FeaturedConfig {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  badge_text: string;
  button_text: string;
  wallpaper_url: string;
  show_section: boolean;
  auto_scroll_speed: number;
  max_products: number;
  created_at?: string;
  updated_at?: string;
}

export default function FeaturedProductsManagement() {
  const { darkMode } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<FeaturedConfig>({
    title: 'Seleção Especial',
    subtitle: 'Os Melhores Produtos Para Você',
    description: 'Confira nossa curadoria exclusiva de produtos premium com os melhores preços e qualidade garantida',
    badge_text: 'Produtos em Destaque',
    button_text: 'Ver Todos os Produtos',
    wallpaper_url: 'https://readdy.ai/api/search-image?query=modern%20abstract%20ecommerce%20shopping%20background%20with%20floating%20geometric%20shapes%20vibrant%20purple%20orange%20pink%20gradient%20dynamic%20composition%20professional%20lighting%20particles%20glow%20effects%20futuristic%20digital%20marketplace%20atmosphere%20no%20people&width=1920&height=800&seq=featured-products-wallpaper-v1&orientation=landscape',
    show_section: true,
    auto_scroll_speed: 20,
    max_products: 10
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'config'>('products');
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar TODOS os produtos ativos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      const processedProducts = (productsData || []).map(product => ({
        ...product,
        images: product.images && Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : [`https://readdy.ai/api/search-image?query=professional%20$%7Bproduct.name%7D%20product%20photography%20simple%20clean%20white%20background%20high%20quality%20detailed%20studio%20lighting&width=600&height=600&seq=prod-${product.id}&orientation=squarish`]
      }));

      setProducts(processedProducts);

      // Separar produtos em destaque
      const featured = processedProducts
        .filter(p => p.featured)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      
      setFeaturedProducts(featured);

      // Carregar configuração
      const { data: configData, error: configError } = await supabase
        .from('home_page_config')
        .select('*')
        .eq('section', 'featured_products')
        .single();

      if (configError && configError.code !== 'PGRST116') {
        console.error('Erro ao carregar configuração:', configError);
      }

      if (configData) {
        setConfig({
          id: configData.id,
          title: configData.title || config.title,
          subtitle: configData.subtitle || config.subtitle,
          description: configData.description || config.description,
          badge_text: configData.badge_text || config.badge_text,
          button_text: configData.button_text || config.button_text,
          wallpaper_url: configData.wallpaper_url || config.wallpaper_url,
          show_section: configData.show_section !== false,
          auto_scroll_speed: configData.auto_scroll_speed || config.auto_scroll_speed,
          max_products: configData.max_products || config.max_products
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showMessage('error', 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const toggleFeatured = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const newFeaturedStatus = !product.featured;

      // Se estiver adicionando e já atingiu o limite
      if (newFeaturedStatus && featuredProducts.length >= config.max_products) {
        showMessage('error', `❌ Limite de ${config.max_products} produtos em destaque atingido!`);
        return;
      }

      const { error } = await supabase
        .from('products')
        .update({ 
          featured: newFeaturedStatus,
          display_order: newFeaturedStatus ? featuredProducts.length : null
        })
        .eq('id', productId);

      if (error) throw error;

      showMessage('success', newFeaturedStatus ? '✅ Produto adicionado aos destaques!' : '✅ Produto removido dos destaques!');
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      showMessage('error', 'Erro ao atualizar produto');
    }
  };

  const updateDisplayOrder = async (productId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ display_order: newOrder })
        .eq('id', productId);

      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      showMessage('error', 'Erro ao atualizar ordem');
    }
  };

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === featuredProducts.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const product1 = featuredProducts[index];
    const product2 = featuredProducts[newIndex];

    updateDisplayOrder(product1.id, newIndex);
    updateDisplayOrder(product2.id, index);
  };

  // Salvar configurações
  const handleSaveConfig = async () => {
    try {
      setSaving(true);

      // Validar limite
      if (config.max_featured < featuredProducts.length) {
        showMessage('error', `❌ O limite não pode ser menor que ${featuredProducts.length} (produtos atualmente em destaque)`);
        return;
      }

      const configData = {
        max_featured: config.max_featured,
        auto_scroll: config.auto_scroll,
        auto_scroll_speed: config.auto_scroll_speed,
        show_arrows: config.show_arrows,
        show_dots: config.show_dots,
        updated_at: new Date().toISOString()
      };

      if (config.id) {
        // Atualizar existente
        const { error } = await supabase
          .from('home_page_config')
          .update(configData)
          .eq('id', config.id);

        if (error) {
          console.error('Erro ao atualizar:', error);
          throw new Error(error.message || 'Erro ao atualizar configuração');
        }
      } else {
        // Criar novo
        const { data, error } = await supabase
          .from('home_page_config')
          .insert([configData])
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar:', error);
          throw new Error(error.message || 'Erro ao criar configuração');
        }
        if (data) {
          setConfig({ ...config, id: data.id });
        }
      }

      showMessage('success', '✅ Configuração salva com sucesso!');
      await loadData();
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      const errorMsg = error?.message || 'Erro desconhecido ao salvar configuração';
      showMessage('error', `❌ Erro: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  // TODOS os produtos para o modal
  const allProducts = products;
  
  // Filtrar por pesquisa
  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Gerar números de página
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Estatísticas
  const availableProducts = products.filter(p => !p.featured);
  const totalProducts = products.length;
  const vagasRestantes = config.max_products - featuredProducts.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            A carregar produtos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🌟 Produtos em Destaque
          </h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Gerir produtos exibidos no carrossel da página inicial
          </p>
        </div>
      </div>

      {/* Mensagem de Feedback */}
      {message && (
        <div className={`p-4 rounded-xl border-2 ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/50 text-green-500'
            : 'bg-red-500/10 border-red-500/50 text-red-500'
        } flex items-center gap-3 animate-pulse`}>
          <i className={`${message.type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'} text-2xl`}></i>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Produtos */}
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'} shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="ri-box-3-line text-2xl text-white"></i>
            </div>
            <div>
              <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total de Produtos
              </p>
              <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {totalProducts}
              </p>
            </div>
          </div>
        </div>

        {/* Produtos em Destaque */}
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20' : 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200'} shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="ri-star-fill text-2xl text-white"></i>
            </div>
            <div>
              <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Em Destaque
              </p>
              <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {featuredProducts.length}/{config.max_products}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Exibidos na homepage
              </p>
            </div>
          </div>
        </div>

        {/* Disponíveis */}
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20' : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'} shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="ri-check-line text-2xl text-white"></i>
            </div>
            <div>
              <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Disponíveis
              </p>
              <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {availableProducts.length}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Podem ser adicionados
              </p>
            </div>
          </div>
        </div>

        {/* Vagas Restantes */}
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'} shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="ri-dashboard-line text-2xl text-white"></i>
            </div>
            <div>
              <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Vagas Restantes
              </p>
              <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {vagasRestantes}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                De {config.max_products} vagas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 p-1 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white shadow-lg'
              : darkMode
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <i className="ri-star-line mr-2"></i>
          Gerir Produtos ({featuredProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
            activeTab === 'config'
              ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white shadow-lg'
              : darkMode
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <i className="ri-settings-3-line mr-2"></i>
          Configurações
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'products' ? (
        <div className="space-y-6">
          {/* Produtos em Destaque */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'} shadow-lg`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ⭐ Produtos em Destaque
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {featuredProducts.length} de {config.max_products} produtos • Arraste para reordenar
                </p>
              </div>
              <button
                onClick={() => {
                  setShowProductModal(true);
                  setCurrentPage(1);
                  setSearchQuery('');
                }}
                disabled={featuredProducts.length >= config.max_products}
                className={`px-6 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                  featuredProducts.length >= config.max_products ? '' : 'cursor-pointer'
                }`}
              >
                <i className="ri-add-line text-xl"></i>
                {featuredProducts.length >= config.max_products ? `Limite Atingido (${config.max_products})` : 'Adicionar Produto'}
              </button>
            </div>

            {featuredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-star-line text-5xl text-amber-500"></i>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Nenhum produto em destaque
                </h3>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Adicione produtos para exibir no carrossel da página inicial
                </p>
                <button
                  onClick={() => {
                    setShowProductModal(true);
                    setCurrentPage(1);
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-add-line mr-2"></i>
                  Adicionar Primeiro Produto
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {featuredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`group p-4 rounded-xl ${darkMode ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300 hover:shadow-lg`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Número da Ordem */}
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                        #{index + 1}
                      </div>

                      {/* Imagem */}
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://readdy.ai/api/search-image?query=professional%20$%7Bproduct.name%7D%20product%20photography&width=200&height=200&seq=prod-fallback-${product.id}&orientation=squarish`;
                        }}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold mb-1 truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {product.name}
                        </h3>
                        <p className={`text-sm mb-2 line-clamp-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {product.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
                            €{product.price.toFixed(2)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            product.stock > 10
                              ? 'bg-green-500/20 text-green-500'
                              : product.stock > 0
                                ? 'bg-amber-500/20 text-amber-500'
                                : 'bg-red-500/20 text-red-500'
                          }`}>
                            Stock: {product.stock}
                          </span>
                          {product.sku && (
                            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              SKU: {product.sku}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controles de Ordem */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveProduct(index, 'up')}
                          disabled={index === 0}
                          className={`w-10 h-10 rounded-lg ${
                            darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
                          } border ${darkMode ? 'border-gray-600' : 'border-gray-300'} flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed ${
                            index === 0 ? '' : 'cursor-pointer'
                          }`}
                        >
                          <i className="ri-arrow-up-s-line text-xl"></i>
                        </button>
                        <button
                          onClick={() => moveProduct(index, 'down')}
                          disabled={index === featuredProducts.length - 1}
                          className={`w-10 h-10 rounded-lg ${
                            darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
                          } border ${darkMode ? 'border-gray-600' : 'border-gray-300'} flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed ${
                            index === featuredProducts.length - 1 ? '' : 'cursor-pointer'
                          }`}
                        >
                          <i className="ri-arrow-down-s-line text-xl"></i>
                        </button>
                      </div>

                      {/* Botão Remover */}
                      <button
                        onClick={() => toggleFeatured(product.id)}
                        className="w-10 h-10 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                        title="Remover dos destaques"
                      >
                        <i className="ri-close-line text-xl"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Configurações Gerais */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <i className="ri-settings-3-line mr-2"></i>
              Configurações Gerais
            </h2>

            <div className="space-y-4">
              {/* Mostrar Seção */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[#b62bff]/10 to-[#ff6a00]/10 border border-[#b62bff]/20">
                <div>
                  <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Mostrar Seção
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Exibir carrossel de produtos em destaque na homepage
                  </p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, show_section: !config.show_section })}
                  className={`relative w-14 h-8 rounded-full transition-colors cursor-pointer ${
                    config.show_section ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    config.show_section ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
                </button>
              </div>

              {/* Máximo de Produtos - MELHORADO */}
              <div className={`p-4 rounded-lg border-2 ${darkMode ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-300 bg-amber-50'}`}>
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <i className="ri-dashboard-line mr-2"></i>
                  Limite Máximo de Produtos em Destaque
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={featuredProducts.length}
                    max="50"
                    value={config.max_products}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value) || 10;
                      if (newValue >= featuredProducts.length) {
                        setConfig({ ...config, max_products: newValue });
                      }
                    }}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#b62bff] font-bold text-lg`}
                  />
                  <div className={`px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'} min-w-[120px] text-center`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                      Em uso
                    </p>
                    <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {featuredProducts.length}/{config.max_products}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-start gap-2">
                  <i className="ri-information-line text-amber-500 mt-0.5"></i>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p className="mb-1">
                      <strong>Atualmente:</strong> {featuredProducts.length} produtos em destaque
                    </p>
                    <p className="mb-1">
                      <strong>Vagas disponíveis:</strong> {vagasRestantes} de {config.max_products}
                    </p>
                    <p className={`${darkMode ? 'text-amber-400' : 'text-amber-600'} font-semibold`}>
                      ⚠️ O limite não pode ser menor que {featuredProducts.length} (produtos atualmente em destaque)
                    </p>
                  </div>
                </div>
              </div>

              {/* Velocidade do Scroll */}
              <div>
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Velocidade do Scroll Automático (ms)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={config.auto_scroll_speed}
                  onChange={(e) => setConfig({ ...config, auto_scroll_speed: parseInt(e.target.value) || 20 })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Menor valor = mais rápido (recomendado: 20ms)
                </p>
              </div>
            </div>
          </div>

          {/* Textos */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <i className="ri-text mr-2"></i>
              Textos da Seção
            </h2>

            <div className="space-y-4">
              {/* Badge */}
              <div>
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Texto do Badge
                </label>
                <input
                  type="text"
                  value={config.badge_text}
                  onChange={(e) => setConfig({ ...config, badge_text: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                  placeholder="Produtos em Destaque"
                />
              </div>

              {/* Título */}
              <div>
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Título Principal
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                  placeholder="Seleção Especial"
                />
              </div>

              {/* Subtítulo */}
              <div>
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                  placeholder="Os Melhores Produtos Para Você"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Descrição
                </label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#b62bff] resize-none`}
                  placeholder="Confira nossa curadoria exclusiva..."
                />
              </div>

              {/* Botão */}
              <div>
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Texto do Botão
                </label>
                <input
                  type="text"
                  value={config.button_text}
                  onChange={(e) => setConfig({ ...config, button_text: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                  placeholder="Ver Todos os Produtos"
                />
              </div>
            </div>
          </div>

          {/* Wallpaper */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <i className="ri-image-line mr-2"></i>
              Imagem de Fundo (Wallpaper)
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  URL da Imagem
                </label>
                <input
                  type="text"
                  value={config.wallpaper_url}
                  onChange={(e) => setConfig({ ...config, wallpaper_url: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                  placeholder="https://..."
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Recomendado: 1920x800px, formato landscape
                </p>
              </div>

              {/* Preview */}
              {config.wallpaper_url && (
                <div className="rounded-xl overflow-hidden border-2 border-[#b62bff]/30">
                  <img
                    src={config.wallpaper_url}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="px-8 py-4 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-3"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  A guardar...
                </>
              ) : (
                <>
                  <i className="ri-save-line text-xl"></i>
                  Guardar Configurações
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Produtos - SUPER PROFISSIONAL COM PAGINAÇÃO */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col`}>
            {/* Header do Modal */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-[#b62bff]/10 to-[#ff6a00]/10">
              <div>
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  🛍️ Selecionar Produtos
                </h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Escolha produtos para adicionar aos destaques • {filteredProducts.length} produtos disponíveis
                </p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center transition-colors cursor-pointer`}
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Barra de Pesquisa */}
            <div className="p-6 border-b border-gray-800">
              <div className="relative">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Pesquisar por nome, descrição ou SKU..."
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                />
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {filteredProducts.length} produto(s) encontrado(s)
                </p>
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {featuredProducts.length}/{config.max_products} em destaque
                </p>
              </div>
            </div>

            {/* Lista de Produtos com Paginação */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentProducts.length === 0 ? (
                <div className="text-center py-16">
                  <i className="ri-inbox-line text-6xl text-gray-400 mb-4"></i>
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Nenhum produto encontrado
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentProducts.map((product) => {
                    const isInFeatured = product.featured;
                    
                    return (
                      <div
                        key={product.id}
                        className={`p-4 rounded-xl border ${
                          isInFeatured
                            ? darkMode 
                              ? 'bg-amber-500/10 border-amber-500/50' 
                              : 'bg-amber-50 border-amber-300'
                            : darkMode 
                              ? 'bg-gray-800 border-gray-700 hover:border-[#b62bff]' 
                              : 'bg-gray-50 border-gray-200 hover:border-[#b62bff]'
                        } transition-all duration-300 hover:shadow-lg group`}
                      >
                        <div className="flex flex-col h-full">
                          {/* Imagem do Produto */}
                          <div className="relative mb-3 overflow-hidden rounded-lg">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://readdy.ai/api/search-image?query=professional%20$%7Bproduct.name%7D%20product&width=400&height=400&seq=modal-${product.id}&orientation=squarish`;
                              }}
                            />
                            {product.stock === 0 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                                  Esgotado
                                </span>
                              </div>
                            )}
                            {isInFeatured && (
                              <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                <i className="ri-star-fill"></i>
                                Em Destaque
                              </div>
                            )}
                          </div>

                          {/* Informações */}
                          <h4 className={`font-bold mb-2 line-clamp-2 min-h-[3rem] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {product.name}
                          </h4>
                          <p className={`text-sm mb-3 line-clamp-2 min-h-[2.5rem] ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {product.description}
                          </p>

                          {/* Preço e Stock */}
                          <div className="flex items-center justify-between mb-3 mt-auto">
                            <span className="text-xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
                              €{product.price.toFixed(2)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              product.stock > 10
                                ? 'bg-green-500/20 text-green-500'
                                : product.stock > 0
                                  ? 'bg-amber-500/20 text-amber-500'
                                  : 'bg-red-500/20 text-red-500'
                            }`}>
                              {product.stock > 0 ? `Stock: ${product.stock}` : 'Esgotado'}
                            </span>
                          </div>

                          {/* SKU */}
                          {product.sku && (
                            <p className={`text-xs mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              SKU: {product.sku}
                            </p>
                          )}

                          {/* Botão Adicionar/Remover */}
                          <button
                            onClick={() => toggleFeatured(product.id)}
                            disabled={!isInFeatured && featuredProducts.length >= config.max_products}
                            className={`w-full px-4 py-2.5 ${
                              isInFeatured
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00]'
                            } text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                              (!isInFeatured && featuredProducts.length >= config.max_products) ? '' : 'cursor-pointer'
                            }`}
                          >
                            <i className={`${isInFeatured ? 'ri-close-line' : 'ri-add-line'} text-lg`}></i>
                            <span>{isInFeatured ? 'Remover dos Destaques' : 'Adicionar aos Destaques'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className={`p-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  {/* Info */}
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length}
                  </p>

                  {/* Controles de Paginação */}
                  <div className="flex items-center gap-2">
                    {/* Botão Anterior */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                        currentPage === 1
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:scale-105'
                      } ${
                        darkMode
                          ? 'bg-gray-800 text-white hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <i className="ri-arrow-left-s-line"></i>
                      Anterior
                    </button>

                    {/* Números de Página */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => (
                        typeof page === 'number' ? (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white shadow-lg scale-110'
                                : darkMode
                                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } cursor-pointer`}
                          >
                            {page}
                          </button>
                        ) : (
                          <span key={index} className={`w-10 h-10 flex items-center justify-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {page}
                          </span>
                        )
                      ))}
                    </div>

                    {/* Botão Próximo */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                        currentPage === totalPages
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:scale-105'
                      } ${
                        darkMode
                          ? 'bg-gray-800 text-white hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      Próximo
                      <i className="ri-arrow-right-s-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
