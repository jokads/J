import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface ContactMethod {
  icon: string;
  title: string;
  value: string;
  link: string;
  description: string;
  color: string;
  enabled: boolean;
}

interface FAQ {
  question: string;
  answer: string;
}

interface FormSubject {
  value: string;
  label: string;
}

interface ContactMethodOption {
  value: string;
  label: string;
  icon: string;
}

interface SocialMedia {
  platform: string;
  icon: string;
  url: string;
  enabled: boolean;
  color: string;
}

interface ContactPageConfig {
  hero_title: string;
  hero_highlight: string;
  hero_subtitle: string;
  hero_bg_image: string;
  contact_methods: ContactMethod[];
  social_media: SocialMedia[];
  form_title: string;
  form_subtitle: string;
  form_name_label: string;
  form_email_label: string;
  form_phone_label: string;
  form_subject_label: string;
  form_message_label: string;
  form_contact_method_label: string;
  form_submit_button: string;
  form_success_message: string;
  form_error_message: string;
  form_subjects: FormSubject[];
  contact_method_options: ContactMethodOption[];
  faq_title: string;
  faq_subtitle: string;
  faqs: FAQ[];
  map_title: string;
  map_subtitle: string;
  map_embed_url: string;
  show_map: boolean;
  show_contact_methods: boolean;
  show_faq: boolean;
  show_social_media: boolean;
  form_max_message_length: number;
  footer_text: string;
  footer_copyright: string;
}

