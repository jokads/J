import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from "./router";
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { queryClient } from './lib/queryClient';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Componente para scroll automático ao topo
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll suave para o topo ao mudar de página
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter basename={__BASE_PATH__}>
              <ScrollToTop />
              <AppRoutes />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
