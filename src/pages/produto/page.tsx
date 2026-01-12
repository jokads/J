import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { supabase, Product } from '../../lib/supabase';

interface Review {
  id: string;
  product_id: string;
  user_name: string;
  user_email?: string;
  rating: number;
  comment: string;
  is_anonymous: boolean;
  created_at: string;
}

interface ProductVariant {
  color?: string;
  size?: string;
  stock: number;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Cores disponíveis por categoria
  const getAvailableColors = (category: string) => {
    const noColorCategories = ['CPU', 'GPU', 'Monitor', 'Gabinete', 'Torre', 'PC Completo', 'Placa-Mãe', 'SSD', 'Fonte'];
    
    if (noColorCategories.some(cat => category?.toLowerCase().includes(cat.toLowerCase()))) {
      return ['Preto', 'Branco', 'Cinza'];
    }
    
    return ['Preto', 'Branco', 'Vermelho', 'Verde', 'Azul', 'Rosa', 'Amarelo'];
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  useEffect(() => {
    // Auto-preencher nome e email se estiver logado
    const userEmail = localStorage.getItem('userEmail');
    const user = localStorage.getItem('user');
    
    if (userEmail) {
      setReviewEmail(userEmail);
      if (user) {
        try {
          const userData = JSON.parse(user);
          setReviewName(userData.user_metadata?.full_name || userEmail.split('@')[0]);
        } catch (e) {
          setReviewName(userEmail.split('@')[0]);
        }
      }
    }
  }, []);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!id) {
        setError('ID do produto não fornecido');
        setLoading(false);
        return;
      }

      // ✅ VALIDAÇÃO: Verificar se o ID é válido (não é :id ou placeholder)
      if (id === ':id' || id.includes(':')) {
        console.warn('⚠️ ID inválido detectado:', id);
        setError('ID do produto inválido');
        setLoading(false);
        return;
      }

