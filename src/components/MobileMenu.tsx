import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogOut, ShoppingCart, Package, Home, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/badge';

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Search, label: 'Search', path: '/products?search=' },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/e794c35d-09b9-447c-9ad8-265176240bde.png" 
              alt="SmartHub Computers" 
              className="h-8 w-auto"
            />
            <span>Menu</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-8 space-y-4">
          {/* User Section */}
          {user ? (
            <div className="border-b pb-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Signed in</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleNavigation('/profile')}
                  className="flex-1 justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-b pb-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleNavigation('/auth')}
              >
                Sign In
              </Button>
            </div>
          )}

          {/* Cart */}
          <div className="border-b pb-4">
            <Button 
              variant="ghost" 
              className="w-full justify-between" 
              onClick={() => handleNavigation('/cart')}
            >
              <div className="flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Shopping Cart
              </div>
              {totalItems > 0 && (
                <Badge variant="secondary">{totalItems}</Badge>
              )}
            </Button>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground px-3">Navigation</h3>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground px-3">Categories</h3>
            {[
              { label: 'Laptops', path: '/products?category=laptops' },
              { label: 'Desktops', path: '/products?category=desktops' },
              { label: 'Components', path: '/products?category=components' },
              { label: 'Gaming', path: '/products?category=gaming' },
              { label: 'Peripherals', path: '/products?category=peripherals' },
              { label: 'Audio', path: '/products?category=audio' },
            ].map((category) => (
              <Button
                key={category.path}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => handleNavigation(category.path)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;