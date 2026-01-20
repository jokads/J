import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const createAdmin = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const adminEmail = 'joka2dms@gmail.com';
      const adminPassword = 'ThugParadise616#';
      const adminName = 'Joka Admin';

      // Obter URL do Supabase
      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('Configuração do Supabase não encontrada');
      }

      // Chamar Edge Function para criar admin (bypassa RLS)
      const response = await fetch(`${supabaseUrl}/functions/v1/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          fullName: adminName
        })
      });

      const result = await response.json();

      if (!result.success) {
        // Se o erro for "usuário já existe", tratar como sucesso
        if (result.error?.includes('already registered') || result.error?.includes('já existe')) {
          setMessage(`✅ Usuário já configurado!\n\nE-mail: ${adminEmail}\nSenha: ${adminPassword}\n\nFaça login para acessar o dashboard.`);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        throw new Error(result.error || 'Erro ao criar administrador');
      }

      setMessage(`✅ ${result.message}!\n\nE-mail: ${adminEmail}\nSenha: ${adminPassword}\n\nFaça login para acessar o dashboard.`);
      
      setTimeout(() => navigate('/login'), 3000);

    } catch (err: any) {
      console.error('Erro ao criar administrador:', err);
      
      let errorMsg = err.message || 'Erro desconhecido ao criar administrador';
      
      // Tratar erro de usuário já existente como sucesso
      if (errorMsg.includes('already registered') || errorMsg.includes('já existe') || errorMsg.includes('atualizado')) {
        setMessage(`✅ Usuário já existe e está configurado!\n\nE-mail: joka2dms@gmail.com\nSenha: ThugParadise616#\n\nFaça login para acessar o dashboard.`);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(`❌ ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8 border border-yellow-500/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-admin-line text-4xl text-black"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Configuração Inicial</h1>
          <p className="text-gray-400">Crie o usuário administrador do sistema</p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">Credenciais do Admin:</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">E-mail:</span>
              <span className="text-white font-mono">joka2dms@gmail.com</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Senha:</span>
              <span className="text-white font-mono">ThugParadise616#</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Permissão:</span>
              <span className="text-yellow-400 font-semibold">Superadmin</span>
            </div>
          </div>
        </div>

        {message && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6">
            <p className="text-green-400 text-sm whitespace-pre-line">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={createAdmin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold py-4 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <span>Criando...</span>
            </>
          ) : (
            <>
              <i className="ri-user-add-line text-xl"></i>
              <span>Criar Administrador</span>
            </>
          )}
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-400 hover:text-yellow-400 transition-colors text-sm whitespace-nowrap"
          >
            Já tenho uma conta → Fazer Login
          </button>
        </div>
      </div>
    </div>
  );
}
