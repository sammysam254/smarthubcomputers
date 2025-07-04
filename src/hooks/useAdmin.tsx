import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string;
  image_url: string | null;
  badge: string | null;
  badge_color: string | null;
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  products?: Product;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  replied_at: string | null;
  created_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  user_roles?: Array<{ role: string }>;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking admin status:', error);
        }

        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Product management
  const fetchProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...product, created_by: user?.id }])
      .select()
      .single();

    if (error) throw error;
    toast.success('Product created successfully');
    return data;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    toast.success('Product updated successfully');
    return data;
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success('Product deleted successfully');
  };

  // Order management
  const fetchOrders = async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products:product_id (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    toast.success('Order status updated successfully');
    return data;
  };

  // Message management
  const fetchMessages = async (): Promise<Message[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const updateMessageStatus = async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('messages')
      .update({ 
        status,
        replied_at: status === 'replied' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    toast.success('Message status updated successfully');
    return data;
  };

  // User management
  const fetchUsers = async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Fetch user roles separately
    const usersWithRoles = await Promise.all(
      (data || []).map(async (user) => {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.user_id);
        
        return { ...user, user_roles: roles || [] };
      })
    );
    
    return usersWithRoles;
  };

  const makeUserAdmin = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role: 'admin' }])
      .select()
      .single();

    if (error) throw error;
    toast.success('User promoted to admin successfully');
    return data;
  };

  const removeUserAdmin = async (userId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (error) throw error;
    toast.success('Admin role removed successfully');
  };

  // Promotion management
  const fetchPromotions = async (): Promise<Promotion[]> => {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const createPromotion = async (promotion: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('promotions')
      .insert([{ ...promotion, created_by: user?.id }])
      .select()
      .single();

    if (error) throw error;
    toast.success('Promotion created successfully');
    return data;
  };

  const updatePromotion = async (id: string, updates: Partial<Promotion>) => {
    const { data, error } = await supabase
      .from('promotions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    toast.success('Promotion updated successfully');
    return data;
  };

  const deletePromotion = async (id: string) => {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success('Promotion deleted successfully');
  };

  return {
    isAdmin,
    loading,
    // Products
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    // Orders
    fetchOrders,
    updateOrderStatus,
    // Messages
    fetchMessages,
    updateMessageStatus,
    // Users
    fetchUsers,
    makeUserAdmin,
    removeUserAdmin,
    // Promotions
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
  };
};