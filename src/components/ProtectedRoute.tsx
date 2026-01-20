import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (authLoading) return;

      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao verificar permissões:', error);
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        if (!profile) {
          console.error('Perfil não encontrado');
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        const allowedRoles = ['superadmin', 'admin', 'manager', 'editor', 'financial', 'support'];
        setIsAdmin(allowedRoles.includes(profile.role));
      } catch (error) {
        console.error('Erro ao verificar acesso:', error);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    checkAdminAccess();
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0011]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0011] px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-[#170018] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-error-warning-line text-4xl text-red-600 dark:text-red-400"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Acesso Restrito
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Você não tem permissão para aceder a esta área. Esta secção é exclusiva para administradores.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg hover:opacity-90 transition-opacity font-medium whitespace-nowrap"
            >
              <i className="ri-home-line mr-2"></i>
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
