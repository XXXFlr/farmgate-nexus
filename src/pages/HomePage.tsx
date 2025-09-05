import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Plus, Store, ShoppingBag, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { toast } from "sonner";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredMarkets] = useState([]);
  const [recentProducts] = useState([]);
  const [loading] = useState(false);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-8 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
            Welcome to Local Markets
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-primary-foreground/90">
            Discover fresh, local products from farmers markets near you
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 bg-white/90 backdrop-blur"
              />
            </div>
            <Button onClick={handleSearch} size="lg" variant="secondary">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-6 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/markets")}>
              <CardContent className="p-6 text-center">
                <Store className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold">Browse Markets</h3>
                <p className="text-sm text-muted-foreground">Find local farmers markets</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/products")}>
              <CardContent className="p-6 text-center">
                <ShoppingBag className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold">Shop Products</h3>
                <p className="text-sm text-muted-foreground">Discover fresh products</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/map")}>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold">Map View</h3>
                <p className="text-sm text-muted-foreground">Explore nearby markets</p>
              </CardContent>
            </Card>
            
            {user && (
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/vendor/dashboard")}>
                <CardContent className="p-6 text-center">
                  <Plus className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold">Vendor Portal</h3>
                  <p className="text-sm text-muted-foreground">Manage your business</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Featured Markets */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Markets</h2>
            <Button variant="outline" onClick={() => navigate("/markets")}>
              View All Markets
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {featuredMarkets.map((market) => (
              <Card key={market.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/markets/${market.id}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{market.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-2">
                        <MapPin className="h-4 w-4" />
                        {market.location}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {market.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {market.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Fresh Products</h2>
            <Button variant="outline" onClick={() => navigate("/products")}>
              View All Products
            </Button>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recentProducts.map((product) => (
              <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/products/${product.id}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>
                        {product.markets?.name}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      ${product.price}
                    </Badge>
                  </div>
                </CardHeader>
                {product.description && (
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!user && (
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Connect with local farmers and discover the freshest products
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{featuredMarkets.length}+</h3>
              <p className="text-muted-foreground">Active Markets</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{recentProducts.length}+</h3>
              <p className="text-muted-foreground">Fresh Products</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">50+</h3>
              <p className="text-muted-foreground">Local Vendors</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">10+</h3>
              <p className="text-muted-foreground">Cities Covered</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;