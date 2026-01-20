import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useServiceDetail, useRelatedServices } from '../../../hooks/useServiceDetail';

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: service, isLoading, error } = useServiceDetail(slug);
  const { data: relatedServices = [] } = useRelatedServices(service?.id, service?.category_id);
  const [activeTab, setActiveTab] = useState<'features' | 'process' | 'packages'>('features');
  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <i className="ri-loader-4-line text-6xl text-amber-600 animate-spin"></i>
          <p className="text-gray-600 text-lg">A carregar serviço...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 flex items-center justify-center bg-red-100 text-red-600 rounded-full mx-auto">
            <i className="ri-error-warning-line text-5xl"></i>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Serviço não encontrado</h1>
            <p className="text-gray-600 mb-6">O serviço que procura não existe ou foi removido.</p>
            <Link 
              to="/services" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line"></i>
              Voltar para Serviços
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // WhatsApp and Email Links
  const whatsappLink = `https://wa.me/352621717862?text=${encodeURIComponent(
    service.whatsapp_message || `Olá! Gostaria de saber mais sobre o serviço: ${service.name}`
  )}`;
  
  const emailLink = `mailto:jokadamas616@gmail.com?subject=${encodeURIComponent(
    service.email_subject || `Orçamento: ${service.name}`
  )}`;

  const allImages = [
    ...(service.images || []),
    ...(service.gallery_images || [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      {service.show_breadcrumb !== false && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-amber-600 transition-colors cursor-pointer">Início</Link>
              <i className="ri-arrow-right-s-line"></i>
              <Link to="/services" className="hover:text-amber-600 transition-colors cursor-pointer">Serviços</Link>
              <i className="ri-arrow-right-s-line"></i>
              <span className="text-gray-900 font-medium">{service.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className={`bg-white py-16 ${service.hero_layout === 'fullwidth' ? '' : ''}`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
          <div className={`grid ${service.hero_layout === 'centered' ? 'lg:grid-cols-1 text-center' : 'lg:grid-cols-2'} gap-12 items-center`}>
            <div className={`space-y-6 ${service.hero_layout === 'centered' ? 'max-w-3xl mx-auto' : ''}`}>
              {/* Badge */}
              {service.badge_text && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{
                  backgroundColor: service.badge_color ? `${service.badge_color}20` : '#fef3c7',
                  color: service.badge_color || '#d97706'
                }}>
                  <i className="ri-award-line"></i>
                  {service.badge_text}
                </div>
              )}

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {service.meta_title || service.name}
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                {service.description}
              </p>

              {/* Stats */}
              {service.stats && service.stats.length > 0 && (
                <div className="grid grid-cols-3 gap-6 py-6 border-y border-gray-200">
                  {service.stats.sort((a, b) => a.order - b.order).map((stat) => (
                    <div key={stat.id} className="text-center">
                      <div className="w-12 h-12 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg mx-auto mb-2">
                        <i className={`${stat.icon} text-2xl`}></i>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Price & Delivery */}
              <div className="flex items-center gap-6 pt-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Preço</p>
                  {service.price_type === 'fixed' ? (
                    <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      €{service.price.toFixed(2)}
                    </p>
                  ) : service.price_type === 'from' ? (
                    <p className="text-3xl font-bold text-gray-900">
                      Desde €{service.price.toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">Sob Consulta</p>
                  )}
                </div>
                
                <div className="border-l border-gray-300 pl-6">
                  <p className="text-sm text-gray-500 mb-1">Prazo de Entrega</p>
                  <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i className="ri-time-line text-amber-600"></i>
                    {service.delivery_time}
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                {service.custom_cta_url ? (
                  <a 
                    href={service.custom_cta_url}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap cursor-pointer"
                  >
                    {service.custom_cta_text || 'Solicitar Orçamento'}
                  </a>
                ) : (
                  <a 
                    href={emailLink}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-mail-line mr-2"></i>
                    Solicitar Orçamento
                  </a>
                )}
                
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-whatsapp-line mr-2"></i>
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Image Gallery */}
            {service.hero_layout !== 'centered' && (
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={allImages[selectedImage] || service.images[0]} 
                    alt={service.name}
                    className="w-full h-[500px] object-cover"
                  />
                </div>
                
                {allImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {allImages.slice(0, 4).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${
                          selectedImage === idx 
                            ? 'ring-4 ring-amber-600 shadow-lg scale-105' 
                            : 'hover:ring-2 hover:ring-amber-400 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`${service.name} - ${idx + 1}`}
                          className="w-full h-20 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Video Section */}
      {service.video_url && (
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src={service.video_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      )}

      {/* Tabs Navigation */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('features')}
              className={`px-6 py-4 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 cursor-pointer ${
                activeTab === 'features'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-checkbox-circle-line mr-2"></i>
              O que está incluído
            </button>
            <button
              onClick={() => setActiveTab('process')}
              className={`px-6 py-4 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 cursor-pointer ${
                activeTab === 'process'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-route-line mr-2"></i>
              Como funciona
            </button>
            {service.packages && service.packages.length > 0 && (
              <button
                onClick={() => setActiveTab('packages')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 cursor-pointer ${
                  activeTab === 'packages'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className="ri-stack-line mr-2"></i>
                Pacotes
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <i className="ri-check-line text-xl"></i>
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed">{feature}</p>
                </div>
              ))}
            </div>
          )}

          {/* Process Tab */}
          {activeTab === 'process' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
              {service.process_steps.map((step, index) => (
                <div key={index} className="relative group">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full text-2xl font-bold mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {step.icon ? (
                        <i className={`${step.icon} text-3xl`}></i>
                      ) : (
                        step.step
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                  {index < service.process_steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-1/2 w-full h-1 bg-gradient-to-r from-amber-300 to-orange-400 -z-10"></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Packages Tab */}
          {activeTab === 'packages' && service.packages && service.packages.length > 0 && (
            <div className="grid md:grid-cols-3 gap-8">
              {service.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                    pkg.highlighted ? 'ring-4 ring-amber-600' : ''
                  }`}
                >
                  {pkg.badge && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-amber-600 text-white text-sm font-semibold rounded-full">
                      {pkg.badge}
                    </div>
                  )}
                  
                  <div className="p-8 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{pkg.name}</h3>
                      <p className="text-gray-600 mt-2">{pkg.description}</p>
                    </div>

                    <div>
                      {pkg.price_type === 'fixed' ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-gray-900">€{pkg.price}</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg text-gray-600">Desde</span>
                          <span className="text-5xl font-bold text-gray-900">€{pkg.price}</span>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <i className="ri-check-line text-xl text-green-600 flex-shrink-0 mt-0.5"></i>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={emailLink}
                      className={`block w-full py-3 text-center font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
                        pkg.highlighted
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {pkg.cta_text || 'Escolher Pacote'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      {service.benefits && service.benefits.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {service.benefits_title || 'Benefícios'}
              </h2>
              {service.benefits_subtitle && (
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {service.benefits_subtitle}
                </p>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {service.benefits.sort((a, b) => a.order - b.order).map((benefit) => (
                <div key={benefit.id} className="text-center space-y-4 group">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 rounded-xl mx-auto group-hover:scale-110 transition-transform duration-300">
                    <i className={`${benefit.icon} text-3xl`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {service.testimonials && service.testimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              O que dizem os nossos clientes
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {service.testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 space-y-4"
                >
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i} 
                        className={`ri-star-${i < testimonial.rating ? 'fill' : 'line'} text-amber-500 text-xl`}
                      ></i>
                    ))}
                  </div>
                  
                  <p className="text-gray-700 italic leading-relaxed">"{testimonial.comment}"</p>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      {testimonial.company && (
                        <p className="text-xs text-gray-500">{testimonial.company}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {service.faqs && service.faqs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Perguntas Frequentes
            </h2>
            
            <div className="space-y-4">
              {service.faqs.sort((a, b) => a.order - b.order).map((faq) => (
                <div 
                  key={faq.id} 
                  className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-amber-600 transition-all duration-300"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer hover:bg-gray-100 transition-colors duration-300"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    <i className={`ri-arrow-${expandedFAQ === faq.id ? 'up' : 'down'}-s-line text-2xl text-amber-600 flex-shrink-0 transition-transform duration-300`}></i>
                  </button>
                  
                  {expandedFAQ === faq.id && (
                    <div className="px-6 pb-5 text-gray-700 leading-relaxed animate-fadeIn">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Entre em contacto connosco e receba uma proposta personalizada para o seu projeto
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href={emailLink}
              className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 whitespace-nowrap cursor-pointer"
            >
              <i className="ri-mail-line mr-2"></i>
              Enviar E-mail
            </a>
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 whitespace-nowrap cursor-pointer"
            >
              <i className="ri-whatsapp-line mr-2"></i>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {service.show_related_services !== false && relatedServices.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Outros Serviços</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedServices.map((relatedService) => (
                <Link
                  key={relatedService.id}
                  to={`/services/${relatedService.slug}`}
                  className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={relatedService.images[0]} 
                      alt={relatedService.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                      {relatedService.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {relatedService.short_description}
                    </p>
                    {relatedService.price_type === 'fixed' ? (
                      <p className="text-2xl font-bold text-amber-600">€{relatedService.price.toFixed(2)}</p>
                    ) : relatedService.price_type === 'from' ? (
                      <p className="text-xl font-semibold text-gray-700">Desde €{relatedService.price.toFixed(2)}</p>
                    ) : (
                      <p className="text-lg font-semibold text-gray-700">Sob Consulta</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
