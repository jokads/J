import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function ReviewsManagement() {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadReviews();
    loadProducts();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          products (name, image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      alert('✅ Avaliação aprovada com sucesso!');
      loadReviews();
    } catch (error: any) {
      console.error('Erro ao aprovar avaliação:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Tem certeza que deseja rejeitar esta avaliação?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      alert('✅ Avaliação rejeitada!');
      loadReviews();
    } catch (error: any) {
      console.error('Erro ao rejeitar avaliação:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta avaliação permanentemente?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Avaliação deletada com sucesso!');
      loadReviews();
    } catch (error: any) {
      console.error('Erro ao deletar avaliação:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = selectedStatus === 'all' 
    ? reviews 
    : reviews.filter(r => r.status === selectedStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/50 rounded-full text-xs font-bold">✅ APROVADA</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-full text-xs font-bold">⏳ PENDENTE</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded-full text-xs font-bold">❌ REJEITADA</span>;
      default:
        return null;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`ri-star-${star <= rating ? 'fill' : 'line'} text-xl ${
              star <= rating ? 'text-yellow-400' : 'text-gray-600'
            }`}
          ></i>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/30 rounded-xl p-6">
        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <i className="ri-star-line text-yellow-400"></i>
          ⭐ GESTÃO DE AVALIAÇÕES
        </h2>
        <p className="text-gray-300">
          Gerencie todas as avaliações de produtos: aprovar, rejeitar ou deletar
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/20">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              selectedStatus === 'all'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              selectedStatus === 'pending'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            ⏳ Pendentes
          </button>
          <button
            onClick={() => setSelectedStatus('approved')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              selectedStatus === 'approved'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            ✅ Aprovadas
          </button>
          <button
            onClick={() => setSelectedStatus('rejected')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              selectedStatus === 'rejected'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            ❌ Rejeitadas
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-star-line text-3xl text-blue-400"></i>
            <span className="text-3xl font-black text-white">{reviews.length}</span>
          </div>
          <p className="text-gray-300 font-bold">Total de Avaliações</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-time-line text-3xl text-yellow-400"></i>
            <span className="text-3xl font-black text-white">
              {reviews.filter(r => r.status === 'pending').length}
            </span>
          </div>
          <p className="text-gray-300 font-bold">Pendentes</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-checkbox-circle-line text-3xl text-green-400"></i>
            <span className="text-3xl font-black text-white">
              {reviews.filter(r => r.status === 'approved').length}
            </span>
          </div>
          <p className="text-gray-300 font-bold">Aprovadas</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-close-circle-line text-3xl text-red-400"></i>
            <span className="text-3xl font-black text-white">
              {reviews.filter(r => r.status === 'rejected').length}
            </span>
          </div>
          <p className="text-gray-300 font-bold">Rejeitadas</p>
        </div>
      </div>

      {/* Lista de Avaliações */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-400">Carregando avaliações...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-black/60 backdrop-blur-sm rounded-xl border border-yellow-500/20">
          <i className="ri-star-line text-6xl text-gray-600 mb-4"></i>
          <p className="text-gray-400 text-lg">Nenhuma avaliação encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/20 hover:border-yellow-500/50 transition-all">
              <div className="flex items-start gap-6">
                {/* Imagem do Produto */}
                {review.products?.image_url && (
                  <div className="flex-shrink-0">
                    <img 
                      src={review.products.image_url} 
                      alt={review.products.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {review.products?.name || 'Produto não encontrado'}
                      </h3>
                      <div className="flex items-center gap-3 mb-2">
                        {renderStars(review.rating)}
                        {getStatusBadge(review.status)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 mb-3">
                    <p className="text-gray-300 mb-2">
                      <strong className="text-white">Cliente:</strong> {review.user_name || 'Anônimo'}
                    </p>
                    <p className="text-gray-300 mb-2">
                      <strong className="text-white">Email:</strong> {review.user_email || 'Não informado'}
                    </p>
                    <p className="text-gray-300">
                      <strong className="text-white">Comentário:</strong>
                    </p>
                    <p className="text-gray-400 mt-1">{review.comment}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Data: {new Date(review.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 mt-4">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all font-bold disabled:opacity-50"
                      >
                        <i className="ri-checkbox-circle-line mr-2"></i>
                        Aprovar
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button
                        onClick={() => handleReject(review.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all font-bold disabled:opacity-50"
                      >
                        <i className="ri-close-circle-line mr-2"></i>
                        Rejeitar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-bold disabled:opacity-50"
                    >
                      <i className="ri-delete-bin-line mr-2"></i>
                      Deletar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
