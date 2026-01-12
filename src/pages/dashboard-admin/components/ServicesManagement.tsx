import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  icon: string;
  image_url: string;
  is_featured: boolean;
  is_free: boolean;
  is_available: boolean;
  features: string[];
  delivery_time: string;
  created_at: string;
}

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'Desenvolvimento Web',
    'Design',
    'Marketing',
    'Consultoria',
    'Suporte Técnico',
    'Automação',
    'Outros'
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (serviceData: Partial<Service>) => {
    try {
      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        alert('✅ Serviço atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);

        if (error) throw error;
        alert('✅ Serviço criado com sucesso!');
      }

      loadServices();
      setShowModal(false);
      setEditingService(null);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      alert('❌ Erro ao salvar serviço!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este serviço?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      alert('✅ Serviço deletado com sucesso!');
      loadServices();
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      alert('❌ Erro ao deletar serviço!');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Carregando serviços...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">🛠️ Gestão de Serviços</h2>
          <p className="text-gray-400">Gerencie todos os serviços oferecidos</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:scale-105 whitespace-nowrap cursor-pointer"
        >
          <i className="ri-add-line mr-2"></i>
          Adicionar Serviço
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar serviços..."
            className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => (
          <div key={service.id} className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-red-500/20 hover:border-red-500/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <i className={`${service.icon} text-2xl text-white`}></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white line-clamp-1">{service.title}</h3>
                  <span className="text-xs text-gray-400">{service.category}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {service.is_featured && (
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded">
                    ⭐
                  </span>
                )}
                {service.is_free && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">
                    GRÁTIS
                  </span>
                )}
                {!service.is_available && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">
                    INDISPONÍVEL
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-4 line-clamp-3">{service.description}</p>

            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-blue-400">
                {service.is_free ? 'GRÁTIS' : `€${service.price}`}
              </span>
              <span className="text-xs text-gray-500">{service.delivery_time}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingService(service);
                  setShowModal(true);
                }}
                className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-edit-line mr-2"></i>
                Editar
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-delete-bin-line mr-2"></i>
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-20">
          <i className="ri-service-line text-6xl text-gray-600 mb-4"></i>
          <p className="text-gray-400 text-lg">Nenhum serviço encontrado</p>
        </div>
      )}

      {/* Modal de Edição/Criação */}
      {showModal && (
        <ServiceModal
          service={editingService}
          categories={categories}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
}

interface ServiceModalProps {
  service: Service | null;
  categories: string[];
  onSave: (data: Partial<Service>) => void;
  onClose: () => void;
}

function ServiceModal({ service, categories, onSave, onClose }: ServiceModalProps) {
  const [formData, setFormData] = useState({
    title: service?.title || '',
    description: service?.description || '',
    price: service?.price || 0,
    category: service?.category || categories[0],
    icon: service?.icon || 'ri-service-line',
    image_url: service?.image_url || '',
    is_featured: service?.is_featured || false,
    is_free: service?.is_free || false,
    is_available: service?.is_available ?? true,
    features: service?.features || [],
    delivery_time: service?.delivery_time || '1-3 dias'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500/30">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-blue-400">
              {service ? 'EDITAR SERVIÇO' : 'ADICIONAR NOVO SERVIÇO'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-white"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Categoria *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Preço (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-black/40 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  disabled={formData.is_free}
                  required={!formData.is_free}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tempo de Entrega</label>
                <input
                  type="text"
                  value={formData.delivery_time}
                  onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ex: 1-3 dias"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Descrição *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-black/40 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">URL da Imagem</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 bg-black/40 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Ícone (Remix Icon)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 bg-black/40 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Ex: ri-code-line"
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 rounded border-blue-500/30 bg-black/40 text-blue-500 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-400">Serviço em Destaque</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_free}
                  onChange={(e) => setFormData({ ...formData, is_free: e.target.checked, price: e.target.checked ? 0 : formData.price })}
                  className="w-5 h-5 rounded border-blue-500/30 bg-black/40 text-green-500 focus:ring-green-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-400">Serviço Gratuito</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-5 h-5 rounded border-blue-500/30 bg-black/40 text-blue-500 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-400">Disponível</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 cursor-pointer whitespace-nowrap"
              >
                {service ? 'SALVAR ALTERAÇÕES' : 'CRIAR SERVIÇO'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}