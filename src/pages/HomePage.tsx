import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus, Search, Map, Menu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { format } from 'date-fns';
import { useSidebarContext } from '@/components/AppLayout';
import { HeroSection } from '@/components/widgets/HeroSection';
import { VendorsSection } from '@/components/widgets/VendorsSection';
import { FarmsSection } from '@/components/widgets/FarmsSection';

interface Market {
  market_id: string;
  market_name: string;
  description: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  status: string;
  creator_id: string;
}

interface FarmUser {
  id: string;
  display_name: string | null;
  photo_url: string | null;
}

interface Product {
  product_id: string;
  product_name: string;
  description: string | null;
  price: number | null;
  photo_url: string | null;
  user_id: string;
  stock: string | null;
  unit: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { toggleSidebar } = useSidebarContext();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [farmUsers, setFarmUsers] = useState<FarmUser[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [farmsLoading, setFarmsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    fetchMarkets();
    fetchFarmUsers();
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = markets.filter(market =>
      market.market_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMarkets(filtered);
  }, [markets, searchQuery]);

  const fetchMarkets = async () => {
    try {
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .eq('status', 'approved')
        .order('date', { ascending: true });

      if (error) throw error;
      setMarkets(data || []);
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmUsers = async () => {
    try {
      // First, get the "Farms" category ID
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('category_id')
        .eq('category_name', 'Farms')
        .single();

      if (categoryError || !categoryData) {
        console.error('Error fetching Farms category:', categoryError);
        setFarmsLoading(false);
        return;
      }

      // Then get users who are categorized as farms
      const { data: userCategoryData, error: userCategoryError } = await supabase
        .from('user_categories')
        .select(`
          user_id,
          users!inner(
            id,
            display_name,
            photo_url
          )
        `)
        .eq('category_id', categoryData.category_id);

      if (userCategoryError) {
        console.error('Error fetching farm users:', userCategoryError);
        setFarmsLoading(false);
        return;
      }

      // Transform the data to match our interface
      const farmUsersList: FarmUser[] = userCategoryData?.map((item: any) => ({
        id: item.users.id,
        display_name: item.users.display_name,
        photo_url: item.users.photo_url
      })) || [];

      setFarmUsers(farmUsersList);
    } catch (error) {
      console.error('Error fetching farm users:', error);
    } finally {
      setFarmsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date TBD';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Date TBD';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Time TBD';
    return timeString;
  };

  const categories = [
    'All', 'Markets', 'Farms', 'Home Growers', 'Food Trucks', 'Drinks', 'Food'
  ];

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #fdf6e3 0%, #f5f1e8 100%)'
    }}>
      {/* Botanical Pattern Background */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Mobile App Bar with Profile Avatar and Search - Only visible on mobile */}
      <div className="md:hidden">
        <div 
          className="relative h-24 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://eeqmvfbsupumublzxlil.supabase.co/storage/v1/object/public/roots/background.jpg')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
          <div className="relative flex items-center justify-between h-full px-4 pt-10">
            {/* Profile Avatar with Flutter styling */}
            <button 
              onClick={toggleSidebar}
              className="w-12 h-12 rounded-full border-2 border-accent flex-shrink-0 p-0.5 transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'rgba(57, 210, 192, 0.3)', // Color(0x4C39D2C0) converted to rgba
              }}
            >
              <img
                src={user?.photoURL || 'https://eeqmvfbsupumublzxlil.supabase.co/storage/v1/object/public/roots//man.png'}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://eeqmvfbsupumublzxlil.supabase.co/storage/v1/object/public/roots//man.png';
                }}
              />
            </button>

            {/* Search Bar */}
            <div className="flex-1 mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <header className="hidden md:flex bg-teal-500 text-white px-4 py-3 items-center gap-3 sticky top-0 z-50">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="bg-teal-600 text-white px-3 py-1 rounded text-sm font-medium">
          HomePage
        </div>
      </header>

      <div className="px-4 py-4 pb-20 md:pb-4 relative z-10 max-w-7xl mx-auto">

        {/* Category Tabs */}
        <div className="flex items-center overflow-x-auto mb-4 scrollbar-hide mobile-scroll">
          {categories.map((category, index) => (
            <div 
              key={category}
              className={`flex items-center justify-center ${
                index === 0 ? 'px-4' : 'pr-4'
              } flex-shrink-0`}
            >
              <span className="text-foreground text-base md:text-lg font-medium whitespace-nowrap">
                {category}
              </span>
            </div>
          ))}
        </div>

        {/* Hero Section */}
        <HeroSection />

        {/* Vendors Section */}
        <VendorsSection />

        {/* Farms Section */}
        <FarmsSection farmUsers={farmUsers} loading={farmsLoading} />

        {/* Products Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-foreground">Fresh Products</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/products')}
              className="text-muted-foreground"
            >
              View All
            </Button>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
              {products.map((product) => (
                <Card 
                  key={product.product_id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-border"
                  onClick={() => navigate(`/product/${product.product_id}`)}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={product.photo_url || 'https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                          alt={product.product_name}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg bg-muted"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground truncate">
                              {product.product_name}
                            </h4>
                            {product.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {product.location && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-20">{product.location}</span>
                                </div>
                              )}
                              {product.stock && (
                                <Badge variant="secondary" className="text-xs">
                                  {product.stock} {product.unit || 'units'}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right flex-shrink-0 ml-3">
                            {product.price && (
                              <div className="font-bold text-primary text-sm md:text-base">
                                ${product.price.toFixed(2)}
                                {product.unit && (
                                  <span className="text-xs md:text-sm text-muted-foreground">
                                    /{product.unit}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products available at the moment.</p>
            </div>
          )}
        </div>

        {/* Featured Markets */}
        {filteredMarkets.length > 0 && (
          <div className="mb-6">
            <div className="grid gap-4">
              {filteredMarkets.slice(0, 2).map((market) => (
                <div 
                  key={market.market_id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/market/${market.market_id}`)}
                >
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')`
                    }}
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(market.date)} • {formatTime(market.time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span>Location</span>
                    </div>
                    <p className="text-gray-700 font-semibold mb-2">@[Display Name]</p>
                    <p className="text-gray-600 mb-3">{market.description || 'Market Description'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-amber-600 rounded"></div>
                        <span>35</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-400 rounded"></div>
                        <span>897</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Produce Section */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Produce</h3>
          <div className="grid gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex gap-4">
                <div 
                  className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80')`
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-lg mb-1">Apple Bananas</h4>
                  <p className="text-sm text-gray-600 mb-1">@[Display Name]</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <MapPin className="h-3 w-3 text-red-500" />
                    <span>Address</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">$0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;