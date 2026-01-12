import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

export default function Cancelado() {
  const navigate = useNavigate();

  useEffect(() => {
    // Garantir que os dados do formulário estão preservados
    const checkoutData = localStorage.getItem('checkoutFormData');
    if (!checkoutData) {
      console.log('⚠️ Dados do formulário não encontrados, redirecionando...');
      // Optionally redirect to cart if no data is found
      navigate('/carrinho');
    }
  }, [navigate]);

  const handleTryAgain = () => {
    // Voltar para checkout com dados preservados
    navigate('/checkout');
  };

  const handleBackToCart = () => {
    // Voltar para o carrinho
    navigate('/carrinho');
  };

  const handleContinueShopping = () => {
    // Continuar comprando
    navigate('/produtos');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Cabeçalho com ícone */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-close-circle-line text-5xl text-orange-600"></i>
            </div>

            <h1 className="text-5xl font-bold text-black mb-4">
              PAGAMENTO <span className="text-orange-600">CANCELADO</span>
            </h1>

            <p className="text-xl text-gray-700 mb-2">
              Você cancelou o processo de pagamento.
            </p>
            <p className="text-lg text-gray-600">
              Não se preocupe! Seus produtos ainda estão no carrinho e seus dados estão salvos.
            </p>
          </div>

          {/* Card principal com informações */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-black mb-6 text-center">
              O QUE ACONTECEU?
            </h2>

            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-start space-x-4 bg-white rounded-lg p-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-shopping-cart-line text-xl text-green-600"></i>
                </div>
                <div>
                  <h3 className="font-bold text-black mb-1">Carrinho Preservado</h3>
                  <p className="text-gray-600 text-sm">
                    Todos os seus produtos continuam salvos no carrinho. Nada foi perdido!
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white rounded-lg p-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-file-list-line text-xl text-blue-600"></i>
                </div>
                <div>
                  <h3 className="font-bold text-black mb-1">Dados Salvos</h3>
                  <p className="text-gray-600 text-sm">
                    Suas informações de entrega estão salvas. Não precisa preencher tudo novamente!
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white rounded-lg p-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-shield-check-line text-xl text-purple-600"></i>
                </div>
                <div>
                  <h3 className="font-bold text-black mb-1">Nenhuma Cobrança</h3>
                  <p className="text-gray-600 text-sm">
                    Nenhum valor foi cobrado. Você pode tentar novamente quando quiser!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-black mb-6 text-center">
              O QUE DESEJA FAZER?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {/* Tentar novamente */}
              <button
                onClick={handleTryAgain}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-6 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="ri-refresh-line text-3xl text-red-500"></i>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold mb-1">TENTAR NOVAMENTE</p>
                    <p className="text-sm opacity-80">Voltar ao checkout</p>
                  </div>
                </div>
              </button>

              {/* Voltar ao carrinho */}
              <button
                onClick={handleBackToCart}
                className="bg-black text-red-500 font-bold py-6 px-6 rounded-xl hover:bg-gray-900 transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="ri-shopping-cart-line text-3xl text-black"></i>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold mb-1">VER CARRINHO</p>
                    <p className="text-sm opacity-80">Revisar produtos</p>
                  </div>
                </div>
              </button>

              {/* Continuar comprando */}
              <button
                onClick={handleContinueShopping}
                className="bg-gray-200 text-black font-bold py-6 px-6 rounded-xl hover:bg-gray-300 transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="ri-store-line text-3xl text-red-500"></i>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold mb-1">CONTINUAR COMPRANDO</p>
                    <p className="text-sm opacity-80">Ver mais produtos</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-information-line text-2xl text-blue-600"></i>
              </div>
              <div>
                <h3 className="font-bold text-black mb-2">Por que o pagamento pode ter sido cancelado?</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Você clicou no botão "Voltar" ou fechou a janela do Stripe</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Decidiu revisar os produtos antes de finalizar</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Preferiu escolher outro método de pagamento</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Houve algum problema técnico temporário</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Suporte */}
          <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl p-6 text-center border border-red-500/30">
            <h3 className="font-bold text-black mb-3">PRECISA DE AJUDA?</h3>
            <p className="text-gray-700 mb-4">
              Nossa equipe está pronta para ajudar você a finalizar sua compra!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/352621377168"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap shadow-lg"
              >
                <i className="ri-whatsapp-line text-xl"></i>
                <span>FALAR NO WHATSAPP</span>
              </a>
              <a
                href="mailto:jokadas69@gmail.com"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-black text-red-500 font-bold rounded-lg hover:bg-gray-900 transition-colors cursor-pointer whitespace-nowrap shadow-lg"
              >
                <i className="ri-mail-line text-xl"></i>
                <span>ENVIAR E-MAIL</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
