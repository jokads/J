import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  category_id: string;
  stock: number;
  slug: string;
  featured?: boolean;
  is_active: boolean;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  icon: string;
  category: string;
  slug: string;
  active: boolean;
  featured?: boolean;
  delivery_time?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  is_active: boolean;
  display_order: number;
  product_count?: number;
}

export default function HomePage() {
  const { darkMode } = useTheme();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(100);
  
  const productsScrollRef = useRef<HTMLDivElement>(null);
  const servicesScrollRef = useRef<HTMLDivElement>(null);
  const productsAutoplayRef = useRef<NodeJS.Timeout | null>(null);
  const servicesAutoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [isProductsHovered, setIsProductsHovered] = useState(false);
  const [isServicesHovered, setIsServicesHovered] = useState(false);

  useEffect(() => {
    fetchData();
    loadFavorites();
    loadSiteSettings();
  }, []);

  // Carregar configurações do site
  const loadSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('topbar_promo_text')
        .single();

      if (!error && data) {
        // Extrair valor de entrega grátis do texto promocional
        const match = data.topbar_promo_text?.match(/€?(\d+)/);
        if (match) {
          setFreeShippingThreshold(parseInt(match[1]));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  // Fetch categories - OTIMIZADO
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(6);

        if (error) throw error;

        // Imagens profissionais específicas para cada categoria
        const categoryImages: Record<string, string> = {
          'Casa e Decoração': 'https://readdy.ai/api/search-image?query=modern%20home%20decor%20furniture%20elegant%20living%20room%20interior%20design%20cozy%20sofa%20cushions%20plants%20vases%20decorative%20items%20warm%20lighting%20wooden%20floor%20minimalist%20style%20professional%20product%20photography%20vibrant%20colors%20clean%20background%20no%20people%20high%20quality%20commercial%20display&width=800&height=600&seq=cat-home-v2&orientation=landscape',
          'Ferramentas': 'https://readdy.ai/api/search-image?query=professional%20power%20tools%20drill%20saw%20hammer%20wrench%20screwdriver%20toolbox%20construction%20equipment%20industrial%20metallic%20surfaces%20orange%20black%20colors%20dynamic%20arrangement%20high%20quality%20product%20photography%20clean%20background%20no%20people%20commercial%20display&width=800&height=600&seq=cat-tools-v2&orientation=landscape',
          'Cozinha': 'https://readdy.ai/api/search-image?query=modern%20kitchen%20utensils%20cookware%20pots%20pans%20chef%20knife%20cutting%20board%20stainless%20steel%20appliances%20elegant%20arrangement%20vibrant%20colors%20professional%20culinary%20photography%20clean%20background%20no%20people%20high%20quality%20commercial%20display&width=800&height=600&seq=cat-kitchen-v2&orientation=landscape',
          'Escritório': 'https://readdy.ai/api/search-image?query=modern%20office%20supplies%20desk%20accessories%20laptop%20notebook%20pen%20organizer%20business%20workspace%20professional%20arrangement%20clean%20minimalist%20style%20vibrant%20colors%20high%20quality%20product%20photography%20white%20background%20no%20people%20commercial%20display&width=800&height=600&seq=cat-office-v2&orientation=landscape',
          'Segurança': 'https://readdy.ai/api/search-image?query=security%20equipment%20surveillance%20camera%20alarm%20system%20lock%20padlock%20safety%20gear%20professional%20arrangement%20metallic%20surfaces%20blue%20gray%20colors%20high%20quality%20product%20photography%20clean%20background%20no%20people%20commercial%20display&width=800&height=600&seq=cat-security-v2&orientation=landscape',
          'Tecnologia': 'https://readdy.ai/api/search-image?query=modern%20technology%20gadgets%20smartphone%20tablet%20laptop%20headphones%20smartwatch%20wireless%20earbuds%20sleek%20design%20futuristic%20arrangement%20vibrant%20colors%20high%20quality%20tech%20product%20photography%20clean%20background%20no%20people%20commercial%20display&width=800&height=600&seq=cat-tech-v2&orientation=landscape',
        };

        const categoriesWithImages = data?.map(cat => ({
          ...cat,
          image: cat.image || categoryImages[cat.name] || `https://readdy.ai/api/search-image?query=professional%20product%20category%20$%7Bcat.name%7D%20items%20elegant%20arrangement%20vibrant%20colors%20high%20quality%20commercial%20photography%20clean%20background%20no%20people&width=800&height=600&seq=cat-${cat.id}-v2&orientation=landscape`
        })) || [];

        setCategories(categoriesWithImages);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Infinite scroll automático para produtos
  useEffect(() => {
    if (featuredProducts.length > 0 && !isProductsHovered) {
      startInfiniteScroll();
    }
    return () => {
      if (productsAutoplayRef.current) {
        clearInterval(productsAutoplayRef.current);
      }
    };
  }, [featuredProducts, isProductsHovered]);

  // Infinite scroll automático para serviços
  useEffect(() => {
    if (services.length > 0 && !isServicesHovered) {
      startServicesInfiniteScroll();
    }
    return () => {
      if (servicesAutoplayRef.current) {
        clearInterval(servicesAutoplayRef.current);
      }
    };
  }, [services, isServicesHovered]);

  const startInfiniteScroll = () => {
    if (productsAutoplayRef.current) {
      clearInterval(productsAutoplayRef.current);
    }
    
    productsAutoplayRef.current = setInterval(() => {
      if (productsScrollRef.current && !isProductsHovered) {
        const container = productsScrollRef.current;
        const scrollAmount = 1;
        container.scrollLeft += scrollAmount;
        
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft = 0;
        }
      }
    }, 20);
  };

  const startServicesInfiniteScroll = () => {
    if (servicesAutoplayRef.current) {
      clearInterval(servicesAutoplayRef.current);
    }
    
    servicesAutoplayRef.current = setInterval(() => {
      if (servicesScrollRef.current && !isServicesHovered) {
        const container = servicesScrollRef.current;
        const scrollAmount = 1;
        container.scrollLeft += scrollAmount;
        
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft = 0;
        }
      }
    }, 20);
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  };

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(Array.from(newFavorites)));
  };

  const fetchData = async () => {
    try {
      // Buscar apenas 5 produtos para destaque (otimização)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (productsError) {
        console.error('Erro ao buscar produtos:', productsError);
      } else {
        const processedProducts = (productsData || []).map(product => ({
          ...product,
          images: product.images && Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : [`https://readdy.ai/api/search-image?query=professional%20$%7Bproduct.name%7D%20product%20photography%20simple%20clean%20white%20background%20high%20quality%20detailed%20studio%20lighting%20commercial%20display&width=600&height=600&seq=prod-${product.id}&orientation=squarish`]
        }));
        setFeaturedProducts(processedProducts);
      }

      // Buscar apenas 5 serviços (otimização)
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (servicesError) {
        console.error('Erro ao buscar serviços:', servicesError);
      } else {
        const processedServices = (servicesData || []).map(service => {
          // Prompts únicos e profissionais para cada tipo de serviço
          const servicePrompts: Record<string, string> = {
            'web-development': 'professional web development coding programming modern website design on computer screens elegant interface clean code vibrant purple orange gradient futuristic technology atmosphere no people high quality digital illustration',
            'ecommerce': 'modern ecommerce online shopping platform interface product catalog shopping cart elegant design vibrant colors purple orange gradient professional business technology no people high quality digital illustration',
            'business-tools': 'professional business dashboard analytics charts graphs data visualization modern interface elegant design purple orange gradient corporate technology atmosphere no people high quality digital illustration',
            'automation': 'business automation workflow integration connected systems digital transformation modern technology purple orange gradient futuristic professional atmosphere no people high quality digital illustration',
            'optimization': 'website performance optimization speed analytics SEO metrics dashboard modern interface purple orange gradient professional technology atmosphere no people high quality digital illustration',
            'consulting': 'professional technical consulting strategy planning business meeting modern office technology solutions purple orange gradient elegant atmosphere no people high quality digital illustration'
          };

          const prompt = servicePrompts[service.category] || 
            `professional ${service.title} digital service modern technology abstract elegant background purple orange gradient business concept no people high quality illustration`;

          return {
            ...service,
            image: service.image || `https://readdy.ai/api/search-image?query=$%7BencodeURIComponent%28prompt%29%7D&width=800&height=600&seq=serv-${service.id}-v2&orientation=landscape`
          };
        });
        setServices(processedServices);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollProducts = (direction: 'prev' | 'next') => {
    if (!productsScrollRef.current) return;
    
    const container = productsScrollRef.current;
    const cardWidth = 320 + 24;
    const scrollAmount = direction === 'next' ? cardWidth * 3 : -cardWidth * 3;
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  const scrollServices = (direction: 'prev' | 'next') => {
    if (!servicesScrollRef.current) return;
    
    const container = servicesScrollRef.current;
    const cardWidth = 380 + 24;
    const scrollAmount = direction === 'next' ? cardWidth * 3 : -cardWidth * 3;
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock > 0) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1
      });
    }
  };

  const getDiscountPercentage = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#b62bff] mx-auto mb-4"></div>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            A carregar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0b0011]' : 'bg-white'}`}>
      {/* Hero Section Moderno e Melhorado */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Imagem de Fundo Premium */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://readdy.ai/api/search-image?query=modern%20luxury%20ecommerce%20shopping%20experience%20with%20elegant%20floating%20products%20premium%20gadgets%20designer%20items%20fashion%20accessories%20sophisticated%20arrangement%20vibrant%20purple%20orange%20gold%20gradient%20professional%20studio%20lighting%20sleek%20minimalist%20aesthetic%20high%20end%20retail%20atmosphere%20no%20people&width=1920&height=1080&seq=hero-premium-v4&orientation=landscape)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50"></div>
        </div>
        
        {/* Elementos Decorativos Animados */}
        <div className="absolute top-20 left-10 w-64 h-64 md:w-96 md:h-96 bg-[#b62bff] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 md:w-96 md:h-96 bg-[#ff6a00] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 md:w-80 md:h-80 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Conteúdo Principal */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
          <div className="max-w-3xl">
            {/* Badge Premium com Animação */}
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500/20 via-[#b62bff]/20 to-[#ff6a00]/20 backdrop-blur-md rounded-full border-2 border-amber-400/30 mb-6 animate-pulse shadow-xl">
              <i className="ri-vip-crown-line text-amber-400 text-lg sm:text-xl"></i>
              <span className="text-sm sm:text-base font-bold text-white">Marketplace Premium de Excelência</span>
              <i className="ri-star-fill text-amber-400 text-sm sm:text-base"></i>
            </div>

            {/* Título Principal Impactante */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
              Sua Loja{' '}
              <span className="block mt-2">
                <span className="bg-gradient-to-r from-amber-400 via-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent drop-shadow-2xl">
                  Completa
                </span>
              </span>
            </h1>

            {/* Subtítulo Atrativo */}
            <p className="text-2xl sm:text-3xl md:text-4xl text-gray-100 mb-4 font-bold">
              Tecnologia, Casa, Moda e Muito Mais
            </p>

            {/* Descrição Envolvente */}
            <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl">
              Descubra milhares de produtos premium com os melhores preços do mercado. Qualidade garantida, entrega rápida e atendimento excepcional.
            </p>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={() => window.REACT_APP_NAVIGATE('/category')}
                className="group px-8 py-4 bg-gradient-to-r from-amber-500 via-[#ff6a00] to-[#b62bff] text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center justify-center gap-3 hover:scale-105"
              >
                <i className="ri-shopping-cart-2-line text-2xl group-hover:animate-bounce"></i>
                <span>Explorar Produtos</span>
                <i className="ri-arrow-right-line text-xl group-hover:translate-x-1 transition-transform"></i>
              </button>
              <button
                onClick={() => window.REACT_APP_NAVIGATE('/services')}
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 cursor-pointer whitespace-nowrap border-2 border-white/30 flex items-center justify-center gap-3 hover:scale-105"
              >
                <i className="ri-service-line text-2xl"></i>
                <span>Nossos Serviços</span>
              </button>
            </div>

            {/* Estatísticas e Badges Melhorados */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Produtos */}
              <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <i className="ri-box-3-line text-2xl text-white"></i>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white mb-1">10.000+</div>
                    <div className="text-sm text-gray-300 font-semibold">Produtos Premium</div>
                  </div>
                </div>
              </div>

              {/* Avaliação 5.0 */}
              <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <i className="ri-star-fill text-2xl text-white"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-3xl font-black text-white">5.0</div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i key={star} className="ri-star-fill text-amber-400 text-sm"></i>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 font-semibold">Avaliação Perfeita</div>
                  </div>
                </div>
              </div>

              {/* Entrega Grátis */}
              <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <i className="ri-truck-line text-2xl text-white"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white mb-1">Grátis</div>
                    <div className="text-xs text-gray-300 font-semibold">Acima de €100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-white/80">
            <span className="text-sm font-semibold">Descubra Mais</span>
            <i className="ri-arrow-down-line text-2xl"></i>
          </div>
        </div>
      </section>

      {/* Badges de Confiança Melhorados */}
      <section className={`py-12 ${darkMode ? 'bg-[#1a0b2e]' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {[
              { 
                icon: 'ri-shield-check-line', 
                title: 'Compra 100% Segura', 
                desc: 'Proteção Total',
                gradient: 'from-blue-500 to-cyan-500'
              },
              { 
                icon: 'ri-truck-line', 
                title: 'Entrega Rápida', 
                desc: 'Em Todo o País',
                gradient: 'from-green-500 to-emerald-500'
              },
              { 
                icon: 'ri-refresh-line', 
                title: 'Devolução Grátis', 
                desc: 'Até 30 Dias',
                gradient: 'from-purple-500 to-pink-500'
              },
              { 
                icon: 'ri-customer-service-2-line', 
                title: 'Suporte 24/7', 
                desc: 'Sempre Online',
                gradient: 'from-amber-500 to-orange-500'
              },
              { 
                icon: 'ri-secure-payment-line', 
                title: 'Pagamento Seguro', 
                desc: 'Múltiplas Opções',
                gradient: 'from-red-500 to-rose-500'
              },
              { 
                icon: 'ri-award-line', 
                title: 'Garantia Premium', 
                desc: '100% Original',
                gradient: 'from-indigo-500 to-violet-500'
              }
            ].map((badge, idx) => (
              <div
                key={idx}
                className={`group relative text-center p-6 rounded-2xl ${
                  darkMode ? 'bg-gray-900/50 backdrop-blur-md' : 'bg-white'
                } shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-transparent hover:border-gray-300 dark:hover:border-gray-700 overflow-hidden`}
              >
                {/* Background Gradient on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-16 h-16 flex items-center justify-center bg-gradient-to-br ${badge.gradient} rounded-2xl mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <i className={`${badge.icon} text-3xl text-white`}></i>
                  </div>
                  <h3 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {badge.title}
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {badge.desc}
                  </p>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO DE CATEGORIAS - RESTAURADA E OTIMIZADA */}
      {categories.length > 0 && (
        <section className={`py-12 sm:py-16 ${darkMode ? 'bg-[#0b0011]' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#b62bff]/10 to-[#ff6a00]/10 rounded-full mb-4 border border-[#b62bff]/20">
                <i className="ri-apps-line text-[#b62bff] text-lg"></i>
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Explore por Categoria
                </span>
              </div>
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Encontre o Que Procura
              </h2>
              <p className={`text-base sm:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto px-4`}>
                Navegue pelas nossas categorias e descubra produtos incríveis
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => window.REACT_APP_NAVIGATE(`/category?category=${category.id}`)}
                  className={`group relative h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${
                    darkMode ? 'bg-gray-900' : 'bg-white'
                  }`}
                >
                  {/* Imagem de Fundo */}
                  <div className="absolute inset-0">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://readdy.ai/api/search-image?query=professional%20$%7Bcategory.name%7D%20category%20products%20elegant%20arrangement%20vibrant%20colors%20high%20quality%20commercial%20photography%20clean%20background%20no%20people&width=800&height=600&seq=cat-fallback-${category.id}&orientation=landscape`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-500"></div>
                  </div>

                  {/* Badge de Contagem */}
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      {category.product_count || 0} produtos
                    </span>
                  </div>

                  {/* Ícone */}
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-gradient-to-br from-[#b62bff] to-[#ff6a00] rounded-full shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <i className={`${category.icon || 'ri-shopping-bag-line'} text-xl sm:text-2xl text-white`}></i>
                  </div>

                  {/* Conteúdo */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 transition-all duration-300 group-hover:translate-x-2">
                      {category.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-200 mb-3 sm:mb-4 line-clamp-2 opacity-90">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-2 text-white font-semibold text-sm transition-all duration-300 group-hover:gap-4">
                      <span>Ver Produtos</span>
                      <i className="ri-arrow-right-line text-lg transition-transform duration-300 group-hover:translate-x-2"></i>
                    </div>
                  </div>

                  {/* Efeito de Brilho no Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Carrossel de Produtos em Destaque - LOOP INFINITO RESPONSIVO */}
      {featuredProducts.length > 0 && (
        <section className="relative py-12 sm:py-20 overflow-hidden">
          {/* Wallpaper de Fundo Profissional */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(https://readdy.ai/api/search-image?query=modern%20abstract%20ecommerce%20shopping%20background%20with%20floating%20geometric%20shapes%20vibrant%20purple%20orange%20pink%20gradient%20dynamic%20composition%20professional%20lighting%20particles%20glow%20effects%20futuristic%20digital%20marketplace%20atmosphere%20no%20people&width=1920&height=800&seq=featured-products-wallpaper-v1&orientation=landscape)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className={`absolute inset-0 ${
              darkMode 
                ? 'bg-gradient-to-b from-[#1a0b2e]/95 via-[#1a0b2e]/90 to-[#1a0b2e]/95' 
                : 'bg-gradient-to-b from-gray-50/95 via-gray-50/90 to-gray-50/95'
            }`}></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              {/* Badge Animado */}
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] rounded-full mb-4 sm:mb-6 shadow-2xl animate-pulse">
                <i className="ri-fire-fill text-white text-base sm:text-xl"></i>
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Produtos em Destaque
                </span>
                <i className="ri-fire-fill text-white text-base sm:text-xl"></i>
              </div>

              {/* Título Principal com Gradiente Vibrante */}
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-[#b62bff] via-[#ff6a00] to-[#ff0080] bg-clip-text text-transparent drop-shadow-2xl">
                  Seleção Especial
                </span>
              </h2>

              {/* Subtítulo com Efeito */}
              <p className={`text-lg sm:text-xl md:text-2xl font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Os Melhores Produtos Para Você
              </p>
              <p className={`text-sm sm:text-base md:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'} max-w-3xl mx-auto px-4`}>
                Confira nossa curadoria exclusiva de produtos premium com os melhores preços e qualidade garantida
              </p>
            </div>

            <div className="relative group">
              {/* Botão Anterior - ESCONDIDO NO MOBILE */}
              <button
                onClick={() => scrollProducts('prev')}
                className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 lg:w-16 lg:h-16 rounded-full ${
                  darkMode ? 'bg-gray-900/95 hover:bg-gray-800' : 'bg-white/95 hover:bg-gray-50'
                } shadow-2xl items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-8 group-hover:translate-x-0 cursor-pointer backdrop-blur-md border-2 border-[#b62bff]/50 hover:border-[#b62bff] hover:scale-110`}
                aria-label="Anterior"
              >
                <i className={`ri-arrow-left-s-line text-3xl lg:text-4xl ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              </button>

              {/* Container do Carrossel - LOOP INFINITO */}
              <div
                ref={productsScrollRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-2 sm:px-0"
                onMouseEnter={() => setIsProductsHovered(true)}
                onMouseLeave={() => setIsProductsHovered(false)}
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {/* Duplicar produtos para loop infinito */}
                {[...featuredProducts, ...featuredProducts, ...featuredProducts].map((product, index) => {
                  const discount = getDiscountPercentage(product.price, product.compare_at_price);
                  const isFavorite = favorites.has(product.id);
                  
                  return (
                    <div
                      key={`${product.id}-${index}`}
                      className="flex-none w-[260px] sm:w-[280px] md:w-[320px]"
                    >
                      <div className={`relative rounded-2xl overflow-hidden ${
                        darkMode ? 'bg-gray-900' : 'bg-white'
                      } shadow-lg hover:shadow-2xl transition-all duration-300 group/card h-full flex flex-col hover:-translate-y-2`}>
                        {/* Imagem do Produto */}
                        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                          
                          {/* Botão Favorito */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(product.id);
                            }}
                            className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-11 sm:h-11 rounded-full ${
                              isFavorite 
                                ? 'bg-red-500 text-white' 
                                : darkMode 
                                  ? 'bg-gray-800/90 text-white hover:bg-gray-700' 
                                  : 'bg-white/90 text-gray-900 hover:bg-white'
                            } backdrop-blur-sm flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer z-10 border-2 ${
                              isFavorite ? 'border-red-600' : 'border-transparent'
                            }`}
                          >
                            <i className={`${isFavorite ? 'ri-heart-fill' : 'ri-heart-line'} text-base sm:text-xl`}></i>
                          </button>

                          {/* Badges */}
                          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 sm:gap-2">
                            {discount > 0 && (
                              <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg flex items-center gap-1">
                                <i className="ri-fire-fill"></i>
                                -{discount}%
                              </span>
                            )}
                            {product.stock === 0 && (
                              <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-900 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg">
                                Esgotado
                              </span>
                            )}
                            {product.stock > 0 && product.stock <= 5 && (
                              <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                                Últimas {product.stock}
                              </span>
                            )}
                          </div>

                          {/* Overlay com ação rápida */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 sm:pb-4">
                            <button
                              onClick={() => window.REACT_APP_NAVIGATE(`/product/${product.slug}`)}
                              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-gray-900 rounded-full font-semibold text-xs sm:text-sm hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-xl"
                            >
                              <i className="ri-eye-line"></i>
                              Ver Detalhes
                            </button>
                          </div>
                        </div>

                        {/* Conteúdo do Card */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col">
                          <h3 
                            onClick={() => window.REACT_APP_NAVIGATE(`/product/${product.slug}`)}
                            className={`text-base sm:text-lg font-bold mb-2 line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem] cursor-pointer hover:text-[#b62bff] transition-colors ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {product.name}
                          </h3>

                          <p className={`text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 min-h-[2.5rem] ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {product.description}
                          </p>

                          {/* Avaliação */}
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i key={star} className="ri-star-fill text-amber-400 text-xs sm:text-sm"></i>
                              ))}
                            </div>
                            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              (4.9)
                            </span>
                          </div>

                          {/* Preço */}
                          <div className="mb-3 sm:mb-4 mt-auto">
                            {product.compare_at_price && product.compare_at_price > product.price ? (
                              <div className="flex flex-col gap-1">
                                <span className={`text-xs line-through ${
                                  darkMode ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                  €{product.compare_at_price.toFixed(2)}
                                </span>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
                                    €{product.price.toFixed(2)}
                                  </span>
                                  <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                                    -€{(product.compare_at_price - product.price).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
                                €{product.price.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Botão Comprar */}
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-xl font-semibold text-xs sm:text-base transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 ${
                              product.stock === 0 ? '' : 'hover:-translate-y-0.5'
                            }`}
                          >
                            <i className={`${product.stock === 0 ? 'ri-close-circle-line' : 'ri-shopping-cart-line'} text-base sm:text-lg`}></i>
                            <span className="hidden sm:inline">{product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}</span>
                            <span className="sm:hidden">{product.stock === 0 ? 'Esgotado' : 'Adicionar'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botão Próximo - ESCONDIDO NO MOBILE */}
              <button
                onClick={() => scrollProducts('next')}
                className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 lg:w-16 lg:h-16 rounded-full ${
                  darkMode ? 'bg-gray-900/95 hover:bg-gray-800' : 'bg-white/95 hover:bg-gray-50'
                } shadow-2xl items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-8 group-hover:translate-x-0 cursor-pointer backdrop-blur-md border-2 border-[#b62bff]/50 hover:border-[#b62bff] hover:scale-110`}
                aria-label="Próximo"
              >
                <i className={`ri-arrow-right-s-line text-3xl lg:text-4xl ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              </button>
            </div>

            {/* Botão Ver Todos */}
            <div className="flex justify-center mt-8 sm:mt-12">
              <button
                onClick={() => window.REACT_APP_NAVIGATE('/category')}
                className="px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-[#b62bff] via-[#ff6a00] to-[#ff0080] text-white rounded-2xl font-bold text-lg sm:text-xl hover:opacity-90 transition-all duration-300 cursor-pointer whitespace-nowrap shadow-2xl hover:shadow-[#b62bff]/50 hover:scale-105 flex items-center gap-2 sm:gap-3"
              >
                <span>Ver Todos os Produtos</span>
                <i className="ri-arrow-right-line text-xl sm:text-2xl"></i>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Carrossel de Serviços - LOOP INFINITO SUPER PROFISSIONAL RESPONSIVO */}
      {services.length > 0 && (
        <section className="relative py-12 sm:py-20 overflow-hidden">
          {/* Wallpaper de Fundo Profissional */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(https://readdy.ai/api/search-image?query=modern%20abstract%20digital%20services%20technology%20background%20with%20floating%20geometric%20shapes%20vibrant%20purple%20orange%20pink%20gradient%20dynamic%20composition%20professional%20lighting%20particles%20glow%20effects%20futuristic%20business%20atmosphere%20no%20people%20elegant%20minimalist&width=1920&height=800&seq=services-wallpaper-v1&orientation=landscape)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className={`absolute inset-0 ${
              darkMode 
                ? 'bg-gradient-to-b from-[#0b0011]/95 via-[#0b0011]/90 to-[#0b0011]/95' 
                : 'bg-gradient-to-b from-white/95 via-white/90 to-white/95'
            }`}></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              {/* Badge Animado */}
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-full mb-4 sm:mb-6 shadow-2xl animate-pulse">
                <i className="ri-service-fill text-white text-base sm:text-xl"></i>
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Serviços Profissionais
                </span>
                <i className="ri-service-fill text-white text-base sm:text-xl"></i>
              </div>

              {/* Título Principal com Gradiente Vibrante */}
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-[#10b981] via-[#06b6d4] to-[#8b5cf6] bg-clip-text text-transparent drop-shadow-2xl">
                  Serviços de Excelência
                </span>
              </h2>

              {/* Subtítulo com Efeito */}
              <p className={`text-lg sm:text-xl md:text-2xl font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Soluções Completas Para o Seu Negócio
              </p>
              <p className={`text-sm sm:text-base md:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'} max-w-3xl mx-auto px-4`}>
                Desenvolvimento, design, automação e consultoria especializada para transformar suas ideias em realidade
              </p>
            </div>

            <div className="relative group">
              {/* Botão Anterior - ESCONDIDO NO MOBILE */}
              <button
                onClick={() => scrollServices('prev')}
                className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 lg:w-16 lg:h-16 rounded-full ${
                  darkMode ? 'bg-gray-900/95 hover:bg-gray-800' : 'bg-white/95 hover:bg-gray-50'
                } shadow-2xl items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-8 group-hover:translate-x-0 cursor-pointer backdrop-blur-md border-2 border-[#10b981]/50 hover:border-[#10b981] hover:scale-110`}
                aria-label="Anterior"
              >
                <i className={`ri-arrow-left-s-line text-3xl lg:text-4xl ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              </button>

              {/* Container do Carrossel - LOOP INFINITO */}
              <div
                ref={servicesScrollRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-2 sm:px-0"
                onMouseEnter={() => setIsServicesHovered(true)}
                onMouseLeave={() => setIsServicesHovered(false)}
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {/* Duplicar serviços para loop infinito */}
                {[...services, ...services, ...services].map((service, index) => (
                  <div
                    key={`${service.id}-${index}`}
                    className="flex-none w-[280px] sm:w-[320px] md:w-[380px]"
                  >
                    <div 
                      className={`relative rounded-2xl overflow-hidden ${
                        darkMode ? 'bg-gray-900' : 'bg-white'
                      } shadow-lg hover:shadow-2xl transition-all duration-300 group/card h-full flex flex-col hover:-translate-y-2 cursor-pointer`}
                      onClick={() => window.REACT_APP_NAVIGATE(`/services/${service.slug}`)}
                    >
                      {/* Imagem do Serviço */}
                      <div className="relative h-44 sm:h-48 md:h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                        {/* Ícone Flutuante */}
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#10b981] to-[#06b6d4] rounded-full flex items-center justify-center shadow-lg">
                          <i className={`${service.icon || 'ri-service-line'} text-xl sm:text-2xl text-white`}></i>
                        </div>

                        {/* Badge de Categoria */}
                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-white text-xs font-bold rounded-full shadow-lg">
                          {service.category === 'web-development' && 'Desenvolvimento'}
                          {service.category === 'ecommerce' && 'E-commerce'}
                          {service.category === 'business-tools' && 'Ferramentas'}
                          {service.category === 'automation' && 'Automação'}
                          {service.category === 'optimization' && 'Otimização'}
                          {service.category === 'consulting' && 'Consultoria'}
                        </div>

                        {/* Overlay com ação rápida */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 sm:pb-4">
                          <button
                            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-gray-900 rounded-full font-semibold text-xs sm:text-sm hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-xl"
                          >
                            <i className="ri-eye-line"></i>
                            Ver Detalhes
                          </button>
                        </div>
                      </div>

                      {/* Conteúdo do Card */}
                      <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                        <h3 className={`text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem] ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {service.title}
                        </h3>

                        <p className={`text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 min-h-[3.5rem] sm:min-h-[4.5rem] ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {service.description}
                        </p>

                        {/* Prazo de Entrega */}
                        {service.delivery_time && (
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-[#10b981]/10 to-[#06b6d4]/10 rounded-full border border-[#10b981]/20">
                              <i className="ri-time-line text-[#10b981] text-sm"></i>
                              <span className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {service.delivery_time}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Preço */}
                        <div className="mb-3 sm:mb-4 mt-auto">
                          <p className={`text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            A partir de
                          </p>
                          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#10b981] to-[#06b6d4] bg-clip-text text-transparent">
                            €{service.price.toFixed(2)}
                          </div>
                        </div>

                        {/* Botão de Ação */}
                        <button
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-white rounded-xl font-semibold text-xs sm:text-base transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <span>Saiba Mais</span>
                          <i className="ri-arrow-right-line text-base sm:text-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão Próximo - ESCONDIDO NO MOBILE */}
              <button
                onClick={() => scrollServices('next')}
                className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 lg:w-16 lg:h-16 rounded-full ${
                  darkMode ? 'bg-gray-900/95 hover:bg-gray-800' : 'bg-white/95 hover:bg-gray-50'
                } shadow-2xl items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-8 group-hover:translate-x-0 cursor-pointer backdrop-blur-md border-2 border-[#10b981]/50 hover:border-[#10b981] hover:scale-110`}
                aria-label="Próximo"
              >
                <i className={`ri-arrow-right-s-line text-3xl lg:text-4xl ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              </button>
            </div>

            {/* Botão Ver Todos os Serviços */}
            <div className="flex justify-center mt-8 sm:mt-12">
              <button
                onClick={() => window.REACT_APP_NAVIGATE('/services')}
                className="px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-[#10b981] via-[#06b6d4] to-[#8b5cf6] text-white rounded-2xl font-bold text-lg sm:text-xl hover:opacity-90 transition-all duration-300 cursor-pointer whitespace-nowrap shadow-2xl hover:shadow-[#10b981]/50 hover:scale-105 flex items-center gap-2 sm:gap-3"
              >
                <span>Ver Todos os Serviços</span>
                <i className="ri-arrow-right-line text-xl sm:text-2xl"></i>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Seção "Por Que Comprar Conosco?" - RESPONSIVO */}
      <section className={`py-12 sm:py-20 ${darkMode ? 'bg-[#1a0b2e]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Por Que Comprar Conosco?
            </h2>
            <p className={`text-base sm:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Garantimos a melhor experiência de compra com benefícios exclusivos
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: 'ri-price-tag-3-line',
                title: 'Melhores Preços',
                description: 'Preços competitivos e promoções exclusivas para você economizar sempre',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: 'ri-shield-check-line',
                title: 'Compra Protegida',
                description: 'Seus dados e pagamentos 100% seguros com criptografia avançada',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: 'ri-rocket-line',
                title: 'Entrega Rápida',
                description: 'Receba seus produtos rapidamente com rastreamento em tempo real',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: 'ri-customer-service-2-line',
                title: 'Suporte Dedicado',
                description: 'Equipe especializada pronta para ajudar você a qualquer momento',
                color: 'from-orange-500 to-red-500'
              }
            ].map((item, index) => (
              <div
                key={index}
                className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 hover:translate-y-[-8px] hover:shadow-2xl overflow-hidden relative group ${
                  darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 sm:mb-6 border-2 border-transparent group-hover:border-white/20 transition-all duration-300`}>
                    <i className={`${item.icon} text-2xl sm:text-3xl text-white`}></i>
                  </div>
                  <h3 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.title}
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final - RESPONSIVO */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-[#b62bff] to-[#ff6a00]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
            Pronto Para Começar a Comprar?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8">
            Explore nosso catálogo completo e encontre os melhores produtos
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => window.REACT_APP_NAVIGATE('/category')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#b62bff] rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap shadow-xl"
            >
              Ver Todos os Produtos
            </button>
            <button
              onClick={() => window.REACT_APP_NAVIGATE('/contact')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-white/20 transition-colors cursor-pointer whitespace-nowrap border border-white/20"
            >
              Falar Conosco
            </button>
          </div>
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
