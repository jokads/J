import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface AdminNote {
  id: string;
  admin_id: string;
  admin_name: string;
  admin_email: string;
  note: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export default function NotesTab() {
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterResolved, setFilterResolved] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({
    note: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'Geral',
  });

  useEffect(() => {
    loadNotes();

    // Tempo real
    const notesChannel = supabase
      .channel('notes-tab-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_notes' }, () => {
        loadNotes();
      })
      .subscribe();

    return () => {
      notesChannel.unsubscribe();
    };
  }, []);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.note.trim()) {
      alert('Por favor, escreva uma nota!');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('perfis')
        .select('full_name, email')
        .eq('email', user.email)
        .single();

      const { error } = await supabase
        .from('admin_notes')
        .insert([{
          admin_id: user.id,
          admin_name: profile?.full_name || user.email?.split('@')[0] || 'Admin',
          admin_email: user.email || '',
          note: newNote.note,
          priority: newNote.priority,
          category: newNote.category,
          is_resolved: false,
        }]);

      if (error) throw error;

      alert('Nota adicionada com sucesso!');
      setShowAddModal(false);
      setNewNote({ note: '', priority: 'medium', category: 'Geral' });
      loadNotes();
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      alert('Erro ao adicionar nota!');
    }
  };

  const handleToggleResolved = async (noteId: string, currentResolved: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_notes')
        .update({ is_resolved: !currentResolved })
        .eq('id', noteId);

      if (error) throw error;
      loadNotes();
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      alert('Erro ao atualizar nota!');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Tem certeza que deseja remover esta nota?')) return;

    try {
      const { error } = await supabase
        .from('admin_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      alert('Nota removida com sucesso!');
      loadNotes();
    } catch (error) {
      console.error('Erro ao remover nota:', error);
      alert('Erro ao remover nota!');
    }
  };

  const getPriorityColor = (priority: string) => {
    if (!priority) return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityLabel = (priority: string) => {
    if (!priority) return 'SEM PRIORIDADE';
    
    switch (priority) {
      case 'urgent': return 'URGENTE';
      case 'high': return 'ALTA';
      case 'medium': return 'MÉDIA';
      case 'low': return 'BAIXA';
      default: return priority.toUpperCase();
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = (note.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (note.admin_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (note.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || note.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    const matchesResolved = filterResolved === 'all' || 
                           (filterResolved === 'resolved' && note.is_resolved) ||
                           (filterResolved === 'unresolved' && !note.is_resolved);
    
    return matchesSearch && matchesPriority && matchesCategory && matchesResolved;
  });

  const totalNotes = notes.length;
  const unresolvedNotes = notes.filter(n => !n.is_resolved).length;
  const urgentNotes = notes.filter(n => n.priority === 'urgent' && !n.is_resolved).length;
  const resolvedNotes = notes.filter(n => n.is_resolved).length;

  const categories = ['Geral', 'Produtos', 'Pedidos', 'Clientes', 'Vendedores', 'Sistema', 'Marketing', 'Financeiro'];

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4">Carregando notas...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-sticky-note-line text-3xl text-blue-400"></i>
            <span className="text-3xl font-bold text-white">{totalNotes}</span>
          </div>
          <p className="text-sm text-gray-400">Total de Notas</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-time-line text-3xl text-yellow-400"></i>
            <span className="text-3xl font-bold text-white">{unresolvedNotes}</span>
          </div>
          <p className="text-sm text-gray-400">Não Resolvidas</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-alarm-warning-line text-3xl text-red-400"></i>
            <span className="text-3xl font-bold text-white">{urgentNotes}</span>
          </div>
          <p className="text-sm text-gray-400">Urgentes</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-checkbox-circle-line text-3xl text-green-400"></i>
            <span className="text-3xl font-bold text-white">{resolvedNotes}</span>
          </div>
          <p className="text-sm text-gray-400">Resolvidas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 shadow-xl mb-6 border border-amber-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-amber-400">NOTAS ADMINISTRATIVAS</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            ADICIONAR NOTA
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm cursor-pointer"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filterResolved}
            onChange={(e) => setFilterResolved(e.target.value)}
            className="px-4 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm cursor-pointer"
          >
            <option value="all">Todas</option>
            <option value="unresolved">Não Resolvidas</option>
            <option value="resolved">Resolvidas</option>
          </select>
        </div>
      </div>

      {/* Lista de Notas */}
      {filteredNotes.length === 0 ? (
        <div className="bg-black/60 backdrop-blur-sm rounded-lg shadow-xl border border-amber-500/20 p-12 text-center">
          <i className="ri-sticky-note-line text-6xl text-gray-600 mb-4"></i>
          <p className="text-gray-400 text-lg mb-2">Nenhuma nota encontrada</p>
          <p className="text-gray-500 text-sm">Adicione notas para organizar seu trabalho</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 border transition-all ${
                note.is_resolved 
                  ? 'border-green-500/20 opacity-60' 
                  : 'border-amber-500/20 hover:border-amber-400'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
                    {(note.admin_name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{note.admin_name || 'Admin'}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(note.priority)}`}>
                        {getPriorityLabel(note.priority)}
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30">
                        {note.category}
                      </span>
                      {note.is_resolved && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">
                          ✓ RESOLVIDA
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{note.admin_email || 'Sem email'}</p>
                    <p className="text-xs text-gray-500">
                      <i className="ri-calendar-line mr-1"></i>
                      {new Date(note.created_at).toLocaleDateString('pt-PT')} às {new Date(note.created_at).toLocaleTimeString('pt-PT')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 rounded-lg p-4 mb-4 border border-amber-500/10">
                <p className="text-white whitespace-pre-wrap">{note.note}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleResolved(note.id, note.is_resolved)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all cursor-pointer border font-semibold ${
                    note.is_resolved
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30'
                      : 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                  }`}
                >
                  <i className={`ri-${note.is_resolved ? 'arrow-go-back' : 'checkbox-circle'}-line mr-2`}></i>
                  {note.is_resolved ? 'REABRIR' : 'MARCAR COMO RESOLVIDA'}
                </button>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all cursor-pointer border border-red-500/30 font-semibold"
                >
                  <i className="ri-delete-bin-line mr-2"></i>
                  REMOVER
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Adicionar Nota */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg max-w-2xl w-full border-2 border-amber-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-amber-400">ADICIONAR NOVA NOTA</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-white"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Nota *
                  </label>
                  <textarea
                    value={newNote.note}
                    onChange={(e) => setNewNote({ ...newNote, note: e.target.value })}
                    rows={8}
                    placeholder="Escreva sua nota aqui..."
                    className="w-full px-4 py-3 bg-black/40 border border-amber-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Prioridade *
                    </label>
                    <select
                      value={newNote.priority}
                      onChange={(e) => setNewNote({ ...newNote, priority: e.target.value as any })}
                      className="w-full px-4 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Categoria *
                    </label>
                    <select
                      value={newNote.category}
                      onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                      className="w-full px-4 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleAddNote}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all cursor-pointer whitespace-nowrap"
                >
                  ADICIONAR NOTA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}