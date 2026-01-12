// ============================================
// HOOK DE SINCRONIZAÇÃO EM TEMPO REAL
// ============================================
// Sistema completo de sincronização em tempo real
// usando Supabase Realtime com reconexão automática

import { useEffect, useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeConfig {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onChange?: (payload: any) => void;
}

export function useRealtimeSync(config: RealtimeConfig) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Criar canal de realtime único
    const channelName = `realtime:${config.table}:${Date.now()}`;
    const realtimeChannel = supabase.channel(channelName);

    // Configurar listener
    let subscription = realtimeChannel.on(
      'postgres_changes',
      {
        event: config.event || '*',
        schema: 'public',
        table: config.table,
        filter: config.filter,
      },
      (payload) => {
        console.log('🔄 Realtime update:', payload);
        setLastUpdate(new Date());

        // Chamar callbacks específicos
        if (payload.eventType === 'INSERT' && config.onInsert) {
          config.onInsert(payload.new);
        } else if (payload.eventType === 'UPDATE' && config.onUpdate) {
          config.onUpdate(payload.new);
        } else if (payload.eventType === 'DELETE' && config.onDelete) {
          config.onDelete(payload.old);
        }

        // Callback genérico
        if (config.onChange) {
          config.onChange(payload);
        }
      }
    );

    // Subscrever ao canal
    subscription.subscribe((status) => {
      console.log(`📡 Realtime status [${config.table}]:`, status);
      setIsConnected(status === 'SUBSCRIBED');
      
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Conectado ao realtime [${config.table}]`);
      }
    });

    setChannel(realtimeChannel);

    // Cleanup
    return () => {
      console.log(`🔌 Desconectando realtime [${config.table}]`);
      realtimeChannel.unsubscribe();
    };
  }, [config.table, config.event, config.filter]);

  return {
    isConnected,
    lastUpdate,
    channel,
  };
}

// ============================================
// HOOK PARA PRODUTOS
// ============================================
export function useRealtimeProducts(onUpdate?: (products: any[]) => void) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar produtos iniciais
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Carregando produtos do Supabase...');
      
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Erro ao buscar produtos:', fetchError);
        throw fetchError;
      }
      
      console.log(`✅ ${data?.length || 0} produtos carregados com sucesso`);
      setProducts(data || []);
      if (onUpdate) onUpdate(data || []);
    } catch (err: any) {
      console.error('❌ Erro ao carregar produtos:', err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Configurar realtime com callbacks otimizados
  useRealtimeSync({
    table: 'products',
    event: '*',
    onInsert: (newProduct) => {
      console.log('➕ Novo produto detectado via Realtime:', newProduct);
      setProducts((prev) => {
        // Verificar se o produto já existe
        const exists = prev.some(p => p.id === newProduct.id);
        if (exists) {
          console.log('⚠️ Produto já existe, ignorando duplicata');
          return prev;
        }
        
        const updated = [newProduct, ...prev];
        console.log(`✅ Produto adicionado à lista. Total: ${updated.length}`);
        if (onUpdate) onUpdate(updated);
        return updated;
      });
    },
    onUpdate: (updatedProduct) => {
      console.log('✏️ Produto atualizado via Realtime:', updatedProduct);
      setProducts((prev) => {
        const updated = prev.map((p) => 
          p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
        );
        console.log(`✅ Produto atualizado na lista`);
        if (onUpdate) onUpdate(updated);
        return updated;
      });
    },
    onDelete: (deletedProduct) => {
      console.log('🗑️ Produto deletado via Realtime:', deletedProduct);
      setProducts((prev) => {
        const updated = prev.filter((p) => p.id !== deletedProduct.id);
        console.log(`✅ Produto removido da lista. Total: ${updated.length}`);
        if (onUpdate) onUpdate(updated);
        return updated;
      });
    },
  });

  return { products, loading, error, refresh: loadProducts };
}

// ============================================
// HOOK PARA PEDIDOS
// ============================================
export function useRealtimeOrders(onUpdate?: (orders: any[]) => void) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setOrders(data || []);
      if (onUpdate) onUpdate(data || []);
      console.log('✅ Pedidos carregados:', data?.length);
    } catch (err: any) {
      console.error('❌ Erro ao carregar pedidos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useRealtimeSync({
    table: 'orders',
    event: '*',
    onInsert: (newOrder) => {
      console.log('🛒 Novo pedido criado:', newOrder);
      setOrders((prev) => {
        const updated = [newOrder, ...prev];
        if (onUpdate) onUpdate(updated);
        return updated;
      });
      
      // Notificação de novo pedido
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🛒 Novo Pedido!', {
          body: `Pedido #${newOrder.id.slice(0, 8)} - €${parseFloat(newOrder.total_amount).toFixed(2)}`,
          icon: '/favicon.ico',
        });
      }
    },
    onUpdate: (updatedOrder) => {
      console.log('📝 Pedido atualizado:', updatedOrder);
      setOrders((prev) => {
        const updated = prev.map((o) => 
          o.id === updatedOrder.id ? updatedOrder : o
        );
        if (onUpdate) onUpdate(updated);
        return updated;
      });
    },
  });

  return { orders, loading, error, refresh: loadOrders };
}

