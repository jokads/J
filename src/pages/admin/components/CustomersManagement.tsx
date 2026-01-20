import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface CustomersManagementProps {
  darkMode: boolean;
}

interface Customer {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  total_spent?: number;
  order_count?: number;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

interface WishlistItem {
  id: string;
  product_id: string;
  products: {
    title: string;
    price: number;
    images: string[];
  };
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    title: string;
    price: number;
    images: string[];
  };
}

export default function CustomersManagement({ darkMode }: CustomersManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'new' | 'vip' | 'inactive'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerWishlist, setCustomerWishlist] = useState<WishlistItem[]>([]);
  const [customerCart, setCustomerCart] = useState<CartItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Formulário de criação
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Portugal',
    password: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const customersWithStats = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: ordersData } = await supabase
            .from('orders')
            .select('total, status')
            .eq('user_id', profile.id);

          const orderCount = ordersData?.length || 0;
          const totalSpent = ordersData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

          return {
            ...profile,
            order_count: orderCount,
            total_spent: totalSpent
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (customerId: string) => {
    try {
      setLoadingDetails(true);

      // Carregar pedidos
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, order_number, total, status, created_at')
        .eq('user_id', customerId)
        .order('created_at', { ascending: false });

      setCustomerOrders(ordersData || []);

      // Carregar favoritos
      const { data: wishlistData } = await supabase
        .from('wishlist')
        .select(`
          id,
          product_id,
          products (
            title,
            price,
            images
          )
        `)
        .eq('user_id', customerId);

      setCustomerWishlist(wishlistData || []);

      // Carregar carrinho
      const { data: cartData } = await supabase
        .from('cart')
        .select(`
          id,
          product_id,
          quantity,
          products (
            title,
            price,
            images
          )
        `)
        .eq('user_id', customerId);

      setCustomerCart(cartData || []);
    } catch (error) {
      console.error('Erro ao carregar detalhes do cliente:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      if (!formData.email || !formData.full_name || !formData.password) {
        alert('❌ Preencha os campos obrigatórios: Email, Nome e Senha');
        return;
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Atualizar perfil com informações adicionais
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postal_code,
            country: formData.country
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        alert('✅ Cliente criado com sucesso!');
        setShowCreateModal(false);
        setFormData({
          email: '',
          full_name: '',
          phone: '',
          address: '',
          city: '',
          postal_code: '',
          country: 'Portugal',
          password: ''
        });
        loadCustomers();
      }
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      alert(`❌ Erro ao criar cliente: ${error.message}`);
    }
  };

  const handleViewDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
    await loadCustomerDetails(customer.id);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const daysSinceCreated = Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    switch (filterType) {
      case 'new':
        return daysSinceCreated <= 30;
      case 'vip':
        return (customer.total_spent || 0) >= 500;
      case 'inactive':
        return daysSinceCreated > 90 && (customer.order_count || 0) === 0;
      default:
        return true;
    }
  });

  // Paginação
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return (
      <div className="flex flex-col items-center gap-4 mt-6">
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} de {filteredCustomers.length}
        </p>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentPage === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white hover:opacity-90'
            }`}
          >
            <i className="ri-arrow-left-s-line"></i>
            Anterior
          </button>

          {pages.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">...</span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(page as number)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white scale-110 shadow-lg'
                    : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            )
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentPage === totalPages
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white hover:opacity-90'
            }`}
          >
            Próximo
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
      </div>
    );
  };

  const stats = {
    total: customers.length,
    new: customers.filter(c => {
      const days = Math.floor((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return days <= 30;
    }).length,
    vip: customers.filter(c => (c.total_spent || 0) >= 500).length,
    inactive: customers.filter(c => {
      const days = Math.floor((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return days > 90 && (c.order_count || 0) === 0;
    }).length
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">Admin</span>;
    }
    return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Cliente</span>;
  };

  const getCustomerType = (customer: Customer) => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreated <= 30) {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Novo</span>;
    }
    if ((customer.total_spent || 0) >= 500) {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">VIP</span>;
    }
    if (daysSinceCreated > 90 && (customer.order_count || 0) === 0) {
      return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-medium rounded">Inativo</span>;
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: string; label: string }> = {
      pending: { color: 'yellow', icon: 'ri-time-line', label: 'Pendente' },
      processing: { color: 'blue', icon: 'ri-loader-4-line', label: 'Em Processo' },
      shipped: { color: 'purple', icon: 'ri-truck-line', label: 'Enviado' },
      completed: { color: 'green', icon: 'ri-checkbox-circle-line', label: 'Concluído' },
      cancelled: { color: 'red', icon: 'ri-close-circle-line', label: 'Cancelado' },
      refunded: { color: 'orange', icon: 'ri-refund-2-line', label: 'Reembolsado' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 bg-${config.color}-500/20 text-${config.color}-400 text-xs font-medium rounded flex items-center gap-1 w-fit`}>
        <i className={config.icon}></i>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-user-line text-yellow-500"></i>
            Gestão de Clientes
          </h2>
          <p className="text-gray-400 mt-1">Gerencie clientes com dados detalhados</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-user-add-line text-xl"></i>
            Criar Cliente
          </button>
          <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
            <i className="ri-download-line text-xl"></i>
            Exportar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'} hover:shadow-xl transition-shadow`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <i className="ri-user-line text-3xl text-blue-500"></i>
            </div>
            <span className="text-3xl font-bold">{stats.total}</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>Total de Clientes</p>
          <p className="text-xs text-gray-500 mt-1">Todos os registrados</p>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'} hover:shadow-xl transition-shadow`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center">
              <i className="ri-user-add-line text-3xl text-green-500"></i>
            </div>
            <span className="text-3xl font-bold">{stats.new}</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>Novos (30 dias)</p>
          <p className="text-xs text-gray-500 mt-1">Registrados recentemente</p>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'} hover:shadow-xl transition-shadow`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-14 h-14 bg-yellow-500/10 rounded-xl flex items-center justify-center">
              <i className="ri-vip-crown-line text-3xl text-yellow-500"></i>
            </div>
            <span className="text-3xl font-bold">{stats.vip}</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>Clientes VIP</p>
          <p className="text-xs text-gray-500 mt-1">Gastaram €500+</p>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'} hover:shadow-xl transition-shadow`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center">
              <i className="ri-user-unfollow-line text-3xl text-red-500"></i>
            </div>
            <span className="text-3xl font-bold">{stats.inactive}</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>Inativos</p>
          <p className="text-xs text-gray-500 mt-1">Sem pedidos há 90+ dias</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => { setFilterType('all'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === 'all'
                ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white'
                : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => { setFilterType('new'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === 'new'
                ? 'bg-green-500 text-white'
                : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Novos ({stats.new})
          </button>
          <button
            onClick={() => { setFilterType('vip'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === 'vip'
                ? 'bg-yellow-500 text-black'
                : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            VIP ({stats.vip})
          </button>
          <button
            onClick={() => { setFilterType('inactive'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === 'inactive'
                ? 'bg-red-500 text-white'
                : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Inativos ({stats.inactive})
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className={`w-full pl-10 pr-4 py-2 rounded-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left font-semibold">Tipo</th>
                  <th className="px-6 py-4 text-left font-semibold">Contacto</th>
                  <th className="px-6 py-4 text-left font-semibold">Localização</th>
                  <th className="px-6 py-4 text-left font-semibold">Pedidos</th>
                  <th className="px-6 py-4 text-left font-semibold">Total Gasto</th>
                  <th className="px-6 py-4 text-left font-semibold">Cadastro</th>
                  <th className="px-6 py-4 text-left font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className={`border-t ${darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#b62bff] to-[#ff6a00] rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {customer.full_name?.charAt(0) || customer.email?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{customer.full_name || 'Sem nome'}</p>
                            {getRoleBadge(customer.role)}
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getCustomerType(customer)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {customer.phone && (
                          <span className={`text-sm flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <i className="ri-phone-line text-green-500"></i>
                            {customer.phone}
                          </span>
                        )}
                        {!customer.phone && (
                          <span className="text-xs text-gray-500">Sem telefone</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {customer.city && (
                          <span className={`text-sm flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <i className="ri-map-pin-line text-blue-500"></i>
                            {customer.city}
                          </span>
                        )}
                        {customer.country && (
                          <span className="text-xs text-gray-500">{customer.country}</span>
                        )}
                        {!customer.city && !customer.country && (
                          <span className="text-xs text-gray-500">Sem localização</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-lg text-blue-500">{customer.order_count || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-lg text-yellow-500">€{(customer.total_spent || 0).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(customer.created_at).toLocaleDateString('pt-PT')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleViewDetails(customer)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
                      >
                        <i className="ri-eye-line"></i>
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {renderPagination()}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="sticky top-0 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <i className="ri-user-add-line text-3xl text-white"></i>
                <div>
                  <h3 className="text-2xl font-bold text-white">Criar Novo Cliente</h3>
                  <p className="text-white/80 text-sm">Preencha os dados do cliente</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <i className="ri-user-line text-blue-500"></i>
                  Informações Básicas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      } border focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                      placeholder="João Silva"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      } border focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                      placeholder="joao@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Senha <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      } border focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      } border focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                      placeholder="+351 912345678"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <i className="ri-map-pin-line text-green-500"></i>
                  Endereço
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Morada</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      } border focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                      placeholder="Rua das Flores, 123"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Cidade</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg ${
                          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        } border focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                        placeholder="Lisboa"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Código Postal</label>
                      <input
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg ${
                          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        } border focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                        placeholder="1000-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">País</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg ${
                          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        } border focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                        placeholder="Portugal"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCustomer}
                  className="px-6 py-2 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
                >
                  <i className="ri-save-line"></i>
                  Criar Cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="sticky top-0 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {selectedCustomer.full_name?.charAt(0) || selectedCustomer.email?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedCustomer.full_name || 'Sem nome'}</h3>
                  <p className="text-white/80">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Estatísticas do Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <i className="ri-shopping-bag-line text-2xl text-blue-500"></i>
                    <div>
                      <p className="text-2xl font-bold">{selectedCustomer.order_count || 0}</p>
                      <p className="text-xs text-gray-500">Pedidos</p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <i className="ri-money-euro-circle-line text-2xl text-yellow-500"></i>
                    <div>
                      <p className="text-2xl font-bold">€{(selectedCustomer.total_spent || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Total Gasto</p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <i className="ri-heart-line text-2xl text-red-500"></i>
                    <div>
                      <p className="text-2xl font-bold">{customerWishlist.length}</p>
                      <p className="text-xs text-gray-500">Favoritos</p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <i className="ri-shopping-cart-line text-2xl text-green-500"></i>
                    <div>
                      <p className="text-2xl font-bold">{customerCart.length}</p>
                      <p className="text-xs text-gray-500">No Carrinho</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações do Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados Pessoais */}
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <i className="ri-user-line text-blue-500"></i>
                    Dados Pessoais
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <i className="ri-mail-line text-gray-400 mt-1"></i>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium">{selectedCustomer.email}</p>
                      </div>
                    </div>
                    {selectedCustomer.phone && (
                      <div className="flex items-start gap-3">
                        <i className="ri-phone-line text-gray-400 mt-1"></i>
                        <div>
                          <p className="text-xs text-gray-500">Telefone</p>
                          <p className="font-medium">{selectedCustomer.phone}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <i className="ri-calendar-line text-gray-400 mt-1"></i>
                      <div>
                        <p className="text-xs text-gray-500">Cadastro</p>
                        <p className="font-medium">{new Date(selectedCustomer.created_at).toLocaleDateString('pt-PT')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-shield-user-line text-gray-400 mt-1"></i>
                      <div>
                        <p className="text-xs text-gray-500">Tipo</p>
                        <div className="mt-1">{getRoleBadge(selectedCustomer.role)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <i className="ri-map-pin-line text-green-500"></i>
                    Endereço
                  </h4>
                  {selectedCustomer.address || selectedCustomer.city ? (
                    <div className="space-y-2">
                      {selectedCustomer.address && <p className="font-medium">{selectedCustomer.address}</p>}
                      {selectedCustomer.city && <p className="text-gray-400">{selectedCustomer.city}</p>}
                      {selectedCustomer.postal_code && <p className="text-gray-400">{selectedCustomer.postal_code}</p>}
                      {selectedCustomer.country && <p className="text-gray-400">{selectedCustomer.country}</p>}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Sem endereço cadastrado</p>
                  )}
                </div>
              </div>

              {/* Pedidos */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <i className="ri-shopping-bag-line text-purple-500"></i>
                  Pedidos ({customerOrders.length})
                </h4>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : customerOrders.length > 0 ? (
                  <div className="space-y-3">
                    {customerOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-mono font-bold">{order.order_number}</p>
                            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('pt-PT')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-yellow-500">€{order.total.toFixed(2)}</p>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-8">Nenhum pedido realizado</p>
                )}
              </div>

              {/* Favoritos */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <i className="ri-heart-line text-red-500"></i>
                  Favoritos ({customerWishlist.length})
                </h4>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : customerWishlist.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {customerWishlist.slice(0, 6).map((item) => (
                      <div key={item.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <img
                          src={item.products.images?.[0] || 'https://via.placeholder.com/150'}
                          alt={item.products.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <p className="font-medium text-sm line-clamp-2">{item.products.title}</p>
                        <p className="text-yellow-500 font-bold mt-2">€{item.products.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-8">Nenhum produto nos favoritos</p>
                )}
              </div>

              {/* Carrinho */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <i className="ri-shopping-cart-line text-green-500"></i>
                  Carrinho ({customerCart.length})
                </h4>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : customerCart.length > 0 ? (
                  <div className="space-y-3">
                    {customerCart.map((item) => (
                      <div key={item.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-4`}>
                        <img
                          src={item.products.images?.[0] || 'https://via.placeholder.com/80'}
                          alt={item.products.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.products.title}</p>
                          <p className="text-sm text-gray-500">Quantidade: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-500 font-bold">€{(item.products.price * item.quantity).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">€{item.products.price.toFixed(2)} cada</p>
                        </div>
                      </div>
                    ))}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-white'} border-2 ${darkMode ? 'border-yellow-500/50' : 'border-yellow-500/30'}`}>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-lg">Total do Carrinho:</p>
                        <p className="font-bold text-2xl text-yellow-500">
                          €{customerCart.reduce((sum, item) => sum + (item.products.price * item.quantity), 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-8">Carrinho vazio</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
