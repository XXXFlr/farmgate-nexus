import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Market {
  market_id: string;
  market_name: string;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

const Map = () => {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const { data, error } = await supabase
          .from('markets')
          .select('*')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) throw error;
        setMarkets(data || []);
      } catch (error) {
        console.error('Error fetching markets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Market Map</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Map Placeholder */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="h-96 bg-muted flex items-center justify-center rounded-lg">
              <div className="text-center">
                <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  Interactive map coming soon
                </p>
                <p className="text-sm text-muted-foreground">
                  View markets with location data below
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Markets List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Markets with Locations ({markets.length})
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading markets...</p>
            </div>
          ) : markets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No markets with location data found
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/markets/create')}
                >
                  Create First Market
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {markets.map((market) => (
                <Card key={market.market_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{market.market_name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {market.description}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/markets/${market.market_id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {market.latitude.toFixed(4)}, {market.longitude.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Created {new Date(market.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;