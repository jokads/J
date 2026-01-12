import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { Product, supabase } from '../../lib/supabase';

export default function Favoritos() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    loadFavorites();
    window.addEventListener('storage', loadFavorites);
    return () => window.removeEventListener('storage', loadFavorites);
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      } else {
        const localEmail = localStorage.getItem('userEmail');
        if (localEmail) {
          setUserEmail(localEmail);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
    }
  };

  const loadFavorites = () => {
    try {
      const favoritesData = localStorage.getItem('favorites');
      if (favoritesData) {
        const parsedFavorites = JSON.parse(favoritesData);
        if (Array.isArray(parsedFavorites)) {
          // Filtrar apenas favoritos do usuário atual
          const userFavorites = filterUserFavorites(parsedFavorites);
          setFavorites(userFavorites);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setFavorites([]);
    }
  };

  const filterUserFavorites = (favorites: any[]) => {
    if (!userEmail) return favorites;
    
    // Filtrar itens que pertencem ao usuário atual
    return favorites.filter((item: any) => {
      // Se o item não tem userEmail, é de antes da implementação
      if (!item.userEmail) return true;
      // Se tem, verificar se é do usuário atual
      return item.userEmail === userEmail;
    });
  };

  const removeFromFavorites = (productId: string) => {
    try {
      const updatedFavorites = favorites.filter((item) => item.id !== productId);
      setFavorites(updatedFavorites);
      
      // Salvar com email do usuário
      const favoritesWithUser = updatedFavorites.map(item => ({
        ...item,
        userEmail: userEmail
      }));
      
      localStorage.setItem('favorites', JSON.stringify(favoritesWithUser));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
    }
  };

  const addToCart = (product: Product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find((item: any) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1, userEmail: userEmail });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      alert('Produto adicionado ao carrinho!');
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    }
  };

  const buyNow = (product: Product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find((item: any) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1, userEmail: userEmail });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      navigate('/checkout');
    } catch (error) {
      console.error('Erro ao comprar agora:', error);
    }
  };

  const clearAllFavorites = () => {
    if (confirm('Tem certeza que deseja remover todos os favoritos?')) {
      setFavorites([]);
      
      // Manter favoritos de outros usuários
      const allFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const otherUsersFavorites = allFavorites.filter((item: any) => 
        item.userEmail && item.userEmail !== userEmail
      );
      
      localStorage.setItem('favorites', JSON.stringify(otherUsersFavorites));
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 pb-20">
        {/* Header */}
        <div className="bg-black py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-5xl font-bold text-white mb-4">
              MEUS <span className="text-red-500">FAVORITOS</span>
            </h1>
            <p className="text-gray-400 text-lg">
              {favorites.length} {favorites.length === 1 ? 'produto favorito' : 'produtos favoritos'}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12">
          {favorites.length === 0 ? (
            <div className="text-center py-20">
              <i className="ri-heart-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-600 text-lg mb-6">Você ainda não tem favoritos</p>
              <Link
                to="/produtos"
                className="inline-block px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-colors cursor-pointer whitespace-nowrap shadow-lg"
              >
                EXPLORAR PRODUTOS
              </Link>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  Mostrando <strong>{favorites.length}</strong> {favorites.length === 1 ? 'produto' : 'produtos'}
                </p>
                <button
                  onClick={clearAllFavorites}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-delete-bin-line mr-2"></i>
                  LIMPAR TUDO
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {favorites.map((product) => (
                  <div key={product.id} className="group relative">
                    <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-red-500/20 transition-all">
                      <Link to={`/produto/${product.id}`} className="block">
                        <div className="relative w-full h-64 bg-white">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain p-4"
                          />
                          {product.featured && (
                            <div className="absolute top-2 right-2 px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full">
                              DESTAQUE
                            </div>
                          )}
                          {product.stock < 5 && product.stock > 0 && (
                            <div className="absolute top-2 left-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                              ÚLTIMAS UNIDADES
                            </div>
                          )}
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white font-bold">ESGOTADO</span>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="p-4">
                        <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                        <Link to={`/produto/${product.id}`}>
                          <h3 className="text-black font-semibold mb-2 hover:text-red-500 transition-colors line-clamp-2 cursor-pointer">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`ri-star-${
                                  i < Math.floor(product.rating) ? 'fill' : 'line'
                                } text-red-500 text-sm`}
                              ></i>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            ({product.reviews_count})
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-black mb-3">
                          €{product.price.toFixed(2)}
                        </p>

                        {/* Ações Rápidas */}
                        <div className="space-y-2">
                          <button
                            onClick={() => buyNow(product)}
                            disabled={product.stock === 0}
                            className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm shadow-lg"
                          >
                            <i className="ri-shopping-bag-3-line mr-2"></i>
                            COMPRAR JÁ
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => addToCart(product)}
                              disabled={product.stock === 0}
                              className="px-3 py-2 bg-black text-red-500 font-semibold rounded-lg hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-xs"
                            >
                              <i className="ri-shopping-cart-line mr-1"></i>
                              CARRINHO
                            </button>
                            <button
                              onClick={() => removeFromFavorites(product.id)}
                              className="px-3 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap text-xs"
                            >
                              <i className="ri-heart-fill mr-1"></i>
                              REMOVER
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
