import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Package, TrendingUp, DollarSign, Users, Eye, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  product_id: string;
  product_name: string;
  description: string;
  price: number;
  unit: string;
  photo_url: string;
  is_active: boolean;
  created_at: string;
}

interface MarketApplication {
  market_id: string;
  status: string;
  market: {
    market_name: string;
    date: string;
  };
}

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [applications, setApplications] = useState<MarketApplication[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingApplications: 0,
    approvedMarkets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchVendorData();
  }, [user, navigate]);

  const fetchVendorData = async () => {
    if (!user) return;

    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })
        .limit(5);

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch market applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('market_vendors')
        .select(`
          market_id,
          status,
          markets:market_id (
            market_name,
            date
          )
        `)
        .eq('user_id', user.uid)
        .order('status');

      if (applicationsError) throw applicationsError;
      
      const formattedApplications = (applicationsData || []).map(app => ({
        market_id: app.market_id,
        status: app.status,
        market: Array.isArray(app.markets) ? app.markets[0] : app.markets,
      }));
      setApplications(formattedApplications);

      // Calculate stats
      const totalProducts = productsData?.length || 0;
      const activeProducts = productsData?.filter(p => p.is_active).length || 0;
      const pendingApplications = formattedApplications.filter(app => app.status === 'pending').length;
      const approvedMarkets = formattedApplications.filter(app => app.status === 'approved').length;

      setStats({
        totalProducts,
        activeProducts,
        pendingApplications,
        approvedMarkets,
      });
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast({
        title: "Error",
        description: "Failed to load vendor dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, unit: string) => {
    if (!price) return 'Price varies';
    return `$${price.toFixed(2)}${unit ? ` / ${unit}` : ''}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Vendor Dashboard</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                  <p className="text-2xl font-bold">{stats.activeProducts}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Applications</p>
                  <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved Markets</p>
                  <p className="text-2xl font-bold">{stats.approvedMarkets}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Products */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Products</CardTitle>
                <Button onClick={() => navigate('/products/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first product
                  </p>
                  <Button onClick={() => navigate('/products/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.product_id}
                      className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {product.photo_url ? (
                          <img
                            src={product.photo_url}
                            alt={product.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{product.product_name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-medium">
                            {formatPrice(product.price, product.unit)}
                          </span>
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/products/${product.product_id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/products/edit/${product.product_id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/vendor/products')}
                    >
                      View All Products
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Market Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Market Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No market applications yet
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/markets')}
                  >
                    Browse Markets
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={application.market_id}
                      className="p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">
                          {application.market?.market_name || 'Market'}
                        </h4>
                        <Badge variant={getStatusBadgeVariant(application.status)}>
                          {application.status}
                        </Badge>
                      </div>
                      {application.market?.date && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(application.market.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;