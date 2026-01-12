import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    checkLoginStatus();
    updateCounts();

    // Atualizar contadores quando houver mudanças
    const handleStorageChange = () => {
      updateCounts();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('favoritesUpdated', handleStorageChange);

    // Verificar autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserData(session.user);
      } else {
        handleLogoutCleanup();
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('favoritesUpdated', handleStorageChange);
    };
  }, []);

  const loadUserData = async (user: any) => {
    try {
      console.log('✅ Carregando dados do usuário:', user.email);
      
      // Buscar dados completos do perfil usando 'id' (não user_id)
      const { data: profile, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar perfil:', error);
      }

      const userData: UserData = {
        id: user.id,
        email: user.email || '',
        full_name: profile?.full_name || profile?.nome || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
        created_at: user.created_at
      };

      setUserData(userData);
      setIsLoggedIn(true);
      
      // Salvar perfil completo
      if (profile) {
        setUserProfile(profile);
        localStorage.setItem('user_profile', JSON.stringify(profile));
        
        // Verificar se é admin ou super admin
        const isAdminUser = profile.is_admin === true || profile.is_super_admin === true;
        const isSuperAdminUser = profile.is_super_admin === true;
        
        setIsAdmin(isAdminUser);
        setIsSuperAdmin(isSuperAdminUser);
        
        console.log('✅ Perfil carregado:', profile);
        console.log('✅ É admin?', isAdminUser);
        console.log('✅ É super admin?', isSuperAdminUser);
        
        if (isAdminUser) {
          localStorage.setItem('isAdmin', 'true');
        } else {
          localStorage.removeItem('isAdmin');
        }
      }
      
      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userEmail', userData.email);
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
    }
  };

  const checkLoginStatus = async () => {
    try {
      // Verificar sessão do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserData(session.user);
      } else {
        // Fallback para localStorage
        const storedUser = localStorage.getItem('user');
        const storedProfile = localStorage.getItem('user_profile');
        
        if (storedUser && storedProfile) {
          try {
            const parsedUser = JSON.parse(storedUser);
            const parsedProfile = JSON.parse(storedProfile);
            setUserData(parsedUser);
            setUserProfile(parsedProfile);
            setIsLoggedIn(true);
            
            const isAdminUser = parsedProfile.is_admin === true || parsedProfile.is_super_admin === true;
            const isSuperAdminUser = parsedProfile.is_super_admin === true;
            setIsAdmin(isAdminUser);
            setIsSuperAdmin(isSuperAdminUser);
          } catch (e) {
            handleLogoutCleanup();
          }
        } else {
          handleLogoutCleanup();
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar login:', error);
      handleLogoutCleanup();
    }
  };

  const handleLogoutCleanup = () => {
    setIsLoggedIn(false);
    setUserData(null);
    setUserProfile(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('isAdmin');
  };

  const updateCounts = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setCartCount(cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
      setFavoritesCount(favorites.length);
    } catch (error) {
      console.error('❌ Erro ao atualizar contadores:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('👋 Fazendo logout...');
      await supabase.auth.signOut();
      handleLogoutCleanup();
      setShowUserMenu(false);
      navigate('/');
      
      // Notificação de sucesso
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce';
      toast.innerHTML = '✅ Logout realizado com sucesso!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const navLinks = [
    { name: 'INÍCIO', path: '/', icon: 'ri-home-line' },
    { name: 'PRODUTOS', path: '/produtos', icon: 'ri-box-3-line' },
    { name: 'MONTAR PC', path: '/montar-pc', icon: 'ri-computer-line' },
    { name: 'MARKETPLACE', path: '/marketplace', icon: 'ri-store-line' },
    { name: 'SOBRE', path: '/sobre', icon: 'ri-information-line' },
    { name: 'CONTATO', path: '/contato', icon: 'ri-mail-line' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src="https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/cb4831d791909a4a7679c925d26faa2b.png" 
                alt="JokaTech Logo" 
                className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                JokaTech
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center space-x-2 ${
                    location.pathname === link.path
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <i className={link.icon}></i>
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Favorites */}
              <Link
                to="/favoritos"
                className="relative p-2 text-white hover:text-red-500 transition-colors cursor-pointer hidden sm:block"
              >
                <i className="ri-heart-line text-2xl"></i>
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/carrinho"
                className="relative p-2 text-white hover:text-red-500 transition-colors cursor-pointer"
              >
                <i className="ri-shopping-cart-line text-2xl"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isLoggedIn && userData ? (
                <div className="relative hidden sm:block">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all cursor-pointer group"
                  >
                    {userData.avatar_url ? (
                      <img 
                        src={userData.avatar_url} 
                        alt={userData.full_name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-red-500"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                        {getInitials(userData.full_name || userData.email)}
                      </div>
                    )}
                    <i className={`ri-arrow-${showUserMenu ? 'up' : 'down'}-s-line text-white text-xl transition-transform`}></i>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-80 bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                      {/* User Info Header */}
                      <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {userData.avatar_url ? (
                            <img 
                              src={userData.avatar_url} 
                              alt={userData.full_name}
                              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center font-bold text-red-600 text-2xl shadow-lg">
                              {getInitials(userData.full_name || userData.email)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-lg truncate">
                              {userData.full_name}
                            </p>
                            <p className="text-white/70 text-sm truncate">
                              {userData.email}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {isSuperAdmin ? (
                                <span className="px-2 py-0.5 bg-black/20 text-white text-xs font-bold rounded-full">
                                  👑 SUPER ADMIN
                                </span>
                              ) : isAdmin ? (
                                <span className="px-2 py-0.5 bg-black/20 text-white text-xs font-bold rounded-full">
                                  🔑 ADMIN
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-black/20 text-white text-xs font-bold rounded-full">
                                  👤 CLIENTE
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Account Info */}
                      <div className="px-6 py-4 bg-white/5 border-b border-red-500/20">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400 text-xs">Membro desde</p>
                            <p className="text-white font-bold">
                              {formatDate(userData.created_at)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">ID do Usuário</p>
                            <p className="text-white font-bold text-xs truncate">
                              {userData.id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {/* Botão Dashboard - APENAS para admins */}
                        {isAdmin && (
                          <Link
                            to="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-3 px-6 py-3 text-white hover:bg-red-500/20 transition-colors cursor-pointer group"
                          >
                            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                              <i className="ri-dashboard-line text-red-400 text-xl"></i>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold">Painel Admin</p>
                              <p className="text-xs text-gray-400">Gerenciar sistema</p>
                            </div>
                            <i className="ri-arrow-right-s-line text-gray-400"></i>
                          </Link>
                        )}

                        {/* Link Perfil - Para todos os usuários logados */}
                        <Link
                          to="/perfil"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-6 py-3 text-white hover:bg-red-500/20 transition-colors cursor-pointer group"
                        >
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                            <i className="ri-user-line text-blue-400 text-xl"></i>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold">Meu Perfil</p>
                            <p className="text-xs text-gray-400">Ver e editar perfil</p>
                          </div>
                          <i className="ri-arrow-right-s-line text-gray-400"></i>
                        </Link>

                        <Link
                          to="/favoritos"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-6 py-3 text-white hover:bg-red-500/20 transition-colors cursor-pointer group sm:hidden"
                        >
                          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                            <i className="ri-heart-line text-red-400 text-xl"></i>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold">Favoritos</p>
                            <p className="text-xs text-gray-400">{favoritesCount} produtos</p>
                          </div>
                          <i className="ri-arrow-right-s-line text-gray-400"></i>
                        </Link>

                        <Link
                          to="/carrinho"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-6 py-3 text-white hover:bg-red-500/20 transition-colors cursor-pointer group"
                        >
                          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                            <i className="ri-shopping-cart-line text-red-400 text-xl"></i>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold">Meu Carrinho</p>
                            <p className="text-xs text-gray-400">{cartCount} itens</p>
                          </div>
                          <i className="ri-arrow-right-s-line text-gray-400"></i>
                        </Link>
                      </div>

                      {/* Logout Button */}
                      <div className="px-6 py-4 bg-red-500/10 border-t border-red-500/30">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all cursor-pointer group"
                        >
                          <i className="ri-logout-box-line text-xl group-hover:scale-110 transition-transform"></i>
                          <span>Sair da Conta</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all cursor-pointer whitespace-nowrap hidden sm:flex items-center space-x-2"
                >
                  <i className="ri-login-box-line text-lg"></i>
                  <span>ENTRAR</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-red-500 transition-colors cursor-pointer"
              >
                <i className={`text-2xl ${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-black/98 backdrop-blur-md border-b border-gray-800 shadow-2xl">
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-2">
              {/* Mobile User Info */}
              {isLoggedIn && userData && (
                <div className="mb-4 p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {userData.avatar_url ? (
                      <img 
                        src={userData.avatar_url} 
                        alt={userData.full_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-red-600">
                        {getInitials(userData.full_name || userData.email)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate">{userData.full_name}</p>
                      <p className="text-white/70 text-sm truncate">{userData.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-black/20 text-white text-xs font-bold rounded-full">
                          {isSuperAdmin ? '👑 SUPER ADMIN' : '🔑 ADMIN'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-2 ${
                    location.pathname === link.path
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <i className={link.icon}></i>
                  <span>{link.name}</span>
                </Link>
              ))}
              
              {/* Mobile User Actions */}
              {isLoggedIn ? (
                <>
                  {/* Botão Dashboard - APENAS para admins */}
                  {isAdmin && (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/20 transition-all cursor-pointer flex items-center space-x-2 border border-red-500/30"
                    >
                      <i className="ri-dashboard-line"></i>
                      <span className="font-bold">Dashboard Admin</span>
                    </Link>
                  )}

                  {/* Link Perfil - Para todos os usuários */}
                  <Link
                    to="/perfil"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <i className="ri-user-line"></i>
                    <span>Meu Perfil</span>
                  </Link>

                  <Link
                    to="/favoritos"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <i className="ri-heart-line"></i>
                    <span>Favoritos ({favoritesCount})</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <i className="ri-logout-box-line"></i>
                    <span>Sair da Conta</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:shadow-lg transition-all cursor-pointer text-center"
                >
                  ENTRAR
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </>
  );
}
