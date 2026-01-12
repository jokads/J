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

    const body = await req.json();
    const {
      email,
      password,
      fullName,
      sellerType,
      phone,
      cpf,
      address,
      city,
      postalCode,
      companyName,
      cnpj,
      companyPhone,
      companyAddress,
      companyCity,
      companyPostalCode,
      storeName,
      storeDescription,
      storeLogoUrl
    } = body;

    console.log('🚀 Iniciando registro de vendedor:', email);

    // 1. Verificar se o email já existe
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.find(u => u.email === email);

    if (userExists) {
      console.log('⚠️ Email já existe, verificando se já é vendedor...');
      
      // Verificar se já é vendedor
      const { data: existingProfile } = await supabaseAdmin
        .from('perfis')
        .select('*')
        .eq('email', email)
        .single();

      if (existingProfile?.is_seller) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Este email já está registrado como vendedor.'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Se não é vendedor, atualizar perfil existente
      console.log('✅ Atualizando perfil existente para vendedor...');
      
      const updateData: any = {
        is_seller: true,
        seller_status: 'pending',
        updated_at: new Date().toISOString(),
      };

      // Adicionar campos opcionais apenas se existirem na tabela
      try {
        updateData.seller_type = sellerType;
        updateData.store_name = storeName;
        updateData.seller_description = storeDescription;
        updateData.seller_logo_url = storeLogoUrl || null;
        
        if (sellerType === 'personal') {
          updateData.telefone = phone;
          updateData.documento = cpf;
          updateData.endereco = `${address}, ${city}, ${postalCode}`;
        } else {
          updateData.empresa = companyName;
          updateData.documento = cnpj;
          updateData.telefone = companyPhone;
          updateData.endereco = `${companyAddress}, ${companyCity}, ${companyPostalCode}`;
        }
      } catch (e) {
        console.log('⚠️ Alguns campos não puderam ser adicionados:', e.message);
      }

      const { error: updateError } = await supabaseAdmin
        .from('perfis')
        .update(updateData)
        .eq('email', email);

      if (updateError) {
        console.error('❌ Erro ao atualizar perfil:', updateError);
        
        // Se falhar, tentar com campos mínimos
        const minimalUpdate = {
          is_seller: true,
          seller_status: 'pending',
          updated_at: new Date().toISOString(),
        };
        
        const { error: retryError } = await supabaseAdmin
          .from('perfis')
          .update(minimalUpdate)
          .eq('email', email);
        
        if (retryError) {
          throw retryError;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Solicitação de vendedor enviada com sucesso! Aguarde aprovação.',
          userId: userExists.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // 2. Criar novo usuário
    console.log('✅ Criando novo usuário...');
    
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        seller_type: sellerType,
      }
    });

    if (createError) {
      console.error('❌ Erro ao criar usuário:', createError);
      throw createError;
    }

    if (!newUser.user) {
      throw new Error('Erro ao criar usuário');
    }

    console.log('✅ Usuário criado:', newUser.user.id);

    // 3. Criar perfil com campos mínimos primeiro
    const profileData: any = {
      id: newUser.user.id,
      email: email,
      is_seller: true,
      seller_status: 'pending',
      is_verified: true,
      level: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Adicionar campos opcionais se existirem
    try {
      profileData.nome = fullName;
      profileData.full_name = fullName;
      profileData.seller_type = sellerType;
      profileData.store_name = storeName;
      profileData.seller_description = storeDescription;
      profileData.seller_logo_url = storeLogoUrl || null;
      profileData.total_gasto = 0;
      profileData.pontos_fidelidade = 0;
      profileData.nivel_vip = 'bronze';
      profileData.pais = 'Portugal';
      
      if (sellerType === 'personal') {
        profileData.telefone = phone;
        profileData.documento = cpf;
        profileData.endereco = `${address}, ${city}, ${postalCode}`;
      } else {
        profileData.empresa = companyName;
        profileData.documento = cnpj;
        profileData.telefone = companyPhone;
        profileData.endereco = `${companyAddress}, ${companyCity}, ${companyPostalCode}`;
      }
    } catch (e) {
      console.log('⚠️ Alguns campos opcionais não puderam ser adicionados:', e.message);
    }

    const { error: profileError } = await supabaseAdmin
      .from('perfis')
      .insert([profileData]);

    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError);
      
      // Tentar com campos mínimos
      const minimalProfile = {
        id: newUser.user.id,
        email: email,
        is_seller: true,
        seller_status: 'pending',
        is_verified: true,
        level: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { error: retryError } = await supabaseAdmin
        .from('perfis')
        .insert([minimalProfile]);
      
      if (retryError) {
        // Se ainda falhar, deletar o usuário criado
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        throw new Error(`Erro ao criar perfil: ${retryError.message}. Por favor, execute o script SQL DATABASE_SETUP_COMPLETE_FINAL.sql primeiro.`);
      }
    }

    console.log('✅ Perfil criado com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Conta criada com sucesso! Aguarde aprovação do administrador.',
        userId: newUser.user.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Erro:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao processar solicitação'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});