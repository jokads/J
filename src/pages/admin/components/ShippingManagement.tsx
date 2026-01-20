import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface ShippingRule {
  id: string;
  name: string;
  country: string;
  country_code: string;
  method: string;
  base_cost: number;
  cost_per_kg: number;
  free_shipping_threshold: number | null;
  min_delivery_days: number;
  max_delivery_days: number;
  active: boolean;
  priority: number;
  weight_based: boolean;
  created_at: string;
}

// Países da Europa com códigos
const EUROPEAN_COUNTRIES = [
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: 'UK', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'NL', name: 'Holanda', flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'AT', name: 'Áustria', flag: '🇦🇹' },
  { code: 'CH', name: 'Suíça', flag: '🇨🇭' },
  { code: 'IE', name: 'Irlanda', flag: '🇮🇪' },
  { code: 'DK', name: 'Dinamarca', flag: '🇩🇰' },
  { code: 'SE', name: 'Suécia', flag: '🇸🇪' },
  { code: 'NO', name: 'Noruega', flag: '🇳🇴' },
  { code: 'FI', name: 'Finlândia', flag: '🇫🇮' },
  { code: 'PL', name: 'Polónia', flag: '🇵🇱' },
  { code: 'CZ', name: 'República Checa', flag: '🇨🇿' },
  { code: 'GR', name: 'Grécia', flag: '🇬🇷' },
  { code: 'HU', name: 'Hungria', flag: '🇭🇺' },
  { code: 'RO', name: 'Roménia', flag: '🇷🇴' },
];

// Métodos de envio
const SHIPPING_METHODS = [
  { value: 'standard', label: '📦 Standard', description: 'Entrega normal' },
  { value: 'express', label: '⚡ Express', description: 'Entrega rápida' },
  { value: 'priority', label: '🚀 Priority', description: 'Entrega prioritária' },
  { value: 'economy', label: '💰 Economy', description: 'Entrega económica' },
];

