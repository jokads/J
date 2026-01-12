import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Componentes das seções
import ProductsManagement from './components/ProductsManagement';
import SiteSettings from './components/SiteSettings';
import OrdersManagement from './components/OrdersManagement';
import CustomersManagement from './components/CustomersManagement';
import MarketplaceManagement from './components/MarketplaceManagement';
import ShippingSettings from './components/ShippingSettings';
import CategoriesManagement from './components/CategoriesManagement';
import ControloTotal from './components/ControloTotal';
import NewsManagement from './components/NewsManagement';
import ReviewsManagement from './components/ReviewsManagement';
import ServicesManagement from './components/ServicesManagement';

export default function DashboardAdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // Estado do menu lateral
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Estados para estatísticas
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    marketplaceProducts: 0,
    featuredProducts: 0,
    totalNews: 0,
    totalServices: 0,
    pendingCustomPCs: 0,
    totalMessages: 0
  });

  useEffect(() => {
    checkAdminAccess();
  }, [navigate]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      setUserEmail(user.email || '');

      const { data: perfil, error: perfilError } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', user.id)
        .single();

      if (perfilError || !perfil) {
        navigate('/login');
        return;
      }

      setUserName(perfil.full_name || perfil.email || 'Usuário');

      // 🔥 SUPER ADMIN AUTOMÁTICO PARA damasclaudio2@gmail.com
      const isSuperAdminEmail = user.email === 'damasclaudio2@gmail.com';
      
      if (isSuperAdminEmail) {
        // Atualizar perfil para super admin se ainda não for
        if (!perfil.is_super_admin) {
          await supabase
            .from('perfis')
            .update({ 
              is_super_admin: true, 
              is_admin: true,
              is_seller: true,
              seller_approved: true
            })
            .eq('id', user.id);
        }
        setIsSuperAdmin(true);
        setIsAdmin(true);
      } else if (!perfil.is_admin && !perfil.is_super_admin) {
        alert('⛔ Acesso negado! Apenas administradores podem acessar o dashboard.');
        navigate('/');
        return;
      } else {
        setIsAdmin(perfil.is_admin || false);
        setIsSuperAdmin(perfil.is_super_admin || false);
      }

      setLoading(false);
      loadStats();
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      navigate('/login');
    }
  };

  const loadStats = async () => {
    try {
      // Carregar produtos
      const { data: products } = await supabase
        .from('products')
        .select('*');

      // Carregar pedidos
      const { data: orders } = await supabase
        .from('orders')
        .select('*');

      // Carregar clientes
      const { data: customers } = await supabase
        .from('perfis')
        .select('*');

      // Carregar notícias
      const { data: news } = await supabase
        .from('news')
        .select('*');

      // Carregar pedidos de PC personalizado
      const { data: customPCs } = await supabase
        .from('custom_pc_requests')
        .select('*');

      // Carregar mensagens de contato
      const { data: messages } = await supabase
        .from('contact_messages')
        .select('*');

      const totalProducts = products?.length || 0;
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
      const totalCustomers = customers?.length || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
      const lowStockProducts = products?.filter(p => p.stock < 10).length || 0;
      const marketplaceProducts = products?.filter(p => p.is_marketplace).length || 0;
      const featuredProducts = products?.filter(p => p.is_featured).length || 0;
      const totalNews = news?.length || 0;
      const totalServices = 40; // Mock data
      const pendingCustomPCs = customPCs?.filter(pc => pc.status === 'pending').length || 0;
      const totalMessages = messages?.filter(m => !m.read).length || 0;

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        totalCustomers,
        pendingOrders,
        lowStockProducts,
        marketplaceProducts,
        featuredProducts,
        totalNews,
        totalServices,
        pendingCustomPCs,
        totalMessages
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-6xl text-amber-400 animate-spin mb-4"></i>
          <p className="text-gray-400 text-lg">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  const menuSections = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: 'ri-dashboard-line',
      color: 'blue'
    },
    {
      id: 'controlo-total',
      label: '🎯 Controlo Total',
      icon: 'ri-settings-3-line',
      color: 'purple'
    },
    {
      id: 'noticias',
      label: '📰 Notícias',
      icon: 'ri-newspaper-line',
      color: 'blue'
    },
    {
      id: 'servicos',
      label: '🛠️ Serviços',
      icon: 'ri-service-line',
      color: 'cyan'
    },
    {
      id: 'avaliacoes',
      label: '⭐ Avaliações',
      icon: 'ri-star-line',
      color: 'yellow'
    },
    {
      id: 'products',
      label: 'Gestão de Produtos',
      icon: 'ri-box-3-line',
      color: 'green'
    },
    {
      id: 'orders',
      label: 'Gestão de Pedidos',
      icon: 'ri-shopping-cart-line',
      color: 'blue'
    },
    {
      id: 'customers',
      label: 'Gestão de Clientes',
      icon: 'ri-user-line',
      color: 'indigo'
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: 'ri-store-line',
      color: 'purple'
    },
    {
      id: 'categories',
      label: 'Categorias',
      icon: 'ri-list-check',
      color: 'orange'
    }
  ];

  // Função para renderizar o conteúdo baseado na seção ativa
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Alertas */}
            {(stats.pendingOrders > 0 || stats.lowStockProducts > 0 || stats.pendingCustomPCs > 0 || stats.totalMessages > 0) && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                  <i className="ri-alert-line"></i>
                  ALERTAS IMPORTANTES
                </h3>
                <div className="space-y-2">
                  {stats.pendingOrders > 0 && (
                    <p className="text-yellow-300 flex items-center gap-2">
                      <i className="ri-error-warning-line"></i>
                      {stats.pendingOrders} pedidos pendentes aguardando processamento
                    </p>
                  )}
                  {stats.lowStockProducts > 0 && (
                    <p className="text-yellow-300 flex items-center gap-2">
                      <i className="ri-error-warning-line"></i>
                      {stats.lowStockProducts} produtos com estoque baixo (menos de 10 unidades)
                    </p>
                  )}
                  {stats.pendingCustomPCs > 0 && (
                    <p className="text-yellow-300 flex items-center gap-2">
                      <i className="ri-error-warning-line"></i>
                      {stats.pendingCustomPCs} pedidos de PC personalizado aguardando resposta
                    </p>
                  )}
                  {stats.totalMessages > 0 && (
                    <p className="text-yellow-300 flex items-center gap-2">
                      <i className="ri-error-warning-line"></i>
                      {stats.totalMessages} mensagens não lidas
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6 cursor-pointer hover:scale-105 transition-all" onClick={() => setActiveSection('orders')}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center">
                    <i className="ri-shopping-cart-line text-2xl text-blue-400"></i>
                  </div>
                  <i className="ri-arrow-right-line text-blue-400"></i>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Total de Pedidos</h3>
                <p className="text-4xl font-bold text-white">{stats.totalOrders}</p>
                <p className="text-xs text-blue-400 mt-2">{stats.pendingOrders} pendentes</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-6 cursor-pointer hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center">
                    <i className="ri-money-euro-circle-line text-2xl text-green-400"></i>
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Receita Total</h3>
                <p className="text-4xl font-bold text-white">€{stats.totalRevenue.toFixed(2)}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6 cursor-pointer hover:scale-105 transition-all" onClick={() => setActiveSection('products')}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center">
                    <i className="ri-box-line text-2xl text-purple-400"></i>
                  </div>
                  <i className="ri-arrow-right-line text-purple-400"></i>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Total de Produtos</h3>
                <p className="text-4xl font-bold text-white">{stats.totalProducts}</p>
                <p className="text-xs text-purple-400 mt-2">{stats.featuredProducts} em destaque</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-6 cursor-pointer hover:scale-105 transition-all" onClick={() => setActiveSection('customers')}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-500/30 rounded-lg flex items-center justify-center">
                    <i className="ri-user-line text-2xl text-amber-400"></i>
                  </div>
                  <i className="ri-arrow-right-line text-amber-400"></i>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Total de Clientes</h3>
                <p className="text-4xl font-bold text-white">{stats.totalCustomers}</p>
              </div>
            </div>

            {/* Estatísticas Secundárias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 rounded-lg p-6 cursor-pointer hover:scale-105 transition-all" onClick={() => setActiveSection('marketplace')}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-cyan-500/30 rounded-lg flex items-center justify-center">
                    <i className="ri-store-line text-2xl text-cyan-400"></i>
                  </div>
                  <i className="ri-arrow-right-line text-cyan-400"></i>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Marketplace</h3>
                <p className="text-4xl font-bold text-white">{stats.marketplaceProducts}</p>
                <p className="text-xs text-cyan-400 mt-2">Produtos de vendedores</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6 cursor-pointer hover:scale-105 transition-all" onClick={() => setActiveSection('noticias')}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center">
                    <i className="ri-newspaper-line text-2xl text-blue-400"></i>
                  </div>
                  <i className="ri-arrow-right-line text-blue-400"></i>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Notícias</h3>
                <p className="text-4xl font-bold text-white">{stats.totalNews}</p>
                <p className="text-xs text-blue-400 mt-2">Publicadas</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 rounded-lg p-6 cursor-pointer hover:scale-105 transition-all" onClick={() => setActiveSection('servicos')}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-cyan-500/30 rounded-lg flex items-center justify-center">
                    <i className="ri-service-line text-2xl text-cyan-400"></i>
                  </div>
                  <i className="ri-arrow-right-line text-cyan-400"></i>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Serviços</h3>
                <p className="text-4xl font-bold text-white">{stats.totalServices}</p>
                <p className="text-xs text-cyan-400 mt-2">Disponíveis</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/30 rounded-lg flex items-center justify-center">
                    <i className="ri-tools-line text-2xl text-orange-400"></i>
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">PCs Personalizados</h3>
                <p className="text-4xl font-bold text-white">{stats.pendingCustomPCs}</p>
                <p className="text-xs text-orange-400 mt-2">Aguardando resposta</p>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20">
              <h3 className="text-xl font-bold text-amber-400 mb-4">⚡ AÇÕES RÁPIDAS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveSection('controlo-total')}
                  className="p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg hover:from-purple-500/30 hover:to-purple-600/30 transition-all cursor-pointer"
                >
                  <i className="ri-settings-3-line text-3xl text-purple-400 mb-2"></i>
                  <p className="text-white font-bold">Controlo Total</p>
                </button>

                <button
                  onClick={() => setActiveSection('noticias')}
                  className="p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg hover:from-blue-500/30 hover:to-blue-600/30 transition-all cursor-pointer"
                >
                  <i className="ri-newspaper-line text-3xl text-blue-400 mb-2"></i>
                  <p className="text-white font-bold">Gerenciar Notícias</p>
                </button>

                <button
                  onClick={() => setActiveSection('servicos')}
                  className="p-4 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 rounded-lg hover:from-cyan-500/30 hover:to-cyan-600/30 transition-all cursor-pointer"
                >
                  <i className="ri-service-line text-3xl text-cyan-400 mb-2"></i>
                  <p className="text-white font-bold">Gerenciar Serviços</p>
                </button>

                <button
                  onClick={() => setActiveSection('products')}
                  className="p-4 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg hover:from-green-500/30 hover:to-green-600/30 transition-all cursor-pointer"
                >
                  <i className="ri-add-circle-line text-3xl text-green-400 mb-2"></i>
                  <p className="text-white font-bold">Adicionar Produto</p>
                </button>
              </div>
            </div>
          </div>
        );

      case 'controlo-total':
        return <ControloTotal key="controlo-total" />;

      case 'noticias':
        return <NewsManagement key="noticias" />;

      case 'servicos':
        return <ServicesManagement key="servicos" />;

      case 'avaliacoes':
        return <ReviewsManagement key="avaliacoes" />;

      case 'products':
        return <ProductsManagement key="products" />;

      case 'categories':
        return <CategoriesManagement key="categories" />;

      case 'orders':
        return <OrdersManagement key="orders" />;

      case 'customers':
        return <CustomersManagement key="customers" />;

      case 'marketplace':
        return <MarketplaceManagement key="marketplace" />;

      default:
        return (
          <div className="text-center py-12">
            <i className="ri-error-warning-line text-6xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">Seção não encontrada</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
      {/* 🔥 MENU LATERAL RETRÁTIL */}
      <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-black border-r-2 border-red-500/30 transition-all duration-300 z-50 overflow-y-auto ${
        sidebarOpen ? 'w-72' : 'w-20'
      }`}>
        {/* Header do Menu */}
        <div className="p-4 border-b border-red-500/20 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <img 
                src="https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/cb4831d791909a4a7679c925d26faa2b.png" 
                alt="JokaTech" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <span className="text-white font-bold text-lg">Joka</span>
                <span className="text-black font-bold text-lg bg-gradient-to-r from-red-400 to-red-600 px-2 py-1 rounded ml-1">Tech</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer text-red-400"
          >
            <i className={`ri-${sidebarOpen ? 'menu-fold' : 'menu-unfold'}-line text-2xl`}></i>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-black shadow-lg'
                  : 'text-gray-400 hover:bg-red-500/10 hover:text-red-400'
              }`}
            >
              <i className={`${section.icon} text-xl flex-shrink-0`}></i>
              {sidebarOpen && (
                <span className="font-bold text-sm whitespace-nowrap">{section.label}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* 🔥 CONTEÚDO PRINCIPAL */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-xl border-b border-red-500/20 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">Dashboard Admin</h1>
              <p className="text-sm text-gray-400">Controle total do site</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Botão Voltar ao Site */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all cursor-pointer font-bold text-sm border border-red-500/30 whitespace-nowrap"
              >
                <i className="ri-home-line"></i>
                <span className="hidden sm:inline">Voltar ao Site</span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-black/40 text-white rounded-lg hover:bg-black/60 transition-all cursor-pointer border border-red-500/30 whitespace-nowrap"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-black font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold">{userName}</p>
                    <p className="text-xs text-gray-400">{isSuperAdmin ? '👑 Super Admin' : '🔑 Admin'}</p>
                  </div>
                  <i className={`ri-arrow-${showUserMenu ? 'up' : 'down'}-s-line`}></i>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-red-500/30 overflow-hidden">
                    <div className="p-4 border-b border-red-500/20">
                      <p className="text-white font-bold">{userName}</p>
                      <p className="text-xs text-gray-400">{userEmail}</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                        isSuperAdmin 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-black' 
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {isSuperAdmin ? '👑 SUPER ADMINISTRADOR' : '🔑 ADMINISTRADOR'}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/perfil')}
                      className="w-full px-4 py-3 text-left text-white hover:bg-red-500/20 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
                    >
                      <i className="ri-user-line"></i>
                      Meu Perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/20 transition-all cursor-pointer flex items-center gap-2 border-t border-red-500/20 whitespace-nowrap"
                    >
                      <i className="ri-logout-box-line"></i>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
