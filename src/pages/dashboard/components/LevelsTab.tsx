import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface CustomerLevel {
  id: string;
  user_id: string;
  level: number;
  current_xp: number;
  total_purchases: number;
  total_spent: number;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
}

export default function LevelsTab() {
  const [levels, setLevels] = useState<CustomerLevel[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<CustomerLevel | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    level: 0,
    current_xp: 0,
    discount_percentage: 0,
  });

  useEffect(() => {
    loadData();

    // Tempo real
    const levelsChannel = supabase
      .channel('levels-tab-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_levels' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      levelsChannel.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      const [levelsRes, profilesRes] = await Promise.all([
        supabase.from('customer_levels').select('*').order('level', { ascending: false }),
        supabase.from('perfis').select('id, email, full_name'),
      ]);

      if (levelsRes.error) throw levelsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setLevels(levelsRes.data || []);
      setProfiles(profilesRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfile = (userId: string) => {
    return profiles.find(p => p.id === userId);
  };

  const getXPForNextLevel = (currentLevel: number) => {
    return currentLevel * 1000;
  };

  const getLevelColor = (level: number) => {
    if (level >= 40) return 'from-purple-500 to-pink-500';
    if (level >= 30) return 'from-blue-500 to-purple-500';
    if (level >= 20) return 'from-green-500 to-blue-500';
    if (level >= 10) return 'from-yellow-500 to-green-500';
    return 'from-gray-500 to-yellow-500';
  };

  const handleEditLevel = (level: CustomerLevel) => {
    setSelectedLevel(level);
    setEditForm({
      level: level.level,
      current_xp: level.current_xp,
      discount_percentage: level.discount_percentage,
    });
    setShowEditModal(true);
  };

  const handleSaveLevel = async () => {
    if (!selectedLevel) return;

    try {
      const { error } = await supabase
        .from('customer_levels')
        .update({
          level: editForm.level,
          current_xp: editForm.current_xp,
          discount_percentage: editForm.discount_percentage,
        })
        .eq('id', selectedLevel.id);

      if (error) throw error;

      alert('Nível atualizado com sucesso!');
      setShowEditModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar nível:', error);
      alert('Erro ao atualizar nível!');
    }
  };

  const filteredLevels = levels.filter(level => {
    const profile = getProfile(level.user_id);
    if (!profile) return false;

    const matchesSearch = 
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Estatísticas
  const totalLevels = levels.length;
  const averageLevel = levels.length > 0 ? levels.reduce((sum, l) => sum + l.level, 0) / levels.length : 0;
  const highestLevel = levels.length > 0 ? Math.max(...levels.map(l => l.level)) : 0;
  const totalDiscounts = levels.reduce((sum, l) => sum + l.discount_percentage, 0);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4">Carregando níveis...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-vip-crown-line text-3xl text-purple-400"></i>
            <span className="text-3xl font-bold text-white">{totalLevels}</span>
          </div>
          <p className="text-sm text-gray-400">Total de Clientes com Nível</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-bar-chart-line text-3xl text-blue-400"></i>
            <span className="text-3xl font-bold text-white">{averageLevel.toFixed(1)}</span>
          </div>
          <p className="text-sm text-gray-400">Nível Médio</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-trophy-line text-3xl text-amber-400"></i>
            <span className="text-3xl font-bold text-white">{highestLevel}</span>
          </div>
          <p className="text-sm text-gray-400">Nível Mais Alto</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-percent-line text-3xl text-green-400"></i>
            <span className="text-3xl font-bold text-white">{totalDiscounts}%</span>
          </div>
          <p className="text-sm text-gray-400">Total de Descontos Ativos</p>
        </div>
      </div>

      {/* Tabela de Níveis */}
      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-amber-500/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-amber-400">SISTEMA DE NÍVEIS</h2>
          <div className="relative w-80">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>
        </div>

        {/* Legenda de Níveis */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-4 mb-6 border border-amber-500/20">
          <h3 className="text-sm font-bold text-amber-400 mb-3">LEGENDA DE NÍVEIS E DESCONTOS:</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-gray-500 to-yellow-500 rounded"></div>
              <span className="text-xs text-gray-400">Nível 1-9: 0-5%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-green-500 rounded"></div>
              <span className="text-xs text-gray-400">Nível 10-19: 10%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded"></div>
              <span className="text-xs text-gray-400">Nível 20-29: 15-19%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
              <span className="text-xs text-gray-400">Nível 30-39: 20-24%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
              <span className="text-xs text-gray-400">Nível 40+: 25%</span>
            </div>
          </div>
        </div>

        {filteredLevels.length === 0 ? (
          <div className="text-center py-20">
            <i className="ri-vip-crown-line text-6xl text-gray-600 mb-4"></i>
            <p className="text-gray-400 text-lg">Nenhum cliente com nível encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLevels.map((level) => {
              const profile = getProfile(level.user_id);
              if (!profile) return null;

              const xpForNext = getXPForNextLevel(level.level);
              const xpProgress = (level.current_xp / xpForNext) * 100;

              return (
                <div
                  key={level.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 border border-amber-500/20 hover:border-amber-400 transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getLevelColor(level.level)} rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0`}>
                      {profile.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{profile.full_name}</h3>
                      <p className="text-sm text-gray-400 truncate">{profile.email}</p>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-lg p-4 mb-4 border border-amber-500/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Nível Atual</span>
                      <span className={`text-3xl font-bold bg-gradient-to-r ${getLevelColor(level.level)} bg-clip-text text-transparent`}>
                        {level.level}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>XP: {level.current_xp} / {xpForNext}</span>
                        <span>{xpProgress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getLevelColor(level.level)} transition-all duration-500`}
                          style={{ width: `${Math.min(xpProgress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-black/40 rounded-lg p-3 border border-amber-500/10">
                      <p className="text-xs text-gray-400 mb-1">Compras</p>
                      <p className="text-lg font-bold text-white">{level.total_purchases}</p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-3 border border-amber-500/10">
                      <p className="text-xs text-gray-400 mb-1">Total Gasto</p>
                      <p className="text-lg font-bold text-amber-400">€{Number(level.total_spent).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Desconto Ativo</span>
                      <span className="text-2xl font-bold text-green-400">{level.discount_percentage}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEditLevel(level)}
                    className="w-full px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-all cursor-pointer border border-amber-500/30 font-semibold"
                  >
                    <i className="ri-edit-line mr-2"></i>
                    EDITAR NÍVEL
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {showEditModal && selectedLevel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg max-w-md w-full border-2 border-amber-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-amber-400">EDITAR NÍVEL</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-white"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Nível
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editForm.level}
                    onChange={(e) => setEditForm({ ...editForm, level: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    XP Atual
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.current_xp}
                    onChange={(e) => setEditForm({ ...editForm, current_xp: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Desconto (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.discount_percentage}
                    onChange={(e) => setEditForm({ ...editForm, discount_percentage: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
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
                  onClick={handleSaveLevel}
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