export default function ShippingManagement() {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ShippingRule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    country_code: '',
    method: 'standard',
    base_cost: 0,
    cost_per_kg: 0,
    free_shipping_threshold: null as number | null,
    min_delivery_days: 3,
    max_delivery_days: 7,
    active: true,
    priority: 1,
    weight_based: true,
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shipping_rules')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Erro ao carregar regras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRule) {
        const { error } = await supabase
          .from('shipping_rules')
          .update(formData)
          .eq('id', editingRule.id);

        if (error) throw error;
        alert('✅ Regra atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('shipping_rules')
          .insert([formData]);

        if (error) throw error;
        alert('✅ Regra criada com sucesso!');
      }

      setShowModal(false);
      setEditingRule(null);
      resetForm();
      loadRules();
    } catch (error) {
      console.error('Erro ao salvar regra:', error);
      alert('❌ Erro ao salvar regra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('⚠️ Tem certeza que deseja deletar esta regra?')) return;

    try {
      const { error } = await supabase
        .from('shipping_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Regra deletada com sucesso!');
      loadRules();
    } catch (error) {
      console.error('Erro ao deletar regra:', error);
      alert('❌ Erro ao deletar regra');
    }
  };

  const handleToggleActive = async (rule: ShippingRule) => {
    try {
      const { error } = await supabase
        .from('shipping_rules')
        .update({ active: !rule.active })
        .eq('id', rule.id);

      if (error) throw error;
      loadRules();
    } catch (error) {
      console.error('Erro ao alternar status:', error);
      alert('❌ Erro ao alternar status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      country_code: '',
      method: 'standard',
      base_cost: 0,
      cost_per_kg: 0,
      free_shipping_threshold: null,
      min_delivery_days: 3,
      max_delivery_days: 7,
      active: true,
      priority: 1,
      weight_based: true,
    });
  };

  const openEditModal = (rule: ShippingRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      country: rule.country,
      country_code: rule.country_code,
      method: rule.method,
      base_cost: rule.base_cost,
      cost_per_kg: rule.cost_per_kg,
      free_shipping_threshold: rule.free_shipping_threshold,
      min_delivery_days: rule.min_delivery_days,
      max_delivery_days: rule.max_delivery_days,
      active: rule.active,
      priority: rule.priority,
      weight_based: rule.weight_based,
    });
    setShowModal(true);
  };

  const handleCountrySelect = (countryCode: string) => {
    const country = EUROPEAN_COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      setFormData({
        ...formData,
        country: country.name,
        country_code: countryCode,
        name: `${country.name} - ${SHIPPING_METHODS.find(m => m.value === formData.method)?.label || 'Standard'}`,
      });
    }
  };

  const handleMethodSelect = (method: string) => {
    const country = EUROPEAN_COUNTRIES.find(c => c.code === formData.country_code);
    setFormData({
      ...formData,
      method,
      name: country ? `${country.name} - ${SHIPPING_METHODS.find(m => m.value === method)?.label || 'Standard'}` : '',
    });
  };

  // Filtros
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filterCountry === 'all' || rule.country_code === filterCountry;
    const matchesMethod = filterMethod === 'all' || rule.method === filterMethod;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && rule.active) ||
                         (filterStatus === 'inactive' && !rule.active);

    return matchesSearch && matchesCountry && matchesMethod && matchesStatus;
  });

  // Estatísticas
  const stats = {
    total: rules.length,
    active: rules.filter(r => r.active).length,
    countries: new Set(rules.map(r => r.country_code)).size,
    freeShipping: rules.filter(r => r.free_shipping_threshold !== null).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando regras de envio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2 whitespace-nowrap">
          <i className="ri-truck-line text-blue-600"></i>
          Gestão de Envios Inteligente
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure taxas de envio por país da Europa com cálculo automático
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-file-list-3-line text-3xl opacity-80"></i>
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <h3 className="font-semibold">Total de Regras</h3>
          <p className="text-sm opacity-90">Todas cadastradas</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-checkbox-circle-line text-3xl opacity-80"></i>
            <span className="text-2xl font-bold">{stats.active}</span>
          </div>
          <h3 className="font-semibold">Regras Ativas</h3>
          <p className="text-sm opacity-90">Em funcionamento</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-map-2-line text-3xl opacity-80"></i>
            <span className="text-2xl font-bold">{stats.countries}</span>
          </div>
          <h3 className="font-semibold">Países Cobertos</h3>
          <p className="text-sm opacity-90">Europa disponível</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-gift-line text-3xl opacity-80"></i>
            <span className="text-2xl font-bold">{stats.freeShipping}</span>
          </div>
          <h3 className="font-semibold">Envio Grátis</h3>
          <p className="text-sm opacity-90">Regras configuradas</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar por nome ou país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Country Filter */}
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
          >
            <option value="all">🌍 Todos os Países</option>
            {EUROPEAN_COUNTRIES.map(country => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>

          {/* Method Filter */}
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
          >
            <option value="all">📦 Todos os Métodos</option>
            {SHIPPING_METHODS.map(method => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
          >
            <option value="all">📊 Todos os Status</option>
            <option value="active">✅ Ativos</option>
            <option value="inactive">❌ Inativos</option>
          </select>

          {/* New Rule Button */}
          <button
            onClick={() => {
              resetForm();
              setEditingRule(null);
              setShowModal(true);
            }}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-add-line text-xl"></i>
            Nova Regra
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  País
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  Custo Base
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  Por Kg
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  Envio Grátis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  Prazo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  Prioridade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <i className="ri-inbox-line text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {searchTerm || filterCountry !== 'all' || filterMethod !== 'all' || filterStatus !== 'all'
                        ? 'Nenhuma regra encontrada com os filtros aplicados'
                        : 'Nenhuma regra de envio cadastrada'}
                    </p>
                    <button
                      onClick={() => {
                        resetForm();
                        setEditingRule(null);
                        setShowModal(true);
                      }}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all duration-200 whitespace-nowrap"
                    >
                      Criar Primeira Regra
                    </button>
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => {
                  const country = EUROPEAN_COUNTRIES.find(c => c.code === rule.country_code);
                  const method = SHIPPING_METHODS.find(m => m.value === rule.method);

                  return (
                    <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{country?.flag}</span>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {rule.country}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {rule.country_code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{method?.label.split(' ')[0]}</span>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {method?.label.split(' ')[1]}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {method?.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          €{rule.base_cost.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {rule.weight_based ? (
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            €{rule.cost_per_kg.toFixed(2)}/kg
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {rule.free_shipping_threshold ? (
                          <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                            <i className="ri-gift-line"></i>
                            <span className="font-semibold">€{rule.free_shipping_threshold.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <i className="ri-time-line"></i>
                          <span className="font-medium">
                            {rule.min_delivery_days}-{rule.max_delivery_days} dias
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                          #{rule.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(rule)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${
                            rule.active
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                          }`}
                        >
                          {rule.active ? '✅ Ativo' : '❌ Inativo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(rule)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <i className="ri-edit-line text-xl"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Deletar"
                          >
                            <i className="ri-delete-bin-line text-xl"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingRule ? '✏️ Editar Regra de Envio' : '➕ Nova Regra de Envio'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingRule(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* País e Método */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🌍 País *
                  </label>
                  <select
                    value={formData.country_code}
                    onChange={(e) => handleCountrySelect(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um país</option>
                    {EUROPEAN_COUNTRIES.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📦 Método de Envio *
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) => handleMethodSelect(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {SHIPPING_METHODS.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label} - {method.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nome da Regra */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📝 Nome da Regra *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ex: Portugal - Express"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Custos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    💰 Custo Base (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_cost}
                    onChange={(e) => setFormData({ ...formData, base_cost: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Custo fixo de envio
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ⚖️ Custo por Kg (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_per_kg}
                    onChange={(e) => setFormData({ ...formData, cost_per_kg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Custo adicional por kg
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🎁 Envio Grátis Acima (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.free_shipping_threshold || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      free_shipping_threshold: e.target.value ? parseFloat(e.target.value) : null 
                    })}
                    placeholder="Opcional"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Valor mínimo para envio grátis
                  </p>
                </div>
              </div>

              {/* Prazo de Entrega */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📅 Prazo Mínimo (dias) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.min_delivery_days}
                    onChange={(e) => setFormData({ ...formData, min_delivery_days: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📅 Prazo Máximo (dias) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_delivery_days}
                    onChange={(e) => setFormData({ ...formData, max_delivery_days: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Prioridade e Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🎯 Prioridade *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Ordem de exibição (menor = primeiro)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ⚙️ Configurações
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.weight_based}
                        onChange={(e) => setFormData({ ...formData, weight_based: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Baseado em peso
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Ativar regra
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <i className="ri-eye-line"></i>
                  Preview da Regra
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">País:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {EUROPEAN_COUNTRIES.find(c => c.code === formData.country_code)?.flag} {formData.country || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Método:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {SHIPPING_METHODS.find(m => m.value === formData.method)?.label || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Custo Base:</span>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      €{formData.base_cost.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Custo por Kg:</span>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      {formData.weight_based ? `€${formData.cost_per_kg.toFixed(2)}/kg` : 'Não aplicável'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Envio Grátis:</span>
                    <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                      {formData.free_shipping_threshold ? `Acima de €${formData.free_shipping_threshold.toFixed(2)}` : 'Não configurado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Prazo:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formData.min_delivery_days}-{formData.max_delivery_days} dias úteis
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRule(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all duration-200 whitespace-nowrap"
                >
                  {editingRule ? '💾 Salvar Alterações' : '✅ Criar Regra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}