import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { supabase } from '../../lib/supabase';

interface Component {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
}

type ComponentOption = 'buy' | 'own' | 'skip';

export default function MontarPCPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showConfigurator, setShowConfigurator] = useState(false);
  
  // Componentes disponíveis
  const [cpus, setCpus] = useState<Component[]>([]);
  const [gpus, setGpus] = useState<Component[]>([]);
  const [rams, setRams] = useState<Component[]>([]);
  const [motherboards, setMotherboards] = useState<Component[]>([]);
  const [storage, setStorage] = useState<Component[]>([]);
  const [cases, setCases] = useState<Component[]>([]);
  const [psus, setPsus] = useState<Component[]>([]);
  const [cooling, setCooling] = useState<Component[]>([]);

  // Seleções do usuário
  const [selectedCPU, setSelectedCPU] = useState<Component | null>(null);
  const [selectedGPU, setSelectedGPU] = useState<Component | null>(null);
  const [selectedRAM, setSelectedRAM] = useState<Component | null>(null);
  const [selectedMotherboard, setSelectedMotherboard] = useState<Component | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<Component | null>(null);
  const [selectedCase, setSelectedCase] = useState<Component | null>(null);
  const [selectedPSU, setSelectedPSU] = useState<Component | null>(null);
  const [selectedCooling, setSelectedCooling] = useState<Component | null>(null);

  // Opções de cada componente (buy, own, skip)
  const [componentOptions, setComponentOptions] = useState({
    cpu: 'buy' as ComponentOption,
    gpu: 'buy' as ComponentOption,
    ram: 'buy' as ComponentOption,
    motherboard: 'buy' as ComponentOption,
    storage: 'buy' as ComponentOption,
    case: 'buy' as ComponentOption,
    psu: 'buy' as ComponentOption,
    cooling: 'buy' as ComponentOption,
  });

  // Seções expandidas/colapsadas
  const [expandedSections, setExpandedSections] = useState({
    cpu: true,
    gpu: true,
    ram: true,
    motherboard: true,
    storage: true,
    case: true,
    psu: true,
    cooling: true,
  });

  // Informações do cliente
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    ownPartsDetails: ''
  });

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, price, image_url, category')
        .eq('aprovado', true);

      if (products) {
        // Normalizar categorias
        setCpus(products.filter(p => ['CPU', 'Processador'].includes(p.category)));
        setGpus(products.filter(p => ['GPU', 'Placa de Vídeo'].includes(p.category)));
        setRams(products.filter(p => ['RAM', 'Memória RAM'].includes(p.category)));
        setMotherboards(products.filter(p => ['Placa-Mãe', 'Motherboard'].includes(p.category)));
        setStorage(products.filter(p => ['SSD', 'Armazenamento', 'Storage'].includes(p.category)));
        setCases(products.filter(p => ['Torre', 'Gabinete', 'Case'].includes(p.category)));
        setPsus(products.filter(p => ['Fonte', 'PSU', 'Power Supply'].includes(p.category)));
        setCooling(products.filter(p => ['Ventilador', 'Refrigeração', 'Cooler', 'Cooling'].includes(p.category)));
      }
    } catch (error) {
      console.error('Erro ao carregar componentes:', error);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    
    // Adicionar preços dos componentes selecionados para COMPRAR
    if (selectedCPU && componentOptions.cpu === 'buy') {
      total += Number(selectedCPU.price || 0);
    }
    if (selectedGPU && componentOptions.gpu === 'buy') {
      total += Number(selectedGPU.price || 0);
    }
    if (selectedRAM && componentOptions.ram === 'buy') {
      total += Number(selectedRAM.price || 0);
    }
    if (selectedMotherboard && componentOptions.motherboard === 'buy') {
      total += Number(selectedMotherboard.price || 0);
    }
    if (selectedStorage && componentOptions.storage === 'buy') {
      total += Number(selectedStorage.price || 0);
    }
    if (selectedCase && componentOptions.case === 'buy') {
      total += Number(selectedCase.price || 0);
    }
    if (selectedPSU && componentOptions.psu === 'buy') {
      total += Number(selectedPSU.price || 0);
    }
    if (selectedCooling && componentOptions.cooling === 'buy') {
      total += Number(selectedCooling.price || 0);
    }
    
    // Taxa de montagem (sempre incluída)
    const assemblyFee = 50;
    
    return total + assemblyFee;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitMessage('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const getComponentInfo = (component: Component | null, option: ComponentOption) => {
        if (option === 'skip') return 'Não incluído';
        if (option === 'own') return 'Cliente enviará';
        return component?.name || null;
      };

      // Construir notas completas
      let fullNotes = customerInfo.notes;
      if (customerInfo.ownPartsDetails) {
        fullNotes += '\n\n=== PEÇAS PRÓPRIAS ===\n' + customerInfo.ownPartsDetails;
      }

      const requestData = {
        user_id: user?.id || null,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        cpu: getComponentInfo(selectedCPU, componentOptions.cpu),
        gpu: getComponentInfo(selectedGPU, componentOptions.gpu),
        ram: getComponentInfo(selectedRAM, componentOptions.ram),
        ram_included: componentOptions.ram !== 'skip',
        motherboard: getComponentInfo(selectedMotherboard, componentOptions.motherboard),
        storage: getComponentInfo(selectedStorage, componentOptions.storage),
        case_name: getComponentInfo(selectedCase, componentOptions.case),
        power_supply: getComponentInfo(selectedPSU, componentOptions.psu),
        cooling: getComponentInfo(selectedCooling, componentOptions.cooling),
        notes: fullNotes,
        estimated_price: calculateTotal(),
        status: 'pending'
      };

      const { error } = await supabase
        .from('custom_pc_requests')
        .insert([requestData]);

      if (error) throw error;

      setSubmitMessage('✅ Pedido enviado com sucesso! Entraremos em contato em breve via email ou WhatsApp.');
      
      // Limpar formulário após 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      console.error('Erro ao enviar pedido:', error);
      setSubmitMessage('❌ Erro ao enviar pedido. Tente novamente ou contacte-nos via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const ComponentSelector = ({ 
    title, 
    components, 
    selected, 
    onSelect, 
    icon,
    sectionKey,
    option,
    setOption
  }: { 
    title: string; 
    components: Component[]; 
    selected: Component | null; 
    onSelect: (component: Component) => void;
    icon: string;
    sectionKey: keyof typeof expandedSections;
    option: ComponentOption;
    setOption: (value: ComponentOption) => void;
  }) => {
    
    // 🔥 NOVO: Função para selecionar componente, fechar e rolar para o próximo
    const handleSelectComponent = (component: Component) => {
      onSelect(component);
      
      // Fechar a seção atual
      setExpandedSections(prev => ({
        ...prev,
        [sectionKey]: false
      }));

      // 🔥 SCROLL AUTOMÁTICO PARA O PRÓXIMO COMPONENTE
      setTimeout(() => {
        const sections = ['cpu', 'gpu', 'ram', 'motherboard', 'storage', 'case', 'psu', 'cooling'];
        const currentIndex = sections.indexOf(sectionKey);
        const nextSection = sections[currentIndex + 1];
        
        if (nextSection) {
          // Abrir próxima seção
          setExpandedSections(prev => ({
            ...prev,
            [nextSection]: true
          }));
          
          // Rolar suavemente para a próxima seção
          const nextElement = document.querySelector(`[data-section="${nextSection}"]`);
          if (nextElement) {
            nextElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center'
            });
          }
        } else {
          // Se for o último componente, rolar para o formulário de informações
          const infoSection = document.getElementById('customer-info');
          if (infoSection) {
            infoSection.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start'
            });
          }
        }
      }, 300);
    };

    return (
      <div 
        className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 hover:border-red-500 transition-all"
        data-section={sectionKey}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-5 bg-gradient-to-r from-black to-gray-900 text-white cursor-pointer hover:from-gray-900 hover:to-black transition-all"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 flex items-center justify-center bg-red-500 rounded-lg">
              <i className={`${icon} text-2xl text-white`}></i>
            </div>
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              {option === 'buy' && selected && (
                <p className="text-xs text-red-400">€{selected.price.toFixed(2)}</p>
              )}
              {option === 'own' && (
                <p className="text-xs text-green-400">Peça Própria</p>
              )}
              {option === 'skip' && (
                <p className="text-xs text-gray-400">Não Incluído</p>
              )}
            </div>
          </div>
          <i className={`ri-arrow-${expandedSections[sectionKey] ? 'up' : 'down'}-s-line text-2xl`}></i>
        </div>

        {/* Content */}
        {expandedSections[sectionKey] && (
          <div className="p-5">
            {/* Opções de Escolha */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setOption('buy')}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  option === 'buy'
                    ? 'border-red-500 bg-red-50 shadow-lg'
                    : 'border-gray-300 hover:border-red-500/50'
                }`}
              >
                <i className="ri-shopping-cart-line text-3xl mb-2 text-red-500"></i>
                <p className="text-sm font-bold text-black">COMPRAR</p>
                <p className="text-xs text-gray-600">Do nosso site</p>
              </button>

              <button
                type="button"
                onClick={() => setOption('own')}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  option === 'own'
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-300 hover:border-green-500/50'
                }`}
              >
                <i className="ri-box-3-line text-3xl mb-2 text-green-600"></i>
                <p className="text-sm font-bold text-black">ENVIAR</p>
                <p className="text-xs text-gray-600">Minha peça</p>
              </button>

              <button
                type="button"
                onClick={() => setOption('skip')}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  option === 'skip'
                    ? 'border-gray-500 bg-gray-100 shadow-lg'
                    : 'border-gray-300 hover:border-gray-500/50'
                }`}
              >
                <i className="ri-close-circle-line text-3xl mb-2 text-gray-600"></i>
                <p className="text-sm font-bold text-black">PULAR</p>
                <p className="text-xs text-gray-600">Não preciso</p>
              </button>
            </div>

            {/* Lista de Produtos (apenas se escolher "COMPRAR") */}
            {option === 'buy' && (
              <>
                {components.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="ri-inbox-line text-5xl text-gray-400 mb-3"></i>
                    <p className="text-gray-500 text-sm">Nenhum componente disponível</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                    {components.map((component) => (
                      <button
                        key={component.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelectComponent(component);
                        }}
                        className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer flex items-center space-x-4 ${
                          selected?.id === component.id
                            ? 'border-red-500 bg-red-50 shadow-lg'
                            : 'border-gray-300 hover:border-red-500/50 hover:shadow-md'
                        }`}
                      >
                        <img 
                          src={component.image_url} 
                          alt={component.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Sem+Imagem';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-black text-sm line-clamp-2">{component.name}</p>
                          <p className="text-red-600 font-bold text-lg mt-1">€{Number(component.price || 0).toFixed(2)}</p>
                        </div>
                        {selected?.id === component.id && (
                          <i className="ri-checkbox-circle-fill text-3xl text-red-500"></i>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Mensagem para "ENVIAR" */}
            {option === 'own' && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <i className="ri-information-line text-2xl text-green-600 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-bold text-green-900 mb-1">Envie sua própria peça</p>
                    <p className="text-xs text-green-700">
                      Você pode enviar sua peça para montagem. Descreva os detalhes no campo "Detalhes das Peças Próprias" abaixo.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mensagem para "PULAR" */}
            {option === 'skip' && (
              <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <i className="ri-information-line text-2xl text-gray-600 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Componente não incluído</p>
                    <p className="text-xs text-gray-700">
                      Este componente não será incluído na montagem.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <Navbar />

      {/* Hero Section - TOTALMENTE ADAPTADO PARA MOBILE */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden mt-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://readdy.ai/api/search-image?query=custom%20gaming%20pc%20build%20components%20dark%20background%20professional&width=1920&height=1080&seq=montarpc1&orientation=landscape"
            alt="Montar PC"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
        </div>

        {/* Content - TOTALMENTE ADAPTADO PARA MOBILE */}
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full py-8 sm:py-12">
          <div className="text-center space-y-3 sm:space-y-4 md:space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full">
              <i className="ri-tools-line text-black text-xs sm:text-sm"></i>
              <span className="text-black font-bold text-xs">Configuração Personalizada</span>
            </div>

            {/* Title - ADAPTADO PARA MOBILE */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight px-2 sm:px-4">
              Monte Seu PC<br className="sm:hidden" /> Personalizado
            </h1>

            {/* Description - ADAPTADO PARA MOBILE */}
            <p className="text-gray-300 text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed px-3 sm:px-4">
              Escolha cada componente e crie o PC perfeito para suas necessidades. Montagem profissional incluída.
            </p>

            {/* Buttons - ADAPTADOS PARA MOBILE */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-stretch sm:items-center pt-3 sm:pt-4 px-3 sm:px-4 max-w-md sm:max-w-none mx-auto">
              <button
                onClick={() => {
                  const configurator = document.getElementById('configurator');
                  if (configurator) {
                    configurator.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-black font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                <i className="ri-tools-line mr-1 sm:mr-2"></i>
                Começar Configuração
              </button>
              <a
                href="https://wa.me/352621717862"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                <i className="ri-whatsapp-line mr-1 sm:mr-2"></i>
                Falar com Especialista
              </a>
            </div>

            {/* Features - ADAPTADO PARA MOBILE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 max-w-4xl mx-auto px-3 sm:px-4">
              {[
                { icon: 'ri-shield-check-line', text: 'Garantia Estendida' },
                { icon: 'ri-tools-line', text: 'Montagem Profissional' },
                { icon: 'ri-customer-service-2-line', text: 'Suporte Técnico' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center justify-center space-x-2 bg-black/40 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-2 border border-red-500/20">
                  <i className={`${feature.icon} text-red-500 text-base sm:text-lg`}></i>
                  <span className="text-white text-xs sm:text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div id="configurator" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seleção de Componentes */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-black shadow-xl">
                <h2 className="text-3xl font-bold mb-2">
                  🛠️ ESCOLHA OS COMPONENTES
                </h2>
                <p className="text-sm">
                  Para cada componente, escolha: <strong>COMPRAR</strong> do nosso site, <strong>ENVIAR</strong> sua peça ou <strong>PULAR</strong> se não precisar.
                </p>
              </div>

              <ComponentSelector
                title="PROCESSADOR (CPU)"
                components={cpus}
                selected={selectedCPU}
                onSelect={setSelectedCPU}
                icon="ri-cpu-line"
                sectionKey="cpu"
                option={componentOptions.cpu}
                setOption={(value) => setComponentOptions({...componentOptions, cpu: value})}
              />

              <ComponentSelector
                title="PLACA DE VÍDEO (GPU)"
                components={gpus}
                selected={selectedGPU}
                onSelect={setSelectedGPU}
                icon="ri-device-line"
                sectionKey="gpu"
                option={componentOptions.gpu}
                setOption={(value) => setComponentOptions({...componentOptions, gpu: value})}
              />

              <ComponentSelector
                title="MEMÓRIA RAM"
                components={rams}
                selected={selectedRAM}
                onSelect={setSelectedRAM}
                icon="ri-database-2-line"
                sectionKey="ram"
                option={componentOptions.ram}
                setOption={(value) => setComponentOptions({...componentOptions, ram: value})}
              />

              <ComponentSelector
                title="PLACA-MÃE (MOTHERBOARD)"
                components={motherboards}
                selected={selectedMotherboard}
                onSelect={setSelectedMotherboard}
                icon="ri-circuit-line"
                sectionKey="motherboard"
                option={componentOptions.motherboard}
                setOption={(value) => setComponentOptions({...componentOptions, motherboard: value})}
              />

              <ComponentSelector
                title="ARMAZENAMENTO (SSD)"
                components={storage}
                selected={selectedStorage}
                onSelect={setSelectedStorage}
                icon="ri-hard-drive-2-line"
                sectionKey="storage"
                option={componentOptions.storage}
                setOption={(value) => setComponentOptions({...componentOptions, storage: value})}
              />

              <ComponentSelector
                title="GABINETE (TORRE)"
                components={cases}
                selected={selectedCase}
                onSelect={setSelectedCase}
                icon="ri-computer-line"
                sectionKey="case"
                option={componentOptions.case}
                setOption={(value) => setComponentOptions({...componentOptions, case: value})}
              />

              <ComponentSelector
                title="FONTE DE ALIMENTAÇÃO"
                components={psus}
                selected={selectedPSU}
                onSelect={setSelectedPSU}
                icon="ri-flashlight-line"
                sectionKey="psu"
                option={componentOptions.psu}
                setOption={(value) => setComponentOptions({...componentOptions, psu: value})}
              />

              <ComponentSelector
                title="REFRIGERAÇÃO"
                components={cooling}
                selected={selectedCooling}
                onSelect={setSelectedCooling}
                icon="ri-temp-cold-line"
                sectionKey="cooling"
                option={componentOptions.cooling}
                setOption={(value) => setComponentOptions({...componentOptions, cooling: value})}
              />

              {/* Informações do Cliente */}
              <div id="customer-info" className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-6 flex items-center space-x-2">
                  <i className="ri-user-line text-gold"></i>
                  <span>SUAS INFORMAÇÕES</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      NOME COMPLETO *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                      placeholder="Seu nome"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      E-MAIL *
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      TELEFONE/WHATSAPP *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                      placeholder="+352 XXX XXX XXX"
                    />
                  </div>

                  {Object.values(componentOptions).some(v => v === 'own') && (
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        DETALHES DAS PEÇAS PRÓPRIAS
                      </label>
                      <textarea
                        value={customerInfo.ownPartsDetails}
                        onChange={(e) => setCustomerInfo({...customerInfo, ownPartsDetails: e.target.value})}
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gold resize-none"
                        placeholder="Descreva as peças que você vai enviar (marca, modelo, especificações...)"
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">
                        {customerInfo.ownPartsDetails.length}/500 caracteres
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      OBSERVAÇÕES ADICIONAIS
                    </label>
                    <textarea
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gold resize-none"
                      placeholder="Alguma preferência ou requisito especial? Quer falar com um conselheiro?"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">
                      {customerInfo.notes.length}/500 caracteres
                    </p>
                  </div>

                  {/* Botão para contactar conselheiro */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <i className="ri-customer-service-2-line text-2xl text-blue-600 mt-0.5"></i>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-1">Precisa de Ajuda?</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Fale diretamente com nosso conselheiro especializado via WhatsApp
                        </p>
                        <a
                          href="https://wa.me/352621717862?text=Olá! Preciso de ajuda para montar meu PC personalizado."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
                        >
                          <i className="ri-whatsapp-line text-xl"></i>
                          Falar com Conselheiro
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo e Pré-visualização */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-black to-gray-900 rounded-xl p-6 sticky top-24 shadow-2xl border-2 border-red-500">
                <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center space-x-2">
                  <i className="ri-file-list-3-line"></i>
                  <span>RESUMO DO PEDIDO</span>
                </h3>

                {/* 🔥 NOVO: ÁREA SCROLLÁVEL PARA O RESUMO */}
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedCPU && componentOptions.cpu !== 'skip' && (
                    <div className="flex justify-between text-white text-sm bg-white/5 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">CPU</span>
                        {componentOptions.cpu === 'own' && <span className="text-green-400 text-xs ml-2">(Sua peça)</span>}
                      </div>
                      <span className="font-bold text-red-400">
                        {componentOptions.cpu === 'own' ? '€0.00' : `€${Number(selectedCPU.price || 0).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  {selectedGPU && componentOptions.gpu !== 'skip' && (
                    <div className="flex justify-between text-white text-sm bg-white/5 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">GPU</span>
                        {componentOptions.gpu === 'own' && <span className="text-green-400 text-xs ml-2">(Sua peça)</span>}
                      </div>
                      <span className="font-bold text-red-400">
                        {componentOptions.gpu === 'own' ? '€0.00' : `€${Number(selectedGPU.price || 0).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  {selectedRAM && componentOptions.ram !== 'skip' && (
                    <div className="flex justify-between text-white text-sm bg-white/5 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">RAM</span>
                        {componentOptions.ram === 'own' && <span className="text-green-400 text-xs ml-2">(Sua peça)</span>}
                      </div>
                      <span className="font-bold text-red-400">
                        {componentOptions.ram === 'own' ? '€0.00' : `€${Number(selectedRAM.price || 0).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  {selectedMotherboard && componentOptions.motherboard !== 'skip' && (
                    <div className="flex justify-between text-white text-sm bg-white/5 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">Placa-Mãe</span>
                        {componentOptions.motherboard === 'own' && <span className="text-green-400 text-xs ml-2">(Sua peça)</span>}
                      </div>
                      <span className="font-bold text-red-400">
                        {componentOptions.motherboard === 'own' ? '€0.00' : `€${Number(selectedMotherboard.price || 0).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  {selectedStorage && componentOptions.storage !== 'skip' && (
                    <div className="flex justify-between text-white text-sm bg-white/5 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">SSD</span>
                        {componentOptions.storage === 'own' && <span className="text-green-400 text-xs ml-2">(Sua peça)</span>}
                      </div>
                      <span className="font-bold text-red-400">
                        {componentOptions.storage === 'own' ? '€0.00' : `€${Number(selectedStorage.price || 0).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  {selectedCase && componentOptions.case !== 'skip' && (
                    <div className="flex justify-between text-white text-sm bg-white/5 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">Gabinete</span>
                        {componentOptions.case === 'own' && <span className="text-green-400 text-xs ml-2">(Sua peça)</span>}
                      </div>
                      <span className="font-bold text-red-400">
                        {componentOptions.case === 'own' ? '€0.00' : `€${Number(selectedCase.price || 0).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  {selectedPSU && componentOptions.psu !== 'skip' && (
                    <div className="flex justify-between text-white text-sm bg-white/5 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">Fonte</span>
                        {componentOptions.psu === 'own' && <span className="text-green-400 text-xs ml-2">(Sua peça)</span>}
                      </div>
                      <span className="font-bold text-red-400">
                        {componentOptions.psu === 'own' ? '€0.00' : `€${Number(selectedPSU.price || 0).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  {selectedCooling && componentOptions.cooling !== 'skip' && (
                    <div className="flex justify-between text-white text-sm bg-white/5 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">Refrigeração</span>
                        {componentOptions.cooling === 'own' && <span className="text-green-400 text-xs ml-2">(Sua peça)</span>}
                      </div>
                      <span className="font-bold text-red-400">
                        {componentOptions.cooling === 'own' ? '€0.00' : `€${Number(selectedCooling.price || 0).toFixed(2)}`}
                      </span>
                    </div>
                  )}

                  <div className="border-t-2 border-red-500/30 pt-4 mt-4">
                    <div className="flex justify-between text-red-400 text-sm mb-3 bg-white/5 p-3 rounded-lg">
                      <span className="font-medium">Taxa de Montagem</span>
                      <span className="font-bold">€50.00</span>
                    </div>
                    <div className="flex justify-between text-red-400 text-2xl font-bold bg-red-500/10 p-4 rounded-lg">
                      <span>TOTAL</span>
                      <span>€{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* 🔥 NOVO: CAIXA DE CONFIANÇA E GARANTIAS */}
                <div className="mb-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-lg p-4">
                  <h4 className="text-green-400 font-bold text-lg mb-3 flex items-center gap-2">
                    <i className="ri-shield-check-line text-xl"></i>
                    GARANTIA JOKATECH
                  </h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-fill text-green-400 mt-0.5 flex-shrink-0"></i>
                      <span><strong className="text-white">Montagem Profissional:</strong> Montado pessoalmente pelo fundador com mais de 5 anos de experiência</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-fill text-green-400 mt-0.5 flex-shrink-0"></i>
                      <span><strong className="text-white">Testado 100%:</strong> Cada componente é testado individualmente antes e após a montagem</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-fill text-green-400 mt-0.5 flex-shrink-0"></i>
                      <span><strong className="text-white">Prazo de Entrega:</strong> Montagem completa entre 3 a 15 dias úteis dependendo da complexidade</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-fill text-green-400 mt-0.5 flex-shrink-0"></i>
                      <span><strong className="text-white">Garantia Estendida:</strong> 2 anos de garantia em todos os componentes + suporte técnico vitalício</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-fill text-green-400 mt-0.5 flex-shrink-0"></i>
                      <span><strong className="text-white">Cable Management:</strong> Organização profissional de cabos para melhor fluxo de ar e estética</span>
                    </p>
                  </div>
                </div>

                {/* 🔥 NOVO: INFORMAÇÕES DE CONTATO DIRETO */}
                <div className="mb-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-2 border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-bold text-lg mb-3 flex items-center gap-2">
                    <i className="ri-customer-service-2-line text-xl"></i>
                    CONTATO DIRETO
                  </h4>
                  <div className="space-y-3">
                    <p className="text-gray-300 text-sm">
                      Dúvidas sobre a montagem? Fale diretamente com o <strong className="text-white">fundador da JokaTech</strong>:
                    </p>
                    <div className="space-y-2">
                      <a
                        href="mailto:jokadas69@gmail.com"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <i className="ri-mail-line"></i>
                        <span>jokadas69@gmail.com</span>
                      </a>
                      <a
                        href="https://wa.me/352621717862"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
                      >
                        <i className="ri-whatsapp-line"></i>
                        <span>+352 621 717 862</span>
                      </a>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      💡 Resposta garantida em até 24 horas
                    </p>
                  </div>
                </div>

                {submitMessage && (
                  <div className={`mb-4 p-4 rounded-lg text-sm ${
                    submitMessage.includes('✅') 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {submitMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !customerInfo.name || !customerInfo.email}
                  className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-black font-bold rounded-lg hover:shadow-2xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>ENVIANDO...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-fill"></i>
                      <span>SOLICITAR ORÇAMENTO</span>
                    </>
                  )}
                </button>

                <div className="mt-6 space-y-3 text-xs text-gray-400">
                  <div className="flex items-center space-x-2">
                    <i className="ri-tools-line text-red-400"></i>
                    <span>Montagem profissional incluída</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="ri-test-tube-line text-red-400"></i>
                    <span>Testado antes do envio</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="ri-shield-check-line text-red-400"></i>
                    <span>Garantia de 2 anos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="ri-box-3-line text-red-400"></i>
                    <span>Aceita peças próprias</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
      {/* 🔥 ADICIONAR CSS CUSTOMIZADO PARA SCROLLBAR */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ef4444, #dc2626);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #dc2626, #b91c1c);
        }
      `}</style>
    </div>
  );
}
