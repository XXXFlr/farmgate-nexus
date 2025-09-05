import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, MapPin, Package, Star, User, Store } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface Vendor {
  id: string;
  display_name: string | null;
  email: string;
  photo_url: string | null;
  description: string | null;
  country: string | null; 
  created_at: string;
  productCount?: number;
}

const Vendors = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      // Get all users who have products (making them vendors)
      const { data: vendorsWithProducts, error } = await supabase
        .from('users')
        .select(`
          *,
          products!inner(count)
        `)
        .not('products.product_id', 'is', null);

      if (error) throw error;

      // Count products for each vendor
      const vendorsWithCounts = await Promise.all(
        (vendorsWithProducts || []).map(async (vendor) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', vendor.id)
            .eq('is_active', true);

          return {
            ...vendor,
            productCount: count || 0
          };
        })
      );

      setVendors(vendorsWithCounts);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVendorClick = (vendor: Vendor) => {
    // Navigate to vendor's profile or products
    navigate(`/profile?vendor=${vendor.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Vendors</h1>
            </div>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-xs">
                {filteredVendors.length} Active
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 md:py-8 max-w-7xl mx-auto">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 
                'Try adjusting your search terms' : 
                'No active vendors available yet'
              }
            </p>
            {user && (
              <Button onClick={() => navigate('/products/create')}>
                <Package className="h-4 w-4 mr-2" />
                Become a Vendor
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor) => (
              <Card
                key={vendor.id}
                className="cursor-pointer hover:shadow-lg transition-shadow border-border"
                onClick={() => handleVendorClick(vendor)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {vendor.photo_url ? (
                        <img
                          src={vendor.photo_url}
                          alt={vendor.display_name || 'Vendor'}
                          className="w-12 h-12 rounded-full object-cover bg-muted"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold truncate">
                        {vendor.display_name || 'Vendor'}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted-foreground">4.8</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {vendor.productCount} Products
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {vendor.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {vendor.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{vendor.country || 'Location'}</span>
                    </div>
                    
                    <Button variant="outline" size="sm" className="text-xs">
                      View Store
                    </Button>
                  </div>
                  
                  {/* Featured Products Preview */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Package className="h-3 w-3" />
                      <span>Featured Products</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div 
                          key={i} 
                          className="w-8 h-8 bg-muted rounded border border-border flex-shrink-0"
                        />
                      ))}
                      {vendor.productCount && vendor.productCount > 3 && (
                        <div className="w-8 h-8 bg-muted rounded border border-border flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground">
                            +{vendor.productCount - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!loading && filteredVendors.length > 0 && (
          <div className="text-center mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Want to become a vendor?
            </h3>
            <p className="text-muted-foreground mb-4">
              Start selling your products to the local community
            </p>
            <Button onClick={() => navigate('/products/create')}>
              <Package className="h-4 w-4 mr-2" />
              Start Selling
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vendors;