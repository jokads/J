<?php
/**
 * Plugin Name: Readdy WooCommerce Sync
 * Plugin URI: https://readdy.ai
 * Description: Sincroniza produtos WooCommerce com Supabase automaticamente via webhooks
 * Version: 1.0.0
 * Author: Readdy.ai
 * Author URI: https://readdy.ai
 * License: GPL v2 or later
 * Text Domain: readdy-woo-sync
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 8.5
 */

// Prevenir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

// Constantes do plugin
define('READDY_WOO_SYNC_VERSION', '1.0.0');
define('READDY_WOO_SYNC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('READDY_WOO_SYNC_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Classe principal do plugin
 */
class Readdy_WooCommerce_Sync {
    
    private static $instance = null;
    private $supabase_url = '';
    private $supabase_key = '';
    private $webhook_secret = '';
    
    /**
     * Singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        // Verificar se WooCommerce está ativo
        if (!$this->is_woocommerce_active()) {
            add_action('admin_notices', array($this, 'woocommerce_missing_notice'));
            return;
        }
        
        // Hooks de inicialização
        add_action('init', array($this, 'init'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // Hooks de produtos WooCommerce
        add_action('woocommerce_new_product', array($this, 'sync_product_created'), 10, 1);
        add_action('woocommerce_update_product', array($this, 'sync_product_updated'), 10, 1);
        add_action('woocommerce_delete_product', array($this, 'sync_product_deleted'), 10, 1);
        add_action('woocommerce_product_set_stock', array($this, 'sync_stock_updated'), 10, 1);
        
        // REST API endpoint personalizado
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Carregar configurações
        $this->load_settings();
    }
    
    /**
     * Verificar se WooCommerce está ativo
     */
    private function is_woocommerce_active() {
        return class_exists('WooCommerce');
    }
    
    /**
     * Aviso se WooCommerce não estiver ativo
     */
    public function woocommerce_missing_notice() {
        ?>
        <div class="notice notice-error">
            <p><strong>Readdy WooCommerce Sync</strong> requer o plugin <strong>WooCommerce</strong> para funcionar. Por favor, instale e ative o WooCommerce.</p>
        </div>
        <?php
    }
    
    /**
     * Inicialização
     */
    public function init() {
        // Carregar traduções
        load_plugin_textdomain('readdy-woo-sync', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    /**
     * Carregar configurações
     */
    private function load_settings() {
        $this->supabase_url = get_option('readdy_supabase_url', '');
        $this->supabase_key = get_option('readdy_supabase_key', '');
        $this->webhook_secret = get_option('readdy_webhook_secret', '');
    }
    
    /**
     * Adicionar menu no admin
     */
    public function add_admin_menu() {
        add_menu_page(
            'Readdy Sync',
            'Readdy Sync',
            'manage_woocommerce',
            'readdy-woo-sync',
            array($this, 'render_admin_page'),
            'dashicons-update',
            56
        );
        
        add_submenu_page(
            'readdy-woo-sync',
            'Configurações',
            'Configurações',
            'manage_woocommerce',
            'readdy-woo-sync',
            array($this, 'render_admin_page')
        );
        
        add_submenu_page(
            'readdy-woo-sync',
            'Logs de Sincronização',
            'Logs',
            'manage_woocommerce',
            'readdy-woo-sync-logs',
            array($this, 'render_logs_page')
        );
    }
    
    /**
     * Registrar configurações
     */
    public function register_settings() {
        register_setting('readdy_woo_sync_settings', 'readdy_supabase_url');
        register_setting('readdy_woo_sync_settings', 'readdy_supabase_key');
        register_setting('readdy_woo_sync_settings', 'readdy_webhook_secret');
        register_setting('readdy_woo_sync_settings', 'readdy_auto_sync_enabled');
        register_setting('readdy_woo_sync_settings', 'readdy_sync_images');
    }
    
    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'readdy-woo-sync') === false) {
            return;
        }
        
        wp_enqueue_style('readdy-woo-sync-admin', READDY_WOO_SYNC_PLUGIN_URL . 'assets/admin.css', array(), READDY_WOO_SYNC_VERSION);
        wp_enqueue_script('readdy-woo-sync-admin', READDY_WOO_SYNC_PLUGIN_URL . 'assets/admin.js', array('jquery'), READDY_WOO_SYNC_VERSION, true);
        
        wp_localize_script('readdy-woo-sync-admin', 'readdyWooSync', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('readdy_woo_sync_nonce'),
            'restUrl' => rest_url('readdy-woo-sync/v1/'),
            'restNonce' => wp_create_nonce('wp_rest')
        ));
    }
    
    /**
     * Renderizar página de configurações
     */
    public function render_admin_page() {
        if (!current_user_can('manage_woocommerce')) {
            wp_die(__('Você não tem permissão para acessar esta página.', 'readdy-woo-sync'));
        }
        
        // Salvar configurações
        if (isset($_POST['readdy_save_settings']) && check_admin_referer('readdy_woo_sync_settings')) {
            update_option('readdy_supabase_url', sanitize_text_field($_POST['readdy_supabase_url']));
            update_option('readdy_supabase_key', sanitize_text_field($_POST['readdy_supabase_key']));
            update_option('readdy_webhook_secret', sanitize_text_field($_POST['readdy_webhook_secret']));
            update_option('readdy_auto_sync_enabled', isset($_POST['readdy_auto_sync_enabled']) ? '1' : '0');
            update_option('readdy_sync_images', isset($_POST['readdy_sync_images']) ? '1' : '0');
            
            $this->load_settings();
            
            echo '<div class="notice notice-success"><p>Configurações salvas com sucesso!</p></div>';
        }
        
        // Testar conexão
        if (isset($_POST['readdy_test_connection']) && check_admin_referer('readdy_woo_sync_test')) {
            $test_result = $this->test_supabase_connection();
            if ($test_result['success']) {
                echo '<div class="notice notice-success"><p>✅ Conexão com Supabase estabelecida com sucesso!</p></div>';
            } else {
                echo '<div class="notice notice-error"><p>❌ Erro ao conectar: ' . esc_html($test_result['message']) . '</p></div>';
            }
        }
        
        // Sincronização manual
        if (isset($_POST['readdy_sync_all']) && check_admin_referer('readdy_woo_sync_manual')) {
            $sync_result = $this->sync_all_products();
            echo '<div class="notice notice-info"><p>🔄 Sincronização iniciada! Produtos processados: ' . $sync_result['processed'] . '</p></div>';
        }
        
        include READDY_WOO_SYNC_PLUGIN_DIR . 'templates/admin-settings.php';
    }
    
    /**
     * Renderizar página de logs
     */
    public function render_logs_page() {
        if (!current_user_can('manage_woocommerce')) {
            wp_die(__('Você não tem permissão para acessar esta página.', 'readdy-woo-sync'));
        }
        
        $logs = $this->get_sync_logs(50);
        include READDY_WOO_SYNC_PLUGIN_DIR . 'templates/admin-logs.php';
    }
    
    /**
     * Testar conexão com Supabase
     */
    private function test_supabase_connection() {
        if (empty($this->supabase_url) || empty($this->supabase_key)) {
            return array('success' => false, 'message' => 'URL ou chave do Supabase não configurados');
        }
        
        $response = wp_remote_get($this->supabase_url . '/rest/v1/', array(
            'headers' => array(
                'apikey' => $this->supabase_key,
                'Authorization' => 'Bearer ' . $this->supabase_key
            ),
            'timeout' => 10
        ));
        
        if (is_wp_error($response)) {
            return array('success' => false, 'message' => $response->get_error_message());
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        if ($status_code === 200) {
            return array('success' => true);
        }
        
        return array('success' => false, 'message' => 'Status code: ' . $status_code);
    }
    
    /**
     * Sincronizar produto criado
     */
    public function sync_product_created($product_id) {
        if (!get_option('readdy_auto_sync_enabled', '0')) {
            return;
        }
        
        $product = wc_get_product($product_id);
        if (!$product) {
            return;
        }
        
        $this->send_to_supabase('product.created', $this->format_product_data($product));
        $this->log_sync('product.created', $product_id, 'success');
    }
    
    /**
     * Sincronizar produto atualizado
     */
    public function sync_product_updated($product_id) {
        if (!get_option('readdy_auto_sync_enabled', '0')) {
            return;
        }
        
        $product = wc_get_product($product_id);
        if (!$product) {
            return;
        }
        
        $this->send_to_supabase('product.updated', $this->format_product_data($product));
        $this->log_sync('product.updated', $product_id, 'success');
    }
    
    /**
     * Sincronizar produto deletado
     */
    public function sync_product_deleted($product_id) {
        if (!get_option('readdy_auto_sync_enabled', '0')) {
            return;
        }
        
        $this->send_to_supabase('product.deleted', array('id' => $product_id));
        $this->log_sync('product.deleted', $product_id, 'success');
    }
    
    /**
     * Sincronizar stock atualizado
     */
    public function sync_stock_updated($product) {
        if (!get_option('readdy_auto_sync_enabled', '0')) {
            return;
        }
        
        $product_id = $product->get_id();
        $stock_quantity = $product->get_stock_quantity();
        
        $this->send_to_supabase('product.stock_updated', array(
            'id' => $product_id,
            'stock_quantity' => $stock_quantity,
            'stock_status' => $product->get_stock_status()
        ));
        
        $this->log_sync('product.stock_updated', $product_id, 'success');
    }
    
    /**
     * Formatar dados do produto
     */
    private function format_product_data($product) {
        $data = array(
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'slug' => $product->get_slug(),
            'sku' => $product->get_sku(),
            'price' => $product->get_price(),
            'regular_price' => $product->get_regular_price(),
            'sale_price' => $product->get_sale_price(),
            'description' => $product->get_description(),
            'short_description' => $product->get_short_description(),
            'stock_quantity' => $product->get_stock_quantity(),
            'stock_status' => $product->get_stock_status(),
            'manage_stock' => $product->get_manage_stock(),
            'weight' => $product->get_weight(),
            'dimensions' => array(
                'length' => $product->get_length(),
                'width' => $product->get_width(),
                'height' => $product->get_height()
            ),
            'categories' => array_map(function($term) {
                return $term->name;
            }, get_the_terms($product->get_id(), 'product_cat') ?: array()),
            'tags' => array_map(function($term) {
                return $term->name;
            }, get_the_terms($product->get_id(), 'product_tag') ?: array()),
            'images' => array(),
            'date_created' => $product->get_date_created()->date('Y-m-d H:i:s'),
            'date_modified' => $product->get_date_modified()->date('Y-m-d H:i:s')
        );
        
        // Adicionar imagens se habilitado
        if (get_option('readdy_sync_images', '1')) {
            $image_id = $product->get_image_id();
            if ($image_id) {
                $data['images'][] = wp_get_attachment_url($image_id);
            }
            
            $gallery_ids = $product->get_gallery_image_ids();
            foreach ($gallery_ids as $gallery_id) {
                $data['images'][] = wp_get_attachment_url($gallery_id);
            }
        }
        
        return $data;
    }
    
    /**
     * Enviar dados para Supabase
     */
    private function send_to_supabase($event_type, $data) {
        if (empty($this->supabase_url) || empty($this->supabase_key)) {
            return false;
        }
        
        $payload = array(
            'event_type' => $event_type,
            'woo_product_id' => isset($data['id']) ? $data['id'] : null,
            'payload' => $data,
            'signature' => $this->generate_signature($data),
            'created_at' => current_time('mysql')
        );
        
        $response = wp_remote_post($this->supabase_url . '/rest/v1/woocommerce_webhooks', array(
            'headers' => array(
                'apikey' => $this->supabase_key,
                'Authorization' => 'Bearer ' . $this->supabase_key,
                'Content-Type' => 'application/json',
                'Prefer' => 'return=minimal'
            ),
            'body' => json_encode($payload),
            'timeout' => 15
        ));
        
        if (is_wp_error($response)) {
            $this->log_sync($event_type, $data['id'] ?? 0, 'error', $response->get_error_message());
            return false;
        }
        
        return true;
    }
    
    /**
     * Gerar assinatura HMAC
     */
    private function generate_signature($data) {
        if (empty($this->webhook_secret)) {
            return '';
        }
        
        return hash_hmac('sha256', json_encode($data), $this->webhook_secret);
    }
    
    /**
     * Sincronizar todos os produtos
     */
    private function sync_all_products() {
        $args = array(
            'post_type' => 'product',
            'posts_per_page' => -1,
            'post_status' => 'publish'
        );
        
        $products = get_posts($args);
        $processed = 0;
        
        foreach ($products as $post) {
            $product = wc_get_product($post->ID);
            if ($product) {
                $this->send_to_supabase('product.created', $this->format_product_data($product));
                $processed++;
            }
        }
        
        return array('processed' => $processed);
    }
    
    /**
     * Registrar log de sincronização
     */
    private function log_sync($event_type, $product_id, $status, $message = '') {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'readdy_sync_logs';
        
        $wpdb->insert($table_name, array(
            'event_type' => $event_type,
            'product_id' => $product_id,
            'status' => $status,
            'message' => $message,
            'created_at' => current_time('mysql')
        ));
    }
    
    /**
     * Obter logs de sincronização
     */
    private function get_sync_logs($limit = 50) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'readdy_sync_logs';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name ORDER BY created_at DESC LIMIT %d",
            $limit
        ));
    }
    
    /**
     * Registrar rotas REST API
     */
    public function register_rest_routes() {
        register_rest_route('readdy-woo-sync/v1', '/products', array(
            'methods' => 'GET',
            'callback' => array($this, 'rest_get_products'),
            'permission_callback' => array($this, 'rest_permission_check')
        ));
        
        register_rest_route('readdy-woo-sync/v1', '/sync', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_sync_products'),
            'permission_callback' => array($this, 'rest_permission_check')
        ));
    }
    
    /**
     * REST: Obter produtos
     */
    public function rest_get_products($request) {
        $per_page = $request->get_param('per_page') ?: 50;
        $page = $request->get_param('page') ?: 1;
        
        $args = array(
            'post_type' => 'product',
            'posts_per_page' => $per_page,
            'paged' => $page,
            'post_status' => 'publish'
        );
        
        $products = get_posts($args);
        $formatted_products = array();
        
        foreach ($products as $post) {
            $product = wc_get_product($post->ID);
            if ($product) {
                $formatted_products[] = $this->format_product_data($product);
            }
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'products' => $formatted_products,
            'total' => wp_count_posts('product')->publish
        ));
    }
    
    /**
     * REST: Sincronizar produtos
     */
    public function rest_sync_products($request) {
        $result = $this->sync_all_products();
        
        return rest_ensure_response(array(
            'success' => true,
            'processed' => $result['processed']
        ));
    }
    
    /**
     * REST: Verificar permissões
     */
    public function rest_permission_check() {
        return current_user_can('manage_woocommerce');
    }
}

/**
 * Ativação do plugin
 */
function readdy_woo_sync_activate() {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'readdy_sync_logs';
    $charset_collate = $wpdb->get_charset_collate();
    
    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        event_type varchar(50) NOT NULL,
        product_id bigint(20) NOT NULL,
        status varchar(20) NOT NULL,
        message text,
        created_at datetime NOT NULL,
        PRIMARY KEY (id),
        KEY event_type (event_type),
        KEY product_id (product_id),
        KEY created_at (created_at)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}
register_activation_hook(__FILE__, 'readdy_woo_sync_activate');

/**
 * Desativação do plugin
 */
function readdy_woo_sync_deactivate() {
    // Limpar scheduled tasks se houver
}
register_deactivation_hook(__FILE__, 'readdy_woo_sync_deactivate');

/**
 * Inicializar plugin
 */
function readdy_woo_sync_init() {
    return Readdy_WooCommerce_Sync::get_instance();
}
add_action('plugins_loaded', 'readdy_woo_sync_init');
