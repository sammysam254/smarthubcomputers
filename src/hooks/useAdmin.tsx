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
  image_url: string;
  images: string[];
  badge: string | null;
  badge_color: string | null;
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check admin status
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

  // File upload function
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
      if (!allowed.includes(file.type)) {
        throw new Error(`File type not allowed: ${file.type}`);
      }

      const filePath = `products/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      urls.push(publicUrl);
    }
    return urls;
  };

  // Product CRUD operations
  const fetchProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      let imageUrls: string[] = [];
      if (productData.images && productData.images.length > 0) {
        imageUrls = await uploadFiles(productData.images as unknown as File[]);
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          image_url: imageUrls[0] || productData.image_url,
          images: imageUrls.length > 0 ? imageUrls : [productData.image_url],
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Product created successfully');
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      let imageUrls: string[] = [];
      if (updates.images && updates.images.length > 0) {
        imageUrls = await uploadFiles(updates.images as unknown as File[]);
      }

      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          image_url: imageUrls[0] || updates.image_url,
          images: imageUrls.length > 0 ? imageUrls : updates.images,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Product updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Optional: Add image cleanup logic here if needed
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      throw error;
    }
  };

  return {
    isAdmin,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
