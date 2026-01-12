import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-5xl font-bold text-black mb-8">
            POLÍTICA DE <span className="text-gold">PRIVACIDADE</span>
          </h1>
          
          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-black mb-4">1. Informações que Coletamos</h2>
              <p>
                A JokaTech coleta informações pessoais quando você se registra em nosso site, faz uma compra, 
                se inscreve em nossa newsletter ou preenche um formulário. As informações coletadas incluem 
                nome, endereço de e-mail, número de telefone e informações de pagamento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">2. Como Usamos Suas Informações</h2>
              <p className="mb-3">Utilizamos as informações coletadas para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Processar transações e enviar produtos</li>
                <li>Melhorar nosso site e serviços</li>
                <li>Enviar e-mails periódicos sobre pedidos e promoções</li>
                <li>Responder a consultas e solicitações de suporte</li>
                <li>Personalizar sua experiência de compra</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">3. Proteção de Dados</h2>
              <p>
                Implementamos medidas de segurança adequadas para proteger suas informações pessoais contra 
                acesso não autorizado, alteração, divulgação ou destruição. Todos os pagamentos são processados 
                através de gateways seguros com criptografia SSL.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">4. Cookies</h2>
              <p>
                Utilizamos cookies para melhorar sua experiência em nosso site. Cookies são pequenos arquivos 
                que um site transfere para o disco rígido do seu computador através do navegador, permitindo 
                que nossos sistemas reconheçam seu navegador e capturem certas informações.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">5. Compartilhamento de Informações</h2>
              <p>
                Não vendemos, trocamos ou transferimos suas informações pessoais para terceiros sem o seu 
                consentimento, exceto quando necessário para processar transações ou cumprir requisitos legais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">6. Seus Direitos</h2>
              <p className="mb-3">Você tem o direito de:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Acessar suas informações pessoais</li>
                <li>Corrigir dados incorretos</li>
                <li>Solicitar a exclusão de suas informações</li>
                <li>Optar por não receber comunicações de marketing</li>
                <li>Retirar seu consentimento a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">7. Contato</h2>
              <p>
                Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco:
              </p>
              <div className="mt-4 space-y-2">
                <p><strong className="text-gold">E-mail:</strong> jokadas69@gmail.com</p>
                <p><strong className="text-gold">Telefone:</strong> +352 621 717 862</p>
                <p><strong className="text-gold">WhatsApp:</strong> +352 621 717 862</p>
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
