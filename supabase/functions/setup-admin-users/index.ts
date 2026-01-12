import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('🚀 Iniciando criação de usuários admin...');

    // Usuários a serem criados
    const users = [
      {
        email: 'damasclaudio2@gmail.com',
        password: 'ThugParadise616#',
        full_name: 'Claudio Damas',
        is_super_admin: true,
        is_admin: true,
        is_seller: false,
        level: 50
      },
      {
        email: 'marianapesimoes@gmail.com',
        password: 'MariaSol2025#',
        full_name: 'Mariana Pesimoes',
        is_super_admin: false,
        is_admin: true,
        is_seller: false,
        level: 50
      },
      {
        email: 'jokadamas616@gmail.com',
        password: '123456',
        full_name: 'Vendedor Teste',
        is_super_admin: false,
        is_admin: false,
        is_seller: true,
        level: 50
      },
      {
        email: 'jokadas69@gmail.com',
        password: '123456',
        full_name: 'Cliente Teste',
        is_super_admin: false,
        is_admin: false,
        is_seller: false,
        level: 50
      }
    ];

    const results = [];

    for (const userData of users) {
      try {
        console.log(`📧 Criando usuário: ${userData.email}`);

        // 1. Verificar se usuário já existe no Auth
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === userData.email);

        let userId;

        if (existingUser) {
          console.log(`✅ Usuário já existe no Auth: ${userData.email}`);
          userId = existingUser.id;

          // Atualizar senha se necessário
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: userData.password,
            email_confirm: true
          });
        } else {
          // 2. Criar usuário no Supabase Auth
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true, // Confirmar email automaticamente
            user_metadata: {
              full_name: userData.full_name
            }
          });

          if (authError) {
            console.error(`❌ Erro ao criar usuário no Auth: ${userData.email}`, authError);
            results.push({
              email: userData.email,
              success: false,
              error: authError.message
            });
            continue;
          }

          userId = authData.user.id;
          console.log(`✅ Usuário criado no Auth: ${userData.email} (ID: ${userId})`);
        }

        // 3. Verificar se perfil já existe
        const { data: existingProfile } = await supabaseAdmin
          .from('perfis')
          .select('id')
          .eq('id', userId)
          .single();

        if (existingProfile) {
          // Atualizar perfil existente
          const { error: updateError } = await supabaseAdmin
            .from('perfis')
            .update({
              email: userData.email,
              full_name: userData.full_name,
              is_super_admin: userData.is_super_admin,
              is_admin: userData.is_admin,
              is_seller: userData.is_seller,
              is_verified: true,
              level: userData.level,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (updateError) {
            console.error(`❌ Erro ao atualizar perfil: ${userData.email}`, updateError);
            results.push({
              email: userData.email,
              success: false,
              error: updateError.message
            });
            continue;
          }

          console.log(`✅ Perfil atualizado: ${userData.email}`);
        } else {
          // Criar novo perfil
          const { error: profileError } = await supabaseAdmin
            .from('perfis')
            .insert({
              id: userId,
              email: userData.email,
              full_name: userData.full_name,
              is_super_admin: userData.is_super_admin,
              is_admin: userData.is_admin,
              is_seller: userData.is_seller,
              is_verified: true,
              level: userData.level,
              total_spent: 0,
              country: 'Portugal',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (profileError) {
            console.error(`❌ Erro ao criar perfil: ${userData.email}`, profileError);
            results.push({
              email: userData.email,
              success: false,
              error: profileError.message
            });
            continue;
          }

          console.log(`✅ Perfil criado: ${userData.email}`);
        }

        results.push({
          email: userData.email,
          success: true,
          userId: userId,
          is_super_admin: userData.is_super_admin,
          is_admin: userData.is_admin,
          is_seller: userData.is_seller
        });

      } catch (error) {
        console.error(`❌ Erro ao processar usuário: ${userData.email}`, error);
        results.push({
          email: userData.email,
          success: false,
          error: error.message
        });
      }
    }

    console.log('✅ Processo concluído!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuários criados/atualizados com sucesso!',
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});