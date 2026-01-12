import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  description: string;
  seller_id: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  perfis?: {
    nome?: string;
    store_name?: string;
    email?: string;
    phone?: string;
  };
}

interface Seller {
  id: string;
  nome: string;
  email: string;
  store_name: string;
  store_description: string;
  phone: string;
  address: string;
  is_seller: boolean;
  created_at: string;
}

export default function MarketplaceTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'sellers'>('products');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar produtos do marketplace
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          perfis:seller_id (
            nome,
            store_name,
            email,
            phone
          )
        `)
        .eq('is_marketplace', true)
        .order('created_at', { ascending: false });

      if (productsData) setProducts(productsData);

      // Carregar vendedores
      const { data: sellersData } = await supabase
        .from('perfis')
        .select('*')
        .eq('is_seller', true)
        .order('created_at', { ascending: false });

      if (sellersData) setSellers(sellersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ approval_status: 'approved' })
        .eq('id', productId);

      if (error) throw error;

      alert('✅ Produto aprovado com sucesso!');
      loadData();
      setSelectedProduct(null);
    } catch (error) {
      console.error('Erro ao aprovar produto:', error);
      alert('❌ Erro ao aprovar produto!');
    }
  };

  const handleRejectProduct = async (productId: string) => {
    if (!rejectionReason.trim()) {
      alert('Por favor, informe o motivo da rejeição.');
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          approval_status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', productId);

      if (error) throw error;

      alert('❌ Produto rejeitado!');
      setRejectionReason('');
      loadData();
      setSelectedProduct(null);
    } catch (error) {
      console.error('Erro ao rejeitar produto:', error);
      alert('❌ Erro ao rejeitar produto!');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja remover este produto permanentemente?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      alert('✅ Produto removido com sucesso!');
      loadData();
      setSelectedProduct(null);
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      alert('❌ Erro ao remover produto!');
    }
  };

  const handleSuspendSeller = async (sellerId: string) => {
    if (!confirm('Tem certeza que deseja suspender este vendedor?')) return;

    try {
      const { error } = await supabase
        .from('perfis')
        .update({ is_seller: false })
        .eq('id', sellerId);

      if (error) throw error;

      alert('⚠️ Vendedor suspenso!');
      loadData();
      setSelectedSeller(null);
    } catch (error) {
      console.error('Erro ao suspender vendedor:', error);
      alert('❌ Erro ao suspender vendedor!');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">✅ Aprovado</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">⏳ Pendente</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">❌ Rejeitado</span>;
      default:
        return null;
    }
  };

  const filteredProducts = products.filter(p => 
    filterStatus === 'all' || p.approval_status === filterStatus
  );

  const pendingCount = products.filter(p => p.approval_status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Alertas */}
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <i className="ri-alert-line text-2xl text-yellow-600"></i>
            <div>
              <p className="font-bold text-yellow-800">
                ⚠️ {pendingCount} produto{pendingCount > 1 ? 's' : ''} aguardando aprovação
              </p>
              <p className="text-sm text-yellow-700">
                Revise e aprove os produtos enviados pelos vendedores
              </p>
            </div>
          </div>
        </div>
      )}

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
          📦 Produtos ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-6 py-3 font-bold transition-all ${
            activeTab === 'sellers'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-600 hover:text-amber-600'
          }`}
        >
          👥 Vendedores ({sellers.length})
        </button>
      </div>

      {/* Conteúdo - Produtos */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                filterStatus === 'all'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                filterStatus === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes ({products.filter(p => p.approval_status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                filterStatus === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aprovados ({products.filter(p => p.approval_status === 'approved').length})
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                filterStatus === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejeitados ({products.filter(p => p.approval_status === 'rejected').length})
            </button>
          </div>

          {/* Lista de Produtos */}
          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-amber-500 transition-all">
                <div className="flex gap-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Vendedor: {product.perfis?.store_name || product.perfis?.nome || 'N/A'}
                        </p>
                      </div>
                      {getStatusBadge(product.approval_status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold text-amber-600">€{product.price.toFixed(2)}</span>
                      <span className="text-gray-600">Estoque: {product.stock}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                    >
                      👁️ Ver Detalhes
                    </button>
                    {product.approval_status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveProduct(product.id)}
                          className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
                        >
                          ✅ Aprovar
                        </button>
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap"
                        >
                          ❌ Rejeitar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="px-4 py-2 bg-gray-500 text-white text-sm font-bold rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
                    >
                      🗑️ Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo - Vendedores */}
      {activeTab === 'sellers' && (
        <div className="grid gap-4">
          {sellers.map((seller) => (
            <div key={seller.id} className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-amber-500 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">{seller.store_name || seller.nome}</h3>
                  <p className="text-sm text-gray-600 mb-4">{seller.store_description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Email:</p>
                      <p className="font-medium">{seller.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Telefone:</p>
                      <p className="font-medium">{seller.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Endereço:</p>
                      <p className="font-medium">{seller.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Produtos:</p>
                      <p className="font-medium">
                        {products.filter(p => p.seller_id === seller.id).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => setSelectedSeller(seller)}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                  >
                    👁️ Ver Perfil
                  </button>
                  <button
                    onClick={() => handleSuspendSeller(seller.id)}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap"
                  >
                    🚫 Suspender
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes do Produto */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">📦 Detalhes do Produto</h3>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setRejectionReason('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-lg"
              />

              <div>
                <h4 className="font-bold text-lg mb-2">{selectedProduct.name}</h4>
                {getStatusBadge(selectedProduct.approval_status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Categoria:</p>
                  <p className="font-medium">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-gray-500">Preço:</p>
                  <p className="font-medium text-amber-600">€{selectedProduct.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estoque:</p>
                  <p className="font-medium">{selectedProduct.stock}</p>
                </div>
                <div>
                  <p className="text-gray-500">Vendedor:</p>
                  <p className="font-medium">{selectedProduct.perfis?.store_name || selectedProduct.perfis?.nome || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-sm mb-2">Descrição:</p>
                <p className="text-sm">{selectedProduct.description}</p>
              </div>

              {selectedProduct.approval_status === 'pending' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Motivo da Rejeição (opcional)
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
                      placeholder="Explique o motivo da rejeição..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveProduct(selectedProduct.id)}
                      className="flex-1 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
                    >
                      ✅ APROVAR
                    </button>
                    <button
                      onClick={() => handleRejectProduct(selectedProduct.id)}
                      className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                    >
                      ❌ REJEITAR
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleDeleteProduct(selectedProduct.id)}
                className="w-full px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
              >
                🗑️ REMOVER PRODUTO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Perfil do Vendedor */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">👤 Perfil do Vendedor</h3>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-xl mb-2">{selectedSeller.store_name || selectedSeller.nome}</h4>
                <p className="text-sm text-gray-600">{selectedSeller.store_description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Email:</p>
                  <p className="font-medium">{selectedSeller.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Telefone:</p>
                  <p className="font-medium">{selectedSeller.phone || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Endereço:</p>
                  <p className="font-medium">{selectedSeller.address || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-sm mb-2">Produtos do Vendedor:</p>
                <div className="space-y-2">
                  {products
                    .filter(p => p.seller_id === selectedSeller.id)
                    .map(product => (
                      <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-600">€{product.price.toFixed(2)}</p>
                        </div>
                        {getStatusBadge(product.approval_status)}
                      </div>
                    ))}
                </div>
              </div>

              <button
                onClick={() => handleSuspendSeller(selectedSeller.id)}
                className="w-full px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
              >
                🚫 SUSPENDER VENDEDOR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
