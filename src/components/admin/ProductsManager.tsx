```jsx
import { useState, useEffect } from 'react';
import { useAdmin, Product } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Star, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabaseClient';

const ProductsManager = () => {
  const { fetchProducts, createProduct, updateProduct, deleteProduct } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: '',
    image_url: '',
    badge: '',
    badge_color: 'bg-blue-500',
    rating: '0',
    reviews_count: '0',
    in_stock: true,
  });

  useEffect(() => {
    loadProducts();
    // Cleanup object URLs on component unmount
    return () => {
      if (imagePreview && uploadType === 'file') {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke previous object URL if it exists
      if (imagePreview && uploadType === 'file') {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData({ ...formData, image_url: '' });
    }
  };

  const uploadImageToSupabase = async (file: File) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const { error } = await supabase.storage
        .from('product-images')
        .upload(`public/${fileName}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(`public/${fileName}`);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let finalImageUrl = formData.image_url;

      // Handle file upload if a file is selected
      if (uploadType === 'file' && imageFile) {
        finalImageUrl = await uploadImageToSupabase(imageFile);
      }

      const productData = {
        ...formData,
        image_url: finalImageUrl,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        rating: parseFloat(formData.rating),
        reviews_count: parseInt(formData.reviews_count),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      setIsDialogOpen(false);
      resetForm();
      loadProducts();
      toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      category: product.category,
      image_url: product.image_url || '',
      badge: product.badge || '',
      badge_color: product.badge_color || 'bg-blue-500',
      rating: product.rating.toString(),
      reviews_count: product.reviews_count.toString(),
      in_stock: product.in_stock,
    });
    setImagePreview(product.image_url || '');
    setImageFile(null);
    setUploadType(product.image_url ? 'url' : 'file');
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(id);
      loadProducts();
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    if (imagePreview && uploadType === 'file') {
      URL.revokeObjectURL(imagePreview);
    }
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      category: '',
      image_url: '',
      badge: '',
      badge_color: 'bg-blue-500',
      rating: '0',
      reviews_count: '0',
      in_stock: true,
    });
    setImageFile(null);
    setImagePreview('');
    setUploadType('url');
  };

  const badgeColors = [
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-green-500', label: 'Green' },
    { value: 'bg-red-500', label: 'Red' },
    { value: 'bg-purple-500', label: 'Purple' },
    { value: 'bg-yellow-500', label: 'Yellow' },
    { value: 'bg-gray-500', label: 'Gray' },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Products ({products.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update product information' : 'Create a new product for your store'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laptops">Laptops</SelectItem>
                      <SelectItem value="desktops">Desktops</SelectItem>
                      <SelectItem value="tablets">Tablets</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="components">Components</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (KES) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price (KES)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image Upload Method</Label>
                <Select
                  value={uploadType}
                  onValueChange={(value: 'url' | 'file') => {
                    if (imagePreview && uploadType === 'file') {
                      URL.revokeObjectURL(imagePreview);
                    }
                    setUploadType(value);
                    setImageFile(null);
                    setImagePreview('');
                    setFormData({ ...formData, image_url: '' });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select upload method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">Image URL</SelectItem>
                    <SelectItem value="file">Upload File</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {uploadType === 'url' ? (
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => {
                      const url = e.target.value;
                      setFormData({ ...formData, image_url: url });
                      setImagePreview(url);
                      setImageFile(null);
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded mt-2"
                      onError={() => setImagePreview('')} // Clear preview if URL is invalid
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="image_file">Upload Image</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="image_file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="badge">Badge Text</Label>
                  <Input
                    id="badge"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="badge_color">Badge Color</Label>
                  <Select
                    value={formData.badge_color}
                    onValueChange={(value) => setFormData({ ...formData, badge_color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select badge color" />
                    </SelectTrigger>
                    <SelectContent>
                      {badgeColors.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          {color.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviews_count">Reviews Count</Label>
                  <Input
                    id="reviews_count"
                    type="number"
                    min="0"
                    value={formData.reviews_count}
                    onChange={(e) => setFormData({ ...formData, reviews_count: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="in_stock">In Stock</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="in_stock"
                      checked={formData.in_stock}
                      onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.in_stock ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product<?xml version="1.0" encoding="UTF-8"?>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium">{product.name}</div>
                      {product.badge && (
                        <Badge className={`${product.badge_color} text-white text-xs`}>
                          {product.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{product.category}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span>KES {product.price.toLocaleString()}</span>
                    {product.original_price && (
                      <span className="text-xs text-muted-foreground line-through">
                        KES {product.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{product.rating}</span>
                    <span className="text-muted-foreground">({product.reviews_count})</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={product.in_stock ? "default" : "destructive"}>
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No products found. Create your first product to get started.
        </div>
      )}
    </div>
  );
};

export default ProductsManager;
```

### Key Changes
1. **Image Preview Fix**:
   - Updated `handleFileChange` to revoke previous object URLs before creating a new one, preventing memory leaks.
   - Modified the URL input handler to set `imagePreview` to the entered URL and clear `imageFile`.
   - Added an `onError` handler to the URL preview image to clear the preview if the URL is invalid (e.g., if it fails to load).
   - Added cleanup in `useEffect` and `resetForm` to revoke object URLs for file uploads when no longer needed.
   - Ensured the preview image is displayed for both URL and file uploads, with proper sizing and styling (`w-16 h-16 object-cover rounded`).

2. **Supabase Client Integration**:
   - Kept the import as `import { supabase } from '@/integrations/supabaseClient';` to match your provided `supabaseClient.ts`.
   - No changes to the Supabase storage logic (`uploadImageToSupabase`) since it was already working correctly with your client.

3. **TypeScript Enhancements**:
   - Added type annotations for `uploadType` (`'url' | 'file'`) and other state variables to ensure TypeScript compatibility.
   - Ensured event handlers (e.g., `handleFileChange`) are typed correctly.

4. **UI Improvements**:
   - Added a `placeholder` to the URL input for better user experience.
   - Maintained the preview image display for both upload methods, ensuring it updates dynamically when the URL or file changes.

### Setup Instructions
1. **Keep `supabaseClient.ts` As-Is**:
   - Your provided `supabaseClient.ts` with hardcoded credentials is unchanged:
     ```typescript
     import { createClient } from '@supabase/supabase-js';
     import type { Database } from './types';

     const SUPABASE_URL = "https://ttwhalhtwbwrplnwzyvu.supabase.co";
     const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0d2hhbGh0d2J3cnBsbnd6eXZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDI1NTUsImV4cCI6MjA2NzIxODU1NX0.ipn4vBipoVBQmBKc4dsTstk76l_WIcK9a09HTer3o4I";

     export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
       auth: {
         storage: localStorage,
         persistSession: true,
         autoRefreshToken: true,
       }
     });
     ```
   - **Security Warning**: Since the anon key is hardcoded and likely committed to your GitHub repository, this is a security risk. Anyone with access to the repository can use the key to interact with your Supabase project. Consider moving to environment variables (see below) or regenerating the anon key after securing the repository.

2. **Environment Variables (Recommended)**:
   - Although you're keeping the hardcoded credentials, I strongly recommend switching to environment variables to secure your project:
     - Create a `.env` file in the root directory:
       ```
       REACT_APP_SUPABASE_URL=https://ttwhalhtwbwrplnwzyvu.supabase.co
       REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0d2hhbGh0d2J3cnBsbnd6eXZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDI1NTUsImV4cCI6MjA2NzIxODU1NX0.ipn4vBipoVBQmBKc4dsTstk76l_WIcK9a09HTer3o4I
       ```
     - Update `supabaseClient.ts` to use:
       ```typescript
       const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
       const SUPABASE_PUBLISHABLE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

       if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
         throw new Error('Supabase URL and Anon Key must be provided in environment variables');
       }

       export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
         auth: {
           storage: localStorage,
           persistSession: true,
           autoRefreshToken: true,
         }
       });
       ```
     - Add `.env` to `.gitignore` to prevent committing sensitive data.

3. **Supabase Storage Setup**:
   - Ensure the `product-images` bucket exists in your Supabase project (under **Storage** in the dashboard).
   - Verify that the bucket has a `public` folder (created automatically on first upload to `public/`).
   - Set up storage policies in the Supabase dashboard:
     - Go to **Storage** > **Policies**.
     - Add a policy to allow uploads (e.g., `INSERT` permission for anon or authenticated users).
     - Add a policy to allow public read access for image URLs (e.g., `SELECT` permission for the `public` folder).

4. **Dependencies**:
   - Ensure `@supabase/supabase-js` is installed:
     ```bash
     npm install @supabase/supabase-js
     ```
   - Verify other dependencies (`lucide-react`, `sonner`, UI components) are installed and compatible.

5. **Restart Development Server**:
   - After updating `ProductsManager.jsx`, restart your development server:
     ```bash
     npm start
     ```
     or
     ```bash
     yarn start
     ```

6. **GitHub and Deployment**:
   - Since you're using GitHub, commit the updated `ProductsManager.jsx` to your repository.
   - **Security Note**: If you keep the hardcoded credentials in `supabaseClient.ts`, regenerate your Supabase anon key after moving to environment variables to prevent unauthorized access.
   - For deployment (e.g., Vercel, Netlify), add the Supabase URL and anon key as environment variables in the platform's settings if you switch to using `.env`.

### Testing the Image Preview
- **File Upload**:
  - Select "Upload File" in the form, choose an image, and verify the preview appears immediately.
  - The preview should show a 64x64 pixel image with rounded corners.
- **URL Input**:
  - Select "Image URL", enter a valid image URL, and verify the preview displays.
  - If the URL is invalid, the preview should disappear (handled by the `onError` event).
- **Switching Methods**:
  - Switch between "Image URL" and "Upload File" to ensure the preview resets correctly and no memory leaks occur.

### Troubleshooting
- **Image Preview Not Showing**:
  - For file uploads, ensure the file is a valid image (JPEG, PNG, etc.) and check the browser console for errors.
  - For URLs, verify the URL is accessible and includes the protocol (e.g., `https://`). Test with a known valid image URL.
  - Add `console.log(imagePreview)` in `handleFileChange` and the URL input's `onChange` to debug the preview state.
- **Supabase Upload Errors**:
  - Check the Supabase dashboard logs (**Storage** > **Logs**) for upload errors.
  - Ensure the `product-images` bucket exists and has correct permissions.
- **TypeScript Errors**:
  - Verify the `Product` type in `useAdmin` includes all required fields (e.g., `id`, `name`, `image_url`).
  - Ensure `Database` type in `supabaseClient.ts` is correctly defined.
- **GitHub Security**:
  - If you continue using hardcoded credentials, restrict repository access and regenerate the anon key after securing the project.

If you encounter specific errors (e.g., console logs, TypeScript issues, or Supabase errors), please share them, and I can provide targeted fixes. Let me know if you need help setting up Supabase policies or securing your GitHub repository!
