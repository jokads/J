import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface FinancialStats {
  // Receitas
  totalRevenue: number;
  netRevenue: number;
  grossRevenue: number;
  
  // Custos
  totalCosts: number;
  shippingCosts: number;
  taxCosts: number;
  refundCosts: number;
  
  // Lucro
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  
  // Pedidos
  totalOrders: number;
  completedOrders: number;
  canceledOrders: number;
  refundedOrders: number;
  
  // Médias
  averageOrderValue: number;
  averageProfit: number;
  
  // Métodos de Pagamento
  paymentMethods: {
    method: string;
    amount: number;
    count: number;
    percentage: number;
  }[];
  
  // Tendências
  revenueGrowth: number;
  profitGrowth: number;
  ordersGrowth: number;
}

interface Transaction {
  id: string;
  order_id: string;
  type: 'revenue' | 'refund' | 'cost';
  amount: number;
  description: string;
  created_at: string;
  payment_method?: string;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
}

export default function FinancialManagement() {
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    netRevenue: 0,
    grossRevenue: 0,
    totalCosts: 0,
    shippingCosts: 0,
    taxCosts: 0,
    refundCosts: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
    totalOrders: 0,
    completedOrders: 0,
    canceledOrders: 0,
    refundedOrders: 0,
    averageOrderValue: 0,
    averageProfit: 0,
    paymentMethods: [],
    revenueGrowth: 0,
    profitGrowth: 0,
    ordersGrowth: 0
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadFinancialData();
    
    // Auto-refresh a cada 30 segundos
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadFinancialData();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [period, autoRefresh]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Calcular datas baseado no período
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Buscar pedidos
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .gte('created_at', startDate.toISOString());

      if (ordersError) throw ordersError;

      // Buscar transações financeiras
      const { data: financialTransactions, error: transError } = await supabase
        .from('financial_transactions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (transError) throw transError;

      // Buscar reembolsos
      const { data: refunds, error: refundsError } = await supabase
        .from('refunds')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (refundsError) throw refundsError;

      // Calcular estatísticas
      const calculatedStats = calculateStats(orders || [], financialTransactions || [], refunds || []);
      setStats(calculatedStats);
      
      // Processar transações
      setTransactions(financialTransactions || []);
      
      // Calcular receita diária
      const daily = calculateDailyRevenue(orders || []);
      setDailyRevenue(daily);
      
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orders: any[], transactions: any[], refunds: any[]): FinancialStats => {
    // Filtrar pedidos por status
    const completedOrders = orders.filter(o => o.status === 'completed');
    const canceledOrders = orders.filter(o => o.status === 'canceled');
    const refundedOrders = refunds.length;

    // Calcular receitas
    const grossRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const refundCosts = refunds.reduce((sum, refund) => sum + (refund.amount || 0), 0);
    
    // Calcular custos
    const shippingCosts = completedOrders.reduce((sum, order) => sum + (order.shipping_cost || 0), 0);
    const taxCosts = completedOrders.reduce((sum, order) => sum + (order.tax_amount || 0), 0);
    const totalCosts = shippingCosts + taxCosts + refundCosts;
    
    // Calcular lucros
    const netRevenue = grossRevenue - refundCosts;
    const grossProfit = grossRevenue - shippingCosts;
    const netProfit = netRevenue - totalCosts;
    const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
    
    // Calcular médias
    const averageOrderValue = completedOrders.length > 0 ? grossRevenue / completedOrders.length : 0;
    const averageProfit = completedOrders.length > 0 ? netProfit / completedOrders.length : 0;
    
    // Agrupar por método de pagamento
    const paymentMethodsMap = new Map<string, { amount: number; count: number }>();
    completedOrders.forEach(order => {
      const method = order.payment_method || 'Não especificado';
      const current = paymentMethodsMap.get(method) || { amount: 0, count: 0 };
      paymentMethodsMap.set(method, {
        amount: current.amount + (order.total || 0),
        count: current.count + 1
      });
    });
    
    const paymentMethods = Array.from(paymentMethodsMap.entries()).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
      percentage: grossRevenue > 0 ? (data.amount / grossRevenue) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
    
    // Calcular crescimento (comparar com período anterior)
    const previousPeriodOrders = orders.filter(o => {
      const orderDate = new Date(o.created_at);
      const now = new Date();
      const periodDays = period === 'today' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365;
      const previousStart = new Date(now.getTime() - (periodDays * 2 * 24 * 60 * 60 * 1000));
      const previousEnd = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));
      return orderDate >= previousStart && orderDate < previousEnd && o.status === 'completed';
    });
    
    const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const revenueGrowth = previousRevenue > 0 ? ((grossRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    
    const previousProfit = previousRevenue - (previousPeriodOrders.reduce((sum, o) => sum + (o.shipping_cost || 0) + (o.tax_amount || 0), 0));
    const profitGrowth = previousProfit > 0 ? ((netProfit - previousProfit) / previousProfit) * 100 : 0;
    
    const ordersGrowth = previousPeriodOrders.length > 0 ? ((completedOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length) * 100 : 0;

    return {
      totalRevenue: grossRevenue,
      netRevenue,
      grossRevenue,
      totalCosts,
      shippingCosts,
      taxCosts,
      refundCosts,
      grossProfit,
      netProfit,
      profitMargin,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      canceledOrders: canceledOrders.length,
      refundedOrders,
      averageOrderValue,
      averageProfit,
      paymentMethods,
      revenueGrowth,
      profitGrowth,
      ordersGrowth
    };
  };

  const calculateDailyRevenue = (orders: any[]): DailyRevenue[] => {
    const dailyMap = new Map<string, { revenue: number; profit: number; orders: number }>();
    
    orders.filter(o => o.status === 'completed').forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('pt-PT');
      const current = dailyMap.get(date) || { revenue: 0, profit: 0, orders: 0 };
      const profit = (order.total || 0) - (order.shipping_cost || 0) - (order.tax_amount || 0);
      
      dailyMap.set(date, {
        revenue: current.revenue + (order.total || 0),
        profit: current.profit + profit,
        orders: current.orders + 1
      });
    });
    
    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Últimos 30 dias
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const exportReport = () => {
    const reportData = {
      periodo: period,
      data_geracao: new Date().toLocaleString('pt-PT'),
      estatisticas: stats,
      transacoes: transactions,
      receita_diaria: dailyRevenue
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${period}-${Date.now()}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-line-chart-line text-yellow-500"></i>
            Gestão Financeira
          </h2>
          <p className="text-gray-400 mt-1">Relatórios e análises financeiras em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              autoRefresh
                ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}
          >
            <i className={`${autoRefresh ? 'ri-refresh-line animate-spin' : 'ri-pause-line'} text-xl`}></i>
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </button>
          
          <button
            onClick={exportReport}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-file-excel-line text-xl"></i>
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Filtro de Período */}
      <div className="flex gap-2">
        {[
          { value: 'today', label: 'Hoje', icon: 'ri-calendar-today-line' },
          { value: 'week', label: 'Semana', icon: 'ri-calendar-week-line' },
          { value: 'month', label: 'Mês', icon: 'ri-calendar-month-line' },
          { value: 'year', label: 'Ano', icon: 'ri-calendar-line' }
        ].map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value as any)}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              period === p.value
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <i className={`${p.icon} text-lg`}></i>
            {p.label}
          </button>
        ))}
      </div>

      {/* KPIs Principais - Receitas */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="ri-money-dollar-circle-line text-green-500"></i>
          Receitas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Receita Bruta',
              value: formatCurrency(stats.grossRevenue),
              icon: 'ri-money-dollar-circle-line',
              color: 'from-green-500 to-green-600',
              change: formatPercentage(stats.revenueGrowth),
              changeColor: getGrowthColor(stats.revenueGrowth)
            },
            {
              label: 'Receita Líquida',
              value: formatCurrency(stats.netRevenue),
              icon: 'ri-wallet-3-line',
              color: 'from-blue-500 to-blue-600',
              change: formatPercentage(stats.revenueGrowth),
              changeColor: getGrowthColor(stats.revenueGrowth)
            },
            {
              label: 'Ticket Médio (AOV)',
              value: formatCurrency(stats.averageOrderValue),
              icon: 'ri-shopping-cart-line',
              color: 'from-purple-500 to-purple-600',
              change: formatPercentage(stats.ordersGrowth),
              changeColor: getGrowthColor(stats.ordersGrowth)
            },
            {
              label: 'Pedidos Concluídos',
              value: stats.completedOrders.toString(),
              icon: 'ri-checkbox-circle-line',
              color: 'from-teal-500 to-teal-600',
              change: formatPercentage(stats.ordersGrowth),
              changeColor: getGrowthColor(stats.ordersGrowth)
            }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <i className={`${stat.icon} text-2xl text-white`}></i>
                </div>
                <span className={`text-sm font-semibold ${stat.changeColor}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs - Custos e Lucros */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="ri-funds-line text-yellow-500"></i>
          Custos e Lucros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Lucro Bruto',
              value: formatCurrency(stats.grossProfit),
              icon: 'ri-line-chart-line',
              color: 'from-yellow-500 to-yellow-600',
              change: formatPercentage(stats.profitGrowth),
              changeColor: getGrowthColor(stats.profitGrowth)
            },
            {
              label: 'Lucro Líquido',
              value: formatCurrency(stats.netProfit),
              icon: 'ri-funds-line',
              color: 'from-orange-500 to-orange-600',
              change: formatPercentage(stats.profitGrowth),
              changeColor: getGrowthColor(stats.profitGrowth)
            },
            {
              label: 'Margem de Lucro',
              value: `${stats.profitMargin.toFixed(1)}%`,
              icon: 'ri-percent-line',
              color: 'from-pink-500 to-pink-600',
              change: formatPercentage(stats.profitGrowth),
              changeColor: getGrowthColor(stats.profitGrowth)
            },
            {
              label: 'Lucro Médio/Pedido',
              value: formatCurrency(stats.averageProfit),
              icon: 'ri-calculator-line',
              color: 'from-indigo-500 to-indigo-600',
              change: formatPercentage(stats.profitGrowth),
              changeColor: getGrowthColor(stats.profitGrowth)
            }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <i className={`${stat.icon} text-2xl text-white`}></i>
                </div>
                <span className={`text-sm font-semibold ${stat.changeColor}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs - Custos Detalhados */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="ri-file-list-3-line text-red-500"></i>
          Custos Detalhados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Custos Totais',
              value: formatCurrency(stats.totalCosts),
              icon: 'ri-file-list-3-line',
              color: 'from-red-500 to-red-600',
              percentage: stats.grossRevenue > 0 ? (stats.totalCosts / stats.grossRevenue) * 100 : 0
            },
            {
              label: 'Custos de Envio',
              value: formatCurrency(stats.shippingCosts),
              icon: 'ri-truck-line',
              color: 'from-orange-500 to-red-500',
              percentage: stats.grossRevenue > 0 ? (stats.shippingCosts / stats.grossRevenue) * 100 : 0
            },
            {
              label: 'Impostos',
              value: formatCurrency(stats.taxCosts),
              icon: 'ri-government-line',
              color: 'from-purple-500 to-red-500',
              percentage: stats.grossRevenue > 0 ? (stats.taxCosts / stats.grossRevenue) * 100 : 0
            },
            {
              label: 'Reembolsos',
              value: formatCurrency(stats.refundCosts),
              icon: 'ri-refund-line',
              color: 'from-pink-500 to-red-500',
              percentage: stats.grossRevenue > 0 ? (stats.refundCosts / stats.grossRevenue) * 100 : 0
            }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <i className={`${stat.icon} text-2xl text-white`}></i>
                </div>
                <span className="text-sm font-semibold text-red-400">
                  {stat.percentage.toFixed(1)}%
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Análise de Pedidos */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="ri-shopping-bag-3-line text-blue-500"></i>
          Análise de Pedidos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total de Pedidos',
              value: stats.totalOrders.toString(),
              icon: 'ri-shopping-bag-3-line',
              color: 'from-blue-500 to-blue-600',
              percentage: 100
            },
            {
              label: 'Concluídos',
              value: stats.completedOrders.toString(),
              icon: 'ri-checkbox-circle-line',
              color: 'from-green-500 to-green-600',
              percentage: stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0
            },
            {
              label: 'Cancelados',
              value: stats.canceledOrders.toString(),
              icon: 'ri-close-circle-line',
              color: 'from-red-500 to-red-600',
              percentage: stats.totalOrders > 0 ? (stats.canceledOrders / stats.totalOrders) * 100 : 0
            },
            {
              label: 'Reembolsados',
              value: stats.refundedOrders.toString(),
              icon: 'ri-refund-line',
              color: 'from-orange-500 to-red-600',
              percentage: stats.totalOrders > 0 ? (stats.refundedOrders / stats.totalOrders) * 100 : 0
            }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <i className={`${stat.icon} text-2xl text-white`}></i>
                </div>
                <span className="text-sm font-semibold text-gray-400">
                  {stat.percentage.toFixed(1)}%
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Métodos de Pagamento */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <i className="ri-bank-card-line text-purple-500"></i>
          Receita por Método de Pagamento
        </h3>
        <div className="space-y-4">
          {stats.paymentMethods.length > 0 ? (
            stats.paymentMethods.map((method, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <i className="ri-bank-card-line text-xl text-white"></i>
                    </div>
                    <div>
                      <p className="font-semibold">{method.method}</p>
                      <p className="text-sm text-gray-400">{method.count} pedidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(method.amount)}</p>
                    <p className="text-sm text-gray-400">{method.percentage.toFixed(1)}% do total</p>
                  </div>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${method.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-8">Nenhum método de pagamento registrado</p>
          )}
        </div>
      </div>

      {/* Receita Diária (últimos 30 dias) */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <i className="ri-bar-chart-line text-blue-500"></i>
          Receita Diária (Últimos 30 Dias)
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {dailyRevenue.length > 0 ? (
            dailyRevenue.map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <i className="ri-calendar-line text-xl text-white"></i>
                  </div>
                  <div>
                    <p className="font-semibold">{day.date}</p>
                    <p className="text-sm text-gray-400">{day.orders} pedidos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-500">{formatCurrency(day.revenue)}</p>
                  <p className="text-sm text-yellow-500">Lucro: {formatCurrency(day.profit)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-8">Nenhuma receita registrada</p>
          )}
        </div>
      </div>

      {/* Últimas Transações */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <i className="ri-exchange-line text-green-500"></i>
          Últimas Transações
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.length > 0 ? (
            transactions.slice(0, 20).map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === 'revenue' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                    transaction.type === 'refund' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                    'bg-gradient-to-br from-orange-500 to-orange-600'
                  }`}>
                    <i className={`${
                      transaction.type === 'revenue' ? 'ri-arrow-down-line' :
                      transaction.type === 'refund' ? 'ri-arrow-up-line' :
                      'ri-exchange-line'
                    } text-xl text-white`}></i>
                  </div>
                  <div>
                    <p className="font-semibold">{transaction.description}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(transaction.created_at).toLocaleString('pt-PT')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    transaction.type === 'revenue' ? 'text-green-500' :
                    transaction.type === 'refund' ? 'text-red-500' :
                    'text-orange-500'
                  }`}>
                    {transaction.type === 'revenue' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  {transaction.payment_method && (
                    <p className="text-sm text-gray-400">{transaction.payment_method}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-8">Nenhuma transação registrada</p>
          )}
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <i className="ri-file-chart-line text-yellow-500"></i>
          Resumo Financeiro do Período
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Receita Bruta:</span>
              <span className="font-bold text-green-500">{formatCurrency(stats.grossRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">(-) Reembolsos:</span>
              <span className="font-bold text-red-500">-{formatCurrency(stats.refundCosts)}</span>
            </div>
            <div className="w-full h-px bg-white/10"></div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Receita Líquida:</span>
              <span className="font-bold text-blue-500">{formatCurrency(stats.netRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">(-) Custos de Envio:</span>
              <span className="font-bold text-orange-500">-{formatCurrency(stats.shippingCosts)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">(-) Impostos:</span>
              <span className="font-bold text-purple-500">-{formatCurrency(stats.taxCosts)}</span>
            </div>
            <div className="w-full h-px bg-white/10"></div>
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Lucro Líquido:</span>
              <span className={`font-bold ${stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(stats.netProfit)}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total de Pedidos:</span>
              <span className="font-bold">{stats.totalOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pedidos Concluídos:</span>
              <span className="font-bold text-green-500">{stats.completedOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pedidos Cancelados:</span>
              <span className="font-bold text-red-500">{stats.canceledOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pedidos Reembolsados:</span>
              <span className="font-bold text-orange-500">{stats.refundedOrders}</span>
            </div>
            <div className="w-full h-px bg-white/10"></div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Ticket Médio:</span>
              <span className="font-bold text-purple-500">{formatCurrency(stats.averageOrderValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Lucro Médio/Pedido:</span>
              <span className="font-bold text-yellow-500">{formatCurrency(stats.averageProfit)}</span>
            </div>
            <div className="w-full h-px bg-white/10"></div>
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Margem de Lucro:</span>
              <span className={`font-bold ${stats.profitMargin >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
