import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import ProductCard from '../../components/base/ProductCard';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  stock: number;
  is_featured: boolean;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  image_url: string;
  product_count?: number;
}

const PRODUCTS_PER_PAGE = 12;

export default function CategoryPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const categoryId = searchParams.get('id');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para controlar expansão dos filtros
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    categories: true,
    price: true,
    sort: true
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [categoryId, sortBy]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      // Buscar contagem de produtos para cada categoria
      const categoriesWithCount = await Promise.all(
        (data || []).map(async (category) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);
          
          return { ...category, product_count: count || 0 };
        })
      );

      setCategories(categoriesWithCount);

      if (categoryId) {
        const current = categoriesWithCount.find(c => c.id === categoryId);
        setCurrentCategory(current || null);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      // Ordenação
      switch (sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesPrice;
  });

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Resetar para página 1 quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceRange, categoryId, sortBy]);

  const handleCategoryChange = (catId: string | null) => {
    if (catId) {
      navigate(`/category?id=${catId}`);
    } else {
      navigate('/category');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Gerar números de página para exibir
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

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0b0011]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#b62bff] mb-4"></div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            A carregar produtos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0b0011]' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de Filtros */}
          <aside className={`lg:w-80 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl p-6 h-fit lg:sticky lg:top-24 shadow-lg border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <i className="ri-filter-3-line mr-2 text-[#b62bff]"></i>
              Filtros
            </h2>

            {/* Pesquisa */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('search')}
                className={`w-full flex items-center justify-between text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} hover:text-[#b62bff] transition-colors`}
              >
                <span>Pesquisar</span>
                <i className={`ri-arrow-${expandedSections.search ? 'up' : 'down'}-s-line`}></i>
              </button>
              {expandedSections.search && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Procurar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-4 py-2.5 pl-10 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-[#b62bff] focus:border-transparent transition-all text-sm`}
                  />
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
              )}
            </div>

            {/* Categorias */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('categories')}
                className={`w-full flex items-center justify-between text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} hover:text-[#b62bff] transition-colors`}
              >
                <span>Categorias</span>
                <i className={`ri-arrow-${expandedSections.categories ? 'up' : 'down'}-s-line`}></i>
              </button>
              {expandedSections.categories && (
                <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm flex items-center justify-between group ${
                      !categoryId
                        ? darkMode
                          ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white'
                          : 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white'
                        : darkMode
                        ? 'hover:bg-gray-800 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <i className="ri-apps-line"></i>
                      Todas as Categorias
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      !categoryId
                        ? 'bg-white/20'
                        : darkMode
                        ? 'bg-gray-800'
                        : 'bg-gray-200'
                    }`}>
                      {products.length}
                    </span>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm flex items-center justify-between group ${
                        categoryId === category.id
                          ? darkMode
                            ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white'
                            : 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white'
                          : darkMode
                          ? 'hover:bg-gray-800 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <i className={category.icon}></i>
                        {category.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        categoryId === category.id
                          ? 'bg-white/20'
                          : darkMode
                          ? 'bg-gray-800'
                          : 'bg-gray-200'
                      }`}>
                        {category.product_count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Faixa de Preço */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('price')}
                className={`w-full flex items-center justify-between text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} hover:text-[#b62bff] transition-colors`}
              >
                <span>Faixa de Preço</span>
                <i className={`ri-arrow-${expandedSections.price ? 'up' : 'down'}-s-line`}></i>
              </button>
              {expandedSections.price && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      €{priceRange[0]}
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      €{priceRange[1]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#b62bff]"
                  />
                </div>
              )}
            </div>

            {/* Ordenar por */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('sort')}
                className={`w-full flex items-center justify-between text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} hover:text-[#b62bff] transition-colors`}
              >
                <span>Ordenar por</span>
                <i className={`ri-arrow-${expandedSections.sort ? 'up' : 'down'}-s-line`}></i>
              </button>
              {expandedSections.sort && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#b62bff] focus:border-transparent transition-all text-sm cursor-pointer`}
                >
                  <option value="newest">Mais Recentes</option>
                  <option value="price_asc">Menor Preço</option>
                  <option value="price_desc">Maior Preço</option>
                  <option value="name">Nome A-Z</option>
                </select>
              )}
            </div>

            {/* Botão Limpar Filtros */}
            <button
              onClick={() => {
                setSearchTerm('');
                setPriceRange([0, 1000]);
                setSortBy('newest');
                handleCategoryChange(null);
              }}
              className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                darkMode
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className="ri-refresh-line mr-2"></i>
              Limpar Filtros
            </button>
          </aside>

          {/* Área de Produtos */}
          <div className="flex-1">
            {/* Header */}
            <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl p-6 mb-6 shadow-lg border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentCategory ? currentCategory.name : 'Todos os Produtos'}
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                  </p>
                </div>
                {currentCategory && (
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <i className={`${currentCategory.icon} text-2xl text-[#b62bff]`}></i>
                  </div>
                )}
              </div>
            </div>

            {/* Grid de Produtos */}
            {currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl p-6 shadow-lg border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Info */}
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        A mostrar {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} produtos
                      </p>

                      {/* Navegação */}
                      <div className="flex items-center gap-2">
                        {/* Botão Anterior */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-3 py-2 rounded-lg transition-all ${
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
                                className={`px-3 py-2 rounded-lg transition-all min-w-[40px] ${
                                  currentPage === page
                                    ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white font-medium'
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
                          className={`px-3 py-2 rounded-lg transition-all ${
                            currentPage === totalPages
                              ? darkMode
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : darkMode
                              ? 'bg-gray-800 text-white hover:bg-gray-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <i className="ri-arrow-right-s-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl p-12 text-center shadow-lg border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <i className="ri-inbox-line text-6xl text-gray-400 mb-4"></i>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Nenhum produto encontrado
                </h3>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tente ajustar os filtros ou pesquisar por outros termos
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setPriceRange([0, 1000]);
                    handleCategoryChange(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  <i className="ri-refresh-line mr-2"></i>
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#1f2937' : '#f3f4f6'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4b5563' : '#d1d5db'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b62bff;
        }
      `}</style>
    </div>
  );
}