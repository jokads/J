
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import {
  useServiceDetail,
  useUpdateServiceDetail,
  useAddTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  useAddFAQ,
  useUpdateFAQ,
  useDeleteFAQ
} from '../../../hooks/useServiceDetail';

interface ServiceDetailEditorProps {
  darkMode: boolean;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  price_type: string;
  delivery_time: string;
  category: string;
  images: string[];
  gallery_images: string[];
  video_url: string;
  badge_text: string;
  badge_color: string;
  hero_layout: string;
  features: string[];
  process_steps: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    order: number;
  }>;
  benefits: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    order: number;
  }>;
  stats: Array<{
    id: string;
    label: string;
    value: string;
    icon: string;
    order: number;
  }>;
  packages: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    price_type: string;
    features: string[];
    highlighted: boolean;
    badge: string;
    cta_text: string;
  }>;
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    company: string;
    avatar: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    order: number;
  }>;
  whatsapp_message: string;
  email_subject: string;
  custom_cta_text: string;
  custom_cta_url: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  show_breadcrumb: boolean;
  show_related_services: boolean;
  related_services_ids: string[];
  status: string;
}

export default function ServiceDetailEditor({ darkMode }: ServiceDetailEditorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);

  // Modais
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [showStatModal, setShowStatModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);

  // Estados de edição
  const [editingFeature, setEditingFeature] = useState<string | null>(null);
  const [editingProcess, setEditingProcess] = useState<any>(null);
  const [editingBenefit, setEditingBenefit] = useState<any>(null);
  const [editingStat, setEditingStat] = useState<any>(null);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);

  const updateService = useUpdateServiceDetail();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
      
      if (data && data.length > 0 && !selectedService) {
        setSelectedService(data[0]);
      }
    } catch (error: any) {
      console.error('Erro ao carregar serviços:', error);
      alert('❌ Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBasicInfo = async (field: string, value: any) => {
    if (!selectedService) return;

    try {
      setSaving(true);
      await updateService.mutateAsync({
        slug: selectedService.slug,
        updates: { [field]: value }
      });

      setSelectedService({ ...selectedService, [field]: value });
      alert('✅ Atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      alert('❌ Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFeature = async (feature: string) => {
    if (!selectedService || !feature.trim()) return;

    const newFeatures = [...(selectedService.features || []), feature];
    await handleUpdateBasicInfo('features', newFeatures);
    setShowFeatureModal(false);
  };

  const handleUpdateFeature = async (index: number, newValue: string) => {
    if (!selectedService) return;

    const newFeatures = [...selectedService.features];
    newFeatures[index] = newValue;
    await handleUpdateBasicInfo('features', newFeatures);
    setEditingFeature(null);
  };

  const handleDeleteFeature = async (index: number) => {
    if (!selectedService) return;
    if (!confirm('Tem certeza que deseja remover esta feature?')) return;

    const newFeatures = selectedService.features.filter((_, i) => i !== index);
    await handleUpdateBasicInfo('features', newFeatures);
  };

  const handleAddProcessStep = async (step: any) => {
    if (!selectedService) return;

    const newSteps = [
      ...(selectedService.process_steps || []),
      {
        id: crypto.randomUUID(),
        ...step,
        order: (selectedService.process_steps?.length || 0) + 1
      }
    ];
    await handleUpdateBasicInfo('process_steps', newSteps);
    setShowProcessModal(false);
    setEditingProcess(null);
  };

  const handleUpdateProcessStep = async (step: any) => {
    if (!selectedService) return;

    const newSteps = selectedService.process_steps.map(s =>
      s.id === step.id ? step : s
    );
    await handleUpdateBasicInfo('process_steps', newSteps);
    setShowProcessModal(false);
    setEditingProcess(null);
  };

  const handleDeleteProcessStep = async (id: string) => {
    if (!selectedService) return;
    if (!confirm('Tem certeza que deseja remover esta etapa?')) return;

    const newSteps = selectedService.process_steps.filter(s => s.id !== id);
    await handleUpdateBasicInfo('process_steps', newSteps);
  };

  const handleAddBenefit = async (benefit: any) => {
    if (!selectedService) return;

    const newBenefits = [
      ...(selectedService.benefits || []),
      {
        id: crypto.randomUUID(),
        ...benefit,
        order: (selectedService.benefits?.length || 0) + 1
      }
    ];
    await handleUpdateBasicInfo('benefits', newBenefits);
    setShowBenefitModal(false);
    setEditingBenefit(null);
  };

  const handleUpdateBenefit = async (benefit: any) => {
    if (!selectedService) return;

    const newBenefits = selectedService.benefits.map(b =>
      b.id === benefit.id ? benefit : b
    );
    await handleUpdateBasicInfo('benefits', newBenefits);
    setShowBenefitModal(false);
    setEditingBenefit(null);
  };

  const handleDeleteBenefit = async (id: string) => {
    if (!selectedService) return;
    if (!confirm('Tem certeza que deseja remover este benefício?')) return;

    const newBenefits = selectedService.benefits.filter(b => b.id !== id);
    await handleUpdateBasicInfo('benefits', newBenefits);
  };

  const handleAddStat = async (stat: any) => {
    if (!selectedService) return;

    const newStats = [
      ...(selectedService.stats || []),
      {
        id: crypto.randomUUID(),
        ...stat,
        order: (selectedService.stats?.length || 0) + 1
      }
    ];
    await handleUpdateBasicInfo('stats', newStats);
    setShowStatModal(false);
    setEditingStat(null);
  };

  const handleUpdateStat = async (stat: any) => {
    if (!selectedService) return;

    const newStats = selectedService.stats.map(s =>
      s.id === stat.id ? stat : s
    );
    await handleUpdateBasicInfo('stats', newStats);
    setShowStatModal(false);
    setEditingStat(null);
  };

  const handleDeleteStat = async (id: string) => {
    if (!selectedService) return;
    if (!confirm('Tem certeza que deseja remover esta estatística?')) return;

    const newStats = selectedService.stats.filter(s => s.id !== id);
    await handleUpdateBasicInfo('stats', newStats);
  };

  const handleAddPackage = async (pkg: any) => {
    if (!selectedService) return;

    const newPackages = [
      ...(selectedService.packages || []),
      {
        id: crypto.randomUUID(),
        ...pkg
      }
    ];
    await handleUpdateBasicInfo('packages', newPackages);
    setShowPackageModal(false);
    setEditingPackage(null);
  };

  const handleUpdatePackage = async (pkg: any) => {
    if (!selectedService) return;

    const newPackages = selectedService.packages.map(p =>
      p.id === pkg.id ? pkg : p
    );
    await handleUpdateBasicInfo('packages', newPackages);
    setShowPackageModal(false);
    setEditingPackage(null);
  };

  const handleDeletePackage = async (id: string) => {
    if (!selectedService) return;
    if (!confirm('Tem certeza que deseja remover este pacote?')) return;

    const newPackages = selectedService.packages.filter(p => p.id !== id);
    await handleUpdateBasicInfo('packages', newPackages);
  };

  const handleAddTestimonial = async (testimonial: any) => {
    if (!selectedService) return;

    const newTestimonials = [
      ...(selectedService.testimonials || []),
      {
        id: crypto.randomUUID(),
        ...testimonial,
        date: new Date().toISOString().split('T')[0]
      }
    ];
    await handleUpdateBasicInfo('testimonials', newTestimonials);
    setShowTestimonialModal(false);
    setEditingTestimonial(null);
  };

  const handleUpdateTestimonial = async (testimonial: any) => {
    if (!selectedService) return;

    const newTestimonials = selectedService.testimonials.map(t =>
      t.id === testimonial.id ? testimonial : t
    );
    await handleUpdateBasicInfo('testimonials', newTestimonials);
    setShowTestimonialModal(false);
    setEditingTestimonial(null);
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!selectedService) return;
    if (!confirm('Tem certeza que deseja remover este depoimento?')) return;

    const newTestimonials = selectedService.testimonials.filter(t => t.id !== id);
    await handleUpdateBasicInfo('testimonials', newTestimonials);
  };

  const handleAddFAQ = async (faq: any) => {
    if (!selectedService) return;

    const newFAQs = [
      ...(selectedService.faqs || []),
      {
        id: crypto.randomUUID(),
        ...faq,
        order: (selectedService.faqs?.length || 0) + 1
      }
    ];
    await handleUpdateBasicInfo('faqs', newFAQs);
    setShowFAQModal(false);
    setEditingFAQ(null);
  };

  const handleUpdateFAQ = async (faq: any) => {
    if (!selectedService) return;

    const newFAQs = selectedService.faqs.map(f =>
      f.id === faq.id ? faq : f
    );
    await handleUpdateBasicInfo('faqs', newFAQs);
    setShowFAQModal(false);
    setEditingFAQ(null);
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!selectedService) return;
    if (!confirm('Tem certeza que deseja remover esta pergunta?')) return;

    const newFAQs = selectedService.faqs.filter(f => f.id !== id);
    await handleUpdateBasicInfo('faqs', newFAQs);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Editor de Detalhes do Serviço</h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Controle TODOS os elementos da página de detalhes
            </p>
          </div>
        </div>

        {/* Seletor de Serviço */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Selecionar Serviço
          </label>
          <select
            value={selectedService?.id || ''}
            onChange={(e) => {
              const service = services.find(s => s.id === e.target.value);
              setSelectedService(service || null);
            }}
            className={`w-full max-w-md px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
          >
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedService && (
        <>
          {/* Tabs */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'basic', label: 'Informações Básicas', icon: 'ri-information-line' },
                { id: 'hero', label: 'Hero Section', icon: 'ri-image-line' },
                { id: 'features', label: 'Features', icon: 'ri-check-line' },
                { id: 'process', label: 'Como Funciona', icon: 'ri-flow-chart' },
                { id: 'benefits', label: 'Benefícios', icon: 'ri-star-line' },
                { id: 'stats', label: 'Estatísticas', icon: 'ri-bar-chart-line' },
                { id: 'packages', label: 'Pacotes', icon: 'ri-box-3-line' },
                { id: 'testimonials', label: 'Depoimentos', icon: 'ri-chat-quote-line' },
                { id: 'faqs', label: 'FAQ', icon: 'ri-question-line' },
                { id: 'cta', label: 'CTA & Botões', icon: 'ri-cursor-line' },
                { id: 'seo', label: 'SEO', icon: 'ri-search-line' },
                { id: 'settings', label: 'Configurações', icon: 'ri-settings-line' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-amber-600 text-white shadow-lg'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <i className={tab.icon}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">Informações Básicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Nome do Serviço *
                    </label>
                    <input
                      type="text"
                      value={selectedService.name}
                      onChange={(e) => setSelectedService({ ...selectedService, name: e.target.value })}
                      onBlur={(e) => handleUpdateBasicInfo('name', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Slug (URL)
                    </label>
                    <input
                      type="text"
                      value={selectedService.slug}
                      disabled
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-500' : 'bg-gray-100 border-gray-300 text-gray-500'} border cursor-not-allowed`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Descrição Curta
                    </label>
                    <textarea
                      rows={2}
                      value={selectedService.short_description || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, short_description: e.target.value })}
                      onBlur={(e) => handleUpdateBasicInfo('short_description', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder="Descrição breve para listagens..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Descrição Completa
                    </label>
                    <textarea
                      rows={6}
                      value={selectedService.description || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, description: e.target.value })}
                      onBlur={(e) => handleUpdateBasicInfo('description', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder="Descrição detalhada do serviço..."
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Preço (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedService.price}
                      onChange={(e) => setSelectedService({ ...selectedService, price: parseFloat(e.target.value) })}
                      onBlur={(e) => handleUpdateBasicInfo('price', parseFloat(e.target.value))}
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Tipo de Preço
                    </label>
                    <select
                      value={selectedService.price_type}
                      onChange={(e) => {
                        setSelectedService({ ...selectedService, price_type: e.target.value });
                        handleUpdateBasicInfo('price_type', e.target.value);
                      }}
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                    >
                      <option value="fixed">Preço Fixo</option>
                      <option value="from">A partir de</option>
                      <option value="custom">Sob Consulta</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Prazo de Entrega
                    </label>
                    <input
                      type="text"
                      value={selectedService.delivery_time || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, delivery_time: e.target.value })}
                      onBlur={(e) => handleUpdateBasicInfo('delivery_time', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder="Ex: 7-14 dias"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      value={selectedService.status}
                      onChange={(e) => {
                        setSelectedService({ ...selectedService, status: e.target.value });
                        handleUpdateBasicInfo('status', e.target.value);
                      }}
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="draft">Rascunho</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">O Que Está Incluído</h3>
                  <button
                    onClick={() => setShowFeatureModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap font-medium shadow-lg"
                  >
                    <i className="ri-add-line"></i>
                    Adicionar Feature
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(selectedService.features || []).map((feature, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:border-primary transition-colors`}
                    >
                      {editingFeature === feature ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            defaultValue={feature}
                            onBlur={(e) => handleUpdateFeature(index, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateFeature(index, e.currentTarget.value);
                              }
                            }}
                            autoFocus
                            className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                          />
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            <i className="ri-check-line text-green-500 mt-1"></i>
                            <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{feature}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingFeature(feature)}
                              className="p-1 text-blue-500 hover:bg-blue-500/10 rounded"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteFeature(index)}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {(!selectedService.features || selectedService.features.length === 0) && (
                  <div className="text-center py-12">
                    <i className="ri-checkbox-blank-circle-line text-4xl text-gray-400 mb-4"></i>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Nenhuma feature adicionada ainda
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Process Tab */}
            {activeTab === 'process' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Como Funciona (Processo)</h3>
                  <button
                    onClick={() => {
                      setEditingProcess({
                        title: '',
                        description: '',
                        icon: 'ri-arrow-right-line'
                      });
                      setShowProcessModal(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap font-medium shadow-lg"
                  >
                    <i className="ri-add-line"></i>
                    Adicionar Etapa
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(selectedService.process_steps || [])
                    .sort((a, b) => a.order - b.order)
                    .map((step, index) => (
                      <div
                        key={step.id}
                        className={`p-6 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:border-primary transition-colors`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-amber-600 flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <i className={`${step.icon} text-2xl text-primary`}></i>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingProcess(step);
                                setShowProcessModal(true);
                              }}
                              className="p-1 text-blue-500 hover:bg-blue-500/10 rounded"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteProcessStep(step.id)}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                        <h4 className={`font-bold text-lg mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {step.title}
                        </h4>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {step.description}
                        </p>
                      </div>
                    ))}
                </div>

                {(!selectedService.process_steps || selectedService.process_steps.length === 0) && (
                  <div className="text-center py-12">
                    <i className="ri-flow-chart text-4xl text-gray-400 mb-4"></i>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Nenhuma etapa adicionada ainda
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Outros tabs continuam... */}
            {activeTab !== 'basic' && activeTab !== 'features' && activeTab !== 'process' && (
              <div className="text-center py-12">
                <i className="ri-tools-line text-4xl text-gray-400 mb-4"></i>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tab "{activeTab}" em desenvolvimento...
                </p>
              </div>
            )}
          </div>

          {/* Modal Add Feature */}
          {showFeatureModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFeatureModal(false)}>
              <div
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-md w-full p-6`}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4">Adicionar Feature</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleAddFeature(formData.get('feature') as string);
                  }}
                >
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Descrição da Feature
                    </label>
                    <input
                      type="text"
                      name="feature"
                      required
                      placeholder="Ex: Design responsivo (mobile, tablet, desktop)"
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                    >
                      Adicionar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFeatureModal(false)}
                      className={`px-4 py-2.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${darkMode ? 'text-white' : 'text-gray-800'} rounded-lg hover:opacity-90 transition-opacity font-medium`}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Add/Edit Process Step */}
          {showProcessModal && editingProcess && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowProcessModal(false)}>
              <div
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-lg w-full p-6`}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4">
                  {editingProcess.id ? 'Editar' : 'Adicionar'} Etapa do Processo
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const step = {
                      ...editingProcess,
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      icon: formData.get('icon') as string
                    };
                    if (editingProcess.id) {
                      handleUpdateProcessStep(step);
                    } else {
                      handleAddProcessStep(step);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Título da Etapa *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      defaultValue={editingProcess.title}
                      placeholder="Ex: Análise de Requisitos"
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Descrição *
                    </label>
                    <textarea
                      name="description"
                      required
                      rows={3}
                      defaultValue={editingProcess.description}
                      placeholder="Descreva esta etapa do processo..."
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Ícone (Remix Icon) *
                    </label>
                    <input
                      type="text"
                      name="icon"
                      required
                      defaultValue={editingProcess.icon}
                      placeholder="Ex: ri-search-line"
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Veja ícones em: <a href="https://remixicon.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">remixicon.com</a>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                    >
                      {editingProcess.id ? 'Atualizar' : 'Adicionar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProcessModal(false);
                        setEditingProcess(null);
                      }}
                      className={`px-4 py-2.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${darkMode ? 'text-white' : 'text-gray-800'} rounded-lg hover:opacity-90 transition-opacity font-medium`}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