// ============================================
// HOOK PARA CLIENTES
// ============================================
export function useRealtimeCustomers(onUpdate?: (customers: any[]) => void) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('customer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setCustomers(data || []);
      if (onUpdate) onUpdate(data || []);
      console.log('✅ Clientes carregados:', data?.length);
    } catch (err: any) {
      console.error('❌ Erro ao carregar clientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useRealtimeSync({
    table: 'customer_profiles',
    event: '*',
    onInsert: (newCustomer) => {
      console.log('👤 Novo cliente adicionado:', newCustomer);
      setCustomers((prev) => {
        const updated = [newCustomer, ...prev];
        if (onUpdate) onUpdate(updated);
        return updated;
      });
    },
    onUpdate: (updatedCustomer) => {
      console.log('✏️ Cliente atualizado:', updatedCustomer);
      setCustomers((prev) => {
        const updated = prev.map((c) => 
          c.id === updatedCustomer.id ? updatedCustomer : c
        );
        if (onUpdate) onUpdate(updated);
        return updated;
      });
    },
  });

  return { customers, loading, error, refresh: loadCustomers };
}

// ============================================
// HOOK PARA NÍVEIS DE CLIENTES
// ============================================
export function useRealtimeCustomerLevels(onUpdate?: (levels: any[]) => void) {
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLevels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('customer_levels')
        .select('*')
        .order('level', { ascending: false });

      if (fetchError) throw fetchError;
      
      setLevels(data || []);
      if (onUpdate) onUpdate(data || []);
      console.log('✅ Níveis carregados:', data?.length);
    } catch (err: any) {
      console.error('❌ Erro ao carregar níveis:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  useEffect(() => {
    loadLevels();
  }, [loadLevels]);

  useRealtimeSync({
    table: 'customer_levels',
    event: '*',
    onInsert: (newLevel) => {
      console.log('⭐ Novo nível criado:', newLevel);
      setLevels((prev) => {
        const updated = [newLevel, ...prev];
        if (onUpdate) onUpdate(updated);
        return updated;
      });
    },
    onUpdate: (updatedLevel) => {
      console.log('📊 Nível atualizado:', updatedLevel);
      setLevels((prev) => {
        const updated = prev.map((l) => 
          l.id === updatedLevel.id ? updatedLevel : l
        );
        if (onUpdate) onUpdate(updated);
        return updated;
      });
    },
  });

  return { levels, loading, error, refresh: loadLevels };
}

// ============================================
// HOOK PARA NOTAS DE ADMIN
// ============================================
export function useRealtimeNotes(onUpdate?: (notes: any[]) => void) {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('admin_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setNotes(data || []);
      if (onUpdate) onUpdate(data || []);
      console.log('✅ Notas carregadas:', data?.length);
    } catch (err: any) {
      console.error('❌ Erro ao carregar notas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useRealtimeSync({
    table: 'admin_notes',
    event: '*',
    onInsert: (newNote) => {
      console.log('📝 Nova nota adicionada:', newNote);
      setNotes((prev) => {
        const updated = [newNote, ...prev];
        if (onUpdate) onUpdate(updated);
        return updated;
      });
    },
    onDelete: (deletedNote) => {
      console.log('🗑️ Nota deletada:', deletedNote);
      setNotes((prev) => {
        const updated = prev.filter((n) => n.id !== deletedNote.id);
        if (onUpdate) onUpdate(updated);
        return updated;
      });
    },
  });

  const addNote = async (message: string, authorEmail: string, authorName: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_notes')
        .insert({
          message,
          author_email: authorEmail,
          author_name: authorName,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Nota adicionada com sucesso');
      return { success: true, note: data };
    } catch (error: any) {
      console.error('❌ Erro ao adicionar nota:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      console.log('✅ Nota deletada com sucesso');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erro ao deletar nota:', error);
      return { success: false, error: error.message };
    }
  };

  return { notes, loading, error, refresh: loadNotes, addNote, deleteNote };
}

// ============================================
// HOOK PARA PEDIDOS DE PC PERSONALIZADO
// ============================================
export function useRealtimeCustomPCRequests(onUpdate?: (requests: any[]) => void) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('custom_pc_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setRequests(data || []);
      if (onUpdate) onUpdate(data || []);
      console.log('✅ Pedidos de PC carregados:', data?.length);
    } catch (err: any) {
      console.error('❌ Erro ao carregar pedidos de PC:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useRealtimeSync({
    table: 'custom_pc_requests',
    event: '*',
    onInsert: (newRequest) => {
      console.log('🖥️ Novo pedido de PC personalizado:', newRequest);
      setRequests((prev) => {
        const updated = [newRequest, ...prev];
        if (onUpdate) onUpdate(updated);
        return updated;
      });
      
      // Notificação
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🖥️ Novo Pedido de PC Personalizado!', {
          body: `Orçamento: €${newRequest.budget}`,
          icon: '/favicon.ico',
        });
      }
    },
    onUpdate: (updatedRequest) => {
      console.log('📝 Pedido de PC atualizado:', updatedRequest);
      setRequests((prev) => {
        const updated = prev.map((r) => 
          r.id === updatedRequest.id ? updatedRequest : r
        );
        if (onUpdate) onUpdate(updated);
        return updated;
      });
    },
  });

  const updateStatus = async (requestId: string, status: string, adminNotes?: string) => {
    try {
      const { data, error } = await supabase
        .from('custom_pc_requests')
        .update({ 
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Status do pedido de PC atualizado');
      return { success: true, request: data };
    } catch (error: any) {
      console.error('❌ Erro ao atualizar status:', error);
      return { success: false, error: error.message };
    }
  };

  return { requests, loading, error, refresh: loadRequests, updateStatus };
}
