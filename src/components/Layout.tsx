import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './feature/Header';
import Footer from './feature/Footer';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout() {
  const { darkMode } = useTheme();
  const location = useLocation();

  // Garantir scroll ao topo em cada mudança de rota
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Scroll instantâneo para melhor performance
    });
  }, [location.pathname]);

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#0b0011] text-white' : 'bg-white text-gray-900'}`}>
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin"></div>
                <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  A carregar...
                </p>
              </div>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
