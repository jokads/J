import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { servicesMock } from '../../mocks/services';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

interface ComparisonItem {
  id: number;
  title: string;
  specs: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
  };
  price: number;
  image: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Qual é o seu objetivo principal?",
    options: ["Gaming", "Trabalho", "Streaming", "Uso Geral"]
  },
  {
    id: 2,
    question: "Que tipo de produto procura?",
    options: ["PC Completo", "Componentes", "Upgrade", "Consultoria"]
  },
  {
    id: 3,
    question: "Que tipo de jogos pretende jogar?",
    options: ["AAA Ultra", "Competitivo", "Indie/Casual", "Não jogo"]
  },
  {
    id: 4,
    question: "Qual resolução pretende usar?",
    options: ["1080p", "1440p", "4K", "Multi-Monitor"]
  },
  {
    id: 5,
    question: "Qual é o seu orçamento?",
    options: ["€500-1000", "€1000-2000", "€2000-3500", "€3500+"]
  },
  {
    id: 6,
    question: "Quando pretende comprar?",
    options: ["Imediatamente", "Este mês", "Em 3 meses", "Só pesquisando"]
  }
];

const comparisons: ComparisonItem[] = [
  {
    id: 1,
    title: "Gaming Entry vs Pro",
    specs: {
      cpu: "Intel i5-12400F vs i7-13700K",
      gpu: "RTX 3060 vs RTX 4070",
      ram: "16GB DDR4 vs 32GB DDR5",
      storage: "500GB SSD vs 1TB NVMe"
    },
    price: 899,
    image: "https://readdy.ai/api/search-image?query=modern%20gaming%20computer%20setup%20with%20RGB%20lighting%20colorful%20desktop%20PC%20tower%20with%20glass%20panel%20showing%20internal%20components%20against%20dark%20background%20clean%20minimalist%20style&width=400&height=300&seq=comp1&orientation=landscape"
  },
  {
    id: 2,
    title: "Budget vs Performance",
    specs: {
      cpu: "Ryzen 5 5600 vs Ryzen 7 7700X",
      gpu: "GTX 1660 Super vs RTX 3070",
      ram: "16GB DDR4 vs 16GB DDR5",
      storage: "256GB SSD vs 1TB SSD"
    },
    price: 649,
    image: "https://readdy.ai/api/search-image?query=sleek%20computer%20workstation%20setup%20modern%20PC%20with%20LED%20strips%20clean%20white%20desk%20gaming%20monitor%20keyboard%20mouse%20professional%20lighting&width=400&height=300&seq=comp2&orientation=landscape"
  },
  {
    id: 3,
    title: "Creator vs Workstation",
    specs: {
      cpu: "Ryzen 9 7900X vs Intel i9-13900K",
      gpu: "RTX 4060 Ti vs RTX 4080",
      ram: "32GB DDR5 vs 64GB DDR5",
      storage: "1TB NVMe vs 2TB NVMe"
    },
    price: 2299,
    image: "https://readdy.ai/api/search-image?query=professional%20computer%20workstation%20high%20end%20desktop%20PC%20with%20multiple%20monitors%20clean%20modern%20office%20setup%20dark%20background%20ambient%20lighting&width=400&height=300&seq=comp3&orientation=landscape"
  },
  {
    id: 4,
    title: "Intel vs AMD Showdown",
    specs: {
      cpu: "Intel i5-13600K vs Ryzen 7 7700X",
      gpu: "RTX 4060 vs RTX 4060",
      ram: "32GB DDR5 vs 32GB DDR5",
      storage: "1TB Gen4 vs 1TB Gen4"
    },
    price: 1199,
    image: "https://readdy.ai/api/search-image?query=computer%20components%20comparison%20motherboard%20CPU%20GPU%20RAM%20displayed%20on%20clean%20surface%20with%20dramatic%20lighting%20tech%20aesthetic%20dark%20background&width=400&height=300&seq=comp4&orientation=landscape"
  },
  {
    id: 5,
    title: "RTX 4070 vs RTX 4080",
    specs: {
      cpu: "Intel i7-13700K vs i7-13700K",
      gpu: "RTX 4070 vs RTX 4080",
      ram: "32GB DDR5 vs 32GB DDR5",
      storage: "1TB NVMe vs 1TB NVMe"
    },
    price: 1899,
    image: "https://readdy.ai/api/search-image?query=high%20end%20graphics%20cards%20RTX%20GPU%20comparison%20on%20dark%20surface%20with%20dramatic%20lighting%20gaming%20PC%20components%20tech%20product%20photography&width=400&height=300&seq=comp5&orientation=landscape"
  },
  {
    id: 6,
    title: "4K Gaming Beast vs Ultra",
    specs: {
      cpu: "Ryzen 9 7900X3D vs i9-13900KS",
      gpu: "RTX 4080 vs RTX 4090",
      ram: "32GB DDR5 vs 64GB DDR5",
      storage: "2TB Gen4 vs 4TB Gen4"
    },
    price: 3499,
    image: "https://readdy.ai/api/search-image?query=ultimate%20gaming%20computer%20setup%20massive%20tower%20PC%20with%20water%20cooling%20RGB%20lighting%20high%20end%20workstation%20multiple%20monitors%20dark%20atmospheric%20lighting&width=400&height=300&seq=comp6&orientation=landscape"
  }
];

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "Qual configuração recomenda para jogos em 1440p?",
    answer: "Para jogos em 1440p recomendamos RTX 4070 ou superior, CPU Intel i5-13600K ou Ryzen 7 7700X, 32GB RAM DDR5 e SSD NVMe 1TB."
  },
  {
    id: 2,
    question: "Quanto tempo demora a montagem de um PC personalizado?",
    answer: "Normalmente 2-4 dias úteis após confirmação do pagamento. PCs complexos com water cooling podem demorar até 7 dias."
  },
  {
    id: 3,
    question: "Oferecem garantia nos PCs montados?",
    answer: "Sim! 2 anos de garantia completa + suporte técnico gratuito. Componentes individuais têm garantia do fabricante."
  },
  {
    id: 4,
    question: "É possível fazer upgrade posteriormente?",
    answer: "Absolutamente! Desenhamos todos os PCs pensando em futuras atualizações. Oferecemos serviço de upgrade também."
  },
  {
    id: 5,
    question: "Fazem entrega em toda a Europa?",
    answer: "Sim! Enviamos para toda a Europa. Entrega grátis no Luxemburgo e desconto especial para países vizinhos."
  },
  {
    id: 6,
    question: "Posso financiar a compra do meu PC?",
    answer: "Oferecemos várias opções de pagamento incluindo pagamento em prestações. Contacte-nos para mais detalhes."
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendation, setRecommendation] = useState('');
  const [currentComparisonIndex, setCurrentComparisonIndex] = useState(0);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  
  // 🔥 NOVO: Estado para produtos em destaque do Supabase
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // 🔥 NOVO: Estado para produtos novos/recentes
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [loadingNewProducts, setLoadingNewProducts] = useState(true);

  // 🔥 NOVO: Estado para produtos do Marketplace
  const [marketplaceProducts, setMarketplaceProducts] = useState<any[]>([]);
  const [loadingMarketplace, setLoadingMarketplace] = useState(true);

  // 🔥 CARREGAR PRODUTOS EM DESTAQUE DO SUPABASE
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('featured', true)
          .eq('is_marketplace', false)
          .limit(6)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setFeaturedProducts(data);
        }
      } catch (error) {
        console.error('Erro ao carregar produtos em destaque:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  // 🔥 CARREGAR PRODUTOS NOVOS/RECENTES
  useEffect(() => {
    const loadNewProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_marketplace', false)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        
        if (data && data.length > 0) {
          setNewProducts(data);
        }
      } catch (error) {
        console.error('Erro ao carregar produtos novos:', error);
      } finally {
        setLoadingNewProducts(false);
      }
    };

    loadNewProducts();
  }, []);

  // 🔥 NOVO: CARREGAR PRODUTOS DO MARKETPLACE
  useEffect(() => {
    const loadMarketplaceProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_marketplace', true)
          .eq('aprovado', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        
        if (data && data.length > 0) {
          setMarketplaceProducts(data);
        }
      } catch (error) {
        console.error('Erro ao carregar produtos do marketplace:', error);
      } finally {
        setLoadingMarketplace(false);
      }
    };

    loadMarketplaceProducts();
  }, []);

  // 🔥 NOVO: Estado para PCs Pré-Montados
  const [preBuiltPCs, setPreBuiltPCs] = useState<any[]>([]);
  const [currentPCIndex, setCurrentPCIndex] = useState(0);
  const [loadingPCs, setLoadingPCs] = useState(true);

  // 🔥 CARREGAR PCs PRÉ-MONTADOS DO SUPABASE
  useEffect(() => {
    const loadPreBuiltPCs = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', 'PC Completo')
          .eq('is_marketplace', false)
          .limit(6)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setPreBuiltPCs(data);
        }
      } catch (error) {
        console.error('Erro ao carregar PCs pré-montados:', error);
      } finally {
        setLoadingPCs(false);
      }
    };

    loadPreBuiltPCs();
  }, []);

  // Auto-advance PCs carousel
  useEffect(() => {
    if (preBuiltPCs.length > 0) {
      const timer = setInterval(() => {
        setCurrentPCIndex((prev) => (prev + 1) % preBuiltPCs.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [preBuiltPCs.length]);

  const nextPC = () => {
    setCurrentPCIndex((prev) => (prev + 1) % preBuiltPCs.length);
  };

  const prevPC = () => {
    setCurrentPCIndex((prev) => (prev - 1 + preBuiltPCs.length) % preBuiltPCs.length);
  };

  // Auto-advance comparisons (desktop only)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentComparisonIndex((prev) => (prev + 1) % comparisons.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleQuizAnswer = async (answer: string) => {
    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Generate recommendation
      const rec = generateRecommendation(newAnswers);
      setRecommendation(rec);
      setShowRecommendation(true);

      // Save to database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase
          .from('quiz_responses')
          .insert([
            {
              user_id: user?.id || null,
              responses: newAnswers,
              recommendation: rec
            }
          ]);
      } catch (error) {
        console.error('Erro ao salvar resposta do quiz:', error);
      }
    }
  };

  const generateRecommendation = (answers: string[]): string => {
    const [objetivo, produto, jogos, resolucao, orcamento] = answers;

    if (orcamento === "€3500+") {
      return "🏆 **PC Gaming Ultra Premium** - RTX 4090, Intel i9-13900K, 64GB DDR5, 2TB NVMe Gen4. Perfeito para 4K gaming e streaming profissional!";
    } else if (orcamento === "€2000-3500") {
      return "🎮 **PC Gaming High-End** - RTX 4080, Ryzen 7 7800X3D, 32GB DDR5, 1TB NVMe. Ideal para gaming em 1440p/4K com máxima qualidade!";
    } else if (orcamento === "€1000-2000") {
      return "💪 **PC Gaming Performance** - RTX 4070, Intel i5-13600K, 32GB DDR5, 1TB SSD. Excelente para gaming em 1440p e trabalho!";
    } else {
      return "🚀 **PC Gaming Entry** - RTX 4060, Ryzen 5 7600X, 16GB DDR5, 500GB NVMe. Perfeito para começar no gaming 1080p!";
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setQuizAnswers([]);
    setShowRecommendation(false);
    setRecommendation('');
  };

  const nextComparison = () => {
    setCurrentComparisonIndex((prev) => (prev + 1) % comparisons.length);
  };

  const prevComparison = () => {
    setCurrentComparisonIndex((prev) => (prev - 1 + comparisons.length) % comparisons.length);
  };

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  // 🔥 NOVO: Estado para Serviços
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const featuredServices = servicesMock.filter(s => s.is_featured);

  // 🔥 NOVO: Auto-advance Serviços carousel
  useEffect(() => {
    if (featuredServices.length > 0) {
      const timer = setInterval(() => {
        setCurrentServiceIndex((prev) => (prev + 1) % featuredServices.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredServices.length]);

  const nextService = () => {
    setCurrentServiceIndex((prev) => (prev + 1) % featuredServices.length);
  };

  const prevService = () => {
    setCurrentServiceIndex((prev) => (prev - 1 + featuredServices.length) % featuredServices.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <Navbar />
      
      {/* 🔥 HERO SECTION - CORRIGIDO PARA MOBILE E PC */}
      <section className="relative min-h-screen lg:h-screen flex items-center justify-center overflow-hidden">
        {/* Imagem de Fundo ORIGINAL - PC com LEDs */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=high%20end%20gaming%20PC%20tower%20with%20glowing%20RGB%20LED%20components%20visible%20through%20glass%20panel%20dark%20atmospheric%20background%20red%20and%20blue%20lighting%20effects%20professional%20product%20photography%20futuristic%20technology%20showcase&width=1920&height=1080&seq=hero-original-pc-leds-v1&orientation=landscape')`
          }}
        >
          {/* Overlay Escuro para Contraste - REDUZIDO PARA MOSTRAR MAIS A FOTO */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        </div>
        
        {/* Conteúdo Principal - OTIMIZADO PARA MOBILE */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-0">
          <div className="lg:max-w-2xl">
            {/* 🎯 JANELA PROFISSIONAL COM FUNDO 100% TRANSPARENTE */}
            <div className="bg-transparent backdrop-blur-sm rounded-2xl border-2 border-red-500/30 shadow-2xl shadow-red-500/20 p-6 sm:p-8 lg:p-10 transform hover:scale-[1.02] transition-all duration-300">
              
              {/* Badge Premium */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/40 rounded-full mb-4 backdrop-blur-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm font-bold uppercase tracking-wider">👑 Especialistas em Gaming</span>
              </div>

              {/* Título COMPLETO E VISÍVEL */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight drop-shadow-2xl">
                PCs de Alto
                <span className="block bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent mt-1 drop-shadow-2xl">
                  Desempenho
                </span>
              </h1>

              {/* Descrição */}
              <p className="text-sm sm:text-base lg:text-lg text-gray-200 mb-6 leading-relaxed drop-shadow-lg">
                Componentes premium, montagem profissional, garantia total.
                <span className="block mt-2 text-yellow-400 font-bold text-xs sm:text-sm">
                  ⚠️ Site em desenvolvimento - 100% seguro! Não hesite em contactar para dúvidas ou sugestões.
                </span>
              </p>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={() => window.REACT_APP_NAVIGATE('/montar-pc')}
                  className="group flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/40 whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-tools-fill text-lg"></i>
                  <span>MONTAR MEU PC</span>
                  <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
                </button>

                <button
                  onClick={() => window.REACT_APP_NAVIGATE('/contato')}
                  className="group flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white text-sm font-bold rounded-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transform hover:scale-105 transition-all duration-300 whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-customer-service-2-fill text-lg"></i>
                  <span>FALAR COM ESPECIALISTA</span>
                </button>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-4 gap-3 pt-6 border-t border-white/20">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-red-400 drop-shadow-lg">+100</div>
                  <div className="text-xs text-gray-300 font-medium mt-1">Produtos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-red-400 drop-shadow-lg">98%</div>
                  <div className="text-xs text-gray-300 font-medium mt-1">Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-red-400 drop-shadow-lg">24h</div>
                  <div className="text-xs text-gray-300 font-medium mt-1">Entrega</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-red-400 drop-shadow-lg">2 Anos</div>
                  <div className="text-xs text-gray-300 font-medium mt-1">Garantia</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 🔥 PRODUTOS EM DESTAQUE - TÍTULO COMPLETO E CORRIGIDO */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              🏆 Produtos em <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Destaque</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-300 font-medium">Os componentes mais procurados pelos gamers</p>
          </div>

          {loadingProducts ? (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-400">Carregando produtos...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl border border-red-500/20">
              <i className="ri-star-line text-6xl text-gray-600 mb-4"></i>
              <p className="text-gray-400 text-lg mb-2">Nenhum produto em destaque no momento.</p>
              <p className="text-gray-500 text-sm">Marque produtos como destaque no Dashboard Admin.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-product-shop>
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/produto/${product.id}`}
                    className="group bg-black/60 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-red-500/20 hover:border-red-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 cursor-pointer"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                      
                      {/* Badge de Categoria */}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black rounded-full shadow-xl">
                          ⭐ {product.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="text-lg font-black text-white mb-2 line-clamp-2 min-h-[3rem]">{product.name}</h3>
                      <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-4">
                        €{Number(product.price).toFixed(2)}
                      </p>
                      <div className="w-full px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-black rounded-lg text-center whitespace-nowrap shadow-lg group-hover:from-red-600 group-hover:to-red-700 transition-all">
                        VER PRODUTO
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-10">
                <Link
                  to="/produtos"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-black/60 backdrop-blur-sm text-white font-black rounded-xl border-2 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 shadow-xl hover:scale-105"
                >
                  <span>VER TODOS OS PRODUTOS</span>
                  <i className="ri-arrow-right-line text-xl"></i>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 🔥 NOVIDADES - NOTÍCIAS DE PRODUTOS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              🆕 <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Novidades</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-300 font-medium">Últimas notícias e lançamentos do mundo gaming</p>
          </div>

          {/* 🔥 NOTÍCIAS DE PRODUTOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Notícia 1 */}
            <div className="group bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border-2 border-green-500/20 hover:border-green-500/60 transition-all duration-300 hover:scale-105">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://readdy.ai/api/search-image?query=nvidia%20rtx%204070%20graphics%20card%20with%20green%20lighting%20gaming%20GPU%20product%20shot%20on%20dark%20background%20tech%20photography%20award%20winning&width=600&height=400&seq=news-gpu-4070-v2&orientation=landscape"
                  alt="RTX 4070 Eleita Melhor GPU"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                
                {/* Badge NOVO */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-black text-xs font-black rounded-full shadow-xl animate-pulse">
                    🆕 DESTAQUE
                  </span>
                </div>

                {/* Data */}
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                    📅 Dezembro 2024
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-black text-white mb-2 line-clamp-2">
                  RTX 4070 Eleita Melhor GPU para Gamers
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                  A NVIDIA RTX 4070 foi eleita a melhor placa gráfica para gaming em 1440p, oferecendo excelente custo-benefício e performance excepcional com DLSS 3.
                </p>
              </div>
            </div>

            {/* Notícia 2 */}
            <div className="group bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border-2 border-green-500/20 hover:border-green-500/60 transition-all duration-300 hover:scale-105">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://readdy.ai/api/search-image?query=amd%20ryzen%207%207800x3d%20processor%20with%20red%20lighting%20gaming%20CPU%20on%20motherboard%20tech%20product%20photography%20premium%20quality&width=600&height=400&seq=news-cpu-7800x3d-v2&orientation=landscape"
                  alt="Ryzen 7 7800X3D Rei do Gaming"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                
                {/* Badge NOVO */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-black text-xs font-black rounded-full shadow-xl animate-pulse">
                    🆕 DESTAQUE
                  </span>
                </div>

                {/* Data */}
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                    📅 Dezembro 2024
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-black text-white mb-2 line-clamp-2">
                  Ryzen 7 7800X3D: O Rei do Gaming
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                  O AMD Ryzen 7 7800X3D continua imbatível em gaming, oferecendo os melhores FPS em jogos competitivos e AAA graças à tecnologia 3D V-Cache.
                </p>
              </div>
            </div>

            {/* Notícia 3 */}
            <div className="group bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border-2 border-green-500/20 hover:border-green-500/60 transition-all duration-300 hover:scale-105">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://readdy.ai/api/search-image?query=DDR5%20RAM%20memory%20modules%20with%20RGB%20lighting%20high%20speed%20gaming%20memory%20sticks%20on%20dark%20background%20premium%20tech%20photography&width=600&height=400&seq=news-ddr5-ram-v2&orientation=landscape"
                  alt="DDR5 6000MHz Padrão para Gaming"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                
                {/* Badge NOVO */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-black text-xs font-black rounded-full shadow-xl animate-pulse">
                    🆕 DESTAQUE
                  </span>
                </div>

                {/* Data */}
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                    📅 Dezembro 2024
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-black text-white mb-2 line-clamp-2">
                  DDR5 6000MHz: Novo Padrão para Gaming
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                  Memórias DDR5 6000MHz CL30 se tornaram o novo padrão para PCs gaming, oferecendo o melhor equilíbrio entre performance e preço para AMD e Intel.
                </p>
              </div>
            </div>
          </div>

          {/* Botão Ver Mais Novidades - CORRIGIDO */}
          <div className="text-center mt-10">
            <Link
              to="/novidades"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black/60 backdrop-blur-sm text-white font-black rounded-xl border-2 border-green-500/50 hover:bg-green-500/10 hover:border-green-500 transition-all duration-300 shadow-xl hover:scale-105"
            >
              <span>VER MAIS NOVIDADES</span>
              <i className="ri-arrow-right-line text-xl"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* 🔥 PCs PRÉ-MONTADOS - CORRIGIDO E ORGANIZADO */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              💻 PCs <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Pré-Montados</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-300 font-medium">Configurações prontas para jogar</p>
          </div>

          {loadingPCs ? (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-400">Carregando PCs...</p>
            </div>
          ) : preBuiltPCs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">Nenhum PC pré-montado disponível no momento.</p>
            </div>
          ) : (
            <>
              {/* Desktop - Slider com Setas */}
              <div className="hidden lg:block">
                <div className="relative max-w-6xl mx-auto">
                  {/* Botão Anterior */}
                  <button
                    onClick={prevPC}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-10 w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-2xl hover:shadow-red-500/50 cursor-pointer"
                  >
                    <i className="ri-arrow-left-line text-xl font-bold"></i>
                  </button>

                  {/* PCs Visíveis (3 por vez) */}
                  <div className="grid grid-cols-3 gap-6">
                    {[0, 1, 2].map((offset) => {
                      const index = (currentPCIndex + offset) % preBuiltPCs.length;
                      const pc = preBuiltPCs[index];
                      return (
                        <Link
                          key={pc.id}
                          to={`/produto/${pc.id}`}
                          className="group bg-black/60 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-red-500/20 hover:border-red-500/60 transition-all duration-300 hover:scale-105 cursor-pointer"
                          data-product-shop
                        >
                          <div className="relative h-52 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                            <img 
                              src={pc.image_url} 
                              alt={pc.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                            
                            {/* Badge */}
                            <div className="absolute top-3 left-3">
                              <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black rounded-full shadow-xl">
                                ⚡ PC COMPLETO
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-5">
                            <h3 className="text-lg font-black text-white mb-2 line-clamp-2">{pc.name}</h3>
                            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{pc.description}</p>
                            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-4">
                              €{Number(pc.price).toFixed(2)}
                            </p>
                            <div className="w-full px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-black rounded-lg text-center whitespace-nowrap shadow-lg group-hover:from-red-600 group-hover:to-red-700 transition-all">
                              VER DETALHES
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Botão Próximo */}
                  <button
                    onClick={nextPC}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-10 w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-2xl hover:shadow-red-500/50 cursor-pointer"
                  >
                    <i className="ri-arrow-right-line text-xl font-bold"></i>
                  </button>

                  {/* Indicadores */}
                  <div className="flex justify-center gap-2 mt-6">
                    {preBuiltPCs.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPCIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          index === currentPCIndex ? 'bg-red-500 w-6' : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet - Scroll Horizontal */}
              <div className="lg:hidden">
                <div className="overflow-x-auto scrollbar-hide pb-4">
                  <div className="flex gap-4" style={{ width: `${preBuiltPCs.length * 85}vw` }}>
                    {preBuiltPCs.map((pc) => (
                      <Link
                        key={pc.id}
                        to={`/produto/${pc.id}`}
                        className="group bg-black/60 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-red-500/20 flex-shrink-0 cursor-pointer"
                        style={{ width: '85vw' }}
                      >
                        <div className="relative h-48 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                          <img 
                            src={pc.image_url} 
                            alt={pc.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                          
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black rounded-full shadow-xl">
                              ⚡ PC COMPLETO
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <h3 className="text-lg font-black text-white mb-2 line-clamp-2">{pc.name}</h3>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{pc.description}</p>
                          <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-4">
                            €{Number(pc.price).toFixed(2)}
                          </p>
                          <div className="w-full px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-black rounded-lg text-center whitespace-nowrap shadow-lg">
                            VER DETALHES
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <p className="text-center text-sm text-gray-400 mt-4">← Deslize para ver mais →</p>
              </div>

              {/* Botão Ver Todos */}
              <div className="text-center mt-10">
                <Link
                  to="/produtos?category=PC+Completo"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-black/60 backdrop-blur-sm text-white font-black rounded-xl border-2 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 shadow-xl hover:scale-105"
                >
                  <span>VER TODOS OS PCs</span>
                  <i className="ri-arrow-right-line text-xl"></i>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 🔥 NOVO: SEÇÃO DE SERVIÇOS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              🛠️ Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Serviços</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-300 font-medium">Soluções completas em tecnologia para você</p>
          </div>

          {/* Desktop - Carrossel com 3 serviços */}
          <div className="hidden lg:block">
            <div className="relative max-w-6xl mx-auto">
              {/* Botão Anterior */}
              <button
                onClick={prevService}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-10 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-2xl hover:shadow-blue-500/50 cursor-pointer"
              >
                <i className="ri-arrow-left-line text-xl font-bold"></i>
              </button>

              {/* Serviços Visíveis (3 por vez) */}
              <div className="grid grid-cols-3 gap-6">
                {[0, 1, 2].map((offset) => {
                  const index = (currentServiceIndex + offset) % featuredServices.length;
                  const service = featuredServices[index];
                  return (
                    <div
                      key={service.id}
                      className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-blue-500/20 hover:border-blue-500/60 transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                      <div className="relative h-52 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                        <img 
                          src={service.image_url} 
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        
                        {/* Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-black rounded-full shadow-xl">
                            {service.category}
                          </span>
                        </div>

                        {/* Badge Grátis */}
                        {service.is_free && (
                          <div className="absolute top-3 right-3">
                            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-black rounded-full shadow-xl">
                              🆓 GRÁTIS
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <i className={`${service.icon} text-2xl text-white`}></i>
                          </div>
                          <h3 className="text-lg font-black text-white line-clamp-2 flex-1">{service.title}</h3>
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-4 line-clamp-3">{service.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                            {service.is_free ? 'GRÁTIS' : `€${service.price}`}
                          </p>
                        </div>

                        <div className="w-full px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black rounded-lg text-center whitespace-nowrap shadow-lg group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                          SABER MAIS
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botão Próximo */}
              <button
                onClick={nextService}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-10 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-2xl hover:shadow-blue-500/50 cursor-pointer"
              >
                <i className="ri-arrow-right-line text-xl font-bold"></i>
              </button>

              {/* Indicadores */}
              <div className="flex justify-center gap-2 mt-6">
                {featuredServices.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentServiceIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      index === currentServiceIndex ? 'bg-blue-500 w-6' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet - Scroll Horizontal */}
          <div className="lg:hidden">
            <div className="overflow-x-auto scrollbar-hide pb-4">
              <div className="flex gap-4" style={{ width: `${featuredServices.length * 85}vw` }}>
                {featuredServices.map((service) => (
                  <div
                    key={service.id}
                    className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-blue-500/20 flex-shrink-0 cursor-pointer"
                    style={{ width: '85vw' }}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                      <img 
                        src={service.image_url} 
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                      
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-black rounded-full shadow-xl">
                          {service.category}
                        </span>
                      </div>

                      {service.is_free && (
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-black rounded-full shadow-xl">
                            🆓 GRÁTIS
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <i className={`${service.icon} text-2xl text-white`}></i>
                        </div>
                        <h3 className="text-lg font-black text-white line-clamp-2 flex-1">{service.title}</h3>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-4 line-clamp-3">{service.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                          {service.is_free ? 'GRÁTIS' : `€${service.price}`}
                        </p>
                      </div>

                      <div className="w-full px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black rounded-lg text-center whitespace-nowrap shadow-lg">
                        SABER MAIS
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">← Deslize para ver mais →</p>
          </div>

          {/* Botão Ver Todos os Serviços */}
          <div className="text-center mt-10">
            <Link
              to="/servicos"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black/60 backdrop-blur-sm text-white font-black rounded-xl border-2 border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-500 transition-all duration-300 shadow-xl hover:scale-105"
            >
              <span>VER TODOS OS SERVIÇOS</span>
              <i className="ri-arrow-right-line text-xl"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* NOVO: Produtos do Marketplace - VENDEDORES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              🏪 Produtos do <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Marketplace</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-300 font-medium">Produtos de vendedores verificados</p>
          </div>

          {loadingMarketplace ? (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-400">Carregando produtos do marketplace...</p>
            </div>
          ) : marketplaceProducts.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl border border-purple-500/20">
              <i className="ri-store-line text-6xl text-gray-600 mb-4"></i>
              <p className="text-gray-400 text-lg mb-2">Nenhum produto de vendedor disponível no momento.</p>
              <p className="text-gray-500 text-sm">Em breve teremos produtos de vendedores verificados.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-product-shop>
                {marketplaceProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/produto/${product.id}`}
                    className="group bg-black/60 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-purple-500/20 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 cursor-pointer"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                      
                      {/* Badge de Marketplace */}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-black rounded-full shadow-xl">
                          🏪 MARKETPLACE
                        </span>
                      </div>

                      {/* Badge de Categoria */}
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      {/* Vendedor */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {(product.seller_name || 'V').charAt(0).toUpperCase()}
                        </div>
                        <p className="text-xs text-gray-400 font-medium truncate">
                          {product.seller_name || 'Vendedor'}
                        </p>
                      </div>

                      <h3 className="text-lg font-black text-white mb-2 line-clamp-2 min-h-[3rem]">{product.name}</h3>
                      <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-4">
                        €{Number(product.price).toFixed(2)}
                      </p>
                      <div className="w-full px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-black rounded-lg text-center whitespace-nowrap shadow-lg group-hover:from-purple-600 group-hover:to-purple-700 transition-all">
                        VER PRODUTO
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-10">
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-black/60 backdrop-blur-sm text-white font-black rounded-xl border-2 border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-500 transition-all duration-300 shadow-xl hover:scale-105"
                >
                  <span>VER TODOS OS PRODUTOS DO MARKETPLACE</span>
                  <i className="ri-arrow-right-line text-xl"></i>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Quiz - Encontre o Seu PC Ideal */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-500/10 to-red-600/10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                🎯 Encontre o Seu <span className="text-red-400">PC Ideal</span>
              </h2>
              <p className="text-lg text-gray-300">Responda 6 perguntas rápidas e receba uma recomendação personalizada</p>
            </div>

            {!showRecommendation ? (
              <div>
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Pergunta {currentQuestionIndex + 1} de {quizQuestions.length}</span>
                    <span>{Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Question */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    {quizQuestions[currentQuestionIndex].question}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuizAnswer(option)}
                        className="p-4 bg-black/60 text-white rounded-lg border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 transition-all duration-300 font-medium text-left"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-trophy-line text-3xl text-white"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Recomendação Personalizada</h3>
                  <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-lg p-6 mb-6 border border-red-500/30">
                    <p className="text-lg text-white" dangerouslySetInnerHTML={{ __html: recommendation.replace(/\*\*(.*?)\*\*/g, '<strong class="text-red-400">$1</strong>') }}></p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/montar-pc')}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 whitespace-nowrap"
                  >
                    💻 Montar Este PC
                  </button>
                  <button
                    onClick={resetQuiz}
                    className="px-8 py-3 bg-black/60 text-white font-bold rounded-lg border border-red-500/30 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 whitespace-nowrap"
                  >
                    🔄 Fazer Novo Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Comparações Detalhadas */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              ⚖️ Comparações <span className="text-red-400">Detalhadas</span>
            </h2>
            <p className="text-lg text-gray-300">Veja lado a lado as diferenças entre configurações</p>
          </div>

          {/* Desktop - Com setas */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20">
                {/* Botões de navegação */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={prevComparison}
                    className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all duration-300 border border-red-500/30 cursor-pointer"
                  >
                    <i className="ri-arrow-left-line text-xl"></i>
                  </button>
                  
                  <h3 className="text-2xl font-bold text-white">
                    {comparisons[currentComparisonIndex].title}
                  </h3>
                  
                  <button
                    onClick={nextComparison}
                    className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all duration-300 border border-red-500/30 cursor-pointer"
                  >
                    <i className="ri-arrow-right-line text-xl"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <img
                      src={comparisons[currentComparisonIndex].image}
                      alt={comparisons[currentComparisonIndex].title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-4">
                    {Object.entries(comparisons[currentComparisonIndex].specs).map(([key, value]) => (
                      <div key={key} className="bg-black/40 rounded-lg p-4">
                        <p className="text-red-400 font-bold capitalize mb-1">{key}</p>
                        <p className="text-white">{value}</p>
                      </div>
                    ))}
                    <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-lg p-4 border border-red-500/30">
                      <p className="text-red-400 font-bold mb-1">Preço Estimado</p>
                      <p className="text-2xl font-bold text-white">€{comparisons[currentComparisonIndex].price}</p>
                    </div>
                  </div>
                </div>

                {/* Indicadores */}
                <div className="flex justify-center gap-2 mt-6">
                  {comparisons.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentComparisonIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        index === currentComparisonIndex ? 'bg-red-500' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile - Scroll horizontal */}
          <div className="lg:hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 pb-4" style={{ width: `${comparisons.length * 85}vw` }}>
                {comparisons.map((comparison, index) => (
                  <div
                    key={comparison.id}
                    className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-red-500/20 flex-shrink-0"
                    style={{ width: '85vw' }}
                  >
                    <h3 className="text-xl font-bold text-white mb-4">{comparison.title}</h3>
                    <img
                      src={comparison.image}
                      alt={comparison.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <div className="space-y-3">
                      {Object.entries(comparison.specs).map(([key, value]) => (
                        <div key={key} className="bg-black/40 rounded-lg p-3">
                          <p className="text-red-400 font-bold capitalize text-sm mb-1">{key}</p>
                          <p className="text-white text-sm">{value}</p>
                        </div>
                      ))}
                      <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-lg p-3 border border-red-500/30">
                        <p className="text-red-400 font-bold text-sm mb-1">Preço</p>
                        <p className="text-xl font-bold text-white">€{comparison.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">← Deslize para ver mais →</p>
          </div>

          {/* 🔥 NOVO: Botão Ver Todas as Comparações */}
          <div className="text-center mt-10">
            <Link
              to="/comparacoes"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black/60 backdrop-blur-sm text-white font-black rounded-xl border-2 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 shadow-xl hover:scale-105"
            >
              <span>VER TODAS AS COMPARAÇÕES</span>
              <i className="ri-arrow-right-line text-xl"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* 🔥 LOGOS DE CONFIANÇA - NOVO */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              🛡️ <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Confiança e Segurança</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-300 font-medium">Sua compra 100% protegida</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Pagamento Seguro */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-red-500/20 hover:border-red-500/50 transition-all hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-secure-payment-line text-3xl text-white"></i>
                </div>
                <h3 className="text-white font-bold mb-2">Pagamento Seguro</h3>
                <p className="text-gray-400 text-sm">SSL Certificado</p>
              </div>
            </div>

            {/* Garantia 2 Anos */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-red-500/20 hover:border-red-500/50 transition-all hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-shield-check-line text-3xl text-white"></i>
                </div>
                <h3 className="text-white font-bold mb-2">Garantia 2 Anos</h3>
                <p className="text-gray-400 text-sm">Produtos Certificados</p>
              </div>
            </div>

            {/* Devolução 14 Dias */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-red-500/20 hover:border-red-500/50 transition-all hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-arrow-go-back-line text-3xl text-white"></i>
                </div>
                <h3 className="text-white font-bold mb-2">Devolução 14 Dias</h3>
                <p className="text-gray-400 text-sm">Sem Perguntas</p>
              </div>
            </div>

            {/* Suporte 24/7 */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-red-500/20 hover:border-red-500/50 transition-all hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-customer-service-2-line text-3xl text-white"></i>
                </div>
                <h3 className="text-white font-bold mb-2">Suporte 24/7</h3>
                <p className="text-gray-400 text-sm">Sempre Disponível</p>
              </div>
            </div>
          </div>

          {/* Métodos de Pagamento */}
          <div className="mt-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-red-500/20">
            <h3 className="text-center text-xl font-bold text-white mb-6">Métodos de Pagamento Aceitos</h3>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <i className="fab fa-cc-visa text-4xl text-blue-600"></i>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <i className="fab fa-cc-mastercard text-4xl text-red-600"></i>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <i className="fab fa-apple-pay text-4xl text-black"></i>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <i className="fab fa-google-pay text-4xl text-blue-500"></i>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <i className="fab fa-cc-paypal text-4xl text-blue-700"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
