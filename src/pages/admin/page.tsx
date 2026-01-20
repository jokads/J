import { useState, lazy, Suspense, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import DashboardOverview from './components/DashboardOverview';
import ProductsManagement from './components/ProductsManagement';
import CategoriesManagement from './components/CategoriesManagement';
import OrdersManagement from './components/OrdersManagement';
import CustomersManagement from './components/CustomersManagement';
import ContentManagement from './components/ContentManagement';
import MarketingManagement from './components/MarketingManagement';
import FinancialManagement from './components/FinancialManagement';
import SecurityManagement from './components/SecurityManagement';
import AutomationManagement from './components/AutomationManagement';
import SupportManagement from './components/SupportManagement';
import ShippingManagement from './components/ShippingManagement';
import TaxManagement from './components/TaxManagement';
import ThemeEditor from './components/ThemeEditor';
import SiteSettingsManagement from './components/SiteSettingsManagement';
import WooCommerceIntegration from './components/WooCommerceIntegration';
import ContactPageManagement from './components/ContactPageManagement';
import FeaturedProductsManagement from './components/FeaturedProductsManagement';

const ServicesManagement = lazy(() => import('./components/ServicesManagement'));

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState('admin');
  const { user, signOut } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Buscar role do utilizador
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar role:', error);
          return;
        }

        if (data?.role) {
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Erro ao buscar role:', error);
      }
    };

    fetchUserRole();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const renderContent = () => {
    const content = (() => {
      switch (activeSection) {
        case 'dashboard':
          return <DashboardOverview darkMode={darkMode} />;
        case 'products':
          return <ProductsManagement darkMode={darkMode} />;
        case 'services':
          return (
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              <ServicesManagement />
            </Suspense>
          );
        case 'categories':
          return <CategoriesManagement darkMode={darkMode} />;
        case 'featured-products':
          return <FeaturedProductsManagement />;
        case 'orders':
          return <OrdersManagement darkMode={darkMode} />;
        case 'customers':
          return <CustomersManagement darkMode={darkMode} />;
        case 'content':
          return <ContentManagement darkMode={darkMode} />;
        case 'marketing':
          return <MarketingManagement darkMode={darkMode} />;
        case 'financial':
          return <FinancialManagement darkMode={darkMode} />;
        case 'security':
          return <SecurityManagement darkMode={darkMode} />;
        case 'automation':
          return <AutomationManagement darkMode={darkMode} />;
        case 'support':
          return <SupportManagement darkMode={darkMode} />;
        case 'shipping':
          return <ShippingManagement darkMode={darkMode} />;
        case 'tax':
          return <TaxManagement darkMode={darkMode} />;
        case 'site-settings':
          return <SiteSettingsManagement />;
        case 'contact-page':
          return <ContactPageManagement />;
        case 'theme':
          return <ThemeEditor darkMode={darkMode} />;
        case 'woocommerce':
          return <WooCommerceIntegration />;
        default:
          return <DashboardOverview darkMode={darkMode} />;
      }
    })();

    return content;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0b0011]' : 'bg-gray-50'}`}>
      <AdminHeader 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
      />
      
      <div className="flex">
        <AdminSidebar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sidebarOpen={sidebarOpen}
        />
        
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} pt-16`}>
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
