import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import CustomPCRequests from './components/CustomPCRequests';
import OrdersTab from './components/OrdersTab';
import CustomersTab from './components/CustomersTab';
import LevelsTab from './components/LevelsTab';
import TeamTab from './components/TeamTab';
import NotesTab from './components/NotesTab';
import MarketplaceTab from './components/MarketplaceTab';
import ShowcaseTab from './components/ShowcaseTab';
import ContactMessagesTab from './components/ContactMessagesTab';
import PreBuiltPCsTab from './components/PreBuiltPCsTab';
import ProductsTab from './components/ProductsTab';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  description: string;
  featured: boolean;
  created_at?: string;
}

interface ProductFormModalProps {
  product: Product | null;
  onSave: (product: Partial<Product>) => void;
  onClose: () => void;
}

function ProductFormModal({ product, onSave, onClose }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    category: product?.category || 'GPU',
    price: product?.price || 0,
    stock: product?.stock || 0,
    image_url: product?.image_url || '',
    description: product?.description || '',
    featured: product?.featured || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.brand || !formData.category || formData.price <= 0) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-red-500/30">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-red-400">
              {product ? 'EDITAR PRODUTO' : 'ADICIONAR NOVO PRODUTO'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-white"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Marca *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  required
                >
                  <option value="CPU">CPU</option>
                  <option value="GPU">GPU</option>
                  <option value="RAM">RAM</option>
                  <option value="Armazenamento">Armazenamento</option>
                  <option value="Placa-Mãe">Placa-Mãe</option>
                  <option value="Fonte">Fonte</option>
                  <option value="Cabos">Cabos</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Periféricos">Periféricos</option>
                  <option value="PC Completo">PC Completo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Preço (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Estoque *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                URL da Imagem
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="https://exemplo.com/imagem.jpg"
              />
              {formData.image_url && (
                <div className="mt-3 w-32 h-32 rounded-lg overflow-hidden bg-black/40 border border-red-500/20">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Erro+ao+Carregar';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-black/40 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                placeholder="Descrição detalhada do produto..."
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 rounded border-red-500/30 bg-black/40 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-400">
                  Marcar como produto em destaque
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-black font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/50 cursor-pointer whitespace-nowrap"
              >
                {product ? 'SALVAR ALTERAÇÕES' : 'CRIAR PRODUTO'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Estados para dados em tempo real
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerLevels, setCustomerLevels] = useState<CustomerLevel[]>([]);
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [customPCRequests, setCustomPCRequests] = useState<CustomPCRequest[]>([]);
  const [realtimeActive, setRealtimeActive] = useState(false);

  // Estados para produtos
  const [productsState, setProductsState] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const productsPerPage = 20;

  // ✅ DEFINIR FUNÇÕES ANTES DO useEffect
  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProductsState(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

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
    }
  };

  const loadCustomerLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_levels')
        .select('*')
        .order('level', { ascending: false });

      if (error) throw error;
      setCustomerLevels(data || []);
    } catch (error) {
      console.error('Erro ao carregar níveis:', error);
    }
  };

  const loadAdminNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAdminNotes(data || []);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    }
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    }
  };

  const loadCustomPCRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_pc_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomPCRequests(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos de PC:', error);
    }
  };

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadProducts(),
        loadOrders(),
        loadCustomerLevels(),
        loadAdminNotes(),
        loadProfiles(),
        loadCustomPCRequests(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const setupRealtimeSync = () => {
    try {
      // Sincronizar produtos
      const productsChannel = supabase
        .channel('products-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          loadProducts();
        })
        .subscribe();

      // Sincronizar pedidos
      const ordersChannel = supabase
        .channel('orders-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          loadOrders();
        })
        .subscribe();

      // Sincronizar níveis
      const levelsChannel = supabase
        .channel('levels-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_levels' }, () => {
          loadCustomerLevels();
        })
        .subscribe();

      // Sincronizar notas
      const notesChannel = supabase
        .channel('notes-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_notes' }, () => {
          loadAdminNotes();
        })
        .subscribe();

      // Sincronizar pedidos de PC
      const pcRequestsChannel = supabase
        .channel('pc-requests-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_pc_requests' }, () => {
          loadCustomPCRequests();
        })
        .subscribe();

      setRealtimeActive(true);

      return () => {
        productsChannel.unsubscribe();
        ordersChannel.unsubscribe();
        levelsChannel.unsubscribe();
        notesChannel.unsubscribe();
        pcRequestsChannel.unsubscribe();
      };
    } catch (error) {
      console.error('Erro ao configurar sincronização em tempo real:', error);
    }
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('❌ Usuário não autenticado');
          navigate('/login');
          return;
        }

        console.log('✅ Usuário autenticado:', user.email);
        setUserEmail(user.email || '');

        // Buscar perfil do usuário
        const { data: perfil, error: perfilError } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', user.id)
          .single();

        if (perfilError || !perfil) {
          console.error('❌ Erro ao buscar perfil:', perfilError);
          navigate('/login');
          return;
        }

        console.log('✅ Perfil encontrado:', perfil);
        setUserName(perfil.full_name || perfil.email || 'Usuário');

        // ✅ VERIFICAR SE É ADMIN OU SUPER ADMIN
        if (!perfil.is_admin && !perfil.is_super_admin) {
          console.log('❌ Usuário não é admin - Acesso negado');
          alert('⛔ Acesso negado! Apenas administradores podem acessar o dashboard.');
          navigate('/');
          return;
        }

        console.log('✅ Acesso ao dashboard autorizado!');
        setIsAdmin(perfil.is_admin || false);
        setIsSuperAdmin(perfil.is_super_admin || false);
        setLoading(false);
        
        loadAllData();
        setupRealtimeSync();
      } catch (error) {
        console.error('❌ Erro ao verificar acesso:', error);
        navigate('/login');
      }
    };

    checkAdminAccess();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-6xl text-red-400 animate-spin mb-4"></i>
          <p className="text-gray-400 text-lg">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        alert('Produto atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        alert('Produto criado com sucesso!');
      }

      loadProducts();
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto!');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja remover este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      alert('Produto removido com sucesso!');
      loadProducts();
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      alert('Erro ao remover produto!');
    }
  };

  const handleToggleFeatured = async (productId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ featured: !currentFeatured })
        .eq('id', productId);

      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('Erro ao atualizar destaque:', error);
      alert('Erro ao atualizar destaque!');
    }
  };

  // Calcular estatísticas
  const totalOrders = orders.length;
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalProducts = productsState.length;
  const lowStockProducts = productsState.filter(p => p.stock < 10).length;
  const featuredProducts = productsState.filter(p => p.featured).length;
  const totalCustomers = profiles.length;
  const customersWithLevels = customerLevels.length;
  const pendingPCRequests = customPCRequests.filter(r => r.status === 'pending').length;
  const teamMembers = profiles.filter(p => p.is_admin || p.is_super_admin).length;
  const totalStockValue = productsState.reduce((sum, p) => sum + (Number(p.price) * p.stock), 0);

  // Filtrar e ordenar produtos
  const filteredProducts = productsState
    .filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'created':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Paginação
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const getDiscountByLevel = (level: number) => {
    if (level >= 40) return 25;
    if (level >= 20) return 15 + Math.floor((level - 20) / 4);
    if (level >= 10) return 10;
    if (level >= 5) return 5;
    return 0;
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: 'ri-dashboard-line', color: 'blue' },
    { id: 'products', label: 'Produtos', icon: 'ri-box-3-line', color: 'purple' },
    { id: 'showcase', label: 'Produtos Destaque', icon: 'ri-star-line', color: 'amber' },
    { id: 'prebuilt', label: 'PCs Pré-Montados', icon: 'ri-computer-line', color: 'green' },
    { id: 'orders', label: 'Pedidos', icon: 'ri-shopping-cart-line', color: 'blue' },
    { id: 'customers', label: 'Clientes', icon: 'ri-user-line', color: 'indigo' },
    { id: 'marketplace', label: 'Marketplace', icon: 'ri-store-line', color: 'purple' },
    { id: 'team', label: 'Equipe', icon: 'ri-team-line', color: 'cyan' },
    { id: 'levels', label: 'Níveis VIP', icon: 'ri-vip-crown-line', color: 'amber' },
    { id: 'custom-pc', label: 'PCs Personalizados', icon: 'ri-tools-line', color: 'orange' },
    { id: 'messages', label: 'Mensagens', icon: 'ri-message-3-line', color: 'pink' },
    { id: 'notes', label: 'Notas', icon: 'ri-sticky-note-line', color: 'yellow' }
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-red-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="https://static.readdy.ai/image/11c045e4b30f34bd1099174507d667e0/cb4831d791909a4a7679c925d26faa2b.png" 
                alt="JokaTech" 
                className="h-10 w-10 object-contain"
              />
              <div className="hidden sm:block">
                <span className="text-white font-bold text-xl">Joka</span>
                <span className="text-black font-bold text-xl bg-gradient-to-r from-red-400 to-red-600 px-2 py-1 rounded ml-1">Tech Dash</span>
              </div>
            </div>

            {/* Menu de Navegação do Site + User Info */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Botão Voltar ao Site */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all cursor-pointer font-bold text-sm sm:text-base border border-red-500/30"
              >
                <i className="ri-home-line"></i>
                <span className="hidden sm:inline">Voltar ao Site</span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-black/40 text-white rounded-lg hover:bg-black/60 transition-all cursor-pointer border border-red-500/30"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-black font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold">{userName}</p>
                    <p className="text-xs text-gray-400">{isSuperAdmin ? '👑 Super Admin' : '🔑 Admin'}</p>
                  </div>
                  <i className={`ri-arrow-${showUserMenu ? 'up' : 'down'}-s-line`}></i>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-red-500/30 overflow-hidden z-50">
                    <div className="p-4 border-b border-red-500/20">
                      <p className="text-white font-bold">{userName}</p>
                      <p className="text-xs text-gray-400">{userEmail}</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                        isSuperAdmin 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-black' 
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {isSuperAdmin ? '👑 SUPER ADMINISTRADOR' : '🔑 ADMINISTRADOR'}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/perfil')}
                      className="w-full px-4 py-3 text-left text-white hover:bg-red-500/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <i className="ri-user-line"></i>
                      Meu Perfil
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="w-full px-4 py-3 text-left text-white hover:bg-red-500/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <i className="ri-home-line"></i>
                      Ir para o Site
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/20 transition-all cursor-pointer flex items-center gap-2 border-t border-red-500/20"
                    >
                      <i className="ri-logout-box-line"></i>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-black shadow-lg'
                  : 'bg-black/60 text-gray-400 hover:bg-black/80 border border-red-500/20 hover:scale-105'
              }`}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Alertas Importantes */}
            {(pendingOrders > 0 || lowStockProducts > 0 || pendingPCRequests > 0) && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                  <i className="ri-alert-line"></i>
                  ALERTAS IMPORTANTES
                </h3>
                <div className="space-y-2">
                  {pendingOrders > 0 && (
                    <p className="text-yellow-300 flex items-center gap-2">
                      <i className="ri-error-warning-line"></i>
                      {pendingOrders} pedidos pendentes aguardando processamento
                    </p>
                  )}
                  {lowStockProducts > 0 && (
                    <p className="text-yellow-300 flex items-center gap-2">
                      <i className="ri-error-warning-line"></i>
                      {lowStockProducts} produtos com estoque baixo (menos de 10 unidades)
                    </p>
                  )}
                  {pendingPCRequests > 0 && (
                    <p className="text-yellow-300 flex items-center gap-2">
                      <i className="ri-information-line"></i>
                      {pendingPCRequests} pedidos de PC personalizado aguardando resposta
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total de Pedidos */}
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center">
                    <i className="ri-shopping-cart-line text-2xl text-blue-400"></i>
                  </div>
                  {pendingOrders > 0 && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30">
                      ⚠️ {pendingOrders} pendentes
                    </span>
                  )}
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Total de Pedidos</h3>
                <p className="text-4xl font-bold text-white">{totalOrders}</p>
                <p className="text-xs text-gray-500 mt-2">Todos os pedidos</p>
              </div>

              {/* Receita Total */}
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center">
                    <i className="ri-money-euro-circle-line text-2xl text-green-400"></i>
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Receita Total</h3>
                <p className="text-4xl font-bold text-white">€ {totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">Todos os pedidos</p>
              </div>

              {/* Total de Produtos */}
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center">
                    <i className="ri-box-line text-2xl text-purple-400"></i>
                  </div>
                  {lowStockProducts > 0 && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30">
                      ⚠️ {lowStockProducts} estoque baixo
                    </span>
                  )}
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Total de Produtos</h3>
                <p className="text-4xl font-bold text-white">{totalProducts}</p>
                <p className="text-xs text-gray-500 mt-2">{featuredProducts} em destaque</p>
              </div>

              {/* Total de Clientes */}
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-500/30 rounded-lg flex items-center justify-center">
                    <i className="ri-user-line text-2xl text-amber-400"></i>
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Total de Clientes</h3>
                <p className="text-4xl font-bold text-white">{totalCustomers}</p>
                <p className="text-xs text-gray-500 mt-2">{customersWithLevels} com níveis</p>
              </div>
            </div>

            {/* Estatísticas Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-red-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <i className="ri-star-line text-2xl text-red-400"></i>
                  <h3 className="text-gray-400 text-sm">Produtos em Destaque</h3>
                </div>
                <p className="text-3xl font-bold text-white">{featuredProducts}</p>
              </div>

              <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-red-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <i className="ri-computer-line text-2xl text-red-400"></i>
                  <h3 className="text-gray-400 text-sm">Pedidos de PC Custom</h3>
                </div>
                <p className="text-3xl font-bold text-white">{customPCRequests.length}</p>
                {pendingPCRequests > 0 && (
                  <p className="text-xs text-yellow-400 mt-1">⚠️ {pendingPCRequests} pendentes</p>
                )}
              </div>

              <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-red-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <i className="ri-team-line text-2xl text-red-400"></i>
                  <h3 className="text-gray-400 text-sm">Membros da Equipe</h3>
                </div>
                <p className="text-3xl font-bold text-white">{teamMembers}</p>
                <p className="text-xs text-gray-500 mt-1">{profiles.filter(p => p.is_super_admin).length} super admins</p>
              </div>

              <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-red-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <i className="ri-money-euro-box-line text-2xl text-red-400"></i>
                  <h3 className="text-gray-400 text-sm">Valor Total em Estoque</h3>
                </div>
                <p className="text-3xl font-bold text-white">€ {totalStockValue.toFixed(2)}</p>
              </div>
            </div>

            {/* Top 5 Clientes e Últimos Pedidos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Últimos 5 Pedidos */}
              <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-red-500/20">
                <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                  <i className="ri-shopping-bag-line"></i>
                  ÚLTIMOS 5 PEDIDOS
                </h3>
                {orders.slice(0, 5).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum pedido ainda</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="bg-gray-800/50 rounded-lg p-4 border border-red-500/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-bold">#{order.id.slice(0, 8)}</span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-red-400">€{Number(order.total).toFixed(2)}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('pt-PT')} às {new Date(order.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top 6 Clientes com Níveis */}
              <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-red-500/20">
                <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                  <i className="ri-vip-crown-line"></i>
                  TOP 6 CLIENTES (NÍVEIS)
                </h3>
                {customerLevels.slice(0, 6).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum cliente com nível ainda</p>
                ) : (
                  <div className="space-y-3">
                    {customerLevels.slice(0, 6).map((level, index) => {
                      const profile = profiles.find(p => p.id === level.user_id);
                      return (
                        <div key={level.id} className="bg-gray-800/50 rounded-lg p-4 border border-red-500/10">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-black font-bold">
                              {profile?.full_name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-bold">{profile?.full_name || 'Cliente'}</p>
                              <p className="text-xs text-gray-500">{profile?.email}</p>
                            </div>
                            <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-black text-sm font-bold rounded-full">
                              Nível {level.level}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{level.total_purchases} compras</span>
                            <span className="text-red-400 font-bold">€{Number(level.total_spent).toFixed(2)}</span>
                            <span className="text-green-400">{level.discount_percentage}% desconto</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Pedidos de PC Personalizado - Preview */}
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-red-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                  <i className="ri-computer-line"></i>
                  PEDIDOS DE PC PERSONALIZADO
                </h3>
                <button
                  onClick={() => setActiveTab('custom-pc')}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all cursor-pointer text-sm font-bold"
                >
                  VER TODOS
                </button>
              </div>
              {customPCRequests.slice(0, 3).length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum pedido de PC personalizado ainda</p>
              ) : (
                <div className="space-y-3">
                  {customPCRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="bg-gray-800/50 rounded-lg p-4 border border-red-500/10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-white font-bold">{request.customer_name}</p>
                          <p className="text-xs text-gray-500">{request.customer_email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          request.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-red-400">€{Number(request.total_price).toFixed(2)}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString('pt-PT')} às {new Date(request.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {request.notes && (
                        <p className="text-sm text-gray-400 mt-2 line-clamp-1">{request.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Equipe e Notas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Equipe JokaTech */}
              <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-red-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                    <i className="ri-team-line"></i>
                    EQUIPE JOKATECH
                  </h3>
                  <button
                    onClick={() => setActiveTab('team')}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all cursor-pointer text-sm font-bold"
                  >
                    VER TODOS
                  </button>
                </div>
                {profiles.filter(p => p.is_admin || p.is_super_admin).slice(0, 4).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum membro da equipe ainda</p>
                ) : (
                  <div className="space-y-3">
                    {profiles.filter(p => p.is_admin || p.is_super_admin).slice(0, 4).map((profile) => (
                      <div key={profile.id} className="bg-gray-800/50 rounded-lg p-4 border border-red-500/10 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-black font-bold text-lg">
                          {profile.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-bold">{profile.full_name}</p>
                          <p className="text-xs text-gray-500">{profile.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          profile.is_super_admin 
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-black' 
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {profile.is_super_admin ? 'SUPER ADMIN' : 'ADMIN'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notas Importantes */}
              <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-red-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                    <i className="ri-sticky-note-line"></i>
                    NOTAS IMPORTANTES
                  </h3>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all cursor-pointer text-sm font-bold"
                  >
                    VER TODAS
                  </button>
                </div>
                {adminNotes.slice(0, 3).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhuma nota ainda</p>
                ) : (
                  <div className="space-y-3">
                    {adminNotes.slice(0, 3).map((note) => (
                      <div key={note.id} className="bg-gray-800/50 rounded-lg p-4 border border-red-500/10">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-black font-bold flex-shrink-0">
                            {note.admin_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold">{note.admin_name}</p>
                            <p className="text-xs text-gray-500">{note.admin_email}</p>
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {new Date(note.created_at).toLocaleDateString('pt-PT')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{note.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ✅ REMOVER ABAS QUE NÃO EXISTEM */}
        {/* {activeTab === 'controlo-total' && <ControloTotal />} */}
        {/* {activeTab === 'news' && <NewsManagement />} */}
        {/* {activeTab === 'reviews' && <ReviewsManagement />} */}
        {/* {activeTab === 'categories' && <CategoriesManagement />} */}
        {/* {activeTab === 'site-settings' && <SiteSettings />} */}

        {/* Products Tab */}
        {activeTab === 'products' && <ProductsTab />}

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && <MarketplaceTab />}

        {/* Contact Messages Tab */}
        {activeTab === 'messages' && <ContactMessagesTab />}

        {/* Custom PC Tab */}
        {activeTab === 'custom-pc' && <CustomPCRequests />}

        {/* Orders Tab */}
        {activeTab === 'orders' && <OrdersTab />}

        {/* Customers Tab */}
        {activeTab === 'customers' && <CustomersTab />}

        {/* Levels Tab */}
        {activeTab === 'levels' && <LevelsTab />}

        {/* Team Tab */}
        {activeTab === 'team' && <TeamTab />}

        {/* Notes Tab */}
        {activeTab === 'notes' && <NotesTab />}

        {/* Showcase Tab */}
        {activeTab === 'showcase' && <ShowcaseTab />}

        {/* PreBuilt PCs Tab */}
        {activeTab === 'prebuilt' && <PreBuiltPCsTab />}
      </main>
    </div>
  );
}