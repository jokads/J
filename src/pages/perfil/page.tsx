import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import SellerDashboard from './components/SellerDashboard';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

interface Profile {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  codigo_postal: string;
  pais: string;
  is_seller: boolean;
  seller_approved: boolean;
  seller_name?: string;
  seller_description?: string;
  seller_phone?: string;
  seller_address?: string;
  nivel_vip?: string;
  pontos_fidelidade?: number;
  level?: number;
  created_at: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  tracking_code?: string;
  items: any[];
}

export default function PerfilPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inicio');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});

  // 🔥 NOVO: Estados para Carrinho
  const [cartItems, setCartItems] = useState<any[]>([]);

  // 🔥 NOVO: Estados para Segurança
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 🔥 ADICIONAR: Estado para o usuário autenticado
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    loadCartFromLocalStorage(); // 🔥 NOVO: Carregar carrinho
  }, []);

  // 🔥 NOVO: Carregar carrinho do localStorage
  const loadCartFromLocalStorage = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(cart);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    }
  };

  // 🔥 NOVO: Listener para mudanças no carrinho
  useEffect(() => {
    const handleStorageChange = () => {
      loadCartFromLocalStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Também escutar eventos customizados
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // 🔥 SALVAR: Usuário autenticado no estado
      setCurrentUser(user);

      // Buscar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      console.log('✅ Perfil carregado:', profileData);
      console.log('🏪 É vendedor?', profileData?.is_seller);
      console.log('✅ Vendedor aprovado?', profileData?.seller_approved);

      setProfile(profileData);
      setEditedProfile(profileData);

      // Buscar pedidos
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);

      // Buscar favoritos
      const { data: favoritesData } = await supabase
        .from('user_favorites')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id);

      setFavorites(favoritesData || []);

    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('perfis')
        .update(editedProfile)
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...editedProfile });
      setIsEditing(false);
      alert('✅ Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      alert('❌ Erro ao atualizar perfil');
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(f => f.id !== favoriteId));
    } catch (error) {
      console.error('❌ Erro ao remover favorito:', error);
    }
  };

  // 🔥 NOVO: Mudar Email com Verificação
  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      alert('Por favor, insira um email válido');
      return;
    }

    if (newEmail === currentUser?.email) {
      alert('O novo email é igual ao email atual');
      return;
    }

    try {
      setIsChangingEmail(true);

      // Primeiro, verificar se o email já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('perfis')
        .select('id')
        .eq('email', newEmail)
        .single();

      if (existingUser) {
        alert('❌ Este email já está registrado no sistema. Por favor, use outro email.');
        setIsChangingEmail(false);
        return;
      }

      // Se não existe, prosseguir com a atualização
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) {
        if (error.message.includes('already been registered')) {
          alert('❌ Este email já está registrado no sistema. Por favor, use outro email.');
        } else {
          alert(`Erro ao mudar email: ${error.message}`);
        }
        return;
      }

      alert('✅ Email de verificação enviado! Verifique sua caixa de entrada do novo email para confirmar a mudança.');
      setNewEmail('');
    } catch (error: any) {
      console.error('Erro ao mudar email:', error);
      if (error.message?.includes('already been registered')) {
        alert('❌ Este email já está registrado no sistema. Por favor, use outro email.');
      } else {
        alert('Erro ao mudar email. Tente novamente.');
      }
    } finally {
      setIsChangingEmail(false);
    }
  };

  // 🔥 NOVO: Mudar Senha
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      alert('✅ Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('❌ Erro ao mudar senha:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 🔥 NOVO: Deletar Conta
  const handleDeleteAccount = async () => {
    const confirm1 = window.confirm(
      '⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\nTodos os seus dados serão permanentemente deletados:\n- Perfil\n- Pedidos\n- Favoritos\n- Avaliações\n\nTem certeza que deseja continuar?'
    );

    if (!confirm1) return;

    const confirm2 = window.confirm(
      '🚨 ÚLTIMA CONFIRMAÇÃO!\n\nEsta é sua última chance de cancelar.\n\nDeseja realmente deletar sua conta permanentemente?'
    );

    if (!confirm2) return;

    try {
      // Deletar perfil do Supabase
      if (profile) {
        const { error: profileError } = await supabase
          .from('perfis')
          .delete()
          .eq('id', profile.id);

        if (profileError) throw profileError;
      }

      // Fazer logout
      await supabase.auth.signOut();
      
      alert('✅ Conta deletada com sucesso. Sentiremos sua falta!');
      navigate('/');
    } catch (error: any) {
      console.error('❌ Erro ao deletar conta:', error);
      alert(`❌ Erro: ${error.message}`);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Total de Pedidos</p>
                    <p className="text-3xl font-bold mt-1">{orders.length}</p>
                  </div>
                  <i className="ri-shopping-bag-3-line text-4xl text-red-200"></i>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Favoritos</p>
                    <p className="text-3xl font-bold mt-1">{favorites.length}</p>
                  </div>
                  <i className="ri-heart-3-line text-4xl text-emerald-200"></i>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Nível VIP</p>
                    <p className="text-3xl font-bold mt-1">{profile?.level || 1}</p>
                  </div>
                  <i className="ri-vip-crown-line text-4xl text-purple-200"></i>
                </div>
              </div>
            </div>

            {/* Informações do Perfil - DARK THEME */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl p-6 border-2 border-red-500/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Informações do Perfil</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:scale-105 whitespace-nowrap"
                  >
                    <i className="ri-edit-line mr-2"></i>
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:scale-105 whitespace-nowrap"
                    >
                      <i className="ri-save-line mr-2"></i>
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedProfile(profile || {});
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:scale-105 whitespace-nowrap"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                  <input
                    type="text"
                    value={isEditing ? editedProfile.nome : profile?.nome}
                    onChange={(e) => setEditedProfile({ ...editedProfile, nome: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-800/50 disabled:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile?.email}
                    disabled
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Para mudar o email, use a aba "Segurança"</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={isEditing ? editedProfile.telefone : profile?.telefone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, telefone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-800/50 disabled:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Código Postal</label>
                  <input
                    type="text"
                    value={isEditing ? editedProfile.codigo_postal : profile?.codigo_postal}
                    onChange={(e) => setEditedProfile({ ...editedProfile, codigo_postal: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-800/50 disabled:text-gray-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={isEditing ? editedProfile.endereco : profile?.endereco}
                    onChange={(e) => setEditedProfile({ ...editedProfile, endereco: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-800/50 disabled:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={isEditing ? editedProfile.cidade : profile?.cidade}
                    onChange={(e) => setEditedProfile({ ...editedProfile, cidade: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-800/50 disabled:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">País</label>
                  <input
                    type="text"
                    value={isEditing ? editedProfile.pais : profile?.pais}
                    onChange={(e) => setEditedProfile({ ...editedProfile, pais: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-800/50 disabled:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'pedidos':
        return (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl p-6 border-2 border-red-500/30">
            <h2 className="text-2xl font-bold text-white mb-6">Meus Pedidos</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <i className="ri-shopping-bag-3-line text-6xl text-gray-600 mb-4"></i>
                <p className="text-gray-400 text-lg">Você ainda não fez nenhum pedido</p>
                <button
                  onClick={() => navigate('/produtos')}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:scale-105 whitespace-nowrap"
                >
                  Começar a Comprar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-6 hover:shadow-xl transition-all hover:border-red-500/50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Pedido #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-500">
                          €{order.total.toFixed(2)}
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                          order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                          order.status === 'processing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                          order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                        }`}>
                          {order.status === 'completed' ? '✅ Concluído' :
                           order.status === 'processing' ? '⏳ Processando' :
                           order.status === 'shipped' ? '🚚 Enviado' :
                           order.status}
                        </span>
                      </div>
                    </div>

                    {order.tracking_code && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-400">
                          <i className="ri-truck-line mr-2"></i>
                          Código de Rastreamento: <strong>{order.tracking_code}</strong>
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/pedido/${order.id}`)}
                        className="flex-1 px-4 py-2 bg-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
                      >
                        Ver Detalhes
                      </button>
                      {order.tracking_code && (
                        <button
                          onClick={() => window.open(`https://track.aftership.com/${order.tracking_code}`, '_blank')}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:scale-105 whitespace-nowrap"
                        >
                          <i className="ri-map-pin-line mr-2"></i>
                          Rastrear Pedido
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'favoritos':
        return (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl p-6 border-2 border-red-500/30">
            <h2 className="text-2xl font-bold text-white mb-6">Meus Favoritos</h2>
            
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <i className="ri-heart-3-line text-6xl text-gray-600 mb-4"></i>
                <p className="text-gray-400 text-lg">Você ainda não tem favoritos</p>
                <button
                  onClick={() => navigate('/produtos')}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:scale-105 whitespace-nowrap"
                >
                  Explorar Produtos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="bg-gray-700/50 border border-gray-600 rounded-lg overflow-hidden hover:shadow-xl transition-all hover:border-red-500/50">
                    <div className="aspect-square bg-gray-800 relative">
                      <img
                        src={favorite.products?.image_url || 'https://via.placeholder.com/300'}
                        alt={favorite.products?.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        className="absolute top-2 right-2 w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
                      >
                        <i className="ri-heart-fill"></i>
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2">{favorite.products?.name}</h3>
                      <p className="text-2xl font-bold text-red-500 mb-4">
                        €{favorite.products?.price?.toFixed(2)}
                      </p>
                      <button
                        onClick={() => navigate(`/produto/${favorite.products?.id}`)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:scale-105 whitespace-nowrap"
                      >
                        Ver Produto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // 🔥 NOVO: Aba de Carrinho
      case 'carrinho':
        return (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl p-6 border-2 border-red-500/30">
            <h2 className="text-2xl font-bold text-white mb-6">Meu Carrinho</h2>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <i className="ri-shopping-cart-line text-6xl text-gray-600 mb-4"></i>
                <p className="text-gray-400 text-lg">Seu carrinho está vazio</p>
                <button
                  onClick={() => navigate('/produtos')}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:scale-105 whitespace-nowrap"
                >
                  Começar a Comprar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 flex items-center gap-4">
                    <img
                      src={item.image_url || 'https://via.placeholder.com/100'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <p className="text-sm text-gray-400">Quantidade: {item.quantity}</p>
                      <p className="text-lg font-bold text-red-500 mt-1">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const newCart = cartItems.filter((_, i) => i !== index);
                        localStorage.setItem('cart', JSON.stringify(newCart));
                        setCartItems(newCart);
                        window.dispatchEvent(new Event('storage'));
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                ))}
                
                <div className="border-t border-gray-600 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-white">Total:</span>
                    <span className="text-2xl font-bold text-red-500">
                      €{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:scale-105 whitespace-nowrap"
                  >
                    Finalizar Compra
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'nivel':
        return (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl p-6 border-2 border-red-500/30">
            <h2 className="text-2xl font-bold text-white mb-6">Nível VIP</h2>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white mb-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-purple-100 text-sm mb-2">Seu Nível Atual</p>
                  <p className="text-5xl font-bold">Nível {profile?.level || 1}</p>
                </div>
                <i className="ri-vip-crown-fill text-7xl text-purple-200"></i>
              </div>
              
              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Pontos VIP</span>
                  <span className="font-bold">{profile?.pontos_fidelidade || 0} / 1000</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3">
                  <div
                    className="bg-white rounded-full h-3 transition-all duration-500"
                    style={{ width: `${((profile?.pontos_fidelidade || 0) / 1000) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700/50 border-2 border-gray-600 rounded-xl p-6 text-center hover:border-red-500/50 transition-all">
                <i className="ri-vip-crown-line text-4xl text-gray-400 mb-3"></i>
                <h3 className="font-bold text-lg text-white mb-2">Nível 1</h3>
                <p className="text-sm text-gray-400 mb-4">0 - 999 pontos</p>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li>✓ Descontos básicos</li>
                  <li>✓ Suporte padrão</li>
                </ul>
              </div>

              <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-6 text-center shadow-xl">
                <i className="ri-vip-crown-fill text-4xl text-red-500 mb-3"></i>
                <h3 className="font-bold text-lg text-white mb-2">Nível 2</h3>
                <p className="text-sm text-gray-400 mb-4">1000 - 4999 pontos</p>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>✓ Descontos de 5%</li>
                  <li>✓ Frete grátis</li>
                  <li>✓ Suporte prioritário</li>
                </ul>
              </div>

              <div className="bg-purple-500/10 border-2 border-purple-500 rounded-xl p-6 text-center shadow-xl">
                <i className="ri-vip-diamond-fill text-4xl text-purple-500 mb-3"></i>
                <h3 className="font-bold text-lg text-white mb-2">Nível 3</h3>
                <p className="text-sm text-gray-400 mb-4">5000+ pontos</p>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>✓ Descontos de 10%</li>
                  <li>✓ Frete grátis</li>
                  <li>✓ Suporte VIP 24/7</li>
                  <li>✓ Acesso antecipado</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                <i className="ri-information-line mr-2"></i>
                <strong>Como ganhar pontos:</strong> Cada €1 gasto = 10 pontos VIP
              </p>
            </div>
          </div>
        );

      case 'seguranca':
        return (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl p-6 border-2 border-red-500/30">
            <h2 className="text-2xl font-bold text-white mb-6">Segurança da Conta</h2>
            
            <div className="space-y-8">
              {/* Mudar Email */}
              <div className="border-b border-gray-700 pb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  <i className="ri-mail-line mr-2 text-blue-400"></i>
                  Mudar Email
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Email atual: <strong className="text-white">{currentUser?.email}</strong>
                </p>
                <div className="flex gap-4">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Novo email"
                    className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleChangeEmail}
                    disabled={isChangingEmail || !newEmail}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isChangingEmail ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <i className="ri-mail-send-line mr-2"></i>
                        Enviar Verificação
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Um email de verificação será enviado para o novo endereço
                </p>
              </div>

              {/* Mudar Senha */}
              <div className="border-b border-gray-700 pb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  <i className="ri-lock-password-line mr-2 text-emerald-400"></i>
                  Mudar Senha
                </h3>
                <div className="space-y-4">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha (mínimo 6 caracteres)"
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar nova senha"
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !newPassword || !confirmPassword}
                    className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isChangingPassword ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Alterando...
                      </>
                    ) : (
                      <>
                        <i className="ri-shield-check-line mr-2"></i>
                        Alterar Senha
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Deletar Conta */}
              <div className="bg-red-500/10 border-2 border-red-500/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4">
                  <i className="ri-error-warning-line mr-2"></i>
                  Zona de Perigo
                </h3>
                <p className="text-sm text-red-300 mb-4">
                  Deletar sua conta é uma ação <strong>permanente e irreversível</strong>. 
                  Todos os seus dados, pedidos, favoritos e avaliações serão permanentemente removidos.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:scale-105 whitespace-nowrap"
                >
                  <i className="ri-delete-bin-line mr-2"></i>
                  Deletar Conta Permanentemente
                </button>
              </div>
            </div>
          </div>
        );

      case 'vendedor':
        if (profile?.is_seller === true && profile?.seller_approved === true) {
          return <SellerDashboard profile={profile} />;
        }
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <i className="ri-store-3-line text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-lg">Você não tem acesso ao Dashboard de Vendedor</p>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-5xl text-amber-500 animate-spin mb-4"></i>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 🔥 ADICIONAR NAVBAR */}
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header - DARK THEME - 🔥 OTIMIZADO PARA MOBILE */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 mb-8 border-2 border-red-500/30">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full sm:w-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl flex-shrink-0">
                  {profile?.nome?.charAt(0).toUpperCase()}
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{profile?.nome}</h1>
                  <p className="text-gray-400 text-sm sm:text-base break-all">{profile?.email}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                      <i className="ri-vip-crown-line mr-1"></i>
                      Nível {profile?.level || 1}
                    </span>
                    {profile?.is_seller && profile?.seller_approved && (
                      <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                        <i className="ri-store-3-line mr-1"></i>
                        VENDEDOR
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* 🔥 BOTÃO SAIR OTIMIZADO PARA MOBILE */}
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-bold shadow-lg hover:scale-105 whitespace-nowrap flex items-center justify-center gap-2"
              >
                <i className="ri-logout-box-line"></i>
                Sair
              </button>
            </div>
          </div>

          {/* Tabs - DARK THEME - 🔥 OTIMIZADO PARA MOBILE COM SCROLL HORIZONTAL */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl mb-8 border-2 border-red-500/30">
            <div className="flex border-b border-red-500/20 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('inicio')}
                className={`px-4 sm:px-6 py-4 font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'inicio'
                    ? 'text-black bg-gradient-to-r from-red-500 to-red-600 border-b-4 border-red-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className="ri-home-line mr-2"></i>
                Início
              </button>
              <button
                onClick={() => setActiveTab('pedidos')}
                className={`px-4 sm:px-6 py-4 font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'pedidos'
                    ? 'text-black bg-gradient-to-r from-red-500 to-red-600 border-b-4 border-red-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className="ri-shopping-bag-3-line mr-2"></i>
                Pedidos
              </button>
              <button
                onClick={() => setActiveTab('favoritos')}
                className={`px-4 sm:px-6 py-4 font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'favoritos'
                    ? 'text-black bg-gradient-to-r from-red-500 to-red-600 border-b-4 border-red-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className="ri-heart-3-line mr-2"></i>
                Favoritos
              </button>
              <button
                onClick={() => setActiveTab('carrinho')}
                className={`px-4 sm:px-6 py-4 font-bold transition-all whitespace-nowrap flex-shrink-0 relative ${
                  activeTab === 'carrinho'
                    ? 'text-black bg-gradient-to-r from-red-500 to-red-600 border-b-4 border-red-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className="ri-shopping-cart-line mr-2"></i>
                Carrinho
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('nivel')}
                className={`px-4 sm:px-6 py-4 font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'nivel'
                    ? 'text-black bg-gradient-to-r from-red-500 to-red-600 border-b-4 border-red-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className="ri-vip-crown-line mr-2"></i>
                Nível VIP
              </button>
              <button
                onClick={() => setActiveTab('seguranca')}
                className={`px-4 sm:px-6 py-4 font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'seguranca'
                    ? 'text-black bg-gradient-to-r from-red-500 to-red-600 border-b-4 border-red-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className="ri-shield-check-line mr-2"></i>
                Segurança
              </button>
              {profile?.is_seller === true && profile?.seller_approved === true && (
                <button
                  onClick={() => setActiveTab('vendedor')}
                  className={`px-4 sm:px-6 py-4 font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'vendedor'
                      ? 'text-black bg-gradient-to-r from-red-500 to-red-600 border-b-4 border-red-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className="ri-store-3-line mr-2"></i>
                  Dashboard Vendedor
                </button>
              )}
            </div>
          </div>

          {/* Content - DARK THEME */}
          {renderContent()}
        </div>
      </div>

      {/* 🔥 ADICIONAR FOOTER */}
      <Footer />
      
      {/* 🔥 CSS PARA ESCONDER SCROLLBAR HORIZONTAL */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
