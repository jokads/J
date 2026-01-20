import { useTheme } from '../../../contexts/ThemeContext';

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarOpen: boolean;
}

export default function AdminSidebar({ activeSection, setActiveSection, sidebarOpen }: AdminSidebarProps) {
  const { darkMode } = useTheme();

  const menuItems = [
    { id: 'dashboard', icon: 'ri-dashboard-line', label: 'Dashboard' },
    { id: 'products', icon: 'ri-shopping-bag-line', label: 'Produtos' },
    { id: 'services', icon: 'ri-service-line', label: 'Serviços' },
    { id: 'categories', icon: 'ri-folder-line', label: 'Categorias' },
    { id: 'featured-products', icon: 'ri-star-line', label: 'Produtos Destaque' },
    { id: 'orders', icon: 'ri-file-list-line', label: 'Pedidos' },
    { id: 'customers', icon: 'ri-user-line', label: 'Clientes' },
    { id: 'content', icon: 'ri-pages-line', label: 'Conteúdo' },
    { id: 'marketing', icon: 'ri-megaphone-line', label: 'Marketing' },
    { id: 'financial', icon: 'ri-money-dollar-circle-line', label: 'Financeiro' },
    { id: 'shipping', icon: 'ri-truck-line', label: 'Envios' },
    { id: 'tax', icon: 'ri-percent-line', label: 'Impostos' },
    { id: 'automation', icon: 'ri-robot-line', label: 'Automação' },
    { id: 'support', icon: 'ri-customer-service-line', label: 'Suporte' },
    { id: 'woocommerce', icon: 'ri-shopping-cart-2-line', label: 'WooCommerce' },
    { id: 'contact-page', icon: 'ri-mail-line', label: 'Página Contacto' },
    { id: 'site-settings', icon: 'ri-settings-3-line', label: 'Configurações' },
    { id: 'theme', icon: 'ri-palette-line', label: 'Tema' },
    { id: 'security', icon: 'ri-shield-check-line', label: 'Segurança' }
  ];

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 w-64 ${
        darkMode ? 'bg-[#170018] border-gray-800' : 'bg-white border-gray-200'
      } border-r transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col z-40`}
    >
      {/* Scroll Container com Custom Scrollbar e Scroll Suave */}
      <nav 
        className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-[#b62bff] scrollbar-track-transparent hover:scrollbar-thumb-[#ff6a00]"
        style={{ scrollBehavior: 'smooth' }}
      >
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeSection === item.id
                ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white shadow-lg scale-105'
                : darkMode
                ? 'text-gray-300 hover:bg-gray-800 hover:scale-102'
                : 'text-gray-700 hover:bg-gray-100 hover:scale-102'
            }`}
          >
            <i className={`${item.icon} text-lg flex-shrink-0`}></i>
            <span className="text-left flex-1">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer Fixo */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <i className="ri-shield-check-line"></i>
          <span>Painel Admin v1.0</span>
        </div>
      </div>
    </aside>
  );
}
