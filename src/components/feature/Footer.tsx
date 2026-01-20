import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

export default function Footer() {
  const { darkMode } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${darkMode ? 'bg-[#170018]' : 'bg-[#f7f6fb]'} border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} transition-colors`}>
      {/* Contactos em Destaque */}
      <div className={`${darkMode ? 'bg-gradient-to-r from-primary/10 to-accent/10' : 'bg-gradient-to-r from-primary/5 to-accent/5'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Email */}
            <a
              href="mailto:jokadamas616@gmail.com"
              className={`flex items-center gap-4 p-4 rounded-xl ${darkMode ? 'bg-surface/50 hover:bg-surface' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'} transition-all group`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-mail-line text-white text-xl"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <p className="font-medium text-primary group-hover:text-accent transition-colors truncate">
                  jokadamas616@gmail.com
                </p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/352621717862"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-4 p-4 rounded-xl ${darkMode ? 'bg-surface/50 hover:bg-surface' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'} transition-all group`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-whatsapp-line text-white text-xl"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400 mb-1">WhatsApp</p>
                <p className="font-medium text-green-500 group-hover:text-green-600 transition-colors">
                  +352 621 717 862
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Empresa */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <i className="ri-building-line text-primary"></i>
              Empresa
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className={`${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/careers" className={`${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
                  Carreiras
                </Link>
              </li>
            </ul>
          </div>

          {/* Produtos */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <i className="ri-shopping-bag-line text-primary"></i>
              Produtos
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/category" className={`${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
                  Todos os Produtos
                </Link>
              </li>
              <li>
                <Link to="/services" className={`${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
                  Serviços
                </Link>
              </li>
              <li>
                <Link to="/offers" className={`${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
                  Ofertas
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <i className="ri-customer-service-line text-primary"></i>
              Suporte
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className={`${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
                  Centro de Ajuda
                </Link>
              </li>
              <li>
                <Link to="/faq" className={`${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/favorites" className={`${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
                  Favoritos
                </Link>
              </li>
              <li>
                <Link to="/shipping" className={`${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
                  Envios
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <i className="ri-shield-check-line text-primary"></i>
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className={`${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
                  Termos & Condições
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={`${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/refund" className={`${darkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
                  Política de Reembolso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-r from-primary/10 to-accent/10' : 'bg-gradient-to-r from-primary/5 to-accent/5'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'} mb-12`}>
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-2">Subscreva a nossa Newsletter</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Receba as últimas novidades e ofertas exclusivas
            </p>
            <form className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="O seu email"
                className={`flex-1 px-4 py-3 rounded-lg ${darkMode ? 'bg-surface border-gray-800' : 'bg-white border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition-opacity font-medium whitespace-nowrap"
              >
                Subscrever
              </button>
            </form>
          </div>
        </div>

        {/* Social & Payment */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-800">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center transition-colors`}
            >
              <i className="ri-facebook-fill text-xl"></i>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center transition-colors`}
            >
              <i className="ri-instagram-line text-xl"></i>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center transition-colors`}
            >
              <i className="ri-twitter-x-line text-xl"></i>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center transition-colors`}
            >
              <i className="ri-linkedin-fill text-xl"></i>
            </a>
          </div>

          {/* Payment Methods */}
          <div className="flex items-center gap-3">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Métodos de Pagamento:</span>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <i className="ri-visa-line text-xl"></i>
              </div>
              <div className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <i className="ri-mastercard-line text-xl"></i>
              </div>
              <div className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <i className="ri-paypal-line text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={`text-center pt-8 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} mt-8`}>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            © {currentYear} JokaTech. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}