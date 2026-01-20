import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

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

interface ContactPageConfig {
  hero_title: string;
  hero_highlight: string;
  hero_subtitle: string;
  hero_bg_image: string;
  contact_methods: ContactMethod[];
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
  form_max_message_length: number;
}

export default function ContactPage() {
  const { darkMode } = useTheme();
  const [config, setConfig] = useState<ContactPageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    contactMethod: 'any'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
      // Usar valores padrão em caso de erro
      setConfig({
        hero_title: 'Entre em',
        hero_highlight: 'Contacto',
        hero_subtitle: 'Estamos prontos para transformar suas ideias em realidade. Fale connosco!',
        hero_bg_image: 'https://readdy.ai/api/search-image?query=abstract%20modern%20communication%20background%20with%20network%20connections%20digital%20contact%20and%20technology%20elements%20in%20dark%20tones%20with%20golden%20accents&width=1920&height=600&seq=contactbg1&orientation=landscape',
        contact_methods: [],
        form_title: 'Envie uma Mensagem',
        form_subtitle: 'Preencha o formulário e entraremos em contacto em breve',
        form_name_label: 'Nome Completo',
        form_email_label: 'E-mail',
        form_phone_label: 'Telefone',
        form_subject_label: 'Assunto',
        form_message_label: 'Mensagem',
        form_contact_method_label: 'Como prefere ser contactado?',
        form_submit_button: 'Enviar Mensagem',
        form_success_message: 'Mensagem enviada com sucesso!',
        form_error_message: 'Erro ao enviar mensagem.',
        form_subjects: [],
        contact_method_options: [],
        faq_title: 'Perguntas Frequentes',
        faq_subtitle: 'Respostas para as dúvidas mais comuns',
        faqs: [],
        map_title: 'Onde Estamos',
        map_subtitle: 'Luxemburgo - Atendimento remoto em todo o mundo',
        map_embed_url: '',
        show_map: true,
        show_contact_methods: true,
        show_faq: true,
        form_max_message_length: 500
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const form = e.target as HTMLFormElement;
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('contactMethod', formData.contactMethod);

      const response = await fetch('https://readdy.ai/api/form/d5mf6n772m0gvhnvdm9g', {
        method: 'POST',
        body: new URLSearchParams(formDataToSend as any)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          contactMethod: 'any'
        });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Limitar caracteres da mensagem
    if (name === 'message' && config && value.length > config.form_max_message_length) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      purple: {
        bg: darkMode ? 'bg-purple-500/20' : 'bg-purple-100',
        text: darkMode ? 'text-purple-400' : 'text-purple-600',
        hover: darkMode ? 'group-hover:bg-purple-500' : 'group-hover:bg-purple-500'
      },
      green: {
        bg: darkMode ? 'bg-green-500/20' : 'bg-green-100',
        text: darkMode ? 'text-green-400' : 'text-green-600',
        hover: darkMode ? 'group-hover:bg-green-500' : 'group-hover:bg-green-500'
      },
      orange: {
        bg: darkMode ? 'bg-orange-500/20' : 'bg-orange-100',
        text: darkMode ? 'text-orange-400' : 'text-orange-600',
        hover: darkMode ? 'group-hover:bg-orange-500' : 'group-hover:bg-orange-500'
      },
      blue: {
        bg: darkMode ? 'bg-blue-500/20' : 'bg-blue-100',
        text: darkMode ? 'text-blue-400' : 'text-blue-600',
        hover: darkMode ? 'group-hover:bg-blue-500' : 'group-hover:bg-blue-500'
      }
    };
    return colors[color] || colors.purple;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex flex-col items-center gap-4">
          <i className="ri-loader-4-line text-5xl text-purple-500 animate-spin"></i>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>A carregar...</p>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Hero Section */}
      <section className={`relative ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900' : 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'} text-white py-20 overflow-hidden`}>
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${config.hero_bg_image})` }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold">
              {config.hero_title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">{config.hero_highlight}</span>
            </h1>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-300'}`}>
              {config.hero_subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      {config.show_contact_methods && config.contact_methods.length > 0 && (
        <section className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {config.contact_methods.filter(m => m.enabled).map((method, index) => {
                const colorClasses = getColorClasses(method.color);
                return (
                  <a
                    key={index}
                    href={method.link}
                    target={method.link.startsWith('http') ? '_blank' : undefined}
                    rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white'} p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center group cursor-pointer`}
                  >
                    <div className={`w-16 h-16 flex items-center justify-center ${colorClasses.bg} ${colorClasses.text} rounded-full mx-auto mb-6 ${colorClasses.hover} group-hover:text-white transition-all duration-300`}>
                      <i className={`${method.icon} text-3xl`}></i>
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{method.title}</h3>
                    <p className={`text-lg font-semibold mb-2 ${colorClasses.text}`}>{method.value}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{method.description}</p>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Contact Form */}
      <section className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{config.form_title}</h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{config.form_subtitle}</p>
          </div>

          <form 
            onSubmit={handleSubmit} 
            data-readdy-form
            className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-8 rounded-2xl shadow-lg space-y-6`}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {config.form_name_label} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm`}
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {config.form_email_label} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm`}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {config.form_phone_label}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm`}
                  placeholder="+352 XXX XXX XXX"
                />
              </div>

              <div>
                <label htmlFor="subject" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {config.form_subject_label} *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm cursor-pointer`}
                >
                  <option value="">Selecione um assunto</option>
                  {config.form_subjects.map((subject, index) => (
                    <option key={index} value={subject.value}>{subject.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Method Preference */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {config.form_contact_method_label} *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {config.contact_method_options.map((option, index) => (
                  <label
                    key={index}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                      formData.contactMethod === option.value
                        ? darkMode
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-purple-500 bg-purple-50'
                        : darkMode
                        ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="contactMethod"
                      value={option.value}
                      checked={formData.contactMethod === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <i className={`${option.icon} text-2xl mb-2 ${
                      formData.contactMethod === option.value
                        ? 'text-purple-500'
                        : darkMode
                        ? 'text-gray-400'
                        : 'text-gray-600'
                    }`}></i>
                    <span className={`text-xs font-medium text-center ${
                      formData.contactMethod === option.value
                        ? 'text-purple-500'
                        : darkMode
                        ? 'text-gray-300'
                        : 'text-gray-700'
                    }`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="message" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {config.form_message_label} *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                maxLength={config.form_max_message_length}
                className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none text-sm`}
                placeholder="Descreva seu projeto ou dúvida..."
              />
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {formData.message.length}/{config.form_max_message_length} caracteres
              </p>
            </div>

            {submitStatus === 'success' && (
              <div className={`${darkMode ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-green-50 border-green-200 text-green-800'} border px-4 py-3 rounded-lg flex items-center gap-3`}>
                <i className="ri-check-line text-xl"></i>
                <span>{config.form_success_message}</span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className={`${darkMode ? 'bg-red-900/30 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-800'} border px-4 py-3 rounded-lg flex items-center gap-3`}>
                <i className="ri-error-warning-line text-xl"></i>
                <span>{config.form_error_message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer hover:scale-105"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i>
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-send-plane-line"></i>
                  {config.form_submit_button}
                </span>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      {config.show_faq && config.faqs.length > 0 && (
        <section className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{config.faq_title}</h2>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{config.faq_subtitle}</p>
            </div>

            <div className="space-y-4">
              {config.faqs.map((faq, index) => (
                <details key={index} className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-md overflow-hidden group`}>
                  <summary className={`px-6 py-4 font-semibold ${darkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-50'} cursor-pointer transition-colors flex items-center justify-between`}>
                    <span>{faq.question}</span>
                    <i className="ri-arrow-down-s-line text-xl group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div className={`px-6 py-4 ${darkMode ? 'text-gray-400 border-gray-800' : 'text-gray-600 border-gray-100'} border-t`}>
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Map Section */}
      {config.show_map && config.map_embed_url && (
        <section className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{config.map_title}</h2>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{config.map_subtitle}</p>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-2xl overflow-hidden shadow-lg`} style={{ height: '400px' }}>
              <iframe
                src={config.map_embed_url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização"
              ></iframe>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
