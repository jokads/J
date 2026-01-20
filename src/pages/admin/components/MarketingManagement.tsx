import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface MarketingManagementProps {
  darkMode: boolean;
}

interface MessageTemplate {
  id: string;
  title: string;
  message: string;
  category: 'promocao' | 'carrinho' | 'favoritos' | 'reengajamento' | 'agradecimento';
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  total_spent: number;
  orders_count: number;
  wishlist_count: number;
  cart_count: number;
  last_order_date?: string;
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  // Promoções (5)
  {
    id: '1',
    title: '🎉 Promoção Especial',
    message:
      'Olá {nome}! 🎉\n\nTemos uma promoção ESPECIAL só para você!\n\n✨ 20% de desconto em TODOS os produtos\n🎁 Frete GRÁTIS acima de €50\n⏰ Válido até domingo!\n\nUse o cupom: ESPECIAL20\n\nAproveite: {link}',
    category: 'promocao',
  },
  {
    id: '2',
    title: '🔥 Flash Sale',
    message:
      'Oi {nome}! 🔥\n\nFLASH SALE começou AGORA!\n\n⚡ Até 50% OFF\n⏰ Apenas 24 horas\n🚀 Corre que acaba rápido!\n\nVeja as ofertas: {link}',
    category: 'promocao',
  },
  {
    id: '3',
    title: '💎 Cliente VIP',
    message:
      'Olá {nome}! 💎\n\nVocê é um cliente ESPECIAL!\n\n👑 Desconto VIP de 30%\n🎁 Brinde exclusivo\n📦 Frete grátis sempre\n\nSeu cupom VIP: VIP30\n\nCompre agora: {link}',
    category: 'promocao',
  },
  {
    id: '4',
    title: '🎁 Oferta Relâmpago',
    message:
      'Ei {nome}! ⚡\n\nOFERTA RELÂMPAGO!\n\n🔥 Produtos selecionados com 40% OFF\n⏰ Só nas próximas 6 horas\n🎯 Estoque limitado!\n\nCorra: {link}',
    category: 'promocao',
  },
  {
    id: '5',
    title: '🌟 Semana do Cliente',
    message:
      'Olá {nome}! 🌟\n\nSEMANA DO CLIENTE!\n\n🎉 Descontos progressivos\n📅 Segunda a Domingo\n🎁 Surpresas todos os dias\n\nConfira: {link}',
    category: 'promocao',
  },
  // Carrinho Abandonado (5)
  {
    id: '6',
    title: '🛒 Carrinho Esquecido',
    message:
      'Oi {nome}! 🛒\n\nVocê deixou {cart_count} produtos no carrinho!\n\n😢 Não perca suas escolhas\n⏰ Reservamos por 24h\n🎁 Ganhe 10% OFF agora: CARRINHO10\n\nFinalize: {link}',
    category: 'carrinho',
  },
  {
    id: '7',
    title: '⏰ Última Chance',
    message:
      'Olá {nome}! ⏰\n\nSeu carrinho expira em 2 horas!\n\n🛒 {cart_count} produtos esperando\n💰 Total: €{cart_total}\n🎁 Desconto especial: 15% OFF\n\nCupom: URGENTE15\n\nCompre agora: {link}',
    category: 'carrinho',
  },
  {
    id: '8',
    title: '💔 Sentimos Sua Falta',
    message:
      'Ei {nome}! 💔\n\nVimos que você não finalizou sua compra...\n\n🛒 Seus produtos ainda estão lá\n🎁 Preparamos um desconto de 20%\n📦 Frete grátis incluso!\n\nCupom: VOLTE20\n\nFinalize: {link}',
    category: 'carrinho',
  },
  {
    id: '9',
    title: '🎯 Oferta Exclusiva',
    message:
      'Oi {nome}! 🎯\n\nOFERTA EXCLUSIVA para seu carrinho!\n\n✨ 25% de desconto\n🚚 Entrega expressa grátis\n⏰ Válido por 12h\n\nCupom: EXCLUSIVO25\n\nAproveite: {link}',
    category: 'carrinho',
  },
  {
    id: '10',
    title: '🔔 Lembrete Amigável',
    message:
      'Olá {nome}! 🔔\n\nLembrete: você tem {cart_count} itens no carrinho!\n\n🛒 Produtos incríveis esperando\n💳 Checkout rápido e seguro\n🎁 Ganhe 10% OFF: LEMBRETE10\n\nFinalize: {link}',
    category: 'carrinho',
  },
  // Favoritos (5)
  {
    id: '11',
    title: '❤️ Favoritos em Promoção',
    message:
      'Oi {nome}! ❤️\n\nSeus favoritos estão em PROMOÇÃO!\n\n✨ {wishlist_count} produtos com desconto\n🎁 Até 30% OFF\n⏰ Só hoje!\n\nVeja agora: {link}',
    category: 'favoritos',
  },
  {
    id: '12',
    title: '📉 Preço Baixou',
    message:
      'Olá {nome}! 📉\n\nBOA NOTÍCIA!\n\nO preço dos seus favoritos BAIXOU!\n\n💰 Economia de até 40%\n❤️ {wishlist_count} produtos\n🏃 Corre antes que acabe!\n\nConfira: {link}',
    category: 'favoritos',
  },
  {
    id: '13',
    title: '⚠️ Estoque Baixo',
    message:
      'Ei {nome}! ⚠️\n\nALERTA DE ESTOQUE!\n\nProdutos dos seus favoritos acabando:\n\n📦 Últimas unidades\n❤️ Não perca!\n🎁 Desconto de 15%: FAVORITO15\n\nCompre: {link}',
    category: 'favoritos',
  },
  {
    id: '14',
    title: '🎁 Presente Especial',
    message:
      'Oi {nome}! 🎁\n\nQue tal realizar um desejo?\n\n❤️ Seus {wishlist_count} favoritos\n✨ Com 20% de desconto\n📦 Frete grátis\n\nCupom: DESEJO20\n\nRealize: {link}',
    category: 'favoritos',
  },
  {
    id: '15',
    title: '🌟 Novidade nos Favoritos',
    message:
      'Olá {nome}! 🌟\n\nNOVIDADE!\n\nProdutos similares aos seus favoritos:\n\n✨ Você vai amar\n❤️ Baseado no seu gosto\n🎁 10% OFF: NOVO10\n\nDescubra: {link}',
    category: 'favoritos',
  },
  // Reengajamento (3)
  {
    id: '16',
    title: '💔 Sentimos Saudades',
    message:
      'Oi {nome}! 💔\n\nFaz tempo que não te vemos...\n\n😢 Sentimos sua falta\n🎁 Preparamos 30% OFF para você\n✨ Novidades incríveis esperando\n\nCupom: VOLTEI30\n\nVolte: {link}',
    category: 'reengajamento',
  },
  {
    id: '17',
    title: '🎉 Bem-Vindo de Volta',
    message:
      'Olá {nome}! 🎉\n\nQue bom ter você de volta!\n\n🎁 Presente especial: 25% OFF\n✨ Muitas novidades\n📦 Frete grátis na primeira compra\n\nCupom: BEMVINDO25\n\nConfira: {link}',
    category: 'reengajamento',
  },
  {
    id: '18',
    title: '⭐ Oferta Exclusiva',
    message:
      'Ei {nome}! ⭐\n\nOFERTA EXCLUSIVA para você!\n\n👑 Cliente especial\n🎁 40% de desconto\n⏰ Válido por 48h\n\nCupom: ESPECIAL40\n\nAproveite: {link}',
    category: 'reengajamento',
  },
  // Agradecimento (2)
  {
    id: '19',
    title: '🙏 Obrigado pela Compra',
    message:
      'Olá {nome}! 🙏\n\nMUITO OBRIGADO pela sua compra!\n\n✅ Pedido #{order_number} confirmado\n📦 Enviamos em breve\n🎁 Cupom de 15% para próxima: OBRIGADO15\n\nAcompanhe: {link}',
    category: 'agradecimento',
  },
  {
    id: '20',
    title: '⭐ Avalie sua Compra',
    message:
      'Oi {nome}! ⭐\n\nGostou da sua compra?\n\n📦 Pedido #{order_number} entregue\n💬 Sua opinião é importante\n🎁 Ganhe 10% OFF na avaliação\n\nAvalie: {link}',
    category: 'agradecimento',
  },
];

