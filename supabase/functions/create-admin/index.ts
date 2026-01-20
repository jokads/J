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

    const { email, password, fullName } = await req.json();

    // Verificar se usuário já existe
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users.users.find(u => u.email === email);

    if (existingUser) {
      // Atualizar senha e metadados do usuário existente
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: 'superadmin'
        }
      });

      // Criar ou atualizar perfil
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: existingUser.id,
          email,
          full_name: fullName,
          role: 'superadmin',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Administrador atualizado com sucesso',
          userId: existingUser.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar novo usuário
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'superadmin'
      }
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Erro ao criar usuário');
    }

    // Criar perfil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: 'superadmin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Administrador criado com sucesso',
        userId: authData.user.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro ao criar administrador' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});