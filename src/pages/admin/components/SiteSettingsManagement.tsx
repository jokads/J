
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface SiteSettings {
  // Configurações Globais
  site_name: string;
  site_tagline: string;
  free_shipping_threshold: number;
  currency_symbol: string;
  topbar_email: string;
  topbar_phone: string;
  topbar_promo_text: string;
  show_topbar: boolean;
  enable_theme_toggle: boolean;
  
  // Cores
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  
  // Carousel
  carousel_max_items: number;
  carousel_auto_play: boolean;
  carousel_interval: number;
  
  // Footer
  footer_about_text: string;
  footer_social_facebook: string;
  footer_social_instagram: string;
  footer_social_twitter: string;
  footer_social_linkedin: string;
  footer_social_youtube: string;
  show_newsletter: boolean;
  newsletter_title: string;
  newsletter_description: string;
  
  // Contato
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  business_address: string;
  business_hours: string;
}

interface PageSettings {
  home: {
    hero_title: string;
    hero_subtitle: string;
    hero_description: string;
    show_categories: boolean;
    show_featured_products: boolean;
    show_services: boolean;
    show_stats: boolean;
  };
  products: {
    page_title: string;
    page_description: string;
    show_filters: boolean;
    products_per_page: number;
  };
  services: {
    page_title: string;
    page_description: string;
    show_categories: boolean;
  };
  about: {
    page_title: string;
    page_description: string;
    mission_text: string;
    vision_text: string;
  };
  contact: {
    page_title: string;
    page_description: string;
    show_map: boolean;
    show_form: boolean;
  };
  cart: {
    page_title: string;
    empty_cart_message: string;
    continue_shopping_text: string;
  };
  favorites: {
    page_title: string;
    empty_favorites_message: string;
  };
}

