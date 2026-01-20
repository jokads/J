import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Query Keys
export const serviceDetailKeys = {
  all: ['service-detail'] as const,
  detail: (slug: string) => [...serviceDetailKeys.all, slug] as const,
};

// Types
export interface ServiceDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  price_type: 'fixed' | 'custom' | 'from';
  category_id: string | null;
  features: string[];
  delivery_time: string;
  status: 'active' | 'inactive' | 'draft';
  images: string[];
  process_steps: ProcessStep[];
  
  // SEO
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  
  // CTA Customization
  whatsapp_message?: string;
  email_subject?: string;
  custom_cta_text?: string;
  custom_cta_url?: string;
  
  // Layout
  hero_layout?: 'default' | 'centered' | 'fullwidth';
  show_breadcrumb?: boolean;
  show_related_services?: boolean;
  related_services_ids?: string[];
  
  // Badge
  badge_text?: string;
  badge_color?: string;
  
  // Advanced Content
  testimonials?: Testimonial[];
  faqs?: FAQ[];
  packages?: ServicePackage[];
  gallery_images?: string[];
  video_url?: string;
  
  // Benefits Section
  benefits_title?: string;
  benefits_subtitle?: string;
  benefits?: Benefit[];
  
  // Statistics
  stats?: Stat[];
  
  created_at: string;
  updated_at: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar: string;
  rating: number;
  comment: string;
  date?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  price_type: 'fixed' | 'from';
  features: string[];
  highlighted: boolean;
  cta_text?: string;
  badge?: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  icon: string;
  order: number;
}

// Hook: Get Service Detail
export function useServiceDetail(slug: string | undefined) {
  return useQuery({
    queryKey: serviceDetailKeys.detail(slug || ''),
    queryFn: async () => {
      if (!slug) throw new Error('Slug is required');

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Service not found');

      return data as ServiceDetail;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook: Get Related Services
export function useRelatedServices(serviceId: string | undefined, categoryId: string | undefined) {
  return useQuery({
    queryKey: ['related-services', serviceId, categoryId],
    queryFn: async () => {
      if (!serviceId || !categoryId) return [];

      const { data, error } = await supabase
        .from('services')
        .select('id, name, slug, short_description, price, price_type, images')
        .eq('category_id', categoryId)
        .eq('status', 'active')
        .neq('id', serviceId)
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!serviceId && !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook: Update Service Detail
export function useUpdateServiceDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ServiceDetail> & { id: string }) => {
      const { id, ...updateData } = data;

      const { data: updated, error } = await supabase
        .from('services')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (data) => {
      // Invalidate all service queries
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: serviceDetailKeys.all });
      
      // Update specific service cache
      if (data.slug) {
        queryClient.setQueryData(serviceDetailKeys.detail(data.slug), data);
      }
    },
  });
}

// Hook: Add Testimonial
export function useAddTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, testimonial }: { serviceId: string; testimonial: Omit<Testimonial, 'id'> }) => {
      const { data: service, error: fetchError } = await supabase
        .from('services')
        .select('testimonials')
        .eq('id', serviceId)
        .single();

      if (fetchError) throw fetchError;

      const currentTestimonials = (service.testimonials as Testimonial[]) || [];
      const newTestimonial: Testimonial = {
        ...testimonial,
        id: crypto.randomUUID(),
      };

      const { data, error } = await supabase
        .from('services')
        .update({
          testimonials: [...currentTestimonials, newTestimonial],
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: serviceDetailKeys.all });
    },
  });
}

// Hook: Update Testimonial
export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, testimonial }: { serviceId: string; testimonial: Testimonial }) => {
      const { data: service, error: fetchError } = await supabase
        .from('services')
        .select('testimonials')
        .eq('id', serviceId)
        .single();

      if (fetchError) throw fetchError;

      const currentTestimonials = (service.testimonials as Testimonial[]) || [];
      const updatedTestimonials = currentTestimonials.map(t => 
        t.id === testimonial.id ? testimonial : t
      );

      const { data, error } = await supabase
        .from('services')
        .update({
          testimonials: updatedTestimonials,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: serviceDetailKeys.all });
    },
  });
}

// Hook: Delete Testimonial
export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, testimonialId }: { serviceId: string; testimonialId: string }) => {
      const { data: service, error: fetchError } = await supabase
        .from('services')
        .select('testimonials')
        .eq('id', serviceId)
        .single();

      if (fetchError) throw fetchError;

      const currentTestimonials = (service.testimonials as Testimonial[]) || [];
      const filteredTestimonials = currentTestimonials.filter(t => t.id !== testimonialId);

      const { data, error } = await supabase
        .from('services')
        .update({
          testimonials: filteredTestimonials,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: serviceDetailKeys.all });
    },
  });
}

// Similar hooks for FAQs, Packages, Benefits, Stats...
export function useAddFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, faq }: { serviceId: string; faq: Omit<FAQ, 'id'> }) => {
      const { data: service, error: fetchError } = await supabase
        .from('services')
        .select('faqs')
        .eq('id', serviceId)
        .single();

      if (fetchError) throw fetchError;

      const currentFAQs = (service.faqs as FAQ[]) || [];
      const newFAQ: FAQ = {
        ...faq,
        id: crypto.randomUUID(),
      };

      const { data, error } = await supabase
        .from('services')
        .update({
          faqs: [...currentFAQs, newFAQ],
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: serviceDetailKeys.all });
    },
  });
}

export function useUpdateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, faq }: { serviceId: string; faq: FAQ }) => {
      const { data: service, error: fetchError } = await supabase
        .from('services')
        .select('faqs')
        .eq('id', serviceId)
        .single();

      if (fetchError) throw fetchError;

      const currentFAQs = (service.faqs as FAQ[]) || [];
      const updatedFAQs = currentFAQs.map(f => f.id === faq.id ? faq : f);

      const { data, error } = await supabase
        .from('services')
        .update({
          faqs: updatedFAQs,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: serviceDetailKeys.all });
    },
  });
}

export function useDeleteFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, faqId }: { serviceId: string; faqId: string }) => {
      const { data: service, error: fetchError } = await supabase
        .from('services')
        .select('faqs')
        .eq('id', serviceId)
        .single();

      if (fetchError) throw fetchError;

      const currentFAQs = (service.faqs as FAQ[]) || [];
      const filteredFAQs = currentFAQs.filter(f => f.id !== faqId);

      const { data, error } = await supabase
        .from('services')
        .update({
          faqs: filteredFAQs,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: serviceDetailKeys.all });
    },
  });
}
