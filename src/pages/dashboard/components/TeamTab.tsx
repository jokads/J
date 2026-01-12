import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  is_admin: boolean;
  is_super_admin: boolean;
  is_seller: boolean;
  seller_approved: boolean;
  can_manage_products?: boolean;
  can_manage_orders?: boolean;
  can_manage_customers?: boolean;
  can_manage_team?: boolean;
  can_manage_settings?: boolean;
  created_at: string;
}

export default function TeamTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    is_admin: false,
    is_seller: false,
    seller_approved: false,
    can_manage_products: false,
    can_manage_orders: false,
    can_manage_customers: false,
    can_manage_team: false,
    can_manage_settings: false,
  });

  useEffect(() => {
    loadData();

    // Tempo real
    const profilesChannel = supabase
      .channel('team-tab-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'perfis' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      profilesChannel.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setEditForm({
      is_admin: profile.is_admin || false,
      is_seller: profile.is_seller || false,
      seller_approved: profile.seller_approved || false,
      can_manage_products: profile.can_manage_products || false,
      can_manage_orders: profile.can_manage_orders || false,
      can_manage_customers: profile.can_manage_customers || false,
      can_manage_team: profile.can_manage_team || false,
      can_manage_settings: profile.can_manage_settings || false,
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!selectedProfile) return;

    try {
      // Preparar dados para atualização (apenas campos que existem na tabela)
      const updateData: any = {
        is_admin: editForm.is_admin,
        is_seller: editForm.is_seller,
        seller_approved: editForm.seller_approved,
      };

      // Adicionar campos de permissão apenas se existirem na tabela
      try {
        updateData.can_manage_products = editForm.can_manage_products;
        updateData.can_manage_orders = editForm.can_manage_orders;
        updateData.can_manage_customers = editForm.can_manage_customers;
        updateData.can_manage_team = editForm.can_manage_team;
        updateData.can_manage_settings = editForm.can_manage_settings;
      } catch (e) {
        console.log('Campos de permissão não disponíveis ainda');
      }

      const { error } = await supabase
        .from('perfis')
        .update(updateData)
        .eq('id', selectedProfile.id);

      if (error) throw error;

      alert('Permissões atualizadas com sucesso!');
      setShowEditModal(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar permissões:', error);
      
      // Mensagem de erro mais amigável
      if (error?.message?.includes('column') && error?.message?.includes('does not exist')) {
        alert('⚠️ ATENÇÃO: Execute o arquivo DATABASE_FINAL_COMPLETO_V230.sql no Supabase para adicionar as colunas de permissões!');
      } else {
        alert('Erro ao atualizar permissões: ' + (error?.message || 'Erro desconhecido'));
      }
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesType = true;
    if (filterType === 'admins') {
      matchesType = profile.is_admin || profile.is_super_admin;
    } else if (filterType === 'sellers') {
      matchesType = profile.is_seller;
    } else if (filterType === 'customers') {
      matchesType = !profile.is_admin && !profile.is_super_admin && !profile.is_seller;
    }
    
    return matchesSearch && matchesType;
  });

  const adminsCount = profiles.filter(p => p.is_admin || p.is_super_admin).length;
  const sellersCount = profiles.filter(p => p.is_seller).length;
  const customersCount = profiles.filter(p => !p.is_admin && !p.is_super_admin && !p.is_seller).length;
  const pendingSellers = profiles.filter(p => p.is_seller && !p.seller_approved).length;

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4">Carregando equipe...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-shield-user-line text-3xl text-amber-400"></i>
            <span className="text-3xl font-bold text-white">{adminsCount}</span>
          </div>
          <p className="text-sm text-gray-400">Administradores</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-store-line text-3xl text-purple-400"></i>
            <span className="text-3xl font-bold text-white">{sellersCount}</span>
          </div>
          <p className="text-sm text-gray-400">Vendedores</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-user-line text-3xl text-blue-400"></i>
            <span className="text-3xl font-bold text-white">{customersCount}</span>
          </div>
          <p className="text-sm text-gray-400">Clientes</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-time-line text-3xl text-yellow-400"></i>
            <span className="text-3xl font-bold text-white">{pendingSellers}</span>
          </div>
          <p className="text-sm text-gray-400">Vendedores Pendentes</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 shadow-xl mb-6 border border-amber-500/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm cursor-pointer"
          >
            <option value="all">Todos os Tipos</option>
            <option value="admins">Apenas Administradores</option>
            <option value="sellers">Apenas Vendedores</option>
            <option value="customers">Apenas Clientes</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Todos', count: profiles.length },
            { key: 'admins', label: 'Administradores', count: adminsCount },
            { key: 'sellers', label: 'Vendedores', count: sellersCount },
            { key: 'customers', label: 'Clientes', count: customersCount },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterType(filter.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap text-sm cursor-pointer ${
                filterType === filter.key
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg'
                  : 'bg-black/40 text-gray-400 hover:bg-black/60 border border-amber-500/20'
              }`}
            >
              {filter.label} <span className="font-bold">({filter.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Membros */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-black/60 backdrop-blur-sm rounded-lg shadow-xl border border-amber-500/20 p-12 text-center">
          <i className="ri-team-line text-6xl text-gray-600 mb-4"></i>
          <p className="text-gray-400 text-lg mb-2">Nenhum membro encontrado</p>
          <p className="text-gray-500 text-sm">Tente ajustar os filtros de busca</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-black/60 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-amber-500/20 hover:border-amber-400 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-black font-bold text-2xl flex-shrink-0">
                  {(profile.full_name || profile.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{profile.full_name || profile.email || 'Sem Nome'}</h3>
                  <p className="text-sm text-gray-400 truncate">{profile.email}</p>
                  {profile.phone && (
                    <p className="text-xs text-gray-500 mt-1">
                      <i className="ri-phone-line mr-1"></i>
                      {profile.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {profile.is_super_admin && (
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold rounded-full">
                    👑 SUPER ADMIN
                  </span>
                )}
                {profile.is_admin && !profile.is_super_admin && (
                  <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-500/30">
                    🔧 ADMIN
                  </span>
                )}
                {profile.is_seller && (
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ml-2 ${
                    profile.seller_approved
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    🏪 VENDEDOR {!profile.seller_approved && '(PENDENTE)'}
                  </span>
                )}
              </div>

              {(profile.is_admin || profile.is_seller) && (
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-4 mb-4 border border-amber-500/10">
                  <p className="text-xs font-bold text-amber-400 mb-2">PERMISSÕES:</p>
                  <div className="space-y-1">
                    {profile.can_manage_products && (
                      <p className="text-xs text-green-400">✅ Gerenciar Produtos</p>
                    )}
                    {profile.can_manage_orders && (
                      <p className="text-xs text-green-400">✅ Gerenciar Pedidos</p>
                    )}
                    {profile.can_manage_customers && (
                      <p className="text-xs text-green-400">✅ Gerenciar Clientes</p>
                    )}
                    {profile.can_manage_team && (
                      <p className="text-xs text-green-400">✅ Gerenciar Equipe</p>
                    )}
                    {profile.can_manage_settings && (
                      <p className="text-xs text-green-400">✅ Gerenciar Configurações</p>
                    )}
                    {!profile.can_manage_products && !profile.can_manage_orders && !profile.can_manage_customers && !profile.can_manage_team && !profile.can_manage_settings && (
                      <p className="text-xs text-gray-500">Nenhuma permissão especial</p>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 mb-4">
                <i className="ri-calendar-line mr-1"></i>
                Registrado em {new Date(profile.created_at).toLocaleDateString('pt-PT')}
              </div>

              {!profile.is_super_admin && (
                <button
                  onClick={() => handleEditProfile(profile)}
                  className="w-full px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-all cursor-pointer border border-amber-500/30 font-semibold"
                >
                  <i className="ri-edit-line mr-2"></i>
                  EDITAR PERMISSÕES
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg max-w-md w-full border-2 border-amber-500/30 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-amber-400">EDITAR PERMISSÕES</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-white"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-black font-bold text-lg">
                    {(selectedProfile.full_name || selectedProfile.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold">{selectedProfile.full_name || selectedProfile.email}</p>
                    <p className="text-sm text-gray-400">{selectedProfile.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                  <h4 className="text-sm font-bold text-amber-400 mb-3">CARGOS:</h4>
                  <label className="flex items-center gap-3 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.is_admin}
                      onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
                      className="w-5 h-5 rounded border-amber-500/30 bg-black/40 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-sm text-white">Administrador</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.is_seller}
                      onChange={(e) => setEditForm({ ...editForm, is_seller: e.target.checked })}
                      className="w-5 h-5 rounded border-amber-500/30 bg-black/40 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-sm text-white">Vendedor</span>
                  </label>
                  {editForm.is_seller && (
                    <label className="flex items-center gap-3 mt-3 ml-8 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.seller_approved}
                        onChange={(e) => setEditForm({ ...editForm, seller_approved: e.target.checked })}
                        className="w-5 h-5 rounded border-amber-500/30 bg-black/40 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="text-sm text-white">Vendedor Aprovado</span>
                    </label>
                  )}
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                  <h4 className="text-sm font-bold text-amber-400 mb-3">PERMISSÕES:</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.can_manage_products}
                        onChange={(e) => setEditForm({ ...editForm, can_manage_products: e.target.checked })}
                        className="w-5 h-5 rounded border-amber-500/30 bg-black/40 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="text-sm text-white">Gerenciar Produtos</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.can_manage_orders}
                        onChange={(e) => setEditForm({ ...editForm, can_manage_orders: e.target.checked })}
                        className="w-5 h-5 rounded border-amber-500/30 bg-black/40 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="text-sm text-white">Gerenciar Pedidos</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.can_manage_customers}
                        onChange={(e) => setEditForm({ ...editForm, can_manage_customers: e.target.checked })}
                        className="w-5 h-5 rounded border-amber-500/30 bg-black/40 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="text-sm text-white">Gerenciar Clientes</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.can_manage_team}
                        onChange={(e) => setEditForm({ ...editForm, can_manage_team: e.target.checked })}
                        className="w-5 h-5 rounded border-amber-500/30 bg-black/40 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="text-sm text-white">Gerenciar Equipe</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.can_manage_settings}
                        onChange={(e) => setEditForm({ ...editForm, can_manage_settings: e.target.checked })}
                        className="w-5 h-5 rounded border-amber-500/30 bg-black/40 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="text-sm text-white">Gerenciar Configurações</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all cursor-pointer whitespace-nowrap"
                >
                  SALVAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}