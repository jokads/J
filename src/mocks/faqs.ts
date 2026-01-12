export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_featured: boolean;
  order_index: number;
}

export const faqsMock: FAQ[] = [
  // FAQs em destaque (5 principais)
  {
    id: '1',
    question: 'Como faço um pedido?',
    answer: 'Para fazer um pedido, navegue pelos nossos produtos, adicione os itens desejados ao carrinho e clique em "Finalizar Compra". Você será direcionado para o checkout onde poderá inserir seus dados de entrega e pagamento. Após confirmar, você receberá um email com os detalhes do pedido.',
    category: 'pedidos',
    is_featured: true,
    order_index: 1
  },
  {
    id: '2',
    question: 'Quais são as formas de pagamento aceitas?',
    answer: 'Aceitamos pagamentos via cartão de crédito (Visa, Mastercard, American Express), cartão de débito, transferência bancária e PayPal. Todos os pagamentos são processados de forma segura através do Stripe.',
    category: 'pagamento',
    is_featured: true,
    order_index: 2
  },
  {
    id: '3',
    question: 'Qual o prazo de entrega?',
    answer: 'O prazo de entrega varia conforme sua localização. Para Portugal Continental: 2-3 dias úteis. Para ilhas e Europa: 5-7 dias úteis. Você receberá um código de rastreamento assim que o pedido for enviado.',
    category: 'entrega',
    is_featured: true,
    order_index: 3
  },
  {
    id: '4',
    question: 'Como funciona a garantia dos produtos?',
    answer: 'Todos os nossos produtos possuem garantia do fabricante. Componentes de hardware geralmente têm 2-3 anos de garantia. PCs completos têm 1 ano de garantia. Em caso de defeito, entre em contato conosco e cuidaremos de todo o processo de garantia.',
    category: 'garantia',
    is_featured: true,
    order_index: 4
  },
  {
    id: '5',
    question: 'Posso devolver um produto?',
    answer: 'Sim! Você tem 14 dias corridos a partir do recebimento para devolver qualquer produto, desde que esteja em perfeitas condições, na embalagem original e sem sinais de uso. Entre em contato conosco para iniciar o processo de devolução.',
    category: 'devolucao',
    is_featured: true,
    order_index: 5
  },
  // FAQs adicionais (20 perguntas)
  {
    id: '6',
    question: 'Vocês fazem montagem de PC personalizado?',
    answer: 'Sim! Oferecemos serviço completo de montagem de PC personalizado. Acesse a página "Montar PC" no nosso site, escolha os componentes desejados e nossa equipe montará e testará seu PC antes de enviar. Também oferecemos consultoria gratuita para ajudar na escolha dos componentes ideais.',
    category: 'servicos',
    is_featured: false,
    order_index: 6
  },
  {
    id: '7',
    question: 'Os produtos são originais?',
    answer: 'Sim, todos os nossos produtos são 100% originais e adquiridos diretamente dos fabricantes ou distribuidores autorizados. Fornecemos nota fiscal e certificado de autenticidade para todos os produtos.',
    category: 'produtos',
    is_featured: false,
    order_index: 7
  },
  {
    id: '8',
    question: 'Como funciona o Marketplace?',
    answer: 'Nosso Marketplace é uma plataforma exclusiva para nossos clientes venderem produtos de tecnologia. Todos os vendedores são verificados e aprovados pela nossa equipe. Os produtos passam por revisão antes de serem publicados, garantindo qualidade e segurança.',
    category: 'marketplace',
    is_featured: false,
    order_index: 8
  },
  {
    id: '9',
    question: 'Como me tornar um vendedor?',
    answer: 'Para se tornar um vendedor, acesse a página do Marketplace e clique em "Tornar-se Vendedor". Preencha o formulário com seus dados e aguarde a aprovação da nossa equipe. Após aprovado, você poderá adicionar seus produtos e começar a vender.',
    category: 'marketplace',
    is_featured: false,
    order_index: 9
  },
  {
    id: '10',
    question: 'Qual a comissão do Marketplace?',
    answer: 'Cobramos uma comissão de 10% sobre cada venda realizada através do Marketplace. Esse valor cobre os custos de manutenção da plataforma, suporte ao cliente e processamento de pagamentos.',
    category: 'marketplace',
    is_featured: false,
    order_index: 10
  },
  {
    id: '11',
    question: 'Vocês oferecem suporte técnico?',
    answer: 'Sim! Oferecemos suporte técnico completo para todos os produtos vendidos por nós. Entre em contato via WhatsApp, email ou através do nosso Assistente IA disponível 24/7. Nossa equipe está pronta para ajudar com instalação, configuração e resolução de problemas.',
    category: 'suporte',
    is_featured: false,
    order_index: 11
  },
  {
    id: '12',
    question: 'Como rastreio meu pedido?',
    answer: 'Após o envio do seu pedido, você receberá um email com o código de rastreamento. Você também pode acompanhar o status do pedido na área "Meus Pedidos" no seu perfil. O rastreamento é atualizado em tempo real.',
    category: 'pedidos',
    is_featured: false,
    order_index: 12
  },
  {
    id: '13',
    question: 'Posso alterar ou cancelar meu pedido?',
    answer: 'Você pode alterar ou cancelar seu pedido em até 2 horas após a confirmação. Após esse período, o pedido já estará em processo de separação e não poderá ser alterado. Entre em contato imediatamente se precisar fazer alguma alteração.',
    category: 'pedidos',
    is_featured: false,
    order_index: 13
  },
  {
    id: '14',
    question: 'Vocês entregam em toda a Europa?',
    answer: 'Sim! Realizamos entregas para todos os países da União Europeia. Os prazos e custos de envio variam conforme o destino. Consulte os valores no checkout antes de finalizar a compra.',
    category: 'entrega',
    is_featured: false,
    order_index: 14
  },
  {
    id: '15',
    question: 'Como funciona o programa de fidelidade?',
    answer: 'Nosso programa de fidelidade possui 4 níveis: Bronze, Prata, Ouro e Platina. Você acumula pontos a cada compra e sobe de nível conforme o valor total gasto. Cada nível oferece benefícios exclusivos como descontos, frete grátis e atendimento prioritário.',
    category: 'fidelidade',
    is_featured: false,
    order_index: 15
  },
  {
    id: '16',
    question: 'Vocês oferecem desconto para compras em quantidade?',
    answer: 'Sim! Para compras acima de 5 unidades do mesmo produto, oferecemos descontos especiais. Entre em contato com nossa equipe comercial para solicitar um orçamento personalizado.',
    category: 'vendas',
    is_featured: false,
    order_index: 16
  },
  {
    id: '17',
    question: 'Como funciona a instalação de componentes?',
    answer: 'Oferecemos serviço de instalação de componentes mediante agendamento. Nossa equipe técnica pode instalar RAM, SSD, placa de vídeo e outros componentes no seu PC. Entre em contato para verificar disponibilidade e valores.',
    category: 'servicos',
    is_featured: false,
    order_index: 17
  },
  {
    id: '18',
    question: 'Vocês fazem upgrade de PC?',
    answer: 'Sim! Analisamos seu PC atual e recomendamos os melhores upgrades para melhorar o desempenho. Oferecemos consultoria gratuita e instalação dos novos componentes. Agende uma avaliação através do nosso WhatsApp.',
    category: 'servicos',
    is_featured: false,
    order_index: 18
  },
  {
    id: '19',
    question: 'Como funciona a troca de produtos com defeito?',
    answer: 'Em caso de defeito, entre em contato imediatamente. Avaliaremos o problema e, se confirmado o defeito, faremos a troca imediata ou reparo através da garantia do fabricante. O processo é rápido e sem burocracia.',
    category: 'garantia',
    is_featured: false,
    order_index: 19
  },
  {
    id: '20',
    question: 'Posso retirar o pedido pessoalmente?',
    answer: 'Sim! Oferecemos a opção de retirada em nosso ponto de coleta em Luxemburgo. Selecione essa opção no checkout e você receberá um email quando o pedido estiver pronto para retirada.',
    category: 'entrega',
    is_featured: false,
    order_index: 20
  },
  {
    id: '21',
    question: 'Vocês oferecem financiamento?',
    answer: 'Atualmente não oferecemos financiamento próprio, mas aceitamos pagamento parcelado através de cartão de crédito. Consulte as condições de parcelamento com a operadora do seu cartão.',
    category: 'pagamento',
    is_featured: false,
    order_index: 21
  },
  {
    id: '22',
    question: 'Como funciona o Assistente IA?',
    answer: 'Nosso Assistente IA está disponível 24/7 para responder suas dúvidas, ajudar na escolha de produtos e agendar atendimentos. Você pode conversar por chat ou voz. Clique no botão no canto inferior direito da tela para iniciar.',
    category: 'suporte',
    is_featured: false,
    order_index: 22
  },
  {
    id: '23',
    question: 'Vocês trabalham com empresas?',
    answer: 'Sim! Oferecemos soluções corporativas com condições especiais para empresas. Entre em contato com nossa equipe comercial para discutir suas necessidades e receber um orçamento personalizado.',
    category: 'vendas',
    is_featured: false,
    order_index: 23
  },
  {
    id: '24',
    question: 'Como atualizo meus dados cadastrais?',
    answer: 'Acesse a área "Meu Perfil" no menu superior. Lá você pode atualizar seus dados pessoais, endereço de entrega, senha e preferências de comunicação. As alterações são salvas automaticamente.',
    category: 'conta',
    is_featured: false,
    order_index: 24
  },
  {
    id: '25',
    question: 'Vocês oferecem consultoria para montagem de PC?',
    answer: 'Sim! Nossa equipe oferece consultoria gratuita para ajudar você a escolher os melhores componentes de acordo com seu orçamento e necessidades. Entre em contato via WhatsApp ou use nosso Assistente IA para agendar uma consulta.',
    category: 'servicos',
    is_featured: false,
    order_index: 25
  }
];
