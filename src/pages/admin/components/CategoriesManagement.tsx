import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useTheme } from '../../../contexts/ThemeContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  images: string[];
  icon: string;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export default function CategoriesManagement() {
  const { darkMode } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'normal'>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    images: [] as string[],
    icon: 'ri-folder-line',
    parent_id: null as string | null,
    display_order: 0,
    is_active: true,
    is_featured: false,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });

  // Estado para nova imagem
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Buscar contagem de produtos para cada categoria
      const categoriesWithCount = await Promise.all(
        (data || []).map(async (category) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);

          return {
            ...category,
            product_count: count || 0,
          };
        })
      );

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar categorias
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && category.is_active) ||
                         (statusFilter === 'inactive' && !category.is_active);
    const matchesFeatured = featuredFilter === 'all' ||
                           (featuredFilter === 'featured' && category.is_featured) ||
                           (featuredFilter === 'normal' && !category.is_featured);
    
    return matchesSearch && matchesStatus && matchesFeatured;
  });

  // Paginação
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  // Resetar página ao filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, featuredFilter]);

  // Gerar números de página
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Estatísticas
  const stats = {
    total: categories.length,
    active: categories.filter(c => c.is_active).length,
    featured: categories.filter(c => c.is_featured).length,
    withProducts: categories.filter(c => (c.product_count || 0) > 0).length,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const categoryData = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        image: formData.images.length > 0 ? formData.images[0] : formData.image,
        updated_at: new Date().toISOString(),
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ ...categoryData, created_at: new Date().toISOString() }]);

        if (error) throw error;
      }

      setShowModal(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert('Erro ao excluir categoria!');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selectedCategories.length} categoria(s)?`)) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .in('id', selectedCategories);

      if (error) throw error;
      setSelectedCategories([]);
      fetchCategories();
    } catch (error) {
      console.error('Erro ao excluir categorias:', error);
      alert('Erro ao excluir categorias!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      images: [],
      icon: 'ri-folder-line',
      parent_id: null,
      display_order: 0,
      is_active: true,
      is_featured: false,
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
    });
    setNewImageUrl('');
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
      images: category.images || [],
      icon: category.icon || 'ri-folder-line',
      parent_id: category.parent_id,
      display_order: category.display_order,
      is_active: category.is_active,
      is_featured: category.is_featured,
      meta_title: category.meta_title || '',
      meta_description: category.meta_description || '',
      meta_keywords: category.meta_keywords || '',
    });
    setShowModal(true);
  };

  // Adicionar imagem
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    if (formData.images.length >= 10) {
      alert('Máximo de 10 imagens permitido!');
      return;
    }

    setFormData({
      ...formData,
      images: [...formData.images, newImageUrl.trim()],
      image: formData.images.length === 0 ? newImageUrl.trim() : formData.image,
    });
    setNewImageUrl('');
  };

  // Remover imagem
  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages,
      image: index === 0 && newImages.length > 0 ? newImages[0] : formData.image,
    });
  };

  // Mover imagem
  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...formData.images];
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newImages.length) return;
    
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    
    setFormData({
      ...formData,
      images: newImages,
      image: newImages[0],
    });
  };

  // Selecionar todos
  const handleSelectAll = () => {
    if (selectedCategories.length === currentCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(currentCategories.map(c => c.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📁 Gestão de Categorias
          </h2>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Organize produtos e serviços em categorias
          </p>
        </div>
        <div className="flex gap-3">
          {selectedCategories.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-6 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <i className="ri-delete-bin-line text-xl"></i>
              Excluir ({selectedCategories.length})
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              setEditingCategory(null);
              setShowModal(true);
            }}
            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-add-line text-xl"></i>
            Nova Categoria
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-folder-line text-2xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ativas</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.active}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-2xl text-green-600"></i>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Em Destaque</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.featured}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Exibidas na página inicial
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="ri-star-line text-2xl text-yellow-600"></i>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Com Produtos</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.withProducts}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="ri-shopping-bag-line text-2xl text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              🔍 Pesquisar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome ou descrição..."
              className={`w-full px-4 py-3 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              📊 Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`w-full px-4 py-3 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              ⭐ Destaque
            </label>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value as any)}
              className={`w-full px-4 py-3 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
            >
              <option value="all">Todas</option>
              <option value="featured">Em Destaque</option>
              <option value="normal">Normais</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCategories.length === currentCategories.length && currentCategories.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                  />
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Categoria
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Produtos
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Destaque
                </th>
                <th className={`px-6 py-4 text-right text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : currentCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <i className="ri-folder-line text-6xl text-gray-600 mb-4"></i>
                    <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Nenhuma categoria encontrada
                    </p>
                  </td>
                </tr>
              ) : (
                currentCategories.map((category) => (
                  <tr key={category.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                          }
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={(category.images && category.images.length > 0 ? category.images[0] : category.image) || `https://readdy.ai/api/search-image?query=professional%20$%7Bcategory.name%7D%20category%20products%20elegant%20arrangement%20vibrant%20colors%20high%20quality%20commercial%20photography%20clean%20background%20no%20people&width=400&height=400&seq=cat-${category.id}-admin&orientation=squarish`}
                          alt={category.name}
                          className="w-16 h-16 object-cover rounded-lg shadow-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://readdy.ai/api/search-image?query=professional%20$%7Bcategory.name%7D%20category%20products%20elegant%20arrangement%20vibrant%20colors%20high%20quality%20commercial%20photography%20clean%20background%20no%20people&width=400&height=400&seq=cat-fallback-${category.id}&orientation=squarish`;
                          }}
                        />
                        <div>
                          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {category.name}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {category.description?.substring(0, 50)}...
                          </p>
                          {(category.images?.length || 0) > 1 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full mt-1">
                              <i className="ri-image-line"></i>
                              {category.images?.length} fotos
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        (category.product_count || 0) > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <i className="ri-shopping-bag-line"></i>
                        {category.product_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <i className={category.is_active ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'}></i>
                        {category.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {category.is_featured && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          <i className="ri-star-fill"></i>
                          Destaque
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <i className="ri-edit-line text-xl"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <i className="ri-delete-bin-line text-xl"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredCategories.length)} de {filteredCategories.length} categorias
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <i className="ri-arrow-left-s-line"></i>
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-yellow-500 text-black'
                            : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">Próximo</span>
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-4xl my-8`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingCategory ? '✏️ Editar Categoria' : '➕ Nova Categoria'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCategory(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Galeria de Imagens */}
              <div className="mb-8">
                <label className={`block text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  🖼️ Galeria de Imagens (até 10 fotos)
                </label>
                
                {/* Grid de Imagens */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        
                        {/* Badge Principal */}
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                            Principal
                          </div>
                        )}

                        {/* Controles */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(index, 'left')}
                              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                              title="Mover para esquerda"
                            >
                              <i className="ri-arrow-left-line text-gray-900"></i>
                            </button>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Remover"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>

                          {index < formData.images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(index, 'right')}
                              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                              title="Mover para direita"
                            >
                              <i className="ri-arrow-right-line text-gray-900"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input para adicionar imagem */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                    placeholder="Cole o URL da imagem aqui..."
                    className={`flex-1 px-4 py-3 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    disabled={formData.images.length >= 10}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                      formData.images.length >= 10
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-yellow-500 text-black hover:bg-yellow-600'
                    }`}
                  >
                    <i className="ri-add-line text-xl"></i>
                    Adicionar
                  </button>
                </div>

                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ℹ️ {formData.images.length}/10 imagens • A primeira será a principal
                </p>
              </div>

              {/* Grid de 2 Colunas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna Esquerda */}
                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <i className="ri-information-line text-2xl text-blue-500"></i>
                      Informações Básicas
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Nome da Categoria *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                          placeholder="Ex: Tecnologia"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Slug (URL)
                        </label>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                          placeholder="tecnologia (gerado automaticamente)"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Descrição
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                          placeholder="Descrição da categoria..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Ícone
                          </label>
                          <input
                            type="text"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            className={`w-full px-4 py-3 rounded-lg border ${
                              darkMode
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                            placeholder="ri-folder-line"
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Ordem
                          </label>
                          <input
                            type="number"
                            value={formData.display_order}
                            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                            className={`w-full px-4 py-3 rounded-lg border ${
                              darkMode
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status e Destaque */}
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <i className="ri-settings-3-line text-2xl text-green-500"></i>
                      Configurações
                    </h4>

                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                        />
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          ✅ Categoria Ativa
                        </span>
                      </label>

                      <div className={`p-4 rounded-lg border-2 ${
                        formData.is_featured 
                          ? 'border-yellow-500 bg-yellow-500/10' 
                          : darkMode ? 'border-gray-600 bg-gray-600/20' : 'border-gray-300 bg-gray-100'
                      }`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                ⭐ Exibir em Destaque
                              </span>
                              {formData.is_featured && (
                                <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full">
                                  ATIVO
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Categorias em destaque aparecem na seção "Encontre o Que Procura" da página inicial e nos filtros principais
                            </p>
                            {stats.featured > 0 && (
                              <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                📊 Atualmente {stats.featured} categoria(s) em destaque
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna Direita */}
                <div className="space-y-6">
                  {/* SEO */}
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <i className="ri-search-line text-2xl text-purple-500"></i>
                      SEO & Meta Tags
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Meta Título
                        </label>
                        <input
                          type="text"
                          value={formData.meta_title}
                          onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                          maxLength={60}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                          placeholder="Título otimizado para SEO"
                        />
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formData.meta_title.length}/60 caracteres
                        </p>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Meta Descrição
                        </label>
                        <textarea
                          value={formData.meta_description}
                          onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                          maxLength={160}
                          rows={3}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                          placeholder="Descrição otimizada para motores de busca"
                        />
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formData.meta_description.length}/160 caracteres
                        </p>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Palavras-chave
                        </label>
                        <input
                          type="text"
                          value={formData.meta_keywords}
                          onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                          placeholder="tecnologia, eletrônicos, gadgets"
                        />
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Separe por vírgulas
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <i className="ri-eye-line text-2xl text-yellow-500"></i>
                      Preview
                    </h4>

                    <div className={`p-4 rounded-lg border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      {formData.images.length > 0 ? (
                        <img
                          src={formData.images[0]}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                          <i className="ri-image-line text-6xl text-gray-400"></i>
                        </div>
                      )}
                      
                      <h5 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formData.name || 'Nome da Categoria'}
                      </h5>
                      
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formData.description || 'Descrição da categoria...'}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        {formData.is_active && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            <i className="ri-checkbox-circle-line"></i>
                            Ativa
                          </span>
                        )}
                        {formData.is_featured && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            <i className="ri-star-fill"></i>
                            Em Destaque
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ❌ Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <i className="ri-save-line text-xl"></i>
                  💾 Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}