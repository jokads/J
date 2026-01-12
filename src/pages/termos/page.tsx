import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

export default function Termos() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-5xl font-bold text-black mb-8">
            TERMOS E <span className="text-gold">CONDIÇÕES</span>
          </h1>
          
          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-black mb-4">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e usar o site JokaTech, você concorda em cumprir e estar vinculado aos seguintes 
                termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deve 
                usar nosso site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">2. Produtos e Serviços</h2>
              <p>
                A JokaTech oferece componentes de hardware de PC, periféricos e produtos relacionados à tecnologia. 
                Todos os produtos estão sujeitos à disponibilidade. Reservamo-nos o direito de limitar as quantidades 
                de qualquer produto que oferecemos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">3. Preços e Pagamentos</h2>
              <p className="mb-3">
                Todos os preços estão listados em Euros (€) e podem ser convertidos para outras moedas. 
                Aceitamos as seguintes formas de pagamento:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cartões de crédito (Visa, Mastercard)</li>
                <li>Cartões de débito</li>
                <li>Pagamentos processados via Stripe</li>
              </ul>
              <p className="mt-3">
                Os preços podem ser alterados sem aviso prévio. O preço aplicável será o vigente no momento 
                da confirmação do pedido.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">4. Envio e Entrega</h2>
              <p className="mb-3">
                Realizamos entregas para os seguintes países: Luxemburgo, França, Bélgica, Holanda, Alemanha, 
                Itália, Reino Unido, Suécia, Tailândia e outros países europeus.
              </p>
              <p className="mb-3">
                <strong className="text-gold">Não realizamos entregas para:</strong> Estados Unidos e países 
                em conflito ou guerra.
              </p>
              <p>
                Os prazos de entrega variam de acordo com o destino e serão informados no momento da compra. 
                Não nos responsabilizamos por atrasos causados por transportadoras ou alfândega.
              </p>
            </section>

            <div className="bg-gray-50 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">POLÍTICA DE DEVOLUÇÃO</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Prazo:</strong> Você tem até <strong>14 dias corridos</strong> após o recebimento do produto para solicitar devolução ou troca.
                </p>
                <p>
                  <strong>Condições:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>O produto deve estar em perfeito estado, sem sinais de uso</li>
                  <li>Embalagem original intacta com todos os acessórios</li>
                  <li>Nota fiscal e certificado de garantia inclusos</li>
                  <li>Lacres de segurança não violados (quando aplicável)</li>
                </ul>
                <p>
                  <strong>Produtos não aceitos para devolução:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Produtos personalizados ou montados sob encomenda</li>
                  <li>Software com lacre violado</li>
                  <li>Produtos com mais de 14 dias desde a entrega</li>
                  <li>Produtos danificados por mau uso</li>
                </ul>
                <p>
                  <strong>Processo de Devolução:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Entre em contato conosco via email ou WhatsApp</li>
                  <li>Informe o número do pedido e motivo da devolução</li>
                  <li>Aguarde autorização e instruções de envio</li>
                  <li>Envie o produto conforme orientações</li>
                  <li>Reembolso processado em até 7 dias úteis após recebimento</li>
                </ol>
                <p className="text-red-600 font-semibold">
                  ⚠️ IMPORTANTE: Após 14 dias da entrega, não aceitamos mais devoluções. Apenas trocas por defeito de fabricação dentro do período de garantia.
                </p>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">6. Garantia</h2>
              <p>
                Todos os produtos vendidos pela JokaTech possuem garantia do fabricante. O período de garantia 
                varia de acordo com o produto e fabricante. Produtos defeituosos serão reparados ou substituídos 
                conforme os termos da garantia do fabricante.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">7. Marketplace</h2>
              <p className="mb-3">
                A JokaTech opera um marketplace onde vendedores terceiros podem listar seus produtos. 
                Para vender no marketplace:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>É necessário criar uma conta e ser aprovado pela equipe JokaTech</li>
                <li>A comissão varia entre 1% e 5% por produto vendido</li>
                <li>Os vendedores são responsáveis pela qualidade e entrega de seus produtos</li>
                <li>A JokaTech se reserva o direito de remover produtos ou vendedores que violem nossas políticas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">8. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo do site JokaTech, incluindo textos, gráficos, logos, imagens e software, 
                é propriedade da JokaTech ou de seus fornecedores de conteúdo e está protegido por leis 
                de direitos autorais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">9. Limitação de Responsabilidade</h2>
              <p>
                A JokaTech não será responsável por quaisquer danos indiretos, incidentais, especiais ou 
                consequenciais resultantes do uso ou incapacidade de usar nossos produtos ou serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">10. Contato</h2>
              <p>
                Para questões sobre estes Termos e Condições, entre em contato:
              </p>
              <div className="mt-4 space-y-2">
                <p><strong className="text-gold">Proprietários:</strong> Claudio Damas e Mariana Pereira</p>
                <p><strong className="text-gold">E-mail Principal:</strong> jokadas69@gmail.com</p>
                <p><strong className="text-gold">E-mail Secundário:</strong> jokadaskz69@gmail.com</p>
                <p><strong className="text-gold">Telefone:</strong> +352 621 717 862</p>
                <p><strong className="text-gold">Telefone Secundário:</strong> +352 621 377 168</p>
                <p><strong className="text-gold">WhatsApp:</strong> +352 621 717 862</p>
                <p><strong className="text-gold">Localização:</strong> Luxemburgo (Apenas vendas online)</p>
              </div>
            </section>

            <section>
              <p className="text-sm text-gray-500 mt-8">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
