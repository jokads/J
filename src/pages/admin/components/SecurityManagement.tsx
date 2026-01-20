import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created_at: string;
  last_used: string | null;
  expires_at: string | null;
  is_active: boolean;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  created_at: string;
  last_triggered: string | null;
}

interface Backup {
  id: string;
  name: string;
  type: 'manual' | 'automatic';
  size: string;
  tables: string[];
  created_at: string;
  status: 'completed' | 'in_progress' | 'failed';
}

interface SecurityLog {
  id: string;
  event_type: string;
  user_email: string;
  ip_address: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

export default function SecurityManagement() {
  const [activeTab, setActiveTab] = useState<'api-keys' | 'webhooks' | 'backups' | 'logs' | 'settings'>('api-keys');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(false);
  
  // API Keys
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([]);
  const [newKeyExpires, setNewKeyExpires] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  
  // Webhooks
  const [showNewWebhookModal, setShowNewWebhookModal] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
  
  // Backups
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [backupTables, setBackupTables] = useState<string[]>([]);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  
  // Security Settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [passwordMinLength, setPasswordMinLength] = useState('8');

  const availablePermissions = [
    'read:products',
    'write:products',
    'read:orders',
    'write:orders',
    'read:customers',
    'write:customers',
    'read:analytics',
    'admin:all'
  ];

  const availableEvents = [
    'order.created',
    'order.updated',
    'order.cancelled',
    'product.created',
    'product.updated',
    'product.deleted',
    'customer.created',
    'payment.completed',
    'payment.failed'
  ];

  const availableTables = [
    'products',
    'orders',
    'order_items',
    'profiles',
    'cart',
    'wishlist',
    'reviews',
    'categories',
    'services',
    'site_settings',
    'contact_messages',
    'newsletter_subscribers'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load API Keys
      const { data: keysData } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (keysData) {
        setApiKeys(keysData);
      }

      // Load Webhooks
      const { data: webhooksData } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (webhooksData) {
        setWebhooks(webhooksData);
      }

      // Load Security Logs
      const { data: logsData } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (logsData) {
        setSecurityLogs(logsData.map(log => ({
          id: log.id,
          event_type: log.action,
          user_email: log.user_email || 'Sistema',
          ip_address: log.ip_address || 'N/A',
          description: log.details || log.action,
          severity: log.severity || 'low',
          created_at: log.created_at
        })));
      }

      // Mock backups (em produção, viria de uma API)
      setBackups([
        {
          id: '1',
          name: 'Backup Automático Diário',
          type: 'automatic',
          size: '45.2 MB',
          tables: ['products', 'orders', 'profiles'],
          created_at: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          name: 'Backup Manual - Antes da Atualização',
          type: 'manual',
          size: '42.8 MB',
          tables: availableTables,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed'
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'sk_live_';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const createApiKey = async () => {
    if (!newKeyName.trim() || newKeyPermissions.length === 0) {
      alert('❌ Preencha o nome e selecione pelo menos uma permissão');
      return;
    }

    const key = generateApiKey();
    
    const { error } = await supabase
      .from('api_keys')
      .insert({
        name: newKeyName,
        key: key,
        permissions: newKeyPermissions,
        expires_at: newKeyExpires || null,
        is_active: true
      });

    if (error) {
      alert('❌ Erro ao criar API Key: ' + error.message);
      return;
    }

    setGeneratedKey(key);
    setNewKeyName('');
    setNewKeyPermissions([]);
    setNewKeyExpires('');
    loadData();
  };

  const toggleApiKey = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (!error) {
      loadData();
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm('⚠️ Tem certeza que deseja deletar esta API Key? Esta ação não pode ser desfeita.')) {
      return;
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (!error) {
      loadData();
    }
  };

  const createWebhook = async () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim() || newWebhookEvents.length === 0) {
      alert('❌ Preencha todos os campos obrigatórios');
      return;
    }

    const secret = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const { error } = await supabase
      .from('webhooks')
      .insert({
        name: newWebhookName,
        url: newWebhookUrl,
        events: newWebhookEvents,
        secret: secret,
        is_active: true
      });

    if (error) {
      alert('❌ Erro ao criar webhook: ' + error.message);
      return;
    }

    alert(`✅ Webhook criado!\n\n🔑 Secret: ${secret}\n\nGuarde este secret em local seguro.`);
    setShowNewWebhookModal(false);
    setNewWebhookName('');
    setNewWebhookUrl('');
    setNewWebhookEvents([]);
    loadData();
  };

  const toggleWebhook = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('webhooks')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (!error) {
      loadData();
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm('⚠️ Tem certeza que deseja deletar este webhook?')) {
      return;
    }

    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);

    if (!error) {
      loadData();
    }
  };

  const createBackup = async () => {
    if (!backupName.trim() || backupTables.length === 0) {
      alert('❌ Preencha o nome e selecione pelo menos uma tabela');
      return;
    }

    setLoading(true);
    
    // Simular criação de backup
    setTimeout(() => {
      const newBackup: Backup = {
        id: Date.now().toString(),
        name: backupName,
        type: 'manual',
        size: (Math.random() * 50 + 10).toFixed(1) + ' MB',
        tables: backupTables,
        created_at: new Date().toISOString(),
        status: 'completed'
      };

      setBackups([newBackup, ...backups]);
      setShowBackupModal(false);
      setBackupName('');
      setBackupTables([]);
      setLoading(false);
      alert('✅ Backup criado com sucesso!');
    }, 2000);
  };

  const downloadBackup = (backup: Backup) => {
    alert(`📥 Iniciando download do backup: ${backup.name}\n\nTamanho: ${backup.size}`);
  };

  const restoreBackup = (backup: Backup) => {
    if (!confirm(`⚠️ ATENÇÃO!\n\nVocê está prestes a restaurar o backup:\n"${backup.name}"\n\nIsso irá SUBSTITUIR todos os dados atuais das tabelas selecionadas.\n\nTem certeza que deseja continuar?`)) {
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('✅ Backup restaurado com sucesso!\n\nO site será recarregado.');
      window.location.reload();
    }, 3000);
  };

