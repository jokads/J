
import { Link } from 'react-router-dom';
import { Product } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Verificar se o produto está nos favoritos
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(product.id));
  }, [product.id]);

  // Toggle favorito
  const toggleFavorite = (productId: string) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;
    
    if (favorites.includes(productId)) {
      newFavorites = favorites.filter((id: string) => id !== productId);
      setIsFavorite(false);
    } else {
      newFavorites = [...favorites, productId];
      setIsFavorite(true);
    }
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    // Disparar evento para atualizar contador no header
    window.dispatchEvent(new Event('favoritesChanged'));
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    try {
      await addToCart(product, 1);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToCart(product, 1);
      window.REACT_APP_NAVIGATE('/cart');
    } catch (error) {
      console.error('Erro ao comprar:', error);
    }
  };

  const imageUrl = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : 'https://readdy.ai/api/search-image?query=product%20placeholder%20image%20on%20clean%20white%20minimalist%20background&width=400&height=400&seq=placeholder&orientation=squarish';

  return (
    <div
      className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
      data-product-shop
    >
      {/* Imagem - Maior e mais destacada */}
      <Link to={`/produto/${product.slug}`} className="block">
        <div className="relative w-full h-72 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Botão de Favorito - Maior e mais visível */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className={`absolute top-4 right-4 w-12 h-12 rounded-full ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white'
            } backdrop-blur-sm flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer z-10`}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <i className={`${isFavorite ? 'ri-heart-fill' : 'ri-heart-line'} text-2xl`}></i>
          </button>

          {/* Badges de Status */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.stock < 10 && product.stock > 0 && (
              <div className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                Últimas {product.stock}
              </div>
            )}
            {product.stock === 0 && (
              <div className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                Esgotado
              </div>
            )}
            {product.compare_at_price && product.compare_at_price > product.price && (
              <div className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Conteúdo - Mais compacto e focado */}
      <div className="p-5">
        {/* Título - Maior e mais destacado */}
        <Link to={`/produto/${product.slug}`}>
          <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 mb-4 min-h-[3rem] group-hover:text-[#b62bff] dark:group-hover:text-[#ff6a00] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Preço - Maior e mais visível - SEMPRE EM EURO */}
        <div className="mb-4">
          {product.compare_at_price && product.compare_at_price > product.price ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm line-through text-gray-400 dark:text-gray-500">
                  €{product.compare_at_price.toFixed(2)}
                </span>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
                €{product.price.toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="text-2xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
              €{product.price.toFixed(2)}
            </div>
          )}
        </div>

        {/* Botões de Ação - Lado a Lado - SÓ ÍCONES */}
        <div className="flex gap-3">
          {/* Botão Adicionar ao Carrinho - Só Ícone */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding}
            className="flex-1 px-4 py-3.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white font-bold rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center justify-center shadow-lg hover:scale-105"
            title="Adicionar ao Carrinho"
          >
            {isAdding ? (
              <i className="ri-loader-4-line animate-spin text-2xl"></i>
            ) : product.stock === 0 ? (
              <i className="ri-close-circle-line text-2xl"></i>
            ) : (
              <i className="ri-shopping-cart-line text-2xl"></i>
            )}
          </button>

          {/* Botão Comprar Agora - Só Ícone - Saco de Compras Animado */}
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="flex-1 px-4 py-3.5 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center justify-center shadow-lg hover:scale-105 group"
            title="Comprar Agora"
          >
            {product.stock === 0 ? (
              <i className="ri-close-circle-line text-2xl"></i>
            ) : (
              <i className="ri-shopping-bag-3-fill text-2xl group-hover:animate-bounce"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
