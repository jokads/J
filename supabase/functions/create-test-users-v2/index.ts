import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('🚀 Criando usuários de teste...');

    // Usuários de teste
    const testUsers = [
      {
        email: 'admin@jokatech.com',
        password: 'admin123',
        full_name: 'Admin JokaTech',
        is_admin: true,
        is_super_admin: true,
        is_seller: false,
      },
      {
        email: 'vendedor@jokatech.com',
        password: 'vendedor123',
        full_name: 'Vendedor Teste',
        is_admin: false,
        is_super_admin: false,
        is_seller: true,
        seller_approved: true,
      },
      {
        email: 'cliente@jokatech.com',
        password: 'cliente123',
        full_name: 'Cliente Teste',
        is_admin: false,
        is_super_admin: false,
        is_seller: false,
      },
      {
        email: 'joka2dms616@gmail.com',
        password: 'joka123456',
        full_name: 'Joka Owner',
        is_admin: true,
        is_super_admin: true,
        is_seller: true,
        seller_approved: true,
      },
    ];

    const results = [];

    for (const user of testUsers) {
      try {
        console.log(`📝 Criando usuário: ${user.email}`);

        // Verificar se o usuário já existe
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
        const userExists = existingUser?.users?.find((u) => u.email === user.email);

        let userId: string;

        if (userExists) {
          console.log(`⚠️ Usuário ${user.email} já existe, atualizando...`);
          userId = userExists.id;

          // Atualizar senha
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: user.password,
            email_confirm: true,
          });
        } else {
          // Criar novo usuário
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
              full_name: user.full_name,
            },
          });

          if (authError) {
            console.error(`❌ Erro ao criar ${user.email}:`, authError);
            results.push({ email: user.email, status: 'error', error: authError.message });
            continue;
          }

          userId = authData.user.id;
          console.log(`✅ Usuário criado: ${user.email} (${userId})`);
        }

        // Verificar se o perfil já existe
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
              email: user.email,
              full_name: user.full_name,
              is_admin: user.is_admin,
              is_super_admin: user.is_super_admin,
              is_seller: user.is_seller,
              seller_approved: user.seller_approved || false,
              is_verified: true,
              level: 1,
              total_spent: 0,
            })
            .eq('id', userId);

          if (updateError) {
            console.error(`❌ Erro ao atualizar perfil de ${user.email}:`, updateError);
          } else {
            console.log(`✅ Perfil atualizado: ${user.email}`);
          }
        } else {
          // Criar novo perfil
          const { error: profileError } = await supabaseAdmin
            .from('perfis')
            .insert([
              {
                id: userId,
                email: user.email,
                full_name: user.full_name,
                is_admin: user.is_admin,
                is_super_admin: user.is_super_admin,
                is_seller: user.is_seller,
                seller_approved: user.seller_approved || false,
                is_verified: true,
                level: 1,
                total_spent: 0,
              },
            ]);

          if (profileError) {
            console.error(`❌ Erro ao criar perfil de ${user.email}:`, profileError);
          } else {
            console.log(`✅ Perfil criado: ${user.email}`);
          }
        }

        results.push({
          email: user.email,
          status: 'success',
          role: user.is_admin ? 'admin' : user.is_seller ? 'vendedor' : 'cliente',
        });
      } catch (error) {
        console.error(`❌ Erro ao processar ${user.email}:`, error);
        results.push({ email: user.email, status: 'error', error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '✅ Usuários de teste criados/atualizados com sucesso!',
        users: results,
        credentials: [
          { email: 'admin@jokatech.com', password: 'admin123', role: 'Admin' },
          { email: 'vendedor@jokatech.com', password: 'vendedor123', role: 'Vendedor' },
          { email: 'cliente@jokatech.com', password: 'cliente123', role: 'Cliente' },
          { email: 'joka2dms616@gmail.com', password: 'joka123456', role: 'Owner (Admin + Vendedor)' },
        ],
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
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});