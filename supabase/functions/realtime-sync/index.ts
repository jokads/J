// ============================================
// SUPABASE EDGE FUNCTION - REALTIME SYNC
// ============================================
// Esta função gerencia sincronização em tempo real
// entre dashboard admin e site público

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncEvent {
  type: 'product_update' | 'order_created' | 'customer_created' | 'note_created' | 'stock_update' | 'price_update';
  data: any;
  timestamp: string;
  user_id?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, action, data } = await req.json();

    console.log('🔄 Sync Event:', { type, action, data });

    let result;

    switch (type) {
      case 'product':
        result = await handleProductSync(supabase, action, data);
        break;
      
      case 'order':
        result = await handleOrderSync(supabase, action, data);
        break;
      
      case 'customer':
        result = await handleCustomerSync(supabase, action, data);
        break;
      
      case 'note':
        result = await handleNoteSync(supabase, action, data);
        break;
      
      case 'custom_pc':
        result = await handleCustomPCSync(supabase, action, data);
        break;
      
      default:
        throw new Error(`Tipo de sincronização desconhecido: ${type}`);
    }

    // Log de auditoria
    await supabase.from('sync_logs').insert({
      event_type: type,
      action: action,
      data: data,
      timestamp: new Date().toISOString(),
      user_id: data.user_id || null,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        result,
        message: 'Sincronização realizada com sucesso'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('❌ Erro na sincronização:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// ============================================
// HANDLERS DE SINCRONIZAÇÃO
// ============================================

async function handleProductSync(supabase: any, action: string, data: any) {
  switch (action) {
    case 'create':
      const { data: newProduct, error: createError } = await supabase
        .from('products')
        .insert(data)
        .select()
        .single();
      
      if (createError) throw createError;
      return { product: newProduct, broadcast: 'new_product' };
    
    case 'update':
      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update(data.updates)
        .eq('id', data.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      return { product: updatedProduct, broadcast: 'product_updated' };
    
    case 'delete':
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', data.id);
      
      if (deleteError) throw deleteError;
      return { product_id: data.id, broadcast: 'product_deleted' };
    
    case 'update_stock':
      const { data: stockProduct, error: stockError } = await supabase
        .from('products')
        .update({ stock: data.stock, updated_at: new Date().toISOString() })
        .eq('id', data.id)
        .select()
        .single();
      
      if (stockError) throw stockError;
      return { product: stockProduct, broadcast: 'stock_updated' };
    
    case 'update_price':
      const { data: priceProduct, error: priceError } = await supabase
        .from('products')
        .update({ price: data.price, updated_at: new Date().toISOString() })
        .eq('id', data.id)
        .select()
        .single();
      
      if (priceError) throw priceError;
      return { product: priceProduct, broadcast: 'price_updated' };
    
    default:
      throw new Error(`Ação de produto desconhecida: ${action}`);
  }
}

async function handleOrderSync(supabase: any, action: string, data: any) {
  switch (action) {
    case 'create':
      const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert(data)
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Atualizar níveis do cliente
      await updateCustomerLevel(supabase, data.user_email, parseFloat(data.total_amount));
      
      return { order: newOrder, broadcast: 'new_order' };
    
    case 'update_status':
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: data.status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', data.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      return { order: updatedOrder, broadcast: 'order_status_updated' };
    
    default:
      throw new Error(`Ação de pedido desconhecida: ${action}`);
  }
}

async function handleCustomerSync(supabase: any, action: string, data: any) {
  switch (action) {
    case 'create':
      const { data: newCustomer, error: createError } = await supabase
        .from('customer_profiles')
        .insert(data)
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Criar nível inicial do cliente
      await supabase.from('customer_levels').insert({
        user_id: newCustomer.id,
        level: 1,
        current_xp: 0,
        xp_to_next_level: 100,
        total_purchases: 0,
        total_spent: 0,
        positive_reviews: 0,
        discount_percentage: 0,
      });
      
      return { customer: newCustomer, broadcast: 'new_customer' };
    
    case 'update':
      const { data: updatedCustomer, error: updateError } = await supabase
        .from('customer_profiles')
        .update(data.updates)
        .eq('id', data.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      return { customer: updatedCustomer, broadcast: 'customer_updated' };
    
    default:
      throw new Error(`Ação de cliente desconhecida: ${action}`);
  }
}

async function handleNoteSync(supabase: any, action: string, data: any) {
  switch (action) {
    case 'create':
      const { data: newNote, error: createError } = await supabase
        .from('admin_notes')
        .insert({
          author_email: data.author_email,
          author_name: data.author_name,
          message: data.message,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (createError) throw createError;
      return { note: newNote, broadcast: 'new_note' };
    
    case 'delete':
      const { error: deleteError } = await supabase
        .from('admin_notes')
        .delete()
        .eq('id', data.id);
      
      if (deleteError) throw deleteError;
      return { note_id: data.id, broadcast: 'note_deleted' };
    
    default:
      throw new Error(`Ação de nota desconhecida: ${action}`);
  }
}

async function handleCustomPCSync(supabase: any, action: string, data: any) {
  switch (action) {
    case 'create':
      const { data: newRequest, error: createError } = await supabase
        .from('custom_pc_requests')
        .insert(data)
        .select()
        .single();
      
      if (createError) throw createError;
      return { request: newRequest, broadcast: 'new_custom_pc_request' };
    
    case 'update_status':
      const { data: updatedRequest, error: updateError } = await supabase
        .from('custom_pc_requests')
        .update({ 
          status: data.status,
          admin_notes: data.admin_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      return { request: updatedRequest, broadcast: 'custom_pc_request_updated' };
    
    default:
      throw new Error(`Ação de PC personalizado desconhecida: ${action}`);
  }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

async function updateCustomerLevel(supabase: any, userEmail: string, orderAmount: number) {
  // Buscar ou criar nível do cliente
  const { data: profile } = await supabase
    .from('customer_profiles')
    .select('id')
    .eq('email', userEmail)
    .single();
  
  if (!profile) return;
  
  const { data: level } = await supabase
    .from('customer_levels')
    .select('*')
    .eq('user_id', profile.id)
    .single();
  
  if (!level) {
    // Criar nível inicial
    await supabase.from('customer_levels').insert({
      user_id: profile.id,
      level: 1,
      current_xp: Math.floor(orderAmount * 10),
      xp_to_next_level: 100,
      total_purchases: 1,
      total_spent: orderAmount,
      positive_reviews: 0,
      discount_percentage: 0,
    });
  } else {
    // Atualizar nível existente
    const newXP = level.current_xp + Math.floor(orderAmount * 10);
    const newTotalPurchases = level.total_purchases + 1;
    const newTotalSpent = level.total_spent + orderAmount;
    
    let newLevel = level.level;
    let remainingXP = newXP;
    let xpToNext = level.xp_to_next_level;
    
    // Calcular novos níveis
    while (remainingXP >= xpToNext && newLevel < 50) {
      remainingXP -= xpToNext;
      newLevel++;
      xpToNext = newLevel * 100;
    }
    
    // Calcular desconto baseado no nível
    let discount = 0;
    if (newLevel >= 5 && newLevel < 10) discount = 5;
    else if (newLevel >= 10 && newLevel < 20) discount = 10;
    else if (newLevel >= 20 && newLevel < 30) discount = 15;
    else if (newLevel >= 30 && newLevel < 40) discount = 20;
    else if (newLevel >= 40) discount = 25;
    
    await supabase
      .from('customer_levels')
      .update({
        level: newLevel,
        current_xp: remainingXP,
        xp_to_next_level: xpToNext,
        total_purchases: newTotalPurchases,
        total_spent: newTotalSpent,
        discount_percentage: discount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', profile.id);
  }
}