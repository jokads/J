import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  nome?: string;
  endereco?: string;
  cidade?: string;
  codigo_postal?: string;
  pais?: string;
  is_admin: boolean;
  is_super_admin: boolean;
  is_seller: boolean;
  is_banned: boolean;
  is_suspended: boolean;
  suspension_reason?: string;
  suspension_until?: string;
  admin_notes?: string;
  last_login?: string;
  created_at: string;
}

interface CustomerLevel {
  id: string;
  user_id: string;
  level: number;
  current_xp: number;
  total_purchases: number;
  total_spent: number;
  discount_percentage: number;
}

export default function CustomersTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [customerLevels, setCustomerLevels] = useState<CustomerLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'ban' | 'suspend' | 'create'>('view');
  
  // Estados para formulários
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  const [banReason, setBanReason] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState(7);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadData();
    
    // Tempo real
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'perfis' }, () => {
        loadData();
      })
      .subscribe();

    const levelsChannel = supabase
      .channel('levels-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_levels' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      profilesChannel.unsubscribe();
      levelsChannel.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      const [profilesRes, levelsRes] = await Promise.all([
        supabase.from('perfis').select('*').order('created_at', { ascending: false }),
        supabase.from('customer_levels').select('*'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (levelsRes.error) throw levelsRes.error;

      setProfiles(profilesRes.data || []);
      setCustomerLevels(levelsRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerLevel = (userId: string) => {
    return customerLevels.find(l => l.user_id === userId);
  };

  const handleBanUser = async () => {
    if (!selectedProfile) return;
    
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ 
          is_banned: true,
          admin_notes: `BANIDO: ${banReason}\n\n${selectedProfile.admin_notes || ''}`
        })
        .eq('id', selectedProfile.id);

      if (error) throw error;

      alert('✅ Usuário banido com sucesso!');
      setBanReason('');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao banir usuário:', error);
      alert('❌ Erro ao banir usuário!');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ is_banned: false })
        .eq('id', userId);

      if (error) throw error;

      alert('✅ Usuário desbanido com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao desbanir usuário:', error);
      alert('❌ Erro ao desbanir usuário!');
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedProfile) return;
    
    try {
      const suspensionUntil = new Date();
      suspensionUntil.setDate(suspensionUntil.getDate() + suspensionDays);

      const { error } = await supabase
        .from('perfis')
        .update({ 
          is_suspended: true,
          suspension_reason: suspensionReason,
          suspension_until: suspensionUntil.toISOString(),
          admin_notes: `SUSPENSO: ${suspensionReason}\n\n${selectedProfile.admin_notes || ''}`
        })
        .eq('id', selectedProfile.id);

      if (error) throw error;

      alert(`✅ Usuário suspenso por ${suspensionDays} dias!`);
      setSuspensionReason('');
      setSuspensionDays(7);
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao suspender usuário:', error);
      alert('❌ Erro ao suspender usuário!');
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ 
          is_suspended: false,
          suspension_reason: null,
          suspension_until: null
        })
        .eq('id', userId);

      if (error) throw error;

      alert('✅ Suspensão removida com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao remover suspensão:', error);
      alert('❌ Erro ao remover suspensão!');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedProfile) return;
    
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ admin_notes: adminNotes })
        .eq('id', selectedProfile.id);

      if (error) throw error;

      alert('✅ Notas salvas com sucesso!');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
      alert('❌ Erro ao salvar notas!');
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedProfile) return;

    try {
      // 🔥 CORRIGIDO: Usar os nomes corretos das colunas da tabela perfis
      const updateData: any = {
        full_name: editedProfile.full_name || selectedProfile.full_name,
        nome: editedProfile.full_name || selectedProfile.full_name, // Atualizar ambos
        email: editedProfile.email || selectedProfile.email,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      };

      // Adicionar campos opcionais com os nomes corretos
      if (editedProfile.endereco !== undefined) updateData.endereco = editedProfile.endereco;
      if (editedProfile.cidade !== undefined) updateData.cidade = editedProfile.cidade;
      if (editedProfile.codigo_postal !== undefined) updateData.codigo_postal = editedProfile.codigo_postal;
      if (editedProfile.pais !== undefined) updateData.pais = editedProfile.pais;

      const { error } = await supabase
        .from('perfis')
        .update(updateData)
        .eq('id', selectedProfile.id);

      if (error) {
        console.error('Erro Supabase:', error);
        throw new Error(`Erro ao atualizar: ${error.message}`);
      }

      alert('✅ Perfil atualizado com sucesso!');
      setShowModal(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      alert(`❌ Erro ao atualizar perfil: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const openModal = (profile: Profile, type: 'view' | 'edit' | 'ban' | 'suspend' | 'create') => {
    setSelectedProfile(profile);
    setModalType(type);
    setEditedProfile(profile);
    setAdminNotes(profile.admin_notes || '');
    setShowModal(true);
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesType = true;
    if (filterType === 'customers') {
      matchesType = !profile.is_admin && !profile.is_super_admin && !profile.is_seller;
    } else if (filterType === 'sellers') {
      matchesType = profile.is_seller;
    } else if (filterType === 'admins') {
      matchesType = profile.is_admin || profile.is_super_admin;
    } else if (filterType === 'banned') {
      matchesType = profile.is_banned;
    } else if (filterType === 'suspended') {
      matchesType = profile.is_suspended;
    }
    
    return matchesSearch && matchesType;
  });

  const customersCount = profiles.filter(p => !p.is_admin && !p.is_super_admin && !p.is_seller).length;
  const sellersCount = profiles.filter(p => p.is_seller).length;
  const adminsCount = profiles.filter(p => p.is_admin || p.is_super_admin).length;
  const bannedCount = profiles.filter(p => p.is_banned).length;
  const suspendedCount = profiles.filter(p => p.is_suspended).length;
  const totalSpent = customerLevels.reduce((sum, l) => sum + Number(l.total_spent), 0);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4">Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-user-line text-3xl text-blue-400"></i>
            <span className="text-3xl font-bold text-white">{customersCount}</span>
          </div>
          <p className="text-sm text-gray-400">Clientes</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-store-line text-3xl text-purple-400"></i>
            <span className="text-3xl font-bold text-white">{sellersCount}</span>
          </div>
          <p className="text-sm text-gray-400">Vendedores</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-forbid-line text-3xl text-red-400"></i>
            <span className="text-3xl font-bold text-white">{bannedCount}</span>
          </div>
          <p className="text-sm text-gray-400">Banidos</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-money-euro-circle-line text-3xl text-green-400"></i>
            <span className="text-3xl font-bold text-white">€{totalSpent.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-400">Total Gasto</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 shadow-xl mb-6 border border-red-500/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm cursor-pointer"
          >
            <option value="all">Todos os Tipos</option>
            <option value="customers">Apenas Clientes</option>
            <option value="sellers">Apenas Vendedores</option>
            <option value="admins">Apenas Administradores</option>
            <option value="banned">Apenas Banidos</option>
            <option value="suspended">Apenas Suspensos</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Todos', count: profiles.length },
            { key: 'customers', label: 'Clientes', count: customersCount },
            { key: 'sellers', label: 'Vendedores', count: sellersCount },
            { key: 'admins', label: 'Administradores', count: adminsCount },
            { key: 'banned', label: 'Banidos', count: bannedCount },
            { key: 'suspended', label: 'Suspensos', count: suspendedCount },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterType(filter.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap text-sm cursor-pointer ${
                filterType === filter.key
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                  : 'bg-black/40 text-gray-400 hover:bg-black/60 border border-red-500/20'
              }`}
            >
              {filter.label} <span className="font-bold">({filter.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Clientes */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-black/60 backdrop-blur-sm rounded-lg shadow-xl border border-red-500/20 p-12 text-center">
          <i className="ri-user-line text-6xl text-gray-600 mb-4"></i>
          <p className="text-gray-400 text-lg mb-2">Nenhum cliente encontrado</p>
          <p className="text-gray-500 text-sm">Tente ajustar os filtros de busca</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => {
            const level = getCustomerLevel(profile.id);
            return (
              <div
                key={profile.id}
                className={`bg-black/60 backdrop-blur-sm rounded-lg p-6 shadow-xl border transition-all ${
                  profile.is_banned ? 'border-red-500' : 
                  profile.is_suspended ? 'border-yellow-500' : 
                  'border-red-500/20 hover:border-red-400'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {(profile.full_name || profile.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{profile.full_name || profile.email || 'Sem Nome'}</h3>
                    <p className="text-sm text-gray-400 truncate">{profile.email}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {profile.is_super_admin && (
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full">
                      👑 SUPER ADMIN
                    </span>
                  )}
                  {profile.is_admin && !profile.is_super_admin && (
                    <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-500/30">
                      🔧 ADMIN
                    </span>
                  )}
                  {profile.is_seller && (
                    <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full border border-purple-500/30 ml-2">
                      🏪 VENDEDOR
                    </span>
                  )}
                  {profile.is_banned && (
                    <span className="inline-block px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30 ml-2">
                      🚫 BANIDO
                    </span>
                  )}
                  {profile.is_suspended && (
                    <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30 ml-2">
                      ⏸️ SUSPENSO
                    </span>
                  )}
                </div>

                {level && (
                  <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Nível</span>
                      <span className="text-2xl font-bold text-red-400">{level.level}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Compras</p>
                        <p className="text-white font-bold">{level.total_purchases}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Gasto</p>
                        <p className="text-white font-bold">€{Number(level.total_spent).toFixed(2)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500">Desconto</p>
                        <p className="text-green-400 font-bold">{level.discount_percentage}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openModal(profile, 'view')}
                    className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-xs font-bold border border-blue-500/30 whitespace-nowrap"
                  >
                    👁️ Ver
                  </button>
                  <button
                    onClick={() => openModal(profile, 'edit')}
                    className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-xs font-bold border border-green-500/30 whitespace-nowrap"
                  >
                    ✏️ Editar
                  </button>
                  
                  {profile.is_banned ? (
                    <button
                      onClick={() => handleUnbanUser(profile.id)}
                      className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-xs font-bold border border-green-500/30 whitespace-nowrap"
                    >
                      ✅ Desbanir
                    </button>
                  ) : (
                    <button
                      onClick={() => openModal(profile, 'ban')}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-xs font-bold border border-red-500/30 whitespace-nowrap"
                    >
                      🚫 Banir
                    </button>
                  )}
                  
                  {profile.is_suspended ? (
                    <button
                      onClick={() => handleUnsuspendUser(profile.id)}
                      className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-xs font-bold border border-green-500/30 whitespace-nowrap"
                    >
                      ▶️ Reativar
                    </button>
                  ) : (
                    <button
                      onClick={() => openModal(profile, 'suspend')}
                      className="px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all text-xs font-bold border border-yellow-500/30 whitespace-nowrap"
                    >
                      ⏸️ Suspender
                    </button>
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-4">
                  <i className="ri-calendar-line mr-1"></i>
                  Registrado em {new Date(profile.created_at).toLocaleDateString('pt-PT')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-white">
                {modalType === 'view' && '👁️ Detalhes do Cliente'}
                {modalType === 'edit' && '✏️ Editar Cliente'}
                {modalType === 'ban' && '🚫 Banir Cliente'}
                {modalType === 'suspend' && '⏸️ Suspender Cliente'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="ri-close-line text-3xl"></i>
              </button>
            </div>

            {/* Ver Detalhes */}
            {modalType === 'view' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nome:</p>
                    <p className="text-white font-bold">{selectedProfile.full_name || selectedProfile.nome || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email:</p>
                    <p className="text-white font-bold">{selectedProfile.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Endereço:</p>
                    <p className="text-white font-bold">{selectedProfile.endereco || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cidade:</p>
                    <p className="text-white font-bold">{selectedProfile.cidade || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Código Postal:</p>
                    <p className="text-white font-bold">{selectedProfile.codigo_postal || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">País:</p>
                    <p className="text-white font-bold">{selectedProfile.pais || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Registrado em:</p>
                    <p className="text-white font-bold">{new Date(selectedProfile.created_at).toLocaleDateString('pt-PT')}</p>
                  </div>
                </div>

                {selectedProfile.admin_notes && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-sm text-yellow-400 font-bold mb-2">📝 Notas do Admin:</p>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{selectedProfile.admin_notes}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Adicionar/Editar Notas
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                    placeholder="Adicione notas sobre este cliente..."
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="mt-2 w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg whitespace-nowrap"
                  >
                    💾 Salvar Notas
                  </button>
                </div>
              </div>
            )}

            {/* Editar */}
            {modalType === 'edit' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={editedProfile.full_name || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={editedProfile.email || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={editedProfile.endereco || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, endereco: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="Rua, número, apartamento..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={editedProfile.cidade || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, cidade: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="Luxembourg, Lisboa..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Código Postal</label>
                    <input
                      type="text"
                      value={editedProfile.codigo_postal || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, codigo_postal: e.target.value })}
                      className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                      placeholder="1234-567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">País</label>
                    <input
                      type="text"
                      value={editedProfile.pais || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, pais: e.target.value })}
                      className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                      placeholder="Portugal, Luxembourg..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Notas do Admin
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                    placeholder="Adicione notas sobre este cliente..."
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg whitespace-nowrap"
                >
                  💾 Salvar Alterações
                </button>
              </div>
            )}

            {/* Banir */}
            {modalType === 'ban' && (
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 text-sm">
                    ⚠️ <strong>ATENÇÃO:</strong> Ao banir este usuário, ele não poderá mais acessar o site.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Motivo do Banimento
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                    placeholder="Explique o motivo do banimento..."
                  />
                </div>

                <button
                  onClick={handleBanUser}
                  disabled={!banReason.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  🚫 CONFIRMAR BANIMENTO
                </button>
              </div>
            )}

            {/* Suspender */}
            {modalType === 'suspend' && (
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ <strong>ATENÇÃO:</strong> O usuário ficará suspenso temporariamente.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Motivo da Suspensão
                  </label>
                  <textarea
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                    placeholder="Explique o motivo da suspensão..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Duração da Suspensão (dias)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={suspensionDays}
                    onChange={(e) => setSuspensionDays(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  onClick={handleSuspendUser}
                  disabled={!suspensionReason.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  ⏸️ CONFIRMAR SUSPENSÃO
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}