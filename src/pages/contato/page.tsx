import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    contactMethod: 'email_primary' // 🔥 NOVO: Método de contato preferido
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: submitError } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            contact_method: formData.contactMethod,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);

      if (submitError) {
        console.error('Erro ao enviar mensagem:', submitError);
        throw new Error('Erro ao enviar mensagem. Tente novamente.');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '', contactMethod: 'email_primary' });
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappPrimary = '+352621717862';
  const whatsappSecondary = '+352621377168';
  const emailPrimary = 'jokadas69@gmail.com';
  const emailSecondary = 'jokadaskz69@gmail.com';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <Navbar />
      
      {/* 🔥 HERO SECTION - CORRIGIDO COM JANELA TRANSPARENTE E TÍTULO COMPLETO */}
      <section className="relative py-20 overflow-hidden mt-16">
        {/* Imagem de Fundo */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=modern%20professional%20customer%20service%20contact%20center%20with%20computers%20and%20headsets%20dark%20elegant%20office%20environment%20with%20red%20accent%20lighting%20business%20communication%20technology%20setup&width=1920&height=600&seq=contact-hero-bg-v1&orientation=landscape')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85"></div>
        </div>

        {/* Conteúdo */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* 🎯 JANELA PROFISSIONAL COM FUNDO TRANSPARENTE */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border-2 border-red-500/40 shadow-2xl shadow-red-500/30 p-8 lg:p-10">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/30 to-red-600/30 border border-red-500/50 rounded-full mb-4 backdrop-blur-md">
                <i className="ri-customer-service-2-line text-red-400"></i>
                <span className="text-red-400 text-sm font-bold uppercase tracking-wider">Atendimento 24/7</span>
              </div>

              {/* Título COMPLETO */}
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Entre em <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Contato</span>
              </h1>

              {/* Descrição */}
              <p className="text-lg text-gray-300 mb-6">
                Estamos aqui para ajudar! Escolha a melhor forma de nos contatar.
              </p>

              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-black text-red-400">24/7</div>
                  <div className="text-xs text-gray-400 font-medium mt-1">Disponível</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-red-400">&lt;2h</div>
                  <div className="text-xs text-gray-400 font-medium mt-1">Resposta</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-red-400">20+</div>
                  <div className="text-xs text-gray-400 font-medium mt-1">Idiomas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔥 CANAIS DE ATENDIMENTO - CORRIGIDO E COMPLETO */}
      <section className="py-12 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              📞 Canais de Atendimento ao Cliente
            </h2>
            
            {/* 🔥 GRID PRINCIPAL - WhatsApp, Email e Telegram */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* WhatsApp Primary - Claudio */}
              <a
                href={`https://wa.me/${whatsappPrimary.replace(/[^0-9]/g, '')}?text=Olá! Gostaria de mais informações.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
              >
                <div className="flex flex-col items-center text-center">
                  <i className="ri-whatsapp-line text-5xl text-white mb-4"></i>
                  <h3 className="text-xl font-bold text-white mb-2">WhatsApp Primário</h3>
                  <p className="text-sm text-white/90 mb-1">Claudio</p>
                  <p className="text-sm text-white/90">{whatsappPrimary}</p>
                  <span className="mt-4 text-xs text-white/80">Clique para conversar</span>
                </div>
              </a>

              {/* WhatsApp Secondary - Mariana */}
              <a
                href={`https://wa.me/${whatsappSecondary.replace(/[^0-9]/g, '')}?text=Olá! Gostaria de mais informações.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-400/50"
              >
                <div className="flex flex-col items-center text-center">
                  <i className="ri-whatsapp-line text-5xl text-white mb-4"></i>
                  <h3 className="text-xl font-bold text-white mb-2">WhatsApp Secundário</h3>
                  <p className="text-sm text-white/90 mb-1">Mariana</p>
                  <p className="text-sm text-white/90">{whatsappSecondary}</p>
                  <span className="mt-4 text-xs text-white/80">Clique para conversar</span>
                </div>
              </a>

              {/* Email Primary */}
              <a
                href={`mailto:${emailPrimary}`}
                className="group bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/50"
              >
                <div className="flex flex-col items-center text-center">
                  <i className="ri-mail-line text-5xl text-white mb-4"></i>
                  <h3 className="text-xl font-bold text-white mb-2">Email Primário</h3>
                  <p className="text-sm text-white/90">{emailPrimary}</p>
                  <span className="mt-4 text-xs text-white/80">Clique para enviar email</span>
                </div>
              </a>

              {/* Email Secondary */}
              <a
                href={`mailto:${emailSecondary}`}
                className="group bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-400/50"
              >
                <div className="flex flex-col items-center text-center">
                  <i className="ri-mail-line text-5xl text-white mb-4"></i>
                  <h3 className="text-xl font-bold text-white mb-2">Email Secundário</h3>
                  <p className="text-sm text-white/90">{emailSecondary}</p>
                  <span className="mt-4 text-xs text-white/80">Clique para enviar email</span>
                </div>
              </a>
            </div>

            {/* 🔥 TELEGRAM BOT */}
            <div className="max-w-md mx-auto mb-8">
              <a
                href={`https://t.me/jokatech_bot`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 block"
              >
                <div className="flex flex-col items-center text-center">
                  <i className="ri-telegram-line text-5xl text-white mb-4"></i>
                  <h3 className="text-xl font-bold text-white mb-2">Telegram Bot</h3>
                  <p className="text-sm text-white/90">Suporte Automatizado 24/7</p>
                  <span className="mt-4 text-xs text-white/80">Clique para conversar</span>
                </div>
              </a>
            </div>

            {/* 🔥 REDES SOCIAIS - MENORES EMBAIXO */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
              <h3 className="text-lg font-bold text-white text-center mb-4">
                🌐 Redes Sociais
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="https://www.facebook.com/profile.php?id=61557849646131" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <i className="ri-facebook-fill text-xl text-white"></i>
                </a>
                <a href="https://www.instagram.com/j0kaamazkibu?igsh=MWc1bXFsbTV6aTZ0aw==" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <i className="ri-instagram-line text-xl text-white"></i>
                </a>
                <a href="https://www.vinted.fr/member/247792089" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <i className="ri-shopping-bag-line text-xl text-white"></i>
                </a>
                <a href="https://www.snapchat.com/add/hitill1die?share_id=nWonN10a6d0&locale=pt-PT" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <i className="ri-snapchat-line text-xl text-black"></i>
                </a>
                <a href="https://t.me/jokatech_bot" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <i className="ri-telegram-line text-xl text-white"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔥 FORMULÁRIO DE CONTATO - MELHORADO */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-red-500/30 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <i className="ri-information-line text-2xl text-white"></i>
                  </div>
                  Informações de Contato
                </h3>

                {/* 🔥 NOVO: Informações sobre Prazos e Devoluções */}
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-500/50 rounded-xl p-5 mb-6">
                  <h4 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <i className="ri-time-line text-xl"></i>
                    ⏱️ Prazos de Resposta
                  </h4>
                  <div className="space-y-3 text-sm text-gray-300">
                    <p>
                      <strong className="text-white">📧 Serviços Gerais:</strong><br/>
                      Resposta em 24h até 2 dias úteis
                    </p>
                    <p>
                      <strong className="text-white">💻 Projetos Complexos:</strong><br/>
                      Prazo de 1 dia até 3 meses (dependendo da complexidade)
                    </p>
                    <p>
                      <strong className="text-white">💰 Preços Negociáveis:</strong><br/>
                      Todos os serviços têm preços flexíveis
                    </p>
                  </div>
                </div>

                {/* 🔥 NOVO: Política de Devolução */}
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/50 rounded-xl p-5 mb-6">
                  <h4 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                    <i className="ri-arrow-go-back-line text-xl"></i>
                    🔄 Política de Devolução
                  </h4>
                  <div className="space-y-3 text-sm text-gray-300">
                    <p>
                      <strong className="text-white">✅ Garantia de Satisfação:</strong><br/>
                      Se não estiver satisfeito, oferecemos devolução sem problemas
                    </p>
                    <p>
                      <strong className="text-white">📅 Prazo de Devolução:</strong><br/>
                      Até 14 dias após a entrega do serviço
                    </p>
                    <p>
                      <strong className="text-white">💯 100% Seguro:</strong><br/>
                      Seu dinheiro de volta se não ficar satisfeito
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* 📧 EMAILS */}
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-red-500/50 transition-all">
                    <h4 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                      <i className="ri-mail-line text-xl"></i>
                      Emails de Contato
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-user-line text-red-400"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Claudio Pereira (CEO)</p>
                          <a href="mailto:jokadas69@gmail.com" className="text-white font-bold hover:text-red-400 transition-colors">
                            jokadas69@gmail.com
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-user-line text-red-400"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Mariana Pereira (COO)</p>
                          <a href="mailto:jokadaskz69@gmail.com" className="text-white font-bold hover:text-red-400 transition-colors">
                            jokadaskz69@gmail.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 📱 WHATSAPP */}
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-green-500/50 transition-all">
                    <h4 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                      <i className="ri-whatsapp-line text-xl"></i>
                      WhatsApp
                    </h4>
                    <div className="space-y-3">
                      <a href="https://wa.me/352621717862" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:bg-green-500/10 p-3 rounded-lg transition-all group">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <i className="ri-user-line text-green-400"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Claudio Pereira</p>
                          <p className="text-white font-bold">+352 621 717 862</p>
                        </div>
                      </a>
                      <a href="https://wa.me/352621377168" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:bg-green-500/10 p-3 rounded-lg transition-all group">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <i className="ri-user-line text-green-400"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Mariana Pereira</p>
                          <p className="text-white font-bold">+352 621 377 168</p>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* 🤖 TELEGRAM BOT - IA 24/7 */}
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-5 border-2 border-blue-500/50">
                    <h4 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                      <i className="ri-robot-line text-xl"></i>
                      Telegram Bot - IA 24/7
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-customer-service-2-line text-blue-400"></i>
                        </div>
                        <div>
                          <p className="text-white font-bold mb-2">Atendimento Automático 24/7</p>
                          <p className="text-sm text-gray-300 mb-3">
                            ✅ Ativo 24 horas por dia, 7 dias por semana<br/>
                            ✅ Suporte em mais de 20 idiomas<br/>
                            ✅ Respostas instantâneas via IA
                          </p>
                          <a 
                            href="https://t.me/jokatech_bot" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all"
                          >
                            <i className="ri-telegram-line"></i>
                            Falar com IA no Telegram
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ☎️ ATENDIMENTO HUMANO */}
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-purple-500/50 transition-all">
                    <h4 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                      <i className="ri-customer-service-line text-xl"></i>
                      Atendimento Humano
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-time-line text-purple-400"></i>
                        </div>
                        <div>
                          <p className="text-white font-bold mb-2">Horário de Atendimento</p>
                          <p className="text-sm text-gray-300">
                            📅 <strong>Segunda a Sexta:</strong> 08:00 - 16:00<br/>
                            ⏰ <strong>Sábado e Domingo:</strong> Fechado<br/>
                            🌍 <strong>Fuso Horário:</strong> CET (Europa Central)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 🌐 REDES SOCIAIS */}
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <i className="ri-share-line text-xl"></i>
                      Redes Sociais
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <a href="https://facebook.com/jokatech" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-all group">
                        <i className="ri-facebook-fill text-blue-400 text-xl group-hover:scale-110 transition-transform"></i>
                        <span className="text-white font-bold text-sm">Facebook</span>
                      </a>
                      <a href="https://instagram.com/jokatech" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-pink-600/20 hover:bg-pink-600/30 rounded-lg transition-all group">
                        <i className="ri-instagram-fill text-pink-400 text-xl group-hover:scale-110 transition-transform"></i>
                        <span className="text-white font-bold text-sm">Instagram</span>
                      </a>
                      <a href="https://t.me/jokatech" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all group">
                        <i className="ri-telegram-fill text-blue-400 text-xl group-hover:scale-110 transition-transform"></i>
                        <span className="text-white font-bold text-sm">Telegram</span>
                      </a>
                      <a href="https://vinted.com/jokatech" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-all group">
                        <i className="ri-shopping-bag-line text-green-400 text-xl group-hover:scale-110 transition-transform"></i>
                        <span className="text-white font-bold text-sm">Vinted</span>
                      </a>
                    </div>
                  </div>

                  {/* 📍 LOCALIZAÇÃO */}
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <i className="ri-map-pin-line text-xl"></i>
                      Localização
                    </h4>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-building-line text-red-400"></i>
                      </div>
                      <div>
                        <p className="text-white font-bold mb-1">JokaTech</p>
                        <p className="text-sm text-gray-300">
                          📍 Luxemburgo, Europa<br/>
                          🌍 Entregas em toda a Europa<br/>
                          🚚 Envio grátis acima de €100
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-red-500/20">
                <h2 className="text-3xl font-bold text-white mb-6">Envie uma Mensagem</h2>
                
                {success && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg">
                    <p className="text-green-400 font-semibold">✓ Mensagem enviada com sucesso!</p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                    <p className="text-red-400 font-semibold">✗ {error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* 🔥 NOVO: Seletor de Método de Contato Preferido */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Como prefere ser contactado? *
                    </label>
                    <select
                      value={formData.contactMethod}
                      onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
                      required
                    >
                      <option value="email_primary">📧 Email Primário ({emailPrimary})</option>
                      <option value="email_secondary">📧 Email Secundário ({emailSecondary})</option>
                      <option value="whatsapp_primary">📱 WhatsApp Primário ({whatsappPrimary})</option>
                      <option value="whatsapp_secondary">📱 WhatsApp Secundário ({whatsappSecondary})</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Assunto *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      maxLength={500}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      required
                    ></textarea>
                    <p className="text-sm text-gray-400 mt-1">{formData.message.length} / 500 caracteres</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/50"
                  >
                    {loading ? 'Enviando...' : 'Enviar Mensagem'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Perguntas <span className="text-red-500">Frequentes</span>
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Qual o prazo de entrega?',
                  a: 'O prazo de entrega varia entre 2 a 5 dias úteis para Portugal Continental. Para ilhas e envios internacionais, o prazo pode ser de 5 a 10 dias úteis.'
                },
                {
                  q: 'Qual a política de devolução?',
                  a: 'Você tem 14 dias para devolver o produto sem justificativa. Após esse período, aceitamos devoluções apenas com motivo válido. Todos os produtos têm garantia de 2 anos.'
                },
                {
                  q: 'Os produtos têm garantia?',
                  a: 'Sim! Todos os nossos produtos têm garantia de 2 anos. Além disso, oferecemos suporte técnico gratuito durante todo o período de garantia.'
                },
                {
                  q: 'Fazem montagem de PCs personalizados?',
                  a: 'Sim! Oferecemos serviço completo de montagem de PCs personalizados. Você escolhe os componentes e nós montamos, testamos e entregamos pronto para usar.'
                },
                {
                  q: 'Quais as formas de pagamento?',
                  a: 'Aceitamos Visa, Mastercard, Apple Pay, Google Pay e PayPal. Todos os pagamentos são processados de forma segura.'
                },
                {
                  q: 'Como funciona o suporte técnico?',
                  a: 'Oferecemos suporte técnico 24/7 via WhatsApp, Email e Telegram. Nossa equipe está sempre disponível para ajudar com qualquer dúvida ou problema.'
                }
              ].map((faq, index) => (
                <details key={index} className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-red-500/20 overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-red-500/10 transition-colors">
                    <span className="text-lg font-semibold text-white">{faq.q}</span>
                    <i className="ri-arrow-down-s-line text-2xl text-red-500 group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