export default function MarketingManagement({ darkMode }: MarketingManagementProps) {
  const [activeTab, setActiveTab] = useState<'mensagens' | 'analise' | 'campanhas'>('mensagens');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendMethod, setSendMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      // Buscar clientes com seus dados
      const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'customer');

      if (!profiles) {
        setCustomers([]);
        return;
      }

      // Buscar pedidos, favoritos e carrinho para cada cliente
      const customersData = await Promise.all(
        profiles.map(async (profile) => {
          const [ordersRes, wishlistRes, cartRes] = await Promise.all([
            supabase.from('orders').select('total, created_at').eq('user_id', profile.id).order('created_at', { ascending: false }),
            supabase.from('wishlist').select('id').eq('user_id', profile.id),
            supabase.from('cart').select('id').eq('user_id', profile.id),
          ]);

          const orders = ordersRes.data || [];
          const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
          const lastOrder = orders[0];

          return {
            id: profile.id,
            full_name: profile.full_name || 'Cliente',
            email: profile.email || '',
            phone: profile.phone || '',
            total_spent: totalSpent,
            orders_count: orders.length,
            wishlist_count: wishlistRes.data?.length || 0,
            cart_count: cartRes.data?.length || 0,
            last_order_date: lastOrder?.created_at,
          };
        })
      );

      setCustomers(customersData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomer = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId]
    );
  };

  const selectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map((c) => c.id));
    }
  };

  const copyMessage = (template: MessageTemplate, customer: Customer) => {
    const message = template.message
      .replace('{nome}', customer.full_name)
      .replace('{cart_count}', customer.cart_count.toString())
      .replace('{wishlist_count}', customer.wishlist_count.toString())
      .replace('{cart_total}', customer.total_spent.toFixed(2))
      .replace('{order_number}', 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase())
      .replace('{link}', window.location.origin);

    navigator.clipboard.writeText(message);
    alert('✅ Mensagem copiada para a área de transferência!');
  };

  const sendToWhatsApp = (customer: Customer, template: MessageTemplate) => {
    if (!customer.phone) {
      alert('❌ Cliente não possui telefone cadastrado!');
      return;
    }

    const message = template.message
      .replace('{nome}', customer.full_name)
      .replace('{cart_count}', customer.cart_count.toString())
      .replace('{wishlist_count}', customer.wishlist_count.toString())
      .replace('{cart_total}', customer.total_spent.toFixed(2))
      .replace('{order_number}', 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase())
      .replace('{link}', window.location.origin);

    const phone = customer.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendToEmail = (customer: Customer, template: MessageTemplate) => {
    const message = template.message
      .replace('{nome}', customer.full_name)
      .replace('{cart_count}', customer.cart_count.toString())
      .replace('{wishlist_count}', customer.wishlist_count.toString())
      .replace('{cart_total}', customer.total_spent.toFixed(2))
      .replace('{order_number}', 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase())
      .replace('{link}', window.location.origin);

    // Simplificado: usa o título da mensagem como assunto, sem remoção de emojis.
    const subject = template.title;

    const mailtoUrl = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoUrl;
  };

  const sendBulk = () => {
    if (selectedCustomers.length === 0) {
      alert('❌ Selecione pelo menos um cliente!');
      return;
    }

    if (!selectedTemplate) {
      alert('❌ Selecione uma mensagem!');
      return;
    }

    const confirmed = confirm(
      `📤 Enviar mensagem para ${selectedCustomers.length} cliente(s) via ${
        sendMethod === 'whatsapp' ? 'WhatsApp' : 'Email'
      }?`
    );

    if (confirmed) {
      selectedCustomers.forEach((customerId) => {
        const customer = customers.find((c) => c.id === customerId);
        if (customer) {
          if (sendMethod === 'whatsapp') {
            sendToWhatsApp(customer, selectedTemplate);
          } else {
            sendToEmail(customer, selectedTemplate);
          }
        }
      });

      alert(`✅ Enviando mensagens para ${selectedCustomers.length} cliente(s)!`);
      setSelectedCustomers([]);
    }
  };

  const filteredTemplates = MESSAGE_TEMPLATES.filter(
    (template) =>
      (filterCategory === 'all' || template.category === filterCategory) &&
      (template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'promocao':
        return 'ri-price-tag-3-line';
      case 'carrinho':
        return 'ri-shopping-cart-line';
      case 'favoritos':
        return 'ri-heart-line';
      case 'reengajamento':
        return 'ri-user-heart-line';
      case 'agradecimento':
        return 'ri-hand-heart-line';
      default:
        return 'ri-message-line';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'promocao':
        return 'yellow';
      case 'carrinho':
        return 'blue';
      case 'favoritos':
        return 'pink';
      case 'reengajamento':
        return 'purple';
      case 'agradecimento':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'promocao':
        return 'Promoção';
      case 'carrinho':
        return 'Carrinho';
      case 'favoritos':
        return 'Favoritos';
      case 'reengajamento':
        return 'Reengajamento';
      case 'agradecimento':
        return 'Agradecimento';
      default:
        return category;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-megaphone-line text-yellow-500"></i>
            Marketing Avançado
          </h2>
          <p className="text-gray-400 mt-1">Mensagens prontas, análise de comportamento e automação</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('mensagens')}
          className={`px-6 py-3 font-medium transition-all relative ${
            activeTab === 'mensagens'
              ? 'text-yellow-500'
              : darkMode
              ? 'text-gray-400 hover:text-gray-300'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="ri-message-3-line mr-2"></i>
          Mensagens Prontas
          {activeTab === 'mensagens' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('analise')}
          className={`px-6 py-3 font-medium transition-all relative ${
            activeTab === 'analise'
              ? 'text-purple-500'
              : darkMode
              ? 'text-gray-400 hover:text-gray-300'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="ri-bar-chart-box-line mr-2"></i>
          Análise de Clientes
          {activeTab === 'analise' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('campanhas')}
          className={`px-6 py-3 font-medium transition-all relative ${
            activeTab === 'campanhas'
              ? 'text-blue-500'
              : darkMode
              ? 'text-gray-400 hover:text-gray-300'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="ri-rocket-line mr-2"></i>
          Campanhas
          {activeTab === 'campanhas' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          )}
        </button>
      </div>

      {/* Mensagens Prontas Tab */}
      {activeTab === 'mensagens' && (
        <div className="space-y-6">
          {/* Filtros e Ações */}
          <div
            className={`p-6 rounded-xl ${
              darkMode ? 'bg-gray-900' : 'bg-gray-50'
            } border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Busca */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <i className="ri-search-line mr-2"></i>
                  Buscar Mensagem
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite para buscar..."
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <i className="ri-filter-line mr-2"></i>
                  Categoria
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                >
                  <option value="all">Todas as Categorias</option>
                  <option value="promocao">🎉 Promoção</option>
                  <option value="carrinho">🛒 Carrinho Abandonado</option>
                  <option value="favoritos">❤️ Favoritos</option>
                  <option value="reengajamento">💔 Reengajamento</option>
                  <option value="agradecimento">🙏 Agradecimento</option>
                </select>
              </div>

              {/* Método de Envio */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <i className="ri-send-plane-line mr-2"></i>
                  Método de Envio
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSendMethod('whatsapp')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      sendMethod === 'whatsapp'
                        ? 'bg-green-500 text-white'
                        : darkMode
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <i className="ri-whatsapp-line mr-2"></i>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setSendMethod('email')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      sendMethod === 'email'
                        ? 'bg-blue-500 text-white'
                        : darkMode
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <i className="ri-mail-line mr-2"></i>
                    Email
                  </button>
                </div>
              </div>
            </div>

            {/* Ações em Massa */}
            {selectedCustomers.length > 0 && selectedTemplate && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      <i className="ri-checkbox-multiple-line mr-2"></i>
                      {selectedCustomers.length} cliente(s) selecionado(s)
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Mensagem: {selectedTemplate.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPreview(true)}
                      className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                    >
                      <i className="ri-eye-line mr-2"></i>
                      Preview
                    </button>
                    <button
                      onClick={sendBulk}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                      <i className="ri-send-plane-fill mr-2"></i>
                      Enviar para Todos
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lista de Mensagens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => {
              const color = getCategoryColor(template.category);
              return (
                <div
                  key={template.id}
                  className={`p-6 rounded-xl ${
                    darkMode ? 'bg-gray-900' : 'bg-gray-50'
                  } border ${
                    selectedTemplate?.id === template.id
                      ? `border-${color}-500 ring-2 ring-${color}-500/50`
                      : darkMode
                      ? 'border-gray-800'
                      : 'border-gray-200'
                  } cursor-pointer transition-all hover:scale-[1.02]`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
                        <i className={`${getCategoryIcon(template.category)} text-xl text-${color}-500`}></i>
                      </div>
                      <div>
                        <h3 className="font-bold">{template.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full bg-${color}-500/20 text-${color}-500`}
                        >
                          {getCategoryLabel(template.category)}
                        </span>
                      </div>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <i className={`ri-checkbox-circle-fill text-2xl text-${color}-500`}></i>
                    )}
                  </div>

                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} mb-4`}>
                    <p className="text-sm whitespace-pre-line">{template.message}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const customer = customers[0];
                        if (customer) copyMessage(template, customer);
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      <i className="ri-file-copy-line mr-2"></i>
                      Copiar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplate(template);
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-${color}-500 to-${color}-600 text-white font-medium hover:opacity-90 transition-opacity`}
                    >
                      <i className="ri-send-plane-line mr-2"></i>
                      Usar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <i className="ri-message-3-line text-6xl text-gray-600 mb-4"></i>
              <p className="text-lg text-gray-400">Nenhuma mensagem encontrada</p>
            </div>
          )}
        </div>
      )}

      {/* Análise de Clientes Tab */}
      {activeTab === 'analise' && (
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: 'Total de Clientes',
                value: customers.length,
                icon: 'ri-user-line',
                color: 'blue',
                bg: 'bg-blue-500/20',
                text: 'text-blue-500',
              },
              {
                title: 'Com Carrinho',
                value: customers.filter((c) => c.cart_count > 0).length,
                icon: 'ri-shopping-cart-line',
                color: 'yellow',
                bg: 'bg-yellow-500/20',
                text: 'text-yellow-500',
              },
              {
                title: 'Com Favoritos',
                value: customers.filter((c) => c.wishlist_count > 0).length,
                icon: 'ri-heart-line',
                color: 'pink',
                bg: 'bg-pink-500/20',
                text: 'text-pink-500',
              },
              {
                title: 'Inativos (90d)',
                value: customers.filter((c) => {
                  if (!c.last_order_date) return true;
                  const daysSince = Math.floor(
                    (Date.now() - new Date(c.last_order_date).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return daysSince > 90;
                }).length,
                icon: 'ri-user-unfollow-line',
                color: 'red',
                bg: 'bg-red-500/20',
                text: 'text-red-500',
              },
            ].map((stat, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${
                  darkMode ? 'border-gray-800' : 'border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center mb-4`}>
                  <i className={`${stat.icon} text-2xl ${stat.text}`}></i>
                </div>
                <h3 className="text-sm text-gray-400 mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Tabela de Clientes */}
          <div
            className={`rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${
              darkMode ? 'border-gray-800' : 'border-gray-200'
            } overflow-hidden`}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  <i className="ri-user-search-line mr-2"></i>
                  Análise Detalhada de Clientes
                </h3>
                <button
                  onClick={selectAll}
                  className="px-4 py-2 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap"
                >
                  <i className="ri-checkbox-multiple-line mr-2"></i>
                  {selectedCustomers.length === customers.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.length === customers.length}
                          onChange={selectAll}
                          className="w-5 h-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left font-medium">Cliente</th>
                      <th className="px-6 py-4 text-left font-medium">Pedidos</th>
                      <th className="px-6 py-4 text-left font-medium">Total Gasto</th>
                      <th className="px-6 py-4 text-left font-medium">Carrinho</th>
                      <th className="px-6 py-4 text-left font-medium">Favoritos</th>
                      <th className="px-6 py-4 text-left font-medium">Último Pedido</th>
                      <th className="px-6 py-4 text-left font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {customers.map((customer) => (
                      <tr
                        key={customer.id}
                        className={`${
                          selectedCustomers.includes(customer.id)
                            ? darkMode
                              ? 'bg-purple-500/10'
                              : 'bg-purple-50'
                            : darkMode
                            ? 'hover:bg-gray-800'
                            : 'hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() => toggleCustomer(customer.id)}
                            className="w-5 h-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{customer.full_name}</p>
                            <p className="text-sm text-gray-400">{customer.email}</p>
                            {customer.phone && (
                              <p className="text-xs text-gray-500">
                                <i className="ri-phone-line mr-1"></i>
                                {customer.phone}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-blue-500">{customer.orders_count}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-yellow-500">€{customer.total_spent.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          {customer.cart_count > 0 ? (
                            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 font-medium">
                              <i className="ri-shopping-cart-line mr-1"></i>
                              {customer.cart_count}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {customer.wishlist_count > 0 ? (
                            <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-500 font-medium">
                              <i className="ri-heart-line mr-1"></i>
                              {customer.wishlist_count}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {customer.last_order_date ? (
                            <span className="text-sm">{new Date(customer.last_order_date).toLocaleDateString('pt-PT')}</span>
                          ) : (
                            <span className="text-gray-500">Nunca</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {selectedTemplate && (
                              <>
                                <button
                                  onClick={() =>
                                    sendMethod === 'whatsapp'
                                      ? sendToWhatsApp(customer, selectedTemplate)
                                      : sendToEmail(customer, selectedTemplate)
                                  }
                                  className={`p-2 rounded-lg ${
                                    sendMethod === 'whatsapp'
                                      ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                                      : 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30'
                                  } transition-colors`}
                                  title={sendMethod === 'whatsapp' ? 'Enviar WhatsApp' : 'Enviar Email'}
                                >
                                  <i className={sendMethod === 'whatsapp' ? 'ri-whatsapp-line' : 'ri-mail-line'}></i>
                                </button>
                                <button
                                  onClick={() => copyMessage(selectedTemplate, customer)}
                                  className="p-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors"
                                  title="Copiar Mensagem"
                                >
                                  <i className="ri-file-copy-line"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Campanhas Tab */}
      {activeTab === 'campanhas' && (
        <div className="text-center py-12">
          <i className="ri-rocket-line text-6xl text-gray-600 mb-4"></i>
          <p className="text-lg text-gray-400">Funcionalidade de campanhas em desenvolvimento</p>
        </div>
      )}

      {/* Modal de Preview */}
      {showPreview && selectedTemplate && selectedCustomers.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`max-w-2xl w-full rounded-xl ${
              darkMode ? 'bg-gray-900' : 'bg-white'
            } border ${darkMode ? 'border-gray-800' : 'border-gray-200'} max-h-[90vh] overflow-y-auto`}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  <i className="ri-eye-line mr-2"></i>
                  Preview da Mensagem
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-400 mb-2">Mensagem Selecionada:</p>
                <p className="font-bold">{selectedTemplate.title}</p>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-400 mb-2">Será enviado para:</p>
                <p className="font-bold">{selectedCustomers.length} cliente(s)</p>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-400 mb-2">Exemplo de mensagem:</p>
                <div className="p-4 bg-white text-gray-900 rounded-lg whitespace-pre-line">
                  {selectedTemplate.message
                    .replace('{nome}', customers.find((c) => c.id === selectedCustomers[0])?.full_name || 'Cliente')
                    .replace('{cart_count}', '3')
                    .replace('{wishlist_count}', '5')
                    .replace('{cart_total}', '149.99')
                    .replace('{order_number}', 'ORD-12345')
                    .replace('{link}', window.location.origin)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    sendBulk();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  <i className="ri-send-plane-fill mr-2"></i>
                  Confirmar Envio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}