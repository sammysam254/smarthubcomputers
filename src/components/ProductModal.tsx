
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category: string;
  rating: number | null;
  reviews_count: number | null;
  badge: string | null;
  badge_color: string | null;
  in_stock: boolean | null;
  description: string | null;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            Product details and specifications
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop&crop=center'}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            
            {product.badge && (
              <Badge className={`absolute top-3 left-3 ${product.badge_color || 'bg-primary'} text-white`}>
                {product.badge}
              </Badge>
            )}
            
            {!product.in_stock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <Badge variant="destructive">Out of Stock</Badge>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-muted-foreground">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            {product.rating && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating!) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviews_count || 0} reviews)
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">
                KES {product.price.toLocaleString()}
              </span>
              {product.original_price && (
                <span className="text-sm text-muted-foreground line-through">
                  KES {product.original_price.toLocaleString()}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Category:</strong> {product.category}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Stock:</strong> {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>

            <Button
              className="w-full"
              onClick={handleAddToCart}
              disabled={!product.in_stock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
