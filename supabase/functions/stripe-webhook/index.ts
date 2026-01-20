import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey) {
      throw new Error('Stripe não configurado');
    }

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse evento do Stripe
    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      throw new Error('Payload inválido');
    }

    console.log('Webhook recebido:', event.type);

    // Processar eventos
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.order_id;

        if (orderId) {
          // Atualizar pedido
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'processing',
              paid_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

          // Atualizar transação
          await supabase
            .from('financial_transactions')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('stripe_payment_intent_id', paymentIntent.id);

          // Reduzir estoque dos produtos
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('product_id, quantity')
            .eq('order_id', orderId);

          if (orderItems) {
            for (const item of orderItems) {
              await supabase.rpc('decrement_product_stock', {
                product_id: item.product_id,
                quantity: item.quantity
              });
            }
          }

          // Log de auditoria
          await supabase.from('audit_logs').insert({
            action: 'payment_succeeded',
            entity_type: 'order',
            entity_id: orderId,
            details: {
              payment_intent_id: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency
            },
            created_at: new Date().toISOString()
          });

          console.log('Pagamento confirmado para pedido:', orderId);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.order_id;

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

          await supabase
            .from('financial_transactions')
            .update({
              status: 'failed',
              failed_at: new Date().toISOString()
            })
            .eq('stripe_payment_intent_id', paymentIntent.id);

          await supabase.from('audit_logs').insert({
            action: 'payment_failed',
            entity_type: 'order',
            entity_id: orderId,
            details: {
              payment_intent_id: paymentIntent.id,
              error: paymentIntent.last_payment_error?.message
            },
            created_at: new Date().toISOString()
          });

          console.log('Pagamento falhou para pedido:', orderId);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;

        const { data: transaction } = await supabase
          .from('financial_transactions')
          .select('order_id')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .single();

        if (transaction) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'refunded',
              status: 'refunded',
              updated_at: new Date().toISOString()
            })
            .eq('id', transaction.order_id);

          await supabase.from('refunds').insert({
            order_id: transaction.order_id,
            amount: charge.amount_refunded / 100,
            reason: 'Reembolso via Stripe',
            status: 'completed',
            stripe_refund_id: charge.refunds.data[0]?.id,
            created_at: new Date().toISOString()
          });

          await supabase.from('audit_logs').insert({
            action: 'payment_refunded',
            entity_type: 'order',
            entity_id: transaction.order_id,
            details: {
              charge_id: charge.id,
              amount: charge.amount_refunded / 100
            },
            created_at: new Date().toISOString()
          });

          console.log('Reembolso processado para pedido:', transaction.order_id);
        }
        break;
      }

      default:
        console.log('Evento não tratado:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Webhook Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});