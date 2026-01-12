import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface PreBuiltPC {
  id: string;
  name: string;
  description: string;
  specs: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean;
  display_order: number;
  stock_status: string;
}

const STOCK_STATUS = [
  { value: 'in_stock', label: 'Em Estoque', color: 'green' },
  { value: 'low_stock', label: 'Últimas Unidades', color: 'orange' },
  { value: 'out_of_stock', label: 'Esgotado', color: 'red' },
];

export default function PreBuiltPCsTab() {
  const [pcs, setPCs] = useState<PreBuiltPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPC, setEditingPC] = useState<PreBuiltPC | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    specs: '',
    price: 0,
    image_url: '',
    category: 'Torre',
    display_order: 1,
    is_active: true,
    stock_status: 'in_stock'
  });

  useEffect(() => {
    fetchPCs();
  }, []);

  const fetchPCs = async () => {
    try {
      const { data, error } = await supabase
        .from('pre_built_pcs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPCs(data || []);
    } catch (error) {
      console.error('Erro ao carregar PCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPC) {
        const { error } = await supabase
          .from('pre_built_pcs')
          .update(formData)
          .eq('id', editingPC.id);

        if (error) throw error;
        alert('✅ PC atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('pre_built_pcs')
          .insert([formData]);

        if (error) throw error;
        alert('✅ PC adicionado com sucesso!');
      }

      setShowModal(false);
      setEditingPC(null);
      resetForm();
      fetchPCs();
    } catch (error) {
      console.error('Erro ao salvar PC:', error);
      alert('❌ Erro ao salvar PC. Tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este PC?')) return;

    try {
      const { error } = await supabase
        .from('pre_built_pcs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ PC excluído com sucesso!');
      fetchPCs();
    } catch (error) {
      console.error('Erro ao excluir PC:', error);
      alert('❌ Erro ao excluir PC. Tente novamente.');
    }
  };

  const handleEdit = (pc: PreBuiltPC) => {
    setEditingPC(pc);
    setFormData({
      name: pc.name,
      description: pc.description,
      specs: pc.specs,
      price: pc.price,
      image_url: pc.image_url,
      category: pc.category,
      display_order: pc.display_order,
      is_active: pc.is_active,
      stock_status: pc.stock_status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      specs: '',
      price: 0,
      image_url: '',
      category: 'Torre',
      display_order: 1,
      is_active: true,
      stock_status: 'in_stock'
    });
  };

  const getStockBadge = (status: string) => {
    const stock = STOCK_STATUS.find(s => s.value === status);
    return stock || STOCK_STATUS[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">PCs Pré-Montados</h3>
          <p className="text-gray-400">Gerencie os PCs exibidos na seção "Encontre Seu PC Ideal"</p>
        </div>
        <button
          onClick={() => {
            setEditingPC(null);
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 flex items-center gap-2"
        >
          <i className="ri-add-line text-xl"></i>
          Adicionar PC
        </button>
      </div>

      {/* PCs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pcs.map((pc) => {
          const stockBadge = getStockBadge(pc.stock_status);
          
          return (
            <div
              key={pc.id}
              className="group relative bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800 hover:border-amber-500 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={pc.image_url}
                  alt={pc.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    pc.is_active 
                      ? 'bg-green-500/20 text-green-400 border border-green-500' 
                      : 'bg-red-500/20 text-red-400 border border-red-500'
                  }`}>
                    {pc.is_active ? 'ATIVO' : 'INATIVO'}
                  </div>
                  
                  <div className={`px-2 py-1 rounded-lg text-xs font-semibold bg-${stockBadge.color}-500/20 text-${stockBadge.color}-400 border border-${stockBadge.color}-500`}>
                    {stockBadge.label}
                  </div>
                </div>

                <div className="absolute top-3 right-3">
                  <div className="px-2 py-1 bg-amber-500/20 backdrop-blur-md rounded-lg border border-amber-500">
                    <span className="text-amber-400 text-xs font-bold">#{pc.display_order}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="text-lg font-bold text-white mb-2 line-clamp-1">{pc.name}</h4>
                
                <p className="text-gray-400 text-xs mb-2 line-clamp-2">{pc.specs}</p>
                
                {pc.description && (
                  <p className="text-gray-500 text-xs mb-3 line-clamp-1 italic">{pc.description}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Preço</p>
                    <p className="text-2xl font-bold text-amber-400">€{pc.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Categoria</p>
                    <p className="text-sm font-semibold text-white">{pc.category}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(pc)}
                    className="flex-1 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors duration-300 font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <i className="ri-edit-line"></i>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(pc.id)}
                    className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors duration-300 font-semibold text-sm"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pcs.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-computer-line text-6xl text-gray-600 mb-4"></i>
          <p className="text-gray-400 text-lg">Nenhum PC cadastrado</p>
          <p className="text-gray-500 text-sm mt-2">Clique em "Adicionar PC" para começar</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-2xl font-bold text-white">
                {editingPC ? 'Editar PC' : 'Adicionar PC'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nome do PC *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  placeholder="Ex: PC Gamer High-End"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Descrição Curta *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  placeholder="Ex: Máxima potência para gaming"
                  required
                />
              </div>

              {/* Specs */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Especificações *
                </label>
                <textarea
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none h-24 resize-none"
                  placeholder="Ex: Intel i9-14900K • RTX 4090 • 64GB RAM • 2TB SSD"
                  required
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Preço (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    placeholder="1499.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Categoria *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    placeholder="Torre"
                    required
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  URL da Imagem *
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  placeholder="https://..."
                  required
                />
              </div>

              {/* Order and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Ordem de Exibição *
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Status do Estoque *
                  </label>
                  <select
                    value={formData.stock_status}
                    onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    required
                  >
                    {STOCK_STATUS.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-700 bg-black/50 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-300">
                  PC ativo (visível na página inicial)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPC(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300"
                >
                  {editingPC ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
