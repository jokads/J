import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔧 Iniciando criação de usuários de teste...')

    // Create Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 🆕 USUÁRIOS DE TESTE ATUALIZADOS
    const testUsers = [
      {
        email: 'admin@jokatech.com',
        password: 'admin123',
        full_name: 'Admin JokaTech',
        is_admin: true,
        is_super_admin: true,
        is_seller: false,
        seller_approved: false,
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
        seller_approved: false,
      },
      {
        email: 'joka2dms616@gmail.com',
        password: 'joka123456',
        full_name: 'Joka Owner',
        is_admin: false,
        is_super_admin: false,
        is_seller: true,
        seller_approved: true,
      },
    ]

    const results = []

    for (const user of testUsers) {
      try {
        console.log(`\n📝 Processando usuário: ${user.email}`)

        // 1. Verificar se o usuário já existe no Auth
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === user.email)

        let userId: string

        if (existingUser) {
          console.log(`✅ Usuário já existe no Auth: ${user.email}`)
          userId = existingUser.id
        } else {
          // 2. Criar usuário no Auth
          console.log(`🔧 Criando usuário no Auth: ${user.email}`)
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true, // ✅ Confirmar email automaticamente
            user_metadata: {
              full_name: user.full_name,
            },
          })

          if (authError) {
            console.error(`❌ Erro ao criar usuário no Auth: ${user.email}`, authError)
            results.push({
              email: user.email,
              success: false,
              error: authError.message,
            })
            continue
          }

          if (!authData.user) {
            console.error(`❌ Usuário não foi criado: ${user.email}`)
            results.push({
              email: user.email,
              success: false,
              error: 'Usuário não foi criado',
            })
            continue
          }

          userId = authData.user.id
          console.log(`✅ Usuário criado no Auth: ${user.email} (ID: ${userId})`)
        }

        // 3. Verificar se o perfil já existe
        const { data: existingProfile } = await supabaseAdmin
          .from('perfis')
          .select('*')
          .eq('id', userId)
          .single()

        if (existingProfile) {
          console.log(`✅ Perfil já existe: ${user.email}`)
          
          // Atualizar perfil com as permissões corretas
          const { error: updateError } = await supabaseAdmin
            .from('perfis')
            .update({
              full_name: user.full_name,
              is_admin: user.is_admin,
              is_super_admin: user.is_super_admin,
              is_seller: user.is_seller,
              seller_approved: user.seller_approved,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)

          if (updateError) {
            console.error(`❌ Erro ao atualizar perfil: ${user.email}`, updateError)
          } else {
            console.log(`✅ Perfil atualizado: ${user.email}`)
          }
        } else {
          // 4. Criar perfil
          console.log(`🔧 Criando perfil: ${user.email}`)
          const { error: profileError } = await supabaseAdmin
            .from('perfis')
            .insert({
              id: userId,
              email: user.email,
              full_name: user.full_name,
              is_admin: user.is_admin,
              is_super_admin: user.is_super_admin,
              is_seller: user.is_seller,
              seller_approved: user.seller_approved,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          if (profileError) {
            console.error(`❌ Erro ao criar perfil: ${user.email}`, profileError)
            results.push({
              email: user.email,
              success: false,
              error: profileError.message,
            })
            continue
          }

          console.log(`✅ Perfil criado: ${user.email}`)
        }

        results.push({
          email: user.email,
          success: true,
          message: existingUser ? 'Usuário já existia, perfil atualizado' : 'Usuário criado com sucesso',
        })

      } catch (err) {
        console.error(`❌ Erro ao processar usuário: ${user.email}`, err)
        results.push({
          email: user.email,
          success: false,
          error: err.message,
        })
      }
    }

    console.log('\n✅ Processo concluído!')
    console.log('Resultados:', results)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuários de teste processados com sucesso',
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})