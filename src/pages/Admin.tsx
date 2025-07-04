
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Package, ShoppingCart, MessageSquare, Users, Megaphone, Zap, Ticket, Smartphone } from 'lucide-react';
import ProductsManager from '@/components/admin/ProductsManager';
import OrdersManager from '@/components/admin/OrdersManager';
import MessagesManager from '@/components/admin/MessagesManager';
import UsersManager from '@/components/admin/UsersManager';
import PromotionsManager from '@/components/admin/PromotionsManager';
import FlashSalesManager from '@/components/admin/FlashSalesManager';
import VouchersManager from '@/components/admin/VouchersManager';
import MpesaPaymentsManager from '@/components/admin/MpesaPaymentsManager';
import { toast } from 'sonner';

const Admin = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, loading } = useAdmin();

  useEffect(() => {
    // If not loading and either no user or not admin, redirect to auth
    if (!loading) {
      if (!user) {
        toast.error('You must be logged in to access the admin panel');
        navigate('/auth');
        return;
      }
      
      if (!isAdmin) {
        toast.error('You do not have admin privileges');
        navigate('/');
        return;
      }
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error('Failed to sign out');
      } else {
        toast.success('Signed out successfully');
        navigate('/');
      }
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  // Show loading state while checking admin status
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not admin (redirect will happen via useEffect)
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/e794c35d-09b9-447c-9ad8-265176240bde.png" 
                alt="SmartHub Computers" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">SmartHub Computers Management</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user.email}
              </span>
              <Button variant="outline" onClick={() => navigate('/')}>
                View Site
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="flash-sales" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Flash Sales</span>
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="flex items-center space-x-2">
              <Ticket className="h-4 w-4" />
              <span>Vouchers</span>
            </TabsTrigger>
            <TabsTrigger value="mpesa" className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>M-Pesa</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex items-center space-x-2">
              <Megaphone className="h-4 w-4" />
              <span>Promotions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Products Management</CardTitle>
                <CardDescription>
                  Add, edit, and delete products in your store
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders Management</CardTitle>
                <CardDescription>
                  View and manage customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrdersManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flash-sales">
            <Card>
              <CardHeader>
                <CardTitle>Flash Sales Management</CardTitle>
                <CardDescription>
                  Create and manage limited-time flash sales with special discounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FlashSalesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers">
            <Card>
              <CardHeader>
                <CardTitle>Voucher Management</CardTitle>
                <CardDescription>
                  Create and manage discount vouchers for customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VouchersManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mpesa">
            <Card>
              <CardHeader>
                <CardTitle>M-Pesa Payment Management</CardTitle>
                <CardDescription>
                  Review and confirm M-Pesa payments from customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MpesaPaymentsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Customer Messages</CardTitle>
                <CardDescription>
                  View and respond to customer inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MessagesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>
                  Manage user accounts and admin permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promotions">
            <Card>
              <CardHeader>
                <CardTitle>Promotional Content</CardTitle>
                <CardDescription>
                  Create and manage promotional banners and campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PromotionsManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
