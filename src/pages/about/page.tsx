import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface HeroConfig {
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
}

interface MissionConfig {
  title: string;
  description: string;
  image_url: string;
}

interface StatConfig {
  icon: string;
  value: string;
  label: string;
  display_order: number;
}

interface ValueConfig {
  title: string;
  description: string;
  icon: string;
  display_order: number;
}

interface DeliveryTime {
  icon: string;
  title: string;
  duration: string;
  description: string;
  color: string;
}

interface ServiceNoticeConfig {
  title: string;
  description: string;
  metadata: {
    delivery_times: DeliveryTime[];
    note: string;
  };
}

export default function AboutPage() {
  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(null);
  const [missionConfig, setMissionConfig] = useState<MissionConfig | null>(null);
  const [stats, setStats] = useState<StatConfig[]>([]);
  const [values, setValues] = useState<ValueConfig[]>([]);
  const [serviceNotice, setServiceNotice] = useState<ServiceNoticeConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageConfig();
  }, []);

  const loadPageConfig = async () => {
    try {
      setLoading(true);

      // Carregar Hero Section
      const { data: heroData } = await supabase
        .from('about_page_config')
        .select('*')
        .eq('section_type', 'hero')
        .eq('is_active', true)
        .single();

      if (heroData) {
        setHeroConfig({
          title: heroData.title || 'Sobre Nós',
          subtitle: heroData.subtitle || '',
          description: heroData.description || '',
          image_url: heroData.image_url || ''
        });
      }

      // Carregar Nossa Missão
      const { data: missionData } = await supabase
        .from('about_page_config')
        .select('*')
        .eq('section_type', 'mission')
        .eq('is_active', true)
        .single();

      if (missionData) {
        setMissionConfig({
          title: missionData.title || 'Nossa Missão',
          description: missionData.description || '',
          image_url: missionData.image_url || ''
        });
      }

      // Carregar Estatísticas
      const { data: statsData } = await supabase
        .from('about_page_config')
        .select('*')
        .eq('section_type', 'stats')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (statsData) {
        setStats(statsData.map(stat => ({
          icon: stat.icon || 'ri-star-line',
          value: stat.value || '0',
          label: stat.label || '',
          display_order: stat.display_order || 0
        })));
      }

      // Carregar Valores
      const { data: valuesData } = await supabase
        .from('about_page_config')
        .select('*')
        .eq('section_type', 'values')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (valuesData) {
        setValues(valuesData.map(value => ({
          title: value.title || '',
          description: value.description || '',
          icon: value.icon || 'ri-star-line',
          display_order: value.display_order || 0
        })));
      }

      // Carregar Aviso sobre Prazos
      const { data: noticeData } = await supabase
        .from('about_page_config')
        .select('*')
        .eq('section_type', 'service_notice')
        .eq('is_active', true)
        .single();

      if (noticeData) {
        setServiceNotice({
          title: noticeData.title || '',
          description: noticeData.description || '',
          metadata: noticeData.metadata || { delivery_times: [], note: '' }
        });
      }

    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' }
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      {heroConfig && (
        <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600 text-white py-24 overflow-hidden">
          {/* Background Image com Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url('${heroConfig.image_url}')` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
          
          {/* Elementos Decorativos */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold">
                {heroConfig.title.split(' ').map((word, index) => (
                  index === heroConfig.title.split(' ').length - 1 ? (
                    <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600"> {word}</span>
                  ) : (
                    <span key={index}>{word} </span>
                  )
                ))}
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                {heroConfig.subtitle}
              </p>
              {heroConfig.description && (
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  {heroConfig.description}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Estatísticas */}
      {stats.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <i className={`${stat.icon} text-2xl`}></i>
                  </div>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nossa Missão */}
      {missionConfig && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-gray-900">
                  {missionConfig.title}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {missionConfig.description}
                </p>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
                <img
                  src={missionConfig.image_url}
                  alt={missionConfig.title}
                  className="relative rounded-2xl shadow-2xl w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Nossos Valores */}
      {values.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Nossos Valores
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Os princípios que guiam nosso trabalho e relacionamento com clientes
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-purple-500 to-orange-500 text-white shadow-lg">
                    <i className={`${value.icon} text-2xl`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Aviso sobre Prazos de Serviços */}
      {serviceNotice && serviceNotice.metadata.delivery_times && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 text-white shadow-lg">
                <i className="ri-time-line text-2xl"></i>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {serviceNotice.title}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {serviceNotice.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {serviceNotice.metadata.delivery_times.map((time, index) => {
                const colorClasses = getColorClasses(time.color);
                return (
                  <div
                    key={index}
                    className={`${colorClasses.bg} border-2 ${colorClasses.border} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl ${colorClasses.text} bg-white shadow-md`}>
                      <i className={`${time.icon} text-xl`}></i>
                    </div>
                    <h3 className={`text-xl font-bold ${colorClasses.text} mb-2`}>
                      {time.title}
                    </h3>
                    <div className={`text-2xl font-bold ${colorClasses.text} mb-3`}>
                      {time.duration}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {time.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {serviceNotice.metadata.note && (
              <div className="bg-gradient-to-r from-purple-50 to-orange-50 border-l-4 border-purple-500 rounded-lg p-6 shadow-md">
                <div className="flex items-start">
                  <i className="ri-information-line text-2xl text-purple-600 mr-4 mt-1"></i>
                  <p className="text-gray-700 leading-relaxed">
                    <span className="font-semibold text-purple-900">Nota Importante:</span> {serviceNotice.metadata.note}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para Começar o Seu Projeto?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Entre em contacto connosco e vamos transformar as suas ideias em realidade
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-900 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <i className="ri-mail-line mr-2"></i>
              Enviar Mensagem
            </a>
            <a
              href="https://wa.me/351999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <i className="ri-whatsapp-line mr-2"></i>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
