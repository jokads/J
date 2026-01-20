/**
 * Readdy WooCommerce Sync - Admin Scripts
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        
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
        
        // Auto-refresh stats every 30 seconds
        if ($('.readdy-stats-grid').length > 0) {
            setInterval(function() {
                location.reload();
            }, 30000);
        }
        
        // Confirm before sync all
        $('button[name="readdy_sync_all"]').on('click', function(e) {
            if (!confirm('Tem certeza que deseja sincronizar todos os produtos? Esta ação pode levar alguns minutos.')) {
                e.preventDefault();
                return false;
            }
        });
        
        // Confirm before clear logs
        $('button[name="readdy_clear_logs"]').on('click', function(e) {
            if (!confirm('Tem certeza que deseja limpar os logs? Esta ação não pode ser desfeita.')) {
                e.preventDefault();
                return false;
            }
        });
        
        // Show loading on form submit
        $('form').on('submit', function() {
            var $button = $(this).find('button[type="submit"]');
            $button.prop('disabled', true);
            $button.html('<span class="dashicons dashicons-update-alt" style="animation: spin 1s linear infinite;"></span> Processando...');
        });
        
        // Copy to clipboard
        $('.readdy-copy-btn').on('click', function() {
            var text = $(this).data('copy');
            navigator.clipboard.writeText(text).then(function() {
                alert('Copiado para a área de transferência!');
            });
        });
        
    });
    
})(jQuery);

// Add spin animation
var style = document.createElement('style');
style.innerHTML = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
