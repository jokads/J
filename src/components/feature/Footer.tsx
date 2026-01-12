import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-12 border-t-2 border-red-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo e Descrição */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/cb4831d791909a4a7679c925d26faa2b.png" 
                alt="JokaTech" 
                className="h-12 w-12 object-contain"
              />
              <span className="text-2xl font-bold">
                <span className="text-red-500">Joka</span><span className="text-black font-bold text-xl bg-gradient-to-r from-red-400 to-red-600 px-2 py-1 rounded ml-1">Tech</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              PCs e componentes de alta performance. Desempenho real, preço justo.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors cursor-pointer">
                <i className="ri-map-pin-line text-red-500"></i>
                <span className="text-gray-400">📍 Luxemburgo</span>
              </div>
              <div className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors cursor-pointer">
                <i className="ri-global-line text-red-500"></i>
                <span className="text-gray-400">🌍 Envio para quase todo o mundo</span>
              </div>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-xl font-bold text-red-500 mb-4">LINKS RÁPIDOS</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-red-500 transition-colors cursor-pointer text-sm text-gray-300">
                  INÍCIO
                </Link>
              </li>
              <li>
                <Link to="/produtos" className="hover:text-red-500 transition-colors cursor-pointer text-sm text-gray-300">
                  PRODUTOS
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-red-500 transition-colors cursor-pointer text-sm text-gray-300">
                  MARKETPLACE
                </Link>
              </li>
              <li>
                <Link to="/montar-pc" className="hover:text-red-500 transition-colors cursor-pointer text-sm text-gray-300">
                  MONTAR PC
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-red-500 transition-colors cursor-pointer text-sm text-gray-300">
                  SOBRE
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-red-500 transition-colors cursor-pointer text-sm text-gray-300">
                  CONTATO
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
              <i className="ri-customer-service-2-line"></i>
              Contato
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2 hover:text-red-500 transition-colors">
                <i className="ri-mail-line text-red-500 mt-1"></i>
                <div>
                  <div className="text-sm text-gray-500">Email Principal</div>
                  <a href="mailto:jokadas69@gmail.com" className="hover:underline text-sm">
                    jokadas69@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2 hover:text-red-500 transition-colors">
                <i className="ri-mail-line text-red-500 mt-1"></i>
                <div>
                  <div className="text-sm text-gray-500">Email Secundário</div>
                  <a href="mailto:jokadaskz69@gmail.com" className="hover:underline text-sm">
                    jokadaskz69@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2 hover:text-red-500 transition-colors">
                <i className="ri-whatsapp-line text-red-500 mt-1"></i>
                <div>
                  <div className="text-sm text-gray-500">WhatsApp - Claudio</div>
                  <a href="https://wa.me/352621717862" target="_blank" rel="noopener noreferrer" className="hover:underline text-sm">
                    +352 621 717 862
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2 hover:text-red-500 transition-colors">
                <i className="ri-whatsapp-line text-red-500 mt-1"></i>
                <div>
                  <div className="text-sm text-gray-500">WhatsApp - Mariana</div>
                  <a href="https://wa.me/352621377168" target="_blank" rel="noopener noreferrer" className="hover:underline text-sm">
                    +352 621 377 168
                  </a>
                </div>
              </li>
              <li className="pt-3 border-t border-gray-800">
                <div className="text-sm text-gray-500 mb-2">🌍 Atendimento Multilíngue</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full">
                    🇵🇹 PT
                  </span>
                  <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/10">
                    🇫🇷 FR
                  </span>
                  <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/10">
                    🇩🇪 DE
                  </span>
                  <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/10">
                    🇬🇧 EN
                  </span>
                  <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/10">
                    🇮🇹 IT
                  </span>
                  <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/10">
                    🇳🇱 NL
                  </span>
                  <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/10">
                    🇪🇸 ES
                  </span>
                  <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/10">
                    + 15 idiomas
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="text-red-500 font-bold mb-4 text-sm sm:text-base">REDES SOCIAIS</h3>
            <div className="flex gap-3">
              <a
                href="https://wa.me/352621717862"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
              >
                <i className="ri-whatsapp-line text-xl"></i>
              </a>
              <a
                href="https://t.me/jokatech_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
              >
                <i className="ri-telegram-line text-xl"></i>
              </a>
              <a
                href="https://www.facebook.com/jokatech"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
              >
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a
                href="https://www.instagram.com/jokatech"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
              >
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a
                href="https://www.snapchat.com/add/jokatech"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
              >
                <i className="ri-snapchat-line text-xl text-black"></i>
              </a>
              <a
                href="https://www.vinted.com/jokatech"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-teal-500 hover:bg-teal-600 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
              >
                <i className="ri-shopping-bag-line text-xl"></i>
              </a>
            </div>

            {/* Métodos de Pagamento */}
            <div className="mt-6">
              <h4 className="text-sm font-bold text-gray-400 mb-3">PAGAMENTO SEGURO</h4>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-2 bg-white/5 rounded border border-white/10 flex items-center gap-2">
                  <i className="ri-bank-card-line text-red-500"></i>
                  <span className="text-xs text-gray-400">Visa</span>
                </div>
                <div className="px-3 py-2 bg-white/5 rounded border border-white/10 flex items-center gap-2">
                  <i className="ri-bank-card-line text-red-500"></i>
                  <span className="text-xs text-gray-400">Mastercard</span>
                </div>
                <div className="px-3 py-2 bg-white/5 rounded border border-white/10 flex items-center gap-2">
                  <i className="ri-apple-line text-red-500"></i>
                  <span className="text-xs text-gray-400">Apple Pay</span>
                </div>
                <div className="px-3 py-2 bg-white/5 rounded border border-white/10 flex items-center gap-2">
                  <i className="ri-google-line text-red-500"></i>
                  <span className="text-xs text-gray-400">Google Pay</span>
                </div>
                <div className="px-3 py-2 bg-white/5 rounded border border-white/10 flex items-center gap-2">
                  <i className="ri-paypal-line text-red-500"></i>
                  <span className="text-xs text-gray-400">PayPal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linha Divisória */}
        <div className="border-t border-red-500/20 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400 text-center sm:text-left">
              <Link to="/privacidade" className="hover:text-red-500 transition-colors cursor-pointer">
                Política de Privacidade
              </Link>
              <Link to="/termos" className="hover:text-red-500 transition-colors cursor-pointer">
                Termos e Condições
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-right">
              © 2025 JokaTech. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
