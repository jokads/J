import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { supabase, Product } from '../../lib/supabase';

// Normalizar categorias para correspondência - MOVIDO PARA FORA DO COMPONENTE
const normalizeCategory = (category: string): string => {
  const normalized = category.toLowerCase().trim();
  
  // Mapeamento de categorias
  const categoryMap: Record<string, string> = {
    'gpu': 'GPU',
    'placa de vídeo': 'GPU',
    'placas de vídeo': 'GPU',
    'placa-de-vídeo': 'GPU',
    'cpu': 'CPU',
    'processador': 'CPU',
    'ram': 'RAM',
    'memória ram': 'RAM',
    'memoria ram': 'RAM',
    'ssd': 'SSD',
    'armazenamento': 'SSD',
    'storage': 'SSD',
    'placa-mãe': 'Placa-Mãe',
    'placa-mae': 'Placa-Mãe',
    'motherboard': 'Placa-Mãe',
    'fonte': 'Fonte',
    'psu': 'Fonte',
    'power supply': 'Fonte',
    'cabos': 'Cabos',
    'cabo': 'Cabos',
    'adaptador': 'Cabos',
    'adaptadores': 'Cabos',
    'torre': 'Torre',
    'torres': 'Torre',
    'gabinete': 'Torre',
    'case': 'Torre',
    'refrigeração': 'Ventilador',
    'refrigeracao': 'Ventilador',
    'cooler': 'Ventilador',
    'cooling': 'Ventilador',
    'ventilador': 'Ventilador',
    'ventiladores': 'Ventilador',
    'monitor': 'Monitor',
    'fone': 'Fone',
    'fones': 'Fone',
    'fones de ouvido': 'Fone',
    'headset': 'Fone',
    'headphone': 'Fone',
    'microfone': 'Microfone',
    'micro': 'Microfone',
    'mic': 'Microfone',
    'tapete': 'Tapete',
    'tapetes': 'Tapete',
    'mousepad': 'Tapete',
    'suporte': 'Suporte',
    'stand': 'Suporte',
    'periférico': 'Periférico',
    'periferico': 'Periférico',
    'periféricos': 'Periférico',
    'perifericos': 'Periférico',
    'portátil': 'PC Portátil',
    'portatil': 'PC Portátil',
    'laptop': 'PC Portátil',
    'pc portátil': 'PC Portátil',
    'pc portatil': 'PC Portátil',
    'pc completo': 'PC Completo',
    'kit completo': 'PC Completo',
  };

  return categoryMap[normalized] || category;
};

