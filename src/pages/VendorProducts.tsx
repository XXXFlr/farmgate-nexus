import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Package, Search, Edit, Eye, Trash2 } from 'lucide-react';
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
  stock: string;
  created_at: string;
}

const VendorProducts = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load your products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !isActive })
        .eq('product_id', productId);

      if (error) throw error;

      setProducts(prev => prev.map(product =>
        product.product_id === productId 
          ? { ...product, is_active: !isActive }
          : product
      ));

      toast({
        title: "Product Updated",
        description: `Product ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('product_id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(product => product.product_id !== productId));

      toast({
        title: "Product Deleted",
        description: "Product has been permanently deleted",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number, unit: string) => {
    if (!price) return 'Price varies';
    return `$${price.toFixed(2)}${unit ? ` / ${unit}` : ''}`;
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
          <Button variant="ghost" size="sm" onClick={() => navigate('/vendor/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">My Products</h1>
          <Button 
            onClick={() => navigate('/products/create')}
            className="ml-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search your products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 
                'Try adjusting your search query' : 
                'Start selling by adding your first product'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate('/products/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.product_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {product.photo_url ? (
                        <img
                          src={product.photo_url}
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold truncate">{product.product_name}</h3>
                          <p className="text-muted-foreground text-sm truncate">
                            {product.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-sm text-muted-foreground">Active</span>
                          <Switch
                            checked={product.is_active}
                            onCheckedChange={() => toggleProductStatus(product.product_id, product.is_active)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <span className="font-semibold text-primary">
                          {formatPrice(product.price, product.unit)}
                        </span>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {product.stock && (
                          <Badge variant="outline">{product.stock}</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/products/${product.product_id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/products/edit/${product.product_id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteProduct(product.product_id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {products.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Product Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <div className="text-sm text-muted-foreground">Total Products</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {products.filter(p => p.is_active).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {products.filter(p => !p.is_active).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Inactive</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {products.filter(p => p.price > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">With Pricing</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VendorProducts;