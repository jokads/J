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
    console.log('🔧 Iniciando configuração completa...');

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

    // 1. Adicionar colunas que faltam na tabela perfis
    console.log('📋 Adicionando colunas na tabela perfis...');
    
    const alterTableSQL = `
      -- Adicionar colunas se não existirem
      DO $$ 
      BEGIN
        -- is_seller
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='is_seller') THEN
          ALTER TABLE perfis ADD COLUMN is_seller BOOLEAN DEFAULT false;
        END IF;
        
        -- is_verified
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='is_verified') THEN
          ALTER TABLE perfis ADD COLUMN is_verified BOOLEAN DEFAULT true;
        END IF;
        
        -- level
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='level') THEN
          ALTER TABLE perfis ADD COLUMN level INTEGER DEFAULT 1;
        END IF;
        
        -- total_spent
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfis' AND column_name='total_spent') THEN
          ALTER TABLE perfis ADD COLUMN total_spent DECIMAL(10,2) DEFAULT 0.00;
        END IF;
      END $$;
    `;

    // Executar SQL para adicionar colunas
    const { error: alterError } = await supabaseAdmin.rpc('exec_sql', { sql: alterTableSQL });
    if (alterError) {
      console.log('⚠️ Aviso ao adicionar colunas:', alterError.message);
    }

    // 2. Limpar usuários existentes
    console.log('🗑️ Limpando usuários existentes...');
    
    const emails = [
      'damasclaudio2@gmail.com',
      'marianapesimoes@gmail.com',
      'jokadamas616@gmail.com',
      'jokadas69@gmail.com'
    ];

    for (const email of emails) {
      // Deletar do auth
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === email);
      
      if (existingUser) {
        await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
      }
      
      // Deletar do perfis
      await supabaseAdmin.from('perfis').delete().eq('email', email);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Criar novos usuários
    console.log('👥 Criando novos usuários...');
    
    const users = [
      {
        email: 'damasclaudio2@gmail.com',
        password: 'ThugParadise616#',
        nome: 'Claudio Damas',
        is_super_admin: true,
        is_admin: true,
        is_seller: false,
        level: 50
      },
      {
        email: 'marianapesimoes@gmail.com',
        password: 'MariaSol2025#',
        nome: 'Mariana Pesimoes',
        is_super_admin: false,
        is_admin: true,
        is_seller: false,
        level: 50
      },
      {
        email: 'jokadamas616@gmail.com',
        password: '123456',
        nome: 'Vendedor Teste',
        is_super_admin: false,
        is_admin: false,
        is_seller: true,
        level: 50
      },
      {
        email: 'jokadas69@gmail.com',
        password: '123456',
        nome: 'Cliente Teste',
        is_super_admin: false,
        is_admin: false,
        is_seller: false,
        level: 50
      }
    ];

    const results = [];

    for (const userData of users) {
      try {
        console.log(`📧 Criando: ${userData.email}`);

        // Criar usuário no Auth com email confirmado
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            nome: userData.nome
          }
        });

        if (createError) {
          console.error(`❌ Erro ao criar ${userData.email}:`, createError);
          results.push({ email: userData.email, success: false, error: createError.message });
          continue;
        }

        console.log(`✅ Usuário criado: ${userData.email}`);

        await new Promise(resolve => setTimeout(resolve, 500));

        // Criar perfil
        const { error: profileError } = await supabaseAdmin
          .from('perfis')
          .insert({
            email: userData.email,
            nome: userData.nome,
            is_admin: userData.is_admin,
            is_super_admin: userData.is_super_admin,
            is_seller: userData.is_seller,
            is_verified: true,
            level: userData.level,
            total_gasto: 0,
            pontos_fidelidade: 0,
            nivel_vip: 'bronze',
            pais: 'Portugal'
          });

        if (profileError) {
          console.error(`❌ Erro ao criar perfil ${userData.email}:`, profileError);
          results.push({ email: userData.email, success: false, error: profileError.message });
          continue;
        }

        console.log(`✅ Perfil criado: ${userData.email}`);

        results.push({
          email: userData.email,
          success: true,
          user_id: newUser.user.id
        });

      } catch (err) {
        console.error(`❌ Erro inesperado ${userData.email}:`, err);
        results.push({ email: userData.email, success: false, error: err.message });
      }
    }

    console.log('✅ Processo concluído!');

    const allSuccess = results.every(r => r.success);

    return new Response(
      JSON.stringify({
        success: allSuccess,
        message: allSuccess ? 'Todos os usuários criados com sucesso!' : 'Alguns usuários falharam',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: allSuccess ? 200 : 207,
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