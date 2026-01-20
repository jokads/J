import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { mockServices } from '../../mocks/services';

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  image?: string;
  icon?: string;
  active: boolean;
  category: string;
  delivery_time?: string;
  features?: string[];
  created_at: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
}

interface HeroConfig {
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  stats: Array<{ icon: string; value: string; label: string }>;
  buttons: Array<{ text: string; icon: string; link: string; type: string }>;
}

interface FilterOption {
  value: string;
  label: string;
  icon: string;
  display_order: number;
}

export default function ServicesPage() {
  const { darkMode } = useTheme();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [deliveryTime, setDeliveryTime] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 12;
  
  // Novos estados para configurações do banco
  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(null);
  const [filterCategories, setFilterCategories] = useState<FilterOption[]>([]);
  const [filterPrices, setFilterPrices] = useState<FilterOption[]>([]);
  const [filterDeliveries, setFilterDeliveries] = useState<FilterOption[]>([]);

  useEffect(() => {
    loadPageConfig();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        console.log('📦 Carregando 20 serviços profissionais do mock data...');
        loadMockServices();
      } else {
        // Mapear dados do Supabase para formato correto
        const servicesWithImages = data.map(service => ({
          ...service,
          title: service.name || service.title, // ✅ CORREÇÃO: name → title
          features: Array.isArray(service.features) 
            ? service.features 
            : (typeof service.features === 'string' ? JSON.parse(service.features) : []),
          image: service.images?.[0] || service.image,
        })) as Service[];

        setServices(servicesWithImages);
        console.log('✅ Carregados', servicesWithImages.length, 'serviços do Supabase');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar serviços:', error);
      loadMockServices();
    } finally {
      setLoading(false);
    }
  };

  const loadMockServices = () => {
    // Mapear mock services para o formato correto
    const mappedServices = mockServices.map(service => ({
      id: service.id,
      title: service.name, // ✅ CORREÇÃO: Usar name como title
      slug: service.slug,
      description: service.description,
      price: service.price,
      image: service.images?.[0] || '',
      icon: 'ri-service-line',
      active: service.status === 'active',
      category: service.category,
      delivery_time: service.delivery_time,
      features: service.features,
      created_at: new Date().toISOString()
    }));
    
    setServices(mappedServices);
    console.log('✅ Carregados', mappedServices.length, 'serviços profissionais do mock data');
  };

  const loadPageConfig = async () => {
    try {
      // Carregar configuração do Hero Section
      const { data: heroData, error: heroError } = await supabase
        .from('services_page_config')
        .select('*')
        .eq('section_type', 'hero')
        .eq('is_active', true)
        .single();

      if (!heroError && heroData) {
        setHeroConfig({
          title: heroData.title,
          subtitle: heroData.subtitle,
          description: heroData.description,
          image_url: heroData.image_url,
          stats: heroData.metadata?.stats || [],
          buttons: heroData.metadata?.buttons || []
        });
      }

      // Carregar categorias de filtro
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('services_page_config')
        .select('*')
        .eq('section_type', 'filter_category')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!categoriesError && categoriesData) {
        setFilterCategories(categoriesData.map(item => ({
          value: item.value,
          label: item.label,
          icon: item.icon,
          display_order: item.display_order
        })));
      }

      // Carregar faixas de preço
      const { data: pricesData, error: pricesError } = await supabase
        .from('services_page_config')
        .select('*')
        .eq('section_type', 'filter_price')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!pricesError && pricesData) {
        setFilterPrices(pricesData.map(item => ({
          value: item.value,
          label: item.label,
          icon: item.icon,
          display_order: item.display_order
        })));
      }

      // Carregar prazos de entrega
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('services_page_config')
        .select('*')
        .eq('section_type', 'filter_delivery')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!deliveriesError && deliveriesData) {
        setFilterDeliveries(deliveriesData.map(item => ({
          value: item.value,
          label: item.label,
          icon: item.icon,
          display_order: item.display_order
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações da página:', error);
    }
  };

  const getCategoryName = (slug: string): string => {
    const names: { [key: string]: string } = {
      'web-development': 'Desenvolvimento Web',
      'ecommerce': 'E-commerce',
      'business-tools': 'Ferramentas de Negócio',
      'automation': 'Automação',
      'optimization': 'Otimização',
      'consulting': 'Consultoria',
      'design': 'Design',
      'marketing': 'Marketing Digital',
      'mobile': 'Aplicativos Mobile',
      'repair': 'Reparações',
      'software': 'Software'
    };
    return names[slug] || slug;
  };

  const getCategoryIcon = (slug: string): string => {
    const icons: { [key: string]: string } = {
      'web-development': 'ri-code-box-line',
      'ecommerce': 'ri-shopping-cart-line',
      'business-tools': 'ri-dashboard-line',
      'automation': 'ri-robot-line',
      'optimization': 'ri-rocket-line',
      'consulting': 'ri-user-star-line',
      'design': 'ri-palette-line',
      'marketing': 'ri-megaphone-line',
      'mobile': 'ri-smartphone-line',
      'repair': 'ri-tools-line',
      'software': 'ri-window-line'
    };
    return icons[slug] || 'ri-service-line';
  };

  // Filtros inteligentes
  const filteredServices = services.filter(service => {
    // Filtro de categoria
    if (selectedCategory !== 'all' && service.category !== selectedCategory) {
      return false;
    }

    // Filtro de preço
    if (priceRange !== 'all') {
      const price = service.price || 0;
      const range = priceRange.split('-');
      if (range.length === 2) {
        const min = parseInt(range[0]);
        const max = parseInt(range[1]);
        if (price < min || price > max) return false;
      } else if (priceRange.endsWith('+')) {
        const min = parseInt(priceRange.replace('+', ''));
        if (price < min) return false;
      }
    }

    // Filtro de prazo de entrega
    if (deliveryTime !== 'all' && service.delivery_time) {
      const deliveryStr = service.delivery_time.toLowerCase();
      const daysMatch = deliveryStr.match(/(\d+)/g);
      if (daysMatch) {
        const days = parseInt(daysMatch[0]);
        const range = deliveryTime.split('-');
        if (range.length === 2) {
          const min = parseInt(range[0]);
          const max = parseInt(range[1]);
          if (days < min || days > max) return false;
        } else if (deliveryTime.endsWith('+')) {
          const min = parseInt(deliveryTime.replace('+', ''));
          if (days < min) return false;
        }
      }
    }

    // Filtro de pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = service.title?.toLowerCase().includes(query);
      const matchesDescription = service.description?.toLowerCase().includes(query);
      return matchesTitle || matchesDescription;
    }

    return true;
  });

  // Calcular paginação
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

  // Resetar para página 1 quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, deliveryTime, searchQuery]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setPriceRange('all');
    setDeliveryTime('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Configurações padrão caso não haja no banco
  const defaultHero: HeroConfig = {
    title: 'Serviços Profissionais de Excelência',
    subtitle: 'Transforme Seu Negócio com Soluções Tecnológicas de Ponta',
    description: 'Oferecemos serviços especializados em desenvolvimento, design e consultoria para impulsionar o crescimento da sua empresa.',
    image_url: 'https://readdy.ai/api/search-image?query=abstract%20modern%20technology%20digital%20network%20purple%20orange%20gradient%20professional%20business%20innovation%20futuristic%20geometric%20patterns%20data%20visualization%20cyber%20space%20minimalist%20elegant%20corporate%20background%20high%20tech%20interface%20design%20connectivity%20web%20development%20software%20engineering%20digital%20transformation&width=1920&height=600&seq=services-hero-bg-001&orientation=landscape',
    stats: [
      { icon: 'ri-service-line', value: '50+', label: 'Serviços Disponíveis' },
      { icon: 'ri-trophy-line', value: '500+', label: 'Projetos Concluídos' },
      { icon: 'ri-star-line', value: '98%', label: 'Satisfação' }
    ],
    buttons: [
      { text: 'Enviar Email', icon: 'ri-mail-line', link: 'mailto:jokadamas616@gmail.com', type: 'primary' },
      { text: 'WhatsApp', icon: 'ri-whatsapp-line', link: 'https://wa.me/352621717862', type: 'secondary' }
    ]
  };

  const hero = heroConfig || defaultHero;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section Profissional - 100% EDITÁVEL */}
      <section 
        className="relative bg-gradient-to-br from-gray-900 via-[#1a0a2e] to-black text-white py-24 overflow-hidden"
        style={{
          backgroundImage: hero.image_url ? `url(${hero.image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay escuro para melhor contraste */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>
        
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#b62bff] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#ff6a00] rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            {/* Badge Superior */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <i className="ri-vip-crown-line text-amber-400"></i>
              <span className="text-sm font-medium">Serviços Premium</span>
            </div>

            {/* Título Principal - EDITÁVEL */}
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              {hero.title.split(' ').slice(0, -2).join(' ')}{' '}
              <span className="bg-gradient-to-r from-[#b62bff] via-[#ff6a00] to-amber-400 bg-clip-text text-transparent">
                {hero.title.split(' ').slice(-2).join(' ')}
              </span>
            </h1>

            {/* Subtítulo Elegante - EDITÁVEL */}
            <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {hero.subtitle}
            </p>

            {/* Descrição - EDITÁVEL */}
            <p className="text-base text-gray-400 max-w-3xl mx-auto">
              {hero.description}
            </p>

            {/* Estatísticas - EDITÁVEIS */}
            <div className="flex flex-wrap justify-center gap-8 pt-8">
              {hero.stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <i className={`${stat.icon} text-2xl text-amber-400`}></i>
                    <div className="text-4xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Botões de Contato - EDITÁVEIS */}
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              {hero.buttons.map((button, idx) => (
                <a 
                  key={idx}
                  href={button.link}
                  target={button.link.startsWith('http') ? '_blank' : undefined}
                  rel={button.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 cursor-pointer group whitespace-nowrap ${
                    button.type === 'primary'
                      ? 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20'
                      : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <i className={`${button.icon} text-xl ${button.type === 'primary' ? 'group-hover:text-amber-400 transition-colors' : ''}`}></i>
                  <span className="text-sm font-medium">{button.text}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção Principal: Sidebar + Grid de Serviços */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar de Filtros Inteligente - 100% EDITÁVEL */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-20 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
                {/* Pesquisa */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="ri-search-line text-2xl text-[#b62bff]"></i>
                    <h3 className="text-lg font-bold text-gray-900">Pesquisar</h3>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar serviços..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#b62bff] focus:ring-4 focus:ring-[#b62bff]/10 transition-all outline-none text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Categorias - EDITÁVEIS */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <i className="ri-folder-line text-2xl text-[#b62bff]"></i>
                      <h3 className="text-lg font-bold text-gray-900">Categorias</h3>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {Array.from(new Set(services.map(s => s.category))).length}
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group ${
                        selectedCategory === 'all'
                          ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white shadow-lg scale-105'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <i className={`ri-apps-line text-lg ${
                          selectedCategory === 'all' ? 'text-white' : 'text-[#b62bff]'
                        }`}></i>
                        <span className="font-medium">Todos os Serviços</span>
                      </div>
                      <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                        selectedCategory === 'all'
                          ? 'bg-white/20'
                          : 'bg-gray-200'
                      }`}>
                        {services.length}
                      </span>
                    </button>

                    {Array.from(new Set(services.map(s => s.category))).map((cat) => {
                      const count = services.filter(s => s.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group ${
                            selectedCategory === cat
                              ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white shadow-lg scale-105'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <i className={`${getCategoryIcon(cat)} text-lg ${
                              selectedCategory === cat ? 'text-white' : 'text-[#b62bff]'
                            }`}></i>
                            <span className="font-medium">{getCategoryName(cat)}</span>
                          </div>
                          <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                            selectedCategory === cat
                              ? 'bg-white/20'
                              : 'bg-gray-200'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filtro de Preço - EDITÁVEL */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="ri-money-euro-circle-line text-2xl text-[#b62bff]"></i>
                    <h3 className="text-lg font-bold text-gray-900">Faixa de Preço</h3>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setPriceRange('all')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                        priceRange === 'all'
                          ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <i className="ri-price-tag-3-line text-lg"></i>
                      <span className="font-medium text-sm">Todos os Preços</span>
                    </button>
                    {filterPrices.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setPriceRange(option.value)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                          priceRange === option.value
                            ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white shadow-lg'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <i className={`${option.icon} text-lg`}></i>
                        <span className="font-medium text-sm">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro de Prazo - EDITÁVEL */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="ri-time-line text-2xl text-[#b62bff]"></i>
                    <h3 className="text-lg font-bold text-gray-900">Prazo de Entrega</h3>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setDeliveryTime('all')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                        deliveryTime === 'all'
                          ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <i className="ri-calendar-line text-lg"></i>
                      <span className="font-medium text-sm">Todos os Prazos</span>
                    </button>
                    {filterDeliveries.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDeliveryTime(option.value)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                          deliveryTime === option.value
                            ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white shadow-lg'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <i className={`${option.icon} text-lg`}></i>
                        <span className="font-medium text-sm">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botão Limpar Filtros */}
                {(selectedCategory !== 'all' || priceRange !== 'all' || deliveryTime !== 'all' || searchQuery) && (
                  <button
                    onClick={resetFilters}
                    className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 font-medium shadow-lg whitespace-nowrap"
                  >
                    <i className="ri-refresh-line"></i>
                    Limpar Filtros
                  </button>
                )}
              </div>
            </aside>

            {/* Grid de Serviços */}
            <div className="flex-1">
              {/* Cabeçalho com Contador */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {selectedCategory === 'all' 
                      ? 'Todos os Serviços' 
                      : getCategoryName(selectedCategory)}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {filteredServices.length} {filteredServices.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}
                  </p>
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                      <div className="aspect-video bg-gray-200"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <i className="ri-search-line text-5xl text-gray-400"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum serviço encontrado</h3>
                  <p className="text-gray-600 mb-6">
                    Tente ajustar os filtros ou fazer uma nova pesquisa
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-xl hover:opacity-90 transition-opacity cursor-pointer font-medium shadow-lg whitespace-nowrap"
                  >
                    Limpar Filtros
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {currentServices.map((service) => {
                      const serviceImage = service.image || `https://readdy.ai/api/search-image?query=professional%20modern%20$%7Bservice.title%7D%20service%20illustration%20clean%20elegant%20design%20high%20quality%20detailed%20realistic%20purple%20orange%20gradient%20lighting%20business%20technology&width=600&height=400&seq=serv${service.id}&orientation=landscape`;
                      
                      return (
                        <div
                          key={service.id}
                          className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                        >
                          {/* Imagem do Serviço */}
                          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            <img 
                              src={serviceImage}
                              alt={service.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                            
                            {/* Ícone Flutuante */}
                            {service.icon && (
                              <div className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                                <i className={`${service.icon} text-2xl text-white`}></i>
                              </div>
                            )}

                            {/* Badge de Categoria */}
                            <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white text-xs font-bold rounded-full shadow-lg">
                              {getCategoryName(service.category)}
                            </div>
                          </div>
                          
                          {/* Conteúdo */}
                          <div className="p-6 space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 min-h-[3.5rem]">
                              {service.title}
                            </h3>
                            
                            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed min-h-[4.5rem]">
                              {service.description}
                            </p>

                            {/* Features */}
                            {service.features && service.features.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {service.features.slice(0, 3).map((feature, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                                  >
                                    <i className="ri-check-line text-green-600"></i>
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Preço e Prazo */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">A partir de</p>
                                <p className="text-2xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
                                  {service.price > 0 ? `€${service.price.toFixed(2)}` : 'Sob consulta'}
                                </p>
                              </div>
                              {service.delivery_time && (
                                <div className="text-right">
                                  <p className="text-xs text-gray-500 mb-1">Entrega</p>
                                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    <i className="ri-time-line text-[#b62bff]"></i>
                                    {service.delivery_time}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Botão de Ação */}
                            <Link
                              to={`/services/${service.slug}`}
                              className="block w-full px-6 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white text-center font-semibold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
                            >
                              Ver Detalhes
                              <i className="ri-arrow-right-line ml-2"></i>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                      {/* Botão Anterior */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-[#b62bff] hover:to-[#ff6a00] hover:text-white shadow-md hover:shadow-lg cursor-pointer'
                        }`}
                      >
                        <i className="ri-arrow-left-s-line"></i>
                        Anterior
                      </button>

                      {/* Números de Página */}
                      <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                          // Mostrar apenas algumas páginas (primeira, última, atual e adjacentes)
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg font-semibold transition-all duration-300 cursor-pointer ${
                                  currentPage === pageNum
                                    ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white shadow-lg scale-110'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          } else if (
                            pageNum === currentPage - 2 ||
                            pageNum === currentPage + 2
                          ) {
                            return (
                              <span key={pageNum} className="text-gray-400 px-2">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      {/* Botão Próximo */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-[#b62bff] hover:to-[#ff6a00] hover:text-white shadow-md hover:shadow-lg cursor-pointer'
                        }`}
                      >
                        Próximo
                        <i className="ri-arrow-right-s-line"></i>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Por Que Escolher-Nos */}
      <section className={`py-20 ${darkMode ? 'bg-[#0b0011]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#b62bff]/10 to-[#ff6a00]/10 rounded-full mb-6 border border-[#b62bff]/20">
              <i className="ri-vip-crown-line text-[#b62bff]"></i>
              <span className="text-sm font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
                Diferenciais
              </span>
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Por Que Escolher-Nos?
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Comprometidos com a excelência e inovação em cada projeto
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: 'ri-award-line',
                title: 'Qualidade Premium',
                description: 'Soluções de alta qualidade com padrões internacionais de desenvolvimento',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: 'ri-rocket-line',
                title: 'Entrega Rápida',
                description: 'Processos ágeis e eficientes para resultados no prazo combinado',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: 'ri-customer-service-2-line',
                title: 'Suporte Dedicado',
                description: 'Equipe especializada disponível para atender suas necessidades',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: 'ri-shield-check-line',
                title: 'Garantia Total',
                description: 'Satisfação garantida com suporte contínuo pós-entrega',
                gradient: 'from-orange-500 to-red-500'
              }
            ].map((item, index) => (
              <div
                key={index}
                className={`relative group ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-8 border ${darkMode ? 'border-gray-800' : 'border-gray-200'} hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
              >
                {/* Background Animation */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <div className={`relative w-16 h-16 flex items-center justify-center mb-6 rounded-2xl bg-gradient-to-br ${item.gradient} p-0.5`}>
                  <div className={`w-full h-full flex items-center justify-center rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                    <i className={`${item.icon} text-3xl bg-gradient-to-br ${item.gradient} bg-clip-text text-transparent`}></i>
                  </div>
                </div>

                {/* Content */}
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.title}
                </h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.description}
                </p>

                {/* Decorative Element */}
                <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}></div>
              </div>
            ))}
          </div>

          {/* Imagem Elegante e Animada */}
          <div className="mt-16 relative">
            <div className="relative rounded-3xl overflow-hidden border-4 border-gradient-to-r from-[#b62bff] to-[#ff6a00] shadow-2xl">
              {/* Imagem de fundo abstrata e elegante */}
              <img
                src="https://readdy.ai/api/search-image?query=abstract%20modern%20technology%20background%20with%20purple%20orange%20gradient%20flowing%20lines%20geometric%20shapes%20digital%20innovation%20futuristic%20design%20elegant%20professional%20clean%20minimalist%20high%20quality%20detailed%20no%20people&width=1400&height=600&seq=servicesbannerv2&orientation=landscape"
                alt="Tecnologia e Inovação"
                className="w-full h-96 object-cover"
              />
              
              {/* Overlay com gradiente */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#b62bff]/80 via-transparent to-[#ff6a00]/80"></div>
              
              {/* Conteúdo sobre a imagem */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20">
                    <i className="ri-flashlight-line text-white text-xl"></i>
                    <span className="text-white font-bold text-lg">Inovação & Tecnologia</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Transformando Ideias em Realidade
                  </h3>
                  <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                    Utilizamos as mais modernas tecnologias para criar soluções que impulsionam o seu negócio
                  </p>
                  
                  {/* Estatísticas animadas */}
                  <div className="flex flex-wrap justify-center gap-8">
                    {[
                      { number: '500+', label: 'Projetos Concluídos', icon: 'ri-file-check-line' },
                      { number: '98%', label: 'Satisfação', icon: 'ri-star-line' },
                      { number: '24/7', label: 'Suporte', icon: 'ri-customer-service-line' }
                    ].map((stat, idx) => (
                      <div key={idx} className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <i className={`${stat.icon} text-2xl text-white`}></i>
                          <div className="text-4xl font-bold text-white">{stat.number}</div>
                        </div>
                        <div className="text-sm text-white/80 font-medium">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Elementos decorativos animados */}
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#ff6a00]/20 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-[#1a0a2e] to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#b62bff] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#ff6a00] rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Vamos trabalhar juntos?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Entre em contacto e receba uma proposta personalizada para o seu projeto
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="mailto:jokadamas616@gmail.com"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
            >
              <i className="ri-mail-line mr-2"></i>
              Enviar E-mail
            </a>
            <a 
              href="https://wa.me/352621717862"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
            >
              <i className="ri-whatsapp-line mr-2"></i>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? 'rgba(55, 65, 81, 0.1)' : 'rgba(243, 244, 246, 1)'};
          border-radius: 100px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #b62bff 0%, #ff6a00 100%);
          border-radius: 100px;
          transition: all 0.3s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #9d24d9 0%, #e55f00 100%);
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #b62bff ${darkMode ? 'rgba(55, 65, 81, 0.1)' : 'rgba(243, 244, 246, 1)'};
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }

        .delay-500 {
          animation-delay: 500ms;
        }
      `}</style>
    </div>
  );
}