export default function ContactPageManagement() {
  const [config, setConfig] = useState<ContactPageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'methods' | 'social' | 'form' | 'faq' | 'map' | 'footer'>('hero');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_page_config')
        .select('*')
        .single();

      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('contact_page_config')
        .update({
          ...config,
          updated_at: new Date().toISOString()
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      if (error) throw error;

      setMessage({ type: 'success', text: '✅ Configurações salvas com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage({ type: 'error', text: '❌ Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  const addContactMethod = () => {
    if (!config) return;
    setConfig({
      ...config,
      contact_methods: [
        ...config.contact_methods,
        {
          icon: 'ri-mail-line',
          title: 'Novo Método',
          value: '',
          link: '',
          description: '',
          color: 'purple',
          enabled: true
        }
      ]
    });
  };

  const updateContactMethod = (index: number, field: keyof ContactMethod, value: any) => {
    if (!config) return;
    const methods = [...config.contact_methods];
    methods[index] = { ...methods[index], [field]: value };
    setConfig({ ...config, contact_methods: methods });
  };

  const removeContactMethod = (index: number) => {
    if (!config) return;
    setConfig({
      ...config,
      contact_methods: config.contact_methods.filter((_, i) => i !== index)
    });
  };

  const addFAQ = () => {
    if (!config) return;
    setConfig({
      ...config,
      faqs: [
        ...config.faqs,
        { question: '', answer: '' }
      ]
    });
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    if (!config) return;
    const faqs = [...config.faqs];
    faqs[index] = { ...faqs[index], [field]: value };
    setConfig({ ...config, faqs });
  };

  const removeFAQ = (index: number) => {
    if (!config) return;
    setConfig({
      ...config,
      faqs: config.faqs.filter((_, i) => i !== index)
    });
  };

  const addFormSubject = () => {
    if (!config) return;
    setConfig({
      ...config,
      form_subjects: [
        ...config.form_subjects,
        { value: '', label: '' }
      ]
    });
  };

  const updateFormSubject = (index: number, field: 'value' | 'label', value: string) => {
    if (!config) return;
    const subjects = [...config.form_subjects];
    subjects[index] = { ...subjects[index], [field]: value };
    setConfig({ ...config, form_subjects: subjects });
  };

  const removeFormSubject = (index: number) => {
    if (!config) return;
    setConfig({
      ...config,
      form_subjects: config.form_subjects.filter((_, i) => i !== index)
    });
  };

  const addSocialMedia = () => {
    if (!config) return;
    setConfig({
      ...config,
      social_media: [
        ...config.social_media,
        {
          platform: 'Nova Rede',
          icon: 'ri-links-line',
          url: '',
          enabled: true,
          color: 'purple'
        }
      ]
    });
  };

  const updateSocialMedia = (index: number, field: keyof SocialMedia, value: any) => {
    if (!config) return;
    const social = [...config.social_media];
    social[index] = { ...social[index], [field]: value };
    setConfig({ ...config, social_media: social });
  };

  const removeSocialMedia = (index: number) => {
    if (!config) return;
    setConfig({
      ...config,
      social_media: config.social_media.filter((_, i) => i !== index)
    });
  };

  const tabs = [
    { id: 'hero', label: 'Hero', icon: 'ri-image-line', color: 'purple' },
    { id: 'methods', label: 'Contactos', icon: 'ri-phone-line', color: 'green' },
    { id: 'social', label: 'Redes Sociais', icon: 'ri-share-line', color: 'blue' },
    { id: 'form', label: 'Formulário', icon: 'ri-mail-send-line', color: 'orange' },
    { id: 'faq', label: 'FAQ', icon: 'ri-question-answer-line', color: 'yellow' },
    { id: 'map', label: 'Mapa', icon: 'ri-map-pin-line', color: 'red' },
    { id: 'footer', label: 'Rodapé', icon: 'ri-layout-bottom-line', color: 'indigo' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <i className="ri-loader-4-line text-4xl text-purple-500 animate-spin"></i>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header - Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">📞 Página de Contacto</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Controlo total: textos, números, emails, redes sociais, símbolos
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-purple-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:from-purple-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer hover:scale-105 shadow-lg"
        >
          {saving ? (
            <>
              <i className="ri-loader-4-line animate-spin mr-2"></i>
              A guardar...
            </>
          ) : (
            <>
              <i className="ri-save-line mr-2"></i>
              Guardar
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`p-3 lg:p-4 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <i className={message.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}></i>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Tabs - Scroll horizontal em mobile */}
      <div className="border-b border-gray-200 dark:border-gray-700 -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 cursor-pointer flex-shrink-0 ${
                activeTab === tab.id
                  ? `border-${tab.color}-500 text-${tab.color}-600 dark:text-${tab.color}-400 bg-${tab.color}-50 dark:bg-${tab.color}-900/20 rounded-t-lg`
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-t-lg'
              }`}
            >
              <i className={`${tab.icon} mr-1 lg:mr-2`}></i>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      {activeTab === 'hero' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 space-y-4 lg:space-y-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white pb-3 lg:pb-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <i className="ri-image-line text-purple-500"></i>
            Configurações do Hero
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📝 Título Principal
              </label>
              <input
                type="text"
                value={config.hero_title}
                onChange={(e) => setConfig({ ...config, hero_title: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Entre em"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ✨ Palavra em Destaque (Gradiente)
              </label>
              <input
                type="text"
                value={config.hero_highlight}
                onChange={(e) => setConfig({ ...config, hero_highlight: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Contacto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                💬 Subtítulo
              </label>
              <textarea
                value={config.hero_subtitle}
                onChange={(e) => setConfig({ ...config, hero_subtitle: e.target.value })}
                rows={2}
                className="w-full px-3 lg:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder="Estamos prontos para transformar suas ideias em realidade..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🖼️ URL da Imagem de Fundo
              </label>
              <input
                type="text"
                value={config.hero_bg_image}
                onChange={(e) => setConfig({ ...config, hero_bg_image: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Contact Methods */}
      {activeTab === 'methods' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 lg:pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <i className="ri-phone-line text-green-500"></i>
                Métodos de Contacto
              </h3>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Email, telefone, WhatsApp, etc.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.show_contact_methods}
                  onChange={(e) => setConfig({ ...config, show_contact_methods: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                />
                <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">Mostrar</span>
              </label>
              <button
                onClick={addContactMethod}
                className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-1"></i>
                Adicionar
              </button>
            </div>
          </div>

          <div className="space-y-3 lg:space-y-4">
            {config.contact_methods.map((method, index) => (
              <div key={index} className="p-3 lg:p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">📞 Método {index + 1}</h4>
                  <div className="flex items-center gap-2 lg:gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={method.enabled}
                        onChange={(e) => updateContactMethod(index, 'enabled', e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Ativo</span>
                    </label>
                    <button
                      onClick={() => removeContactMethod(index)}
                      className="text-red-500 hover:text-red-600 cursor-pointer p-1"
                    >
                      <i className="ri-delete-bin-line text-lg"></i>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      🎨 Ícone (Remix Icon)
                    </label>
                    <input
                      type="text"
                      value={method.icon}
                      onChange={(e) => updateContactMethod(index, 'icon', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="ri-mail-line"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      🎨 Cor
                    </label>
                    <select
                      value={method.color}
                      onChange={(e) => updateContactMethod(index, 'color', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                    >
                      <option value="purple">🟣 Roxo</option>
                      <option value="green">🟢 Verde</option>
                      <option value="orange">🟠 Laranja</option>
                      <option value="blue">🔵 Azul</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      📝 Título
                    </label>
                    <input
                      type="text"
                      value={method.title}
                      onChange={(e) => updateContactMethod(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="E-mail"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      📧 Valor (Email/Telefone)
                    </label>
                    <input
                      type="text"
                      value={method.value}
                      onChange={(e) => updateContactMethod(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      🔗 Link (mailto:/tel:/https:)
                    </label>
                    <input
                      type="text"
                      value={method.link}
                      onChange={(e) => updateContactMethod(index, 'link', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="mailto:email@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      💬 Descrição
                    </label>
                    <input
                      type="text"
                      value={method.description}
                      onChange={(e) => updateContactMethod(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Resposta em até 24 horas"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Media - NOVA ABA */}
      {activeTab === 'social' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 lg:pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <i className="ri-share-line text-blue-500"></i>
                Redes Sociais
              </h3>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Facebook, Instagram, LinkedIn, Twitter, etc.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.show_social_media}
                  onChange={(e) => setConfig({ ...config, show_social_media: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">Mostrar</span>
              </label>
              <button
                onClick={addSocialMedia}
                className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-1"></i>
                Adicionar
              </button>
            </div>
          </div>

          <div className="space-y-3 lg:space-y-4">
            {config.social_media?.map((social, index) => (
              <div key={index} className="p-3 lg:p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">🌐 Rede {index + 1}</h4>
                  <div className="flex items-center gap-2 lg:gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={social.enabled}
                        onChange={(e) => updateSocialMedia(index, 'enabled', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Ativo</span>
                    </label>
                    <button
                      onClick={() => removeSocialMedia(index)}
                      className="text-red-500 hover:text-red-600 cursor-pointer p-1"
                    >
                      <i className="ri-delete-bin-line text-lg"></i>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      📱 Plataforma
                    </label>
                    <input
                      type="text"
                      value={social.platform}
                      onChange={(e) => updateSocialMedia(index, 'platform', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Facebook"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      🎨 Ícone (Remix Icon)
                    </label>
                    <input
                      type="text"
                      value={social.icon}
                      onChange={(e) => updateSocialMedia(index, 'icon', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="ri-facebook-fill"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      🔗 URL
                    </label>
                    <input
                      type="text"
                      value={social.url}
                      onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      🎨 Cor
                    </label>
                    <select
                      value={social.color}
                      onChange={(e) => updateSocialMedia(index, 'color', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                    >
                      <option value="blue">🔵 Azul (Facebook)</option>
                      <option value="pink">🩷 Rosa (Instagram)</option>
                      <option value="sky">🔷 Azul Claro (Twitter)</option>
                      <option value="red">🔴 Vermelho (YouTube)</option>
                      <option value="purple">🟣 Roxo (LinkedIn)</option>
                      <option value="green">🟢 Verde (WhatsApp)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Settings */}
      {activeTab === 'form' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 space-y-4 lg:space-y-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white pb-3 lg:pb-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <i className="ri-mail-send-line text-orange-500"></i>
            Configurações do Formulário
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  📝 Título do Formulário
                </label>
                <input
                  type="text"
                  value={config.form_title}
                  onChange={(e) => setConfig({ ...config, form_title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  💬 Subtítulo
                </label>
                <input
                  type="text"
                  value={config.form_subtitle}
                  onChange={(e) => setConfig({ ...config, form_subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-3 lg:pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4">🏷️ Labels dos Campos</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    👤 Nome
                  </label>
                  <input
                    type="text"
                    value={config.form_name_label}
                    onChange={(e) => setConfig({ ...config, form_name_label: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    📧 E-mail
                  </label>
                  <input
                    type="text"
                    value={config.form_email_label}
                    onChange={(e) => setConfig({ ...config, form_email_label: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    📞 Telefone
                  </label>
                  <input
                    type="text"
                    value={config.form_phone_label}
                    onChange={(e) => setConfig({ ...config, form_phone_label: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    📋 Assunto
                  </label>
                  <input
                    type="text"
                    value={config.form_subject_label}
                    onChange={(e) => setConfig({ ...config, form_subject_label: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    💬 Mensagem
                  </label>
                  <input
                    type="text"
                    value={config.form_message_label}
                    onChange={(e) => setConfig({ ...config, form_message_label: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    📱 Método de Contacto Preferido
                  </label>
                  <input
                    type="text"
                    value={config.form_contact_method_label}
                    onChange={(e) => setConfig({ ...config, form_contact_method_label: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 lg:pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">📋 Assuntos do Formulário</h4>
                <button
                  onClick={addFormSubject}
                  className="px-2 lg:px-3 py-1 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  <i className="ri-add-line mr-1"></i>
                  Adicionar
                </button>
              </div>
              <div className="space-y-2">
                {config.form_subjects.map((subject, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={subject.value}
                      onChange={(e) => updateFormSubject(index, 'value', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="valor"
                    />
                    <input
                      type="text"
                      value={subject.label}
                      onChange={(e) => updateFormSubject(index, 'label', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Label"
                    />
                    <button
                      onClick={() => removeFormSubject(index)}
                      className="text-red-500 hover:text-red-600 cursor-pointer p-1"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 lg:pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    🔘 Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={config.form_submit_button}
                    onChange={(e) => setConfig({ ...config, form_submit_button: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    🔢 Limite de Caracteres (Mensagem)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    value={config.form_max_message_length}
                    onChange={(e) => setConfig({ ...config, form_max_message_length: parseInt(e.target.value) || 500 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    ✅ Mensagem de Sucesso
                  </label>
                  <input
                    type="text"
                    value={config.form_success_message}
                    onChange={(e) => setConfig({ ...config, form_success_message: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    ❌ Mensagem de Erro
                  </label>
                  <input
                    type="text"
                    value={config.form_error_message}
                    onChange={(e) => setConfig({ ...config, form_error_message: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Settings */}
      {activeTab === 'faq' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 lg:pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <i className="ri-question-answer-line text-yellow-500"></i>
                Perguntas Frequentes
              </h3>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure as FAQs exibidas na página
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.show_faq}
                  onChange={(e) => setConfig({ ...config, show_faq: e.target.checked })}
                  className="w-4 h-4 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500 cursor-pointer"
                />
                <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">Mostrar</span>
              </label>
              <button
                onClick={addFAQ}
                className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-1"></i>
                Adicionar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                📝 Título da Seção
              </label>
              <input
                type="text"
                value={config.faq_title}
                onChange={(e) => setConfig({ ...config, faq_title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                💬 Subtítulo
              </label>
              <input
                type="text"
                value={config.faq_subtitle}
                onChange={(e) => setConfig({ ...config, faq_subtitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-3 lg:space-y-4">
            {config.faqs.map((faq, index) => (
              <div key={index} className="p-3 lg:p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">❓ FAQ {index + 1}</h4>
                  <button
                    onClick={() => removeFAQ(index)}
                    className="text-red-500 hover:text-red-600 cursor-pointer p-1"
                  >
                    <i className="ri-delete-bin-line text-lg"></i>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    ❓ Pergunta
                  </label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Qual é a pergunta?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    💡 Resposta
                  </label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Resposta detalhada..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Settings */}
      {activeTab === 'map' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 lg:pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="ri-map-pin-line text-red-500"></i>
              Configurações do Mapa
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.show_map}
                onChange={(e) => setConfig({ ...config, show_map: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
              />
              <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">Mostrar Mapa</span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  📝 Título da Seção
                </label>
                <input
                  type="text"
                  value={config.map_title}
                  onChange={(e) => setConfig({ ...config, map_title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  💬 Subtítulo
                </label>
                <input
                  type="text"
                  value={config.map_subtitle}
                  onChange={(e) => setConfig({ ...config, map_subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                🗺️ URL do Google Maps Embed
              </label>
              <textarea
                value={config.map_embed_url}
                onChange={(e) => setConfig({ ...config, map_embed_url: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none font-mono"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 Cole o URL do iframe do Google Maps (Compartilhar → Incorporar um mapa)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Settings - NOVA ABA */}
      {activeTab === 'footer' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 space-y-4 lg:space-y-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white pb-3 lg:pb-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <i className="ri-layout-bottom-line text-indigo-500"></i>
            Configurações do Rodapé
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                📝 Texto do Rodapé
              </label>
              <input
                type="text"
                value={config.footer_text}
                onChange={(e) => setConfig({ ...config, footer_text: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Transformando ideias em realidade digital"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                © Copyright
              </label>
              <input
                type="text"
                value={config.footer_copyright}
                onChange={(e) => setConfig({ ...config, footer_copyright: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="© 2025 Sua Empresa. Todos os direitos reservados."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
