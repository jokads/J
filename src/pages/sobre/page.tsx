import { useEffect, useState } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { supabase } from '../../lib/supabase';

interface Founder {
  id: string;
  name: string;
  role: string;
  description: string;
  contact_email: string;
  whatsapp: string;
  image_url: string | null;
  order_index: number;
}

interface CompanyInfo {
  id: string;
  section: string;
  title: string;
  description: string;
  images: string[];
  content: {
    years: string;
    clients: string;
    products: string;
    languages: string;
  };
}

export default function Sobre() {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar fundadores
      const { data: foundersData, error: foundersError } = await supabase
        .from('founders')
        .select('*')
        .order('order_index', { ascending: true });

      if (foundersError) throw foundersError;
      setFounders(foundersData || []);

      // Carregar informações da empresa
      const { data: companyData, error: companyError } = await supabase
        .from('company_info')
        .select('*')
        .eq('section', 'nossa_historia')
        .single();

      if (companyError) throw companyError;
      setCompanyInfo(companyData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para gerar iniciais
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return name.charAt(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <Navbar />

      <div className="pt-16">
        {/* Hero */}
        <div className="relative h-96 overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <img
              src="https://readdy.ai/api/search-image?query=modern%20tech%20company%20office%20with%20premium%20computer%20hardware%20components%20displayed%2C%20professional%20business%20environment%2C%20black%20and%20gold%20color%20scheme%2C%20luxury%20technology%20showcase%2C%20clean%20minimalist%20design&width=1920&height=600&seq=abouthero1&orientation=landscape"
              alt="Sobre JokaTech"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/50"></div>
          </div>
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 mb-6">
                <i className="ri-building-line text-red-400"></i>
                <span className="text-red-400 font-medium">SOBRE A JOKATECH</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                Sua loja de confiança para<br />componentes premium de PC
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Excelência, qualidade e segurança em cada produto
              </p>
            </div>
          </div>
        </div>

        {/* Nossa História */}
        <div className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative overflow-hidden rounded-2xl border border-red-500/30">
                  <img
                    src={companyInfo?.images?.[0] || "https://readdy.ai/api/search-image?query=modern%20luxury%20technology%20company%20office%20interior%20with%20premium%20computer%20hardware%20displays%20sophisticated%20dark%20corporate%20environment%20with%20golden%20accents%20professional%20business%20workspace%20elegant%20tech%20showcase%20minimalist%20design%20no%20people%20empty%20office&width=800&height=600&seq=companyhistory2024v2&orientation=landscape"}
                    alt="História JokaTech"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 mb-6">
                  <i className="ri-history-line text-red-400"></i>
                  <span className="text-red-400 font-medium">NOSSA HISTÓRIA</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  {companyInfo?.title || 'Paixão pela Tecnologia, Compromisso com a Excelência'}
                </h2>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed whitespace-pre-line">
                  {companyInfo?.description || 'A JokaTech nasceu da paixão pela tecnologia e do desejo de oferecer aos entusiastas de PC os melhores componentes de hardware do mercado.'}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-red-500/30">
                    <i className="ri-shield-check-line text-red-400 text-xl"></i>
                    <span className="text-white font-medium">Produtos Certificados</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-red-500/30">
                    <i className="ri-secure-payment-line text-red-400 text-xl"></i>
                    <span className="text-white font-medium">Pagamento Seguro</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-red-500/30">
                    <i className="ri-customer-service-2-line text-red-400 text-xl"></i>
                    <span className="text-white font-medium">Suporte Premium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 mb-6">
                <i className="ri-bar-chart-line text-red-400"></i>
                <span className="text-red-400 font-medium">NOSSOS NÚMEROS</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Resultados que Falam por Si
              </h2>
              <p className="text-gray-300 text-lg">
                Confiança construída através de excelência e dedicação
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* +5 Anos */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-red-500/30 hover:border-red-500 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 mb-4 group-hover:rotate-12 transition-transform duration-300">
                    <i className="ri-time-line text-3xl text-white"></i>
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-2">
                    {companyInfo?.content?.years || '+5'}
                  </div>
                  <div className="text-white font-semibold text-lg mb-1">Anos de</div>
                  <div className="text-gray-400">Experiência</div>
                </div>
              </div>

              {/* +50 Clientes */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-red-500/30 hover:border-red-500 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 mb-4 group-hover:rotate-12 transition-transform duration-300">
                    <i className="ri-user-heart-line text-3xl text-white"></i>
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-2">
                    {companyInfo?.content?.clients || '+50'}
                  </div>
                  <div className="text-white font-semibold text-lg mb-1">Clientes</div>
                  <div className="text-gray-400">Satisfeitos</div>
                </div>
              </div>

              {/* +15.000 Produtos */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-red-500/30 hover:border-red-500 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 mb-4 group-hover:rotate-12 transition-transform duration-300">
                    <i className="ri-shield-check-line text-3xl text-white"></i>
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-2">
                    {companyInfo?.content?.products || '+15K'}
                  </div>
                  <div className="text-white font-semibold text-lg mb-1">Produtos</div>
                  <div className="text-gray-400">Selecionados</div>
                </div>
              </div>

              {/* Atendimento Global */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-red-500/30 hover:border-red-500 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 mb-4 group-hover:rotate-12 transition-transform duration-300">
                    <i className="ri-global-line text-3xl text-white"></i>
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-2">
                    {companyInfo?.content?.languages || '20+'}
                  </div>
                  <div className="text-white font-semibold text-lg mb-1">Idiomas</div>
                  <div className="text-gray-400">Disponíveis</div>
                  <div className="mt-3 flex flex-wrap gap-1 justify-center">
                    <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">PT</span>
                    <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">FR</span>
                    <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">DE</span>
                    <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">EN</span>
                    <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">+16</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fundadores */}
        <div className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 mb-6">
                <i className="ri-team-line text-red-400"></i>
                <span className="text-red-400 font-medium">NOSSA LIDERANÇA</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Conheça Nossos Fundadores
              </h2>
              <p className="text-gray-300 text-lg">
                A visão e dedicação por trás da JokaTech
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Claudio Pereira */}
              <div className="group relative">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 group-hover:border-red-500 transition-all duration-300 hover:scale-105">
                  {/* Avatar com iniciais */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4 shadow-2xl shadow-red-500/50">
                      <span className="text-7xl font-bold text-black">CP</span>
                    </div>
                    
                    {/* Badge de cargo */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 mb-2">
                      <i className="ri-vip-crown-line text-black"></i>
                      <span className="text-black font-bold text-sm">CEO & FUNDADOR</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">Claudio Pereira</h3>
                  </div>

                  <p className="text-gray-300 text-center mb-6 leading-relaxed">
                    Programador e desenvolvedor principal da JokaTech. Especialista em desenvolvimento web, 
                    gestão de sistemas e integração de tecnologias. Responsável por toda a arquitetura técnica 
                    do site, programação, vendas e estratégias de crescimento. Visionário por trás da plataforma 
                    e líder em inovação tecnológica.
                  </p>

                  {/* Especialidades */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                      Programação
                    </span>
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                      Desenvolvimento Web
                    </span>
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                      Vendas
                    </span>
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                      Gestão Técnica
                    </span>
                  </div>

                  {/* Contatos */}
                  <div className="flex gap-4 justify-center">
                    <a
                      href="mailto:jokadas69@gmail.com"
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-black font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/50"
                    >
                      <i className="ri-mail-line"></i>
                      <span>Email</span>
                    </a>
                    <a
                      href="https://wa.me/352621717862"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-green-500/50"
                    >
                      <i className="ri-whatsapp-line"></i>
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Mariana Pereira */}
              <div className="group relative">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 group-hover:border-red-500 transition-all duration-300 hover:scale-105">
                  {/* Avatar com iniciais */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4 shadow-2xl shadow-red-500/50">
                      <span className="text-7xl font-bold text-black">MP</span>
                    </div>
                    
                    {/* Badge de cargo */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 mb-2">
                      <i className="ri-vip-crown-line text-black"></i>
                      <span className="text-black font-bold text-sm">COO & CO-FUNDADORA</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">Mariana Pereira</h3>
                  </div>

                  <p className="text-gray-300 text-center mb-6 leading-relaxed">
                    Co-fundadora e gerente de operações da JokaTech. Especialista em atendimento ao cliente, 
                    gestão de relacionamentos e coordenação de equipes. Responsável por garantir a excelência 
                    no suporte, gerenciar toda a comunicação com clientes e supervisionar as operações diárias. 
                    Parceira essencial na criação e crescimento da plataforma.
                  </p>

                  {/* Especialidades */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                      Atendimento ao Cliente
                    </span>
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                      Gestão de Operações
                    </span>
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                      Relacionamento
                    </span>
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                      Coordenação
                    </span>
                  </div>

                  {/* Contatos */}
                  <div className="flex gap-4 justify-center">
                    <a
                      href="mailto:jokadaskz69@gmail.com"
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-black font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/50"
                    >
                      <i className="ri-mail-line"></i>
                      <span>Email</span>
                    </a>
                    <a
                      href="https://wa.me/352621377168"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-green-500/50"
                    >
                      <i className="ri-whatsapp-line"></i>
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 mb-6">
                <i className="ri-heart-line text-red-400"></i>
                <span className="text-red-400 font-medium">NOSSOS VALORES</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                O que nos Move
              </h2>
              <p className="text-gray-300 text-lg">
                Princípios que guiam cada decisão e ação
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Qualidade Premium */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-red-500/30 hover:border-red-500 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 mb-6 group-hover:rotate-12 transition-transform duration-300">
                    <i className="ri-medal-line text-3xl text-white"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Qualidade Premium</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Selecionamos rigorosamente cada produto para garantir que você receba apenas o melhor. Produtos certificados e testados para máxima performance.
                  </p>
                </div>
              </div>

              {/* Segurança Total */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-red-500/30 hover:border-red-500 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 mb-6 group-hover:rotate-12 transition-transform duration-300">
                    <i className="ri-shield-check-line text-3xl text-white"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Segurança Total</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Pagamentos 100% seguros com criptografia avançada. Seus dados e transações estão protegidos com a mais alta tecnologia de segurança.
                  </p>
                </div>
              </div>

              {/* Atendimento Excepcional */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-red-500/30 hover:border-red-500 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 mb-6 group-hover:rotate-12 transition-transform duration-300">
                    <i className="ri-customer-service-2-line text-3xl text-white"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Atendimento Excepcional</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Suporte multilíngue disponível 24/7. Nossa equipe está sempre pronta para ajudar você em mais de 20 idiomas diferentes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-12 border border-red-500/30">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 mb-6">
                  <i className="ri-rocket-line text-red-400"></i>
                  <span className="text-red-400 font-medium">JUNTE-SE A NÓS</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Pronto para Começar?
                </h2>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                  Descubra nossa seleção premium de componentes e monte o PC dos seus sonhos com a garantia de qualidade e segurança da JokaTech.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <a
                    href="/produtos"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/50 whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-shopping-bag-line text-xl"></i>
                    Ver Produtos
                  </a>
                  <a
                    href="/contato"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-red-500/30 text-white font-semibold hover:bg-red-500 hover:border-red-500 transition-all duration-300 whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-customer-service-2-line text-xl"></i>
                    Falar Conosco
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 NOVO: LOGOS DE CONFIANÇA E SEGURANÇA */}
        <div className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 mb-6">
                <i className="ri-shield-check-line text-red-400"></i>
                <span className="text-red-400 font-medium">CONFIANÇA E SEGURANÇA</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Sua Compra 100% Protegida
              </h2>
              <p className="text-gray-300 text-lg">
                Garantias e certificações que protegem você
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {/* Pagamento Seguro */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-red-500/20 hover:border-red-500/50 transition-all hover:scale-105">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-secure-payment-line text-3xl text-white"></i>
                  </div>
                  <h3 className="text-white font-bold mb-2">Pagamento Seguro</h3>
                  <p className="text-gray-400 text-sm">SSL & Stripe</p>
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

            {/* 🔥 NOVO: AVALIAÇÕES DE CLIENTES COM AS 5 FOTOS */}
            <div className="mb-12">
              <h3 className="text-center text-2xl font-bold text-white mb-8">
                ⭐ Avaliações de Clientes Reais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Avaliação 1 - Foto Original */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-green-500/30 hover:border-green-500/60 transition-all hover:scale-105 cursor-pointer group">
                  <img 
                    src="https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/cef7a3be4651d149556fb3a2b2dea456.png"
                    alt="Avaliação Cliente 1"
                    className="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="p-4 bg-green-500/10 border-t border-green-500/30 text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 text-2xl">
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                    </div>
                    <p className="text-green-400 font-bold mt-2">5/5 Estrelas</p>
                  </div>
                </div>

                {/* Avaliação 2 - Segunda Foto */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-green-500/30 hover:border-green-500/60 transition-all hover:scale-105 cursor-pointer group">
                  <img 
                    src="https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/6a38d8e070aba7139314f49a7d22b316.png"
                    alt="Avaliação Cliente 2"
                    className="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="p-4 bg-green-500/10 border-t border-green-500/30 text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 text-2xl">
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                    </div>
                    <p className="text-green-400 font-bold mt-2">5/5 Estrelas</p>
                  </div>
                </div>

                {/* Avaliação 3 - Terceira Foto */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-green-500/30 hover:border-green-500/60 transition-all hover:scale-105 cursor-pointer group">
                  <img 
                    src="https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/bbf87525ab7e45c10ee41dd0176b1297.png"
                    alt="Avaliação Cliente 3"
                    className="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="p-4 bg-green-500/10 border-t border-green-500/30 text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 text-2xl">
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                    </div>
                    <p className="text-green-400 font-bold mt-2">5/5 Estrelas</p>
                  </div>
                </div>

                {/* Avaliação 4 - Quarta Foto */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-green-500/30 hover:border-green-500/60 transition-all hover:scale-105 cursor-pointer group">
                  <img 
                    src="https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/6647f04199bf834554a8b592ce632f29.png"
                    alt="Avaliação Cliente 4"
                    className="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="p-4 bg-green-500/10 border-t border-green-500/30 text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 text-2xl">
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                    </div>
                    <p className="text-green-400 font-bold mt-2">5/5 Estrelas</p>
                  </div>
                </div>

                {/* Avaliação 5 - Quinta Foto */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-green-500/30 hover:border-green-500/60 transition-all hover:scale-105 cursor-pointer group">
                  <img 
                    src="https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/4d238becfdbab89087e5f38ae82898c7.png"
                    alt="Avaliação Cliente 5"
                    className="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="p-4 bg-green-500/10 border-t border-green-500/30 text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 text-2xl">
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                    </div>
                    <p className="text-green-400 font-bold mt-2">5/5 Estrelas</p>
                  </div>
                </div>

                {/* Avaliação 6 - Sexta Foto */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-green-500/30 hover:border-green-500/60 transition-all hover:scale-105 cursor-pointer group">
                  <img 
                    src="https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/dbd0f2f96d82b005050e778384b524be.png"
                    alt="Avaliação Cliente 6"
                    className="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="p-4 bg-green-500/10 border-t border-green-500/30 text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 text-2xl">
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                    </div>
                    <p className="text-green-400 font-bold mt-2">5/5 Estrelas</p>
                  </div>
                </div>
              </div>

              {/* Badge de Confiança */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-xl">
                  <i className="ri-verified-badge-fill text-3xl text-green-400"></i>
                  <div className="text-left">
                    <p className="text-white font-bold text-lg">+50 Avaliações Positivas</p>
                    <p className="text-green-400 text-sm">98% de Satisfação dos Clientes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Métodos de Pagamento */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-red-500/20">
              <h3 className="text-center text-xl font-bold text-white mb-6">Métodos de Pagamento Aceitos</h3>
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="bg-white rounded-lg p-4 shadow-lg hover:scale-110 transition-transform">
                  <i className="fab fa-cc-visa text-4xl text-blue-600"></i>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-lg hover:scale-110 transition-transform">
                  <i className="fab fa-cc-mastercard text-4xl text-red-600"></i>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-lg hover:scale-110 transition-transform">
                  <i className="fab fa-apple-pay text-4xl text-black"></i>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-lg hover:scale-110 transition-transform">
                  <i className="fab fa-google-pay text-4xl text-blue-500"></i>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-lg hover:scale-110 transition-transform">
                  <i className="fab fa-cc-paypal text-4xl text-blue-700"></i>
                </div>
              </div>
              
              {/* 🔥 INFORMAÇÃO DE PAGAMENTO - SEM MENCIONAR STRIPE */}
              <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                  <i className="ri-information-line"></i>
                  Informação de Pagamento
                </h4>
                <div className="space-y-2 text-gray-300 text-sm">
                  <p>✅ <strong>Pagamentos Seguros:</strong> Todos os pagamentos são processados de forma segura com criptografia SSL</p>
                  <p>✅ <strong>Métodos Aceitos:</strong> Visa, Mastercard, Apple Pay, Google Pay e PayPal</p>
                  <p>✅ <strong>PayPal:</strong> Envie pagamentos para <strong className="text-blue-400">jokadas69@gmail.com</strong></p>
                  <p>✅ <strong>Proteção ao Comprador:</strong> Seus dados e transações estão 100% protegidos</p>
                  <p>✅ <strong>Sem Taxas Ocultas:</strong> O preço que você vê é o preço final</p>
                </div>
              </div>
              
              {/* Política de Devolução */}
              <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <i className="ri-information-line text-red-400"></i>
                  Política de Devolução
                </h4>
                <div className="space-y-2 text-gray-300 text-sm">
                  <p>✅ <strong>14 dias</strong> para devolução sem necessidade de justificativa</p>
                  <p>✅ Produto deve estar em <strong>perfeitas condições</strong> e na embalagem original</p>
                  <p>✅ Reembolso total processado em até <strong>5 dias úteis</strong></p>
                  <p>⚠️ Após 14 dias, devolução apenas com <strong>motivo válido</strong> (defeito, produto errado, etc.)</p>
                  <p>✅ <strong>Garantia de 2 anos</strong> em todos os produtos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
