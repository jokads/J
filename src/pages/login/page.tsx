import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // Se já estiver logado, redirecionar baseado no role
    const checkUserAndRedirect = async () => {
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          if (profile) {
            const adminRoles = ['superadmin', 'admin', 'manager', 'editor', 'financial', 'support'];
            if (adminRoles.includes(profile.role)) {
              navigate('/admin'); // CORRIGIDO: /admin em vez de /admin/dashboard
            } else {
              navigate('/');
            }
          } else {
            // Se não tem perfil, é cliente normal
            navigate('/');
          }
        } catch (error) {
          console.error('Erro ao verificar perfil:', error);
          navigate('/');
        }
      }
    };

    checkUserAndRedirect();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      
      // Verificar role do utilizador
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (profile) {
          const adminRoles = ['superadmin', 'admin', 'manager', 'editor', 'financial', 'support'];
          if (adminRoles.includes(profile.role)) {
            // É admin - vai para dashboard
            navigate('/admin'); // CORRIGIDO: /admin em vez de /admin/dashboard
          } else {
            // É cliente - vai para o site
            navigate('/');
          }
        } else {
          // Sem perfil = cliente normal
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique as suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0b0011]' : 'bg-gray-50'} px-4`}>
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#b62bff] to-[#ff6a00] rounded-lg flex items-center justify-center">
            <i className="ri-store-3-line text-white text-2xl"></i>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
            JokaTech
          </span>
        </Link>

        {/* Formulário */}
        <div className={`${darkMode ? 'bg-[#170018] border-gray-800' : 'bg-white border-gray-200'} rounded-2xl shadow-xl border p-8`}>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2 text-center`}>
            Entrar na sua conta
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6 text-center`}>
            Aceda à sua conta para continuar
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-3 ${
                  darkMode ? 'bg-[#0b0011] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                } border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-3 ${
                  darkMode ? 'bg-[#0b0011] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                } border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] hover:opacity-90 disabled:opacity-50 text-white font-medium rounded-lg transition-opacity whitespace-nowrap disabled:cursor-not-allowed"
            >
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Não tem uma conta?{' '}
              <Link to="/register" className="text-[#b62bff] hover:text-[#ff6a00] font-medium transition-colors">
                Criar conta
              </Link>
            </p>
          </div>
        </div>

        {/* Voltar */}
        <div className="mt-6 text-center">
          <Link to="/" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-[#b62bff]' : 'text-gray-600 hover:text-[#b62bff]'} transition-colors`}>
            <i className="ri-arrow-left-line mr-1"></i>
            Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
