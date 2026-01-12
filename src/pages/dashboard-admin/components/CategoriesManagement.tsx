import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  product_count: number;
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'ri-box-line'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      
      // Buscar todas as categorias únicas dos produtos
      const { data: products, error } = await supabase
        .from('products')
        .select('category');

      if (error) throw error;

      // Contar produtos por categoria
      const categoryCounts: { [key: string]: number } = {};
      products?.forEach(p => {
        if (p.category) {
          categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
        }
      });

      // Criar array de categorias com contagem
      const categoriesArray: Category[] = Object.keys(categoryCounts).map((cat, index) => ({
        id: `cat-${index}`,
        name: cat,
        slug: cat.toLowerCase().replace(/\s+/g, '-'),
        description: `Produtos da categoria ${cat}`,
        icon: getCategoryIcon(cat),
        product_count: categoryCounts[cat]
      }));

      setCategories(categoriesArray);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      alert('Erro ao carregar categorias!');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      'GPU': 'ri-cpu-line',
      'CPU': 'ri-cpu-line',
      'RAM': 'ri-database-2-line',
      'SSD': 'ri-hard-drive-line',
      'Placa Mãe': 'ri-motherboard-line',
      'Fonte': 'ri-flashlight-line',
      'Torre': 'ri-building-line',
      'PC Completo': 'ri-computer-line',
      'PC Portátil': 'ri-macbook-line',
      'Monitor': 'ri-tv-line',
      'Periféricos': 'ri-keyboard-line',
      'Teclado': 'ri-keyboard-line',
      'Mouse': 'ri-mouse-line',
      'Headset': 'ri-headphone-line',
      'Cadeira': 'ri-armchair-line',
      'Webcam': 'ri-webcam-line',
      'Microfone': 'ri-mic-line'
    };
    return icons[category] || 'ri-box-line';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Por favor, preencha o nome da categoria!');
      return;
    }

    try {
      if (editingCategory) {
        // Atualizar categoria existente - renomear em todos os produtos
        const { error } = await supabase
          .from('products')
          .update({ category: formData.name })
          .eq('category', editingCategory.name);

        if (error) throw error;
        alert('Categoria atualizada com sucesso!');
      } else {
        // Nova categoria - não precisa fazer nada, será criada quando adicionar produtos
        alert('Categoria criada! Adicione produtos nesta categoria para ela aparecer.');
      }

      setShowAddModal(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '', icon: 'ri-box-line' });
      loadCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria!');
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Tem certeza que deseja remover a categoria "${category.name}"?\n\nIsso NÃO removerá os produtos, apenas a categoria.`)) {
      return;
    }

    try {
      // Atualizar produtos para categoria "Outros"
      const { error } = await supabase
        .from('products')
        .update({ category: 'Outros' })
        .eq('category', category.name);

      if (error) throw error;
      
      alert('Categoria removida! Os produtos foram movidos para "Outros".');
      loadCategories();
    } catch (error) {
      console.error('Erro ao remover categoria:', error);
      alert('Erro ao remover categoria!');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon
    });
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-400">Carregando categorias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">📁 Gestão de Categorias</h2>
          <p className="text-gray-400">Gerencie as categorias de produtos do site</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', slug: '', description: '', icon: 'ri-box-line' });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line text-xl"></i>
          ADICIONAR CATEGORIA
        </button>
      </div>

      {/* Lista de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-lg flex items-center justify-center border border-amber-500/30">
                <i className={`${category.icon} text-2xl text-amber-400`}></i>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all cursor-pointer"
                  title="Editar"
                >
                  <i className="ri-edit-line"></i>
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all cursor-pointer"
                  title="Remover"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{category.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-amber-500/20">
              <span className="text-sm text-gray-400">Produtos:</span>
              <span className="text-2xl font-bold text-amber-400">{category.product_count}</span>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 bg-black/60 rounded-xl border border-amber-500/20">
          <i className="ri-folder-open-line text-6xl text-gray-600 mb-4"></i>
          <p className="text-gray-400 text-lg">Nenhuma categoria encontrada</p>
          <p className="text-gray-500 text-sm mt-2">Adicione produtos para criar categorias automaticamente</p>
        </div>
      )}

      {/* Modal Adicionar/Editar */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg max-w-2xl w-full border-2 border-amber-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-amber-400">
                  {editingCategory ? 'EDITAR CATEGORIA' : 'ADICIONAR CATEGORIA'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-white"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Nome da Categoria *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500"
                      placeholder="Ex: Placas de Vídeo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none"
                      placeholder="Descrição da categoria..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Ícone (Remix Icon)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-3 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500"
                      placeholder="Ex: ri-cpu-line"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Veja ícones em: <a href="https://remixicon.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">remixicon.com</a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCategory(null);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-amber-500/50 cursor-pointer whitespace-nowrap"
                  >
                    {editingCategory ? 'SALVAR ALTERAÇÕES' : 'CRIAR CATEGORIA'}
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