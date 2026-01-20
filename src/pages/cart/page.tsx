import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export default function CartPage() {
  const { items, loading, removeFromCart, updateQuantity, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Selecionar todos os itens por padrão
  useEffect(() => {
    if (items.length > 0) {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  }, [items]);

  // Toggle seleção individual
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Selecionar/Desselecionar todos
  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  // Remover itens selecionados
  const removeSelected = async () => {
    setIsProcessing(true);
    try {
      for (const id of selectedItems) {
        await removeFromCart(id);
      }
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Erro ao remover itens:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calcular total dos itens selecionados
  const selectedTotal = items
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const selectedCount = selectedItems.size;
  const allSelected = selectedItems.size === items.length && items.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <i className="ri-loader-4-line text-5xl text-[#b62bff] animate-spin"></i>
          <p className="text-gray-600 dark:text-gray-400">A carregar carrinho...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#b62bff] to-[#ff6a00] rounded-full flex items-center justify-center">
            <i className="ri-lock-line text-6xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold mb-4">Faça Login</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Você precisa estar logado para ver seu carrinho
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all"
          >
            <i className="ri-login-box-line text-xl"></i>
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#b62bff] to-[#ff6a00] rounded-full flex items-center justify-center">
            <i className="ri-shopping-cart-line text-6xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold mb-4">Carrinho Vazio</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Seu carrinho está vazio. Adicione produtos para começar suas compras!
          </p>
          <Link
            to="/category"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all"
          >
            <i className="ri-shopping-bag-line text-xl"></i>
            Explorar Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <i className="ri-shopping-cart-fill text-[#b62bff]"></i>
                Meu Carrinho
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {items.length} {items.length === 1 ? 'produto' : 'produtos'} no carrinho
              </p>
            </div>
            <Link
              to="/category"
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
            >
              <i className="ri-arrow-left-line"></i>
              Continuar Comprando
            </Link>
          </div>

          {/* Barra de Ações */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            {/* Selecionar Todos */}
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                allSelected 
                  ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] border-transparent' 
                  : 'border-gray-400 dark:border-gray-600'
              }`}>
                {allSelected && <i className="ri-check-line text-white text-sm"></i>}
              </div>
              <span className="font-medium">
                {allSelected ? 'Desselecionar Todos' : 'Selecionar Todos'}
              </span>
            </button>

            {/* Contador de Selecionados */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#b62bff]/10 to-[#ff6a00]/10 rounded-lg">
                <i className="ri-checkbox-multiple-line text-[#b62bff]"></i>
                <span className="font-semibold">
                  {selectedCount} selecionado{selectedCount === 1 ? '' : 's'}
                </span>
              </div>
            )}

            {/* Botão Remover Selecionados */}
            {selectedCount > 0 && (
              <button
                onClick={removeSelected}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                {isProcessing ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Removendo...
                  </>
                ) : (
                  <>
                    <i className="ri-delete-bin-line"></i>
                    Remover Selecionados
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const isSelected = selectedItems.has(item.id);
              const imageUrl = Array.isArray(item.product.images) && item.product.images.length > 0 
                ? item.product.images[0] 
                : 'https://readdy.ai/api/search-image?query=modern%20elegant%20product%20photography%20simple%20white%20background%20professional%20ecommerce%20style%20minimalist%20clean%20aesthetic&width=400&height=400&seq=cart-default&orientation=squarish';
              
              const discount = item.product.compare_at_price 
                ? Math.round(((item.product.compare_at_price - item.product.price) / item.product.compare_at_price) * 100)
                : 0;

              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-gray-900 rounded-xl overflow-hidden border-2 transition-all ${
                    isSelected 
                      ? 'border-[#b62bff] shadow-2xl shadow-[#b62bff]/20' 
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex gap-6">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelect(item.id)}
                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:scale-110 transition-all"
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] border-transparent' 
                            : 'border-gray-400 dark:border-gray-600'
                        }`}>
                          {isSelected && <i className="ri-check-line text-white text-sm"></i>}
                        </div>
                      </button>

                      {/* Imagem */}
                      <Link to={`/produto/${item.product.slug}`} className="flex-shrink-0">
                        <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </Link>

                      {/* Informações */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/produto/${item.product.slug}`}>
                          <h3 className="text-lg font-bold line-clamp-2 hover:text-transparent hover:bg-gradient-to-r hover:from-[#b62bff] hover:to-[#ff6a00] hover:bg-clip-text transition-all">
                            {item.product.name}
                          </h3>
                        </Link>

                        {/* Preços */}
                        <div className="mt-3 space-y-1">
                          {discount > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                €{item.product.compare_at_price?.toFixed(2)}
                              </span>
                              <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                -{discount}%
                              </span>
                            </div>
                          )}
                          <div className="text-2xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
                            €{item.product.price.toFixed(2)}
                          </div>
                        </div>

                        {/* Estoque */}
                        {item.product.stock < 10 && item.product.stock > 0 && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-orange-500">
                            <i className="ri-error-warning-line"></i>
                            Últimas {item.product.stock} unidades
                          </div>
                        )}

                        {/* Controles */}
                        <div className="mt-4 flex items-center gap-4">
                          {/* Quantidade */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <i className="ri-subtract-line"></i>
                            </button>
                            <span className="w-12 text-center font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <i className="ri-add-line"></i>
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="ml-auto text-right">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Subtotal</div>
                            <div className="text-xl font-bold">
                              €{(item.product.price * item.quantity).toFixed(2)}
                            </div>
                          </div>

                          {/* Remover */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                            title="Remover do Carrinho"
                          >
                            <i className="ri-delete-bin-line text-xl"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Card Resumo */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-[#b62bff] to-[#ff6a00]">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <i className="ri-file-list-3-line"></i>
                    Resumo do Pedido
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  {/* Itens Selecionados */}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Itens selecionados:</span>
                    <span className="font-semibold">{selectedCount}</span>
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal:</span>
                    <span className="font-semibold">€{selectedTotal.toFixed(2)}</span>
                  </div>

                  {/* Envio */}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Envio:</span>
                    <span className="font-semibold text-green-500">Grátis</span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Total:</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
                        €{selectedTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Botão Finalizar */}
                  <button
                    onClick={() => navigate('/checkout')}
                    disabled={selectedCount === 0}
                    className="w-full py-4 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <i className="ri-secure-payment-line text-2xl"></i>
                    Finalizar Compra
                  </button>

                  {/* Métodos de Pagamento */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                      Métodos de Pagamento Aceites
                    </p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <div className="w-12 h-8 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                        <i className="ri-visa-line text-2xl text-blue-600"></i>
                      </div>
                      <div className="w-12 h-8 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                        <i className="ri-mastercard-line text-2xl text-red-600"></i>
                      </div>
                      <div className="w-12 h-8 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                        <i className="ri-paypal-line text-2xl text-blue-500"></i>
                      </div>
                      <div className="w-12 h-8 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                        <i className="ri-google-line text-2xl"></i>
                      </div>
                      <div className="w-12 h-8 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                        <i className="ri-apple-line text-2xl"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Garantias de Segurança */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <i className="ri-shield-check-line text-green-500"></i>
                  Compra 100% Segura
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <i className="ri-lock-line text-green-500"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Pagamento Seguro</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Encriptação SSL 256-bit</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <i className="ri-shield-check-line text-blue-500"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Proteção ao Comprador</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Garantia de reembolso</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <i className="ri-customer-service-2-line text-purple-500"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Suporte 24/7</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Estamos sempre disponíveis</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <i className="ri-truck-line text-orange-500"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Envio Grátis</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Em todas as encomendas</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cupom de Desconto */}
              <div className="bg-gradient-to-r from-[#b62bff]/10 to-[#ff6a00]/10 rounded-xl border border-[#b62bff]/20 p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <i className="ri-coupon-line text-[#b62bff]"></i>
                  Tem um cupom?
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código do cupom"
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b62bff]"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all whitespace-nowrap">
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
