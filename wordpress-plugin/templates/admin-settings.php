<?php
/**
 * Template: Página de Configurações
 */

if (!defined('ABSPATH')) {
    exit;
}

$supabase_url = get_option('readdy_supabase_url', '');
$supabase_key = get_option('readdy_supabase_key', '');
$webhook_secret = get_option('readdy_webhook_secret', '');
$auto_sync = get_option('readdy_auto_sync_enabled', '0');
$sync_images = get_option('readdy_sync_images', '1');

// Estatísticas
$total_products = wp_count_posts('product')->publish;
global $wpdb;
$table_name = $wpdb->prefix . 'readdy_sync_logs';
$total_syncs = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'success'");
$last_sync = $wpdb->get_var("SELECT created_at FROM $table_name ORDER BY created_at DESC LIMIT 1");
?>

<div class="wrap readdy-woo-sync-admin">
    <h1>
        <span class="dashicons dashicons-update" style="font-size: 32px; margin-right: 10px;"></span>
        Readdy WooCommerce Sync
    </h1>
    
    <p class="description">Sincronize seus produtos WooCommerce com Supabase automaticamente</p>
    
    <!-- Estatísticas -->
    <div class="readdy-stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0;">
        <div class="readdy-stat-card" style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Total de Produtos</div>
            <div style="font-size: 32px; font-weight: bold; color: #2271b1;"><?php echo esc_html($total_products); ?></div>
        </div>
        
        <div class="readdy-stat-card" style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Sincronizações</div>
            <div style="font-size: 32px; font-weight: bold; color: #00a32a;"><?php echo esc_html($total_syncs); ?></div>
        </div>
        
        <div class="readdy-stat-card" style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Última Sincronização</div>
            <div style="font-size: 16px; font-weight: bold; color: #666;">
                <?php echo $last_sync ? esc_html(date_i18n('d/m/Y H:i', strtotime($last_sync))) : 'Nunca'; ?>
            </div>
        </div>
        
        <div class="readdy-stat-card" style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Status</div>
            <div style="font-size: 16px; font-weight: bold;">
                <?php if ($auto_sync === '1'): ?>
                    <span style="color: #00a32a;">✅ Ativo</span>
                <?php else: ?>
                    <span style="color: #d63638;">⏸️ Pausado</span>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <!-- Tabs -->
    <h2 class="nav-tab-wrapper">
        <a href="#tab-connection" class="nav-tab nav-tab-active">Conexão</a>
        <a href="#tab-sync" class="nav-tab">Sincronização</a>
        <a href="#tab-advanced" class="nav-tab">Avançado</a>
    </h2>
    
    <!-- Tab: Conexão -->
    <div id="tab-connection" class="readdy-tab-content">
        <form method="post" action="">
            <?php wp_nonce_field('readdy_woo_sync_settings'); ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="readdy_supabase_url">URL do Supabase</label>
                    </th>
                    <td>
                        <input 
                            type="url" 
                            id="readdy_supabase_url" 
                            name="readdy_supabase_url" 
                            value="<?php echo esc_attr($supabase_url); ?>" 
                            class="regular-text"
                            placeholder="https://seu-projeto.supabase.co"
                        />
                        <p class="description">URL do seu projeto Supabase (ex: https://abc123.supabase.co)</p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="readdy_supabase_key">Chave do Supabase</label>
                    </th>
                    <td>
                        <input 
                            type="password" 
                            id="readdy_supabase_key" 
                            name="readdy_supabase_key" 
                            value="<?php echo esc_attr($supabase_key); ?>" 
                            class="regular-text"
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        />
                        <p class="description">Service Role Key do Supabase (encontre em Settings → API)</p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="readdy_webhook_secret">Webhook Secret</label>
                    </th>
                    <td>
                        <input 
                            type="text" 
                            id="readdy_webhook_secret" 
                            name="readdy_webhook_secret" 
                            value="<?php echo esc_attr($webhook_secret); ?>" 
                            class="regular-text"
                            placeholder="whs_abc123xyz"
                        />
                        <p class="description">Secret para validação HMAC dos webhooks (opcional mas recomendado)</p>
                        <button type="button" class="button" onclick="document.getElementById('readdy_webhook_secret').value = 'whs_' + Math.random().toString(36).substring(2, 15);">
                            Gerar Secret Aleatório
                        </button>
                    </td>
                </tr>
            </table>
            
            <p class="submit">
                <button type="submit" name="readdy_save_settings" class="button button-primary">
                    <span class="dashicons dashicons-yes" style="margin-top: 3px;"></span> Salvar Configurações
                </button>
            </p>
        </form>
        
        <!-- Testar Conexão -->
        <hr>
        <h3>Testar Conexão</h3>
        <p>Verifique se a conexão com o Supabase está funcionando corretamente.</p>
        
        <form method="post" action="">
            <?php wp_nonce_field('readdy_woo_sync_test'); ?>
            <p class="submit">
                <button type="submit" name="readdy_test_connection" class="button button-secondary">
                    <span class="dashicons dashicons-admin-plugins" style="margin-top: 3px;"></span> Testar Conexão
                </button>
            </p>
        </form>
    </div>
    
    <!-- Tab: Sincronização -->
    <div id="tab-sync" class="readdy-tab-content" style="display: none;">
        <form method="post" action="">
            <?php wp_nonce_field('readdy_woo_sync_settings'); ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row">Sincronização Automática</th>
                    <td>
                        <label>
                            <input 
                                type="checkbox" 
                                name="readdy_auto_sync_enabled" 
                                value="1" 
                                <?php checked($auto_sync, '1'); ?>
                            />
                            Ativar sincronização automática ao criar/editar/deletar produtos
                        </label>
                        <p class="description">Quando ativado, produtos serão sincronizados automaticamente com o Supabase</p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">Sincronizar Imagens</th>
                    <td>
                        <label>
                            <input 
                                type="checkbox" 
                                name="readdy_sync_images" 
                                value="1" 
                                <?php checked($sync_images, '1'); ?>
                            />
                            Incluir URLs das imagens na sincronização
                        </label>
                        <p class="description">Envia as URLs das imagens dos produtos para o Supabase</p>
                    </td>
                </tr>
            </table>
            
            <p class="submit">
                <button type="submit" name="readdy_save_settings" class="button button-primary">
                    <span class="dashicons dashicons-yes" style="margin-top: 3px;"></span> Salvar Configurações
                </button>
            </p>
        </form>
        
        <!-- Sincronização Manual -->
        <hr>
        <h3>Sincronização Manual</h3>
        <p>Sincronize todos os produtos publicados com o Supabase agora.</p>
        
        <div class="notice notice-warning inline">
            <p><strong>Atenção:</strong> Esta ação irá sincronizar TODOS os <?php echo esc_html($total_products); ?> produtos publicados. Pode levar alguns minutos.</p>
        </div>
        
        <form method="post" action="">
            <?php wp_nonce_field('readdy_woo_sync_manual'); ?>
            <p class="submit">
                <button type="submit" name="readdy_sync_all" class="button button-secondary" onclick="return confirm('Tem certeza que deseja sincronizar todos os produtos?');">
                    <span class="dashicons dashicons-update" style="margin-top: 3px;"></span> Sincronizar Todos os Produtos
                </button>
            </p>
        </form>
    </div>
    
    <!-- Tab: Avançado -->
    <div id="tab-advanced" class="readdy-tab-content" style="display: none;">
        <h3>Informações do Sistema</h3>
        
        <table class="widefat striped">
            <tbody>
                <tr>
                    <td><strong>Versão do Plugin</strong></td>
                    <td><?php echo esc_html(READDY_WOO_SYNC_VERSION); ?></td>
                </tr>
                <tr>
                    <td><strong>Versão do WordPress</strong></td>
                    <td><?php echo esc_html(get_bloginfo('version')); ?></td>
                </tr>
                <tr>
                    <td><strong>Versão do WooCommerce</strong></td>
                    <td><?php echo esc_html(WC()->version); ?></td>
                </tr>
                <tr>
                    <td><strong>Versão do PHP</strong></td>
                    <td><?php echo esc_html(phpversion()); ?></td>
                </tr>
                <tr>
                    <td><strong>URL do Site</strong></td>
                    <td><?php echo esc_html(get_site_url()); ?></td>
                </tr>
                <tr>
                    <td><strong>REST API URL</strong></td>
                    <td><?php echo esc_html(rest_url('readdy-woo-sync/v1/')); ?></td>
                </tr>
            </tbody>
        </table>
        
        <hr>
        
        <h3>Endpoints da API</h3>
        <p>Use estes endpoints para integração externa:</p>
        
        <table class="widefat striped">
            <thead>
                <tr>
                    <th>Método</th>
                    <th>Endpoint</th>
                    <th>Descrição</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>GET</code></td>
                    <td><code><?php echo esc_html(rest_url('readdy-woo-sync/v1/products')); ?></code></td>
                    <td>Obter lista de produtos</td>
                </tr>
                <tr>
                    <td><code>POST</code></td>
                    <td><code><?php echo esc_html(rest_url('readdy-woo-sync/v1/sync')); ?></code></td>
                    <td>Sincronizar todos os produtos</td>
                </tr>
            </tbody>
        </table>
        
        <hr>
        
        <h3>Limpar Logs</h3>
        <p>Limpar logs de sincronização antigos (mantém últimos 1000 registros).</p>
        
        <form method="post" action="">
            <?php wp_nonce_field('readdy_woo_sync_clear_logs'); ?>
            <p class="submit">
                <button type="submit" name="readdy_clear_logs" class="button button-secondary" onclick="return confirm('Tem certeza que deseja limpar os logs?');">
                    <span class="dashicons dashicons-trash" style="margin-top: 3px;"></span> Limpar Logs Antigos
                </button>
            </p>
        </form>
    </div>
</div>

<style>
.readdy-woo-sync-admin {
    max-width: 1200px;
}

.readdy-stat-card {
    transition: transform 0.2s;
}

.readdy-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
}

.nav-tab-wrapper {
    margin-bottom: 20px;
}

.readdy-tab-content {
    background: #fff;
    padding: 20px;
    border: 1px solid #ccd0d4;
    border-top: none;
}
</style>

<script>
jQuery(document).ready(function($) {
    // Tab switching
    $('.nav-tab').on('click', function(e) {
        e.preventDefault();
        
        // Update tabs
        $('.nav-tab').removeClass('nav-tab-active');
        $(this).addClass('nav-tab-active');
        
        // Update content
        $('.readdy-tab-content').hide();
        $($(this).attr('href')).show();
    });
});
</script>
