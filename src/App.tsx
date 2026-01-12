import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';

function App() {
  useEffect(() => {
    // Verificar sessão do usuário ao carregar
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('✅ Sessão ativa:', session.user.email);
        localStorage.setItem('user', JSON.stringify(session.user));
        localStorage.setItem('userEmail', session.user.email || '');
        
        // Buscar perfil do usuário
        const { data: perfil } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (perfil) {
          localStorage.setItem('user_profile', JSON.stringify(perfil));
          
          // Verificar se é admin
          if (perfil.is_admin || perfil.is_super_admin) {
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('adminEmail', session.user.email || '');
          }
        }
      } else {
        console.log('❌ Nenhuma sessão ativa');
      }
    };

    checkSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Usuário logado:', session.user.email);
        localStorage.setItem('user', JSON.stringify(session.user));
        localStorage.setItem('userEmail', session.user.email || '');

        // Buscar perfil do usuário
        const { data: perfil } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (perfil) {
          localStorage.setItem('user_profile', JSON.stringify(perfil));
          
          if (perfil.is_admin || perfil.is_super_admin) {
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('adminEmail', session.user.email || '');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Usuário deslogado');
        localStorage.removeItem('user');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('user_profile');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
