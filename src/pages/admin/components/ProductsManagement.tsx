import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import ProductFormModal from './ProductFormModal';

interface ProductsManagementProps {
  darkMode: boolean;
}

export default function ProductsManagement({ darkMode }: ProductsManagementProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      alert('Produto excluído com sucesso!');
      loadProducts();
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedProducts.length} produtos selecionados?`)) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedProducts);

      if (error) throw error;
      
      alert('Produtos excluídos com sucesso!');
      setSelectedProducts([]);
      loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produtos:', error);
      alert('Erro ao excluir produtos');
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['ID', 'Nome', 'SKU', 'Preço', 'Estoque', 'Categoria', 'Status'].join(','),
      ...filteredProducts.map(p => [
        p.id,
        `"${p.name}"`,
        p.sku || '',
        p.price,
        p.stock,
        p.categories?.name || '',
        p.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produtos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Resetar para página 1 quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Gerar números de página
  const getPageNumbers = () => {
    const pages = [];
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-box-3-line text-yellow-500"></i>
            Gestão de Produtos
          </h2>
          <p className="text-gray-400 mt-1">Gerencie todo o catálogo de produtos</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <i className="ri-delete-bin-line"></i>
              Excluir ({selectedProducts.length})
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className={`px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-300'} hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap`}
          >
            <i className="ri-download-line"></i>
            Exportar CSV
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            Novo Produto
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 rounded-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
          >
            <option value="all">Todas Categorias</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
          >
            <option value="all">Todos Status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="draft">Rascunho</option>
          </select>
        </div>
      </div>

      {showModal && (
        <ProductFormModal
          darkMode={darkMode}
          product={editingProduct}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSave={loadProducts}
        />
      )}

      <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts(currentProducts.map(p => p.id));
                          } else {
                            setSelectedProducts([]);
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Produto</th>
                    <th className="px-6 py-4 text-left font-semibold">SKU</th>
                    <th className="px-6 py-4 text-left font-semibold">Preço</th>
                    <th className="px-6 py-4 text-left font-semibold">Estoque</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((product) => {
                    const images = Array.isArray(product.images) && product.images.length > 0 
                      ? product.images 
                      : ['https://readdy.ai/api/search-image?query=product%20placeholder&width=100&height=100&seq=' + product.id + '&orientation=squarish'];
                    
                    return (
                      <tr
                        key={product.id}
                        className={`border-t ${darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts([...selectedProducts, product.id]);
                              } else {
                                setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                              <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{product.name}</p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {product.categories?.name || 'Sem categoria'}
                              </p>
                              {images.length > 1 && (
                                <p className="text-xs text-yellow-500 flex items-center gap-1 mt-1">
                                  <i className="ri-image-line"></i>
                                  {images.length} fotos
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {product.sku || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-yellow-500">
                            €{product.price?.toFixed(2)}
                          </span>
                          {product.promotional_price && (
                            <p className="text-xs text-green-500">
                              Promo: €{product.promotional_price.toFixed(2)}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${
                            product.stock <= product.min_stock ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {product.stock || 0}
                          </span>
                          {product.stock <= product.min_stock && (
                            <p className="text-xs text-red-500">Estoque baixo!</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.status === 'active'
                              ? 'bg-green-500/20 text-green-500'
                              : product.status === 'inactive'
                              ? 'bg-gray-500/20 text-gray-500'
                              : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {product.status === 'active' ? 'Ativo' : product.status === 'inactive' ? 'Inativo' : 'Rascunho'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                              title="Editar"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(product.id);
                                alert('ID copiado!');
                              }}
                              className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
                              title="Copiar ID"
                            >
                              <i className="ri-file-copy-line"></i>
                            </button>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                              title="Excluir"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Info */}
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} produtos
                  </p>

                  {/* Navegação */}
                  <div className="flex items-center gap-2">
                    {/* Botão Anterior */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1 ${
                        currentPage === 1
                          ? darkMode
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : darkMode
                          ? 'bg-gray-800 text-white hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <i className="ri-arrow-left-s-line"></i>
                      <span className="hidden sm:inline">Anterior</span>
                    </button>

                    {/* Números de Página */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span
                            key={`ellipsis-${index}`}
                            className={`px-3 py-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            className={`px-3 py-2 rounded-lg transition-all min-w-[40px] font-medium ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                                : darkMode
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                    </div>

                    {/* Botão Próximo */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1 ${
                        currentPage === totalPages
                          ? darkMode
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : darkMode
                          ? 'bg-gray-800 text-white hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="hidden sm:inline">Próximo</span>
                      <i className="ri-arrow-right-s-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
