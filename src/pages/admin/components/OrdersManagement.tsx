import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface OrdersManagementProps {
  darkMode: boolean;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products?: {
    title: string;
    images: string[];
  };
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  shipping_address?: any;
  tracking_url?: string;
  notes?: string;
  profiles?: {
    email: string;
    full_name: string;
    phone?: string;
  };
  order_items?: OrderItem[];
}

export default function OrdersManagement({ darkMode }: OrdersManagementProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [trackingUrl, setTrackingUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para criação manual
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [newOrder, setNewOrder] = useState({
    user_id: '',
    items: [] as { product_id: string; quantity: number; price: number }[],
    shipping_address: {
      street: '',
      city: '',
      postal_code: '',
      country: 'Portugal'
    },
    notes: ''
  });

  useEffect(() => {
    loadOrders();
    loadCustomers();
    loadProducts();
    createTestOrders();
  }, []);

  const createTestOrders = async () => {
    try {
      // Verificar se já existem pedidos de teste
      const { data: existingOrders } = await supabase
        .from('orders')
        .select('id')
        .limit(1);

      if (existingOrders && existingOrders.length > 0) {
        return; // Já existem pedidos
      }

      // Buscar primeiro usuário
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (!users || users.length === 0) return;

      const userId = users[0].id;

      // Criar pedidos de teste
      const testOrders = [
        {
          user_id: userId,
          order_number: `ORD-${Date.now()}-1`,
          total: 299.99,
          status: 'delivered',
          shipping_address: {
            street: 'Rua das Flores, 123',
            city: 'Lisboa',
            postal_code: '1000-100',
            country: 'Portugal'
          },
          tracking_url: 'https://www.ctt.pt/feapl_2/app/open/objectSearch/objectSearch.jspx?objects=RR123456789PT',
          notes: 'Pedido entregue com sucesso',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: userId,
          order_number: `ORD-${Date.now()}-2`,
          total: 149.50,
          status: 'processing',
          shipping_address: {
            street: 'Avenida da Liberdade, 456',
            city: 'Porto',
            postal_code: '4000-200',
            country: 'Portugal'
          },
          notes: 'Em processamento',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: userId,
          order_number: `ORD-${Date.now()}-3`,
          total: 89.90,
          status: 'cancelled',
          shipping_address: {
            street: 'Rua do Comércio, 789',
            city: 'Braga',
            postal_code: '4700-300',
            country: 'Portugal'
          },
          notes: 'Cancelado a pedido do cliente',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: userId,
          order_number: `ORD-${Date.now()}-4`,
          total: 199.99,
          status: 'refunded',
          shipping_address: {
            street: 'Praça da República, 321',
            city: 'Coimbra',
            postal_code: '3000-400',
            country: 'Portugal'
          },
          notes: 'Reembolso processado',
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: userId,
          order_number: `ORD-${Date.now()}-5`,
          total: 449.99,
          status: 'shipped',
          shipping_address: {
            street: 'Rua Augusta, 555',
            city: 'Faro',
            postal_code: '8000-500',
            country: 'Portugal'
          },
          tracking_url: 'https://www.ctt.pt/feapl_2/app/open/objectSearch/objectSearch.jspx?objects=RR987654321PT',
          notes: 'Enviado via CTT Expresso',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      await supabase.from('orders').insert(testOrders);
    } catch (error) {
      console.error('Erro ao criar pedidos de teste:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Primeiro, buscar os pedidos
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Depois, buscar os dados dos clientes para cada pedido
      const ordersWithCustomers = await Promise.all(
        (ordersData || []).map(async (order) => {
          // Buscar dados do cliente
          const { data: customerData } = await supabase
            .from('profiles')
            .select('id, email, full_name, phone')
            .eq('id', order.user_id)
            .single();

          // Buscar itens do pedido com produtos
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('id, quantity, price, product_id')
            .eq('order_id', order.id);

          // Buscar dados dos produtos
          const orderItems = await Promise.all(
            (itemsData || []).map(async (item) => {
              const { data: productData } = await supabase
                .from('products')
                .select('id, title, images')
                .eq('id', item.product_id)
                .single();

              return {
                ...item,
                products: productData
              };
            })
          );

          return {
            ...order,
            profiles: customerData,
            order_items: orderItems
          };
        })
      );

      setOrders(ordersWithCustomers);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      showSuccess('❌ Erro ao carregar pedidos. Verifique a consola.');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone')
        .order('full_name');
      
      setCustomers(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('id, title, price, images, stock')
        .eq('active', true)
        .order('title');
      
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      await loadOrders();
      showSuccess('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ tracking_url: trackingUrl })
        .eq('id', orderId);

      if (error) throw error;
      
      await loadOrders();
      setEditingTracking(null);
      setTrackingUrl('');
      showSuccess('Link de rastreamento salvo!');
    } catch (error) {
      console.error('Erro ao salvar tracking:', error);
      alert('Erro ao salvar link de rastreamento');
    }
  };

  const handleCreateOrder = async () => {
    try {
      if (!newOrder.user_id || newOrder.items.length === 0) {
        alert('Selecione um cliente e adicione produtos');
        return;
      }

      const total = newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: newOrder.user_id,
          order_number: `ORD-${Date.now()}`,
          total,
          status: 'pending',
          shipping_address: newOrder.shipping_address,
          notes: newOrder.notes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = newOrder.items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await loadOrders();
      setShowCreateModal(false);
      setNewOrder({
        user_id: '',
        items: [],
        shipping_address: {
          street: '',
          city: '',
          postal_code: '',
          country: 'Portugal'
        },
        notes: ''
      });
      showSuccess('Pedido criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao criar pedido');
    }
  };

  const addProductToOrder = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = newOrder.items.find(item => item.product_id === productId);
    
    if (existingItem) {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.map(item =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      setNewOrder({
        ...newOrder,
        items: [...newOrder.items, {
          product_id: productId,
          quantity: 1,
          price: product.price
        }]
      });
    }
  };

  const removeProductFromOrder = (productId: string) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter(item => item.product_id !== productId)
    });
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'pending', label: 'Pendente', color: 'yellow', icon: 'ri-time-line' },
    { value: 'processing', label: 'Em Processo', color: 'blue', icon: 'ri-loader-4-line' },
    { value: 'shipped', label: 'Enviado', color: 'purple', icon: 'ri-truck-line' },
    { value: 'delivered', label: 'Concluído', color: 'green', icon: 'ri-checkbox-circle-line' },
    { value: 'cancelled', label: 'Cancelado', color: 'red', icon: 'ri-close-circle-line' },
    { value: 'refunded', label: 'Reembolsado', color: 'orange', icon: 'ri-refund-2-line' }
  ];

  // Estatísticas
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    refunded: orders.filter(o => o.status === 'refunded').length,
    totalRevenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0)
  };

  const getStatusConfig = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  return (
    <div className="space-y-6">
      {/* Mensagem de Sucesso */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in">
          <div className="px-6 py-4 bg-green-500 text-white rounded-xl shadow-2xl flex items-center gap-3">
            <i className="ri-checkbox-circle-line text-2xl"></i>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-shopping-bag-3-line text-yellow-500"></i>
            Gestão de Pedidos
          </h2>
          <p className="text-gray-400 mt-1">Gerencie todos os pedidos com dados detalhados</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-add-line text-xl"></i>
            Criar Pedido Manual
          </button>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
            <i className="ri-download-line text-xl"></i>
            Exportar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'} hover:shadow-xl transition-all`}>
          <div className="flex items-center justify-between mb-2">
            <i className="ri-shopping-bag-line text-blue-500 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-blue-500">{stats.total}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
        </div>

        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30' : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200'} hover:shadow-xl transition-all`}>
          <div className="flex items-center justify-between mb-2">
            <i className="ri-time-line text-yellow-500 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pendente</p>
        </div>

        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-blue-400/20 to-blue-400/5 border border-blue-400/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300'} hover:shadow-xl transition-all`}>
          <div className="flex items-center justify-between mb-2">
            <i className="ri-loader-4-line text-blue-400 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-blue-400">{stats.processing}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Em Processo</p>
        </div>

        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'} hover:shadow-xl transition-all`}>
          <div className="flex items-center justify-between mb-2">
            <i className="ri-truck-line text-purple-500 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-purple-500">{stats.shipped}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enviado</p>
        </div>

        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30' : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'} hover:shadow-xl transition-all`}>
          <div className="flex items-center justify-between mb-2">
            <i className="ri-checkbox-circle-line text-green-500 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-green-500">{stats.delivered}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Concluído</p>
        </div>

        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30' : 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200'} hover:shadow-xl transition-all`}>
          <div className="flex items-center justify-between mb-2">
            <i className="ri-close-circle-line text-red-500 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-red-500">{stats.cancelled}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cancelado</p>
        </div>

        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30' : 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'} hover:shadow-xl transition-all`}>
          <div className="flex items-center justify-between mb-2">
            <i className="ri-refund-2-line text-orange-500 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold text-orange-500">{stats.refunded}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reembolsado</p>
        </div>

        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200'} hover:shadow-xl transition-all`}>
          <div className="flex items-center justify-between mb-2">
            <i className="ri-money-euro-circle-line text-emerald-500 text-2xl"></i>
          </div>
          <p className="text-2xl font-bold text-emerald-500">€{stats.totalRevenue.toFixed(2)}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Receita</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Buscar por número, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-4 py-2 rounded-lg ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
        >
          <option value="all">Todos Status</option>
          {statusOptions.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </div>

      {/* Lista de Pedidos */}
      <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <i className="ri-inbox-line text-6xl text-gray-400 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Nenhum Pedido Encontrado</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Crie um pedido manual ou aguarde novos pedidos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Pedido</th>
                  <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left font-semibold">Data</th>
                  <th className="px-6 py-4 text-left font-semibold">Total</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Rastreamento</th>
                  <th className="px-6 py-4 text-left font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <tr
                      key={order.id}
                      className={`border-t ${darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold">{order.order_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{order.profiles?.full_name || 'N/A'}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {order.profiles?.email || 'Sem email'}
                          </p>
                          {order.profiles?.phone && (
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {order.profiles.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(order.created_at).toLocaleDateString('pt-PT')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-yellow-500 text-lg">
                          €{order.total?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusConfig.color === 'green'
                              ? 'bg-green-500/20 text-green-500'
                              : statusConfig.color === 'yellow'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : statusConfig.color === 'red'
                              ? 'bg-red-500/20 text-red-500'
                              : statusConfig.color === 'orange'
                              ? 'bg-orange-500/20 text-orange-500'
                              : statusConfig.color === 'purple'
                              ? 'bg-purple-500/20 text-purple-500'
                              : 'bg-blue-500/20 text-blue-500'
                          } border-none cursor-pointer`}
                        >
                          {statusOptions.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {editingTracking === order.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={trackingUrl}
                              onChange={(e) => setTrackingUrl(e.target.value)}
                              placeholder="https://..."
                              className={`px-2 py-1 text-sm rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border`}
                            />
                            <button
                              onClick={() => handleSaveTracking(order.id)}
                              className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              <i className="ri-check-line"></i>
                            </button>
                            <button
                              onClick={() => {
                                setEditingTracking(null);
                                setTrackingUrl('');
                              }}
                              className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </div>
                        ) : order.tracking_url ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={order.tracking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                            >
                              <i className="ri-external-link-line"></i>
                              Rastrear
                            </a>
                            <button
                              onClick={() => {
                                setEditingTracking(order.id);
                                setTrackingUrl(order.tracking_url || '');
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingTracking(order.id);
                              setTrackingUrl('');
                            }}
                            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
                          >
                            <i className="ri-add-line"></i>
                            Adicionar
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailModal(true);
                          }}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                          title="Ver Detalhes"
                        >
                          <i className="ri-eye-line"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} p-6 flex items-center justify-between`}>
              <h3 className="text-2xl font-bold">Detalhes do Pedido</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações do Pedido */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-400 mb-1">Número do Pedido</p>
                  <p className="text-xl font-bold">{selectedOrder.order_number}</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-400 mb-1">Data</p>
                  <p className="text-xl font-bold">
                    {new Date(selectedOrder.created_at).toLocaleDateString('pt-PT')}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    getStatusConfig(selectedOrder.status).color === 'green'
                      ? 'bg-green-500/20 text-green-500'
                      : getStatusConfig(selectedOrder.status).color === 'yellow'
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : getStatusConfig(selectedOrder.status).color === 'red'
                      ? 'bg-red-500/20 text-red-500'
                      : getStatusConfig(selectedOrder.status).color === 'orange'
                      ? 'bg-orange-500/20 text-orange-500'
                      : getStatusConfig(selectedOrder.status).color === 'purple'
                      ? 'bg-purple-500/20 text-purple-500'
                      : 'bg-blue-500/20 text-blue-500'
                  }`}>
                    <i className={getStatusConfig(selectedOrder.status).icon}></i>
                    {getStatusConfig(selectedOrder.status).label}
                  </span>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-400 mb-1">Total</p>
                  <p className="text-2xl font-bold text-yellow-500">€{selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Informações do Cliente */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <i className="ri-user-line text-blue-500"></i>
                  Informações do Cliente
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Nome</p>
                    <p className="font-semibold">{selectedOrder.profiles?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-semibold">{selectedOrder.profiles?.email || 'N/A'}</p>
                  </div>
                  {selectedOrder.profiles?.phone && (
                    <div>
                      <p className="text-sm text-gray-400">Telefone</p>
                      <p className="font-semibold">{selectedOrder.profiles.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Endereço de Envio */}
              {selectedOrder.shipping_address && (
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <i className="ri-map-pin-line text-green-500"></i>
                    Endereço de Envio
                  </h4>
                  <div className="space-y-2">
                    <p className="font-semibold">{selectedOrder.shipping_address.street}</p>
                    <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.postal_code}</p>
                    <p>{selectedOrder.shipping_address.country}</p>
                  </div>
                </div>
              )}

              {/* Rastreamento */}
              {selectedOrder.tracking_url && (
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'}`}>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <i className="ri-truck-line text-purple-500"></i>
                    Rastreamento
                  </h4>
                  <a
                    href={selectedOrder.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                  >
                    <i className="ri-external-link-line"></i>
                    Rastrear Encomenda
                  </a>
                </div>
              )}

              {/* Produtos */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <i className="ri-shopping-cart-line text-yellow-500"></i>
                  Produtos ({selectedOrder.order_items?.length || 0})
                </h4>
                <div className="space-y-4">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className={`flex items-center gap-4 p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                      <div className="w-20 h-20 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                        {item.products?.images?.[0] && (
                          <img
                            src={item.products.images[0]}
                            alt={item.products.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.products?.title || 'Produto'}</p>
                        <p className="text-sm text-gray-400">Quantidade: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Preço Unit.</p>
                        <p className="font-bold text-yellow-500">€{item.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Subtotal</p>
                        <p className="font-bold text-lg">€{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas */}
              {selectedOrder.notes && (
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <i className="ri-file-text-line text-orange-500"></i>
                    Notas
                  </h4>
                  <p className="text-gray-400">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} p-6 flex items-center justify-between`}>
              <h3 className="text-2xl font-bold">Criar Pedido Manual</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Selecionar Cliente */}
              <div>
                <label className="block text-sm font-medium mb-2">Cliente *</label>
                <select
                  value={newOrder.user_id}
                  onChange={(e) => setNewOrder({ ...newOrder, user_id: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'} border`}
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Produtos */}
              <div>
                <label className="block text-sm font-medium mb-2">Produtos *</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addProductToOrder(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'} border mb-4`}
                >
                  <option value="">Adicionar produto...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.title} - €{product.price.toFixed(2)} (Stock: {product.stock})
                    </option>
                  ))}
                </select>

                {newOrder.items.length > 0 && (
                  <div className="space-y-2">
                    {newOrder.items.map((item) => {
                      const product = products.find(p => p.id === item.product_id);
                      return (
                        <div key={item.product_id} className={`flex items-center gap-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <div className="flex-1">
                            <p className="font-semibold">{product?.title}</p>
                            <p className="text-sm text-gray-400">€{item.price.toFixed(2)} x {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setNewOrder({
                                  ...newOrder,
                                  items: newOrder.items.map(i =>
                                    i.product_id === item.product_id
                                      ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                                      : i
                                  )
                                });
                              }}
                              className="w-8 h-8 rounded bg-gray-700 hover:bg-gray-600"
                            >
                              <i className="ri-subtract-line"></i>
                            </button>
                            <span className="w-12 text-center font-bold">{item.quantity}</span>
                            <button
                              onClick={() => {
                                setNewOrder({
                                  ...newOrder,
                                  items: newOrder.items.map(i =>
                                    i.product_id === item.product_id
                                      ? { ...i, quantity: i.quantity + 1 }
                                      : i
                                  )
                                });
                              }}
                              className="w-8 h-8 rounded bg-gray-700 hover:bg-gray-600"
                            >
                              <i className="ri-add-line"></i>
                            </button>
                          </div>
                          <p className="font-bold text-yellow-500 w-24 text-right">
                            €{(item.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeProductFromOrder(item.product_id)}
                            className="w-8 h-8 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      );
                    })}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Total:</span>
                        <span className="text-2xl font-bold text-yellow-500">
                          €{newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Endereço */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Rua *</label>
                  <input
                    type="text"
                    value={newOrder.shipping_address.street}
                    onChange={(e) => setNewOrder({
                      ...newOrder,
                      shipping_address: { ...newOrder.shipping_address, street: e.target.value }
                    })}
                    className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'} border`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cidade *</label>
                  <input
                    type="text"
                    value={newOrder.shipping_address.city}
                    onChange={(e) => setNewOrder({
                      ...newOrder,
                      shipping_address: { ...newOrder.shipping_address, city: e.target.value }
                    })}
                    className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'} border`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Código Postal *</label>
                  <input
                    type="text"
                    value={newOrder.shipping_address.postal_code}
                    onChange={(e) => setNewOrder({
                      ...newOrder,
                      shipping_address: { ...newOrder.shipping_address, postal_code: e.target.value }
                    })}
                    className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'} border`}
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium mb-2">Notas</label>
                <textarea
                  rows={3}
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'} border resize-none`}
                  placeholder="Observações sobre o pedido..."
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateOrder}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:opacity-90"
                >
                  Criar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
