import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase com service_role para bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verificar autenticação do usuário
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Token não fornecido');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token de autenticação não fornecido' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Buscar usuário pelo token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Erro de autenticação:', authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token inválido ou expirado' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    console.log('✅ Usuário autenticado:', user.id, user.email);

    // Verificar se o perfil já existe
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (existingProfile) {
      console.log('✅ Perfil já existe, retornando perfil existente');
      return new Response(
        JSON.stringify({ 
          success: true, 
          profile: existingProfile,
          message: 'Perfil recuperado com sucesso'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log('📝 Criando novo perfil para usuário:', user.id);

    // Criar novo perfil com TODOS os campos necessários
    const newProfile = {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      avatar_url: user.user_metadata?.avatar_url || null,
      phone: user.user_metadata?.phone || null,
      address: null,
      city: null,
      state: null,
      zip_code: null,
      country: 'Portugal',
      is_admin: false,
      is_super_admin: false,
      is_seller: false,
      seller_approved: false,
      seller_company_name: null,
      seller_description: null,
      seller_phone: null,
      seller_address: null,
      total_spent: 0,
      total_orders: 0,
      loyalty_points: 0,
      vip_level: 'Bronze',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('📋 Dados do novo perfil:', JSON.stringify(newProfile, null, 2));

    const { data: createdProfile, error: createError } = await supabaseAdmin
      .from('perfis')
      .insert([newProfile])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar perfil:', createError);
      console.error('❌ Código:', createError.code);
      console.error('❌ Mensagem:', createError.message);
      console.error('❌ Detalhes:', createError.details);
      
      // Se for erro de duplicação (perfil já existe), buscar o perfil
      if (createError.code === '23505') {
        console.log('⚠️ Perfil já existe (duplicação detectada), buscando...');
        
        const { data: duplicateProfile, error: fetchError } = await supabaseAdmin
          .from('perfis')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (fetchError) {
          console.error('❌ Erro ao buscar perfil duplicado:', fetchError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Erro ao recuperar perfil existente',
              details: fetchError.message
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          );
        }
        
        console.log('✅ Perfil duplicado encontrado e retornado');
        return new Response(
          JSON.stringify({ 
            success: true, 
            profile: duplicateProfile,
            message: 'Perfil recuperado com sucesso'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
      
      // Outro tipo de erro - tentar buscar o perfil mesmo assim
      console.log('⚠️ Tentando buscar perfil existente após erro...');
      const { data: fallbackProfile, error: fallbackError } = await supabaseAdmin
        .from('perfis')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (fallbackProfile) {
        console.log('✅ Perfil encontrado após erro, retornando...');
        return new Response(
          JSON.stringify({ 
            success: true, 
            profile: fallbackProfile,
            message: 'Perfil recuperado com sucesso'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
      
      // Erro real - retornar erro detalhado
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: createError.message || 'Erro ao criar perfil',
          code: createError.code,
          details: createError.details || 'Sem detalhes adicionais'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log('✅ Perfil criado com sucesso:', createdProfile.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        profile: createdProfile,
        message: 'Perfil criado com sucesso'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201 
      }
    );

  } catch (error) {
    console.error('❌ Erro crítico na Edge Function:', error);
    console.error('❌ Stack trace:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor ao criar perfil',
        details: error.stack || 'Sem stack trace'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});