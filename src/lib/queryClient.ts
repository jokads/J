import { QueryClient } from '@tanstack/react-query';

// Configuração otimizada do React Query para performance máxima
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Manter cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Revalidar ao focar na janela
      refetchOnWindowFocus: true,
      // Revalidar ao reconectar
      refetchOnReconnect: true,
      // Retry automático em caso de erro
      retry: 2,
      // Intervalo de retry
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry automático para mutations
      retry: 1,
    },
  },
});

// Chaves de query para organização
export const queryKeys = {
  // Serviços
  services: {
    all: ['services'] as const,
    list: (filters?: Record<string, unknown>) => ['services', 'list', filters] as const,
    detail: (slug: string) => ['services', 'detail', slug] as const,
  },
  // Configurações da página de serviços
  servicesPageConfig: {
    all: ['services-page-config'] as const,
    hero: ['services-page-config', 'hero'] as const,
    filters: (type: string) => ['services-page-config', 'filters', type] as const,
  },
  // Produtos
  products: {
    all: ['products'] as const,
    list: (filters?: Record<string, unknown>) => ['products', 'list', filters] as const,
    featured: ['products', 'featured'] as const,
    detail: (slug: string) => ['products', 'detail', slug] as const,
  },
  // Categorias
  categories: {
    all: ['categories'] as const,
    active: ['categories', 'active'] as const,
  },
  // Configurações da homepage
  homePageConfig: {
    all: ['home-page-config'] as const,
    hero: ['home-page-config', 'hero'] as const,
    carousels: ['home-page-config', 'carousels'] as const,
  },
};
