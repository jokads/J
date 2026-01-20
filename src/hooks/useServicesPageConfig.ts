import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/queryClient';

interface HeroConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  metadata: {
    stats: Array<{ icon: string; value: string; label: string }>;
    buttons: Array<{ text: string; icon: string; link: string; type: string }>;
  };
}

interface FilterOption {
  id: string;
  value: string;
  label: string;
  icon: string;
  display_order: number;
}

// Hook para carregar configuração do Hero
export function useServicesHeroConfig() {
  return useQuery({
    queryKey: queryKeys.servicesPageConfig.hero,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services_page_config')
        .select('*')
        .eq('section_type', 'hero')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as HeroConfig;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para carregar filtros (categorias, preços, prazos)
export function useServicesFilters(type: 'filter_category' | 'filter_price' | 'filter_delivery') {
  return useQuery({
    queryKey: queryKeys.servicesPageConfig.filters(type),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services_page_config')
        .select('*')
        .eq('section_type', type)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as FilterOption[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para atualizar configuração do Hero
export function useUpdateServicesHeroConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<HeroConfig>) => {
      const { data, error } = await supabase
        .from('services_page_config')
        .update(config)
        .eq('section_type', 'hero')
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar cache para recarregar dados
      queryClient.invalidateQueries({ queryKey: queryKeys.servicesPageConfig.hero });
    },
  });
}

// Hook para adicionar/atualizar filtro
export function useUpsertServicesFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      type, 
      data 
    }: { 
      id?: string; 
      type: 'filter_category' | 'filter_price' | 'filter_delivery'; 
      data: Partial<FilterOption> 
    }) => {
      if (id) {
        // Atualizar existente
        const { data: result, error } = await supabase
          .from('services_page_config')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return result;
      } else {
        // Criar novo
        const { data: result, error } = await supabase
          .from('services_page_config')
          .insert({ ...data, section_type: type })
          .select()
          .single();

        if (error) throw error;
        return result;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidar cache do tipo específico
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.servicesPageConfig.filters(variables.type) 
      });
    },
  });
}

// Hook para deletar filtro
export function useDeleteServicesFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      const { error } = await supabase
        .from('services_page_config')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, type };
    },
    onSuccess: (data) => {
      // Invalidar cache do tipo específico
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.servicesPageConfig.filters(data.type) 
      });
    },
  });
}
