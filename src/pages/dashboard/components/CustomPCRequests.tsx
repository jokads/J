import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface CustomPCRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  cpu: string;
  gpu: string;
  ram: string;
  motherboard: string;
  ssd: string;
  case_type: string;
  psu: string;
  cooling: string;
  include_ram: boolean;
  total_price: number;
  assembly_fee: number;
  notes: string;
  status: string;
  admin_notes: string;
  created_at: string;
  approved_at: string;
  completed_at: string;
}

export default function CustomPCRequests() {
  const [requests, setRequests] = useState<CustomPCRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CustomPCRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_pc_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('custom_pc_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;
      
      loadRequests();
      alert(`Pedido ${newStatus === 'approved' ? 'aprovado' : newStatus === 'rejected' ? 'rejeitado' : 'concluído'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do pedido');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from('custom_pc_requests')
        .update({ admin_notes: adminNotes })
        .eq('id', selectedRequest.id);

      if (error) throw error;
      
      loadRequests();
      alert('Notas salvas com sucesso!');
      setShowDetailModal(false);
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
      alert('Erro ao salvar notas');
    }
  };

  // 🔥 NOVA FUNÇÃO: Aprovar Pedido
  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('custom_pc_requests')
        .update({
          status: 'approved'
        })
        .eq('id', requestId);

      if (error) throw error;

      alert('✅ Pedido aprovado com sucesso! O cliente será notificado.');
      loadRequests();
    } catch (error) {
      console.error('❌ Erro ao aprovar pedido:', error);
      alert('❌ Erro ao aprovar pedido. Tente novamente.');
    }
  };

  // 🔥 NOVA FUNÇÃO: Rejeitar Pedido
  const handleReject = async (requestId: string) => {
    const reason = prompt('❌ Por favor, informe o motivo da rejeição:');
    if (!reason) return;

    try {
      const { error } = await supabase
        .from('custom_pc_requests')
        .update({
          status: 'rejected',
          admin_notes: reason
        })
        .eq('id', requestId);

      if (error) throw error;

      alert('✅ Pedido rejeitado. O cliente será notificado.');
      loadRequests();
    } catch (error) {
      console.error('❌ Erro ao rejeitar pedido:', error);
      alert('❌ Erro ao rejeitar pedido. Tente novamente.');
    }
  };

  const openDetailModal = (request: CustomPCRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setShowDetailModal(true);
  };

  const filteredRequests = requests.filter(req => {
    if (filterStatus === 'all') return true;
    return req.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'PENDENTE';
      case 'approved': return 'APROVADO';
      case 'rejected': return 'REJEITADO';
      case 'completed': return 'CONCLUÍDO';
      default: return status.toUpperCase();
    }
  };

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
      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-amber-500/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-amber-400">PEDIDOS DE PC PERSONALIZADO</h2>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-amber-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer text-white"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
            <option value="completed">Concluído</option>
          </select>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-20">
            <i className="ri-computer-line text-6xl text-gray-600 mb-4"></i>
            <p className="text-gray-400 text-lg">Nenhum pedido de PC personalizado ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 border border-amber-500/20 hover:border-amber-400 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{request.customer_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">
                      <i className="ri-mail-line mr-2"></i>
                      {request.customer_email}
                    </p>
                    <p className="text-gray-400 text-sm mb-1">
                      <i className="ri-phone-line mr-2"></i>
                      {request.customer_phone}
                    </p>
                    <p className="text-gray-400 text-xs">
                      <i className="ri-calendar-line mr-2"></i>
                      {new Date(request.created_at).toLocaleDateString('pt-PT')} às {new Date(request.created_at).toLocaleTimeString('pt-PT')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-amber-400">€{(request.total_price || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">+ €{(request.assembly_fee || 0).toFixed(2)} montagem</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-900/50 rounded p-3 border border-amber-500/10">
                    <p className="text-xs text-gray-400 mb-1">CPU</p>
                    <p className="text-sm text-white font-semibold">{request.cpu}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded p-3 border border-amber-500/10">
                    <p className="text-xs text-gray-400 mb-1">GPU</p>
                    <p className="text-sm text-white font-semibold">{request.gpu}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded p-3 border border-amber-500/10">
                    <p className="text-xs text-gray-400 mb-1">RAM</p>
                    <p className="text-sm text-white font-semibold">{request.include_ram ? request.ram : 'SEM RAM'}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded p-3 border border-amber-500/10">
                    <p className="text-xs text-gray-400 mb-1">SSD</p>
                    <p className="text-sm text-white font-semibold">{request.ssd}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openDetailModal(request)}
                    className="flex-1 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors cursor-pointer border border-amber-500/30 font-semibold"
                  >
                    <i className="ri-eye-line mr-2"></i>
                    VER DETALHES
                  </button>
                  
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors cursor-pointer border border-green-500/30 font-semibold"
                      >
                        <i className="ri-check-line mr-2"></i>
                        APROVAR
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer border border-red-500/30 font-semibold"
                      >
                        <i className="ri-close-line mr-2"></i>
                        REJEITAR
                      </button>
                    </>
                  )}
                  
                  {request.status === 'approved' && (
                    <button
                      onClick={() => handleStatusChange(request.id, 'completed')}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors cursor-pointer border border-blue-500/30 font-semibold"
                      >
                      <i className="ri-checkbox-circle-line mr-2"></i>
                      MARCAR CONCLUÍDO
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-amber-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-amber-400">DETALHES DO PEDIDO</h3>
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
                    <p className="font-bold text-white text-lg">{selectedRequest.customer_name}</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <p className="font-bold text-white">{selectedRequest.customer_email}</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-sm text-gray-400 mb-1">Telefone</p>
                    <p className="font-bold text-white">{selectedRequest.customer_phone}</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusLabel(selectedRequest.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-amber-500/20 rounded-lg p-4 border border-amber-500/30">
                    <p className="text-sm text-gray-400 mb-1">Preço Total</p>
                    <p className="text-3xl font-bold text-amber-400">€{(selectedRequest.total_price || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">+ €{(selectedRequest.assembly_fee || 0).toFixed(2)} taxa de montagem</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-sm text-gray-400 mb-1">Data do Pedido</p>
                    <p className="font-bold text-white">
                      {new Date(selectedRequest.created_at).toLocaleDateString('pt-PT')}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(selectedRequest.created_at).toLocaleTimeString('pt-PT')}
                    </p>
                  </div>

                  {selectedRequest.approved_at && (
                    <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                      <p className="text-sm text-gray-400 mb-1">Aprovado em</p>
                      <p className="font-bold text-green-400">
                        {new Date(selectedRequest.approved_at).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  )}

                  {selectedRequest.completed_at && (
                    <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
                      <p className="text-sm text-gray-400 mb-1">Concluído em</p>
                      <p className="font-bold text-blue-400">
                        {new Date(selectedRequest.completed_at).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-4">COMPONENTES SELECIONADOS</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-xs text-gray-400 mb-1">CPU</p>
                    <p className="font-bold text-white">{selectedRequest.cpu}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-xs text-gray-400 mb-1">GPU</p>
                    <p className="font-bold text-white">{selectedRequest.gpu}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-xs text-gray-400 mb-1">RAM</p>
                    <p className="font-bold text-white">
                      {selectedRequest.include_ram ? selectedRequest.ram : '❌ SEM RAM (Cliente comprará separadamente)'}
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-xs text-gray-400 mb-1">Placa-Mãe</p>
                    <p className="font-bold text-white">{selectedRequest.motherboard}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-xs text-gray-400 mb-1">SSD</p>
                    <p className="font-bold text-white">{selectedRequest.ssd}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-xs text-gray-400 mb-1">Torre</p>
                    <p className="font-bold text-white">{selectedRequest.case_type}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-xs text-gray-400 mb-1">Fonte</p>
                    <p className="font-bold text-white">{selectedRequest.psu}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-xs text-gray-400 mb-1">Refrigeração</p>
                    <p className="font-bold text-white">{selectedRequest.cooling}</p>
                  </div>
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-3">NOTAS DO CLIENTE</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-white">{selectedRequest.notes}</p>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-3">NOTAS DO ADMIN / CONSELHOS</h4>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={6}
                  placeholder="Adicione notas internas ou conselhos para o cliente sobre mudanças de peças..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-amber-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-white"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleSaveNotes}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-lg hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-save-line mr-2"></i>
                  SALVAR NOTAS
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