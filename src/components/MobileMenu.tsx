
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Home, Package, Zap, User, Package2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user } = useAuth();

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/flash-sales', label: 'Flash Sales', icon: Zap },
    ...(user ? [{ href: '/my-orders', label: 'My Orders', icon: Package2 }] : []),
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/e794c35d-09b9-447c-9ad8-265176240bde.png" 
              alt="SmartHub Computers" 
              className="h-8 w-auto"
            />
            <span>SmartHub Computers</span>
          </SheetTitle>
        </SheetHeader>
        
        <nav className="flex flex-col space-y-4 mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {user ? (
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-3 p-3">
                <User className="h-5 w-5" />
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
            </div>
          ) : (
            <Link to="/auth" onClick={onClose}>
              <Button className="w-full">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
