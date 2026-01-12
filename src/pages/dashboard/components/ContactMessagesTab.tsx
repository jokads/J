import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type: 'contact' | 'seller';
}

export default function ContactMessagesTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [tableError, setTableError] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setTableError(false);

      // Buscar mensagens de contato
      const { data: contactData, error: contactError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      // Se a tabela não existir, mostrar erro amigável
      if (contactError && contactError.code === 'PGRST205') {
        setTableError(true);
        setLoading(false);
        return;
      }

      if (contactError) throw contactError;

      // Buscar mensagens de vendedores
      const { data: sellerData, error: sellerError } = await supabase
        .from('seller_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (sellerError && sellerError.code !== 'PGRST205') throw sellerError;

      // Combinar e ordenar todas as mensagens
      const allMessages = [
        ...(contactData || []).map(msg => ({ ...msg, type: 'contact' as const })),
        ...(sellerData || []).map(msg => ({ ...msg, type: 'seller' as const }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setMessages(allMessages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string, messageType: string) => {
    try {
      const table = messageType === 'contact' ? 'contact_messages' : 'seller_messages';
      const { error } = await supabase
        .from(table)
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      // Atualizar estado local
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));

      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, is_read: true });
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const deleteMessage = async (messageId: string, messageType: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return;

    try {
      const table = messageType === 'contact' ? 'contact_messages' : 'seller_messages';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(messages.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread') return !msg.is_read;
    if (filter === 'read') return msg.is_read;
    return true;
  });

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Mostrar mensagem de erro se a tabela não existir
  if (tableError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-start">
            <i className="ri-error-warning-line text-3xl text-red-500 mr-4"></i>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 mb-2">
                ⚠️ Tabela de Mensagens Não Encontrada
              </h3>
              <p className="text-red-700 mb-4">
                A tabela <code className="bg-red-100 px-2 py-1 rounded">contact_messages</code> não existe no banco de dados.
              </p>
              
              <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-800 mb-2">📋 Como Corrigir:</h4>
                <ol className="list-decimal list-inside space-y-2 text-red-700">
                  <li>Abra o <strong>Supabase Dashboard</strong></li>
                  <li>Vá em <strong>SQL Editor</strong> no menu lateral</li>
                  <li>Abra o arquivo <code className="bg-red-100 px-2 py-1 rounded">CREATE_CONTACT_MESSAGES_TABLE.sql</code></li>
                  <li>Copie todo o conteúdo do arquivo</li>
                  <li>Cole no SQL Editor e clique em <strong>Run</strong></li>
                  <li>Aguarde a execução (5-10 segundos)</li>
                  <li>Recarregue esta página</li>
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-bold text-amber-800 mb-2">✨ O que será criado:</h4>
                <ul className="list-disc list-inside space-y-1 text-amber-700">
                  <li>Tabela <code>contact_messages</code> para mensagens de contato</li>
                  <li>Políticas de segurança (RLS) para proteger os dados</li>
                  <li>8 mensagens de exemplo para teste</li>
                  <li>Índices para melhor performance</li>
                </ul>
              </div>

              <button
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="mt-4 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
              >
                <i className="ri-external-link-line"></i>
                Abrir Supabase Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-t-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <i className="ri-mail-line"></i>
              Mensagens de Contato
            </h2>
            <p className="text-gray-400 mt-1">
              Gerencie mensagens de clientes e vendedores
            </p>
          </div>
          <button
            onClick={fetchMessages}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            <i className="ri-refresh-line"></i>
            Atualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total</div>
            <div className="text-2xl font-bold text-white">{messages.length}</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-4">
            <div className="text-amber-400 text-sm mb-1">Não Lidas</div>
            <div className="text-2xl font-bold text-amber-500">{unreadCount}</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4">
            <div className="text-green-400 text-sm mb-1">Lidas</div>
            <div className="text-2xl font-bold text-green-500">{messages.length - unreadCount}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Todas ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'unread'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Não Lidas ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'read'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Lidas ({messages.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-hidden flex">
        {/* Lista de mensagens */}
        <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <i className="ri-mail-line text-5xl mb-4"></i>
              <p>Nenhuma mensagem encontrada</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.is_read) {
                      markAsRead(msg.id, msg.type);
                    }
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-800 transition-colors ${
                    selectedMessage?.id === msg.id ? 'bg-gray-800' : ''
                  } ${!msg.is_read ? 'bg-amber-500/5' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${msg.is_read ? 'bg-gray-600' : 'bg-amber-500'}`}></div>
                      <span className="font-medium text-white">{msg.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      msg.type === 'contact' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {msg.type === 'contact' ? 'Contato' : 'Vendedor'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">{msg.email}</div>
                  {msg.subject && (
                    <div className="text-sm font-medium text-gray-300 mb-1">{msg.subject}</div>
                  )}
                  <div className="text-sm text-gray-500 line-clamp-2">{msg.message}</div>
                  <div className="text-xs text-gray-600 mt-2">
                    {new Date(msg.created_at).toLocaleString('pt-PT')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes da mensagem */}
        <div className="flex-1 overflow-y-auto">
          {selectedMessage ? (
            <div className="p-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {selectedMessage.subject || 'Sem assunto'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-2">
                        <i className="ri-user-line"></i>
                        {selectedMessage.name}
                      </span>
                      <span className="flex items-center gap-2">
                        <i className="ri-mail-line"></i>
                        {selectedMessage.email}
                      </span>
                      <span className="flex items-center gap-2">
                        <i className="ri-time-line"></i>
                        {new Date(selectedMessage.created_at).toLocaleString('pt-PT')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!selectedMessage.is_read && (
                      <button
                        onClick={() => markAsRead(selectedMessage.id, selectedMessage.type)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <i className="ri-check-line"></i>
                        Marcar como Lida
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(selectedMessage.id, selectedMessage.type)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <i className="ri-delete-bin-line"></i>
                      Excluir
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div className="mt-6 flex gap-4">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Sua mensagem'}`}
                    className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
                  >
                    <i className="ri-reply-line"></i>
                    Responder por Email
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMessage.email);
                      alert('Email copiado!');
                    }}
                    className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <i className="ri-file-copy-line"></i>
                    Copiar Email
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <i className="ri-mail-open-line text-6xl mb-4"></i>
                <p>Selecione uma mensagem para ver os detalhes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
