import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    // Verificar localStorage primeiro, depois preferência do sistema
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Forçar light mode por padrão
    return false;
  });

  useEffect(() => {
    // Aplicar tema ao HTML
    const root = document.documentElement;
    
    if (darkMode) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
      
      // Cores dark mode - vermelho/roxo vivo + laranja
      root.style.setProperty('--bg', '#0b0011');
      root.style.setProperty('--surface', '#170018');
      root.style.setProperty('--primary', '#b62bff');
      root.style.setProperty('--accent', '#ff6a00');
      root.style.setProperty('--danger', '#ff2d55');
      root.style.setProperty('--text', '#ffdfe8');
      
      // Atualizar meta theme-color
      let metaTheme = document.querySelector('meta[name="theme-color"]');
      if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.setAttribute('name', 'theme-color');
        document.head.appendChild(metaTheme);
      }
      metaTheme.setAttribute('content', '#0b0011');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
      
      // Cores light mode - branco suave com roxo/vermelho
      root.style.setProperty('--bg', '#ffffff');
      root.style.setProperty('--surface', '#f7f6fb');
      root.style.setProperty('--primary', '#6e4cff');
      root.style.setProperty('--accent', '#ff5263');
      root.style.setProperty('--danger', '#ff2d55');
      root.style.setProperty('--text', '#1f1530');
      
      // Atualizar meta theme-color
      let metaTheme = document.querySelector('meta[name="theme-color"]');
      if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.setAttribute('name', 'theme-color');
        document.head.appendChild(metaTheme);
      }
      metaTheme.setAttribute('content', '#ffffff');
    }
    
    // Salvar preferência
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}