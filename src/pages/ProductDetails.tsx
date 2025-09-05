import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Heart, MessageCircle, MapPin, Package, User } from 'lucide-react';
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
  user_id: string;
  category_id: string;
  location: string;
  stock: string;
  is_active: boolean;
  created_at: string;
}

interface ProductPhoto {
  id: string;
  file_url: string;
  caption: string;
  is_main: boolean;
}

interface Category {
  category_id: string;
  category_name: string;
}

interface Vendor {
  id: string;
  display_name: string;
  email: string;
}

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [photos, setPhotos] = useState<ProductPhoto[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchProductPhotos();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error) throw error;
      setProduct(data);

      // Fetch category
      if (data.category_id) {
        const { data: categoryData } = await supabase
          .from('product_categories')
          .select('*')
          .eq('category_id', data.category_id)
          .single();
        
        if (categoryData) setCategory(categoryData);
      }

      // Fetch vendor info
      const { data: vendorData } = await supabase
        .from('users')
        .select('id, display_name, email')
        .eq('id', data.user_id)
        .single();
      
      if (vendorData) setVendor(vendorData);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('product_photos')
        .select('*')
        .eq('product_id', productId)
        .order('is_main', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching product photos:', error);
    }
  };

  const formatPrice = (price: number, unit: string) => {
    if (!price) return 'Price varies';
    return `$${price.toFixed(2)}${unit ? ` / ${unit}` : ''}`;
  };

  const handleContactVendor = () => {
    // TODO: Implement messaging system
    toast({
      title: "Feature Coming Soon",
      description: "Direct messaging will be available soon!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Product Not Found</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">The requested product could not be found.</p>
        </div>
      </div>
    );
  }

  const displayImages = photos.length > 0 ? photos : (product.photo_url ? [{ file_url: product.photo_url }] : []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Image Gallery Section */}
      <div className="relative h-96 overflow-hidden">
        {displayImages.length > 0 ? (
          <img
            src={displayImages[currentImageIndex]?.file_url || product.photo_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800';
            }}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Package className="h-32 w-32 text-muted-foreground" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        
        {/* Navigation Buttons */}
        <div className="absolute top-4 left-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 bg-white/90 hover:bg-white shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Edit Button for Owner */}
        {user && user.uid === product.user_id && (
          <div className="absolute top-4 right-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/products/edit/${product.product_id}`)}
              className="gap-2 bg-white/90 hover:bg-white shadow-lg"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        )}

        {/* Image Navigation */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-2">
              {displayImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 pb-8 -mt-16 relative z-10">
        <div className="bg-white rounded-t-3xl shadow-lg">
          <div className="p-6">
            {/* Product Title and Info */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.product_name}</h1>
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.price, product.unit)}
                </span>
                {category && (
                  <Badge variant="secondary">{category.category_name}</Badge>
                )}
                {product.stock && (
                  <Badge variant="outline">{product.stock}</Badge>
                )}
              </div>
            </div>

            {/* Vendor Section */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{vendor?.display_name || 'Vendor'}</h3>
                      <p className="text-sm text-muted-foreground">Local Farmer</p>
                    </div>
                  </div>
                  <Button onClick={handleContactVendor} size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">About this product</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Location */}
            {product.location && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Location</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{product.location}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                Contact Vendor
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <Heart className="h-4 w-4 mr-2" />
                Save to Favorites
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;