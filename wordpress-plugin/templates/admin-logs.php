<?php
/**
 * Template: Página de Logs
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap readdy-woo-sync-logs">
    <h1>
        <span class="dashicons dashicons-list-view" style="font-size: 32px; margin-right: 10px;"></span>
        Logs de Sincronização
    </h1>
    
    <p class="description">Histórico de sincronizações de produtos com o Supabase</p>
    
    <?php if (empty($logs)): ?>
        <div class="notice notice-info inline">
            <p>Nenhum log de sincronização encontrado. Sincronize alguns produtos para ver os logs aqui.</p>
        </div>
    <?php else: ?>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th style="width: 50px;">ID</th>
                    <th style="width: 150px;">Data/Hora</th>
                    <th style="width: 150px;">Evento</th>
                    <th style="width: 100px;">Produto ID</th>
                    <th style="width: 100px;">Status</th>
                    <th>Mensagem</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($logs as $log): ?>
                    <tr>
                        <td><?php echo esc_html($log->id); ?></td>
                        <td><?php echo esc_html(date_i18n('d/m/Y H:i:s', strtotime($log->created_at))); ?></td>
                        <td>
                            <?php
                            $event_icons = array(
                                'product.created' => '➕',
                                'product.updated' => '✏️',
                                'product.deleted' => '🗑️',
                                'product.stock_updated' => '📦'
                            );
                            $icon = isset($event_icons[$log->event_type]) ? $event_icons[$log->event_type] : '📄';
                            echo esc_html($icon . ' ' . $log->event_type);
                            ?>
                        </td>
                        <td>
                            <a href="<?php echo esc_url(admin_url('post.php?post=' . $log->product_id . '&action=edit')); ?>" target="_blank">
                                #<?php echo esc_html($log->product_id); ?>
                            </a>
                        </td>
                        <td>
                            <?php if ($log->status === 'success'): ?>
                                <span style="color: #00a32a; font-weight: bold;">✅ Sucesso</span>
                            <?php else: ?>
                                <span style="color: #d63638; font-weight: bold;">❌ Erro</span>
                            <?php endif; ?>
                        </td>
                        <td><?php echo esc_html($log->message ?: '-'); ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        
        <p class="description" style="margin-top: 20px;">
            Mostrando os últimos 50 logs. Para ver todos os logs, acesse o banco de dados diretamente.
        </p>
    <?php endif; ?>
</div>

<style>
.readdy-woo-sync-logs {
    max-width: 1400px;
}

.wp-list-table {
    margin-top: 20px;
}
</style>
