import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ============================================
    // 1. VALIDAÇÃO DE CONFIGURAÇÃO
    // ============================================
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe não está configurado. Por favor, conecte o Stripe no dashboard.');
    }

    // ============================================
    // 2. PARSE E VALIDAÇÃO DOS DADOS
    // ============================================
    const {
      order_id,
      amount,
      currency = 'eur',
      payment_method,
      customer_email,
      customer_name,
      shipping_address,
      items
    } = await req.json();

    // Validações obrigatórias
    if (!order_id) {
      throw new Error('ID do pedido é obrigatório');
    }
    if (!amount || amount <= 0) {
      throw new Error('Valor do pedido inválido');
    }
    if (!customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
      throw new Error('Email inválido');
    }
    if (!customer_name || customer_name.trim().length < 3) {
      throw new Error('Nome do cliente inválido');
    }
    if (!shipping_address || !shipping_address.address || !shipping_address.city || !shipping_address.postal_code || !shipping_address.country) {
      throw new Error('Endereço de envio incompleto');
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Nenhum item no pedido');
    }

    // ============================================
    // 3. INICIALIZAR SUPABASE
    // ============================================
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase inválida');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ============================================
    // 4. VERIFICAR SE PEDIDO EXISTE
    // ============================================
    const { data: existingOrder, error: orderCheckError } = await supabase
      .from('orders')
      .select('id, payment_status, stripe_payment_intent')
      .eq('id', order_id)
      .single();

    if (orderCheckError) {
      throw new Error('Pedido não encontrado');
    }

    // Prevenir pagamento duplicado
    if (existingOrder.payment_status === 'paid' && existingOrder.stripe_payment_intent) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Pedido já foi pago anteriormente',
          payment_intent_id: existingOrder.stripe_payment_intent,
          status: 'succeeded'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // ============================================
    // 5. MAPEAR PAÍS PARA CÓDIGO ISO
    // ============================================
    const countryMap: { [key: string]: string } = {
      'Portugal': 'PT',
      'Brasil': 'BR',
      'Brazil': 'BR',
      'Espanha': 'ES',
      'Spain': 'ES',
      'França': 'FR',
      'France': 'FR',
      'Alemanha': 'DE',
      'Germany': 'DE',
      'Itália': 'IT',
      'Italy': 'IT',
      'Reino Unido': 'GB',
      'United Kingdom': 'GB',
      'Estados Unidos': 'US',
      'United States': 'US'
    };

    const countryCode = countryMap[shipping_address.country] || 'PT';

    // ============================================
    // 6. CRIAR CUSTOMER NO STRIPE (SE NÃO EXISTIR)
    // ============================================
    let customerId: string | null = null;

    // Verificar se já existe customer
    const searchCustomerResponse = await fetch(
      `https://api.stripe.com/v1/customers/search?query=email:'${encodeURIComponent(customer_email)}'`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
        },
      }
    );

    if (searchCustomerResponse.ok) {
      const searchResult = await searchCustomerResponse.json();
      if (searchResult.data && searchResult.data.length > 0) {
        customerId = searchResult.data[0].id;
      }
    }

    // Criar novo customer se não existir
    if (!customerId) {
      const createCustomerResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'email': customer_email,
          'name': customer_name,
          'address[line1]': shipping_address.address,
          'address[city]': shipping_address.city,
          'address[postal_code]': shipping_address.postal_code,
          'address[country]': countryCode,
          'metadata[order_id]': order_id,
        }).toString()
      });

      if (createCustomerResponse.ok) {
        const customerData = await createCustomerResponse.json();
        customerId = customerData.id;
      }
    }

    // ============================================
    // 7. CRIAR PAYMENT INTENT NO STRIPE
    // ============================================
    const paymentIntentParams = new URLSearchParams({
      'amount': Math.round(amount * 100).toString(),
      'currency': currency.toLowerCase(),
      'customer': customerId || '',
      'description': `Pedido #${order_id}`,
      'receipt_email': customer_email,
      'metadata[order_id]': order_id,
      'metadata[customer_name]': customer_name,
      'metadata[items_count]': items.length.toString(),
      'shipping[name]': customer_name,
      'shipping[phone]': shipping_address.phone || '',
      'shipping[address][line1]': shipping_address.address,
      'shipping[address][city]': shipping_address.city,
      'shipping[address][postal_code]': shipping_address.postal_code,
      'shipping[address][country]': countryCode,
      'automatic_payment_methods[enabled]': 'true',
    });

    const paymentIntentResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: paymentIntentParams.toString()
    });

    if (!paymentIntentResponse.ok) {
      const errorData = await paymentIntentResponse.text();
      console.error('Stripe Payment Intent Error:', errorData);
      throw new Error('Erro ao criar intenção de pagamento no Stripe');
    }

    const paymentIntent = await paymentIntentResponse.json();

    // ============================================
    // 8. ATUALIZAR PEDIDO COM PAYMENT INTENT
    // ============================================
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({
        stripe_payment_intent: paymentIntent.id,
        stripe_customer_id: customerId,
        payment_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id);

    if (updateOrderError) {
      console.error('Error updating order:', updateOrderError);
    }

    // ============================================
    // 9. REGISTRAR TRANSAÇÃO FINANCEIRA
    // ============================================
    await supabase.from('financial_transactions').insert({
      order_id,
      type: 'payment',
      amount,
      currency: currency.toLowerCase(),
      status: 'pending',
      payment_method: payment_method || 'card',
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: customerId,
      metadata: {
        customer_email,
        customer_name,
        shipping_address,
        items: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      },
      created_at: new Date().toISOString()
    });

    // ============================================
    // 10. CRIAR LOG DE AUDITORIA
    // ============================================
    await supabase.from('audit_logs').insert({
      action: 'payment_initiated',
      entity_type: 'order',
      entity_id: order_id,
      details: {
        payment_intent_id: paymentIntent.id,
        amount,
        currency,
        customer_email,
        status: paymentIntent.status
      },
      created_at: new Date().toISOString()
    });

    // ============================================
    // 11. RETORNAR SUCESSO
    // ============================================
    return new Response(
      JSON.stringify({
        success: true,
        payment_intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status,
        customer_id: customerId,
        amount: amount,
        currency: currency,
        message: 'Payment Intent criado com sucesso'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Payment Processing Error:', error);

    // Log de erro no Supabase
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('audit_logs').insert({
          action: 'payment_error',
          entity_type: 'order',
          entity_id: null,
          details: {
            error: error.message,
            stack: error.stack
          },
          created_at: new Date().toISOString()
        });
      }
    } catch (logError) {
      console.error('Error logging to audit:', logError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao processar pagamento. Por favor, tente novamente.',
        code: error.code || 'PAYMENT_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});