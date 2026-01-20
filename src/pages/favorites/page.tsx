import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  stock: number;
  is_active: boolean;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToCart } = useCart();

  // Carregar favoritos do localStorage
  useEffect(() => {
    loadFavorites();
    
    // Listener para sincronizar quando favoritos mudarem
    const handleFavoritesChange = () => {
      loadFavorites();
    };
    
    window.addEventListener('favoritesChanged', handleFavoritesChange);
    return () => window.removeEventListener('favoritesChanged', handleFavoritesChange);
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const favoritesData = localStorage.getItem('favorites');
      if (favoritesData) {
        const favoriteIds = JSON.parse(favoritesData);
        
        // Buscar produtos do Supabase
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .in('id', favoriteIds)
          .eq('is_active', true);
        
        if (error) throw error;
        
        setFavorites(products || []);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle seleção individual
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Selecionar/Desselecionar todos
  const toggleSelectAll = () => {
    if (selectedIds.size === favorites.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(favorites.map(p => p.id)));
    }
  };

  // Remover favoritos selecionados
  const removeSelected = () => {
    try {
      const favoritesData = localStorage.getItem('favorites');
      if (favoritesData) {
        const favoriteIds = JSON.parse(favoritesData);
        const newFavorites = favoriteIds.filter((id: string) => !selectedIds.has(id));
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        
        // Disparar evento para sincronizar
        window.dispatchEvent(new Event('favoritesChanged'));
        
        setSelectedIds(new Set());
        loadFavorites();
      }
    } catch (error) {
      console.error('Erro ao remover favoritos:', error);
    }
  };

  // Comprar produtos selecionados
  const buySelected = async () => {
    if (selectedIds.size === 0) return;
    
    setIsProcessing(true);
    try {
      const selectedProducts = favorites.filter(p => selectedIds.has(p.id));
      
      // Adicionar todos ao carrinho
      for (const product of selectedProducts) {
        await addToCart(product, 1);
      }
      
      // Redirecionar para carrinho
      window.REACT_APP_NAVIGATE('/cart');
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Remover favorito individual
  const removeFavorite = (id: string) => {
    try {
      const favoritesData = localStorage.getItem('favorites');
      if (favoritesData) {
        const favoriteIds = JSON.parse(favoritesData);
        const newFavorites = favoriteIds.filter((fId: string) => fId !== id);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        
        // Disparar evento para sincronizar
        window.dispatchEvent(new Event('favoritesChanged'));
        
        loadFavorites();
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <i className="ri-loader-4-line text-5xl text-[#b62bff] animate-spin"></i>
          <p className="text-gray-600 dark:text-gray-400">Carregando favoritos...</p>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#b62bff] to-[#ff6a00] rounded-full flex items-center justify-center">
            <i className="ri-heart-line text-6xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold mb-4">Nenhum Favorito Ainda</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Comece a adicionar produtos aos seus favoritos para vê-los aqui!
          </p>
          <Link
            to="/category"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all"
          >
            <i className="ri-shopping-bag-line text-xl"></i>
            Explorar Produtos
          </Link>
        </div>
      </div>
    );
  }

  const allSelected = selectedIds.size === favorites.length && favorites.length > 0;
  const hasSelected = selectedIds.size > 0;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <i className="ri-heart-fill text-red-500"></i>
                Meus Favoritos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {favorites.length} {favorites.length === 1 ? 'produto' : 'produtos'} favoritado{favorites.length === 1 ? '' : 's'}
              </p>
            </div>
            <Link
              to="/category"
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
            >
              <i className="ri-arrow-left-line"></i>
              Continuar Comprando
            </Link>
          </div>

          {/* Barra de Ações */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            {/* Selecionar Todos */}
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                allSelected 
                  ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] border-transparent' 
                  : 'border-gray-400 dark:border-gray-600'
              }`}>
                {allSelected && <i className="ri-check-line text-white text-sm"></i>}
              </div>
              <span className="font-medium">
                {allSelected ? 'Desselecionar Todos' : 'Selecionar Todos'}
              </span>
            </button>

            {/* Contador de Selecionados */}
            {hasSelected && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#b62bff]/10 to-[#ff6a00]/10 rounded-lg">
                <i className="ri-checkbox-multiple-line text-[#b62bff]"></i>
                <span className="font-semibold">
                  {selectedIds.size} selecionado{selectedIds.size === 1 ? '' : 's'}
                </span>
              </div>
            )}

            {/* Botões de Ação */}
            {hasSelected && (
              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={removeSelected}
                  className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 transition-all"
                >
                  <i className="ri-delete-bin-line"></i>
                  Remover
                </button>
                <button
                  onClick={buySelected}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      Processando...
                    </>
                  ) : (
                    <>
                      <i className="ri-shopping-bag-3-fill"></i>
                      Comprar Agora
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Grid de Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product) => {
            const isSelected = selectedIds.has(product.id);
            const imageUrl = Array.isArray(product.images) && product.images.length > 0 
              ? product.images[0] 
              : 'https://readdy.ai/api/search-image?query=modern%20elegant%20product%20photography%20simple%20white%20background%20professional%20ecommerce%20style%20minimalist%20clean%20aesthetic&width=400&height=500&seq=fav-default&orientation=portrait';
            
            const discount = product.compare_at_price 
              ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className={`group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected 
                    ? 'border-[#b62bff] shadow-2xl shadow-[#b62bff]/20' 
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                {/* Checkbox de Seleção */}
                <button
                  onClick={() => toggleSelect(product.id)}
                  className="absolute top-4 left-4 z-20 w-8 h-8 rounded-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-all"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] border-transparent' 
                      : 'border-gray-400 dark:border-gray-600'
                  }`}>
                    {isSelected && <i className="ri-check-line text-white text-sm"></i>}
                  </div>
                </button>

                {/* Botão Remover Favorito */}
                <button
                  onClick={() => removeFavorite(product.id)}
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 hover:bg-red-500 hover:text-white transition-all group/remove"
                  title="Remover dos Favoritos"
                >
                  <i className="ri-heart-fill text-xl text-red-500 group-hover/remove:text-white transition-colors"></i>
                </button>

                {/* Badge de Desconto */}
                {discount > 0 && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white text-sm font-bold rounded-full shadow-lg">
                    -{discount}%
                  </div>
                )}

                {/* Imagem */}
                <Link to={`/produto/${product.slug}`} className="block">
                  <div className="relative w-full h-72 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </Link>

                {/* Conteúdo */}
                <div className="p-4 space-y-3">
                  {/* Título */}
                  <Link to={`/produto/${product.slug}`}>
                    <h3 className="text-base font-bold min-h-[3rem] line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#b62bff] group-hover:to-[#ff6a00] group-hover:bg-clip-text transition-all">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Preços */}
                  <div className="space-y-1">
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        €{product.compare_at_price.toFixed(2)}
                      </div>
                    )}
                    <div className="text-2xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
                      €{product.price.toFixed(2)}
                    </div>
                  </div>

                  {/* Estoque */}
                  {product.stock < 10 && product.stock > 0 && (
                    <div className="flex items-center gap-2 text-sm text-orange-500">
                      <i className="ri-error-warning-line"></i>
                      Últimas {product.stock} unidades
                    </div>
                  )}

                  {/* Botões */}
                  <div className="flex gap-3 pt-2">
                    {/* Adicionar ao Carrinho */}
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          await addToCart(product, 1);
                        } catch (error) {
                          console.error('Erro ao adicionar ao carrinho:', error);
                        }
                      }}
                      disabled={product.stock === 0}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Adicionar ao Carrinho"
                    >
                      {product.stock === 0 ? (
                        <i className="ri-close-circle-line text-2xl"></i>
                      ) : (
                        <i className="ri-shopping-cart-line text-2xl"></i>
                      )}
                    </button>

                    {/* Comprar Agora */}
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          await addToCart(product, 1);
                          window.REACT_APP_NAVIGATE('/cart');
                        } catch (error) {
                          console.error('Erro ao comprar:', error);
                        }
                      }}
                      disabled={product.stock === 0}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/buy"
                      title="Comprar Agora"
                    >
                      {product.stock === 0 ? (
                        <i className="ri-close-circle-line text-2xl"></i>
                      ) : (
                        <i className="ri-shopping-bag-3-fill text-2xl group-hover/buy:animate-bounce"></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
