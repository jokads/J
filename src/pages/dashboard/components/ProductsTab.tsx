import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  description: string;
  is_featured?: boolean;
  is_marketplace?: boolean;
  seller_email?: string;
  created_at?: string;
}

const CATEGORIES = [
  'CPU', 'GPU', 'RAM', 'SSD', 'Placa-Mãe', 'Fonte', 'Torre', 
  'PC Completo', 'PC Portátil', 'Monitor', 'Teclado', 'Mouse', 
  'Headset', 'Cadeira', 'Webcam', 'Microfone', 'Periféricos', 'Outros'
];

const BRANDS = [
  'NVIDIA', 'AMD', 'Intel', 'Corsair', 'Samsung', 'ASUS', 'MSI', 
  'Logitech', 'G.Skill', 'Western Digital', 'Crucial', 'Kingston',
  'Seagate', 'Gigabyte', 'ASRock', 'be quiet!', 'Seasonic', 'NZXT',
  'Cooler Master', 'Thermaltake', 'HyperX', 'SteelSeries', 'Razer'
];

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'GPU',
    price: 0,
    stock: 0,
    image_url: '',
    description: '',
    featured: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        // Removido temporariamente até executar o SQL que adiciona a coluna
        // .eq('is_marketplace', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filtrar produtos oficiais no frontend temporariamente
      const officialProducts = (data || []).filter(
        (p: any) => !p.is_marketplace && !p.seller_email
      );
      
      setProducts(officialProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image_url: formData.image_url,
        description: formData.description,
        is_featured: formData.is_featured,
        // Garantir que é produto oficial
        is_marketplace: false,
        seller_email: null,
        rating: 4.5,
        reviews_count: 0,
        created_at: new Date().toISOString(),
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        alert('✅ Produto atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        alert('✅ Produto criado com sucesso!');
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert(`❌ Erro ao salvar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}\n\n⚠️ IMPORTANTE: Execute o arquivo FIX_PRODUCTS_ADD_IS_FEATURED.sql no Supabase Dashboard primeiro!`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Produto excluído com sucesso!');
      fetchProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('❌ Erro ao excluir produto. Tente novamente.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url,
      description: product.description,
      featured: product.is_featured || false,
    });
    setShowModal(true);
  };

  const handleToggleFeatured = async (productId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !currentFeatured })
        .eq('id', productId);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Erro ao atualizar destaque:', error);
      alert('❌ Erro ao atualizar destaque!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: 'GPU',
      price: 0,
      stock: 0,
      image_url: '',
      description: '',
      featured: false,
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
          <h3 className="text-2xl font-bold text-white mb-2">📦 Produtos Oficiais</h3>
          <p className="text-gray-400">Gerencie os produtos da loja oficial JokaTech</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
        >
          <i className="ri-add-line text-xl"></i>
          Adicionar Produto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-amber-500/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Busca */}
          <div className="relative">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="🔍 Buscar por nome, marca ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black/50 border border-amber-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Estatísticas */}
          <div className="flex items-center justify-end gap-4 text-sm">
            <div className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
              <span className="font-bold">{products.length}</span> Total
            </div>
            <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30">
              <span className="font-bold">{products.filter(p => p.stock > 0).length}</span> Em Estoque
            </div>
            <div className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <span className="font-bold">{products.filter(p => p.is_featured).length}</span> Destaque
            </div>
          </div>
        </div>

        {/* Categorias */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                : 'bg-black/40 text-gray-400 hover:bg-black/60 border border-amber-500/20'
            }`}
          >
            Todas ({products.length})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                  : 'bg-black/40 text-gray-400 hover:bg-black/60 border border-amber-500/20'
              }`}
            >
              {cat} ({products.filter(p => p.category === cat).length})
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-amber-500/30">
          <i className="ri-box-line text-6xl text-gray-600 mb-4"></i>
          <p className="text-gray-400 text-lg">Nenhum produto encontrado</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Tente ajustar os filtros' 
              : 'Clique em "Adicionar Produto" para começar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800 hover:border-amber-500 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.is_featured && (
                    <div className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full">
                      ⭐ DESTAQUE
                    </div>
                  )}
                  {product.stock < 10 && product.stock > 0 && (
                    <div className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500">
                      ⚠️ ESTOQUE BAIXO
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs font-bold rounded-full border border-gray-500/30">
                      ❌ SEM ESTOQUE
                    </div>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <div className="px-3 py-1 bg-amber-500/20 backdrop-blur-md rounded-lg border border-amber-500">
                    <span className="text-amber-400 text-xs font-bold">{product.category}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-xs text-amber-400 font-bold mb-2">{product.brand}</p>
                <h4 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem]">{product.name}</h4>
                
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-amber-500/20">
                  <div>
                    <p className="text-xs text-gray-500">Preço</p>
                    <p className="text-2xl font-bold text-amber-400">€{product.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Estoque</p>
                    <p className={`text-xl font-bold ${product.stock < 10 ? 'text-red-400' : 'text-green-400'}`}>
                      {product.stock} un.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleFeatured(product.id, product.is_featured || false)}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer text-sm ${
                        product.is_featured
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                      }`}
                    >
                      <i className={`ri-star-${product.is_featured ? 'fill' : 'line'}`}></i>
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors font-semibold text-sm border border-blue-500/30"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-semibold text-sm border border-red-500/30"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 sticky top-0 bg-gradient-to-br from-gray-900 to-black z-10">
              <h3 className="text-2xl font-bold text-white">
                {editingProduct ? '✏️ Editar Produto' : '➕ Adicionar Produto'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  📝 Nome do Produto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Ex: NVIDIA GeForce RTX 4090"
                  required
                />
              </div>

              {/* Brand and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    🏷️ Marca *
                  </label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
                    required
                  >
                    <option value="">Selecione...</option>
                    {BRANDS.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    📁 Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    💰 Preço (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    📦 Estoque *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  🖼️ URL da Imagem *
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="https://..."
                  required
                />
                {formData.image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-700">
                    <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  📄 Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none h-24 resize-none transition-colors"
                  placeholder="Descrição detalhada do produto..."
                  required
                />
              </div>

              {/* Featured */}
              <div className="flex items-center gap-3 p-4 bg-black/30 rounded-lg border border-gray-700">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-700 bg-black/50 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="featured" className="text-sm font-semibold text-gray-300 cursor-pointer">
                  ⭐ Marcar como produto em destaque (aparece na página inicial)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-300 whitespace-nowrap"
                >
                  ✕ Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 whitespace-nowrap"
                >
                  {editingProduct ? '💾 Atualizar' : '➕ Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
