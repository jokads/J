import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface TaxRule {
  id: string;
  name: string;
  country: string;
  rate: number;
  type: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

// Lista completa de países com taxas de IVA padrão
const COUNTRIES_WITH_VAT = [
  // Europa
  { name: 'Portugal', code: 'PT', defaultVat: 23, reducedVat: [13, 6] },
  { name: 'Espanha', code: 'ES', defaultVat: 21, reducedVat: [10, 4] },
  { name: 'França', code: 'FR', defaultVat: 20, reducedVat: [10, 5.5, 2.1] },
  { name: 'Alemanha', code: 'DE', defaultVat: 19, reducedVat: [7] },
  { name: 'Itália', code: 'IT', defaultVat: 22, reducedVat: [10, 5, 4] },
  { name: 'Bélgica', code: 'BE', defaultVat: 21, reducedVat: [12, 6] },
  { name: 'Holanda', code: 'NL', defaultVat: 21, reducedVat: [9] },
  { name: 'Luxemburgo', code: 'LU', defaultVat: 17, reducedVat: [14, 8, 3] },
  { name: 'Áustria', code: 'AT', defaultVat: 20, reducedVat: [13, 10] },
  { name: 'Grécia', code: 'GR', defaultVat: 24, reducedVat: [13, 6] },
  { name: 'Polónia', code: 'PL', defaultVat: 23, reducedVat: [8, 5] },
  { name: 'República Checa', code: 'CZ', defaultVat: 21, reducedVat: [15, 10] },
  { name: 'Hungria', code: 'HU', defaultVat: 27, reducedVat: [18, 5] },
  { name: 'Roménia', code: 'RO', defaultVat: 19, reducedVat: [9, 5] },
  { name: 'Bulgária', code: 'BG', defaultVat: 20, reducedVat: [9] },
  { name: 'Croácia', code: 'HR', defaultVat: 25, reducedVat: [13, 5] },
  { name: 'Eslováquia', code: 'SK', defaultVat: 20, reducedVat: [10] },
  { name: 'Eslovénia', code: 'SI', defaultVat: 22, reducedVat: [9.5] },
  { name: 'Estónia', code: 'EE', defaultVat: 20, reducedVat: [9] },
  { name: 'Letónia', code: 'LV', defaultVat: 21, reducedVat: [12, 5] },
  { name: 'Lituânia', code: 'LT', defaultVat: 21, reducedVat: [9, 5] },
  { name: 'Dinamarca', code: 'DK', defaultVat: 25, reducedVat: [] },
  { name: 'Suécia', code: 'SE', defaultVat: 25, reducedVat: [12, 6] },
  { name: 'Finlândia', code: 'FI', defaultVat: 24, reducedVat: [14, 10] },
  { name: 'Irlanda', code: 'IE', defaultVat: 23, reducedVat: [13.5, 9, 4.8] },
  { name: 'Chipre', code: 'CY', defaultVat: 19, reducedVat: [9, 5] },
  { name: 'Malta', code: 'MT', defaultVat: 18, reducedVat: [7, 5] },
  { name: 'Reino Unido', code: 'GB', defaultVat: 20, reducedVat: [5] },
  { name: 'Suíça', code: 'CH', defaultVat: 7.7, reducedVat: [3.7, 2.5] },
  { name: 'Noruega', code: 'NO', defaultVat: 25, reducedVat: [15, 12] },
  { name: 'Islândia', code: 'IS', defaultVat: 24, reducedVat: [11] },
  
  // América do Norte
  { name: 'Estados Unidos', code: 'US', defaultVat: 0, reducedVat: [] }, // Varia por estado
  { name: 'Canadá', code: 'CA', defaultVat: 5, reducedVat: [] }, // GST federal
  { name: 'México', code: 'MX', defaultVat: 16, reducedVat: [8] },
  
  // América do Sul
  { name: 'Brasil', code: 'BR', defaultVat: 17, reducedVat: [12, 7] },
  { name: 'Argentina', code: 'AR', defaultVat: 21, reducedVat: [10.5] },
  { name: 'Chile', code: 'CL', defaultVat: 19, reducedVat: [] },
  { name: 'Colômbia', code: 'CO', defaultVat: 19, reducedVat: [5] },
  { name: 'Peru', code: 'PE', defaultVat: 18, reducedVat: [] },
  { name: 'Uruguai', code: 'UY', defaultVat: 22, reducedVat: [10] },
  
  // Ásia
  { name: 'China', code: 'CN', defaultVat: 13, reducedVat: [9, 6] },
  { name: 'Japão', code: 'JP', defaultVat: 10, reducedVat: [8] },
  { name: 'Coreia do Sul', code: 'KR', defaultVat: 10, reducedVat: [] },
  { name: 'Índia', code: 'IN', defaultVat: 18, reducedVat: [12, 5] },
  { name: 'Singapura', code: 'SG', defaultVat: 8, reducedVat: [] },
  { name: 'Tailândia', code: 'TH', defaultVat: 7, reducedVat: [] },
  { name: 'Malásia', code: 'MY', defaultVat: 0, reducedVat: [] }, // SST system
  { name: 'Indonésia', code: 'ID', defaultVat: 11, reducedVat: [] },
  { name: 'Filipinas', code: 'PH', defaultVat: 12, reducedVat: [] },
  { name: 'Vietname', code: 'VN', defaultVat: 10, reducedVat: [5] },
  
  // Oceania
  { name: 'Austrália', code: 'AU', defaultVat: 10, reducedVat: [] },
  { name: 'Nova Zelândia', code: 'NZ', defaultVat: 15, reducedVat: [] },
  
  // África
  { name: 'África do Sul', code: 'ZA', defaultVat: 15, reducedVat: [] },
  { name: 'Marrocos', code: 'MA', defaultVat: 20, reducedVat: [14, 10, 7] },
  { name: 'Egito', code: 'EG', defaultVat: 14, reducedVat: [] },
  { name: 'Nigéria', code: 'NG', defaultVat: 7.5, reducedVat: [] },
  { name: 'Quénia', code: 'KE', defaultVat: 16, reducedVat: [] },
  
  // Médio Oriente
  { name: 'Emirados Árabes Unidos', code: 'AE', defaultVat: 5, reducedVat: [] },
  { name: 'Arábia Saudita', code: 'SA', defaultVat: 15, reducedVat: [] },
  { name: 'Israel', code: 'IL', defaultVat: 17, reducedVat: [] },
  { name: 'Turquia', code: 'TR', defaultVat: 18, reducedVat: [8, 1] },
  
  // Outros
  { name: 'Rússia', code: 'RU', defaultVat: 20, reducedVat: [10] },
  { name: 'Ucrânia', code: 'UA', defaultVat: 20, reducedVat: [7] },
];

export default function TaxManagement() {
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null);
  const [globalVatEnabled, setGlobalVatEnabled] = useState(true);
  const [searchCountry, setSearchCountry] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    rate: 0,
    type: 'IVA',
    is_active: true,
    is_default: false,
  });

  useEffect(() => {
    loadTaxRules();
    loadGlobalVatSetting();
  }, []);

  const loadTaxRules = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear os dados para o formato correto
      const mappedData = (data || []).map(item => ({
        id: item.id,
        name: item.name || item.tax_name || 'Sem nome',
        country: item.country || item.region || 'Não especificado',
        rate: item.rate || item.tax_rate || 0,
        type: item.type || 'IVA',
        is_active: item.is_active !== undefined ? item.is_active : true,
        is_default: item.is_default || false,
        created_at: item.created_at,
      }));
      
      setTaxRules(mappedData);
    } catch (error) {
      console.error('Erro ao carregar regras de IVA:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalVatSetting = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'global_vat_enabled')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setGlobalVatEnabled(data?.value === 'true' || data?.value === true);
    } catch (error) {
      console.error('Erro ao carregar configuração global de IVA:', error);
    }
  };

  const toggleGlobalVat = async () => {
    try {
      const newValue = !globalVatEnabled;
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'global_vat_enabled',
          value: String(newValue),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setGlobalVatEnabled(newValue);
      alert(newValue ? 'IVA/TVA ativado globalmente!' : 'IVA/TVA desativado globalmente!');
    } catch (error) {
      console.error('Erro ao atualizar configuração global de IVA:', error);
      alert('Erro ao atualizar configuração de IVA');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Preparar dados para salvar
      const dataToSave = {
        name: formData.name,
        tax_name: formData.name, // Compatibilidade com coluna antiga
        country: formData.country,
        region: formData.country, // Compatibilidade com coluna antiga
        rate: formData.rate,
        tax_rate: formData.rate, // Compatibilidade com coluna antiga
        type: formData.type,
        is_active: formData.is_active,
        is_default: formData.is_default,
      };

      if (editingRule) {
        const { error } = await supabase
          .from('tax_settings')
          .update(dataToSave)
          .eq('id', editingRule.id);

        if (error) throw error;
        alert('Regra de IVA atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('tax_settings')
          .insert([dataToSave]);

        if (error) throw error;
        alert('Regra de IVA criada com sucesso!');
      }

      setShowForm(false);
      setEditingRule(null);
      resetForm();
      loadTaxRules();
    } catch (error) {
      console.error('Erro ao salvar regra de IVA:', error);
      alert('Erro ao salvar regra de IVA');
    }
  };

  const handleEdit = (rule: TaxRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      country: rule.country,
      rate: rule.rate,
      type: rule.type,
      is_active: rule.is_active,
      is_default: rule.is_default,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra de IVA?')) return;

    try {
      const { error } = await supabase
        .from('tax_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Regra de IVA excluída com sucesso!');
      loadTaxRules();
    } catch (error) {
      console.error('Erro ao excluir regra de IVA:', error);
      alert('Erro ao excluir regra de IVA');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      rate: 0,
      type: 'IVA',
      is_active: true,
      is_default: false,
    });
  };

  const createRuleForCountry = (country: typeof COUNTRIES_WITH_VAT[0]) => {
    setFormData({
      name: `${country.code === 'PT' ? 'IVA' : country.code === 'FR' ? 'TVA' : 'VAT'} ${country.name} (Padrão)`,
      country: country.name,
      rate: country.defaultVat,
      type: country.code === 'PT' ? 'IVA' : country.code === 'FR' ? 'TVA' : 'VAT',
      is_active: true,
      is_default: true,
    });
    setShowForm(true);
  };

  const filteredCountries = COUNTRIES_WITH_VAT.filter(country =>
    country.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
    country.code.toLowerCase().includes(searchCountry.toLowerCase())
  );

  const stats = {
    total: taxRules.length,
    active: taxRules.filter(r => r.is_active).length,
    countries: new Set(taxRules.map(r => r.country)).size,
    avgRate: taxRules.length > 0 
      ? (taxRules.reduce((sum, r) => sum + r.rate, 0) / taxRules.length).toFixed(1)
      : '0',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <i className="ri-loader-4-line text-4xl text-yellow-500 animate-spin"></i>
          <p className="text-gray-400">A carregar regras de IVA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-percent-line text-yellow-500"></i>
            Gestão de IVA / TVA / Impostos
          </h2>
          <p className="text-gray-400 mt-1">Configure taxas de IVA por país e categoria de produto</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle Global de IVA */}
          <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium">IVA/TVA Global:</span>
            <button
              onClick={toggleGlobalVat}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                globalVatEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  globalVatEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-bold ${globalVatEnabled ? 'text-green-500' : 'text-red-500'}`}>
              {globalVatEnabled ? 'ATIVO' : 'DESATIVADO'}
            </span>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingRule(null);
              resetForm();
            }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            Nova Regra de IVA
          </button>
        </div>
      </div>

      {/* Alerta se IVA estiver desativado */}
      {!globalVatEnabled && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="ri-alert-line text-red-500 text-xl mt-0.5"></i>
            <div>
              <h3 className="font-bold text-red-500">⚠️ IVA/TVA Desativado Globalmente</h3>
              <p className="text-sm text-gray-400 mt-1">
                Nenhum imposto será calculado nos produtos e checkout. Ative o IVA/TVA global acima para começar a cobrar impostos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <i className="ri-file-list-3-line text-2xl text-blue-500"></i>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Regras</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-2xl text-green-500"></i>
            </div>
            <div>
              <p className="text-sm text-gray-400">Regras Ativas</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <i className="ri-global-line text-2xl text-purple-500"></i>
            </div>
            <div>
              <p className="text-sm text-gray-400">Países Configurados</p>
              <p className="text-2xl font-bold">{stats.countries}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <i className="ri-percent-line text-2xl text-yellow-500"></i>
            </div>
            <div>
              <p className="text-sm text-gray-400">Taxa Média</p>
              <p className="text-2xl font-bold">{stats.avgRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box IOSS */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <i className="ri-information-line text-blue-500 text-xl mt-0.5"></i>
          <div className="flex-1">
            <h3 className="font-bold text-blue-500">✅ Sistema IOSS Ready - Conformidade Total UE</h3>
            <p className="text-sm text-gray-400 mt-2">
              O sistema está 100% preparado para o regime IOSS (Import One-Stop Shop) da União Europeia:
            </p>
            <ul className="text-sm text-gray-400 mt-2 space-y-1 ml-4">
              <li>✅ Cálculo automático de IVA por país de destino</li>
              <li>✅ Breakdown detalhado de impostos no checkout</li>
              <li>✅ Suporte a dropshipping dentro e fora da UE</li>
              <li>✅ Conformidade legal automática com regulamentos fiscais</li>
              <li>✅ Relatórios prontos para declaração de IVA</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lista de Países Disponíveis */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <i className="ri-earth-line text-blue-500"></i>
            Países Disponíveis ({COUNTRIES_WITH_VAT.length})
          </h3>
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Pesquisar país..."
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
              className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {filteredCountries.map((country) => {
            const hasRule = taxRules.some(r => r.country === country.name);
            return (
              <div
                key={country.code}
                className={`bg-gray-700 rounded-lg p-3 flex items-center justify-between hover:bg-gray-600 transition-colors ${
                  hasRule ? 'border-2 border-green-500/30' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{country.name}</span>
                    {hasRule && (
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">
                        Configurado
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    <span className="font-mono">{country.code}</span>
                    <span className="mx-2">•</span>
                    <span>IVA Padrão: {country.defaultVat}%</span>
                  </div>
                  {country.reducedVat.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Taxas Reduzidas: {country.reducedVat.join('%, ')}%
                    </div>
                  )}
                </div>
                {!hasRule && (
                  <button
                    onClick={() => createRuleForCountry(country)}
                    className="ml-3 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm whitespace-nowrap transition-colors"
                  >
                    <i className="ri-add-line mr-1"></i>
                    Criar Regra
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabela de Regras */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nome da Regra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  País
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Taxa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Padrão
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {taxRules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    <i className="ri-inbox-line text-4xl mb-2"></i>
                    <p>Nenhuma regra de IVA configurada</p>
                    <p className="text-sm mt-1">Clique em "Nova Regra de IVA" ou escolha um país acima para começar</p>
                  </td>
                </tr>
              ) : (
                taxRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <i className="ri-money-euro-circle-line text-yellow-500"></i>
                        <span className="font-medium">{rule.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">{rule.country}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-yellow-500">{rule.rate}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">{rule.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rule.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                          <i className="ri-checkbox-circle-line"></i>
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-600 text-gray-400">
                          <i className="ri-close-circle-line"></i>
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rule.is_default && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-500">
                          <i className="ri-star-fill"></i>
                          Padrão
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-blue-500 hover:text-blue-400 mr-3 transition-colors"
                        title="Editar"
                      >
                        <i className="ri-edit-line text-lg"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <i className="ri-delete-bin-line text-lg"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <i className="ri-percent-line text-yellow-500"></i>
                  {editingRule ? 'Editar Regra de IVA' : 'Nova Regra de IVA'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingRule(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nome da Regra *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Ex: IVA Portugal Padrão"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    País *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  >
                    <option value="">Selecione um país</option>
                    {COUNTRIES_WITH_VAT.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name} ({country.code}) - {country.defaultVat}%
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Taxa de IVA (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Ex: 23"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tipo de Imposto *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  >
                    <option value="IVA">IVA (Imposto sobre Valor Acrescentado)</option>
                    <option value="TVA">TVA (Taxe sur la Valeur Ajoutée)</option>
                    <option value="VAT">VAT (Value Added Tax)</option>
                    <option value="GST">GST (Goods and Services Tax)</option>
                    <option value="Sales Tax">Sales Tax</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm">Regra Ativa</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                      className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm">Definir como Padrão</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    {editingRule ? 'Atualizar Regra' : 'Criar Regra'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingRule(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}