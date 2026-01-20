
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Header() {
  const { items } = useCart();
  const { darkMode, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Atualizar contador de favoritos
  useEffect(() => {
    const updateFavoritesCount = () => {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavoritesCount(favorites.length);
    };

    updateFavoritesCount();
    window.addEventListener('favoritesChanged', updateFavoritesCount);

    return () => {
      window.removeEventListener('favoritesChanged', updateFavoritesCount);
    };
  }, []);

  // Buscar role e perfil do utilizador
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserRole(null);
        setUserProfile(null);
        return;
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.warn('Aviso: Não foi possível carregar perfil completo, usando dados básicos', error);
          setUserRole('customer'); // Role padrão
          setUserProfile({
            full_name: user.email?.split('@')[0] || 'Utilizador',
            avatar_url: null
          });
          return;
        }

        if (data) {
          setUserRole(data.role || 'customer');
          setUserProfile(data);
        }
      } catch (error) {
        console.warn('Aviso: Erro ao buscar perfil, usando dados básicos', error);
        setUserRole('customer');
        setUserProfile({
          full_name: user.email?.split('@')[0] || 'Utilizador',
          avatar_url: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isAdmin = userRole && ['superadmin', 'admin', 'manager', 'editor', 'financial', 'support'].includes(userRole);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header className={`sticky top-0 z-50 ${darkMode ? 'bg-[#0b0011]' : 'bg-white'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} transition-colors`}>
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#b62bff] to-[#ff6a00] rounded-lg flex items-center justify-center">
              <i className="ri-store-3-line text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
              JokaTech
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors whitespace-nowrap`}
            >
              Início
            </Link>
            <Link 
              to="/category" 
              className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors whitespace-nowrap`}
            >
              Produtos
            </Link>
            <Link 
              to="/services" 
              className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors whitespace-nowrap`}
            >
              Serviços
            </Link>
            <Link 
              to="/about" 
              className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors whitespace-nowrap`}
            >
              Sobre Nós
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors whitespace-nowrap`}
            >
              Contacto
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
              } flex items-center justify-center transition-colors cursor-pointer`}
              aria-label="Alternar tema"
            >
              <i className={`${darkMode ? 'ri-sun-line' : 'ri-moon-line'} text-xl ${
                darkMode ? 'text-yellow-400' : 'text-gray-700'
              }`}></i>
            </button>

            {/* Favoritos */}
            <Link
              to="/favorites"
              className={`relative w-10 h-10 rounded-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
              } flex items-center justify-center transition-colors cursor-pointer`}
              aria-label={`Favoritos com ${favoritesCount} itens`}
            >
              <i className={`ri-heart-line text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className={`relative w-10 h-10 rounded-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
              } flex items-center justify-center transition-colors cursor-pointer`}
              aria-label={`Carrinho com ${cartItemsCount} itens`}
            >
              <i className={`ri-shopping-cart-line text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#b62bff] to-[#ff6a00] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className={`w-10 h-10 rounded-lg ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  } flex items-center justify-center transition-colors cursor-pointer`}
                  aria-label="Menu do utilizador"
                  disabled={isLoading}
                >
                  {userProfile?.avatar_url ? (
                    <img 
                      src={userProfile.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '';
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {!userProfile?.avatar_url && (
                    <i className={`ri-user-line text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUserMenu(false);
                      }}
                    ></div>
                    <div className={`absolute right-0 mt-2 w-72 rounded-xl shadow-2xl ${
                      darkMode ? 'bg-[#170018] border-gray-800' : 'bg-white border-gray-200'
                    } border overflow-hidden z-50`}>
                      {/* User Info */}
                      <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#b62bff] to-[#ff6a00] rounded-full flex items-center justify-center">
                            {userProfile?.avatar_url ? (
                              <img 
                                src={userProfile.avatar_url} 
                                alt="Avatar" 
                                className="w-full h-full rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '';
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement?.classList.add('bg-gradient-to-br');
                                  e.currentTarget.parentElement?.classList.add('from-[#b62bff]', 'to-[#ff6a00]');
                                  const icon = document.createElement('i');
                                  icon.className = 'ri-user-line text-white text-xl';
                                  e.currentTarget.parentElement?.appendChild(icon);
                                }}
                              />
                            ) : (
                              <i className="ri-user-line text-white text-xl"></i>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {userProfile?.full_name || user?.email?.split('@')[0] || 'Utilizador'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/profile');
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                            darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                          } transition-colors cursor-pointer`}
                        >
                          <i className="ri-user-settings-line text-lg"></i>
                          <span>Meu Perfil</span>
                        </button>

                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/admin');
                              setShowUserMenu(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                              darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                            } transition-colors cursor-pointer`}
                          >
                            <i className="ri-dashboard-line text-lg"></i>
                            <span>Dashboard Admin</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogout();
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                            darkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                          } transition-colors cursor-pointer`}
                        >
                          <i className="ri-logout-box-line text-lg"></i>
                          <span>Terminar Sessão</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white font-medium rounded-lg hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
