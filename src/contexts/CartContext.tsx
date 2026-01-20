import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Product } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cart')
        .select('id, quantity, product_id, products(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      const cartItems: CartItem[] = (data || []).map((item: any) => ({
        id: item.id,
        product: item.products,
        quantity: item.quantity
      }));

      setItems(cartItems);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number) => {
    if (!user) {
      alert('Faça login para adicionar produtos ao carrinho');
      return;
    }

    try {
      const existingItem = items.find(item => item.product.id === product.id);

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        const { data, error } = await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity
          })
          .select()
          .single();

        if (error) throw error;

        setItems([...items, { id: data.id, product, quantity }]);
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setItems([]);
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      throw error;
    }
  };

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      loading, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      total,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider');
  }
  return context;
}
