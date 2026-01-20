import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../lib/supabase';

// Paletas pré-definidas profissionais
const THEME_PRESETS = {
  modern: {
    name: '🌟 Moderno (Azul)',
    light: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    dark: {
      primary: '#60a5fa',
      secondary: '#3b82f6',
      accent: '#93c5fd',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171'
    }
  },
  elegant: {
    name: '💎 Elegante (Roxo)',
    light: {
      primary: '#8b5cf6',
      secondary: '#6d28d9',
      accent: '#a78bfa',
      background: '#ffffff',
      surface: '#faf5ff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    dark: {
      primary: '#a78bfa',
      secondary: '#8b5cf6',
      accent: '#c4b5fd',
      background: '#18181b',
      surface: '#27272a',
      text: '#fafafa',
      textSecondary: '#a1a1aa',
      border: '#3f3f46',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171'
    }
  },
  energetic: {
    name: '🔥 Energético (Laranja)',
    light: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      background: '#ffffff',
      surface: '#fff7ed',
      text: '#1c1917',
      textSecondary: '#78716c',
      border: '#e7e5e4',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    dark: {
      primary: '#fb923c',
      secondary: '#f97316',
      accent: '#fdba74',
      background: '#1c1917',
      surface: '#292524',
      text: '#fafaf9',
      textSecondary: '#a8a29e',
      border: '#44403c',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171'
    }
  },
  professional: {
    name: '💼 Profissional (Cinza)',
    light: {
      primary: '#475569',
      secondary: '#334155',
      accent: '#64748b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    dark: {
      primary: '#94a3b8',
      secondary: '#64748b',
      accent: '#cbd5e1',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171'
    }
  },
  nature: {
    name: '🌿 Natureza (Verde)',
    light: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: '#ffffff',
      surface: '#f0fdf4',
      text: '#064e3b',
      textSecondary: '#6b7280',
      border: '#d1fae5',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    dark: {
      primary: '#34d399',
      secondary: '#10b981',
      accent: '#6ee7b7',
      background: '#064e3b',
      surface: '#065f46',
      text: '#ecfdf5',
      textSecondary: '#a7f3d0',
      border: '#047857',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171'
    }
  },
  sunset: {
    name: '🌅 Pôr do Sol (Rosa)',
    light: {
      primary: '#ec4899',
      secondary: '#db2777',
      accent: '#f472b6',
      background: '#ffffff',
      surface: '#fdf2f8',
      text: '#831843',
      textSecondary: '#9f1239',
      border: '#fce7f3',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    dark: {
      primary: '#f472b6',
      secondary: '#ec4899',
      accent: '#f9a8d4',
      background: '#500724',
      surface: '#831843',
      text: '#fce7f3',
      textSecondary: '#fbcfe8',
      border: '#9f1239',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171'
    }
  }
};

// Páginas do site
const SITE_PAGES = [
  { id: 'home', name: '🏠 Página Inicial', icon: 'ri-home-line' },
  { id: 'products', name: '🛍️ Produtos', icon: 'ri-shopping-bag-line' },
  { id: 'services', name: '⚙️ Serviços', icon: 'ri-tools-line' },
  { id: 'about', name: 'ℹ️ Sobre Nós', icon: 'ri-information-line' },
  { id: 'contact', name: '📞 Contato', icon: 'ri-phone-line' },
  { id: 'cart', name: '🛒 Carrinho', icon: 'ri-shopping-cart-line' },
  { id: 'favorites', name: '❤️ Favoritos', icon: 'ri-heart-line' },
  { id: 'profile', name: '👤 Perfil', icon: 'ri-user-line' }
];

interface ThemeSettings {
  preset: string;
  customColors: {
    light: any;
    dark: any;
  };
  pageSettings: {
    [key: string]: {
      darkModeEnabled: boolean;
      useCustomColors: boolean;
      customColors?: {
        light: any;
        dark: any;
      };
    };
  };
}

export default function ThemeEditor() {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('modern');
  const [selectedPage, setSelectedPage] = useState('home');
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    preset: 'modern',
    customColors: {
      light: THEME_PRESETS.modern.light,
      dark: THEME_PRESETS.modern.dark
    },
    pageSettings: {}
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'theme_settings')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.value) {
        setThemeSettings(data.value);
        setSelectedPreset(data.value.preset || 'modern');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      // Aplicar cores ao CSS root
      applyThemeToSite();

      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'theme_settings',
          value: themeSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('✅ Tema salvo com sucesso! Recarregando...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar tema');
    } finally {
      setSaving(false);
    }
  };

  const applyThemeToSite = () => {
    const colors = themeSettings.customColors[darkMode ? 'dark' : 'light'];
    const root = document.documentElement;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value as string);
    });
  };

  const applyPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    setThemeSettings({
      ...themeSettings,
      preset: presetKey,
      customColors: {
        light: THEME_PRESETS[presetKey as keyof typeof THEME_PRESETS].light,
        dark: THEME_PRESETS[presetKey as keyof typeof THEME_PRESETS].dark
      }
    });
  };

  const togglePageDarkMode = (pageId: string) => {
    setThemeSettings({
      ...themeSettings,
      pageSettings: {
        ...themeSettings.pageSettings,
        [pageId]: {
          ...themeSettings.pageSettings[pageId],
          darkModeEnabled: !themeSettings.pageSettings[pageId]?.darkModeEnabled
        }
      }
    });
  };

  const updateColor = (mode: 'light' | 'dark', colorKey: string, value: string) => {
    setThemeSettings({
      ...themeSettings,
      customColors: {
        ...themeSettings.customColors,
        [mode]: {
          ...themeSettings.customColors[mode],
          [colorKey]: value
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl animate-spin text-purple-500"></i>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  const currentColors = themeSettings.customColors[darkMode ? 'dark' : 'light'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <i className="ri-palette-line text-purple-500"></i>
            🎨 Editor de Temas
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Controlo total de cores e temas Dark/Light por página
          </p>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all whitespace-nowrap disabled:opacity-50"
        >
          {saving ? (
            <>
              <i className="ri-loader-4-line animate-spin"></i>
              Salvando...
            </>
          ) : (
            <>
              <i className="ri-save-line"></i>
              💾 Salvar Tema
            </>
          )}
        </button>
      </div>

      {/* Paletas Pré-definidas */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 space-y-4`}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <i className="ri-paint-brush-line text-purple-500"></i>
          🎨 Paletas Profissionais
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Escolha uma paleta pré-definida ou personalize suas próprias cores
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(THEME_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedPreset === key
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">{preset.name}</span>
                {selectedPreset === key && (
                  <i className="ri-checkbox-circle-fill text-purple-500 text-xl"></i>
                )}
              </div>
              
              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded-lg border border-gray-300"
                  style={{ backgroundColor: preset.light.primary }}
                  title="Primária Light"
                ></div>
                <div
                  className="w-8 h-8 rounded-lg border border-gray-300"
                  style={{ backgroundColor: preset.light.secondary }}
                  title="Secundária Light"
                ></div>
                <div
                  className="w-8 h-8 rounded-lg border border-gray-300"
                  style={{ backgroundColor: preset.light.accent }}
                  title="Destaque Light"
                ></div>
                <div className="w-px bg-gray-300 dark:bg-gray-600"></div>
                <div
                  className="w-8 h-8 rounded-lg border border-gray-600"
                  style={{ backgroundColor: preset.dark.primary }}
                  title="Primária Dark"
                ></div>
                <div
                  className="w-8 h-8 rounded-lg border border-gray-600"
                  style={{ backgroundColor: preset.dark.secondary }}
                  title="Secundária Dark"
                ></div>
                <div
                  className="w-8 h-8 rounded-lg border border-gray-600"
                  style={{ backgroundColor: preset.dark.accent }}
                  title="Destaque Dark"
                ></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor de Cores Customizadas */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 space-y-6`}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <i className="ri-brush-line text-orange-500"></i>
          🎨 Personalizar Cores
        </h3>

        {/* Tabs Light/Dark */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {['light', 'dark'].map((mode) => (
            <button
              key={mode}
              onClick={() => {}}
              className={`px-4 py-2 font-medium transition-all ${
                mode === 'light'
                  ? 'border-b-2 border-yellow-500 text-yellow-600'
                  : 'text-gray-500'
              }`}
            >
              {mode === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          ))}
        </div>

        {/* Grid de Cores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(currentColors).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium capitalize">
                {key === 'primary' && '🎨 Cor Primária'}
                {key === 'secondary' && '🎨 Cor Secundária'}
                {key === 'accent' && '✨ Cor de Destaque'}
                {key === 'background' && '🖼️ Fundo'}
                {key === 'surface' && '📄 Superfície'}
                {key === 'text' && '📝 Texto'}
                {key === 'textSecondary' && '💬 Texto Secundário'}
                {key === 'border' && '🔲 Borda'}
                {key === 'success' && '✅ Sucesso'}
                {key === 'warning' && '⚠️ Aviso'}
                {key === 'error' && '❌ Erro'}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={value as string}
                  onChange={(e) => updateColor(darkMode ? 'dark' : 'light', key, e.target.value)}
                  className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={value as string}
                  onChange={(e) => updateColor(darkMode ? 'dark' : 'light', key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="mt-6 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <i className="ri-eye-line"></i>
            👁️ Preview
          </h4>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: currentColors.primary,
                color: '#ffffff'
              }}
            >
              Botão Primário
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: currentColors.secondary,
                color: '#ffffff'
              }}
            >
              Botão Secundário
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: currentColors.accent,
                color: '#ffffff'
              }}
            >
              Botão Destaque
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: currentColors.success,
                color: '#ffffff'
              }}
            >
              ✅ Sucesso
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: currentColors.warning,
                color: '#ffffff'
              }}
            >
              ⚠️ Aviso
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: currentColors.error,
                color: '#ffffff'
              }}
            >
              ❌ Erro
            </button>
          </div>
        </div>
      </div>

      {/* Configurações por Página */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 space-y-4`}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <i className="ri-pages-line text-blue-500"></i>
          📄 Configurações por Página
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ative/desative Dark Mode para páginas específicas
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SITE_PAGES.map((page) => (
            <div
              key={page.id}
              className={`p-4 rounded-xl border-2 ${
                themeSettings.pageSettings[page.id]?.darkModeEnabled
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <i className={`${page.icon} text-lg`}></i>
                  <span className="font-medium text-sm">{page.name}</span>
                </div>
                <button
                  onClick={() => togglePageDarkMode(page.id)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    themeSettings.pageSettings[page.id]?.darkModeEnabled
                      ? 'bg-purple-500'
                      : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-all ${
                      themeSettings.pageSettings[page.id]?.darkModeEnabled
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`}
                  ></div>
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {themeSettings.pageSettings[page.id]?.darkModeEnabled
                  ? '🌙 Dark Mode Ativo'
                  : '☀️ Light Mode Ativo'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
