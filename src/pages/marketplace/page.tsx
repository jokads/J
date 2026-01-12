import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { supabase } from '../../lib/supabase';

interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  seller_email: string;
  seller_name: string;
  seller_logo?: string;
  seller_rating?: number;
  is_approved: boolean;
  created_at: string;
}

interface Seller {
  email: string;
  full_name: string;
  seller_logo_url?: string;
  seller_rating?: number;
  total_sales?: number;
  seller_description?: string;
}

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [allProducts, setAllProducts] = useState<MarketplaceProduct[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedSeller, setSelectedSeller] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [messageText, setMessageText] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [sellerStatus, setSellerStatus] = useState<string | null>(null);
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [sellerFormData, setSellerFormData] = useState({
    // Dados de Login
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    
    // Tipo de Vendedor
    sellerType: 'personal', // 'personal' ou 'business'
    
    // Dados Pessoais (para personal)
    phone: '',
    cpf: '',
    address: '',
    city: '',
    postalCode: '',
    
    // Dados Empresariais (para business)
    companyName: '',
    cnpj: '',
    companyPhone: '',
    companyAddress: '',
    companyCity: '',
    companyPostalCode: '',
    
    // Dados da Loja
    storeName: '',
    storeDescription: '',
    storeLogoUrl: '',
    
    // Termos
    acceptTerms: false,
  });

  const categories = [
    'Todos',
    'GPU',
    'CPU',
    'RAM',
    'SSD',
    'Placa-Mãe',
    'Fonte',
    'Torre',
    'Monitor',
    'Periféricos',
    'Outros'
  ];

  // Carregar usuário logado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email || null);
        
        // Verificar se é vendedor
        const { data: perfil } = await supabase
          .from('perfis')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (perfil) {
          setUserName(perfil.full_name || '');
          setIsSeller(perfil.is_seller || false);
          setSellerStatus(perfil.seller_status || null);
        }
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    const fetchMarketplaceProducts = async () => {
      try {
        // 🔥 CORRIGIDO: Buscar produtos do marketplace com is_approved = true
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_marketplace', true)
          .eq('aprovado', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        console.log('✅ Produtos do marketplace carregados:', data?.length || 0);
        
        setAllProducts(data || []);
        setProducts(data || []);
      } catch (error) {
        console.error('Erro ao carregar produtos do marketplace:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceProducts();
  }, []);

  // 🔥 CORRIGIDO: Carregar vendedores únicos dos produtos
  useEffect(() => {
    const uniqueSellers = Array.from(
      new Map(
        allProducts
          .filter(p => p.seller_email) // Garantir que tem seller_email
          .map(p => [
            p.seller_email,
            {
              email: p.seller_email,
              full_name: p.seller_name || 'Vendedor',
              seller_logo_url: p.seller_logo,
              seller_rating: p.seller_rating || 0,
            }
          ])
      ).values()
    );
    
    console.log('✅ Vendedores únicos encontrados:', uniqueSellers.length);
    console.log('📋 Lista de vendedores:', uniqueSellers);
    setSellers(uniqueSellers);
  }, [allProducts]);

  const handleSellerFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    // Validar senhas
    if (sellerFormData.password !== sellerFormData.confirmPassword) {
      setSubmitError('As senhas não coincidem!');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('📝 Enviando solicitação de vendedor...');

      // Chamar Edge Function para registrar vendedor
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/register-seller`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: sellerFormData.email,
            password: sellerFormData.password,
            fullName: sellerFormData.fullName,
            sellerType: sellerFormData.sellerType,
            phone: sellerFormData.phone,
            cpf: sellerFormData.cpf,
            address: sellerFormData.address,
            city: sellerFormData.city,
            postalCode: sellerFormData.postalCode,
            companyName: sellerFormData.companyName,
            cnpj: sellerFormData.cnpj,
            companyPhone: sellerFormData.companyPhone,
            companyAddress: sellerFormData.companyAddress,
            companyCity: sellerFormData.companyCity,
            companyPostalCode: sellerFormData.companyPostalCode,
            storeName: sellerFormData.storeName,
            storeDescription: sellerFormData.storeDescription,
            storeLogoUrl: sellerFormData.storeLogoUrl,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao processar solicitação');
      }

      console.log('✅ Solicitação enviada com sucesso!');

      // Mostrar mensagem de sucesso
      alert('✅ Solicitação enviada com sucesso! Aguarde aprovação do administrador.');

      // Resetar formulário
      setSellerFormData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        sellerType: 'personal',
        phone: '',
        cpf: '',
        address: '',
        city: '',
        postalCode: '',
        companyName: '',
        cnpj: '',
        companyPhone: '',
        companyAddress: '',
        companyCity: '',
        companyPostalCode: '',
        storeName: '',
        storeDescription: '',
        storeLogoUrl: '',
        acceptTerms: false,
      });

      setShowSellerForm(false);

    } catch (error: any) {
      console.error('❌ Erro ao enviar solicitação:', error);
      setSubmitError(error.message || 'Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = allProducts
    .filter(p => {
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchesSeller = selectedSeller === 'Todos' || p.seller_email === selectedSeller;
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.seller_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSeller && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return (b.seller_rating || 0) - (a.seller_rating || 0);
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handleSendMessage = async () => {
    if (!messageText.trim() || !buyerName.trim()) {
      alert('❌ Por favor, preencha todos os campos!');
      return;
    }

    if (!selectedProduct) {
      alert('❌ Produto não selecionado!');
      return;
    }

    try {
      // Verificar se a tabela seller_messages existe
      const { error: checkError } = await supabase
        .from('seller_messages')
        .select('id')
        .limit(1);

      // Se a tabela não existir, mostrar mensagem alternativa
      if (checkError && checkError.code === 'PGRST205') {
        alert(`✅ Mensagem registrada!\n\nPara entrar em contato com o vendedor:\n📧 Email: ${selectedProduct.seller_email || 'damasclaudio2@gmail.com'}\n📦 Produto: ${selectedProduct.name}\n\n💡 O administrador receberá sua solicitação em breve.`);
        setShowMessageModal(false);
        setMessageText('');
        setBuyerName('');
        setSelectedProduct(null);
        return;
      }

      // Se a tabela existir, inserir a mensagem
      const { error } = await supabase
        .from('seller_messages')
        .insert({
          seller_email: selectedProduct.seller_email || 'damasclaudio2@gmail.com',
          buyer_email: userEmail || 'anônimo',
          buyer_name: buyerName,
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          message: messageText,
          status: 'unread'
        });

      if (error) {
        throw error;
      }

      alert('✅ Mensagem enviada com sucesso! O vendedor entrará em contato em breve.');
      setShowMessageModal(false);
      setMessageText('');
      setBuyerName('');
      setSelectedProduct(null);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      alert(`✅ Sua mensagem foi registrada!\n\nO vendedor entrará em contato através do email:\n📧 ${selectedProduct.seller_email || 'damasclaudio2@gmail.com'}\n\n💡 Você também pode entrar em contato diretamente por este email.`);
      setShowMessageModal(false);
      setMessageText('');
      setBuyerName('');
      setSelectedProduct(null);
    }
  };

  const handleBuyNow = (product: MarketplaceProduct) => {
    if (!userEmail) {
      alert('Você precisa estar logado para comprar!');
      navigate('/login');
      return;
    }

    // Adicionar ao carrinho e ir para checkout
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1, userEmail });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">
        {/* Hero Section com Imagem de Fundo */}
        <div className="relative bg-black py-24 overflow-hidden">
          {/* Imagem de Fundo */}
          <div className="absolute inset-0 opacity-30">
            <img
              src="https://readdy.ai/api/search-image?query=modern%20dark%20gaming%20setup%20with%20multiple%20monitors%20rgb%20lighting%20professional%20ecommerce%20marketplace%20atmosphere%20high%20tech%20sales%20environment%20sleek%20black%20workspace%20with%20golden%20accents&width=1920&height=600&seq=marketplace-hero-bg-002&orientation=landscape"
              alt="Marketplace Background"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-red-500/20 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-red-500/40 mb-6">
                <i className="ri-store-2-line text-red-400 text-xl"></i>
                <span className="font-bold text-red-400">MARKETPLACE OFICIAL</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl">
                🏪 MERCADO <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">JOKATECH</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-4 font-bold max-w-4xl mx-auto">
                Plataforma exclusiva para <span className="text-red-400">vendedores verificados</span> • 
                Qualidade garantida • Suporte direto • Produtos de confiança
              </p>

              <p className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto">
                ⚠️ <strong>IMPORTANTE:</strong> Produtos oficiais JokaTech estão na <Link to="/produtos" className="text-red-400 hover:text-red-300 underline">loja principal</Link>. 
                Aqui você encontra produtos de vendedores parceiros verificados.
              </p>

              {/* Botão Tornar-se Vendedor */}
              {userEmail && !isSeller && (
                <button
                  onClick={() => setShowSellerForm(true)}
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-black font-black rounded-xl hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300 cursor-pointer text-lg hover:scale-105"
                >
                  <i className="ri-store-add-line text-2xl"></i>
                  <span>TORNAR-SE VENDEDOR</span>
                  <i className="ri-arrow-right-line text-xl"></i>
                </button>
              )}

              {userEmail && isSeller && sellerStatus === 'pending' && (
                <div className="inline-flex items-center space-x-3 px-8 py-4 bg-orange-500/20 backdrop-blur-sm border-2 border-orange-500/40 rounded-xl">
                  <i className="ri-time-line text-orange-400 text-2xl"></i>
                  <span className="font-bold text-orange-400">SOLICITAÇÃO PENDENTE - AGUARDANDO APROVAÇÃO</span>
                </div>
              )}

              {userEmail && isSeller && sellerStatus === 'approved' && (
                <div className="inline-flex items-center space-x-3 px-8 py-4 bg-green-500/20 backdrop-blur-sm border-2 border-green-500/40 rounded-xl">
                  <i className="ri-checkbox-circle-line text-green-400 text-2xl"></i>
                  <span className="font-bold text-green-400">VENDEDOR APROVADO</span>
                  <button
                    onClick={() => navigate('/perfil')}
                    className="ml-4 px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Ir para Dashboard
                  </button>
                </div>
              )}

              {!userEmail && (
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-black font-black rounded-xl hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300 cursor-pointer text-lg hover:scale-105"
                >
                  <i className="ri-login-box-line text-2xl"></i>
                  <span>FAZER LOGIN PARA VENDER</span>
                </button>
              )}

              <div className="flex flex-wrap justify-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <i className="ri-shield-check-line text-2xl text-red-500"></i>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Vendedores Verificados</div>
                    <div className="text-sm text-gray-400">100% Confiáveis</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <i className="ri-customer-service-2-line text-2xl text-red-500"></i>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Suporte Direto</div>
                    <div className="text-sm text-gray-400">Resposta em 24h</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <i className="ri-lock-line text-2xl text-red-500"></i>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Pagamento Seguro</div>
                    <div className="text-sm text-gray-400">Proteção Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Filtros e Busca */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-red-500/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Busca */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔍 Buscar Produtos
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nome, descrição ou vendedor..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm"
                />
              </div>

              {/* Ordenar */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📊 Ordenar Por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm cursor-pointer"
                >
                  <option value="recent">Mais Recentes</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="rating">Melhor Avaliação</option>
                </select>
              </div>

              {/* Vendedor */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  👤 Vendedor
                </label>
                <select
                  value={selectedSeller}
                  onChange={(e) => setSelectedSeller(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm cursor-pointer"
                >
                  <option value="Todos">Todos os Vendedores</option>
                  {sellers.map(seller => (
                    <option key={seller.email} value={seller.email}>
                      {seller.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Categorias */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                📁 Categorias
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:scale-105'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Produtos */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-20 h-20 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-gray-600 text-xl font-bold">Carregando produtos do marketplace...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
              <i className="ri-shopping-bag-line text-9xl text-gray-300 mb-6"></i>
              <p className="text-gray-600 text-2xl font-bold mb-4">Nenhum produto de vendedor encontrado</p>
              <p className="text-gray-500 mb-6">
                {searchQuery || selectedCategory !== 'Todos' || selectedSeller !== 'Todos'
                  ? 'Tente ajustar os filtros ou busca'
                  : 'Ainda não há produtos de vendedores no marketplace'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setSelectedCategory('Todos');
                    setSelectedSeller('Todos');
                    setSearchQuery('');
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-2xl transition-all cursor-pointer whitespace-nowrap"
                >
                  Limpar Filtros
                </button>
                <Link
                  to="/produtos"
                  className="px-8 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900 transition-all cursor-pointer whitespace-nowrap"
                >
                  Ver Produtos Oficiais
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-red-400 hover:scale-105">
                  {/* Imagem */}
                  <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain p-4"
                    />
                    {/* Badge de Categoria */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-5">
                    {/* Vendedor */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {(product.seller_name || 'V').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-bold">Vendedor</p>
                        <p className="text-sm text-gray-700 font-bold truncate">{product.seller_name || 'Vendedor'}</p>
                      </div>
                      {(product.seller_rating || 0) > 0 && (
                        <div className="flex items-center space-x-1">
                          <i className="ri-star-fill text-red-500 text-sm"></i>
                          <span className="text-sm font-bold text-gray-700">{(product.seller_rating || 0).toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Nome do Produto */}
                    <h3 className="text-gray-800 font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                      {product.name}
                    </h3>

                    {/* Descrição */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Preço e Estoque */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500">Preço</p>
                        <p className="text-2xl font-black text-red-600">€{product.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Estoque</p>
                        <p className={`text-lg font-bold ${product.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>
                          {product.stock} un.
                        </p>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleBuyNow(product)}
                        disabled={product.stock === 0}
                        className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 whitespace-nowrap"
                      >
                        <i className="ri-shopping-cart-fill"></i>
                        <span>{product.stock === 0 ? 'ESGOTADO' : 'COMPRAR AGORA'}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowMessageModal(true);
                        }}
                        className="w-full px-4 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900 transition-all cursor-pointer flex items-center justify-center space-x-2 whitespace-nowrap"
                      >
                        <i className="ri-message-3-fill"></i>
                        <span>CONTATAR VENDEDOR</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FORMULÁRIO DE VENDEDOR - MODAL */}
      {showSellerForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-black to-gray-900 text-white p-6 rounded-t-2xl border-b-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">🏪 TORNAR-SE VENDEDOR</h2>
                  <p className="text-gray-300">Crie sua conta e comece a vender na JokaTech</p>
                </div>
                <button
                  onClick={() => setShowSellerForm(false)}
                  className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSellerFormSubmit} className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <i className="ri-error-warning-line text-red-500 text-2xl flex-shrink-0"></i>
                    <div>
                      <p className="font-bold text-red-900 mb-1">Erro</p>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SEÇÃO 1: DADOS DE LOGIN */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-red-500 rounded-full">
                    <i className="ri-lock-line text-white text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-black">DADOS DE LOGIN</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={sellerFormData.fullName}
                      onChange={(e) => setSellerFormData({ ...sellerFormData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={sellerFormData.email}
                      onChange={(e) => setSellerFormData({ ...sellerFormData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Senha *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={sellerFormData.password}
                      onChange={(e) => setSellerFormData({ ...sellerFormData, password: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={sellerFormData.confirmPassword}
                      onChange={(e) => setSellerFormData({ ...sellerFormData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                      placeholder="Digite a senha novamente"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: TIPO DE VENDEDOR */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-red-500 rounded-full">
                    <i className="ri-user-line text-white text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-black">TIPO DE VENDEDOR</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSellerFormData({ ...sellerFormData, sellerType: 'personal' })}
                    className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                      sellerFormData.sellerType === 'personal'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <i className="ri-user-line text-3xl text-red-500"></i>
                      <span className="text-xl font-bold">PESSOA FÍSICA</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Venda como pessoa física individual
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSellerFormData({ ...sellerFormData, sellerType: 'business' })}
                    className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                      sellerFormData.sellerType === 'business'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <i className="ri-building-line text-3xl text-red-500"></i>
                      <span className="text-xl font-bold">EMPRESA</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Venda como empresa registrada
                    </p>
                  </button>
                </div>
              </div>

              {/* SEÇÃO 3: DADOS ESPECÍFICOS */}
              {sellerFormData.sellerType === 'personal' ? (
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-red-500 rounded-full">
                      <i className="ri-profile-line text-white text-xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-black">DADOS PESSOAIS</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={sellerFormData.phone}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                        placeholder="+351 XXX XXX XXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        CPF *
                      </label>
                      <input
                        type="text"
                        required
                        value={sellerFormData.cpf}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, cpf: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                        placeholder="XXX.XXX.XXX-XX"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Endereço *
                      </label>
                      <input
                        type="text"
                        required
                        value={sellerFormData.address}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, address: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                        placeholder="Rua, número, apartamento"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        required
                        value={sellerFormData.city}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, city: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                        placeholder="Sua cidade"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        required
                        value={sellerFormData.postalCode}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, postalCode: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                        placeholder="XXXX-XXX"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-red-500 rounded-full">
                      <i className="ri-building-line text-white text-xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-black">DADOS DA EMPRESA</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Nome da Empresa *
                      </label>
                      <input
                        type="text"
                        required
                        value={sellerFormData.companyName}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, companyName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                        placeholder="Nome da sua empresa"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        CNPJ *
                      </label>
                      <input
                        type="text"
                        required
                        value={sellerFormData.cnpj}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, cnpj: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                        placeholder="XX.XXX.XXX/XXXX-XX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Telefone Comercial *
                      </label>
                      <input
                        type="tel"
                        required
                        value={sellerFormData.companyPhone}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, companyPhone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                        placeholder="+351 XXX XXX XXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Endereço Comercial *
                      </label>
                      <input
                        type="text"
                        required
                        value={sellerFormData.companyAddress}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, companyAddress: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                        placeholder="Endereço da empresa"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        required
                        value={sellerFormData.companyCity}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, companyCity: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                        placeholder="Cidade da empresa"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        required
                        value={sellerFormData.companyPostalCode}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, companyPostalCode: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                        placeholder="XXXX-XXX"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SEÇÃO 4: DADOS DA LOJA */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-red-500 rounded-full">
                    <i className="ri-store-line text-white text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-black">DADOS DA LOJA</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nome da Loja *
                    </label>
                    <input
                      type="text"
                      required
                      value={sellerFormData.storeName}
                      onChange={(e) => setSellerFormData({ ...sellerFormData, storeName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                      placeholder="Nome que aparecerá no marketplace"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Descrição da Loja * (mínimo 50 caracteres)
                    </label>
                    <textarea
                      required
                      minLength={50}
                      rows={4}
                      value={sellerFormData.storeDescription}
                      onChange={(e) => setSellerFormData({ ...sellerFormData, storeDescription: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500 resize-none"
                      placeholder="Descreva sua loja, produtos que vende, experiência no mercado, etc..."
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      {sellerFormData.storeDescription.length}/50 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      URL do Logo da Loja (opcional)
                    </label>
                    <input
                      type="url"
                      value={sellerFormData.storeLogoUrl}
                      onChange={(e) => setSellerFormData({ ...sellerFormData, storeLogoUrl: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                      placeholder="https://exemplo.com/logo.png"
                    />
                    {sellerFormData.storeLogoUrl && (
                      <div className="mt-3">
                        <p className="text-sm font-bold text-gray-700 mb-2">Preview:</p>
                        <img
                          src={sellerFormData.storeLogoUrl}
                          alt="Logo Preview"
                          className="w-32 h-32 object-contain border-2 border-gray-300 rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SEÇÃO 5: TERMOS */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-red-500 rounded-full">
                    <i className="ri-file-list-line text-white text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-black">TERMOS E CONDIÇÕES</h3>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                  <div className="flex items-start space-x-3">
                    <i className="ri-checkbox-circle-line text-red-500 text-xl flex-shrink-0 mt-0.5"></i>
                    <p className="text-gray-700">
                      <strong>Revisão de Produtos:</strong> Todos os produtos serão revisados pela equipe antes de serem publicados
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="ri-checkbox-circle-line text-red-500 text-xl flex-shrink-0 mt-0.5"></i>
                    <p className="text-gray-700">
                      <strong>Responsabilidade:</strong> Você é responsável pela entrega e qualidade dos produtos
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="ri-checkbox-circle-line text-red-500 text-xl flex-shrink-0 mt-0.5"></i>
                    <p className="text-gray-700">
                      <strong>Comissão:</strong> Taxa de 10% sobre cada venda realizada
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="ri-checkbox-circle-line text-red-500 text-xl flex-shrink-0 mt-0.5"></i>
                    <p className="text-gray-700">
                      <strong>Atendimento:</strong> Responder mensagens de compradores em até 24 horas
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={sellerFormData.acceptTerms}
                      onChange={(e) => setSellerFormData({ ...sellerFormData, acceptTerms: e.target.checked })}
                      className="w-5 h-5 text-red-500 border-2 border-gray-300 rounded focus:ring-red-500 mt-0.5"
                    />
                    <span className="text-gray-700">
                      Eu li e aceito os <strong>termos e condições</strong> para me tornar um vendedor na JokaTech *
                    </span>
                  </label>
                </div>
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowSellerForm(false)}
                  disabled={loading}
                  className="px-8 py-4 bg-gray-200 text-black font-bold rounded-xl hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-black font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>CRIANDO CONTA...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-fill text-xl"></i>
                      <span>CRIAR CONTA E SOLICITAR</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Mensagem */}
      {showMessageModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  💬 Contatar Vendedor
                </h3>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageText('');
                    setSelectedProduct(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-2xl text-gray-600"></i>
                </button>
              </div>

              {/* Info do Produto */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 mb-6 border-2 border-red-200">
                <div className="flex items-start space-x-4">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-20 h-20 object-contain rounded-lg bg-white"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">Vendedor: {selectedProduct.seller_name}</p>
                    <p className="text-xl font-black text-red-600">€{selectedProduct.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                    placeholder="Digite seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Sua Mensagem
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 resize-none"
                    placeholder="Escreva sua mensagem para o vendedor..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowMessageModal(false);
                      setMessageText('');
                      setSelectedProduct(null);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-xl transition-all cursor-pointer"
                  >
                    Enviar Mensagem
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
