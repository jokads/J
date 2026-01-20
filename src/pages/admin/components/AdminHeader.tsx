import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole: string;
}

export default function AdminHeader({ sidebarOpen, setSidebarOpen, userRole }: AdminHeaderProps) {
  const { user, signOut } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      superadmin: 'Super Administrador',
      admin: 'Administrador',
      manager: 'Gestor',
      editor: 'Editor',
      financial: 'Financeiro',
      support: 'Suporte'
    };
    return roles[role] || 'Utilizador';
  };

  return (
    <header className={`sticky top-0 z-40 ${darkMode ? 'bg-[#0b0011] border-gray-800' : 'bg-white border-gray-200'} border-b`}>
      <nav className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`w-10 h-10 rounded-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
              } flex items-center justify-center transition-colors cursor-pointer`}
            >
              <i className={`ri-menu-line text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#b62bff] to-[#ff6a00] rounded-lg flex items-center justify-center">
                <i className="ri-dashboard-line text-white text-lg"></i>
              </div>
              <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Dashboard Admin
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Ver Site Button */}
            <button
              onClick={() => navigate('/')}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gradient-to-r from-[#b62bff]/20 to-[#ff6a00]/20 hover:from-[#b62bff]/30 hover:to-[#ff6a00]/30 text-white border border-[#b62bff]/30' 
                  : 'bg-gradient-to-r from-[#b62bff]/10 to-[#ff6a00]/10 hover:from-[#b62bff]/20 hover:to-[#ff6a00]/20 text-gray-900 border border-[#b62bff]/20'
              } font-medium transition-all cursor-pointer whitespace-nowrap`}
            >
              <i className="ri-home-line text-lg"></i>
              <span>Ver Site</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`w-10 h-10 rounded-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
              } flex items-center justify-center transition-colors cursor-pointer`}
            >
              <i className={`${darkMode ? 'ri-sun-line' : 'ri-moon-line'} text-xl ${
                darkMode ? 'text-yellow-400' : 'text-gray-700'
              }`}></i>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-10 h-10 rounded-lg ${
                  darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                } flex items-center justify-center transition-colors cursor-pointer`}
              >
                <i className={`ri-user-line text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  ></div>
                  <div className={`absolute right-0 mt-2 w-72 rounded-xl shadow-2xl ${
                    darkMode ? 'bg-[#170018] border-gray-800' : 'bg-white border-gray-200'
                  } border overflow-hidden z-50`}>
                    {/* User Info */}
                    <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#b62bff] to-[#ff6a00] rounded-full flex items-center justify-center">
                          <i className="ri-user-line text-white text-xl"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user?.email}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {getRoleLabel(userRole)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={() => {
                          navigate('/');
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                          darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        } transition-colors cursor-pointer`}
                      >
                        <i className="ri-home-line text-lg"></i>
                        <span>Ver Site Público</span>
                      </button>

                      <button
                        onClick={handleLogout}
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
          </div>
        </div>
      </nav>
    </header>
  );
}
