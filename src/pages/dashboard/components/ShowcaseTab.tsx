import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  featured: boolean;
  stock: number;
  is_marketplace: boolean;
}

const CATEGORIES = [
  'GPU', 'CPU', 'RAM', 'SSD', 'Placa Mãe', 'Fonte', 'Torre', 
  'PC Completo', 'PC Portátil', 'Monitor', 'Teclado', 'Mouse', 
  'Headset', 'Cadeira', 'Webcam', 'Microfone', 'Periféricos'
];

export default function ShowcaseTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_marketplace', false)
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ featured: !currentStatus })
        .eq('id', productId);

      if (error) throw error;
      
      alert(currentStatus ? '❌ Produto removido dos destaques!' : '✅ Produto adicionado aos destaques!');
      fetchProducts();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('❌ Erro ao atualizar produto. Tente novamente.');
    }
  };

  const filteredProducts = selectedCategory === 'Todas' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const featuredProducts = products.filter(p => p.featured);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-900/50 to-amber-800/50 rounded-xl p-6 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-1">Total de Produtos</p>
              <p className="text-3xl font-black text-white">{products.length}</p>
            </div>
            <i className="ri-shopping-bag-line text-4xl text-amber-400"></i>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-semibold mb-1">Em Destaque</p>
              <p className="text-3xl font-black text-white">{featuredProducts.length}</p>
            </div>
            <i className="ri-star-line text-4xl text-green-400"></i>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-semibold mb-1">Categorias</p>
              <p className="text-3xl font-black text-white">{CATEGORIES.length}</p>
            </div>
            <i className="ri-folder-line text-4xl text-blue-400"></i>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-amber-500/30">
        <h3 className="text-xl font-bold text-white mb-4">🔍 Filtrar por Categoria</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('Todas')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'Todas'
                ? 'bg-amber-500 text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Todas ({products.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = products.filter(p => p.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Produtos */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4">
          ⭐ Gerencie os Produtos em Destaque
        </h3>
        <p className="text-gray-400 mb-6">
          Clique na estrela para adicionar ou remover produtos dos destaques da página inicial
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`group relative bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                product.featured 
                  ? 'border-amber-500 shadow-lg shadow-amber-500/30' 
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                {/* Featured Badge */}
                {product.featured && (
                  <div className="absolute top-3 left-3">
                    <div className="px-3 py-1 bg-amber-500 rounded-lg animate-pulse">
                      <span className="text-black text-xs font-black uppercase tracking-wider">⭐ DESTAQUE</span>
                    </div>
                  </div>
                )}

                {/* Category */}
                <div className="absolute top-3 right-3">
                  <div className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg border border-gray-700">
                    <span className="text-white text-xs font-bold">{product.category}</span>
                  </div>
                </div>

                {/* Toggle Featured Button */}
                <button
                  onClick={() => toggleFeatured(product.id, product.featured)}
                  className={`absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    product.featured
                      ? 'bg-amber-500 text-black hover:bg-amber-600'
                      : 'bg-gray-800/80 backdrop-blur-md text-gray-400 hover:bg-gray-700 hover:text-amber-500'
                  }`}
                  title={product.featured ? 'Remover dos destaques' : 'Adicionar aos destaques'}
                >
                  <i className={`${product.featured ? 'ri-star-fill' : 'ri-star-line'} text-2xl`}></i>
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem]">
                  {product.name}
                </h4>
                <p className="text-gray-400 text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-amber-500">
                      €{Number(product.price).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Estoque: {product.stock}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800">
            <i className="ri-inbox-line text-6xl text-gray-600 mb-4"></i>
            <p className="text-gray-400 text-lg font-semibold">
              Nenhum produto encontrado nesta categoria
            </p>
          </div>
        )}
      </div>

      {/* Produtos em Destaque Atual */}
      {featuredProducts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 rounded-xl p-6 border border-amber-500/30">
          <h3 className="text-xl font-bold text-white mb-4">
            ⭐ Produtos Atualmente em Destaque ({featuredProducts.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredProducts.map((product) => (
              <div key={product.id} className="text-center">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2 border-2 border-amber-500">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-white text-sm font-semibold line-clamp-2">
                  {product.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
