import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface SiteConfig {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  favicon_url: string;
  
  // Contatos
  email_primary: string;
  email_secondary: string;
  phone_primary: string;
  phone_secondary: string;
  whatsapp_primary: string;
  whatsapp_secondary: string;
  telegram_bot_token: string;
  telegram_chat_id: string;
  address: string;
  
  // Redes Sociais
  facebook_url: string;
  instagram_url: string;
  vinted_url: string;
  snapchat_url: string;
  telegram_url: string;
  
  // Métodos de Pagamento
  accept_visa: boolean;
  accept_mastercard: boolean;
  accept_apple_pay: boolean;
  accept_google_pay: boolean;
  accept_paypal: boolean;
  paypal_email: string;
  
  // Envio Grátis
  free_shipping_enabled: boolean;
  free_shipping_minimum: number;
  
  // Textos das Páginas
  about_text: string;
  terms_text: string;
  privacy_text: string;
  
  // Hero Section
  hero_title: string;
  hero_subtitle: string;
  hero_button_text: string;
}

export default function SiteSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [config, setConfig] = useState<SiteConfig>({
    id: '00000000-0000-0000-0000-000000000001',
    name: 'JokaTech',
    description: 'Especialistas em PCs Gaming de Alto Desempenho',
    logo_url: 'https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/cb4831d791909a4a7679c925d26faa2b.png',
    favicon_url: '',
    email_primary: 'jokadas69@gmail.com',
    email_secondary: 'jokadaskz69@gmail.com',
    phone_primary: '+352 621 717 862',
    phone_secondary: '+352 621 377 168',
    whatsapp_primary: '+352621717862',
    whatsapp_secondary: '+352621377168',
    telegram_bot_token: '8338585182:AAFg15iJyOOTpKiBBYg-opqBcEvc3nfCInQ',
    telegram_chat_id: '7343664374',
    address: 'Luxembourg City, Luxembourg',
    facebook_url: 'https://www.facebook.com/jokatech',
    instagram_url: 'https://www.instagram.com/jokatech',
    vinted_url: 'https://www.vinted.com/jokatech',
    snapchat_url: 'https://www.snapchat.com/add/hitill1die?share_id=nWonN10a6d0&locale=pt-PT',
    telegram_url: 'https://t.me/jokatech_bot',
    accept_visa: true,
    accept_mastercard: true,
    accept_apple_pay: true,
    accept_google_pay: true,
    accept_paypal: true,
    paypal_email: 'jokadas69@gmail.com',
    free_shipping_enabled: true,
    free_shipping_minimum: 50.00,
    about_text: '',
    terms_text: '',
    privacy_text: '',
    hero_title: 'Bem-vindo à JokaTech',
    hero_subtitle: 'Os Melhores PCs Gaming de Alto Desempenho',
    hero_button_text: 'Ver Produtos'
  });

  useEffect(() => {
    loadConfig();
    
    // Tempo real
    const channel = supabase
      .channel('company-info-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company_info' }, () => {
        loadConfig();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('company_info')
        .update(config)
        .eq('id', config.id);

      if (error) throw error;

      alert('✅ Configurações salvas com sucesso! As alterações serão aplicadas em todo o site.');
      loadConfig();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('❌ Erro ao salvar configurações!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-400">Carregando configurações...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Informações Gerais', icon: 'ri-information-line' },
    { id: 'logos', label: 'Logos e Imagens', icon: 'ri-image-line' },
    { id: 'contact', label: 'Contatos', icon: 'ri-mail-line' },
    { id: 'social', label: 'Redes Sociais', icon: 'ri-share-line' },
    { id: 'payment', label: 'Métodos de Pagamento', icon: 'ri-bank-card-line' },
    { id: 'shipping', label: 'Envio Grátis', icon: 'ri-truck-line' },
    { id: 'hero', label: 'Hero Section', icon: 'ri-layout-top-line' },
    { id: 'texts', label: 'Textos das Páginas', icon: 'ri-file-text-line' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">⚙️ Configurações do Site</h2>
          <p className="text-gray-400">Controle total do site em tempo real</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          {saving ? (
            <>
              <i className="ri-loader-4-line animate-spin"></i>
              SALVANDO...
            </>
          ) : (
            <>
              <i className="ri-save-line"></i>
              SALVAR ALTERAÇÕES
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                : 'bg-black/60 text-gray-400 hover:bg-black/80 border border-red-500/20'
            }`}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
        {/* Informações Gerais */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nome do Site
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Descrição do Site
              </label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Endereço
              </label>
              <textarea
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Logos e Imagens */}
        {activeTab === 'logos' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                URL do Logo
              </label>
              <input
                type="url"
                value={config.logo_url}
                onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="https://exemplo.com/logo.png"
              />
              {config.logo_url && (
                <div className="mt-3 p-4 bg-white rounded-lg">
                  <img src={config.logo_url} alt="Logo Preview" className="h-16 object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                URL do Favicon
              </label>
              <input
                type="url"
                value={config.favicon_url}
                onChange={(e) => setConfig({ ...config, favicon_url: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="https://exemplo.com/favicon.ico"
              />
            </div>
          </div>
        )}

        {/* Contatos */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Principal
                </label>
                <input
                  type="email"
                  value={config.email_primary}
                  onChange={(e) => setConfig({ ...config, email_primary: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Secundário
                </label>
                <input
                  type="email"
                  value={config.email_secondary}
                  onChange={(e) => setConfig({ ...config, email_secondary: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Telefone Principal
                </label>
                <input
                  type="tel"
                  value={config.phone_primary}
                  onChange={(e) => setConfig({ ...config, phone_primary: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Telefone Secundário
                </label>
                <input
                  type="tel"
                  value={config.phone_secondary}
                  onChange={(e) => setConfig({ ...config, phone_secondary: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  WhatsApp Principal
                </label>
                <input
                  type="tel"
                  value={config.whatsapp_primary}
                  onChange={(e) => setConfig({ ...config, whatsapp_primary: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  WhatsApp Secundário
                </label>
                <input
                  type="tel"
                  value={config.whatsapp_secondary}
                  onChange={(e) => setConfig({ ...config, whatsapp_secondary: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Telegram Bot Token
                </label>
                <input
                  type="text"
                  value={config.telegram_bot_token}
                  onChange={(e) => setConfig({ ...config, telegram_bot_token: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Telegram Chat ID
                </label>
                <input
                  type="text"
                  value={config.telegram_chat_id}
                  onChange={(e) => setConfig({ ...config, telegram_chat_id: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Redes Sociais */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <i className="ri-facebook-fill text-blue-500 mr-2"></i>
                Facebook
              </label>
              <input
                type="url"
                value={config.facebook_url}
                onChange={(e) => setConfig({ ...config, facebook_url: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="https://facebook.com/jokatech"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <i className="ri-instagram-fill text-pink-500 mr-2"></i>
                Instagram
              </label>
              <input
                type="url"
                value={config.instagram_url}
                onChange={(e) => setConfig({ ...config, instagram_url: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="https://instagram.com/jokatech"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <i className="ri-shopping-bag-fill text-green-500 mr-2"></i>
                Vinted
              </label>
              <input
                type="url"
                value={config.vinted_url}
                onChange={(e) => setConfig({ ...config, vinted_url: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="https://vinted.com/jokatech"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <i className="ri-snapchat-fill text-yellow-500 mr-2"></i>
                Snapchat
              </label>
              <input
                type="url"
                value={config.snapchat_url}
                onChange={(e) => setConfig({ ...config, snapchat_url: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="https://snapchat.com/add/jokatech"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <i className="ri-telegram-fill text-blue-400 mr-2"></i>
                Telegram
              </label>
              <input
                type="url"
                value={config.telegram_url}
                onChange={(e) => setConfig({ ...config, telegram_url: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="https://t.me/jokatech_bot"
              />
            </div>
          </div>
        )}

        {/* Métodos de Pagamento */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 bg-black/40 border border-red-500/30 rounded-lg cursor-pointer hover:bg-black/60 transition-all">
                <input
                  type="checkbox"
                  checked={config.accept_visa}
                  onChange={(e) => setConfig({ ...config, accept_visa: e.target.checked })}
                  className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                />
                <span className="text-white font-medium">💳 Visa</span>
              </label>

              <label className="flex items-center gap-3 p-4 bg-black/40 border border-red-500/30 rounded-lg cursor-pointer hover:bg-black/60 transition-all">
                <input
                  type="checkbox"
                  checked={config.accept_mastercard}
                  onChange={(e) => setConfig({ ...config, accept_mastercard: e.target.checked })}
                  className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                />
                <span className="text-white font-medium">💳 Mastercard</span>
              </label>

              <label className="flex items-center gap-3 p-4 bg-black/40 border border-red-500/30 rounded-lg cursor-pointer hover:bg-black/60 transition-all">
                <input
                  type="checkbox"
                  checked={config.accept_apple_pay}
                  onChange={(e) => setConfig({ ...config, accept_apple_pay: e.target.checked })}
                  className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                />
                <span className="text-white font-medium">🍎 Apple Pay</span>
              </label>

              <label className="flex items-center gap-3 p-4 bg-black/40 border border-red-500/30 rounded-lg cursor-pointer hover:bg-black/60 transition-all">
                <input
                  type="checkbox"
                  checked={config.accept_google_pay}
                  onChange={(e) => setConfig({ ...config, accept_google_pay: e.target.checked })}
                  className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                />
                <span className="text-white font-medium">🔵 Google Pay</span>
              </label>

              <label className="flex items-center gap-3 p-4 bg-black/40 border border-red-500/30 rounded-lg cursor-pointer hover:bg-black/60 transition-all">
                <input
                  type="checkbox"
                  checked={config.accept_paypal}
                  onChange={(e) => setConfig({ ...config, accept_paypal: e.target.checked })}
                  className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                />
                <span className="text-white font-medium">💰 PayPal</span>
              </label>
            </div>

            {config.accept_paypal && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email do PayPal
                </label>
                <input
                  type="email"
                  value={config.paypal_email}
                  onChange={(e) => setConfig({ ...config, paypal_email: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Envio Grátis */}
        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 bg-black/40 border border-red-500/30 rounded-lg cursor-pointer hover:bg-black/60 transition-all">
              <input
                type="checkbox"
                checked={config.free_shipping_enabled}
                onChange={(e) => setConfig({ ...config, free_shipping_enabled: e.target.checked })}
                className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
              />
              <span className="text-white font-medium">🚚 Ativar Envio Grátis</span>
            </label>

            {config.free_shipping_enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Valor Mínimo para Envio Grátis (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.free_shipping_minimum}
                  onChange={(e) => setConfig({ ...config, free_shipping_minimum: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Hero Section */}
        {activeTab === 'hero' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Título Principal
              </label>
              <input
                type="text"
                value={config.hero_title}
                onChange={(e) => setConfig({ ...config, hero_title: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Subtítulo
              </label>
              <input
                type="text"
                value={config.hero_subtitle}
                onChange={(e) => setConfig({ ...config, hero_subtitle: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Texto do Botão
              </label>
              <input
                type="text"
                value={config.hero_button_text}
                onChange={(e) => setConfig({ ...config, hero_button_text: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        )}

        {/* Textos das Páginas */}
        {activeTab === 'texts' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Sobre Nós
              </label>
              <textarea
                value={config.about_text}
                onChange={(e) => setConfig({ ...config, about_text: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                placeholder="Texto da página Sobre Nós..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Termos de Serviço
              </label>
              <textarea
                value={config.terms_text}
                onChange={(e) => setConfig({ ...config, terms_text: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                placeholder="Texto dos Termos de Serviço..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Política de Privacidade
              </label>
              <textarea
                value={config.privacy_text}
                onChange={(e) => setConfig({ ...config, privacy_text: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                placeholder="Texto da Política de Privacidade..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}