      // ✅ VALIDAÇÃO: Verificar se o ID é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        console.warn('⚠️ ID não é um UUID válido:', id);
        setError('ID do produto inválido');
        setLoading(false);
        return;
      }

      console.log('🔍 Buscando produto com ID:', id);

      // Primeiro tenta buscar na tabela products
      let { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      // Se não encontrou em products, tenta em pre_built_pcs
      if (!data && !fetchError) {
        console.log('🔍 Produto não encontrado em products, buscando em pre_built_pcs...');
        
        const { data: pcData, error: pcError } = await supabase
          .from('pre_built_pcs')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (pcError && pcError.code !== 'PGRST116') {
          console.error('❌ Erro ao buscar PC pré-montado:', pcError);
          throw pcError;
        }

        if (pcData) {
          console.log('✅ PC pré-montado encontrado:', pcData);
          
          // Converter formato de pre_built_pcs para Product
          data = {
            id: pcData.id,
            name: pcData.name,
            description: pcData.description || pcData.specs || 'PC pré-montado de alta qualidade',
            price: parseFloat(pcData.price),
            image_url: pcData.image_url || 'https://readdy.ai/api/search-image?query=modern%20gaming%20computer%20tower%20black%20sleek%20design%20rgb%20lighting%20professional%20product%20photo%20simple%20background%20high%20quality&width=800&height=800&seq=pc-default&orientation=squarish',
            category: pcData.category || 'Torre',
            brand: 'TechPower',
            stock: pcData.stock_status === 'out_of_stock' ? 0 : pcData.stock_status === 'low_stock' ? 5 : 50,
            rating: 4.8,
            reviews_count: 0,
            created_at: pcData.created_at,
            updated_at: pcData.updated_at
          } as Product;
        }
      }

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar produto:', fetchError);
        throw fetchError;
      }

      if (!data) {
        console.warn('⚠️ Produto não encontrado com ID:', id);
        setError('Produto não encontrado');
        setProduct(null);
        return;
      }

      console.log('✅ Produto carregado:', data);
      setProduct(data);
      
      // Definir cor padrão
      const colors = getAvailableColors(data.category || '');
      setSelectedColor(colors[0]);
    } catch (error: any) {
      console.error('❌ Erro crítico ao carregar produto:', error);
      setError(error.message || 'Erro ao carregar produto');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ Erro ao carregar avaliações:', error);
        return;
      }
      
      // Garantir que user_name existe em todas as avaliações
      const reviewsWithNames = (data || []).map(review => ({
        ...review,
        user_name: review.user_name || (review.is_anonymous ? 'Anônimo' : 'Cliente')
      }));
      
      setReviews(reviewsWithNames);
    } catch (error) {
      console.error('❌ Erro ao carregar avaliações:', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const submitReview = async () => {
    if (!reviewComment.trim()) {
      showToast('Por favor, escreva um comentário', 'error');
      return;
    }

    if (!isAnonymous && (!reviewName.trim() || !reviewEmail.trim())) {
      showToast('Por favor, preencha seu nome e email', 'error');
      return;
    }

    setSubmittingReview(true);

    try {
      const reviewData = {
        product_id: id,
        user_name: isAnonymous ? 'Anônimo' : reviewName,
        user_email: isAnonymous ? null : reviewEmail,
        rating: reviewRating,
        comment: reviewComment,
        is_anonymous: isAnonymous,
      };

      const { error } = await supabase
        .from('reviews')
        .insert([reviewData]);

      if (error) throw error;

      // Atualizar média de avaliações do produto
      const newAvgRating = (product!.rating * product!.reviews_count + reviewRating) / (product!.reviews_count + 1);
      
      await supabase
        .from('products')
        .update({
          rating: newAvgRating,
          reviews_count: product!.reviews_count + 1,
        })
        .eq('id', id);

      showToast('✓ Avaliação enviada com sucesso!', 'success');
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
      
      // Recarregar avaliações e produto
      fetchReviews();
      fetchProduct();
    } catch (error: any) {
      console.error('Erro ao enviar avaliação:', error);
      showToast('Erro ao enviar avaliação. Tente novamente.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ 
        ...product, 
        quantity,
        selectedColor,
        selectedSize 
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 3000);
  };

  const buyNow = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ 
        ...product, 
        quantity,
        selectedColor,
        selectedSize 
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    navigate('/checkout');
  };

  const addToFavorites = () => {
    if (!product) return;
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (!favorites.find((item: any) => item.id === product.id)) {
      favorites.push(product);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      window.dispatchEvent(new Event('storage'));
      showToast('❤️ Produto adicionado aos favoritos!', 'success');
    } else {
      showToast('Este produto já está nos favoritos!', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-white text-xl font-semibold">Carregando produto...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />
        <div className="pt-24 py-20">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center bg-red-500/10 rounded-full border-4 border-red-500/30">
              <i className="ri-error-warning-line text-7xl text-red-500"></i>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Produto Não Encontrado
            </h1>
            
            <p className="text-gray-400 text-lg mb-8">
              {error || 'O produto que você está procurando não existe ou foi removido.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/produtos" 
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all cursor-pointer whitespace-nowrap shadow-lg hover:shadow-xl"
              >
                <i className="ri-grid-line text-xl"></i>
                <span>VER TODOS OS PRODUTOS</span>
              </Link>
              
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line text-xl"></i>
                <span>VOLTAR</span>
              </button>
            </div>

            <div className="mt-12 p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl border border-blue-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center space-x-2">
                <i className="ri-customer-service-2-line text-blue-400"></i>
                <span>Precisa de Ajuda?</span>
              </h3>
              <p className="text-gray-400 mb-6">
                Entre em contato conosco e teremos prazer em ajudá-lo a encontrar o produto ideal!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/352621717862"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all cursor-pointer"
                >
                  <i className="ri-whatsapp-line text-xl"></i>
                  <span>WhatsApp</span>
                </a>
                <a
                  href="mailto:damasclaudio2@gmail.com"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all cursor-pointer"
                >
                  <i className="ri-mail-line text-xl"></i>
                  <span>E-mail</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = [product.image_url, product.image_url, product.image_url];
  const estimatedDelivery = '3-5 dias úteis';
  const availableColors = getAvailableColors(product.category || '');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-lg shadow-lg font-semibold animate-bounce ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {showAddedMessage && (
        <div className="fixed top-24 right-6 z-50 bg-gradient-to-r from-amber-400 to-amber-600 text-black px-6 py-4 rounded-lg shadow-lg font-semibold animate-bounce">
          ✓ Produto adicionado ao carrinho!
        </div>
      )}

      <div className="pt-20 pb-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-amber-500 cursor-pointer transition-colors">Início</Link>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            <Link to="/produtos" className="hover:text-amber-500 cursor-pointer transition-colors">Produtos</Link>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            <span className="text-black font-semibold">{product.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="w-full h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-12 hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-full h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden cursor-pointer border-3 transition-all duration-300 hover:scale-105 ${
                      selectedImage === idx ? 'border-amber-500 shadow-lg' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain p-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider">{product.brand}</p>
                <h1 className="text-5xl font-bold text-black mb-4 leading-tight">{product.name}</h1>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-4 pb-6 border-b">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`${i < Math.floor(product.rating) ? 'ri-star-fill text-amber-500' : 'ri-star-line text-gray-300'} text-2xl`}
                    ></i>
                  ))}
                </div>
                <span className="text-xl font-bold text-black">{product.rating.toFixed(1)}</span>
                <span className="text-gray-400">({product.reviews_count} avaliações)</span>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl">
                <p className="text-6xl font-bold text-black mb-2">€{product.price.toFixed(2)}</p>
                <p className="text-gray-600 text-lg">IVA incluído • Envio grátis acima de €100</p>
              </div>

              {/* Stock */}
              <div className="flex items-center space-x-3">
                {product.stock > 10 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-green-600 font-semibold text-lg">Em estoque ({product.stock} unidades)</p>
                  </>
                ) : product.stock > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                    <p className="text-orange-600 font-semibold text-lg">Últimas {product.stock} unidades!</p>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <p className="text-red-600 font-semibold text-lg">Esgotado</p>
                  </>
                )}
              </div>

              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wider">
                    COR: <span className="text-amber-500">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          selectedColor === color
                            ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-500 rounded-xl">
                    <i className="ri-truck-line text-2xl text-white"></i>
                  </div>
                  <div>
                    <p className="font-bold text-black text-lg mb-1">Entrega Rápida</p>
                    <p className="text-gray-700">Estimativa: {estimatedDelivery}</p>
                    <p className="text-sm text-gray-600 mt-1">Entregamos em toda a Europa</p>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wider">QUANTIDADE</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-xl hover:bg-gray-300 cursor-pointer transition-all hover:scale-105"
                  >
                    <i className="ri-subtract-line text-xl"></i>
                  </button>
                  <span className="text-3xl font-bold text-black w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-xl hover:bg-gray-300 cursor-pointer transition-all hover:scale-105"
                  >
                    <i className="ri-add-line text-xl"></i>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <button
                  onClick={buyNow}
                  disabled={product.stock === 0}
                  className="w-full px-8 py-5 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-xl hover:from-amber-500 hover:to-amber-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-xl shadow-lg hover:shadow-xl hover:scale-105 duration-300"
                >
                  <i className="ri-shopping-bag-3-line mr-3 text-2xl"></i>
                  COMPRAR JÁ
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={addToCart}
                    disabled={product.stock === 0}
                    className="px-6 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg hover:shadow-xl hover:scale-105 duration-300"
                  >
                    <i className="ri-shopping-cart-line mr-2 text-xl"></i>
                    CARRINHO
                  </button>
                  <button
                    onClick={addToFavorites}
                    className="px-6 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all cursor-pointer whitespace-nowrap shadow-lg hover:shadow-xl hover:scale-105 duration-300"
                  >
                    <i className="ri-heart-line mr-2 text-xl"></i>
                    FAVORITOS
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="border-t pt-6">
                <p className="text-sm font-bold text-black mb-4 uppercase tracking-wider">MÉTODOS DE PAGAMENTO</p>
                <div className="flex items-center justify-center space-x-6 bg-gray-50 p-6 rounded-2xl">
                  <div className="w-16 h-16 flex items-center justify-center bg-white rounded-xl shadow-md">
                    <i className="ri-visa-line text-5xl text-blue-600"></i>
                  </div>
                  <div className="w-16 h-16 flex items-center justify-center bg-white rounded-xl shadow-md">
                    <i className="ri-mastercard-line text-5xl text-red-600"></i>
                  </div>
                  <div className="w-16 h-16 flex items-center justify-center bg-black rounded-xl shadow-md">
                    <i className="ri-apple-fill text-3xl text-white"></i>
                  </div>
                  <div className="w-16 h-16 flex items-center justify-center bg-white rounded-xl shadow-md text-sm font-bold text-gray-700">
                    G Pay
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-4">
                  🔒 Pagamento 100% seguro via Stripe
                </p>
              </div>
            </div>
          </div>

          {/* Description & Reviews */}
          <div className="mt-20">
            <div className="border-b-2 mb-8">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`px-6 py-4 border-b-4 font-bold text-lg transition-all ${
                    activeTab === 'description'
                      ? 'border-amber-500 text-black'
                      : 'border-transparent text-gray-400 hover:text-black'
                  }`}
                >
                  <i className="ri-file-text-line mr-2"></i>
                  DESCRIÇÃO
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-4 border-b-4 font-bold text-lg transition-all ${
                    activeTab === 'reviews'
                      ? 'border-amber-500 text-black'
                      : 'border-transparent text-gray-400 hover:text-black'
                  }`}
                >
                  <i className="ri-star-line mr-2"></i>
                  AVALIAÇÕES ({reviews.length})
                </button>
              </div>
            </div>

            {activeTab === 'description' && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl">
                <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Add Review Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-black">Avaliações dos Clientes</h3>
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-xl hover:from-amber-500 hover:to-amber-700 transition-all cursor-pointer shadow-lg hover:scale-105 duration-300 whitespace-nowrap"
                  >
                    <i className="ri-add-line mr-2"></i>
                    DEIXAR AVALIAÇÃO
                  </button>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-8 rounded-2xl shadow-lg">
                    <h4 className="text-xl font-bold text-black mb-6">Deixe sua avaliação</h4>
                    
                    {/* Rating Stars */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-black mb-3">CLASSIFICAÇÃO</label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="cursor-pointer hover:scale-125 transition-transform"
                          >
                            <i className={`${star <= reviewRating ? 'ri-star-fill text-amber-500' : 'ri-star-line text-gray-300'} text-4xl`}></i>
                          </button>
                        ))}
                        <span className="ml-4 text-xl font-bold text-black">{reviewRating}/5</span>
                      </div>
                    </div>

                    {/* Anonymous Toggle */}
                    <div className="mb-6">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-black">Avaliar anonimamente</span>
                      </label>
                    </div>

                    {/* Name and Email (if not anonymous) */}
                    {!isAnonymous && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-bold text-black mb-2">NOME</label>
                          <input
                            type="text"
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
                            placeholder="Seu nome"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-black mb-2">EMAIL</label>
                          <input
                            type="email"
                            value={reviewEmail}
                            onChange={(e) => setReviewEmail(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
                            placeholder="seu@email.com"
                          />
                        </div>
                      </div>
                    )}

                    {/* Comment */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-black mb-2">COMENTÁRIO</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 resize-none"
                        placeholder="Conte-nos sobre sua experiência com este produto..."
                      ></textarea>
                      <p className="text-sm text-gray-600 mt-2">{reviewComment.length}/500 caracteres</p>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex space-x-4">
                      <button
                        onClick={submitReview}
                        disabled={submittingReview}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-xl hover:from-amber-500 hover:to-amber-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 duration-300 whitespace-nowrap"
                      >
                        {submittingReview ? (
                          <>
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                            ENVIANDO...
                          </>
                        ) : (
                          <>
                            <i className="ri-send-plane-fill mr-2"></i>
                            ENVIAR AVALIAÇÃO
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="px-6 py-4 bg-gray-200 text-black font-bold rounded-xl hover:bg-gray-300 transition-all cursor-pointer whitespace-nowrap"
                      >
                        CANCELAR
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                    <div className="w-24 h-24 flex items-center justify-center bg-amber-100 rounded-full mx-auto mb-6">
                      <i className="ri-star-line text-6xl text-amber-500"></i>
                    </div>
                    <p className="text-gray-600 text-xl font-semibold mb-2">Ainda não há avaliações</p>
                    <p className="text-gray-500">Seja o primeiro a avaliar este produto!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 rounded-full text-white font-bold text-xl">
                              {review.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-black text-lg">{review.user_name}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`${i < review.rating ? 'ri-star-fill text-amber-500' : 'ri-star-line text-gray-300'} text-lg`}
                                  ></i>
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('pt-PT', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
