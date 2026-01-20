import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function AdminLayout() {
  const { darkMode } = useTheme();
  const location = useLocation();

  // Garantir scroll ao topo em cada mudança de rota
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [location.pathname]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0b0011] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin"></div>
              <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                A carregar painel...
              </p>
            </div>
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </div>
  );
}
