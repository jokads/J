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

    const users = [
      {
        email: 'damasclaudio2@gmail.com',
        password: 'ThugParadise616#',
        full_name: 'Claudio Damas',
        is_admin: true,
        is_super_admin: true,
        is_seller: false,
        level: 50
      },
      {
        email: 'marianapesimoes@gmail.com',
        password: 'MariaSol2025#',
        full_name: 'Mariana Simoes',
        is_admin: true,
        is_super_admin: false,
        is_seller: false,
        level: 50
      },
      {
        email: 'jokadamas616@gmail.com',
        password: '123456',
        full_name: 'Jokadamas Vendedor',
        is_admin: false,
        is_super_admin: false,
        is_seller: true,
        level: 50
      },
      {
        email: 'jokadas69@gmail.com',
        password: '123456',
        full_name: 'Jokadas Cliente',
        is_admin: false,
        is_super_admin: false,
        is_seller: false,
        level: 50
      }
    ];

    const results = [];

    for (const userData of users) {
      try {
        console.log(`📧 Criando usuário: ${userData.email}`);

        // Verificar se usuário já existe
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === userData.email);

        let userId: string;

        if (existingUser) {
          console.log(`⚠️ Usuário ${userData.email} já existe, atualizando...`);
          userId = existingUser.id;

          // Atualizar senha
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: userData.password,
            email_confirm: true
          });
        } else {
          // Criar novo usuário
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true,
            user_metadata: {
              full_name: userData.full_name
            }
          });

          if (createError) {
            throw createError;
          }

          if (!newUser.user) {
            throw new Error('Erro ao criar usuário');
          }

          userId = newUser.user.id;
          console.log(`✅ Usuário criado: ${userId}`);
        }

        // Verificar se perfil existe
        const { data: existingProfile } = await supabaseAdmin
          .from('perfis')
          .select('*')
          .eq('id', userId)
          .single();

        if (existingProfile) {
          // Atualizar perfil existente
          const { error: updateError } = await supabaseAdmin
            .from('perfis')
            .update({
              email: userData.email,
              full_name: userData.full_name,
              is_admin: userData.is_admin,
              is_super_admin: userData.is_super_admin,
              is_seller: userData.is_seller,
              is_verified: true,
              level: userData.level,
              seller_status: userData.is_seller ? 'approved' : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (updateError) {
            console.error('❌ Erro ao atualizar perfil:', updateError);
            throw updateError;
          }

          console.log(`✅ Perfil atualizado: ${userData.email}`);
        } else {
          // Criar novo perfil
          const { error: insertError } = await supabaseAdmin
            .from('perfis')
            .insert([{
              id: userId,
              email: userData.email,
              full_name: userData.full_name,
              is_admin: userData.is_admin,
              is_super_admin: userData.is_super_admin,
              is_seller: userData.is_seller,
              is_verified: true,
              level: userData.level,
              total_spent: 0.00,
              seller_status: userData.is_seller ? 'approved' : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);

          if (insertError) {
            console.error('❌ Erro ao criar perfil:', insertError);
            throw insertError;
          }

          console.log(`✅ Perfil criado: ${userData.email}`);
        }

        results.push({
          email: userData.email,
          success: true,
          userId: userId,
          type: userData.is_super_admin ? 'SUPER ADMIN' : userData.is_admin ? 'ADMIN' : userData.is_seller ? 'VENDEDOR' : 'CLIENTE'
        });

      } catch (error) {
        console.error(`❌ Erro ao processar ${userData.email}:`, error);
        results.push({
          email: userData.email,
          success: false,
          error: error.message
        });
      }
    }

    // Criar produtos de demonstração
    console.log('📦 Criando produtos de demonstração...');
    
    const products = [
      // 20 GPUs
      { name: 'NVIDIA GeForce RTX 4090', category: 'gpu', price: 1899.99, stock: 15, description: 'A placa gráfica mais poderosa do mercado', specifications: '{"memory": "24GB GDDR6X", "cores": "16384", "boost_clock": "2520 MHz", "tdp": "450W"}' },
      { name: 'NVIDIA GeForce RTX 4080', category: 'gpu', price: 1299.99, stock: 20, description: 'Desempenho excepcional para jogos 4K', specifications: '{"memory": "16GB GDDR6X", "cores": "9728", "boost_clock": "2505 MHz", "tdp": "320W"}' },
      { name: 'NVIDIA GeForce RTX 4070 Ti', category: 'gpu', price: 899.99, stock: 25, description: 'Perfeita para jogos em alta resolução', specifications: '{"memory": "12GB GDDR6X", "cores": "7680", "boost_clock": "2610 MHz", "tdp": "285W"}' },
      { name: 'NVIDIA GeForce RTX 4070', category: 'gpu', price: 649.99, stock: 30, description: 'Excelente custo-benefício', specifications: '{"memory": "12GB GDDR6X", "cores": "5888", "boost_clock": "2475 MHz", "tdp": "200W"}' },
      { name: 'NVIDIA GeForce RTX 4060 Ti', category: 'gpu', price: 499.99, stock: 35, description: 'Ideal para jogos 1080p e 1440p', specifications: '{"memory": "8GB GDDR6", "cores": "4352", "boost_clock": "2535 MHz", "tdp": "160W"}' },
      { name: 'AMD Radeon RX 7900 XTX', category: 'gpu', price: 1099.99, stock: 18, description: 'Topo de linha da AMD', specifications: '{"memory": "24GB GDDR6", "cores": "6144", "boost_clock": "2500 MHz", "tdp": "355W"}' },
      { name: 'AMD Radeon RX 7900 XT', category: 'gpu', price: 899.99, stock: 22, description: 'Alto desempenho AMD', specifications: '{"memory": "20GB GDDR6", "cores": "5376", "boost_clock": "2400 MHz", "tdp": "300W"}' },
      { name: 'AMD Radeon RX 7800 XT', category: 'gpu', price: 599.99, stock: 28, description: 'Ótima para jogos 1440p', specifications: '{"memory": "16GB GDDR6", "cores": "3840", "boost_clock": "2430 MHz", "tdp": "263W"}' },
      { name: 'AMD Radeon RX 7700 XT', category: 'gpu', price: 499.99, stock: 32, description: 'Excelente custo-benefício AMD', specifications: '{"memory": "12GB GDDR6", "cores": "3456", "boost_clock": "2544 MHz", "tdp": "245W"}' },
      { name: 'AMD Radeon RX 7600', category: 'gpu', price: 329.99, stock: 40, description: 'Entrada na linha RDNA 3', specifications: '{"memory": "8GB GDDR6", "cores": "2048", "boost_clock": "2655 MHz", "tdp": "165W"}' },
      { name: 'NVIDIA GeForce RTX 4060', category: 'gpu', price: 349.99, stock: 45, description: 'Perfeita para jogos 1080p', specifications: '{"memory": "8GB GDDR6", "cores": "3072", "boost_clock": "2460 MHz", "tdp": "115W"}' },
      { name: 'NVIDIA GeForce RTX 3060 Ti', category: 'gpu', price: 449.99, stock: 25, description: 'Clássico ainda relevante', specifications: '{"memory": "8GB GDDR6", "cores": "4864", "boost_clock": "1665 MHz", "tdp": "200W"}' },
      { name: 'AMD Radeon RX 6800 XT', category: 'gpu', price: 649.99, stock: 20, description: 'Geração anterior AMD', specifications: '{"memory": "16GB GDDR6", "cores": "4608", "boost_clock": "2250 MHz", "tdp": "300W"}' },
      { name: 'NVIDIA GeForce RTX 3070', category: 'gpu', price: 549.99, stock: 22, description: 'Ótima opção intermediária', specifications: '{"memory": "8GB GDDR6", "cores": "5888", "boost_clock": "1725 MHz", "tdp": "220W"}' },
      { name: 'AMD Radeon RX 6700 XT', category: 'gpu', price: 449.99, stock: 28, description: 'Boa para 1440p', specifications: '{"memory": "12GB GDDR6", "cores": "2560", "boost_clock": "2581 MHz", "tdp": "230W"}' },
      { name: 'NVIDIA GeForce RTX 3060', category: 'gpu', price: 379.99, stock: 35, description: 'Entrada no ray tracing', specifications: '{"memory": "12GB GDDR6", "cores": "3584", "boost_clock": "1777 MHz", "tdp": "170W"}' },
      { name: 'AMD Radeon RX 6600 XT', category: 'gpu', price: 329.99, stock: 30, description: 'Compacta e eficiente', specifications: '{"memory": "8GB GDDR6", "cores": "2048", "boost_clock": "2589 MHz", "tdp": "160W"}' },
      { name: 'NVIDIA GeForce RTX 3050', category: 'gpu', price: 279.99, stock: 40, description: 'Entrada acessível', specifications: '{"memory": "8GB GDDR6", "cores": "2560", "boost_clock": "1777 MHz", "tdp": "130W"}' },
      { name: 'AMD Radeon RX 6600', category: 'gpu', price: 259.99, stock: 35, description: 'Econômica e eficiente', specifications: '{"memory": "8GB GDDR6", "cores": "1792", "boost_clock": "2491 MHz", "tdp": "132W"}' },
      { name: 'NVIDIA GeForce GTX 1660 Super', category: 'gpu', price: 229.99, stock: 30, description: 'Clássico confiável', specifications: '{"memory": "6GB GDDR6", "cores": "1408", "boost_clock": "1785 MHz", "tdp": "125W"}' },
      
      // 20 CPUs
      { name: 'Intel Core i9-14900K', category: 'cpu', price: 649.99, stock: 20, description: 'O processador mais poderoso da Intel', specifications: '{"cores": "24", "threads": "32", "base_clock": "3.2 GHz", "boost_clock": "6.0 GHz", "tdp": "125W"}' },
      { name: 'AMD Ryzen 9 7950X', category: 'cpu', price: 699.99, stock: 18, description: 'Topo de linha AMD Zen 4', specifications: '{"cores": "16", "threads": "32", "base_clock": "4.5 GHz", "boost_clock": "5.7 GHz", "tdp": "170W"}' },
      { name: 'Intel Core i7-14700K', category: 'cpu', price: 449.99, stock: 25, description: 'Excelente para jogos e produtividade', specifications: '{"cores": "20", "threads": "28", "base_clock": "3.4 GHz", "boost_clock": "5.6 GHz", "tdp": "125W"}' },
      { name: 'AMD Ryzen 9 7900X', category: 'cpu', price: 549.99, stock: 22, description: 'Alto desempenho AMD', specifications: '{"cores": "12", "threads": "24", "base_clock": "4.7 GHz", "boost_clock": "5.4 GHz", "tdp": "170W"}' },
      { name: 'Intel Core i5-14600K', category: 'cpu', price: 329.99, stock: 30, description: 'Ótimo custo-benefício Intel', specifications: '{"cores": "14", "threads": "20", "base_clock": "3.5 GHz", "boost_clock": "5.3 GHz", "tdp": "125W"}' },
      { name: 'AMD Ryzen 7 7800X3D', category: 'cpu', price: 449.99, stock: 20, description: 'Melhor para jogos com 3D V-Cache', specifications: '{"cores": "8", "threads": "16", "base_clock": "4.2 GHz", "boost_clock": "5.0 GHz", "tdp": "120W"}' },
      { name: 'Intel Core i9-13900K', category: 'cpu', price: 589.99, stock: 18, description: 'Geração anterior ainda potente', specifications: '{"cores": "24", "threads": "32", "base_clock": "3.0 GHz", "boost_clock": "5.8 GHz", "tdp": "125W"}' },
      { name: 'AMD Ryzen 7 7700X', category: 'cpu', price: 399.99, stock: 25, description: 'Ótimo para jogos e trabalho', specifications: '{"cores": "8", "threads": "16", "base_clock": "4.5 GHz", "boost_clock": "5.4 GHz", "tdp": "105W"}' },
      { name: 'Intel Core i7-13700K', category: 'cpu', price: 409.99, stock: 22, description: 'Versão anterior do i7', specifications: '{"cores": "16", "threads": "24", "base_clock": "3.4 GHz", "boost_clock": "5.4 GHz", "tdp": "125W"}' },
      { name: 'AMD Ryzen 5 7600X', category: 'cpu', price: 299.99, stock: 30, description: 'Entrada na linha Zen 4', specifications: '{"cores": "6", "threads": "12", "base_clock": "4.7 GHz", "boost_clock": "5.3 GHz", "tdp": "105W"}' },
      { name: 'Intel Core i5-13600K', category: 'cpu', price: 319.99, stock: 28, description: 'Excelente intermediário', specifications: '{"cores": "14", "threads": "20", "base_clock": "3.5 GHz", "boost_clock": "5.1 GHz", "tdp": "125W"}' },
      { name: 'AMD Ryzen 9 5950X', category: 'cpu', price: 549.99, stock: 15, description: 'Zen 3 topo de linha', specifications: '{"cores": "16", "threads": "32", "base_clock": "3.4 GHz", "boost_clock": "4.9 GHz", "tdp": "105W"}' },
      { name: 'Intel Core i9-12900K', category: 'cpu', price: 499.99, stock: 18, description: '12ª geração Intel', specifications: '{"cores": "16", "threads": "24", "base_clock": "3.2 GHz", "boost_clock": "5.2 GHz", "tdp": "125W"}' },
      { name: 'AMD Ryzen 7 5800X3D', category: 'cpu', price: 449.99, stock: 20, description: 'Zen 3 com 3D V-Cache', specifications: '{"cores": "8", "threads": "16", "base_clock": "3.4 GHz", "boost_clock": "4.5 GHz", "tdp": "105W"}' },
      { name: 'Intel Core i7-12700K', category: 'cpu', price: 379.99, stock: 22, description: '12ª geração i7', specifications: '{"cores": "12", "threads": "20", "base_clock": "3.6 GHz", "boost_clock": "5.0 GHz", "tdp": "125W"}' },
      { name: 'AMD Ryzen 5 5600X', category: 'cpu', price: 199.99, stock: 35, description: 'Clássico Zen 3', specifications: '{"cores": "6", "threads": "12", "base_clock": "3.7 GHz", "boost_clock": "4.6 GHz", "tdp": "65W"}' },
      { name: 'Intel Core i5-12600K', category: 'cpu', price: 289.99, stock: 25, description: '12ª geração i5', specifications: '{"cores": "10", "threads": "16", "base_clock": "3.7 GHz", "boost_clock": "4.9 GHz", "tdp": "125W"}' },
      { name: 'AMD Ryzen 7 5700X', category: 'cpu', price: 249.99, stock: 28, description: 'Zen 3 eficiente', specifications: '{"cores": "8", "threads": "16", "base_clock": "3.4 GHz", "boost_clock": "4.6 GHz", "tdp": "65W"}' },
      { name: 'Intel Core i3-12100F', category: 'cpu', price: 109.99, stock: 40, description: 'Entrada econômica', specifications: '{"cores": "4", "threads": "8", "base_clock": "3.3 GHz", "boost_clock": "4.3 GHz", "tdp": "58W"}' },
      { name: 'AMD Ryzen 5 5500', category: 'cpu', price: 129.99, stock: 35, description: 'Acessível e eficiente', specifications: '{"cores": "6", "threads": "12", "base_clock": "3.6 GHz", "boost_clock": "4.2 GHz", "tdp": "65W"}' }
    ];

    let productCount = 0;
    for (const product of products) {
      try {
        const { error: productError } = await supabaseAdmin
          .from('products')
          .insert([{
            ...product,
            image_url: `https://readdy.ai/api/search-image?query=${encodeURIComponent(product.name + ' product on white background professional photography high quality studio lighting')}&width=800&height=600&seq=${product.category}${productCount}&orientation=landscape`,
            specifications: JSON.parse(product.specifications),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (!productError) {
          productCount++;
        }
      } catch (error) {
        console.error(`❌ Erro ao criar produto ${product.name}:`, error);
      }
    }

    console.log(`✅ ${productCount} produtos criados!`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `✅ ${results.filter(r => r.success).length} usuários criados/atualizados com sucesso!`,
        results: results,
        productsCreated: productCount
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
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});