import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { servicesMock, Service } from '../../mocks/services';

export default function ServicosPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>(servicesMock);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🔥 NOVO: Estados para Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 10;

  // Filtrar serviços
  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 🔥 NOVO: Paginação
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

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

  // 🔥 NOVO: Resetar página ao mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  // Obter categorias únicas
  const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden mt-16">
        <div className="absolute inset-0 z-0">
          <img
            src="https://readdy.ai/api/search-image?query=professional%20tech%20services%20digital%20workspace%20coding%20development%20dark%20background%20modern&width=1920&height=1080&seq=servicos-hero&orientation=landscape"
            alt="Serviços"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full">
              <i className="ri-service-line text-black"></i>
              <span className="text-black font-bold text-sm">Serviços Profissionais</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
              Soluções Tecnológicas<br />Completas
            </h1>

            <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Desenvolvimento web, apps mobile, automação, segurança e muito mais. Transforme suas ideias em realidade com nossa expertise.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar serviços..."
                  className="w-full px-6 py-4 pl-14 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all"
                />
                <i className="ri-search-line absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-gray-400"></i>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <p className="text-3xl font-bold text-red-500">40+</p>
                <p className="text-sm text-gray-400">Serviços</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <p className="text-3xl font-bold text-red-500">5+</p>
                <p className="text-sm text-gray-400">Anos Experiência</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <p className="text-3xl font-bold text-red-500">100%</p>
                <p className="text-sm text-gray-400">Satisfação</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <div className="bg-black/60 backdrop-blur-xl border-y border-white/10 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-black shadow-lg scale-105'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {category === 'all' ? 'Todos' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 🔥 NOVO: Contador de Resultados */}
        <div className="mb-6 text-center">
          <p className="text-gray-400">
            Mostrando <span className="text-white font-bold">{indexOfFirstService + 1}</span> - <span className="text-white font-bold">{Math.min(indexOfLastService, filteredServices.length)}</span> de <span className="text-white font-bold">{filteredServices.length}</span> serviços
          </p>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <i className="ri-search-line text-6xl text-gray-600 mb-4"></i>
            <h3 className="text-2xl font-bold text-white mb-2">Nenhum serviço encontrado</h3>
            <p className="text-gray-400">Tente ajustar os filtros ou buscar por outro termo</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-white/10 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      {service.is_free ? (
                        <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                          GRÁTIS
                        </span>
                      ) : service.is_featured ? (
                        <span className="bg-gradient-to-r from-red-500 to-red-600 text-black px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                          ⭐ DESTAQUE
                        </span>
                      ) : null}
                    </div>

                    {/* Icon */}
                    <div className="absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-xl">
                      <i className={`${service.icon} text-2xl text-black`}></i>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 flex-1">
                        {service.title}
                      </h3>
                    </div>

                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                      {service.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {service.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                          <i className="ri-checkbox-circle-fill text-red-500 flex-shrink-0"></i>
                          <span className="line-clamp-1">{feature}</span>
                        </div>
                      ))}
                      {service.features.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                          +{service.features.length - 3} mais funcionalidades
                        </p>
                      )}
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        {service.is_free ? (
                          <p className="text-2xl font-bold text-green-500">GRÁTIS</p>
                        ) : (
                          <>
                            <p className="text-xs text-gray-500">A partir de</p>
                            <p className="text-3xl font-bold text-red-500">€{service.price}</p>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => navigate('/contato')}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-black font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:scale-105 whitespace-nowrap"
                      >
                        Solicitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 🔥 NOVO: Paginação */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {/* Botão Anterior */}
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
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
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-black shadow-lg'
                          : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
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
                  className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                >
                  <i className="ri-arrow-right-line"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Não encontrou o que procura?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Entre em contato conosco e vamos criar uma solução personalizada para você!
          </p>
          
          {/* 🔥 NOVO: Informações sobre Prazos e Devoluções */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border-2 border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Prazos */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <i className="ri-time-line text-xl"></i>
                  ⏱️ Prazos de Entrega
                </h3>
                <ul className="space-y-2 text-sm text-red-100">
                  <li>📧 <strong>Serviços Simples:</strong> 1-2 dias</li>
                  <li>💻 <strong>Projetos Médios:</strong> 1-4 semanas</li>
                  <li>🏢 <strong>Projetos Complexos:</strong> 1-3 meses</li>
                  <li>💰 <strong>Preços:</strong> Totalmente negociáveis</li>
                </ul>
              </div>
              
              {/* Devolução */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <i className="ri-arrow-go-back-line text-xl"></i>
                  🔄 Política de Devolução
                </h3>
                <ul className="space-y-2 text-sm text-red-100">
                  <li>✅ <strong>Garantia:</strong> 100% satisfação</li>
                  <li>📅 <strong>Prazo:</strong> Até 14 dias</li>
                  <li>💯 <strong>Sem Riscos:</strong> Devolução sem problemas</li>
                  <li>🛡️ <strong>Seguro:</strong> Seu dinheiro de volta</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/contato')}
              className="px-8 py-4 bg-white text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors shadow-xl hover:scale-105 whitespace-nowrap"
            >
              <i className="ri-mail-line mr-2"></i>
              Enviar Mensagem
            </button>
            <a
              href="https://wa.me/352621717862"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-xl hover:scale-105 whitespace-nowrap"
            >
              <i className="ri-whatsapp-line mr-2"></i>
              WhatsApp Direto
            </a>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-black/60 backdrop-blur-xl py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <i className="ri-shield-check-line text-4xl text-black"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Garantia de Qualidade</h3>
              <p className="text-gray-400">
                Todos os projetos com garantia e suporte técnico incluído
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <i className="ri-time-line text-4xl text-black"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Entrega Rápida</h3>
              <p className="text-gray-400">
                Prazos cumpridos e comunicação constante durante o projeto
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <i className="ri-customer-service-2-line text-4xl text-black"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Suporte Dedicado</h3>
              <p className="text-gray-400">
                Atendimento personalizado e suporte técnico vitalício
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
