
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import FeaturedProducts from '@/components/FeaturedProducts';
import Footer from '@/components/Footer';

const Index = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        
        {/* Admin Debug Section - Only show to admin users */}
        {user && isAdmin && (
          <div className="container mx-auto px-4 py-4 bg-blue-50 border border-blue-200 rounded-lg mb-8">
            <div className="text-center">
              <p className="text-sm text-blue-800 mb-2">
                Logged in as: {user.email}
              </p>
              <p className="text-sm text-blue-800 mb-4">
                Admin status: {isAdmin ? 'Yes' : 'No'}
              </p>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="default" size="sm">
                    Go to Admin Panel
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
        
        <Categories />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