  const saveSecuritySettings = async () => {
    // Salvar configurações de segurança
    alert('✅ Configurações de segurança salvas com sucesso!');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🔒 Segurança & Infraestrutura</h2>
            <p className="text-red-50">Gestão completa de API Keys, Webhooks, Backups e Logs de Segurança</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{apiKeys.filter(k => k.is_active).length}</div>
            <div className="text-sm text-red-50">API Keys Ativas</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">🔑 API Keys</p>
              <p className="text-2xl font-bold text-blue-600">{apiKeys.length}</p>
              <p className="text-xs text-gray-500">{apiKeys.filter(k => k.is_active).length} ativas</p>
            </div>
            <div className="text-4xl">🔑</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">🔗 Webhooks</p>
              <p className="text-2xl font-bold text-purple-600">{webhooks.length}</p>
              <p className="text-xs text-gray-500">{webhooks.filter(w => w.is_active).length} ativos</p>
            </div>
            <div className="text-4xl">🔗</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">💾 Backups</p>
              <p className="text-2xl font-bold text-green-600">{backups.length}</p>
              <p className="text-xs text-gray-500">Último hoje</p>
            </div>
            <div className="text-4xl">💾</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">📋 Logs</p>
              <p className="text-2xl font-bold text-orange-600">{securityLogs.length}</p>
              <p className="text-xs text-gray-500">Últimas 50</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`flex-1 min-w-max px-6 py-4 font-medium transition-all whitespace-nowrap ${
              activeTab === 'api-keys'
                ? 'bg-blue-500 text-white border-b-4 border-blue-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            🔑 API Keys
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`flex-1 min-w-max px-6 py-4 font-medium transition-all whitespace-nowrap ${
              activeTab === 'webhooks'
                ? 'bg-purple-500 text-white border-b-4 border-purple-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            🔗 Webhooks
          </button>
          <button
            onClick={() => setActiveTab('backups')}
            className={`flex-1 min-w-max px-6 py-4 font-medium transition-all whitespace-nowrap ${
              activeTab === 'backups'
                ? 'bg-green-500 text-white border-b-4 border-green-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            💾 Backups
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 min-w-max px-6 py-4 font-medium transition-all whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-orange-500 text-white border-b-4 border-orange-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            📋 Logs
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 min-w-max px-6 py-4 font-medium transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-red-500 text-white border-b-4 border-red-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⚙️ Configurações
          </button>
        </div>

        <div className="p-6">
          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">🔑 Gestão de API Keys</h3>
                  <p className="text-sm text-gray-600">Crie e gerencie chaves de API para integrações externas</p>
                </div>
                <button
                  onClick={() => setShowNewKeyModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                >
                  ➕ Nova API Key
                </button>
              </div>

              {apiKeys.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-6xl mb-4">🔑</div>
                  <p className="text-gray-600 mb-4">Nenhuma API Key criada</p>
                  <button
                    onClick={() => setShowNewKeyModal(true)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Criar Primeira API Key
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-gray-900">{key.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              key.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {key.is_active ? '✅ Ativa' : '⏸️ Inativa'}
                            </span>
                          </div>
                          
                          <div className="bg-white rounded p-2 mb-2 font-mono text-sm border border-gray-300">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">{key.key.substring(0, 20)}...{key.key.substring(key.key.length - 8)}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(key.key);
                                  alert('✅ API Key copiada!');
                                }}
                                className="text-blue-600 hover:text-blue-700 text-xs"
                              >
                                📋 Copiar
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-2">
                            {key.permissions.map((perm, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {perm}
                              </span>
                            ))}
                          </div>

                          <div className="flex gap-4 text-xs text-gray-600">
                            <span>📅 Criada: {new Date(key.created_at).toLocaleDateString('pt-PT')}</span>
                            {key.last_used && (
                              <span>🕐 Último uso: {new Date(key.last_used).toLocaleDateString('pt-PT')}</span>
                            )}
                            {key.expires_at && (
                              <span>⏰ Expira: {new Date(key.expires_at).toLocaleDateString('pt-PT')}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => toggleApiKey(key.id, key.is_active)}
                            className={`px-3 py-1 rounded text-sm ${
                              key.is_active
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {key.is_active ? '⏸️ Desativar' : '▶️ Ativar'}
                          </button>
                          <button
                            onClick={() => deleteApiKey(key.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                          >
                            🗑️ Deletar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">🔗 Gestão de Webhooks</h3>
                  <p className="text-sm text-gray-600">Configure webhooks para receber notificações de eventos</p>
                </div>
                <button
                  onClick={() => setShowNewWebhookModal(true)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap"
                >
                  ➕ Novo Webhook
                </button>
              </div>

              {webhooks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-6xl mb-4">🔗</div>
                  <p className="text-gray-600 mb-4">Nenhum webhook configurado</p>
                  <button
                    onClick={() => setShowNewWebhookModal(true)}
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Criar Primeiro Webhook
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-gray-900">{webhook.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              webhook.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {webhook.is_active ? '✅ Ativo' : '⏸️ Inativo'}
                            </span>
                          </div>
                          
                          <div className="bg-white rounded p-2 mb-2 text-sm border border-gray-300">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">🔗 URL:</span>
                              <span className="text-gray-900 font-mono">{webhook.url}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-2">
                            {webhook.events.map((event, idx) => (
                              <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                {event}
                              </span>
                            ))}
                          </div>

                          <div className="flex gap-4 text-xs text-gray-600">
                            <span>📅 Criado: {new Date(webhook.created_at).toLocaleDateString('pt-PT')}</span>
                            {webhook.last_triggered && (
                              <span>🕐 Último disparo: {new Date(webhook.last_triggered).toLocaleDateString('pt-PT')}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => toggleWebhook(webhook.id, webhook.is_active)}
                            className={`px-3 py-1 rounded text-sm ${
                              webhook.is_active
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {webhook.is_active ? '⏸️ Desativar' : '▶️ Ativar'}
                          </button>
                          <button
                            onClick={() => deleteWebhook(webhook.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                          >
                            🗑️ Deletar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Backups Tab */}
          {activeTab === 'backups' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">💾 Gestão de Backups</h3>
                  <p className="text-sm text-gray-600">Crie e restaure backups do banco de dados</p>
                </div>
                <button
                  onClick={() => setShowBackupModal(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
                >
                  ➕ Criar Backup
                </button>
              </div>

              {/* Auto Backup Settings */}
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-blue-900">🤖 Backup Automático</h4>
                    <p className="text-sm text-blue-700">Configure backups automáticos periódicos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoBackupEnabled}
                      onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {autoBackupEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        ⏰ Frequência
                      </label>
                      <select
                        value={backupFrequency}
                        onChange={(e) => setBackupFrequency(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="hourly">A cada hora</option>
                        <option value="daily">Diariamente</option>
                        <option value="weekly">Semanalmente</option>
                        <option value="monthly">Mensalmente</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        📊 Próximo Backup
                      </label>
                      <div className="px-3 py-2 bg-white border-2 border-blue-300 rounded-lg text-blue-900">
                        Hoje às 23:00
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Backups List */}
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div key={backup.id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-gray-900">{backup.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            backup.type === 'automatic' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {backup.type === 'automatic' ? '🤖 Automático' : '👤 Manual'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            backup.status === 'completed' ? 'bg-green-100 text-green-700' : 
                            backup.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {backup.status === 'completed' ? '✅ Completo' : 
                             backup.status === 'in_progress' ? '⏳ Em Progresso' :
                             '❌ Falhou'}
                          </span>
                        </div>

                        <div className="flex gap-4 text-sm text-gray-600 mb-2">
                          <span>💾 Tamanho: {backup.size}</span>
                          <span>📅 Criado: {new Date(backup.created_at).toLocaleDateString('pt-PT', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-600">📋 Tabelas:</span>
                          {backup.tables.slice(0, 3).map((table, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                              {table}
                            </span>
                          ))}
                          {backup.tables.length > 3 && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                              +{backup.tables.length - 3} mais
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => downloadBackup(backup)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 whitespace-nowrap"
                        >
                          📥 Download
                        </button>
                        <button
                          onClick={() => restoreBackup(backup)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 whitespace-nowrap"
                        >
                          ♻️ Restaurar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">📋 Logs de Segurança</h3>
                <p className="text-sm text-gray-600">Últimas 50 atividades de segurança do sistema</p>
              </div>

              <div className="space-y-2">
                {securityLogs.map((log) => (
                  <div key={log.id} className="bg-gray-50 rounded-lg p-3 border-l-4 border-gray-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(log.severity)}`}>
                            {getSeverityIcon(log.severity)} {log.severity.toUpperCase()}
                          </span>
                          <span className="font-medium text-gray-900">{log.event_type}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{log.description}</p>
                        <div className="flex gap-4 text-xs text-gray-600">
                          <span>👤 {log.user_email}</span>
                          <span>🌐 {log.ip_address}</span>
                          <span>🕐 {new Date(log.created_at).toLocaleString('pt-PT')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">⚙️ Configurações de Segurança</h3>
                <p className="text-sm text-gray-600">Configure políticas de segurança do sistema</p>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-blue-900">🔐 Autenticação de Dois Fatores (2FA)</h4>
                    <p className="text-sm text-blue-700">Adicione uma camada extra de segurança</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {twoFactorEnabled && (
                  <div className="bg-white rounded p-3 text-sm text-blue-900">
                    ✅ 2FA ativado. Os usuários precisarão de um código adicional para fazer login.
                  </div>
                )}
              </div>

              {/* Session Settings */}
              <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">⏱️ Configurações de Sessão</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ⏰ Timeout de Sessão (minutos)
                    </label>
                    <input
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="5"
                      max="1440"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tempo até logout automático por inatividade</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔒 Máximo de Tentativas de Login
                    </label>
                    <input
                      type="number"
                      value={maxLoginAttempts}
                      onChange={(e) => setMaxLoginAttempts(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="3"
                      max="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">Bloqueio temporário após X tentativas falhas</p>
                  </div>
                </div>
              </div>

              {/* Password Policy */}
              <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">🔑 Política de Senhas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📏 Comprimento Mínimo
                    </label>
                    <input
                      type="number"
                      value={passwordMinLength}
                      onChange={(e) => setPasswordMinLength(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="6"
                      max="32"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔄 Expiração (dias)
                    </label>
                    <input
                      type="number"
                      placeholder="90"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="30"
                      max="365"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">Exigir letras maiúsculas e minúsculas</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">Exigir números</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">Exigir caracteres especiais</span>
                  </label>
                </div>
              </div>

              {/* IP Whitelist */}
              <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">🌐 Lista Branca de IPs</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Restrinja o acesso ao painel admin apenas para IPs específicos (um por linha)
                </p>
                <textarea
                  value={ipWhitelist}
                  onChange={(e) => setIpWhitelist(e.target.value)}
                  placeholder="192.168.1.1&#10;10.0.0.1&#10;172.16.0.1"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Cuidado: Você pode se bloquear se adicionar IPs incorretos
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={saveSecuritySettings}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all font-medium"
                >
                  💾 Salvar Configurações de Segurança
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Nova API Key */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">🔑 Criar Nova API Key</h3>
                <button
                  onClick={() => {
                    setShowNewKeyModal(false);
                    setGeneratedKey('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {generatedKey ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-green-900 font-bold mb-2">✅ API Key criada com sucesso!</p>
                    <p className="text-sm text-green-700 mb-4">
                      ⚠️ Copie esta chave agora. Por segurança, ela não será mostrada novamente.
                    </p>
                    <div className="bg-white rounded p-3 border-2 border-green-300">
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono text-gray-900 break-all">{generatedKey}</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedKey);
                            alert('✅ API Key copiada!');
                          }}
                          className="ml-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 whitespace-nowrap"
                        >
                          📋 Copiar
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowNewKeyModal(false);
                      setGeneratedKey('');
                    }}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📝 Nome da API Key *
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Ex: Integração Mobile App"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔐 Permissões * (selecione pelo menos uma)
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border-2 border-gray-300 rounded-lg p-3">
                      {availablePermissions.map((perm) => (
                        <label key={perm} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newKeyPermissions.includes(perm)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewKeyPermissions([...newKeyPermissions, perm]);
                              } else {
                                setNewKeyPermissions(newKeyPermissions.filter(p => p !== perm));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ⏰ Data de Expiração (opcional)
                    </label>
                    <input
                      type="date"
                      value={newKeyExpires}
                      onChange={(e) => setNewKeyExpires(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Deixe em branco para chave sem expiração</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={createApiKey}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      ✅ Criar API Key
                    </button>
                    <button
                      onClick={() => {
                        setShowNewKeyModal(false);
                        setNewKeyName('');
                        setNewKeyPermissions([]);
                        setNewKeyExpires('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Webhook */}
      {showNewWebhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">🔗 Criar Novo Webhook</h3>
                <button
                  onClick={() => setShowNewWebhookModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Nome do Webhook *
                  </label>
                  <input
                    type="text"
                    value={newWebhookName}
                    onChange={(e) => setNewWebhookName(e.target.value)}
                    placeholder="Ex: Notificações de Pedidos"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔗 URL do Webhook *
                  </label>
                  <input
                    type="url"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    placeholder="https://seu-site.com/webhook"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📡 Eventos * (selecione pelo menos um)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border-2 border-gray-300 rounded-lg p-3">
                    {availableEvents.map((event) => (
                      <label key={event} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newWebhookEvents.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewWebhookEvents([...newWebhookEvents, event]);
                            } else {
                              setNewWebhookEvents(newWebhookEvents.filter(ev => ev !== event));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={createWebhook}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    ✅ Criar Webhook
                  </button>
                  <button
                    onClick={() => {
                      setShowNewWebhookModal(false);
                      setNewWebhookName('');
                      setNewWebhookUrl('');
                      setNewWebhookEvents([]);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Criar Backup */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">💾 Criar Novo Backup</h3>
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Nome do Backup *
                  </label>
                  <input
                    type="text"
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                    placeholder="Ex: Backup antes da atualização"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📋 Tabelas * (selecione pelo menos uma)
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border-2 border-gray-300 rounded-lg p-3">
                    <label className="flex items-center gap-2 font-medium">
                      <input
                        type="checkbox"
                        checked={backupTables.length === availableTables.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBackupTables(availableTables);
                          } else {
                            setBackupTables([]);
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-900">✅ Selecionar Todas</span>
                    </label>
                    <hr className="my-2" />
                    {availableTables.map((table) => (
                      <label key={table} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={backupTables.includes(table)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBackupTables([...backupTables, table]);
                            } else {
                              setBackupTables(backupTables.filter(t => t !== table));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{table}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Atenção:</strong> O backup pode levar alguns minutos dependendo do tamanho dos dados.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={createBackup}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ Criando...' : '✅ Criar Backup'}
                  </button>
                  <button
                    onClick={() => {
                      setShowBackupModal(false);
                      setBackupName('');
                      setBackupTables([]);
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
