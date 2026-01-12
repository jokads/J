import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function ControloTotal() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [saveMessage, setSaveMessage] = useState('');

  // Estados para configurações gerais
  const [siteConfig, setSiteConfig] = useState({
    siteName: 'JokaTech',
    siteDescription: 'Loja especializada em componentes de PC Gaming e Hardware de alta performance',
    siteEmail: 'jokadas69@gmail.com',
    sitePhone: '+352 621 717 862',
    siteAddress: 'Luxemburgo, Europa',
    freeShippingThreshold: 100,
    assemblyFee: 50,
    whatsappNumber: '+352621717862',
    facebookUrl: 'https://facebook.com/jokatech',
    instagramUrl: 'https://instagram.com/jokatech',
    telegramUrl: 'https://t.me/jokatech',
    vintedUrl: 'https://vinted.com/jokatech'
  });

  // Estados para logos e imagens
  const [logoConfig, setLogoConfig] = useState({
    mainLogo: 'https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/cb4831d791909a4a7679c925d26faa2b.png',
    favicon: 'https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/cb4831d791909a4a7679c925d26faa2b.png',
    heroImage: 'https://readdy.ai/api/search-image?query=high%20end%20gaming%20PC%20tower%20with%20glowing%20RGB%20LED%20components&width=1920&height=1080&seq=hero-pc&orientation=landscape'
  });

  // Estados para textos das páginas
  const [pageTexts, setPageTexts] = useState({
    homeHeroTitle: 'PCs de Alto Desempenho',
    homeHeroSubtitle: 'Componentes premium, montagem profissional, garantia total',
    aboutTitle: 'Sobre a JokaTech',
    aboutDescription: 'Especialistas em hardware gaming desde 2019',
    contactTitle: 'Entre em Contato',
    contactDescription: 'Estamos aqui para ajudar você'
  });

  // Estados para fundadores
  const [founders, setFounders] = useState([
    {
      id: 1,
      name: 'Claudio Pereira',
      role: 'Fundador & CEO',
      email: 'jokadas69@gmail.com',
      phone: '+352 621 717 862',
      whatsapp: '+352621717862',
      photo: 'https://readdy.ai/api/search-image?query=professional%20tech%20CEO%20portrait%20business%20photo&width=400&height=400&seq=founder1&orientation=squarish'
    },
    {
      id: 2,
      name: 'Mariana Pereira',
      role: 'Co-Fundadora & CFO',
      email: 'jokadaskz69@gmail.com',
      phone: '+352 621 377 168',
      whatsapp: '+352621377168',
      photo: 'https://readdy.ai/api/search-image?query=professional%20tech%20CFO%20portrait%20business%20photo%20woman&width=400&height=400&seq=founder2&orientation=squarish'
    }
  ]);

  const handleSaveGeneral = async () => {
    setLoading(true);
    setSaveMessage('');

    try {
      // Salvar no localStorage (pode ser adaptado para Supabase)
      localStorage.setItem('siteConfig', JSON.stringify(siteConfig));
      
      setSaveMessage('✅ Configurações gerais salvas com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setSaveMessage('❌ Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLogos = async () => {
    setLoading(true);
    setSaveMessage('');

    try {
      localStorage.setItem('logoConfig', JSON.stringify(logoConfig));
      
      setSaveMessage('✅ Logos e imagens salvos com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setSaveMessage('❌ Erro ao salvar logos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTexts = async () => {
    setLoading(true);
    setSaveMessage('');

    try {
      localStorage.setItem('pageTexts', JSON.stringify(pageTexts));
      
      setSaveMessage('✅ Textos das páginas salvos com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setSaveMessage('❌ Erro ao salvar textos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFounders = async () => {
    setLoading(true);
    setSaveMessage('');

    try {
      localStorage.setItem('founders', JSON.stringify(founders));
      
      setSaveMessage('✅ Informações dos fundadores salvas com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setSaveMessage('❌ Erro ao salvar fundadores');
    } finally {
      setLoading(false);
    }
  };

  // Carregar configurações salvas
  useEffect(() => {
    const savedConfig = localStorage.getItem('siteConfig');
    const savedLogos = localStorage.getItem('logoConfig');
    const savedTexts = localStorage.getItem('pageTexts');
    const savedFounders = localStorage.getItem('founders');

    if (savedConfig) setSiteConfig(JSON.parse(savedConfig));
    if (savedLogos) setLogoConfig(JSON.parse(savedLogos));
    if (savedTexts) setPageTexts(JSON.parse(savedTexts));
    if (savedFounders) setFounders(JSON.parse(savedFounders));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-2 border-purple-500/30 rounded-xl p-6">
        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <i className="ri-settings-3-line text-purple-400"></i>
          🎯 CONTROLO TOTAL DO SITE
        </h2>
        <p className="text-gray-300">
          Edite todas as informações do site em um só lugar: logos, títulos, descrições, contatos, redes sociais e muito mais.
        </p>
      </div>

      {/* Mensagem de Sucesso/Erro */}
      {saveMessage && (
        <div className={`p-4 rounded-lg border-2 ${
          saveMessage.includes('✅') 
            ? 'bg-green-500/20 border-green-500/50 text-green-400' 
            : 'bg-red-500/20 border-red-500/50 text-red-400'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-black/60 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden">
        <div className="flex border-b border-purple-500/20 overflow-x-auto">
          <button
            onClick={() => setActiveTab('geral')}
            className={`px-6 py-4 font-bold transition-all whitespace-nowrap ${
              activeTab === 'geral'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-black'
                : 'text-gray-400 hover:text-white hover:bg-purple-500/10'
            }`}
          >
            <i className="ri-settings-line mr-2"></i>
            Informações Gerais
          </button>
          <button
            onClick={() => setActiveTab('logos')}
            className={`px-6 py-4 font-bold transition-all whitespace-nowrap ${
              activeTab === 'logos'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-black'
                : 'text-gray-400 hover:text-white hover:bg-purple-500/10'
            }`}
          >
            <i className="ri-image-line mr-2"></i>
            Logos e Imagens
          </button>
          <button
            onClick={() => setActiveTab('textos')}
            className={`px-6 py-4 font-bold transition-all whitespace-nowrap ${
              activeTab === 'textos'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-black'
                : 'text-gray-400 hover:text-white hover:bg-purple-500/10'
            }`}
          >
            <i className="ri-text mr-2"></i>
            Textos das Páginas
          </button>
          <button
            onClick={() => setActiveTab('fundadores')}
            className={`px-6 py-4 font-bold transition-all whitespace-nowrap ${
              activeTab === 'fundadores'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-black'
                : 'text-gray-400 hover:text-white hover:bg-purple-500/10'
            }`}
          >
            <i className="ri-user-star-line mr-2"></i>
            Fundadores
          </button>
        </div>

        <div className="p-6">
          {/* ABA: INFORMAÇÕES GERAIS */}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">📋 Informações Gerais do Site</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Nome do Site
                  </label>
                  <input
                    type="text"
                    value={siteConfig.siteName}
                    onChange={(e) => setSiteConfig({...siteConfig, siteName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Email Principal
                  </label>
                  <input
                    type="email"
                    value={siteConfig.siteEmail}
                    onChange={(e) => setSiteConfig({...siteConfig, siteEmail: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Telefone Principal
                  </label>
                  <input
                    type="tel"
                    value={siteConfig.sitePhone}
                    onChange={(e) => setSiteConfig({...siteConfig, sitePhone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    WhatsApp (com código do país)
                  </label>
                  <input
                    type="text"
                    value={siteConfig.whatsappNumber}
                    onChange={(e) => setSiteConfig({...siteConfig, whatsappNumber: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+352621717862"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={siteConfig.siteAddress}
                    onChange={(e) => setSiteConfig({...siteConfig, siteAddress: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Descrição do Site
                  </label>
                  <textarea
                    value={siteConfig.siteDescription}
                    onChange={(e) => setSiteConfig({...siteConfig, siteDescription: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Valor Mínimo para Frete Grátis (€)
                  </label>
                  <input
                    type="number"
                    value={siteConfig.freeShippingThreshold}
                    onChange={(e) => setSiteConfig({...siteConfig, freeShippingThreshold: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Taxa de Montagem de PC (€)
                  </label>
                  <input
                    type="number"
                    value={siteConfig.assemblyFee}
                    onChange={(e) => setSiteConfig({...siteConfig, assemblyFee: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-lg font-bold text-white mb-4">🌐 Redes Sociais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={siteConfig.facebookUrl}
                      onChange={(e) => setSiteConfig({...siteConfig, facebookUrl: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={siteConfig.instagramUrl}
                      onChange={(e) => setSiteConfig({...siteConfig, instagramUrl: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Telegram URL
                    </label>
                    <input
                      type="url"
                      value={siteConfig.telegramUrl}
                      onChange={(e) => setSiteConfig({...siteConfig, telegramUrl: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Vinted URL
                    </label>
                    <input
                      type="url"
                      value={siteConfig.vintedUrl}
                      onChange={(e) => setSiteConfig({...siteConfig, vintedUrl: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveGeneral}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : '💾 SALVAR INFORMAÇÕES GERAIS'}
              </button>
            </div>
          )}

          {/* ABA: LOGOS E IMAGENS */}
          {activeTab === 'logos' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">🖼️ Logos e Imagens do Site</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Logo Principal
                  </label>
                  <input
                    type="url"
                    value={logoConfig.mainLogo}
                    onChange={(e) => setLogoConfig({...logoConfig, mainLogo: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3"
                    placeholder="URL da imagem"
                  />
                  {logoConfig.mainLogo && (
                    <div className="bg-white rounded-lg p-4 inline-block">
                      <img src={logoConfig.mainLogo} alt="Logo" className="h-16 object-contain" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Favicon
                  </label>
                  <input
                    type="url"
                    value={logoConfig.favicon}
                    onChange={(e) => setLogoConfig({...logoConfig, favicon: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3"
                    placeholder="URL da imagem"
                  />
                  {logoConfig.favicon && (
                    <div className="bg-white rounded-lg p-4 inline-block">
                      <img src={logoConfig.favicon} alt="Favicon" className="h-8 object-contain" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Imagem Hero (Página Inicial)
                  </label>
                  <input
                    type="url"
                    value={logoConfig.heroImage}
                    onChange={(e) => setLogoConfig({...logoConfig, heroImage: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3"
                    placeholder="URL da imagem"
                  />
                  {logoConfig.heroImage && (
                    <div className="rounded-lg overflow-hidden">
                      <img src={logoConfig.heroImage} alt="Hero" className="w-full h-48 object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSaveLogos}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : '💾 SALVAR LOGOS E IMAGENS'}
              </button>
            </div>
          )}

          {/* ABA: TEXTOS DAS PÁGINAS */}
          {activeTab === 'textos' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">📝 Textos das Páginas</h3>

              <div className="space-y-6">
                <div className="border-b border-gray-700 pb-6">
                  <h4 className="text-lg font-bold text-purple-400 mb-4">🏠 Página Inicial - Hero</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Título Principal
                      </label>
                      <input
                        type="text"
                        value={pageTexts.homeHeroTitle}
                        onChange={(e) => setPageTexts({...pageTexts, homeHeroTitle: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Subtítulo
                      </label>
                      <input
                        type="text"
                        value={pageTexts.homeHeroSubtitle}
                        onChange={(e) => setPageTexts({...pageTexts, homeHeroSubtitle: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-700 pb-6">
                  <h4 className="text-lg font-bold text-purple-400 mb-4">ℹ️ Página Sobre</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Título
                      </label>
                      <input
                        type="text"
                        value={pageTexts.aboutTitle}
                        onChange={(e) => setPageTexts({...pageTexts, aboutTitle: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Descrição
                      </label>
                      <textarea
                        value={pageTexts.aboutDescription}
                        onChange={(e) => setPageTexts({...pageTexts, aboutDescription: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-purple-400 mb-4">📞 Página Contato</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Título
                      </label>
                      <input
                        type="text"
                        value={pageTexts.contactTitle}
                        onChange={(e) => setPageTexts({...pageTexts, contactTitle: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Descrição
                      </label>
                      <input
                        type="text"
                        value={pageTexts.contactDescription}
                        onChange={(e) => setPageTexts({...pageTexts, contactDescription: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveTexts}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : '💾 SALVAR TEXTOS DAS PÁGINAS'}
              </button>
            </div>
          )}

          {/* ABA: FUNDADORES */}
          {activeTab === 'fundadores' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">👥 Informações dos Fundadores</h3>

              {founders.map((founder, index) => (
                <div key={founder.id} className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
                  <h4 className="text-lg font-bold text-purple-400 mb-4">
                    {index === 0 ? '👨‍💼 Fundador Principal' : '👩‍💼 Co-Fundadora'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={founder.name}
                        onChange={(e) => {
                          const newFounders = [...founders];
                          newFounders[index].name = e.target.value;
                          setFounders(newFounders);
                        }}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Cargo
                      </label>
                      <input
                        type="text"
                        value={founder.role}
                        onChange={(e) => {
                          const newFounders = [...founders];
                          newFounders[index].role = e.target.value;
                          setFounders(newFounders);
                        }}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={founder.email}
                        onChange={(e) => {
                          const newFounders = [...founders];
                          newFounders[index].email = e.target.value;
                          setFounders(newFounders);
                        }}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={founder.phone}
                        onChange={(e) => {
                          const newFounders = [...founders];
                          newFounders[index].phone = e.target.value;
                          setFounders(newFounders);
                        }}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        WhatsApp (com código)
                      </label>
                      <input
                        type="text"
                        value={founder.whatsapp}
                        onChange={(e) => {
                          const newFounders = [...founders];
                          newFounders[index].whatsapp = e.target.value;
                          setFounders(newFounders);
                        }}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="+352621717862"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        URL da Foto
                      </label>
                      <input
                        type="url"
                        value={founder.photo}
                        onChange={(e) => {
                          const newFounders = [...founders];
                          newFounders[index].photo = e.target.value;
                          setFounders(newFounders);
                        }}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {founder.photo && (
                    <div className="mt-4">
                      <p className="text-sm font-bold text-gray-300 mb-2">Preview da Foto:</p>
                      <img 
                        src={founder.photo} 
                        alt={founder.name} 
                        className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
                      />
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={handleSaveFounders}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : '💾 SALVAR INFORMAÇÕES DOS FUNDADORES'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