export default function ProdutosPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 15;

  // 🔥 Estados para favoritos
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  
  // 🔥 Estado para email do usuário
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // 🔥 Detectar tamanho da tela
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      
      // 🔥 NOVO: No desktop em janela cheia (>= 1280px), filtros começam abertos
      // Em janelas menores ou mobile, começam fechados
      if (width >= 1280) {
        setShowFilters(true);
      } else {
        setShowFilters(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🔥 Categorias padronizadas e organizadas
  const categories = [
    'Todos',
    'CPU',
    'GPU',
    'RAM',
    'SSD',
    'Placa-Mãe',
    'Fonte',
    'Torre',
    'PC Completo',
    'PC Portátil',
    'Monitor',
    'Ventilador',
    'Fone',
    'Microfone',
    'Periférico',
    'Tapete',
    'Suporte',
    'Cabos'
  ];

  const brands = [
    'Todas',
    'NVIDIA',
    'AMD',
    'Intel',
    'Corsair',
    'Samsung',
    'ASUS',
    'MSI',
    'Logitech',
    'G.Skill',
    'Western Digital',
    'Crucial',
    'Kingston',
    'Seagate',
    'Gigabyte',
    'ASRock',
    'be quiet!',
    'Seasonic',
    'CableMod',
    'LG',
    'NZXT',
    'Cooler Master',
    'Thermaltake',
    'HyperX',
    'SteelSeries',
    'Razer',
    'Sony',
    'Shure',
    'Blue',
    'Elgato',
    'Rode',
    'Audio-Technica',
    'Anker',
    'StarTech',
    'CalDigit'
  ];

  // 🔥 FUNÇÃO PARA CARREGAR PRODUTOS DO SUPABASE
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filtrar produtos oficiais (não marketplace)
      const officialProducts = (data || []).filter(
        (p: any) => !p.is_marketplace && !p.seller_email
      );
      
      setProducts(officialProducts);
      setFilteredProducts(officialProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
    fetchProducts();
    updateCounts();
    
    // 🔥 Listener para mudanças no carrinho e favoritos
    const handleStorageChange = () => {
      updateCounts();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 🔥 Verificar usuário logado
  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      } else {
        const localEmail = localStorage.getItem('userEmail');
        if (localEmail) {
          setUserEmail(localEmail);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
    }
  };

  // 🔥 Atualizar contadores
  const updateCounts = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      
      // Pegar email do usuário atual
      const currentUserEmail = localStorage.getItem('userEmail');
      
      // Filtrar por usuário se estiver logado
      const userFavorites = currentUserEmail ? favorites.filter((item: any) => !item.userEmail || item.userEmail === currentUserEmail) : favorites;
      
      setFavoritesCount(userFavorites.length > 5 ? 5 : userFavorites.length);
      setFavoriteIds(userFavorites.map((item: any) => item.id));
    } catch (error) {
      console.error('Erro ao atualizar contadores:', error);
    }
  };

  useEffect(() => {
    filterProducts();
    setCurrentPage(1);
  }, [products, selectedCategory, selectedBrand, priceRange, sortBy, searchQuery]);

  // Scroll para o topo ao mudar de página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const filterProducts = () => {
    let filtered = [...products];

    // Filtro de categoria
    if (selectedCategory !== 'Todos') {
      const normalizedSelected = normalizeCategory(selectedCategory);
      filtered = filtered.filter((p) => {
        const normalizedProduct = normalizeCategory(p.category);
        return normalizedProduct === normalizedSelected;
      });
    }

    // Filtro de marca
    if (selectedBrand !== 'Todas') {
      filtered = filtered.filter((p) => p.brand === selectedBrand);
    }

    // Filtro de preço
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Busca
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Ordenação
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSelectedCategory('Todos');
    setSelectedBrand('Todas');
    setPriceRange([0, 5000]);
    setSearchQuery('');
    setSortBy('featured');
  };

  // Contar produtos por categoria
  const getCategoryCount = (category: string) => {
    if (category === 'Todos') return products.length;
    
    const normalizedCategory = normalizeCategory(category);
    return products.filter((p) => normalizeCategory(p.category) === normalizedCategory).length;
  };

  // Paginação
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product: Product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find((item: any) => item.id === product.id && (!item.userEmail || item.userEmail === userEmail));

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1, userEmail: userEmail });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      updateCounts();
      
      showNotification('✓ Adicionado ao carrinho!', 'success');
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      showNotification('❌ Erro ao adicionar ao carrinho', 'error');
    }
  };

  const addToFavorites = (product: Product) => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      
      const existingIndex = favorites.findIndex((item: any) => 
        item.id === product.id && (!item.userEmail || item.userEmail === userEmail)
      );
      
      if (existingIndex >= 0) {
        favorites.splice(existingIndex, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        window.dispatchEvent(new Event('storage'));
        updateCounts();
        showNotification('💔 Removido dos favoritos', 'info');
      } else {
        favorites.push({ ...product, userEmail: userEmail });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        window.dispatchEvent(new Event('storage'));
        updateCounts();
        showNotification('❤️ Adicionado aos favoritos!', 'success');
      }
    } catch (error) {
      console.error('Erro ao gerenciar favoritos:', error);
      showNotification('❌ Erro ao gerenciar favoritos', 'error');
    }
  };

  const isFavorite = (productId: string) => {
    return favoriteIds.includes(productId);
  };

  // 🔥 Sistema de notificações
  const [notification, setNotification] = useState<{message: string, type: string} | null>(null);
  
  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const buyNow = (product: Product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find((item: any) => item.id === product.id && (!item.userEmail || item.userEmail === userEmail));

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1, userEmail: userEmail });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      navigate('/checkout');
    } catch (error) {
      console.error('Erro ao comprar agora:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      {/* 🔥 Notificação Toast */}
      {notification && (
        <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold animate-bounce ${
          notification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
          notification.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
          'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <i className={`text-xl ${
              notification.type === 'success' ? 'ri-checkbox-circle-fill' :
              notification.type === 'error' ? 'ri-error-warning-fill' :
              'ri-information-fill'
            }`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="pt-16">
        {/* 🔥 HEADER MELHORADO COM IMAGEM DE FUNDO */}
        <div className="relative bg-black py-20 md:py-28 overflow-hidden">
          {/* Imagem de fundo com overlay escuro */}
          <div className="absolute inset-0">
            <img 
              src="https://readdy.ai/api/search-image?query=modern%20gaming%20computer%20setup%20with%20rgb%20lights%20dark%20background%20professional%20tech%20store%20atmosphere%20high%20quality%20minimalist%20design%20black%20and%20red%20color%20scheme%20futuristic%20technology%20workspace&width=1920&height=600&seq=produtos-header-bg-v3&orientation=landscape"
              alt="Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/90"></div>
          </div>
          
          {/* Conteúdo do header */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 mb-6 animate-slide-up drop-shadow-2xl">
                TODOS OS PRODUTOS
              </h1>
              
              {/* 🔥 NOVA DESCRIÇÃO ANIMADA */}
              <div className="max-w-4xl mx-auto space-y-4">
                <p className="text-gray-200 text-lg sm:text-xl md:text-2xl font-bold animate-slide-up leading-relaxed" style={{animationDelay: '0.1s'}}>
                  Encontre os melhores componentes e PCs completos para o seu setup perfeito
                </p>
                <p className="text-gray-400 text-base sm:text-lg md:text-xl animate-slide-up leading-relaxed" style={{animationDelay: '0.2s'}}>
                  Produtos de alta qualidade • Garantia estendida • Entrega rápida em toda a Europa
                </p>
                
                {/* 🔥 BADGES INFORMATIVOS ANIMADOS */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6 animate-slide-up" style={{animationDelay: '0.3s'}}>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 border-red-500/40 hover:border-red-500 hover:scale-105 transition-all">
                    <i className="ri-shield-check-line text-red-400 text-lg sm:text-xl"></i>
                    <span className="font-bold text-white text-sm sm:text-base">Garantia Estendida</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 border-green-500/40 hover:border-green-500 hover:scale-105 transition-all">
                    <i className="ri-truck-line text-green-400 text-lg sm:text-xl"></i>
                    <span className="font-bold text-white text-sm sm:text-base">Envio Grátis €100+</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 border-blue-500/40 hover:border-blue-500 hover:scale-105 transition-all">
                    <i className="ri-customer-service-2-line text-blue-400 text-lg sm:text-xl"></i>
                    <span className="font-bold text-white text-sm sm:text-base">Suporte 24/7</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 border-purple-500/40 hover:border-purple-500 hover:scale-105 transition-all">
                    <i className="ri-secure-payment-line text-purple-400 text-lg sm:text-xl"></i>
                    <span className="font-bold text-white text-sm sm:text-base">Pagamento Seguro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 md:mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            {/* 🔥 SIDEBAR RESPONSIVA COM SCROLL COMPLETO */}
            <div className="lg:col-span-1">
              {/* 🔥 Botão de Toggle - Sempre visível */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full mb-4 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-black rounded-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer whitespace-nowrap flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <i className="ri-filter-3-fill text-2xl"></i>
                  <span className="text-lg">FILTROS</span>
                </div>
                <i className={`ri-arrow-${showFilters ? 'up' : 'down'}-s-fill text-2xl transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}></i>
              </button>

              {/* 🔥 FILTROS COM SCROLL COMPLETO */}
              {showFilters && (
                <div className="lg:sticky lg:top-24 animate-fade-in">
                  {/* 🔥 CONTAINER COM SCROLL GERAL */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border-2 border-red-500/20 overflow-hidden">
                    {/* 🔥 ÁREA COM SCROLL */}
                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar-main p-6 space-y-6">
                      
                      {/* Search */}
                      <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-gray-100 hover:border-red-400 transition-all">
                        <label className="block text-sm font-black text-gray-800 mb-3 flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                            <i className="ri-search-line text-white"></i>
                          </div>
                          <span>BUSCAR PRODUTO</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Digite o nome do produto..."
                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 text-sm transition-all font-medium"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center justify-center"
                            >
                              <i className="ri-close-line text-lg"></i>
                            </button>
                          )}
                          {!searchQuery && (
                            <i className="ri-search-line absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                          )}
                        </div>
                      </div>

                      {/* 🔥 CATEGORIAS COM SCROLL INTERNO */}
                      <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-gray-100 hover:border-red-400 transition-all">
                        <label className="block text-sm font-black text-gray-800 mb-3 flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                            <i className="ri-folder-line text-white"></i>
                          </div>
                          <span>CATEGORIAS</span>
                        </label>
                        {/* 🔥 SCROLL INTERNO NAS CATEGORIAS */}
                        <div className="max-h-80 overflow-y-auto custom-scrollbar-categories pr-2 space-y-2">
                          {categories.map((cat) => {
                            const isSelected = selectedCategory === cat;
                            
                            return (
                              <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer text-sm flex items-center justify-between group font-bold ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105 border-2 border-red-400'
                                    : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-red-50 hover:to-red-100 hover:scale-102 border-2 border-gray-200 hover:border-red-300 hover:shadow-xl hover:scale-105'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <i className={`ri-checkbox-blank-circle-fill text-xs ${isSelected ? 'text-white' : 'text-red-500'}`}></i>
                                  <span>{cat}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Brand Filter */}
                      <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-gray-100 hover:border-red-400 transition-all">
                        <label className="block text-sm font-black text-gray-800 mb-3 flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                            <i className="ri-price-tag-3-line text-white"></i>
                          </div>
                          <span>MARCA</span>
                        </label>
                        <select
                          value={selectedBrand}
                          onChange={(e) => setSelectedBrand(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 text-sm cursor-pointer transition-all font-bold bg-gradient-to-r from-gray-50 to-gray-100 hover:from-red-50 hover:to-red-100"
                        >
                          {brands.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Price Range */}
                      <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-gray-100 hover:border-red-400 transition-all">
                        <label className="block text-sm font-black text-gray-800 mb-3 flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                            <i className="ri-money-euro-circle-line text-white"></i>
                          </div>
                          <span>FAIXA DE PREÇO</span>
                        </label>
                        <div className="space-y-4">
                          <input
                            type="range"
                            min="0"
                            max="5000"
                            step="50"
                            value={priceRange[1]}
                            onChange={(e) =>
                              setPriceRange([priceRange[0], parseInt(e.target.value)])
                            }
                            className="w-full h-3 accent-red-500 cursor-pointer rounded-full"
                            style={{
                              background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(priceRange[1] / 5000) * 100}%, #e5e7eb ${(priceRange[1] / 5000) * 100}%, #e5e7eb 100%)`
                            }}
                          />
                          <div className="flex justify-between items-center gap-3">
                            <div className="flex-1 text-center">
                              <span className="text-xs text-gray-500 font-bold block mb-1">Mínimo</span>
                              <span className="text-lg font-black text-gray-700 bg-gray-100 px-4 py-2 rounded-lg border-2 border-gray-200 block">
                                €{priceRange[0]}
                              </span>
                            </div>
                            <i className="ri-arrow-right-line text-red-500 text-xl"></i>
                            <div className="flex-1 text-center">
                              <span className="text-xs text-gray-500 font-bold block mb-1">Máximo</span>
                              <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 bg-red-100 px-4 py-2 rounded-lg border-2 border-red-300 block">
                                €{priceRange[1]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Clear Filters */}
                      <button
                        onClick={clearFilters}
                        className="w-full px-6 py-4 bg-gradient-to-r from-gray-800 to-black text-white font-black rounded-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center space-x-2 shadow-lg"
                      >
                        <i className="ri-refresh-line text-xl"></i>
                        <span>Limpar Filtros</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Sort */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-gradient-to-r from-white to-gray-50 p-5 rounded-2xl shadow-lg border-2 border-red-500/20">
                <div className="flex items-center space-x-2">
                  <i className="ri-list-check text-red-500 text-2xl"></i>
                  {searchQuery ? (
                    <p className="text-gray-700 font-bold text-sm sm:text-base">
                      Mostrando <strong className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">{indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)}</strong> de <strong className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">{filteredProducts.length}</strong> produtos encontrados
                    </p>
                  ) : (
                    <p className="text-gray-700 font-bold text-sm sm:text-base">
                      Explore nossa coleção completa de produtos
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <i className="ri-sort-desc text-red-500 text-xl"></i>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 sm:flex-none px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 text-sm cursor-pointer transition-all font-bold bg-white hover:bg-red-50"
                  >
                    <option value="featured">⭐ Destaques</option>
                    <option value="price-asc">💰 Menor Preço</option>
                    <option value="price-desc">💎 Maior Preço</option>
                    <option value="rating">⭐ Melhor Avaliação</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block w-20 h-20 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                  <p className="text-gray-600 text-xl font-black">Carregando produtos...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-gray-200">
                  <i className="ri-search-line text-9xl text-gray-300 mb-6"></i>
                  <p className="text-gray-600 text-3xl font-black mb-2">Nenhum produto encontrado</p>
                  <p className="text-gray-500 text-lg mb-6 font-medium">
                    Tente ajustar os filtros ou fazer uma nova busca
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-black rounded-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Limpar Filtros
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" data-product-shop>
                    {currentProducts.map((product) => (
                      <div key={product.id} className="group relative">
                        <div className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-red-400 hover:scale-105">
                          {/* Badges */}
                          <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
                            {product.featured && (
                              <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black rounded-full shadow-xl animate-pulse border-2 border-white">
                                ⭐ DESTAQUE
                              </div>
                            )}
                            {product.stock < 5 && product.stock > 0 && (
                              <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black rounded-full shadow-xl border-2 border-white">
                                🔥 ÚLTIMAS {product.stock}
                              </div>
                            )}
                          </div>

                          {/* Botão Favorito */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              addToFavorites(product);
                            }}
                            className={`absolute top-3 right-3 z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all border-2 ${
                              isFavorite(product.id)
                                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white scale-110 border-white'
                                : 'bg-white text-gray-400 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:text-white border-gray-200'
                            }`}
                          >
                            <i className={`text-2xl ${isFavorite(product.id) ? 'ri-heart-fill' : 'ri-heart-line'}`}></i>
                          </button>

                          <Link to={`/produto/${product.id}`} className="block">
                            <div className="relative w-full h-56 sm:h-64 md:h-72 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-red-50 group-hover:to-red-100 transition-all">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                              />
                              {product.stock === 0 && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                                  <span className="text-white font-black text-xl bg-red-500 px-6 py-3 rounded-full">ESGOTADO</span>
                                </div>
                              )}
                            </div>
                          </Link>

                          <div className="p-5">
                            <p className="text-xs text-red-600 font-black mb-2 uppercase tracking-wider">{product.brand}</p>
                            <Link to={`/produto/${product.id}`}>
                              <h3 className="text-gray-800 font-black mb-3 group-hover:text-red-600 transition-colors line-clamp-2 cursor-pointer text-base leading-tight">
                                {product.name}
                              </h3>
                            </Link>
                            
                            {/* Rating */}
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`ri-star-${i < Math.floor(product.rating) ? 'fill' : 'line'} text-red-500 text-base`}
                                  ></i>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 font-bold">
                                ({product.reviews_count})
                              </span>
                            </div>
                            
                            {/* Price */}
                            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 mb-4">
                              €{product.price.toFixed(2)}
                            </p>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                              <button
                                onClick={() => buyNow(product)}
                                disabled={product.stock === 0}
                                className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-black rounded-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm flex items-center justify-center space-x-2"
                              >
                                <i className="ri-shopping-bag-3-fill text-lg"></i>
                                <span>COMPRAR JÁ</span>
                              </button>
                              
                              <button
                                onClick={() => addToCart(product)}
                                disabled={product.stock === 0}
                                className="w-full px-4 py-3 bg-gradient-to-r from-gray-800 to-black text-white font-black rounded-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm flex items-center justify-center space-x-2"
                              >
                                <i className="ri-shopping-cart-fill text-lg"></i>
                                <span>ADICIONAR AO CARRINHO</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-12">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-12 h-12 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl hover:shadow-2xl hover:scale-110 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-lg font-black"
                        title="Página anterior"
                      >
                        <i className="ri-arrow-left-s-line text-2xl"></i>
                      </button>

                      <div className="flex gap-2 overflow-x-auto max-w-xs sm:max-w-none">
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          const isCurrentPage = currentPage === pageNumber;
                          
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => paginate(pageNumber)}
                                className={`w-12 h-12 rounded-xl font-black transition-all cursor-pointer shadow-lg hover:shadow-2xl text-base ${
                                  isCurrentPage
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white scale-110 border-2 border-red-400'
                                    : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 border-2 border-gray-200 hover:border-red-300 hover:scale-105'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          } else if (
                            pageNumber === currentPage - 2 ||
                            pageNumber === currentPage + 2
                          ) {
                            return (
                              <span key={pageNumber} className="w-12 h-12 flex items-center justify-center text-gray-400 font-black text-base">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-12 h-12 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl hover:shadow-2xl hover:scale-110 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-lg font-black"
                        title="Próxima página"
                      >
                        <i className="ri-arrow-right-s-line text-2xl"></i>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* 🔥 CSS para scrollbars customizadas */}
      <style>{`
        /* 🔥 SCROLLBAR PRINCIPAL (Container geral dos filtros) */
        .custom-scrollbar-main::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar-main::-webkit-scrollbar-track {
          background: linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 10px;
          margin: 8px 0;
        }
        .custom-scrollbar-main::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
          border-radius: 10px;
          border: 2px solid #f3f4f6;
          transition: all 0.3s;
        }
        .custom-scrollbar-main::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%);
          border-color: #e5e7eb;
        }
        
        /* 🔥 SCROLLBAR DAS CATEGORIAS (Scroll interno) */
        .custom-scrollbar-categories::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-categories::-webkit-scrollbar-track {
          background: linear-gradient(180deg, #fee2e2 0%, #fecaca 100%);
          border-radius: 10px;
          margin: 4px 0;
        }
        .custom-scrollbar-categories::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #f87171 0%, #ef4444 100%);
          border-radius: 10px;
          border: 2px solid #fee2e2;
          transition: all 0.3s;
        }
        .custom-scrollbar-categories::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
          border-color: #fecaca;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        }
        
        /* Firefox */
        .custom-scrollbar-main {
          scrollbar-width: thin;
          scrollbar-color: #ef4444 #f3f4f6;
        }
        
        .custom-scrollbar-categories {
          scrollbar-width: thin;
          scrollbar-color: #f87171 #fee2e2;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
