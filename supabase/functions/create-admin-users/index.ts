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

    console.log('🚀 Iniciando criação de usuários...');

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
        full_name: 'Mariana Simoes',
        is_super_admin: false,
        is_admin: true,
        is_seller: false,
        level: 50
      },
      {
        email: 'jokadamas616@gmail.com',
        password: '123456',
        full_name: 'Vendedor Test',
        is_super_admin: false,
        is_admin: false,
        is_seller: true,
        level: 50
      },
      {
        email: 'jokadas69@gmail.com',
        password: '123456',
        full_name: 'Cliente Test',
        is_super_admin: false,
        is_admin: false,
        is_seller: false,
        level: 50
      }
    ];

    const results = [];

    for (const user of users) {
      console.log(`📧 Criando usuário: ${user.email}`);

      // 1. Verificar se usuário já existe
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUser?.users?.find(u => u.email === user.email);

      let userId;

      if (userExists) {
        console.log(`✅ Usuário ${user.email} já existe, atualizando...`);
        userId = userExists.id;

        // Atualizar senha
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: user.password,
          email_confirm: true
        });
      } else {
        // 2. Criar usuário no auth.users
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            full_name: user.full_name
          }
        });

        if (authError) {
          console.error(`❌ Erro ao criar ${user.email}:`, authError);
          results.push({ email: user.email, status: 'error', error: authError.message });
          continue;
        }

        userId = authData.user.id;
        console.log(`✅ Usuário criado no auth: ${userId}`);
      }

      // 3. Criar/atualizar perfil
      const { error: profileError } = await supabaseAdmin
        .from('perfis')
        .upsert({
          id: userId,
          email: user.email,
          full_name: user.full_name,
          is_super_admin: user.is_super_admin,
          is_admin: user.is_admin,
          is_seller: user.is_seller,
          is_verified: true,
          level: user.level,
          total_spent: 0,
          country: 'Portugal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error(`❌ Erro ao criar perfil para ${user.email}:`, profileError);
        results.push({ email: user.email, status: 'error', error: profileError.message });
        continue;
      }

      console.log(`✅ Perfil criado/atualizado para ${user.email}`);
      results.push({ 
        email: user.email, 
        status: 'success',
        type: user.is_super_admin ? 'SUPER ADMIN' : user.is_admin ? 'ADMIN' : user.is_seller ? 'VENDEDOR' : 'CLIENTE'
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '✅ Usuários criados com sucesso!',
        results
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