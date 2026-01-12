import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useTranslation } from 'react-i18next';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  description: string;
  is_marketplace: boolean;
  seller_id: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface SellerProfile {
  id: string;
  store_name: string;
  store_description: string;
  phone: string;
  address: string;
}

export default function SellerDashboard() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'add' | 'profile' | 'reviews'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 🔥 NOVO: Estado para avaliações
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Formulário de novo produto
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'GPU',
    image_url: '',
    description: ''
  });

  // Formulário de perfil
  const [profileForm, setProfileForm] = useState({
    store_name: '',
    store_description: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadSellerData();
    loadReviews(); // 🔥 NOVO: Carregar avaliações
  }, []);

  const loadSellerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar produtos do vendedor
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .eq('is_marketplace', true)
        .order('created_at', { ascending: false });

      if (productsData) setProducts(productsData);

      // Carregar perfil do vendedor
      const { data: profileData } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setSellerProfile(profileData);
        setProfileForm({
          store_name: profileData.store_name || '',
          store_description: profileData.store_description || '',
          phone: profileData.phone || '',
          address: profileData.address || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NOVO: Carregar avaliações dos produtos do vendedor
  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar avaliações dos produtos do vendedor
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          *,
          products (
            id,
            name,
            image_url
          )
        `)
        .eq('products.seller_id', user.id)
        .order('created_at', { ascending: false });

      if (reviewsData) {
        console.log('✅ Avaliações carregadas:', reviewsData.length);
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar se todos os campos estão preenchidos
      if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category) {
        alert('⚠️ Por favor, preencha todos os campos obrigatórios!');
        return;
      }

      // Preparar dados do produto
      const productData: any = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        category: newProduct.category,
        image_url: newProduct.image_url || 'https://readdy.ai/api/search-image?query=high-performance-gaming-computer-component-product-photo-simple-white-background-professional-ecommerce-style&width=800&height=800&seq=seller-product-default&orientation=squarish',
        description: newProduct.description || '',
        seller_id: user?.id,
        is_marketplace: true,
        featured: false
      };

      // Tentar adicionar approval_status se a coluna existir
      try {
        productData.approval_status = 'pending';
      } catch (err) {
        console.log('Coluna approval_status não existe ainda. Execute o SQL FIX_PRODUCTS_ADD_APPROVAL_STATUS.sql');
      }

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado:', error);
        
        // Se o erro for sobre a coluna approval_status, mostrar mensagem específica
        if (error.message.includes('approval_status')) {
          alert('⚠️ ATENÇÃO: Execute o arquivo SQL "FIX_PRODUCTS_ADD_APPROVAL_STATUS.sql" no Supabase!\n\n' +
                '📋 Passos:\n' +
                '1. Abra o Supabase Dashboard\n' +
                '2. Vá em SQL Editor\n' +
                '3. Abra o arquivo FIX_PRODUCTS_ADD_APPROVAL_STATUS.sql\n' +
                '4. Copie todo o conteúdo\n' +
                '5. Cole no SQL Editor\n' +
                '6. Clique em "Run"\n' +
                '7. Tente adicionar o produto novamente');
          return;
        }
        
        throw error;
      }

      alert('✅ Produto adicionado com sucesso!\n\n⏳ Aguardando aprovação do administrador.');
      
      // Limpar formulário
      setNewProduct({
        name: '',
        price: '',
        stock: '',
        category: 'GPU',
        image_url: '',
        description: ''
      });
      setActiveTab('products');
      loadSellerData();
    } catch (error: any) {
      console.error('Erro ao adicionar produto:', error);
      alert('❌ Erro ao adicionar produto: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Preparar dados de atualização
      const updateData: any = {
        name: editingProduct.name,
        price: parseFloat(editingProduct.price.toString()),
        stock: parseInt(editingProduct.stock.toString()),
        category: editingProduct.category,
        image_url: editingProduct.image_url,
        description: editingProduct.description
      };

      // Tentar adicionar approval_status se a coluna existir
      try {
        updateData.approval_status = 'pending';
      } catch (err) {
        console.log('Coluna approval_status não existe ainda.');
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', editingProduct.id)
        .eq('seller_id', user?.id);

      if (error) {
        console.error('Erro detalhado:', error);
        
        // Se o erro for sobre a coluna approval_status, mostrar mensagem específica
        if (error.message.includes('approval_status')) {
          alert('⚠️ ATENÇÃO: Execute o arquivo SQL "FIX_PRODUCTS_ADD_APPROVAL_STATUS.sql" no Supabase!');
          return;
        }
        
        throw error;
      }

      alert('✅ Produto atualizado!\n\n⏳ Aguardando nova aprovação do administrador.');
      setEditingProduct(null);
      loadSellerData();
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      alert('❌ Erro ao atualizar produto: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja remover este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      alert('✅ Produto removido com sucesso!');
      loadSellerData();
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      alert('❌ Erro ao remover produto!');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('perfis')
        .update({
          store_name: profileForm.store_name,
          store_description: profileForm.store_description,
          phone: profileForm.phone,
          address: profileForm.address
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('✅ Perfil atualizado com sucesso!');
      loadSellerData();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('❌ Erro ao atualizar perfil!');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">✅ Aprovado</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">⏳ Pendente</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">❌ Rejeitado</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-black mb-2">🏪 Dashboard do Vendedor</h2>
        <p className="text-amber-100">Gerencie seus produtos no marketplace</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 font-bold transition-all ${
            activeTab === 'products'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-600 hover:text-amber-600'
          }`}
        >
          📦 Meus Produtos
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-6 py-3 font-bold transition-all ${
            activeTab === 'add'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-600 hover:text-amber-600'
          }`}
        >
          ➕ Adicionar Produto
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-bold transition-all ${
            activeTab === 'profile'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-600 hover:text-amber-600'
          }`}
        >
          👤 Perfil da Loja
        </button>
        {/* 🔥 NOVO: Aba de Avaliações */}
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 font-bold transition-all ${
            activeTab === 'reviews'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-600 hover:text-amber-600'
          }`}
        >
          ⭐ Avaliações ({reviews.length})
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <i className="ri-shopping-bag-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-600 font-medium">Você ainda não tem produtos no marketplace</p>
              <button
                onClick={() => setActiveTab('add')}
                className="mt-4 px-6 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors"
              >
                Adicionar Primeiro Produto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <div className="relative h-48 bg-gray-100">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-contain p-4"
                    />
                    {/* Badge de Status - Verificar se a coluna existe */}
                    {product.approval_status && (
                      <div className="absolute top-3 right-3">
                        {product.approval_status === 'approved' && (
                          <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                            ✅ APROVADO
                          </span>
                        )}
                        {product.approval_status === 'pending' && (
                          <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                            ⏳ PENDENTE
                          </span>
                        )}
                        {product.approval_status === 'rejected' && (
                          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                            ❌ REJEITADO
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">{product.name}</h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-amber-600">
                        €{parseFloat(product.price).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Estoque: <span className="font-semibold text-gray-700">{product.stock}</span>
                      </span>
                    </div>

                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        {product.category}
                      </span>
                    </div>

                    {/* Mostrar motivo da rejeição se existir */}
                    {product.approval_status === 'rejected' && product.rejection_reason && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-700">
                          <strong>Motivo da rejeição:</strong><br />
                          {product.rejection_reason}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold text-sm whitespace-nowrap"
                      >
                        <i className="ri-edit-line mr-2"></i>
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold text-sm whitespace-nowrap"
                      >
                        <i className="ri-delete-bin-line mr-2"></i>
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'add' && (
        <form onSubmit={handleAddProduct} className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-4">
          <h3 className="text-xl font-black mb-4">➕ Adicionar Novo Produto</h3>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Produto *</label>
            <input
              type="text"
              required
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
              placeholder="Ex: NVIDIA RTX 4090"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Preço (€) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                placeholder="999.99"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Estoque *</label>
              <input
                type="number"
                required
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                placeholder="10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Categoria *</label>
            <select
              required
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
            >
              <option value="GPU">GPU</option>
              <option value="CPU">CPU</option>
              <option value="RAM">RAM</option>
              <option value="SSD">SSD</option>
              <option value="Placa Mãe">Placa Mãe</option>
              <option value="Fonte">Fonte</option>
              <option value="Torre">Torre</option>
              <option value="PC Completo">PC Completo</option>
              <option value="PC Portátil">PC Portátil</option>
              <option value="Monitor">Monitor</option>
              <option value="Periféricos">Periféricos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">URL da Imagem *</label>
            <input
              type="url"
              required
              value={newProduct.image_url}
              onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Descrição *</label>
            <textarea
              required
              rows={4}
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
              placeholder="Descreva seu produto..."
            />
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Importante:</strong> Seu produto será enviado para aprovação do administrador antes de aparecer no marketplace.
            </p>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105"
          >
            ➕ ADICIONAR PRODUTO
          </button>
        </form>
      )}

      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-4">
          <h3 className="text-xl font-black mb-4">👤 Perfil da Loja</h3>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Loja *</label>
            <input
              type="text"
              required
              value={profileForm.store_name}
              onChange={(e) => setProfileForm({ ...profileForm, store_name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
              placeholder="Ex: TechStore Premium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Descrição da Loja</label>
            <textarea
              rows={4}
              value={profileForm.store_description}
              onChange={(e) => setProfileForm({ ...profileForm, store_description: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
              placeholder="Conte sobre sua loja..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Telefone</label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
              placeholder="+351 912 345 678"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Endereço</label>
            <input
              type="text"
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
              placeholder="Rua, Cidade, País"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105"
          >
            💾 SALVAR ALTERAÇÕES
          </button>
        </form>
      )}

      {/* 🔥 NOVO: Aba de Avaliações */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviewsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Carregando avaliações...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <i className="ri-star-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-600 font-medium">Ainda não há avaliações dos seus produtos</p>
              <p className="text-sm text-gray-500 mt-2">
                As avaliações aparecerão aqui quando os clientes avaliarem seus produtos
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Resumo de Avaliações */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border-2 border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Resumo de Avaliações</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`ri-star-fill text-2xl ${
                              star <= Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
                                ? 'text-amber-500'
                                : 'text-gray-300'
                            }`}
                          ></i>
                        ))}
                      </div>
                      <span className="text-3xl font-bold text-gray-900">
                        {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                      </span>
                      <span className="text-gray-600">({reviews.length} avaliações)</span>
                    </div>
                  </div>
                  <i className="ri-star-smile-line text-6xl text-amber-500"></i>
                </div>
              </div>

              {/* Lista de Avaliações */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      {/* Imagem do Produto */}
                      <img
                        src={review.products?.image_url || 'https://via.placeholder.com/100'}
                        alt={review.products?.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        {/* Produto */}
                        <h4 className="font-bold text-gray-900 mb-1">{review.products?.name}</h4>
                        
                        {/* Estrelas */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i
                                key={star}
                                className={`ri-star-fill ${
                                  star <= review.rating ? 'text-amber-500' : 'text-gray-300'
                                }`}
                              ></i>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {new Date(review.created_at).toLocaleDateString('pt-PT')}
                          </span>
                        </div>
                        
                        {/* Comentário */}
                        {review.comment && (
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                        )}
                        
                        {/* Cliente */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <i className="ri-user-line"></i>
                          <span>{review.user_name || 'Cliente Anônimo'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Edição */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">✏️ Editar Produto</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preço (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Estoque *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Categoria *</label>
                <select
                  required
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                >
                  <option value="GPU">GPU</option>
                  <option value="CPU">CPU</option>
                  <option value="RAM">RAM</option>
                  <option value="SSD">SSD</option>
                  <option value="Placa Mãe">Placa Mãe</option>
                  <option value="Fonte">Fonte</option>
                  <option value="Torre">Torre</option>
                  <option value="PC Completo">PC Completo</option>
                  <option value="PC Portátil">PC Portátil</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Periféricos">Periféricos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL da Imagem *</label>
                <input
                  type="url"
                  required
                  value={editingProduct.image_url}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descrição *</label>
                <textarea
                  required
                  rows={4}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Importante:</strong> Após editar, o produto precisará de nova aprovação do administrador.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all"
                >
                  💾 SALVAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
