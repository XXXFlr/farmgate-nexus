import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Search, MapPin, Calendar, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Market {
  market_id: string;
  market_name: string;
  description: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

const Markets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMarkets(data || []);
    } catch (error) {
      console.error('Error fetching markets:', error);
      toast({
        title: "Error",
        description: "Failed to load markets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkets = markets.filter(market =>
    market.market_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Markets</h1>
          </div>
          <Button onClick={() => navigate('/markets/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Market
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Markets Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading markets...</p>
          </div>
        ) : filteredMarkets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? 'No markets found' : 'No markets yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Be the first to create a farmers market in your area'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate('/markets/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Market
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMarkets.map((market) => (
              <Card 
                key={market.market_id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/markets/${market.market_id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{market.market_name}</CardTitle>
                  {market.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {market.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(market.created_at).toLocaleDateString()}</span>
                    </div>
                    {market.latitude && market.longitude && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Location available</span>
                      </div>
                    )}
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Markets;