import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const { items, customerInfo, successUrl, cancelUrl } = await req.json();

    console.log('📦 Criando sessão Stripe...');
    console.log('🛍️ Itens:', items.length);
    console.log('👤 Cliente:', customerInfo.email);

    // Criar line items para o Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: item.description || '',
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Criar sessão de checkout Stripe
    // IMPORTANTE: Desabilitar Link e forçar checkout limpo
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // APENAS CARTÕES - SEM LINK
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerInfo.email,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['LU', 'FR', 'BE', 'NL', 'DE', 'IT', 'GB', 'SE'],
      },
      phone_number_collection: {
        enabled: true,
      },
      // DESABILITAR LINK COMPLETAMENTE
      payment_method_options: {
        card: {
          setup_future_usage: undefined, // NÃO salvar cartão
        },
      },
      // NÃO permitir salvar informações de pagamento
      consent_collection: undefined,
      // Forçar entrada manual de dados
      customer_creation: 'always',
      metadata: {
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        shipping_address: customerInfo.address,
      },
    });

    console.log('✅ Sessão criada:', session.id);
    console.log('🔗 URL:', session.url);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('❌ Erro:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao criar sessão de pagamento',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});