import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { newsMock } from '../../mocks/news';

interface News {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string;
  is_published: boolean;
  created_at: string;
}

export default function NovidadesPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 NOVO: Estados para Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 10;

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 🔥 SE NÃO HOUVER NOTÍCIAS NO SUPABASE, USAR MOCK DATA
      if (!data || data.length === 0) {
        setNews(newsMock);
      } else {
        setNews(data);
      }
    } catch (error) {
      console.error('Erro ao carregar novidades:', error);
      // 🔥 EM CASO DE ERRO, USAR MOCK DATA
      setNews(newsMock);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NOVO: Paginação
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = news.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(news.length / newsPerPage);

  // 🔥 NOVO: Funções de Paginação
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6">Novidades & Notícias</h1>
              <p className="text-xl text-red-100 max-w-3xl mx-auto">
                Fique por dentro das últimas novidades do mundo tech, reviews de produtos e dicas exclusivas
              </p>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20">
              <i className="ri-newspaper-line text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Nenhuma novidade encontrada</h3>
              <p className="text-gray-600">Em breve teremos novidades para você!</p>
            </div>
          ) : (
            <>
              {/* 🔥 NOVO: Contador de Resultados */}
              <div className="mb-6 text-center">
                <p className="text-gray-600">
                  Mostrando <span className="text-gray-900 font-bold">{indexOfFirstNews + 1}</span> - <span className="text-gray-900 font-bold">{Math.min(indexOfLastNews, news.length)}</span> de <span className="text-gray-900 font-bold">{news.length}</span> notícias
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentNews.map((item) => (
                  <article
                    key={item.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                          Geral
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <i className="ri-calendar-line"></i>
                        <span>{new Date(item.created_at).toLocaleDateString('pt-PT', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}</span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {item.content}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              {/* 🔥 NOVO: Paginação */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {/* Botão Anterior */}
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="ri-arrow-left-line"></i>
                  </button>

                  {/* Números de Página */}
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Botão Próximo */}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Não perca nenhuma novidade!</h2>
            <p className="text-xl text-red-100 mb-8">
              Subscreva a nossa newsletter e receba as últimas notícias diretamente no seu email
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
              <input
                type="email"
                placeholder="O seu email"
                className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-300"
              />
              <button className="px-8 py-4 bg-white text-red-600 rounded-full font-bold hover:bg-red-50 transition-colors whitespace-nowrap cursor-pointer">
                Subscrever Agora
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
