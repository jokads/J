
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface SupportManagementProps {
  darkMode: boolean;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  contact_method: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  ip_address: string;
  user_agent: string;
  source: string;
  newsletter_subscribed: boolean;
  tags: string[];
  notes: string;
  response_sent: boolean;
  response_date: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string;
  status: string;
  source: string;
  subscribed_at: string;
  email_opens: number;
  email_clicks: number;
}

export default function SupportManagement({ darkMode }: SupportManagementProps) {
  const [activeTab, setActiveTab] = useState<'messages' | 'newsletter' | 'maintenance' | 'tasks' | 'simulate'>('messages');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    if (activeTab === 'messages') {
      loadMessages();
    } else if (activeTab === 'newsletter') {
      loadSubscribers();
    } else if (activeTab === 'maintenance') {
      loadMaintenanceMode();
    } else if (activeTab === 'tasks') {
      loadTasks();
    }
  }, [activeTab, currentPage, filterStatus, filterPriority, searchQuery]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('contact_messages')
        .select('*', { count: 'exact' });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (filterPriority !== 'all') {
        query = query.eq('priority', filterPriority);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      
      setMessages(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      
      const { data, error, count } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact' })
        .order('subscribed_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      
      setSubscribers(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Erro ao carregar assinantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_mode')
        .select('*')
        .single();

      if (error) throw error;
      setMaintenanceMode(data?.enabled || false);
    } catch (error) {
      console.error('Erro ao carregar modo de manutenção:', error);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('admin_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (messageId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
      await loadMessages();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handlePriorityChange = async (messageId: string, newPriority: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          priority: newPriority,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
      await loadMessages();
    } catch (error) {
      console.error('Erro ao atualizar prioridade:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
      await loadMessages();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const toggleMaintenanceMode = async () => {
    try {
      const { error } = await supabase
        .from('maintenance_mode')
        .update({ 
          enabled: !maintenanceMode,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.from('maintenance_mode').select('id').single()).data?.id);

      if (error) throw error;
      setMaintenanceMode(!maintenanceMode);
    } catch (error) {
      console.error('Erro ao alternar modo de manutenção:', error);
    }
  };

  const getStats = () => {
    const total = messages.length;
    const newMessages = messages.filter(m => m.status === 'new').length;
    const inProgress = messages.filter(m => m.status === 'in_progress').length;
    const resolved = messages.filter(m => m.status === 'resolved').length;
    const urgent = messages.filter(m => m.priority === 'urgent').length;
    const unread = messages.filter(m => !m.read_at).length;
    const withNewsletter = messages.filter(m => m.newsletter_subscribed).length;

    return { total, newMessages, inProgress, resolved, urgent, unread, withNewsletter };
  };

  const stats = getStats();

  const statusOptions = [
    { value: 'new', label: 'Nova', color: 'yellow', icon: 'ri-mail-line' },
    { value: 'in_progress', label: 'Em Progresso', color: 'blue', icon: 'ri-time-line' },
    { value: 'waiting', label: 'Aguardando', color: 'purple', icon: 'ri-hourglass-line' },
    { value: 'resolved', label: 'Resolvida', color: 'green', icon: 'ri-check-line' },
    { value: 'closed', label: 'Fechada', color: 'gray', icon: 'ri-close-line' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baixa', color: 'gray', icon: 'ri-arrow-down-line' },
    { value: 'medium', label: 'Média', color: 'blue', icon: 'ri-subtract-line' },
    { value: 'high', label: 'Alta', color: 'yellow', icon: 'ri-arrow-up-line' },
    { value: 'urgent', label: 'Urgente', color: 'red', icon: 'ri-alarm-warning-line' }
  ];

  const contactMethodLabels: Record<string, string> = {
    'any': 'Qualquer',
    'email': 'E-mail',
    'phone': 'Telefone',
    'whatsapp': 'WhatsApp'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-customer-service-line text-yellow-500"></i>
            Gestão de Suporte Avançada
          </h2>
          <p className="text-gray-400 mt-1">Sistema completo de gestão de mensagens, newsletter e operações</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const data = activeTab === 'messages' ? messages : subscribers;
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${activeTab}-${Date.now()}.json`;
              a.click();
            }}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <i className="ri-download-line text-xl"></i>
            Exportar Dados
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => { setActiveTab('messages'); setCurrentPage(1); }}
          className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'messages'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
              : darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <i className="ri-mail-line mr-2"></i>
          Mensagens de Contato
        </button>
        <button
          onClick={() => { setActiveTab('newsletter'); setCurrentPage(1); }}
          className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'newsletter'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
              : darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <i className="ri-mail-send-line mr-2"></i>
          Newsletter
        </button>
        <button
          onClick={() => { setActiveTab('maintenance'); setCurrentPage(1); }}
          className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'maintenance'
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
              : darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <i className="ri-tools-line mr-2"></i>
          Modo Manutenção
        </button>
        <button
          onClick={() => { setActiveTab('tasks'); setCurrentPage(1); }}
          className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
              : darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <i className="ri-task-line mr-2"></i>
          Painel de Tarefas
        </button>
        <button
          onClick={() => { setActiveTab('simulate'); setCurrentPage(1); }}
          className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'simulate'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
              : darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <i className="ri-shopping-cart-2-line mr-2"></i>
          Simular Pedido
        </button>
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                <i className="ri-mail-line text-xl text-blue-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-3">
                <i className="ri-mail-add-line text-xl text-yellow-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Novas</p>
              <p className="text-2xl font-bold">{stats.newMessages}</p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                <i className="ri-mail-open-line text-xl text-purple-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Não Lidas</p>
              <p className="text-2xl font-bold">{stats.unread}</p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3">
                <i className="ri-time-line text-xl text-cyan-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Em Progresso</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                <i className="ri-check-line text-xl text-green-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Resolvidas</p>
              <p className="text-2xl font-bold">{stats.resolved}</p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-3">
                <i className="ri-alarm-warning-line text-xl text-red-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Urgentes</p>
              <p className="text-2xl font-bold">{stats.urgent}</p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mb-3">
                <i className="ri-mail-send-line text-xl text-orange-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Newsletter</p>
              <p className="text-2xl font-bold">{stats.withNewsletter}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Buscar por nome, email, assunto ou mensagem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer`}
            >
              <option value="all">Todos Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer`}
            >
              <option value="all">Todas Prioridades</option>
              {priorityOptions.map(priority => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
          </div>

          {/* Messages Table */}
          <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <i className="ri-mail-line text-6xl text-gray-600 mb-4"></i>
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Nenhuma mensagem encontrada
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                      <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                      <th className="px-6 py-4 text-left font-semibold">Contato</th>
                      <th className="px-6 py-4 text-left font-semibold">Assunto</th>
                      <th className="px-6 py-4 text-left font-semibold">Método</th>
                      <th className="px-6 py-4 text-left font-semibold">Prioridade</th>
                      <th className="px-6 py-4 text-left font-semibold">Data</th>
                      <th className="px-6 py-4 text-left font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((message) => (
                      <tr
                        key={message.id}
                        className={`border-t ${darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors ${!message.read_at ? 'font-semibold' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <select
                            value={message.status}
                            onChange={(e) => handleStatusChange(message.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border-none cursor-pointer ${
                              message.status === 'resolved'
                                ? 'bg-green-500/20 text-green-500'
                                : message.status === 'new'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : message.status === 'closed'
                                ? 'bg-gray-500/20 text-gray-500'
                                : message.status === 'waiting'
                                ? 'bg-purple-500/20 text-purple-500'
                                : 'bg-blue-500/20 text-blue-500'
                            }`}
                          >
                            {statusOptions.map(status => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {!message.read_at && (
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            )}
                            <div>
                              <p className="font-medium">{message.name}</p>
                              {message.newsletter_subscribed && (
                                <span className="inline-flex items-center gap-1 text-xs text-orange-500">
                                  <i className="ri-mail-send-line"></i>
                                  Newsletter
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}>
                              <i className="ri-mail-line"></i>
                              {message.email}
                            </p>
                            {message.phone && (
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}>
                                <i className="ri-phone-line"></i>
                                {message.phone}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{message.subject}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} line-clamp-1`}>
                            {message.message}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {contactMethodLabels[message.contact_method] || message.contact_method}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={message.priority}
                            onChange={(e) => handlePriorityChange(message.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border-none cursor-pointer ${
                              message.priority === 'urgent'
                                ? 'bg-red-500/20 text-red-500'
                                : message.priority === 'high'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : message.priority === 'medium'
                                ? 'bg-blue-500/20 text-blue-500'
                                : 'bg-gray-500/20 text-gray-500'
                            }`}
                          >
                            {priorityOptions.map(priority => (
                              <option key={priority.value} value={priority.value}>{priority.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(message.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedMessage(message);
                                setShowMessageModal(true);
                                if (!message.read_at) {
                                  markAsRead(message.id);
                                }
                              }}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors cursor-pointer"
                              title="Ver detalhes"
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                            <a
                              href={`mailto:${message.email}`}
                              className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                              title="Responder por e-mail"
                            >
                              <i className="ri-reply-line"></i>
                            </a>
                            {message.phone && (
                              <a
                                href={`tel:${message.phone}`}
                                className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
                                title="Ligar"
                              >
                                <i className="ri-phone-line"></i>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Página {currentPage} de {totalPages} ({messages.length} mensagens)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer'
                  } transition-colors`}
                >
                  <i className="ri-arrow-left-line"></i>
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-yellow-500 text-white'
                          : darkMode
                          ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } transition-colors cursor-pointer`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer'
                  } transition-colors`}
                >
                  <i className="ri-arrow-right-line"></i>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Newsletter Tab */}
      {activeTab === 'newsletter' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                <i className="ri-user-add-line text-xl text-green-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Assinantes</p>
              <p className="text-2xl font-bold">{subscribers.length}</p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                <i className="ri-check-line text-xl text-blue-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Ativos</p>
              <p className="text-2xl font-bold">{subscribers.filter(s => s.status === 'active').length}</p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-3">
                <i className="ri-mail-open-line text-xl text-yellow-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Taxa de Abertura</p>
              <p className="text-2xl font-bold">
                {subscribers.length > 0 
                  ? Math.round((subscribers.reduce((acc, s) => acc + s.email_opens, 0) / subscribers.length) * 100) / 100
                  : 0}%
              </p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                <i className="ri-cursor-line text-xl text-purple-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Taxa de Cliques</p>
              <p className="text-2xl font-bold">
                {subscribers.length > 0 
                  ? Math.round((subscribers.reduce((acc, s) => acc + s.email_clicks, 0) / subscribers.length) * 100) / 100
                  : 0}%
              </p>
            </div>
          </div>

          <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-12">
                <i className="ri-mail-send-line text-6xl text-gray-600 mb-4"></i>
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Nenhum assinante encontrado
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">E-mail</th>
                      <th className="px-6 py-4 text-left font-semibold">Nome</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                      <th className="px-6 py-4 text-left font-semibold">Origem</th>
                      <th className="px-6 py-4 text-left font-semibold">Aberturas</th>
                      <th className="px-6 py-4 text-left font-semibold">Cliques</th>
                      <th className="px-6 py-4 text-left font-semibold">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((subscriber) => (
                      <tr
                        key={subscriber.id}
                        className={`border-t ${darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium">{subscriber.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p>{subscriber.name || '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            subscriber.status === 'active'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-gray-500/20 text-gray-500'
                          }`}>
                            {subscriber.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {subscriber.source}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium">{subscriber.email_opens}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium">{subscriber.email_clicks}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(subscriber.subscribed_at).toLocaleDateString('pt-BR')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                  } transition-colors`}
                >
                  <i className="ri-arrow-left-line"></i>
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                  } transition-colors`}
                >
                  <i className="ri-arrow-right-line"></i>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Maintenance Mode Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className={`p-8 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Modo de Manutenção</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ative para exibir uma página de manutenção aos visitantes
                </p>
              </div>
              <button
                onClick={toggleMaintenanceMode}
                className={`px-8 py-4 rounded-lg font-bold text-lg transition-all cursor-pointer ${
                  maintenanceMode
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:opacity-90'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90'
                }`}
              >
                {maintenanceMode ? (
                  <span className="flex items-center gap-2">
                    <i className="ri-close-circle-line text-2xl"></i>
                    Desativar Manutenção
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <i className="ri-tools-line text-2xl"></i>
                    Ativar Manutenção
                  </span>
                )}
              </button>
            </div>

            <div className={`p-6 rounded-lg ${
              maintenanceMode 
                ? 'bg-red-500/10 border-2 border-red-500' 
                : 'bg-green-500/10 border-2 border-green-500'
            }`}>
              <div className="flex items-center gap-3">
                <i className={`text-3xl ${
                  maintenanceMode ? 'ri-error-warning-line text-red-500' : 'ri-check-line text-green-500'
                }`}></i>
                <div>
                  <p className="font-bold text-lg">
                    {maintenanceMode ? 'Site em Modo de Manutenção' : 'Site Operacional'}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {maintenanceMode 
                      ? 'Os visitantes verão uma página de manutenção. Apenas administradores podem acessar.'
                      : 'O site está funcionando normalmente para todos os visitantes.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <h4 className="font-bold text-lg mb-4">Quando Usar?</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-green-500 text-xl mt-0.5"></i>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Atualizações importantes do sistema
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-green-500 text-xl mt-0.5"></i>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Manutenção de servidor ou banco de dados
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-green-500 text-xl mt-0.5"></i>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Implementação de novas funcionalidades
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-line text-green-500 text-xl mt-0.5"></i>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Correção de problemas críticos
                  </span>
                </li>
              </ul>
            </div>

            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <h4 className="font-bold text-lg mb-4">Dicas Importantes</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <i className="ri-lightbulb-line text-yellow-500 text-xl mt-0.5"></i>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Avise os clientes com antecedência
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-lightbulb-line text-yellow-500 text-xl mt-0.5"></i>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Escolha horários de menor tráfego
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-lightbulb-line text-yellow-500 text-xl mt-0.5"></i>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Mantenha a manutenção o mais breve possível
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-lightbulb-line text-yellow-500 text-xl mt-0.5"></i>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Teste tudo antes de desativar o modo
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Painel de Tarefas da Equipe</h3>
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <i className="ri-add-line text-xl"></i>
              Nova Tarefa
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-3">
                <i className="ri-time-line text-xl text-yellow-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Pendentes</p>
              <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'pending').length}</p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                <i className="ri-play-line text-xl text-blue-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Em Progresso</p>
              <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'in_progress').length}</p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                <i className="ri-check-line text-xl text-green-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Concluídas</p>
              <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                <i className="ri-list-check text-xl text-purple-500"></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total</p>
              <p className="text-2xl font-bold">{tasks.length}</p>
            </div>
          </div>

          <div className={`p-8 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'} text-center`}>
            <i className="ri-task-line text-6xl text-gray-600 mb-4"></i>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Sistema de tarefas em desenvolvimento
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
              Em breve você poderá gerenciar todas as tarefas da equipe aqui
            </p>
          </div>
        </div>
      )}

      {/* Simulate Order Tab */}
      {activeTab === 'simulate' && (
        <div className="space-y-6">
          <div className={`p-8 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="text-center mb-8">
              <i className="ri-shopping-cart-2-line text-6xl text-cyan-500 mb-4"></i>
              <h3 className="text-2xl font-bold mb-2">Simulador de Pedidos</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Teste o fluxo completo de compra do seu e-commerce
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setShowSimulateModal(true)}
                className="p-6 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                <i className="ri-shopping-bag-line text-4xl mb-3"></i>
                <h4 className="font-bold text-lg mb-2">Pedido Simples</h4>
                <p className="text-sm opacity-90">1 produto, pagamento único</p>
              </button>

              <button
                onClick={() => setShowSimulateModal(true)}
                className="p-6 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                <i className="ri-shopping-cart-line text-4xl mb-3"></i>
                <h4 className="font-bold text-lg mb-2">Pedido Múltiplo</h4>
                <p className="text-sm opacity-90">Vários produtos, envio calculado</p>
              </button>

              <button
                onClick={() => setShowSimulateModal(true)}
                className="p-6 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                <i className="ri-gift-line text-4xl mb-3"></i>
                <h4 className="font-bold text-lg mb-2">Com Cupom</h4>
                <p className="text-sm opacity-90">Teste descontos e promoções</p>
              </button>
            </div>

            <div className={`mt-8 p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h4 className="font-bold mb-4">O que será testado:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <i className="ri-check-line text-green-500 text-xl"></i>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Cálculo de envio</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="ri-check-line text-green-500 text-xl"></i>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Processamento de pagamento</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="ri-check-line text-green-500 text-xl"></i>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Aplicação de cupons</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="ri-check-line text-green-500 text-xl"></i>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Envio de e-mails</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="ri-check-line text-green-500 text-xl"></i>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Atualização de stock</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="ri-check-line text-green-500 text-xl"></i>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Geração de fatura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} p-6 flex items-center justify-between`}>
              <h3 className="text-2xl font-bold">Detalhes da Mensagem</h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <i className="ri-user-line text-blue-500"></i>
                  Informações do Cliente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Nome</p>
                    <p className="font-medium">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>E-mail</p>
                    <p className="font-medium">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Telefone</p>
                      <p className="font-medium">{selectedMessage.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Método de Contato Preferido</p>
                    <p className="font-medium">{contactMethodLabels[selectedMessage.contact_method]}</p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <i className="ri-message-3-line text-yellow-500"></i>
                  Mensagem
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Assunto</p>
                    <p className="font-medium text-lg">{selectedMessage.subject}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Conteúdo</p>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <i className="ri-information-line text-purple-500"></i>
                  Informações Adicionais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Data de Envio</p>
                    <p className="font-medium">
                      {new Date(selectedMessage.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Origem</p>
                    <p className="font-medium">{selectedMessage.source}</p>
                  </div>
                  {selectedMessage.ip_address && (
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>IP</p>
                      <p className="font-medium font-mono text-sm">{selectedMessage.ip_address}</p>
                    </div>
                  )}
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Newsletter</p>
                    <p className="font-medium">
                      {selectedMessage.newsletter_subscribed ? (
                        <span className="text-green-500">✓ Inscrito</span>
                      ) : (
                        <span className="text-gray-500">✗ Não inscrito</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity text-center"
                >
                  <i className="ri-reply-line mr-2"></i>
                  Responder por E-mail
                </a>
                {selectedMessage.phone && (
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity text-center"
                  >
                    <i className="ri-phone-line mr-2"></i>
                    Ligar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
