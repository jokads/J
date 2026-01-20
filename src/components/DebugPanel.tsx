import { useState, useEffect } from 'react';

interface DebugPanelProps {
  darkMode: boolean;
}

export default function DebugPanel({ darkMode }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cssHash, setCssHash] = useState('');
  const [lastSync, setLastSync] = useState('');
  const [theme, setTheme] = useState('');
  const [lastError, setLastError] = useState('');

  useEffect(() => {
    // Carregar informações de debug
    loadDebugInfo();
    
    // Atualizar a cada 5 segundos
    const interval = setInterval(loadDebugInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDebugInfo = () => {
    // CSS Hash
    const styleSheets = Array.from(document.styleSheets);
    const cssContent = styleSheets.map(s => s.href || 'inline').join(',');
    setCssHash(btoa(cssContent).substring(0, 8));

    // Tema atual
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme);

    // Último sync WooCommerce
    const lastWooSync = localStorage.getItem('last_woo_sync') || 'Nunca';
    setLastSync(lastWooSync);

    // Último erro
    const lastErr = localStorage.getItem('last_ui_error') || 'Nenhum';
    setLastError(lastErr);
  };

  const clearErrors = () => {
    localStorage.removeItem('last_ui_error');
    setLastError('Nenhum');
  };

  const reloadCSS = () => {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach((link: any) => {
      const href = link.href;
      link.href = href + (href.includes('?') ? '&' : '?') + 'reload=' + Date.now();
    });
    alert('✅ CSS recarregado!');
  };

  // Apenas mostrar em desenvolvimento
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-[9999] w-12 h-12 rounded-full ${
          darkMode ? 'bg-gray-800' : 'bg-gray-200'
        } border-2 ${
          darkMode ? 'border-primary' : 'border-gray-400'
        } flex items-center justify-center hover:scale-110 transition-transform shadow-lg`}
        title="Debug Panel (Dev Only)"
      >
        <i className="ri-bug-line text-xl text-primary"></i>
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-4 z-[9999] w-80 ${
            darkMode ? 'bg-surface' : 'bg-white'
          } border ${
            darkMode ? 'border-gray-800' : 'border-gray-200'
          } rounded-xl shadow-2xl p-4`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <i className="ri-bug-line text-primary"></i>
              Debug Panel
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className={`w-8 h-8 rounded-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
              } flex items-center justify-center transition-colors`}
            >
              <i className="ri-close-line"></i>
            </button>
          </div>

          <div className="space-y-3">
            {/* CSS Hash */}
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-400">CSS Hash</span>
                <button
                  onClick={reloadCSS}
                  className="text-xs text-primary hover:underline"
                >
                  Recarregar
                </button>
              </div>
              <code className="text-xs text-primary font-mono">{cssHash}</code>
            </div>

            {/* Tema Atual */}
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <span className="text-sm font-medium text-gray-400 block mb-1">Tema Atual</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  theme === 'dark'
                    ? 'bg-purple-500/20 text-purple-500'
                    : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </span>
              </div>
            </div>

            {/* Último Sync WooCommerce */}
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <span className="text-sm font-medium text-gray-400 block mb-1">
                Último Sync WooCommerce
              </span>
              <span className="text-xs">{lastSync}</span>
            </div>

            {/* Último Erro */}
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-400">Último Erro</span>
                {lastError !== 'Nenhum' && (
                  <button
                    onClick={clearErrors}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <span className={`text-xs ${lastError === 'Nenhum' ? 'text-green-500' : 'text-red-500'}`}>
                {lastError}
              </span>
            </div>

            {/* Informações do Sistema */}
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <span className="text-sm font-medium text-gray-400 block mb-2">Sistema</span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Viewport:</span>
                  <span>{window.innerWidth}x{window.innerHeight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">User Agent:</span>
                  <span className="truncate max-w-[150px]" title={navigator.userAgent}>
                    {navigator.userAgent.split(' ')[0]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Online:</span>
                  <span className={navigator.onLine ? 'text-green-500' : 'text-red-500'}>
                    {navigator.onLine ? '✓ Sim' : '✗ Não'}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  localStorage.clear();
                  alert('✅ LocalStorage limpo!');
                }}
                className="flex-1 px-3 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors text-xs font-medium whitespace-nowrap"
              >
                Limpar Storage
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors text-xs font-medium whitespace-nowrap"
              >
                Recarregar
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800">
            <p className="text-xs text-gray-400 text-center">
              🔧 Apenas visível em desenvolvimento
            </p>
          </div>
        </div>
      )}
    </>
  );
}