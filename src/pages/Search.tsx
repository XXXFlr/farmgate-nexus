import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Search as SearchIcon, MapPin, Package, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  name: string;
  description: string;
  type: 'market' | 'product' | 'vendor';
  price?: number;
  unit?: string;
  location?: string;
  date?: string;
  photo_url?: string;
  created_at: string;
}

const Search = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchTerm = query.toLowerCase();
      const allResults: SearchResult[] = [];

      // Search markets
      const { data: marketsData, error: marketsError } = await supabase
        .from('markets')
        .select('*')
        .or(`market_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('status', 'approved')
        .limit(20);

      if (marketsError) throw marketsError;

      marketsData?.forEach(market => {
        allResults.push({
          id: market.market_id,
          name: market.market_name,
          description: market.description || '',
          type: 'market',
          location: market.latitude && market.longitude ? 'Location available' : '',
          date: market.date,
          created_at: market.created_at,
        });
      });

      // Search products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .or(`product_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .limit(20);

      if (productsError) throw productsError;

      productsData?.forEach(product => {
        allResults.push({
          id: product.product_id,
          name: product.product_name,
          description: product.description || '',
          type: 'product',
          price: product.price,
          unit: product.unit,
          location: product.location,
          photo_url: product.photo_url,
          created_at: product.created_at,
        });
      });

      // Search vendors (users)
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('users')
        .select('*')
        .or(`display_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
        .limit(20);

      if (vendorsError) throw vendorsError;

      vendorsData?.forEach(vendor => {
        allResults.push({
          id: vendor.id,
          name: vendor.display_name || vendor.username || 'Unknown',
          description: vendor.description || `${vendor.role || 'Vendor'} from ${vendor.country || 'Unknown location'}`,
          type: 'vendor',
          location: vendor.country,
          photo_url: vendor.photo_url,
          created_at: vendor.created_at,
        });
      });

      // Sort by relevance (exact matches first, then by creation date)
      allResults.sort((a, b) => {
        const aExactMatch = a.name.toLowerCase().includes(searchTerm);
        const bExactMatch = b.name.toLowerCase().includes(searchTerm);
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setResults(allResults);
    } catch (error) {
      console.error('Error performing search:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const getFilteredResults = () => {
    if (activeTab === 'all') return results;
    return results.filter(result => result.type === activeTab);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'market': return <Calendar className="h-5 w-5" />;
      case 'product': return <Package className="h-5 w-5" />;
      case 'vendor': return <Users className="h-5 w-5" />;
      default: return <SearchIcon className="h-5 w-5" />;
    }
  };

  const getResultPath = (result: SearchResult) => {
    switch (result.type) {
      case 'market': return `/markets/${result.id}`;
      case 'product': return `/products/${result.id}`;
      case 'vendor': return `/vendor/${result.id}`;
      default: return '#';
    }
  };

  const formatPrice = (price: number, unit: string) => {
    if (!price) return '';
    return `$${price.toFixed(2)}${unit ? ` / ${unit}` : ''}`;
  };

  const filteredResults = getFilteredResults();
  const resultCounts = {
    all: results.length,
    market: results.filter(r => r.type === 'market').length,
    product: results.filter(r => r.type === 'product').length,
    vendor: results.filter(r => r.type === 'vendor').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Search</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search markets, products, vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({resultCounts.all})</TabsTrigger>
            <TabsTrigger value="market">Markets ({resultCounts.market})</TabsTrigger>
            <TabsTrigger value="product">Products ({resultCounts.product})</TabsTrigger>
            <TabsTrigger value="vendor">Vendors ({resultCounts.vendor})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No results found' : 'Start searching'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No ${activeTab === 'all' ? 'results' : activeTab + 's'} found for "${searchQuery}"`
                    : 'Enter a search term to find markets, products, and vendors'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <Card
                    key={`${result.type}-${result.id}`}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(getResultPath(result))}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Image/Icon */}
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {result.photo_url ? (
                            <img
                              src={result.photo_url}
                              alt={result.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            getResultIcon(result.type)
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold truncate">{result.name}</h3>
                            <Badge variant="outline" className="ml-2">
                              {result.type}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                            {result.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm">
                            {result.price && (
                              <span className="font-medium text-primary">
                                {formatPrice(result.price, result.unit || '')}
                              </span>
                            )}
                            
                            {result.location && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{result.location}</span>
                              </div>
                            )}
                            
                            {result.date && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(result.date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Search;