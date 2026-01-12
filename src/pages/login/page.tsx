import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  // 🔥 USUÁRIOS PRÉ-DEFINIDOS - Apenas para referência de roles
  const predefinedUsers = {
    'damasclaudio2@gmail.com': {
      password: 'ThugParadise616#',
      name: 'Claudio Damasceno',
      is_super_admin: true,
      is_admin: true,
    },
    'marianapereira@gmail.com': {
      password: 'MariSol2025#',
      name: 'Mariana Pereira',
      is_admin: true,
    },
    'joka2dms@gmail.com': {
      password: 'ThugParadise616#',
      name: 'Joka Vendedor',
      is_seller: true,
      seller_approved: true,
    },
    'joka2dms616@gmail.com': {
      password: 'ThugParadise616#',
      name: 'Joka Cliente',
    },
  };

  // 🆕 CRIAR PERFIL COMPLETO
  const createUserProfile = async (userId: string, userEmail: string, userName: string) => {
    try {
      const predefinedUser = predefinedUsers[userEmail as keyof typeof predefinedUsers];

      const profileData = {
        id: userId,
        email: userEmail,
        full_name: userName || predefinedUser?.name || 'Usuário',
        is_super_admin: predefinedUser?.is_super_admin || false,
        is_admin: predefinedUser?.is_admin || false,
        is_seller: predefinedUser?.is_seller || false,
        seller_approved: predefinedUser?.seller_approved || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('perfis')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('❌ Erro ao criar perfil:', err);
      throw err;
    }
  };

  // 🆕 RESETAR SENHA
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, digite seu email.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        setError('Erro ao enviar email. Verifique se o email está correto.');
      } else {
        setSuccess('✅ Email de recuperação enviado! Verifique sua caixa de entrada.');
        setShowForgotPassword(false);
      }
    } catch (err: any) {
      setError('Erro inesperado. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // 🔐 LOGIN
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (authError) {
          // Se o usuário não existe, tentar criar automaticamente se for pré-definido
          const predefinedUser = predefinedUsers[email.trim() as keyof typeof predefinedUsers];
          
          if (predefinedUser && password === predefinedUser.password) {
            // Criar usuário automaticamente
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: email.trim(),
              password: password,
              options: {
                data: { full_name: predefinedUser.name },
                emailRedirectTo: undefined,
              },
            });

            if (signUpError || !signUpData.user) {
              setError('❌ Erro ao criar usuário. Tente novamente.');
              setLoading(false);
              return;
            }

            // Criar perfil
            await createUserProfile(signUpData.user.id, email.trim(), predefinedUser.name);

            // Fazer login
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password: password,
            });

            if (loginError || !loginData.user) {
              setError('❌ Usuário criado, mas erro ao fazer login. Tente novamente.');
              setLoading(false);
              return;
            }

            // Buscar perfil
            const { data: profile } = await supabase
              .from('perfis')
              .select('*')
              .eq('id', loginData.user.id)
              .single();

            // Salvar e redirecionar
            localStorage.setItem('user_profile', JSON.stringify(profile));
            localStorage.setItem('user', JSON.stringify(loginData.user));
            localStorage.setItem('userEmail', loginData.user.email || '');

            if (profile?.is_admin || profile?.is_super_admin) {
              localStorage.setItem('isAdmin', 'true');
              navigate('/dashboard');
            } else if (profile?.is_seller) {
              navigate('/perfil');
            } else {
              navigate('/');
            }
          } else {
            setError('❌ Email ou senha incorretos! Verifique suas credenciais e tente novamente.');
          }
          
          setLoading(false);
          return;
        }

        if (!authData.user) {
          setError('❌ Erro ao fazer login. Tente novamente.');
          setLoading(false);
          return;
        }

        // Buscar ou criar perfil
        let perfil;
        const { data: existingProfile } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (!existingProfile) {
          const predefinedUser = predefinedUsers[email.trim() as keyof typeof predefinedUsers];
          perfil = await createUserProfile(
            authData.user.id,
            authData.user.email || '',
            authData.user.user_metadata?.full_name || predefinedUser?.name || 'Usuário'
          );
        } else {
          perfil = existingProfile;
        }

        // Salvar no localStorage
        localStorage.setItem('user_profile', JSON.stringify(perfil));
        localStorage.setItem('user', JSON.stringify(authData.user));
        localStorage.setItem('userEmail', authData.user.email || '');

        // Redirecionar
        if (perfil.is_admin || perfil.is_super_admin) {
          localStorage.setItem('isAdmin', 'true');
          navigate('/dashboard');
        } else if (perfil.is_seller) {
          navigate('/perfil');
        } else {
          navigate('/');
        }
      } else {
        // 📝 REGISTRO
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (authError) {
          let errorMessage = 'Erro ao registrar. Tente novamente.';
          
          if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
            errorMessage = '⚠️ Este email já está registrado. Por favor, faça login ou use outro email.';
          } else if (authError.message.includes('Invalid email')) {
            errorMessage = '⚠️ Email inválido. Verifique e tente novamente.';
          } else if (authError.message.includes('Password')) {
            errorMessage = '⚠️ A senha deve ter pelo menos 6 caracteres.';
          }
          
          setError(errorMessage);
          setLoading(false);
          return;
        }

        if (!authData.user) {
          setError('❌ Erro ao criar conta. Tente novamente.');
          setLoading(false);
          return;
        }

        // Criar perfil
        await createUserProfile(authData.user.id, email.trim(), fullName);

        setSuccess('✅ Conta criada com sucesso! Você já pode fazer login.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      setError('❌ Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    setError('⚠️ Login social ainda não está habilitado. Use email e senha.');
  };

  // 🆕 MODAL DE ESQUECI MINHA SENHA
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
          <div className="max-w-md w-full">
            {/* Logo e Header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block mb-4">
                <img 
                  src="https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/cb4831d791909a4a7679c925d26faa2b.png" 
                  alt="JokaTech" 
                  className="h-16 w-16 mx-auto object-contain"
                />
              </Link>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-2">
                Recuperar Senha
              </h1>
              <p className="text-gray-400">
                Digite seu email para receber o link de recuperação
              </p>
            </div>

            {/* Card Principal */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-amber-500/20">
              {/* Mensagens */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <i className="ri-error-warning-line"></i>
                    {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                  <p className="text-green-400 text-sm flex items-center gap-2">
                    <i className="ri-checkbox-circle-line"></i>
                    {success}
                  </p>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-lg hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/50 cursor-pointer whitespace-nowrap"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin"></i>
                      Enviando...
                    </span>
                  ) : (
                    <span>Enviar Link de Recuperação</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full py-3 px-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all cursor-pointer whitespace-nowrap"
                >
                  Voltar para Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-md w-full">
          {/* Logo e Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <img 
                src="https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/cb4831d791909a4a7679c925d26faa2b.png" 
                alt="JokaTech" 
                className="h-16 w-16 mx-auto object-contain"
              />
            </Link>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-2">
              JokaTech
            </h1>
            <p className="text-gray-400">
              {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
            </p>
          </div>

          {/* Card Principal */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-amber-500/20">
            {/* Mensagens */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm whitespace-pre-line font-medium leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-green-400 text-sm flex items-center gap-2">
                  <i className="ri-checkbox-circle-line"></i>
                  {success}
                </p>
              </div>
            )}

            {/* Tabs Login/Registro */}
            <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-lg">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isLogin
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  !isLogin
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Registrar
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Seu nome completo"
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Senha
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-lg hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/50 cursor-pointer whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin"></i>
                    Processando...
                  </span>
                ) : (
                  <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800/50 text-gray-400">Ou continue com</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSocialAuth('google')}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-gray-600 rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Em breve"
              >
                <i className="ri-google-fill text-xl text-white"></i>
              </button>
              <button
                onClick={() => handleSocialAuth('facebook')}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-gray-600 rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Em breve"
              >
                <i className="ri-facebook-fill text-xl text-blue-500"></i>
              </button>
              <button
                onClick={() => handleSocialAuth('apple')}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-gray-600 rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Em breve"
              >
                <i className="ri-apple-fill text-xl text-white"></i>
              </button>
            </div>

            {/* Links */}
            <div className="mt-6 text-center space-y-2">
              <Link
                to="/"
                className="block text-sm text-gray-400 hover:text-amber-400 transition-colors"
              >
                ← Voltar para a página inicial
              </Link>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-amber-500/10">
              <i className="ri-shield-check-line text-3xl text-amber-400 mb-2"></i>
              <p className="text-xs text-gray-400 font-medium">Seguro e Criptografado</p>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-amber-500/10">
              <i className="ri-lock-line text-3xl text-amber-400 mb-2"></i>
              <p className="text-xs text-gray-400 font-medium">Dados Protegidos</p>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-amber-500/10">
              <i className="ri-verified-badge-line text-3xl text-amber-400 mb-2"></i>
              <p className="text-xs text-gray-400 font-medium">100% Confiável</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-amber-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Recuperar Senha</h3>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <p className="text-gray-400 mb-6">
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <i className="ri-error-warning-line"></i>
                    {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 text-sm flex items-center gap-2">
                    <i className="ri-checkbox-circle-line"></i>
                    {success}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Enviando...
                  </>
                ) : (
                  <>
                    <i className="ri-mail-send-line"></i>
                    Enviar Link de Recuperação
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setSuccess('');
                }}
                className="w-full text-gray-400 hover:text-white transition-colors py-2 cursor-pointer"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
