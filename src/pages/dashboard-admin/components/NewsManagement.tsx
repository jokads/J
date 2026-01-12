import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { newsMock } from '../../../mocks/news';

export default function NewsManagement() {
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'hardware',
    image_url: '',
    author: 'Claudio Pereira',
    is_featured: false
  });

  const categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'hardware', label: '🔧 Hardware' },
    { value: 'jogos', label: '🎮 Jogos' },
    { value: 'avaliacoes', label: '⭐ Avaliações' },
    { value: 'noticias', label: '📰 Notícias' }
  ];

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Tabela news não existe, usando mock data');
        setNews(newsMock);
      } else {
        setNews(data || newsMock);
      }
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
      setNews(newsMock);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editingNews) {
        // Atualizar notícia existente
        const { error } = await supabase
          .from('news')
          .update(formData)
          .eq('id', editingNews.id);

        if (error) throw error;
        alert('✅ Notícia atualizada com sucesso!');
      } else {
        // Criar nova notícia
        const { error } = await supabase
          .from('news')
          .insert([formData]);

        if (error) throw error;
        alert('✅ Notícia criada com sucesso!');
      }

      setShowAddModal(false);
      setEditingNews(null);
      setFormData({
        title: '',
        description: '',
        content: '',
        category: 'hardware',
        image_url: '',
        author: 'Claudio Pereira',
        is_featured: false
      });
      loadNews();
    } catch (error: any) {
      console.error('Erro ao salvar notícia:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta notícia?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Notícia deletada com sucesso!');
      loadNews();
    } catch (error: any) {
      console.error('Erro ao deletar notícia:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (newsItem: any) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      description: newsItem.description,
      content: newsItem.content,
      category: newsItem.category,
      image_url: newsItem.image_url,
      author: newsItem.author,
      is_featured: newsItem.is_featured
    });
    setShowAddModal(true);
  };

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(n => n.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-2 border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <i className="ri-newspaper-line text-blue-400"></i>
              📰 GESTÃO DE NOTÍCIAS
            </h2>
            <p className="text-gray-300">
              Gerencie todas as notícias do site: Hardware, Jogos, Avaliações e Notícias Gerais
            </p>
          </div>
          <button
            onClick={() => {
              setEditingNews(null);
              setFormData({
                title: '',
                description: '',
                content: '',
                category: 'hardware',
                image_url: '',
                author: 'Claudio Pereira',
                is_featured: false
              });
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:scale-105 whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            ADICIONAR NOTÍCIA
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <div className="flex flex-wrap gap-3">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Notícias */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-400">Carregando notícias...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((newsItem) => (
            <div key={newsItem.id} className="bg-black/60 backdrop-blur-sm rounded-xl overflow-hidden border border-blue-500/20 hover:border-blue-500/50 transition-all">
              <div className="relative h-48">
                <img 
                  src={newsItem.image_url} 
                  alt={newsItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                    {categories.find(c => c.value === newsItem.category)?.label}
                  </span>
                </div>
                {newsItem.is_featured && (
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      ⭐ DESTAQUE
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{newsItem.title}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">{newsItem.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Por {newsItem.author}</span>
                  <span>{new Date(newsItem.created_at).toLocaleDateString('pt-BR')}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(newsItem)}
                    className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all font-bold"
                  >
                    <i className="ri-edit-line mr-2"></i>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(newsItem.id)}
                    className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-bold"
                  >
                    <i className="ri-delete-bin-line mr-2"></i>
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Adicionar/Editar */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500/30">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 p-6 border-b-2 border-blue-400">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">
                  {editingNews ? '✏️ EDITAR NOTÍCIA' : '➕ ADICIONAR NOTÍCIA'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingNews(null);
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <i className="ri-close-line text-2xl text-white"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Título da Notícia *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: RTX 4070 Eleita Melhor GPU"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="hardware">🔧 Hardware</option>
                  <option value="jogos">🎮 Jogos</option>
                  <option value="avaliacoes">⭐ Avaliações</option>
                  <option value="noticias">📰 Notícias</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Descrição Curta *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Descrição curta que aparece no card"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Conteúdo Completo *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Conteúdo completo da notícia"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  URL da Imagem *
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                {formData.image_url && (
                  <div className="mt-3 rounded-lg overflow-hidden">
                    <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Autor
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className="w-5 h-5 text-blue-500 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_featured" className="text-sm font-bold text-gray-300">
                  ⭐ Marcar como Destaque (aparece na página inicial)
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingNews(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !formData.title || !formData.description}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando...' : editingNews ? '💾 SALVAR ALTERAÇÕES' : '➕ CRIAR NOTÍCIA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
