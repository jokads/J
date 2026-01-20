import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  image?: string;
  icon?: string;
  active: boolean;
  category: string;
  delivery_time?: string;
  features?: string[];
  created_at: string;
  // Campos adicionais que vamos usar
  images?: string[];
  short_description?: string;
  price_type?: string;
  vat_enabled?: boolean;
  vat_country?: string;
  vat_rate?: number;
  price_without_vat?: number;
  vat_amount?: number;
  price_with_vat?: number;
  sku?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  tags?: string[];
  featured?: boolean;
  display_order?: number;
}

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [globalVatEnabled, setGlobalVatEnabled] = useState(true);
  const servicesPerPage = 12;

  const categories = [
    { id: 'all', name: 'Todas as Categorias' },
    { id: 'web-development', name: 'Desenvolvimento Web' },
    { id: 'ecommerce', name: 'E-commerce' },
    { id: 'business-tools', name: 'Ferramentas de Negócio' },
    { id: 'automation', name: 'Automação' },
    { id: 'optimization', name: 'Otimização' },
    { id: 'consulting', name: 'Consultoria' }
  ];

  const statusOptions = [
    { id: 'all', name: 'Todos os Status' },
    { id: 'active', name: 'Ativos' },
    { id: 'inactive', name: 'Inativos' }
  ];

  useEffect(() => {
    loadServices();
    loadGlobalVatSetting();
  }, []);

  const loadGlobalVatSetting = async () => {
    try {
      const { data } = await supabase
        .from('tax_settings')
        .select('is_active')
        .eq('rule_name', 'Global VAT')
        .single();
      
      if (data) {
        setGlobalVatEnabled(data.is_active);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de IVA:', error);
    }
  };

  const loadServices = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    // Proteção contra valores undefined/null
    const title = service.title || '';
    const description = service.description || '';
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = title.toLowerCase().includes(searchLower) ||
                         description.toLowerCase().includes(searchLower);
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && service.active) ||
                         (filterStatus === 'inactive' && !service.active);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Paginação
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const startIndex = (currentPage - 1) * servicesPerPage;
  const endIndex = startIndex + servicesPerPage;
  const currentServices = filteredServices.slice(startIndex, endIndex);

  // Resetar página ao filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus]);

  const handleAddService = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadServices();
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      alert('Erro ao excluir serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setIsLoading(true);
    try {
      const service = services.find(s => s.id === id);
      if (!service) return;

      const { error } = await supabase
        .from('services')
        .update({ active: !service.active })
        .eq('id', id);

      if (error) throw error;
      await loadServices();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedServices.size === currentServices.length) {
      setSelectedServices(new Set());
    } else {
      setSelectedServices(new Set(currentServices.map(s => s.id)));
    }
  };

  const handleSelectService = (id: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedServices(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedServices.size === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selectedServices.size} serviço(s)?`)) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .in('id', Array.from(selectedServices));

      if (error) throw error;
      setSelectedServices(new Set());
      await loadServices();
    } catch (error) {
      console.error('Erro ao excluir serviços:', error);
      alert('Erro ao excluir serviços');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
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
      <div className="flex items-center justify-between mt-6 px-6 py-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredServices.length)} de {filteredServices.length} serviços
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-2"
          >
            <i className="ri-arrow-left-s-line"></i>
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <div className="flex items-center gap-1">
            {pages.map((page, idx) => (
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-400">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-2"
          >
            <span className="hidden sm:inline">Próximo</span>
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Serviços</h2>
          <p className="text-gray-600 mt-1">Gerir serviços profissionais oferecidos</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedServices.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <i className="ri-delete-bin-line text-xl"></i>
              Excluir ({selectedServices.size})
            </button>
          )}
          <button
            onClick={handleAddService}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <i className="ri-add-line text-xl"></i>
            Adicionar Serviço
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesquisar Serviços
            </label>
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome ou descrição..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm cursor-pointer"
            >
              {statusOptions.map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Serviços</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{services.length}</p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg">
              <i className="ri-service-line text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Serviços Ativos</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {services.filter(s => s.active).length}
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-lg">
              <i className="ri-check-line text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Em Destaque</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {services.filter(s => s.featured).length}
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg">
              <i className="ri-star-line text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Preço Médio</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                €{services.length > 0 ? (services.reduce((sum, s) => sum + s.price, 0) / services.length).toFixed(0) : 0}
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg">
              <i className="ri-money-euro-circle-line text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-500">A carregar serviços...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-service-line text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-lg">Nenhum serviço encontrado</p>
            <button
              onClick={handleAddService}
              className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
            >
              Adicionar Primeiro Serviço
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedServices.size === currentServices.length && currentServices.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Serviço
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Prazo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentServices.map((service) => {
                    const serviceImages = service.images && service.images.length > 0 
                      ? service.images 
                      : service.image 
                        ? [service.image]
                        : [`https://readdy.ai/api/search-image?query=professional%20$%7Bservice.title%7D%20service%20illustration&width=400&height=300&seq=serv-${service.id}&orientation=landscape`];
                    
                    return (
                      <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedServices.has(service.id)}
                            onChange={() => handleSelectService(service.id)}
                            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img 
                                src={serviceImages[0]} 
                                alt={service.title}
                                className="w-full h-full object-cover"
                              />
                              {serviceImages.length > 1 && (
                                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-amber-500 text-white text-xs font-bold rounded">
                                  🖼️ {serviceImages.length}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{service.title}</p>
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {service.short_description || service.description}
                              </p>
                              {service.sku && (
                                <p className="text-xs text-gray-400 mt-1">SKU: {service.sku}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {categories.find(c => c.id === service.category)?.name || service.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">
                              €{service.price.toFixed(2)}
                            </span>
                            {service.vat_enabled && service.price_with_vat && (
                              <span className="text-xs text-green-600">
                                c/ IVA: €{service.price_with_vat.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {service.delivery_time || 'Sob consulta'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(service.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                              service.active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {service.active ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/services/${service.slug}`}
                              target="_blank"
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Ver Serviço"
                            >
                              <i className="ri-eye-line"></i>
                            </Link>
                            <button
                              onClick={() => handleEditService(service)}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {renderPagination()}
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg flex-shrink-0">
            <i className="ri-information-line text-xl"></i>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Gestão de Serviços Profissionais</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Aqui você pode adicionar, editar e gerenciar todos os serviços profissionais oferecidos. 
              Configure preços, IVA, galeria de imagens (até 10 fotos), defina prazos de entrega, adicione descrições detalhadas e 
              organize por categorias. Os serviços aparecem automaticamente na página de Serviços do site e na página inicial quando marcados como destaque.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Edição/Criação */}
      {isModalOpen && (
        <ServiceFormModal
          service={editingService}
          globalVatEnabled={globalVatEnabled}
          onClose={() => {
            setIsModalOpen(false);
            setEditingService(null);
          }}
          onSave={async () => {
            setIsModalOpen(false);
            setEditingService(null);
            await loadServices();
          }}
        />
      )}
    </div>
  );
}

// Componente do Modal de Formulário
function ServiceFormModal({ 
  service, 
  globalVatEnabled,
  onClose, 
  onSave 
}: { 
  service: Service | null;
  globalVatEnabled: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  // Implementação do formulário será feita no próximo arquivo
  return null;
}
