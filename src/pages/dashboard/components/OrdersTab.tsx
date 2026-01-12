import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Order {
  id: string;
  user_email: string;
  user_name: string;
  items: any[];
  total: number;
  status: string;
  tracking_code?: string;
  tracking_url?: string;
  shipping_company?: string;
  estimated_delivery?: string;
  admin_notes?: string;
  created_at: string;
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [shippingCompany, setShippingCompany] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadOrders();
    
    // Tempo real
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadOrders();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      alert('Status atualizado com sucesso!');
      loadOrders();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status!');
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          tracking_code: trackingCode,
          tracking_url: trackingUrl,
          shipping_company: shippingCompany,
          estimated_delivery: estimatedDelivery,
          admin_notes: adminNotes,
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;
      alert('Informações de rastreamento salvas com sucesso!');
      loadOrders();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Erro ao salvar rastreamento:', error);
      alert('Erro ao salvar informações!');
    }
  };

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setTrackingCode(order.tracking_code || '');
    setTrackingUrl(order.tracking_url || '');
    setShippingCompany(order.shipping_company || '');
    setEstimatedDelivery(order.estimated_delivery || '');
    setAdminNotes(order.admin_notes || '');
    setShowDetailModal(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = 
      (order.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'shipped': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'PENDENTE';
      case 'processing': return 'PROCESSANDO';
      case 'shipped': return 'ENVIADO';
      case 'completed': return 'CONCLUÍDO';
      case 'cancelled': return 'CANCELADO';
      default: return status.toUpperCase();
    }
  };

  const totalRevenue = filteredOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0);
  const pendingCount = filteredOrders.filter(o => o.status === 'pending').length;
  const processingCount = filteredOrders.filter(o => o.status === 'processing').length;
  const shippedCount = filteredOrders.filter(o => o.status === 'shipped').length;

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4">Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-shopping-cart-line text-3xl text-blue-400"></i>
            <span className="text-3xl font-bold text-white">{filteredOrders.length}</span>
          </div>
          <p className="text-sm text-gray-400">Total de Pedidos</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-time-line text-3xl text-yellow-400"></i>
            <span className="text-3xl font-bold text-white">{pendingCount}</span>
          </div>
          <p className="text-sm text-gray-400">Pendentes</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-truck-line text-3xl text-purple-400"></i>
            <span className="text-3xl font-bold text-white">{shippedCount}</span>
          </div>
          <p className="text-sm text-gray-400">Enviados</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-money-euro-circle-line text-3xl text-green-400"></i>
            <span className="text-3xl font-bold text-white">€{totalRevenue.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-400">Receita Total</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 shadow-xl mb-6 border border-amber-500/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar por email, nome ou ID do pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="processing">Processando</option>
            <option value="shipped">Enviado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Todos', count: orders.length },
            { key: 'pending', label: 'Pendentes', count: orders.filter(o => o.status === 'pending').length },
            { key: 'processing', label: 'Processando', count: orders.filter(o => o.status === 'processing').length },
            { key: 'shipped', label: 'Enviados', count: orders.filter(o => o.status === 'shipped').length },
            { key: 'completed', label: 'Concluídos', count: orders.filter(o => o.status === 'completed').length },
            { key: 'cancelled', label: 'Cancelados', count: orders.filter(o => o.status === 'cancelled').length },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap text-sm cursor-pointer ${
                filterStatus === filter.key
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg'
                  : 'bg-black/40 text-gray-400 hover:bg-black/60 border border-amber-500/20'
              }`}
            >
              {filter.label} <span className="font-bold">({filter.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="bg-black/60 backdrop-blur-sm rounded-lg shadow-xl border border-amber-500/20 p-12 text-center">
          <i className="ri-shopping-cart-line text-6xl text-gray-600 mb-4"></i>
          <p className="text-gray-400 text-lg mb-2">Nenhum pedido encontrado</p>
          <p className="text-gray-500 text-sm">Tente ajustar os filtros de busca</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-black/60 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-amber-500/20 hover:border-amber-400 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">#{order.id.slice(0, 8)}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">
                    <i className="ri-user-line mr-2"></i>
                    {order.user_name}
                  </p>
                  <p className="text-gray-400 text-sm mb-1">
                    <i className="ri-mail-line mr-2"></i>
                    {order.user_email}
                  </p>
                  <p className="text-gray-400 text-xs">
                    <i className="ri-calendar-line mr-2"></i>
                    {new Date(order.created_at).toLocaleDateString('pt-PT')} às {new Date(order.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-amber-400">€{Number(order.total).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{order.items?.length || 0} itens</p>
                </div>
              </div>

              {order.tracking_code && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-purple-400 mb-1">
                    <i className="ri-truck-line mr-2"></i>
                    Código de Rastreamento: <span className="font-bold">{order.tracking_code}</span>
                  </p>
                  {order.shipping_company && (
                    <p className="text-xs text-gray-400">Transportadora: {order.shipping_company}</p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => openDetailModal(order)}
                  className="flex-1 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-all cursor-pointer border border-amber-500/30 font-semibold text-sm"
                >
                  <i className="ri-eye-line mr-2"></i>
                  VER DETALHES
                </button>

                {order.status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'processing')}
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all cursor-pointer border border-blue-500/30 font-semibold text-sm whitespace-nowrap"
                  >
                    <i className="ri-play-line mr-2"></i>
                    PROCESSAR
                  </button>
                )}

                {order.status === 'processing' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'shipped')}
                    className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all cursor-pointer border border-purple-500/30 font-semibold text-sm whitespace-nowrap"
                  >
                    <i className="ri-truck-line mr-2"></i>
                    ENVIAR
                  </button>
                )}

                {order.status === 'shipped' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'completed')}
                    className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all cursor-pointer border border-green-500/30 font-semibold text-sm whitespace-nowrap"
                  >
                    <i className="ri-checkbox-circle-line mr-2"></i>
                    CONCLUIR
                  </button>
                )}

                {order.status !== 'cancelled' && order.status !== 'completed' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'cancelled')}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all cursor-pointer border border-red-500/30 font-semibold text-sm whitespace-nowrap"
                  >
                    <i className="ri-close-line mr-2"></i>
                    CANCELAR
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-amber-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-amber-400">DETALHES DO PEDIDO #{selectedOrder.id.slice(0, 8)}</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-white"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-sm text-gray-400 mb-1">Cliente</p>
                    <p className="font-bold text-white text-lg">{selectedOrder.user_name}</p>
                    <p className="text-sm text-gray-400">{selectedOrder.user_email}</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>

                  <div className="bg-amber-500/20 rounded-lg p-4 border border-amber-500/30">
                    <p className="text-sm text-gray-400 mb-1">Valor Total</p>
                    <p className="text-3xl font-bold text-amber-400">€{Number(selectedOrder.total).toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-sm text-gray-400 mb-2">Código de Rastreamento</p>
                    <input
                      type="text"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      placeholder="Ex: BR123456789PT"
                      className="w-full px-3 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-sm text-gray-400 mb-2">URL de Rastreamento</p>
                    <input
                      type="url"
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-sm text-gray-400 mb-2">Transportadora</p>
                    <input
                      type="text"
                      value={shippingCompany}
                      onChange={(e) => setShippingCompany(e.target.value)}
                      placeholder="Ex: CTT, DHL, UPS"
                      className="w-full px-3 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-sm text-gray-400 mb-2">Previsão de Entrega</p>
                    <input
                      type="date"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-3">ITENS DO PEDIDO</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/10 flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold">{item.name}</p>
                        <p className="text-sm text-gray-400">Quantidade: {item.quantity}</p>
                      </div>
                      <p className="text-amber-400 font-bold">€{(Number(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-3">NOTAS DO ADMIN</h4>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="Adicione notas internas sobre este pedido..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-amber-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-white"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveTracking}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-save-line mr-2"></i>
                  SALVAR INFORMAÇÕES
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  FECHAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}