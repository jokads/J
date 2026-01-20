import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  bio?: string;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items_count: number;
}

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    title: string;
    price: number;
    images: string[];
    stock: number;
  };
}

type TabType = 'overview' | 'orders' | 'cart' | 'wishlist' | 'security' | 'settings';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { darkMode } = useTheme();
  const { items: cartItems, removeFromCart: removeCartItem, updateQuantity: updateCartQuantity, total: cartTotal } = useCart();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Estados para edição de perfil
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  
  // Estados para mudança de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Estados para upload de avatar
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfileData();
  }, [user, navigate]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Carregar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setEditedProfile(profileData);

      // Carregar pedidos
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total,
          status,
          created_at,
          order_items (count)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!ordersError && ordersData) {
        setOrders(ordersData.map(order => ({
          ...order,
          items_count: order.order_items?.[0]?.count || 0
        })));
      }

      // Carregar lista de desejos com sincronização em tempo real
      await loadWishlist();

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlist')
        .select(`
          id,
          product_id,
          created_at,
          products (
            id,
            title,
            price,
            images,
            stock
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (!wishlistError && wishlistData) {
        setWishlist(wishlistData);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editedProfile.full_name,
          phone: editedProfile.phone,
          address: editedProfile.address,
          city: editedProfile.city,
          country: editedProfile.country,
          postal_code: editedProfile.postal_code,
          bio: editedProfile.bio
        })
        .eq('id', user?.id);

      if (error) throw error;

      setProfile({ ...profile!, ...editedProfile });
      setEditMode(false);
      alert('✅ Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      alert('❌ Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setPasswordError('');
      setPasswordSuccess('');

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('As senhas não coincidem');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setPasswordError('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordSuccess('✅ Senha alterada com sucesso!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      setPasswordError('❌ Erro ao alterar senha. Tente novamente.');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('❌ Por favor, selecione uma imagem válida');
        return;
      }

      // Validar tamanho (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('❌ A imagem deve ter no máximo 2MB');
        return;
      }

      setUploadingAvatar(true);

      // Upload para Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      // Atualizar perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setProfile({ ...profile!, avatar_url: publicUrl });
      alert('✅ Avatar atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      alert('❌ Erro ao fazer upload. Tente novamente.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Recarregar lista atualizada
      await loadWishlist();
    } catch (error) {
      console.error('Erro ao remover da lista:', error);
      alert('❌ Erro ao remover item');
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/20 text-green-500';
      case 'shipped': return 'bg-blue-500/20 text-blue-500';
      case 'processing': return 'bg-yellow-500/20 text-yellow-500';
      case 'cancelled': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Entregue';
      case 'shipped': return 'Enviado';
      case 'processing': return 'Processando';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendente';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-[#0b0011]' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="w-16 h-16 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0b0011]' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header do Perfil */}
        <div className={`rounded-2xl p-8 mb-8 ${darkMode ? 'bg-gradient-to-br from-[#1a0b2e] to-[#16001e] border border-[#b62bff]/20' : 'bg-white border border-gray-200'} shadow-2xl`}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#b62bff] to-[#ff6a00] p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-[#0b0011] flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Botão de Upload */}
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#b62bff] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#9d24d9] transition-all shadow-lg group-hover:scale-110">
                <i className="ri-camera-line text-white text-lg"></i>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
              
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Informações */}
            <div className="flex-1 text-center md:text-left">
              <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile?.full_name || 'Utilizador'}
              </h1>
              <p className={`text-lg mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {user?.email}
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-[#b62bff]/10 border border-[#b62bff]/30' : 'bg-purple-50 border border-purple-200'}`}>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pedidos</span>
                  <p className="text-xl font-bold text-[#b62bff]">{orders.length}</p>
                </div>
                
                <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-[#ff6a00]/10 border border-[#ff6a00]/30' : 'bg-orange-50 border border-orange-200'}`}>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Carrinho</span>
                  <p className="text-xl font-bold text-[#ff6a00]">{cartItems.length}</p>
                </div>
                
                <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Favoritos</span>
                  <p className="text-xl font-bold text-green-500">{wishlist.length}</p>
                </div>
                
                <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Membro desde</span>
                  <p className="text-xl font-bold text-blue-500">
                    {new Date(profile?.created_at || '').getFullYear()}
                  </p>
                </div>
              </div>
            </div>

            {/* Botão Sair */}
            <button
              onClick={signOut}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center gap-2 whitespace-nowrap font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              <i className="ri-logout-box-line"></i>
              Sair
            </button>
          </div>
        </div>

        {/* Navegação por Abas */}
        <div className={`rounded-2xl mb-8 ${darkMode ? 'bg-gradient-to-br from-[#1a0b2e] to-[#16001e] border border-[#b62bff]/20' : 'bg-white border border-gray-200'} shadow-2xl overflow-hidden`}>
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', icon: 'ri-dashboard-line', label: 'Visão Geral' },
              { id: 'orders', icon: 'ri-shopping-bag-line', label: 'Pedidos' },
              { id: 'cart', icon: 'ri-shopping-cart-line', label: 'Carrinho' },
              { id: 'wishlist', icon: 'ri-heart-line', label: 'Favoritos' },
              { id: 'settings', icon: 'ri-settings-line', label: 'Configurações' },
              { id: 'security', icon: 'ri-shield-check-line', label: 'Segurança' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 min-w-[140px] px-6 py-4 flex items-center justify-center gap-2 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white shadow-lg'
                    : darkMode
                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <i className={`${tab.icon} text-xl`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo das Abas */}
        <div className={`rounded-2xl p-8 ${darkMode ? 'bg-gradient-to-br from-[#1a0b2e] to-[#16001e] border border-[#b62bff]/20' : 'bg-white border border-gray-200'} shadow-2xl`}>
          {/* Visão Geral */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Visão Geral da Conta
              </h2>

              {/* Estatísticas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-[#b62bff]/20 to-[#b62bff]/5 border border-[#b62bff]/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'} hover:shadow-xl transition-all`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-[#b62bff] rounded-xl flex items-center justify-center shadow-lg">
                      <i className="ri-money-euro-circle-line text-white text-3xl"></i>
                    </div>
                    <i className="ri-arrow-up-line text-green-500 text-xl"></i>
                  </div>
                  <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Gasto</p>
                  <p className="text-3xl font-bold text-[#b62bff] mb-1">
                    €{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Em {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
                  </p>
                </div>

                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-[#ff6a00]/20 to-[#ff6a00]/5 border border-[#ff6a00]/30' : 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'} hover:shadow-xl transition-all`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-[#ff6a00] rounded-xl flex items-center justify-center shadow-lg">
                      <i className="ri-shopping-cart-2-line text-white text-3xl"></i>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${darkMode ? 'bg-[#ff6a00]/20 text-[#ff6a00]' : 'bg-orange-200 text-orange-700'}`}>
                      {cartItems.length}
                    </span>
                  </div>
                  <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Carrinho Atual</p>
                  <p className="text-3xl font-bold text-[#ff6a00] mb-1">
                    €{cartTotal.toFixed(2)}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
                  </p>
                </div>

                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30' : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'} hover:shadow-xl transition-all`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                      <i className="ri-heart-3-line text-white text-3xl"></i>
                    </div>
                    <i className="ri-star-line text-yellow-500 text-xl"></i>
                  </div>
                  <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Lista de Favoritos</p>
                  <p className="text-3xl font-bold text-green-500 mb-1">
                    {wishlist.length}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Produtos salvos
                  </p>
                </div>

                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'} hover:shadow-xl transition-all`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <i className="ri-calendar-check-line text-white text-3xl"></i>
                    </div>
                    <i className="ri-vip-crown-line text-yellow-500 text-xl"></i>
                  </div>
                  <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Membro desde</p>
                  <p className="text-3xl font-bold text-blue-500 mb-1">
                    {new Date(profile?.created_at || '').getFullYear()}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {Math.floor((Date.now() - new Date(profile?.created_at || '').getTime()) / (1000 * 60 * 60 * 24))} dias conosco
                  </p>
                </div>
              </div>

              {/* Atividade Recente */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Últimos Pedidos */}
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Últimos Pedidos
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-[#b62bff] hover:text-[#9d24d9] text-sm font-medium flex items-center gap-1"
                    >
                      Ver todos
                      <i className="ri-arrow-right-line"></i>
                    </button>
                  </div>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="ri-shopping-bag-line text-4xl text-gray-400 mb-2"></i>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Nenhum pedido ainda
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className={`p-4 rounded-lg ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} transition-all cursor-pointer`}
                          onClick={() => setActiveTab('orders')}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                #{order.order_number}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {new Date(order.created_at).toLocaleDateString('pt-PT')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-[#b62bff]">€{order.total.toFixed(2)}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
                                {getOrderStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Favoritos Recentes */}
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Favoritos Recentes
                    </h3>
                    <button
                      onClick={() => setActiveTab('wishlist')}
                      className="text-[#b62bff] hover:text-[#9d24d9] text-sm font-medium flex items-center gap-1"
                    >
                      Ver todos
                      <i className="ri-arrow-right-line"></i>
                    </button>
                  </div>
                  
                  {wishlist.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="ri-heart-line text-4xl text-gray-400 mb-2"></i>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Nenhum favorito ainda
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {wishlist.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} transition-all cursor-pointer`}
                          onClick={() => navigate(`/produto/${item.product_id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                              {item.products.images?.[0] && (
                                <img
                                  src={item.products.images[0]}
                                  alt={item.products.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {item.products.title}
                              </p>
                              <p className="text-lg font-bold text-[#b62bff]">
                                €{item.products.price.toFixed(2)}
                              </p>
                            </div>
                            <i className="ri-arrow-right-s-line text-gray-400 text-xl"></i>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pedidos */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Histórico de Pedidos
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <i className="ri-shopping-bag-line text-8xl text-gray-400 mb-4"></i>
                  <p className={`text-xl mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Nenhum pedido encontrado
                  </p>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Comece a comprar agora!
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg hover:shadow-xl transition-all font-medium"
                  >
                    Ver Produtos
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-6 rounded-xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'} hover:shadow-xl transition-all`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Pedido #{order.order_number}
                            </p>
                            <span className={`text-xs px-3 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
                              {getOrderStatusText(order.status)}
                            </span>
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(order.created_at).toLocaleDateString('pt-PT', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {order.items_count} {order.items_count === 1 ? 'item' : 'itens'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
                            <p className="text-2xl font-bold text-[#b62bff]">€{order.total.toFixed(2)}</p>
                          </div>
                          
                          <button className="px-6 py-2 bg-[#b62bff] hover:bg-[#9d24d9] text-white rounded-lg transition-all flex items-center gap-2 whitespace-nowrap font-medium">
                            <i className="ri-eye-line"></i>
                            Ver Detalhes
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Carrinho */}
          {activeTab === 'cart' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Meu Carrinho
                </h2>
                <button
                  onClick={() => navigate('/cart')}
                  className="px-6 py-2 bg-[#b62bff] hover:bg-[#9d24d9] text-white rounded-lg transition-all flex items-center gap-2 whitespace-nowrap font-medium"
                >
                  <i className="ri-shopping-cart-line"></i>
                  Ver Carrinho Completo
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-16">
                  <i className="ri-shopping-cart-line text-8xl text-gray-400 mb-4"></i>
                  <p className={`text-xl mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Seu carrinho está vazio
                  </p>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Adicione produtos para começar suas compras!
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg hover:shadow-xl transition-all font-medium"
                  >
                    Explorar Produtos
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Resumo do Carrinho */}
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-[#b62bff]/20 to-[#ff6a00]/20 border border-[#b62bff]/30' : 'bg-gradient-to-br from-purple-50 to-orange-50 border border-purple-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total de itens: {cartItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">€{cartTotal.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => navigate('/checkout')}
                        className="px-8 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg hover:shadow-xl transition-all font-medium flex items-center gap-2"
                      >
                        <i className="ri-secure-payment-line"></i>
                        Finalizar Compra
                      </button>
                    </div>
                  </div>

                  {/* Lista de Itens */}
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-6 rounded-xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'} hover:shadow-xl transition-all`}
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Imagem */}
                          <div className="w-full md:w-32 h-32 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                            {item.product.images?.[0] && (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.title}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              />
                            )}
                          </div>

                          {/* Informações */}
                          <div className="flex-1">
                            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.product.title}
                            </h3>
                            <p className="text-2xl font-bold text-[#b62bff] mb-4">
                              €{item.product.price.toFixed(2)}
                            </p>

                            {/* Controles */}
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  <i className="ri-subtract-line text-xl"></i>
                                </button>
                                <span className={`text-xl font-bold min-w-[3rem] text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stock}
                                  className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  <i className="ri-add-line text-xl"></i>
                                </button>
                              </div>

                              <div className="flex-1"></div>

                              <div className="text-right">
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Subtotal</p>
                                <p className="text-2xl font-bold text-[#ff6a00]">
                                  €{(item.product.price * item.quantity).toFixed(2)}
                                </p>
                              </div>

                              <button
                                onClick={() => removeCartItem(item.id)}
                                className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center text-white transition-all"
                              >
                                <i className="ri-delete-bin-line text-xl"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lista de Desejos */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Lista de Favoritos
              </h2>

              {wishlist.length === 0 ? (
                <div className="text-center py-16">
                  <i className="ri-heart-line text-8xl text-gray-400 mb-4"></i>
                  <p className={`text-xl mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Sua lista está vazia
                  </p>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Adicione produtos aos favoritos!
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg hover:shadow-xl transition-all font-medium"
                  >
                    Explorar Produtos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl overflow-hidden ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'} hover:shadow-xl transition-all group`}
                    >
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        {item.products.images?.[0] && (
                          <img
                            src={item.products.images[0]}
                            alt={item.products.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        )}
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="absolute top-2 right-2 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
                        >
                          <i className="ri-close-line text-xl"></i>
                        </button>
                      </div>
                      
                      <div className="p-4">
                        <h3 className={`font-semibold mb-2 line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.products.title}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-2xl font-bold text-[#b62bff]">
                            €{item.products.price.toFixed(2)}
                          </p>
                          <span className={`text-sm ${item.products.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {item.products.stock > 0 ? 'Em stock' : 'Esgotado'}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => navigate(`/produto/${item.product_id}`)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                        >
                          Ver Produto
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Configurações */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Configurações do Perfil
                </h2>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-6 py-2 bg-[#b62bff] hover:bg-[#9d24d9] text-white rounded-lg transition-all flex items-center gap-2 whitespace-nowrap font-medium"
                  >
                    <i className="ri-edit-line"></i>
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setEditedProfile(profile!);
                      }}
                      className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all flex items-center gap-2 whitespace-nowrap font-medium"
                    >
                      <i className="ri-close-line"></i>
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center gap-2 whitespace-nowrap font-medium disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <i className="ri-save-line"></i>
                          Salvar
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={editedProfile.full_name || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode
                        ? 'bg-white/5 border border-white/10 text-white'
                        : 'bg-gray-50 border border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#b62bff] disabled:opacity-50`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode
                        ? 'bg-white/5 border border-white/10 text-gray-400'
                        : 'bg-gray-100 border border-gray-300 text-gray-600'
                    } cursor-not-allowed`}
                  />
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    O email não pode ser alterado
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={editedProfile.phone || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode
                        ? 'bg-white/5 border border-white/10 text-white'
                        : 'bg-gray-50 border border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#b62bff] disabled:opacity-50`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={editedProfile.city || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode
                        ? 'bg-white/5 border border-white/10 text-white'
                        : 'bg-gray-50 border border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#b62bff] disabled:opacity-50`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    País
                  </label>
                  <input
                    type="text"
                    value={editedProfile.country || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, country: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode
                        ? 'bg-white/5 border border-white/10 text-white'
                        : 'bg-gray-50 border border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#b62bff] disabled:opacity-50`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={editedProfile.postal_code || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, postal_code: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode
                        ? 'bg-white/5 border border-white/10 text-white'
                        : 'bg-gray-50 border border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#b62bff] disabled:opacity-50`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Morada
                  </label>
                  <input
                    type="text"
                    value={editedProfile.address || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode
                        ? 'bg-white/5 border border-white/10 text-white'
                        : 'bg-gray-50 border border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#b62bff] disabled:opacity-50`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode
                        ? 'bg-white/5 border border-white/10 text-white'
                        : 'bg-gray-50 border border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#b62bff] disabled:opacity-50 resize-none`}
                    placeholder="Conte-nos um pouco sobre você..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Segurança */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Segurança da Conta
              </h2>

              {/* Alterar Senha */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <i className="ri-lock-password-line text-[#b62bff]"></i>
                  Alterar Senha
                </h3>

                {passwordError && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500">
                    {passwordSuccess}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg ${
                        darkMode
                          ? 'bg-white/5 border border-white/10 text-white'
                          : 'bg-white border border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg ${
                        darkMode
                          ? 'bg-white/5 border border-white/10 text-white'
                          : 'bg-white border border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                      placeholder="Digite a senha novamente"
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    className="px-8 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg hover:shadow-xl transition-all font-medium flex items-center gap-2"
                  >
                    <i className="ri-lock-line"></i>
                    Alterar Senha
                  </button>
                </div>
              </div>

              {/* Informações de Segurança */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <i className="ri-shield-check-line text-green-500"></i>
                  Informações de Segurança
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-3">
                      <i className="ri-mail-check-line text-green-500 text-2xl"></i>
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Email Verificado
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Seu email está verificado e seguro
                        </p>
                      </div>
                    </div>
                    <i className="ri-checkbox-circle-fill text-green-500 text-2xl"></i>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-center gap-3">
                      <i className="ri-lock-2-line text-blue-500 text-2xl"></i>
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Conexão Segura
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Todas as suas informações são criptografadas
                        </p>
                      </div>
                    </div>
                    <i className="ri-shield-check-line text-blue-500 text-2xl"></i>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <div className="flex items-center gap-3">
                      <i className="ri-user-shield-line text-purple-500 text-2xl"></i>
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Privacidade Protegida
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Seus dados nunca são compartilhados
                        </p>
                      </div>
                    </div>
                    <i className="ri-checkbox-circle-fill text-purple-500 text-2xl"></i>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
