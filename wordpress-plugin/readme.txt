=== Readdy WooCommerce Sync ===
Contributors: readdy
Tags: woocommerce, supabase, sync, integration, products
Requires at least: 5.8
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Sincronize produtos WooCommerce com Supabase automaticamente via webhooks.

== Description ==

O **Readdy WooCommerce Sync** permite sincronizar seus produtos WooCommerce com o Supabase de forma automática e em tempo real.

**Recursos principais:**

* ✅ Sincronização automática ao criar/editar/deletar produtos
* ✅ Sincronização manual de todos os produtos
* ✅ Webhooks em tempo real
* ✅ Logs detalhados de sincronização
* ✅ Dashboard com estatísticas
* ✅ REST API para integração externa
* ✅ Validação HMAC para segurança
* ✅ Suporte a imagens de produtos
* ✅ Interface admin intuitiva

**Como funciona:**

1. Configure a URL e chave do Supabase
2. Ative a sincronização automática
3. Seus produtos serão sincronizados automaticamente!

**Requisitos:**

* WordPress 5.8+
* WooCommerce 5.0+
* PHP 7.4+
* Conta no Supabase

== Installation ==

**Instalação Manual:**

1. Baixe o plugin
2. Extraia o arquivo ZIP
3. Faça upload da pasta `readdy-woocommerce-sync` para `/wp-content/plugins/`
4. Ative o plugin através do menu 'Plugins' no WordPress
5. Vá em **Readdy Sync** → **Configurações**
6. Configure a URL e chave do Supabase
7. Clique em **Testar Conexão**
8. Ative a sincronização automática
9. Pronto! 🎉

**Via WordPress Admin:**

1. Vá em **Plugins** → **Adicionar Novo**
2. Pesquise por "Readdy WooCommerce Sync"
3. Clique em **Instalar Agora**
4. Clique em **Ativar**
5. Siga os passos 5-9 acima

== Frequently Asked Questions ==

= Preciso ter uma conta no Supabase? =

Sim, você precisa de uma conta no Supabase (gratuita ou paga) para usar este plugin.

= Como obtenho a URL e chave do Supabase? =

1. Acesse https://supabase.com
2. Faça login na sua conta
3. Selecione seu projeto
4. Vá em **Settings** → **API**
5. Copie a **URL** e a **Service Role Key**

= Os produtos são sincronizados em tempo real? =

Sim! Quando você cria, edita ou deleta um produto no WooCommerce, ele é sincronizado automaticamente com o Supabase em segundos.

= Posso sincronizar produtos existentes? =

Sim! Use o botão **Sincronizar Todos os Produtos** na aba **Sincronização** para sincronizar todos os produtos publicados de uma vez.

= As imagens dos produtos são sincronizadas? =

Sim! As URLs das imagens são enviadas para o Supabase. Você pode desativar isso nas configurações se preferir.

= Como vejo os logs de sincronização? =

Vá em **Readdy Sync** → **Logs** para ver o histórico completo de sincronizações.

= O plugin é seguro? =

Sim! Usamos validação HMAC para garantir que apenas requisições autênticas sejam processadas. Suas chaves são armazenadas de forma segura no banco de dados do WordPress.

= Posso usar a API REST do plugin? =

Sim! O plugin fornece endpoints REST para integração externa. Veja a aba **Avançado** nas configurações para mais detalhes.

== Screenshots ==

1. Dashboard com estatísticas
2. Configurações de conexão
3. Sincronização automática
4. Logs de sincronização
5. Informações avançadas

== Changelog ==

= 1.0.0 =
* Lançamento inicial
* Sincronização automática de produtos
* Sincronização manual em lote
* Webhooks em tempo real
* Logs detalhados
* Dashboard com estatísticas
* REST API
* Validação HMAC

== Upgrade Notice ==

= 1.0.0 =
Primeira versão do plugin. Instale e configure para começar a sincronizar seus produtos!

== Support ==

Para suporte, visite: https://readdy.ai/support

== Privacy Policy ==

Este plugin envia dados de produtos para o Supabase conforme configurado. Nenhum dado pessoal de clientes é enviado. Apenas informações de produtos (nome, preço, descrição, imagens, etc.) são sincronizadas.

== Credits ==

Desenvolvido por Readdy.ai
