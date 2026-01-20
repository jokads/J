import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/queryClient';

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  image?: string;
  icon?: string;
  active: boolean;
  category: string;
  delivery_time?: string;
  features?: string[];
  created_at: string;
}

interface ServiceFilters {
  category?: string;
  priceRange?: string;
  deliveryTime?: string;
  search?: string;
}

// Hook para carregar todos os serviços com filtros
export function useServices(filters?: ServiceFilters) {
  return useQuery({
    queryKey: queryKeys.services.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      // Aplicar filtro de categoria
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      // Aplicar filtro de pesquisa
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      let services = data as Service[];

      // Filtro de preço (client-side)
      if (filters?.priceRange && filters.priceRange !== 'all') {
        const range = filters.priceRange.split('-');
        if (range.length === 2) {
          const min = parseInt(range[0]);
          const max = parseInt(range[1]);
          services = services.filter(s => s.price >= min && s.price <= max);
        } else if (filters.priceRange.endsWith('+')) {
          const min = parseInt(filters.priceRange.replace('+', ''));
          services = services.filter(s => s.price >= min);
        }
      }

      // Filtro de prazo (client-side)
      if (filters?.deliveryTime && filters.deliveryTime !== 'all') {
        const range = filters.deliveryTime.split('-');
        services = services.filter(s => {
          if (!s.delivery_time) return false;
          const days = parseInt(s.delivery_time);
          if (range.length === 2) {
            const min = parseInt(range[0]);
            const max = parseInt(range[1]);
            return days >= min && days <= max;
          } else if (filters.deliveryTime.endsWith('+')) {
            const min = parseInt(filters.deliveryTime.replace('+', ''));
            return days >= min;
          }
          return false;
        });
      }

      return services;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para carregar serviço específico
export function useService(slug: string) {
  return useQuery({
    queryKey: queryKeys.services.detail(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .single();

      if (error) throw error;
      return data as Service;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para criar/atualizar serviço
export function useUpsertService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: Partial<Service> }) => {
      if (id) {
        // Atualizar
        const { data: result, error } = await supabase
          .from('services')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return result;
      } else {
        // Criar
        const { data: result, error } = await supabase
          .from('services')
          .insert(data)
          .select()
          .single();

        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      // Invalidar todos os caches de serviços
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
}

// Hook para deletar serviço
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      // Invalidar todos os caches de serviços
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
}

// Hook para toggle status do serviço
export function useToggleServiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { data, error } = await supabase
        .from('services')
        .update({ active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar todos os caches de serviços
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
}
