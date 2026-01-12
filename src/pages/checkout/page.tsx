import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { Product, supabase } from '../../lib/supabase';

interface CartItem extends Product {
  quantity: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Luxembourg',
  });

  useEffect(() => {
    const checkAuthAndLoadCart = async () => {
      try {
        // 🔥 CARREGAR CARRINHO PRIMEIRO
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        console.log('🛒 Carrinho carregado:', cart);
        
        if (!Array.isArray(cart) || cart.length === 0) {
          console.log('❌ Carrinho vazio - Redirecionando...');
          navigate('/carrinho');
          return;
        }
        
        setCartItems(cart);

        // 🔥 VERIFICAR AUTENTICAÇÃO DO SUPABASE
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('❌ Usuário não autenticado - Redirecionando para login');
          localStorage.setItem('redirectAfterLogin', '/checkout');
          navigate('/login');
          return;
        }

        console.log('✅ Usuário autenticado:', session.user.email);

        // Preencher dados do usuário automaticamente
        if (session.user.email) {
          setFormData(prev => ({
            ...prev,
            email: session.user.email || ''
          }));
        }

        // Restaurar dados do formulário se existirem
        const savedFormData = localStorage.getItem('checkoutFormData');
        if (savedFormData) {
          try {
            const parsed = JSON.parse(savedFormData);
            setFormData(prev => ({
              ...prev,
              ...parsed,
              email: session.user.email || parsed.email
            }));
          } catch (e) {
            console.error('Erro ao restaurar dados do formulário:', e);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        localStorage.setItem('redirectAfterLogin', '/checkout');
        navigate('/login');
      }
    };

    checkAuthAndLoadCart();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    setFormData(newFormData);
    
    // Salvar dados do formulário automaticamente
    localStorage.setItem('checkoutFormData', JSON.stringify(newFormData));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🚀 Iniciando processo de pagamento...');
      
      // Validar dados do formulário
      if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
        throw new Error('Por favor, preencha todos os campos obrigatórios.');
      }

      // Validar carrinho novamente
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.');
      }

      console.log('✅ Validação concluída');
      console.log('📦 Itens no carrinho:', cartItems.length);

      // Preparar dados para o Stripe
      const paymentData = {
        items: cartItems.map((item) => ({
          name: item.name,
          description: item.description || '',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: item.image_url,
        })),
        customerInfo: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
        },
        successUrl: `${window.location.origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/cancelado`,
      };

      console.log('💳 Criando sessão de pagamento Stripe...');
      console.log('📊 Total do pedido: €' + total.toFixed(2));

      // Criar sessão de pagamento Stripe
      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuração do servidor não encontrada. Entre em contato com o suporte.');
      }

      console.log('📡 Enviando requisição para:', `${supabaseUrl}/functions/v1/create-stripe-checkout`);

      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify(paymentData),
        }
      );

      console.log('📡 Resposta do servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        
        let errorMessage = 'Erro ao processar pagamento. Tente novamente.';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Erro no servidor (${response.status}). Entre em contato com o suporte via WhatsApp: +352 621 377 168`;
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('📥 Dados recebidos:', responseData);

      const { url } = responseData;

      if (!url) {
        console.error('❌ URL de pagamento não retornada');
        console.error('📥 Resposta completa:', JSON.stringify(responseData, null, 2));
        throw new Error('URL de pagamento não foi retornada. Entre em contato com o suporte via WhatsApp: +352 621 377 168');
      }

      console.log('✅ URL de pagamento recebida:', url);

      // Salvar informações do pedido no localStorage
      localStorage.setItem('pendingOrder', JSON.stringify({
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
        total_amount: total,
        items: cartItems,
        created_at: new Date().toISOString(),
      }));

      console.log('💾 Pedido salvo localmente');
      console.log('🔄 Redirecionando para Stripe...');
      
      // Redirecionar para Stripe
      window.location.href = url;
      
    } catch (error: any) {
      console.error('💥 Erro ao processar pagamento:', error);
      setError(error.message || 'Erro ao processar pagamento. Por favor, tente novamente ou entre em contato conosco via WhatsApp: +352 621 377 168');
      setLoading(false);
    }
  };

  const handleCancelCheckout = () => {
    navigate('/carrinho');
  };

  // Se não tem itens, mostrar loading
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Carregando carrinho...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900">
              FINALIZAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">COMPRA</span>
            </h1>
            
            <button
              onClick={handleCancelCheckout}
              className="px-6 py-3 bg-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-300 transition-colors cursor-pointer whitespace-nowrap flex items-center space-x-2 shadow-lg"
            >
              <i className="ri-arrow-left-line"></i>
              <span>VOLTAR AO CARRINHO</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-6 bg-red-50 border-2 border-red-500 text-red-900 rounded-xl shadow-lg">
              <div className="flex items-start space-x-3">
                <i className="ri-error-warning-line text-2xl flex-shrink-0 mt-0.5"></i>
                <div className="flex-1">
                  <p className="font-black mb-2 text-lg">❌ Erro ao processar pagamento</p>
                  <p className="text-sm leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shipping Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-200">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <i className="ri-map-pin-line text-amber-500"></i>
                    INFORMAÇÕES DE ENTREGA
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        NOME COMPLETO *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 disabled:opacity-50 disabled:bg-gray-100 transition-all"
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          E-MAIL *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 disabled:opacity-50 disabled:bg-gray-100 transition-all"
                          placeholder="seu@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          TELEFONE *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 disabled:opacity-50 disabled:bg-gray-100 transition-all"
                          placeholder="+352 XXX XXX XXX"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        ENDEREÇO *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 disabled:opacity-50 disabled:bg-gray-100 transition-all"
                        placeholder="Rua, número, apartamento"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          CIDADE *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 disabled:opacity-50 disabled:bg-gray-100 transition-all"
                          placeholder="Cidade"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          CÓDIGO POSTAL *
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 disabled:opacity-50 disabled:bg-gray-100 transition-all"
                          placeholder="L-XXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          PAÍS *
                        </label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 disabled:opacity-50 disabled:bg-gray-100 transition-all cursor-pointer"
                        >
                          <option value="Luxembourg">Luxembourg</option>
                          <option value="France">France</option>
                          <option value="Belgium">Belgium</option>
                          <option value="Netherlands">Netherlands</option>
                          <option value="Germany">Germany</option>
                          <option value="Italy">Italy</option>
                          <option value="Spain">Spain</option>
                          <option value="Portugal">Portugal</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 sticky top-24 shadow-xl border-2 border-gray-200">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <i className="ri-shopping-bag-3-line text-amber-500"></i>
                    RESUMO DO PEDIDO
                  </h2>

                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-200">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600">Qtd: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-black text-gray-900">
                          €{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 mb-6 border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-bold">€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Envio</span>
                      <span className="font-bold">
                        {shipping === 0 ? (
                          <span className="text-green-600">GRÁTIS</span>
                        ) : (
                          `€${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    {subtotal < 100 && (
                      <p className="text-xs text-amber-600 font-medium">
                        💡 Faltam €{(100 - subtotal).toFixed(2)} para envio grátis!
                      </p>
                    )}
                    <div className="border-t-2 border-gray-200 pt-3 flex justify-between text-xl font-black text-gray-900">
                      <span>TOTAL</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">
                        €{total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-4 whitespace-nowrap flex items-center justify-center space-x-2 shadow-lg hover:shadow-amber-500/50 hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>PROCESSANDO...</span>
                      </>
                    ) : (
                      <>
                        <i className="ri-secure-payment-line text-xl"></i>
                        <span>PAGAR COM STRIPE</span>
                      </>
                    )}
                  </button>

                  <div className="text-center space-y-3">
                    <p className="text-sm font-black text-gray-900 mb-2">🔒 PAGAMENTO 100% SEGURO</p>
                    <div className="flex items-center justify-center space-x-3 mb-3">
                      <i className="ri-visa-line text-3xl text-gray-700"></i>
                      <i className="ri-mastercard-line text-3xl text-gray-700"></i>
                      <div className="w-10 h-10 flex items-center justify-center bg-black rounded">
                        <i className="ri-apple-fill text-xl text-white"></i>
                      </div>
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded text-xs font-bold text-gray-700">
                        G Pay
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-black to-gray-900 rounded-xl p-3 mb-3">
                      <div className="flex items-center justify-center space-x-2">
                        <i className="ri-shield-check-line text-amber-400 text-xl"></i>
                        <span className="text-white font-black text-sm">STRIPE</span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">Pagamento Seguro</p>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      🔒 Seus dados estão protegidos com criptografia SSL
                    </p>
                    <p className="text-xs text-gray-600">
                      💳 Visa • Mastercard • Apple Pay • Google Pay
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
