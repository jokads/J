import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, Product } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { darkMode } = useTheme();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      // Carregar produto
      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (error) throw error;

      if (productData) {
        setProduct(productData);

        // Carregar produtos relacionados da mesma categoria
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', productData.category_id)
          .eq('status', 'active')
          .neq('id', productData.id)
          .limit(4);

        if (relatedData) {
          setRelatedProducts(relatedData);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart(product, quantity);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      await addToCart(product, quantity);
      window.REACT_APP_NAVIGATE('/cart');
    } catch (error) {
      console.error('Erro ao comprar:', error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-[#0b0011]' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-[#0b0011]' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-20 text-center">
          <i className={`ri-error-warning-line text-6xl ${darkMode ? 'text-gray-700' : 'text-gray-300'} mb-4`}></i>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Produto não encontrado
          </h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            O produto que você está procurando não existe ou foi removido.
          </p>
          <button
            onClick={() => window.REACT_APP_NAVIGATE('/category')}
            className="px-6 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
          >
            Ver Todos os Produtos
          </button>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : ['https://readdy.ai/api/search-image?query=modern%20product%20photography%20on%20clean%20white%20background%20professional%20lighting%20high%20quality%20detailed&width=800&height=800&seq=' + product.id + '&orientation=squarish'];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0b0011]' : 'bg-gray-50'}`}>
      {/* Mensagem de Sucesso */}
      {showSuccessMessage && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <i className="ri-checkbox-circle-line text-2xl"></i>
            <div>
              <p className="font-semibold">Produto adicionado!</p>
              <p className="text-sm opacity-90">Item adicionado ao carrinho com sucesso</p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <button
                onClick={() => window.REACT_APP_NAVIGATE('/')}
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors cursor-pointer`}
              >
                Início
              </button>
            </li>
            <li className={darkMode ? 'text-gray-600' : 'text-gray-400'}>/</li>
            <li>
              <button
                onClick={() => window.REACT_APP_NAVIGATE('/category')}
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors cursor-pointer`}
              >
                Produtos
              </button>
            </li>
            <li className={darkMode ? 'text-gray-600' : 'text-gray-400'}>/</li>
            <li className={darkMode ? 'text-white' : 'text-gray-900'}>{product.name}</li>
          </ol>
        </nav>

        {/* Produto Principal */}
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden border ${darkMode ? 'border-gray-800' : 'border-gray-200'} mb-12`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Galeria de Imagens */}
            <div>
              {/* Imagem Principal */}
              <div className="relative w-full h-[500px] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-4">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover object-top"
                />
                
                {/* Badge de Stock */}
                {product.stock < 10 && product.stock > 0 && (
                  <div className="absolute top-4 left-4 px-4 py-2 bg-yellow-500 text-black text-sm font-bold rounded-full shadow-lg">
                    Últimas {product.stock} unidades
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute top-4 left-4 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                    Esgotado
                  </div>
                )}
              </div>

              {/* Miniaturas */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-full h-24 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedImage === index
                          ? 'ring-4 ring-[#b62bff] scale-105'
                          : 'ring-2 ring-gray-300 dark:ring-gray-700 hover:ring-[#b62bff] hover:scale-105'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - Imagem ${index + 1}`}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informações do Produto */}
            <div className="flex flex-col">
              <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                {product.name}
              </h1>

              {/* Preço */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className={`text-5xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ou 12x de R$ {(product.price / 12).toFixed(2).replace('.', ',')} sem juros
                </p>
                <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'} mt-2 flex items-center gap-2`}>
                  <i className="ri-truck-line"></i>
                  Frete grátis para todo o Brasil
                </p>
              </div>

              {/* Descrição Curta */}
              {product.short_description && (
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 leading-relaxed`}>
                  {product.short_description}
                </p>
              )}

              {/* Quantidade */}
              <div className="mb-6">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                  Quantidade:
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={`px-5 py-3 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} transition-colors cursor-pointer`}
                    >
                      <i className="ri-subtract-line text-xl"></i>
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className={`w-20 text-center text-lg font-semibold ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} border-none focus:outline-none`}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className={`px-5 py-3 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <i className="ri-add-line text-xl"></i>
                    </button>
                  </div>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {product.stock} unidades disponíveis
                  </span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 px-8 py-4 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-white' : 'text-gray-900'} rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-lg`}
                >
                  <i className="ri-shopping-cart-line text-2xl"></i>
                  Adicionar ao Carrinho
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-xl hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-lg shadow-lg"
                >
                  <i className="ri-shopping-bag-line text-2xl"></i>
                  Comprar Agora
                </button>
              </div>

              {/* Informações Adicionais */}
              <div className={`grid grid-cols-2 gap-4 p-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl`}>
                <div className="flex items-center gap-3">
                  <i className={`ri-shield-check-line text-2xl ${darkMode ? 'text-green-400' : 'text-green-600'}`}></i>
                  <div>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Compra Segura
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pagamento protegido
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <i className={`ri-refresh-line text-2xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}></i>
                  <div>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Devolução Grátis
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Até 30 dias
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <i className={`ri-customer-service-2-line text-2xl ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}></i>
                  <div>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Suporte 24/7
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Atendimento rápido
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <i className={`ri-medal-line text-2xl ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}></i>
                  <div>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Garantia
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      12 meses
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição Completa */}
        {product.description && (
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-xl p-8 border ${darkMode ? 'border-gray-800' : 'border-gray-200'} mb-12`}>
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              Descrição do Produto
            </h2>
            <div 
              className={`prose max-w-none ${darkMode ? 'prose-invert' : ''}`}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* Produtos Relacionados */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
              Produtos Relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const imageUrl = Array.isArray(relatedProduct.images) && relatedProduct.images.length > 0 
                  ? relatedProduct.images[0] 
                  : 'https://readdy.ai/api/search-image?query=modern%20product%20photography%20on%20clean%20white%20background%20professional%20lighting%20high%20quality&width=400&height=400&seq=' + relatedProduct.id + '&orientation=squarish';

                return (
                  <div
                    key={relatedProduct.id}
                    onClick={() => window.REACT_APP_NAVIGATE(`/produto/${relatedProduct.slug}`)}
                    className={`group ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl overflow-hidden border ${darkMode ? 'border-gray-800' : 'border-gray-200'} hover:shadow-xl transition-all duration-300 cursor-pointer`}
                    data-product-shop
                  >
                    <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-2 mb-3 group-hover:text-[#b62bff] transition-colors`}>
                        {relatedProduct.name}
                      </h3>
                      <div className="mb-4">
                        <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          R$ {relatedProduct.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .prose {
          color: ${darkMode ? '#d1d5db' : '#374151'};
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          color: ${darkMode ? '#ffffff' : '#111827'};
        }
        .prose a {
          color: #b62bff;
        }
        .prose strong {
          color: ${darkMode ? '#ffffff' : '#111827'};
        }
      `}</style>
    </div>
  );
}
