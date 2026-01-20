import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';

interface CheckoutStep {
  id: number;
  title: string;
  icon: string;
  completed: boolean;
}

interface ShippingData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  notes: string;
}

interface PaymentData {
  method: 'card' | 'paypal' | 'google_pay' | 'apple_pay';
  card_number: string;
  card_name: string;
  card_expiry: string;
  card_cvv: string;
  save_card: boolean;
}

interface ShippingOption {
  id: string;
  name: string;
  country: string;
  country_code: string;
  method: string;
  base_cost: number;
  cost_per_kg: number;
  free_shipping_threshold: number | null;
  min_delivery_days: number;
  max_delivery_days: number;
  weight_based: boolean;
}

// Países da Europa com códigos
const EUROPEAN_COUNTRIES = [
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: 'UK', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'NL', name: 'Holanda', flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'AT', name: 'Áustria', flag: '🇦🇹' },
  { code: 'CH', name: 'Suíça', flag: '🇨🇭' },
  { code: 'IE', name: 'Irlanda', flag: '🇮🇪' },
  { code: 'DK', name: 'Dinamarca', flag: '🇩🇰' },
  { code: 'SE', name: 'Suécia', flag: '🇸🇪' },
  { code: 'NO', name: 'Noruega', flag: '🇳🇴' },
  { code: 'FI', name: 'Finlândia', flag: '🇫🇮' },
  { code: 'PL', name: 'Polónia', flag: '🇵🇱' },
  { code: 'CZ', name: 'República Checa', flag: '🇨🇿' },
  { code: 'GR', name: 'Grécia', flag: '🇬🇷' },
  { code: 'HU', name: 'Hungria', flag: '🇭🇺' },
  { code: 'RO', name: 'Roménia', flag: '🇷🇴' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [availableShipping, setAvailableShipping] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [shippingCost, setShippingCost] = useState(0);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'PT',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
  });

  // Calcular peso total do carrinho
  const calculateTotalWeight = () => {
    return items.reduce((total, item) => {
      const weight = item.weight || 0.5; // Peso padrão se não definido
      return total + (weight * item.quantity);
    }, 0);
  };

  // Carregar opções de envio quando país mudar
  useEffect(() => {
    if (formData.country) {
      loadShippingOptions();
    }
  }, [formData.country]);

  // Calcular custo de envio quando opção mudar
  useEffect(() => {
    if (selectedShipping) {
      calculateShippingCost();
    }
  }, [selectedShipping, items]);

  const loadShippingOptions = async () => {
    try {
      setLoadingShipping(true);
      const { data, error } = await supabase
        .from('shipping_rules')
        .select('*')
        .eq('country_code', formData.country)
        .eq('active', true)
        .order('priority', { ascending: true });

      if (error) throw error;

      setAvailableShipping(data || []);
      
      // Auto-selecionar primeira opção
      if (data && data.length > 0) {
        setSelectedShipping(data[0].id);
      } else {
        setSelectedShipping('');
        setShippingCost(0);
      }
    } catch (error) {
      console.error('Erro ao carregar opções de envio:', error);
      setAvailableShipping([]);
      setSelectedShipping('');
      setShippingCost(0);
    } finally {
      setLoadingShipping(false);
    }
  };

  const calculateShippingCost = () => {
    const option = availableShipping.find(s => s.id === selectedShipping);
    if (!option) {
      setShippingCost(0);
      return;
    }

    // Verificar envio grátis
    if (option.free_shipping_threshold && cartTotal >= option.free_shipping_threshold) {
      setShippingCost(0);
      return;
    }

    // Calcular custo baseado em peso
    let cost = option.base_cost;
    if (option.weight_based) {
      const totalWeight = calculateTotalWeight();
      cost += totalWeight * option.cost_per_kg;
    }

    setShippingCost(cost);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('⚠️ Seu carrinho está vazio!');
      return;
    }

    if (!selectedShipping) {
      alert('⚠️ Por favor, selecione uma opção de envio!');
      return;
    }

    setLoading(true);

    try {
      // Criar pedido
      const { data: userData } = await supabase.auth.getUser();
      
      const orderData = {
        user_id: userData.user?.id || null,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_postal_code: formData.postalCode,
        shipping_country: formData.country,
        payment_method: formData.paymentMethod,
        subtotal: cartTotal,
        shipping_cost: shippingCost,
        total: cartTotal + shippingCost,
        status: 'pending',
        shipping_method: availableShipping.find(s => s.id === selectedShipping)?.name || 'Standard',
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar items do pedido
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Limpar carrinho
      clearCart();

      alert('✅ Pedido realizado com sucesso!');
      navigate('/profile');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('❌ Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const selectedShippingOption = availableShipping.find(s => s.id === selectedShipping);
  const totalWeight = calculateTotalWeight();
  const finalTotal = cartTotal + shippingCost;
  const isFreeShipping = selectedShippingOption?.free_shipping_threshold && 
                        cartTotal >= selectedShippingOption.free_shipping_threshold;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <i className="ri-shopping-cart-line text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Carrinho Vazio
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Adicione produtos ao carrinho para continuar
            </p>
            <button
              onClick={() => navigate('/category')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              Ver Produtos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Finalizar Compra
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Pessoais */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <i className="ri-user-line text-purple-600"></i>
                Informações Pessoais
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Endereço de Entrega */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <i className="ri-map-pin-line text-purple-600"></i>
                Endereço de Entrega
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Morada Completa *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Rua, número, andar, apartamento..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    placeholder="1000-100"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    País *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    {EUROPEAN_COUNTRIES.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Método de Envio */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <i className="ri-truck-line text-purple-600"></i>
                Método de Envio
              </h2>

              {loadingShipping ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Carregando opções de envio...
                  </span>
                </div>
              ) : availableShipping.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-error-warning-line text-5xl text-yellow-500 mb-3"></i>
                  <p className="text-gray-600 dark:text-gray-400">
                    Nenhuma opção de envio disponível para {EUROPEAN_COUNTRIES.find(c => c.code === formData.country)?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Entre em contacto connosco para verificar disponibilidade
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Info do Peso */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ri-scales-3-line text-blue-600 dark:text-blue-400"></i>
                      <span className="text-gray-700 dark:text-gray-300">
                        Peso total do carrinho: <strong>{totalWeight.toFixed(2)} kg</strong>
                      </span>
                    </div>
                  </div>

                  {availableShipping.map((option) => {
                    const baseCost = option.base_cost;
                    const weightCost = option.weight_based ? totalWeight * option.cost_per_kg : 0;
                    const totalCost = baseCost + weightCost;
                    const isFree = option.free_shipping_threshold && cartTotal >= option.free_shipping_threshold;
                    const finalCost = isFree ? 0 : totalCost;

                    return (
                      <label
                        key={option.id}
                        className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          selectedShipping === option.id
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value={option.id}
                            checked={selectedShipping === option.id}
                            onChange={(e) => setSelectedShipping(e.target.value)}
                            className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-gray-900 dark:text-white">
                                {option.name}
                              </h3>
                              {isFree ? (
                                <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold rounded-full">
                                  🎁 GRÁTIS
                                </span>
                              ) : (
                                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                  €{finalCost.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <i className="ri-time-line"></i>
                                {option.min_delivery_days}-{option.max_delivery_days} dias úteis
                              </span>
                              {option.weight_based && (
                                <span className="flex items-center gap-1">
                                  <i className="ri-scales-3-line"></i>
                                  €{option.cost_per_kg.toFixed(2)}/kg
                                </span>
                              )}
                            </div>
                            {option.free_shipping_threshold && !isFree && (
                              <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                                <i className="ri-information-line"></i> Envio grátis em compras acima de €{option.free_shipping_threshold.toFixed(2)}
                                (faltam €{(option.free_shipping_threshold - cartTotal).toFixed(2)})
                              </div>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Método de Pagamento */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <i className="ri-bank-card-line text-purple-600"></i>
                Método de Pagamento
              </h2>

              <div className="space-y-3">
                <label className="block p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <i className="ri-bank-card-line text-2xl text-gray-600 dark:text-gray-400"></i>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Cartão de Crédito/Débito
                    </span>
                  </div>
                </label>

                <label className="block p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mbway"
                      checked={formData.paymentMethod === 'mbway'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <i className="ri-smartphone-line text-2xl text-gray-600 dark:text-gray-400"></i>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      MB WAY
                    </span>
                  </div>
                </label>

                <label className="block p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transfer"
                      checked={formData.paymentMethod === 'transfer'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <i className="ri-exchange-line text-2xl text-gray-600 dark:text-gray-400"></i>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Transferência Bancária
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Resumo do Pedido
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Qtd: {item.quantity}
                      </p>
                      <p className="font-semibold text-purple-600 dark:text-purple-400">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-semibold">€{cartTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <i className="ri-truck-line"></i>
                    Envio
                  </span>
                  {isFreeShipping ? (
                    <span className="font-bold text-yellow-600 dark:text-yellow-400">
                      GRÁTIS 🎁
                    </span>
                  ) : shippingCost > 0 ? (
                    <span className="font-semibold">€{shippingCost.toFixed(2)}</span>
                  ) : (
                    <span className="text-sm">Selecione</span>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-purple-600 dark:text-purple-400">
                    €{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedShipping || loadingShipping}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <i className="ri-shopping-bag-line text-xl"></i>
                    Finalizar Compra
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                <i className="ri-shield-check-line"></i> Pagamento seguro e protegido
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
