import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase URL ou Anon Key não configurados');
  throw new Error('Supabase URL e Anon Key são obrigatórios');
}

console.log('✅ Supabase configurado:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length
});

// 🔥 Criar cliente com configurações otimizadas e tratamento de erros
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error('❌ Erro ao ler do localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('❌ Erro ao salvar no localStorage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('❌ Erro ao remover do localStorage:', error);
        }
      },
    },
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 🆕 Função para limpar sessão inválida
export const clearInvalidSession = async () => {
  try {
    console.log('🧹 Limpando sessão inválida...');
    
    // Remover todos os dados de autenticação do localStorage
    const keysToRemove = [
      'sb-auth-token',
      'supabase.auth.token',
      'user',
      'userEmail',
      'isAdmin',
      'adminEmail',
      'user_profile',
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      // Também tentar remover com prefixo do Supabase
      Object.keys(localStorage).forEach(storageKey => {
        if (storageKey.includes(key) || storageKey.includes('supabase')) {
          localStorage.removeItem(storageKey);
        }
      });
    });
    
    // Fazer logout no Supabase
    await supabase.auth.signOut();
    
    console.log('✅ Sessão limpa com sucesso');
  } catch (error) {
    console.error('❌ Erro ao limpar sessão:', error);
  }
};

// 🆕 Verificar e limpar sessão ao inicializar
(async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro ao verificar sessão:', error);
      
      // Se for erro de refresh token, limpar tudo
      if (error.message.includes('refresh') || error.message.includes('Refresh Token')) {
        console.log('⚠️ Token de refresh inválido detectado. Limpando sessão...');
        await clearInvalidSession();
        window.location.reload();
      }
    } else if (session) {
      console.log('✅ Sessão válida encontrada:', session.user.email);
    } else {
      console.log('ℹ️ Nenhuma sessão ativa');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar Supabase:', error);
    await clearInvalidSession();
  }
})();

// Tipos
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  image_url: string;
  specifications: Record<string, string>;
  rating: number;
  reviews_count: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_address: Record<string, string>;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Seller {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  approved: boolean;
  commission_rate: number;
  created_at: string;
}
