import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0b0011]' : 'bg-gray-50'} px-4 py-12`}>
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
            Criar sua conta
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6 text-center`}>
            Junte-se a nós e comece a explorar
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Nome Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={`w-full px-4 py-3 ${
                  darkMode ? 'bg-[#0b0011] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                } border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                placeholder="Seu nome completo"
              />
            </div>

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
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Confirmar Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full px-4 py-3 ${
                  darkMode ? 'bg-[#0b0011] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                } border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                placeholder="Digite a senha novamente"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] hover:opacity-90 disabled:opacity-50 text-white font-medium rounded-lg transition-opacity whitespace-nowrap disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Já tem uma conta?{' '}
              <Link to="/login" className="text-[#b62bff] hover:text-[#ff6a00] font-medium transition-colors">
                Entrar
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
