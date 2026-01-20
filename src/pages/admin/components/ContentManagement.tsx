import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useTheme } from '../../../contexts/ThemeContext';

interface ContentManagementProps {
  darkMode: boolean;
}

interface ThemeColors {
  // Light Mode Colors
  light_bg: string;
  light_surface: string;
  light_primary: string;
  light_accent: string;
  light_text: string;
  light_border: string;
  light_hover: string;
  light_success: string;
  light_warning: string;
  light_danger: string;
  
  // Dark Mode Colors
  dark_bg: string;
  dark_surface: string;
  dark_primary: string;
  dark_accent: string;
  dark_text: string;
  dark_border: string;
  dark_hover: string;
  dark_success: string;
  dark_warning: string;
  dark_danger: string;
  
  // Typography
  font_family: string;
  
  // Logo & Branding
  logo_url?: string;
  favicon_url?: string;
}

export default function ContentManagement({ darkMode }: ContentManagementProps) {
  const { toggleTheme } = useTheme();
  const [pages, setPages] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'theme' | 'pages' | 'banners'>('theme');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  
  // Theme Colors State
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    // Light Mode Defaults
    light_bg: '#ffffff',
    light_surface: '#f7f6fb',
    light_primary: '#6e4cff',
    light_accent: '#ff5263',
    light_text: '#1f1530',
    light_border: '#e5e7eb',
    light_hover: '#f3f4f6',
    light_success: '#10b981',
    light_warning: '#f59e0b',
    light_danger: '#ef4444',
    
    // Dark Mode Defaults
    dark_bg: '#0b0011',
    dark_surface: '#170018',
    dark_primary: '#b62bff',
    dark_accent: '#ff6a00',
    dark_text: '#ffdfe8',
    dark_border: '#374151',
    dark_hover: '#1f2937',
    dark_success: '#10b981',
    dark_warning: '#f59e0b',
    dark_danger: '#ff2d55',
    
    font_family: 'Inter'
  });

  useEffect(() => {
    loadContentData();
  }, []);

  const loadContentData = async () => {
    try {
      const [pagesRes, bannersRes, settingsRes] = await Promise.all([
        supabase.from('cms_pages').select('*').order('created_at', { ascending: false }),
        supabase.from('banners').select('*').order('display_order', { ascending: true }),
        supabase.from('site_settings').select('*')
      ]);

      setPages(pagesRes.data || []);
      setBanners(bannersRes.data || []);
      
      // Load theme colors from settings
      const settingsObj: any = {};
      settingsRes.data?.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      
      // Merge with defaults
      setThemeColors(prev => ({
        ...prev,
        ...settingsObj
      }));
      
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setThemeColors(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveThemeColors = async () => {
    setSaving(true);
    try {
      // Save all theme colors to site_settings
      const updates = Object.entries(themeColors).map(([key, value]) => ({
        key,
        value: value || '',
        category: 'theme'
      }));

      for (const update of updates) {
        await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'key' });
      }

      // Apply colors to CSS variables
      applyThemeColors();

      alert('✅ Tema salvo com sucesso! As cores foram aplicadas ao site.');
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      alert('❌ Erro ao salvar tema. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const applyThemeColors = () => {
    const root = document.documentElement;
    const isDark = darkMode;
    
    if (isDark) {
      root.style.setProperty('--bg', themeColors.dark_bg);
      root.style.setProperty('--surface', themeColors.dark_surface);
      root.style.setProperty('--primary', themeColors.dark_primary);
      root.style.setProperty('--accent', themeColors.dark_accent);
      root.style.setProperty('--text', themeColors.dark_text);
      root.style.setProperty('--border', themeColors.dark_border);
      root.style.setProperty('--hover', themeColors.dark_hover);
      root.style.setProperty('--success', themeColors.dark_success);
      root.style.setProperty('--warning', themeColors.dark_warning);
      root.style.setProperty('--danger', themeColors.dark_danger);
    } else {
      root.style.setProperty('--bg', themeColors.light_bg);
      root.style.setProperty('--surface', themeColors.light_surface);
      root.style.setProperty('--primary', themeColors.light_primary);
      root.style.setProperty('--accent', themeColors.light_accent);
      root.style.setProperty('--text', themeColors.light_text);
      root.style.setProperty('--border', themeColors.light_border);
      root.style.setProperty('--hover', themeColors.light_hover);
      root.style.setProperty('--success', themeColors.light_success);
      root.style.setProperty('--warning', themeColors.light_warning);
      root.style.setProperty('--danger', themeColors.light_danger);
    }
    
    // Apply font
    if (themeColors.font_family) {
      root.style.setProperty('--font-family', themeColors.font_family);
    }
  };

  const resetToDefaults = () => {
    if (!confirm('⚠️ Tem certeza que deseja restaurar as cores padrão? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setThemeColors({
      light_bg: '#ffffff',
      light_surface: '#f7f6fb',
      light_primary: '#6e4cff',
      light_accent: '#ff5263',
      light_text: '#1f1530',
      light_border: '#e5e7eb',
      light_hover: '#f3f4f6',
      light_success: '#10b981',
      light_warning: '#f59e0b',
      light_danger: '#ef4444',
      
      dark_bg: '#0b0011',
      dark_surface: '#170018',
      dark_primary: '#b62bff',
      dark_accent: '#ff6a00',
      dark_text: '#ffdfe8',
      dark_border: '#374151',
      dark_hover: '#1f2937',
      dark_success: '#10b981',
      dark_warning: '#f59e0b',
      dark_danger: '#ff2d55',
      
      font_family: 'Inter'
    });
  };

  const ColorInput = ({ label, colorKey, description }: { label: string; colorKey: keyof ThemeColors; description?: string }) => {
    const value = themeColors[colorKey] as string;
    
    return (
      <div className="space-y-2">
        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
          {description && (
            <span className={`block text-xs font-normal ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-0.5`}>
              {description}
            </span>
          )}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value}
            onChange={(e) => handleColorChange(colorKey, e.target.value)}
            className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-700"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => handleColorChange(colorKey, e.target.value)}
            className={`flex-1 px-4 py-2.5 rounded-lg font-mono text-sm ${
              darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
            } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
            placeholder="#000000"
          />
          <div 
            className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-inner"
            style={{ backgroundColor: value }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-palette-line text-purple-500"></i>
            Gestão de Conteúdo & Tema
          </h2>
          <p className="text-gray-400 mt-1">Controle completo sobre cores, páginas e banners do site</p>
        </div>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            darkMode 
              ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          <i className={`text-xl ${darkMode ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-2 p-1 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} w-fit`}>
        <button
          onClick={() => setActiveTab('theme')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'theme'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <i className="ri-palette-line text-xl"></i>
          Tema & Cores
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pages'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
              : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <i className="ri-file-list-3-line text-xl"></i>
          Páginas CMS
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'banners'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
              : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <i className="ri-image-2-line text-xl"></i>
          Banners & Sliders
        </button>
      </div>

      {/* Theme Colors Tab */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Preview Mode Toggle */}
              <div className={`flex items-center gap-2 p-1 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setPreviewMode('light')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    previewMode === 'light'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className="ri-sun-line"></i>
                  Light
                </button>
                <button
                  onClick={() => setPreviewMode('dark')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    previewMode === 'dark'
                      ? 'bg-gray-900 text-white shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className="ri-moon-line"></i>
                  Dark
                </button>
              </div>
              
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Editando: <strong>{previewMode === 'light' ? 'Modo Claro' : 'Modo Escuro'}</strong>
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={resetToDefaults}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <i className="ri-restart-line text-xl"></i>
                Restaurar Padrão
              </button>
              
              <button
                onClick={saveThemeColors}
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
              >
                <i className={`text-xl ${saving ? 'ri-loader-4-line animate-spin' : 'ri-save-line'}`}></i>
                {saving ? 'Salvando...' : 'Salvar Tema'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Color Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Light Mode Colors */}
              {previewMode === 'light' && (
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-xl`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <i className="ri-sun-line text-xl text-white"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Modo Claro (Light Mode)</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Cores exibidas quando o usuário usa tema claro
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ColorInput 
                      label="🎨 Fundo Principal" 
                      colorKey="light_bg"
                      description="Background do site"
                    />
                    <ColorInput 
                      label="📄 Fundo de Superfície" 
                      colorKey="light_surface"
                      description="Cards, modais, painéis"
                    />
                    <ColorInput 
                      label="💜 Cor Primária" 
                      colorKey="light_primary"
                      description="Botões, links, destaque"
                    />
                    <ColorInput 
                      label="🔥 Cor de Acento" 
                      colorKey="light_accent"
                      description="Call-to-actions, badges"
                    />
                    <ColorInput 
                      label="📝 Cor do Texto" 
                      colorKey="light_text"
                      description="Texto principal"
                    />
                    <ColorInput 
                      label="📏 Cor da Borda" 
                      colorKey="light_border"
                      description="Divisores, contornos"
                    />
                    <ColorInput 
                      label="✨ Cor de Hover" 
                      colorKey="light_hover"
                      description="Background ao passar mouse"
                    />
                    <ColorInput 
                      label="✅ Sucesso" 
                      colorKey="light_success"
                      description="Confirmações, aprovado"
                    />
                    <ColorInput 
                      label="⚠️ Aviso" 
                      colorKey="light_warning"
                      description="Alertas, atenção"
                    />
                    <ColorInput 
                      label="❌ Perigo" 
                      colorKey="light_danger"
                      description="Erros, cancelamentos"
                    />
                  </div>
                </div>
              )}

              {/* Dark Mode Colors */}
              {previewMode === 'dark' && (
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-xl`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <i className="ri-moon-line text-xl text-white"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Modo Escuro (Dark Mode)</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Cores exibidas quando o usuário usa tema escuro
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ColorInput 
                      label="🎨 Fundo Principal" 
                      colorKey="dark_bg"
                      description="Background do site"
                    />
                    <ColorInput 
                      label="📄 Fundo de Superfície" 
                      colorKey="dark_surface"
                      description="Cards, modais, painéis"
                    />
                    <ColorInput 
                      label="💜 Cor Primária" 
                      colorKey="dark_primary"
                      description="Botões, links, destaque"
                    />
                    <ColorInput 
                      label="🔥 Cor de Acento" 
                      colorKey="dark_accent"
                      description="Call-to-actions, badges"
                    />
                    <ColorInput 
                      label="📝 Cor do Texto" 
                      colorKey="dark_text"
                      description="Texto principal"
                    />
                    <ColorInput 
                      label="📏 Cor da Borda" 
                      colorKey="dark_border"
                      description="Divisores, contornos"
                    />
                    <ColorInput 
                      label="✨ Cor de Hover" 
                      colorKey="dark_hover"
                      description="Background ao passar mouse"
                    />
                    <ColorInput 
                      label="✅ Sucesso" 
                      colorKey="dark_success"
                      description="Confirmações, aprovado"
                    />
                    <ColorInput 
                      label="⚠️ Aviso" 
                      colorKey="dark_warning"
                      description="Alertas, atenção"
                    />
                    <ColorInput 
                      label="❌ Perigo" 
                      colorKey="dark_danger"
                      description="Erros, cancelamentos"
                    />
                  </div>
                </div>
              )}

              {/* Typography */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-xl`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <i className="ri-text text-xl text-white"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Tipografia</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Fonte principal do site
                    </p>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fonte Principal
                  </label>
                  <select 
                    value={themeColors.font_family}
                    onChange={(e) => handleColorChange('font_family', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg ${
                      darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                    } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  >
                    <option value="Inter">Inter (Recomendado)</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Raleway">Raleway</option>
                    <option value="Nunito">Nunito</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-6">
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-xl sticky top-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <i className="ri-eye-line text-xl text-white"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Preview ao Vivo</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Visualização em tempo real
                    </p>
                  </div>
                </div>

                {/* Preview Content */}
                <div 
                  className="rounded-lg p-6 space-y-4 border-2"
                  style={{
                    backgroundColor: previewMode === 'light' ? themeColors.light_bg : themeColors.dark_bg,
                    color: previewMode === 'light' ? themeColors.light_text : themeColors.dark_text,
                    borderColor: previewMode === 'light' ? themeColors.light_border : themeColors.dark_border,
                    fontFamily: themeColors.font_family
                  }}
                >
                  {/* Card */}
                  <div 
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: previewMode === 'light' ? themeColors.light_surface : themeColors.dark_surface,
                      borderColor: previewMode === 'light' ? themeColors.light_border : themeColors.dark_border,
                      borderWidth: '1px'
                    }}
                  >
                    <h4 className="font-bold mb-2">Card de Exemplo</h4>
                    <p className="text-sm opacity-70">Este é um exemplo de como os cards vão aparecer</p>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2">
                    <button 
                      className="w-full px-4 py-2 rounded-lg font-medium"
                      style={{
                        backgroundColor: previewMode === 'light' ? themeColors.light_primary : themeColors.dark_primary,
                        color: '#ffffff'
                      }}
                    >
                      Botão Primário
                    </button>
                    <button 
                      className="w-full px-4 py-2 rounded-lg font-medium"
                      style={{
                        backgroundColor: previewMode === 'light' ? themeColors.light_accent : themeColors.dark_accent,
                        color: '#ffffff'
                      }}
                    >
                      Botão de Acento
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${previewMode === 'light' ? themeColors.light_success : themeColors.dark_success}20`,
                        color: previewMode === 'light' ? themeColors.light_success : themeColors.dark_success
                      }}
                    >
                      Sucesso
                    </span>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${previewMode === 'light' ? themeColors.light_warning : themeColors.dark_warning}20`,
                        color: previewMode === 'light' ? themeColors.light_warning : themeColors.dark_warning
                      }}
                    >
                      Aviso
                    </span>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${previewMode === 'light' ? themeColors.light_danger : themeColors.dark_danger}20`,
                        color: previewMode === 'light' ? themeColors.light_danger : themeColors.dark_danger
                      }}
                    >
                      Perigo
                    </span>
                  </div>

                  {/* Border Example */}
                  <div 
                    className="p-4 rounded-lg border"
                    style={{
                      borderColor: previewMode === 'light' ? themeColors.light_border : themeColors.dark_border
                    }}
                  >
                    <p className="text-sm">Exemplo de borda</p>
                  </div>

                  {/* Hover Example */}
                  <div 
                    className="p-4 rounded-lg transition-colors cursor-pointer"
                    style={{
                      backgroundColor: previewMode === 'light' ? themeColors.light_hover : themeColors.dark_hover
                    }}
                  >
                    <p className="text-sm">Exemplo de hover</p>
                  </div>
                </div>

                {/* Info */}
                <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-700'} flex items-start gap-2`}>
                    <i className="ri-information-line text-base mt-0.5"></i>
                    <span>
                      As cores serão aplicadas em tempo real no site após salvar. 
                      Os usuários verão as cores do modo que escolheram (claro/escuro).
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pages Tab */}
      {activeTab === 'pages' && (
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-xl`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Páginas CMS</h3>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
              <i className="ri-add-line text-xl"></i>
              Nova Página
            </button>
          </div>

          <div className="space-y-3">
            {pages.length === 0 ? (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Nenhuma página criada</p>
            ) : (
              pages.map((page) => (
                <div key={page.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{page.title}</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        /{page.slug}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      page.is_published ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {page.is_published ? 'Publicada' : 'Rascunho'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                      <i className="ri-edit-line"></i>
                    </button>
                    <button className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors">
                      <i className="ri-eye-line"></i>
                    </button>
                    <button className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-xl`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Banners & Sliders</h3>
            <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
              <i className="ri-add-line text-xl"></i>
              Novo Banner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.length === 0 ? (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Nenhum banner criado</p>
            ) : (
              banners.map((banner) => (
                <div key={banner.id} className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="aspect-video bg-gray-700 flex items-center justify-center">
                    {banner.image_url ? (
                      <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                      <i className="ri-image-line text-4xl text-gray-500"></i>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium mb-2">{banner.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        banner.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {banner.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button className="p-1 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                          <i className="ri-edit-line text-sm"></i>
                        </button>
                        <button className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
