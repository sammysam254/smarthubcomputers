
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Zap } from 'lucide-react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import Footer from '@/components/Footer';

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  active: boolean;
}

const Index = () => {
  const { user } = useAuth();
  const { isAdmin, fetchPromotions } = useAdmin();
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    loadActivePromotions();
  }, []);

  const loadActivePromotions = async () => {
    try {
      const promotions = await fetchPromotions();
      const active = promotions.filter(promo => promo.active);
      setActivePromotions(active);
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  };

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

        {/* Active Promotions Section */}
        {activePromotions.length > 0 && (
          <section className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">🎉 Special Promotions</h2>
              <p className="text-muted-foreground">Don't miss out on these amazing deals!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePromotions.map((promotion) => (
                <Card key={promotion.id} className="group hover:shadow-lg transition-all duration-300 border-2 border-primary/20 hover:border-primary/40">
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Hero Video/Image */}
                      {promotion.image_url ? (
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={promotion.image_url}
                            alt={promotion.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Video Play Overlay */}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/90 rounded-full p-3">
                              <Play className="h-8 w-8 text-primary" />
                            </div>
                          </div>
                          {/* Promotional Badge */}
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-red-500 hover:bg-red-600 animate-pulse">
                              🔥 HOT DEAL
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
                          <div className="text-center">
                            <Zap className="h-12 w-12 text-primary mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Promotional Content</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {promotion.title}
                      </h3>
                      {promotion.description && (
                        <p className="text-muted-foreground text-sm mb-4">
                          {promotion.description}
                        </p>
                      )}
                      
                      {promotion.link_url && (
                        <Button asChild className="w-full">
                          <a 
                            href={promotion.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Learn More
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Flash Sale Banner */}
        <section className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-8 mb-8">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 mr-2 animate-pulse" />
              <h2 className="text-3xl font-bold">⚡ Flash Sales Active!</h2>
            </div>
            <p className="text-xl mb-6">Limited time offers with incredible discounts!</p>
            <Link to="/flash-sales">
              <Button size="lg" variant="secondary" className="bg-white text-red-600 hover:bg-gray-100">
                <Zap className="h-5 w-5 mr-2" />
                Shop Flash Sales Now
              </Button>
            </Link>
          </div>
        </section>
        
        <Categories />

      </main>
      <Footer />
    </div>
  );
};

export default Index;