export default function SiteSettingsManagement() {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'JokaTech',
    site_tagline: 'Sua Loja Completa',
    free_shipping_threshold: 100,
    currency_symbol: '€',
    topbar_email: 'jokadamas616@gmail.com',
    topbar_phone: '+352 621 717 862',
    topbar_promo_text: 'Envio grátis em compras acima de €100',
    show_topbar: true,
    enable_theme_toggle: true,
    primary_color: '#f59e0b',
    secondary_color: '#111827',
    accent_color: '#d97706',
    carousel_max_items: 10,
    carousel_auto_play: true,
    carousel_interval: 3000,
    footer_about_text: 'Soluções digitais completas para o seu negócio. Qualidade, inovação e resultados garantidos.',
    footer_social_facebook: 'https://facebook.com',
    footer_social_instagram: 'https://instagram.com',
    footer_social_twitter: 'https://twitter.com',
    footer_social_linkedin: 'https://linkedin.com',
    footer_social_youtube: 'https://youtube.com',
    show_newsletter: true,
    newsletter_title: 'Subscreva a nossa Newsletter',
    newsletter_description: 'Receba as últimas novidades e ofertas exclusivas',
    contact_email: 'jokadamas616@gmail.com',
    contact_phone: '+352 621 717 862',
    whatsapp_number: '+352621717862',
    business_address: 'Luxemburgo, Europa',
    business_hours: 'Seg-Sex: 9h-18h'
  });

  const [pageSettings, setPageSettings] = useState<PageSettings>({
    home: {
      hero_title: 'Sua Loja',
      hero_subtitle: 'Completa',
      hero_description: 'Descubra milhares de produtos premium com os melhores preços do mercado. Qualidade garantida, entrega rápida e atendimento excepcional.',
      show_categories: true,
      show_featured_products: true,
      show_services: true,
      show_stats: true
    },
    products: {
      page_title: 'Nossos Produtos',
      page_description: 'Explore nossa coleção completa',
      show_filters: true,
      products_per_page: 12
    },
    services: {
      page_title: 'Nossos Serviços',
      page_description: 'Soluções profissionais para seu negócio',
      show_categories: true
    },
    about: {
      page_title: 'Sobre Nós',
      page_description: 'Conheça nossa história',
      mission_text: 'Nossa missão é oferecer os melhores produtos e serviços.',
      vision_text: 'Ser referência em qualidade e inovação.'
    },
    contact: {
      page_title: 'Entre em Contacto',
      page_description: 'Estamos aqui para ajudar',
      show_map: true,
      show_form: true
    },
    cart: {
      page_title: 'Carrinho de Compras',
      empty_cart_message: 'Seu carrinho está vazio',
      continue_shopping_text: 'Continuar Comprando'
    },
    favorites: {
      page_title: 'Meus Favoritos',
      empty_favorites_message: 'Você ainda não tem favoritos'
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'global' | 'home' | 'products' | 'services' | 'about' | 'contact' | 'cart' | 'favorites' | 'header' | 'footer' | 'theme'>('global');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setSettings(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({
            ...settings,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      setMessage({ type: 'success', text: '✅ Configurações salvas! A página será recarregada...' });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage({ type: 'error', text: '❌ Erro ao salvar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'global', label: '🌐 Global', icon: 'ri-global-line', color: 'blue' },
    { id: 'home', label: '🏠 Início', icon: 'ri-home-line', color: 'purple' },
    { id: 'products', label: '🛍️ Produtos', icon: 'ri-shopping-bag-line', color: 'green' },
    { id: 'services', label: '⚙️ Serviços', icon: 'ri-service-line', color: 'cyan' },
    { id: 'about', label: 'ℹ️ Sobre', icon: 'ri-information-line', color: 'indigo' },
    { id: 'contact', label: '📞 Contato', icon: 'ri-phone-line', color: 'orange' },
    { id: 'cart', label: '🛒 Carrinho', icon: 'ri-shopping-cart-line', color: 'pink' },
    { id: 'favorites', label: '❤️ Favoritos', icon: 'ri-heart-line', color: 'red' },
    { id: 'header', label: '📋 Header', icon: 'ri-layout-top-line', color: 'yellow' },
    { id: 'footer', label: '📄 Footer', icon: 'ri-layout-bottom-line', color: 'teal' },
    { id: 'theme', label: '🎨 Tema', icon: 'ri-palette-line', color: 'violet' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">⚙️ Configurações do Site</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Controlo total de TODAS as páginas e elementos do site
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin"></i>
              <span className="hidden sm:inline">A guardar...</span>
            </>
          ) : (
            <>
              <i className="ri-save-line"></i>
              <span className="hidden sm:inline">Guardar Alterações</span>
              <span className="sm:hidden">Guardar</span>
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 sm:p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <i className={message.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}></i>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Tabs - Scroll horizontal no mobile */}
      <div className="border-b border-gray-200 dark:border-gray-700 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 font-medium whitespace-nowrap transition-all duration-200 border-b-2 cursor-pointer text-xs sm:text-sm rounded-t-lg ${
                activeTab === tab.id
                  ? `border-${tab.color}-500 bg-${tab.color}-50 dark:bg-${tab.color}-900/20 text-${tab.color}-600 dark:text-${tab.color}-400`
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <span className="text-base sm:text-lg">{tab.label.split(' ')[0]}</span>
              <span className="hidden sm:inline">{tab.label.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-lg">
        
        {/* GLOBAL */}
        {activeTab === 'global' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <i className="ri-global-line text-xl sm:text-2xl text-white"></i>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Configurações Globais</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Aplicam-se a todo o site</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🏪 Nome do Site
                </label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="JokaTech"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ✨ Slogan do Site
                </label>
                <input
                  type="text"
                  value={settings.site_tagline}
                  onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="Sua Loja Completa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🚚 Envio Grátis Acima de (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.free_shipping_threshold}
                  onChange={(e) => setSettings({ ...settings, free_shipping_threshold: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Atualiza automaticamente em TODO o site
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  💰 Símbolo da Moeda
                </label>
                <input
                  type="text"
                  value={settings.currency_symbol}
                  onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="€"
                />
              </div>
            </div>
          </div>
        )}

        {/* HOME */}
        {activeTab === 'home' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <i className="ri-home-line text-xl sm:text-2xl text-white"></i>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Página Inicial</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Hero, categorias, produtos em destaque</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📝 Título do Hero
                </label>
                <input
                  type="text"
                  value={pageSettings.home.hero_title}
                  onChange={(e) => setPageSettings({
                    ...pageSettings,
                    home: { ...pageSettings.home, hero_title: e.target.value }
                  })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="Sua Loja"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ✨ Palavra em Destaque (Gradiente)
                </label>
                <input
                  type="text"
                  value={pageSettings.home.hero_subtitle}
                  onChange={(e) => setPageSettings({
                    ...pageSettings,
                    home: { ...pageSettings.home, hero_subtitle: e.target.value }
                  })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="Completa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  💬 Descrição do Hero
                </label>
                <textarea
                  value={pageSettings.home.hero_description}
                  onChange={(e) => setPageSettings({
                    ...pageSettings,
                    home: { ...pageSettings.home, hero_description: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm sm:text-base"
                  placeholder="Descubra milhares de produtos..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={pageSettings.home.show_categories}
                    onChange={(e) => setPageSettings({
                      ...pageSettings,
                      home: { ...pageSettings.home, show_categories: e.target.checked }
                    })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">📂 Mostrar Categorias</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Seção de categorias</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={pageSettings.home.show_featured_products}
                    onChange={(e) => setPageSettings({
                      ...pageSettings,
                      home: { ...pageSettings.home, show_featured_products: e.target.checked }
                    })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">🔥 Produtos em Destaque</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Carousel de produtos</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={pageSettings.home.show_services}
                    onChange={(e) => setPageSettings({
                      ...pageSettings,
                      home: { ...pageSettings.home, show_services: e.target.checked }
                    })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">⚙️ Mostrar Serviços</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Carousel de serviços</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={pageSettings.home.show_stats}
                    onChange={(e) => setPageSettings({
                      ...pageSettings,
                      home: { ...pageSettings.home, show_stats: e.target.checked }
                    })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">📊 Mostrar Estatísticas</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Badges de confiança</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        {activeTab === 'header' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <i className="ri-layout-top-line text-xl sm:text-2xl text-white"></i>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Header & Topbar</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Topo de todas as páginas</p>
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg cursor-pointer border-2 border-yellow-200 dark:border-yellow-800">
              <input
                type="checkbox"
                checked={settings.show_topbar}
                onChange={(e) => setSettings({ ...settings, show_topbar: e.target.checked })}
                className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">📢 Mostrar Topbar</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Barra promocional no topo</p>
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📧 E-mail (Topbar)
                </label>
                <input
                  type="email"
                  value={settings.topbar_email}
                  onChange={(e) => setSettings({ ...settings, topbar_email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📞 Telefone (Topbar)
                </label>
                <input
                  type="text"
                  value={settings.topbar_phone}
                  onChange={(e) => setSettings({ ...settings, topbar_phone: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🎁 Texto Promocional (Topbar)
                </label>
                <input
                  type="text"
                  value={settings.topbar_promo_text}
                  onChange={(e) => setSettings({ ...settings, topbar_promo_text: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="Envio grátis em compras acima de €100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  💡 Dica: Mencione o valor de envio grátis aqui
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_theme_toggle}
                onChange={(e) => setSettings({ ...settings, enable_theme_toggle: e.target.checked })}
                className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">🌓 Ativar Dark/Light Mode</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Botão de alternar tema</p>
              </div>
            </label>
          </div>
        )}

        {/* FOOTER */}
        {activeTab === 'footer' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <i className="ri-layout-bottom-line text-xl sm:text-2xl text-white"></i>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Footer & Redes Sociais</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Rodapé de todas as páginas</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📝 Texto Sobre a Empresa
              </label>
              <textarea
                value={settings.footer_about_text}
                onChange={(e) => setSettings({ ...settings, footer_about_text: e.target.value })}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm sm:text-base"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <i className="ri-links-line"></i>
                Redes Sociais
              </h4>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { key: 'footer_social_facebook', icon: 'ri-facebook-fill', label: 'Facebook', color: 'blue' },
                  { key: 'footer_social_instagram', icon: 'ri-instagram-line', label: 'Instagram', color: 'pink' },
                  { key: 'footer_social_twitter', icon: 'ri-twitter-x-line', label: 'Twitter/X', color: 'gray' },
                  { key: 'footer_social_linkedin', icon: 'ri-linkedin-fill', label: 'LinkedIn', color: 'blue' },
                  { key: 'footer_social_youtube', icon: 'ri-youtube-fill', label: 'YouTube', color: 'red' }
                ].map((social) => (
                  <div key={social.key} className="flex items-center gap-3">
                    <div className={`w-10 h-10 flex items-center justify-center bg-${social.color}-100 dark:bg-${social.color}-900/30 text-${social.color}-600 dark:text-${social.color}-400 rounded-lg flex-shrink-0`}>
                      <i className={social.icon}></i>
                    </div>
                    <input
                      type="url"
                      value={settings[social.key as keyof SiteSettings] as string}
                      onChange={(e) => setSettings({ ...settings, [social.key]: e.target.value })}
                      className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                      placeholder={`https://${social.label.toLowerCase()}.com/...`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3 p-3 sm:p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg cursor-pointer border-2 border-teal-200 dark:border-teal-800 mb-4">
                <input
                  type="checkbox"
                  checked={settings.show_newsletter}
                  onChange={(e) => setSettings({ ...settings, show_newsletter: e.target.checked })}
                  className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500 cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">📬 Mostrar Newsletter</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Formulário de subscrição</p>
                </div>
              </label>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📝 Título da Newsletter
                  </label>
                  <input
                    type="text"
                    value={settings.newsletter_title}
                    onChange={(e) => setSettings({ ...settings, newsletter_title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    💬 Descrição da Newsletter
                  </label>
                  <input
                    type="text"
                    value={settings.newsletter_description}
                    onChange={(e) => setSettings({ ...settings, newsletter_description: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* THEME */}
        {activeTab === 'theme' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                <i className="ri-palette-line text-xl sm:text-2xl text-white"></i>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Cores do Tema</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Personalize as cores principais</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {[
                { key: 'primary_color', label: '🎨 Cor Primária', desc: 'Botões, links, destaques' },
                { key: 'secondary_color', label: '🎨 Cor Secundária', desc: 'Textos, backgrounds' },
                { key: 'accent_color', label: '🎨 Cor de Destaque', desc: 'Hover, ênfase' }
              ].map((color) => (
                <div key={color.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {color.label}
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={settings[color.key as keyof SiteSettings] as string}
                      onChange={(e) => setSettings({ ...settings, [color.key]: e.target.value })}
                      className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      value={settings[color.key as keyof SiteSettings] as string}
                      onChange={(e) => setSettings({ ...settings, [color.key]: e.target.value })}
                      className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{color.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">👁️ Preview das Cores</h4>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'primary_color', label: 'Primária' },
                  { key: 'secondary_color', label: 'Secundária' },
                  { key: 'accent_color', label: 'Destaque' }
                ].map((color) => (
                  <div
                    key={color.key}
                    className="p-6 rounded-lg text-center transition-transform hover:scale-105"
                    style={{ backgroundColor: settings[color.key as keyof SiteSettings] as string }}
                  >
                    <span className="text-white font-semibold text-sm drop-shadow-lg">{color.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Outras abas podem ser adicionadas aqui */}
        {['products', 'services', 'about', 'contact', 'cart', 'favorites'].includes(activeTab) && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-tools-line text-4xl text-gray-400 dark:text-gray-500"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Em Desenvolvimento
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Configurações da página <strong>{activeTab}</strong> em breve!
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-information-line text-xl text-white"></i>
          </div>
          <div className="flex-1">
            <h4 className="text-sm sm:text-base font-bold text-blue-900 dark:text-blue-100 mb-2">
              💡 Como Funciona
            </h4>
            <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>✅ Todas as mudanças atualizam IMEDIATAMENTE no site</li>
              <li>✅ Envio grátis atualiza em TODO o site automaticamente</li>
              <li>✅ Cores aplicam-se a todos os elementos</li>
              <li>✅ Textos do header/footer aparecem em todas as páginas</li>
              <li>✅ Configurações por página controlam seções específicas</li>
            </ul>
          </div>
        </div>
      </div>

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
