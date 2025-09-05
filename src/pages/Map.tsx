import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, MapPin, Calendar, Users, Filter, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import GoogleMapComponent from '@/components/GoogleMap';
import { useToast } from '@/hooks/use-toast';

interface Market {
  market_id: string;
  market_name: string;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

interface User {
  id: string;
  display_name: string;
  latitude?: number;
  longitude?: number;
  permanent_latitude?: number;
  permanent_longitude?: number;
  toggle_latitude?: number;
  toggle_longitude?: number;
  location_visible: boolean;
}

interface MapPin {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  description?: string;
}

const Map = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [pins, setPins] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [locationToggle, setLocationToggle] = useState(false);
  const [showLocationVisible, setShowLocationVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (userData) {
            setCurrentUser(userData);
            setLocationToggle(userData.location_visible || false);
          }
        }

        // Fetch markets
        const { data: marketsData, error: marketsError } = await supabase
          .from('markets')
          .select('*')
          .eq('status', 'approved')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (marketsError) throw marketsError;

        const fetchedMarkets: Market[] = marketsData || [];
        const fetchedPins: MapPin[] = [];

        fetchedMarkets.forEach((market) => {
          if (market.latitude && market.longitude) {
            fetchedPins.push({
              id: market.market_id,
              position: {
                lat: Number(market.latitude),
                lng: Number(market.longitude),
              },
              title: market.market_name || 'Unnamed Market',
              description: market.description || '',
            });
          }
        });

        setMarkets(fetchedMarkets);
        setPins(fetchedPins);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load map data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleLocationToggle = async (checked: boolean) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ location_visible: checked })
        .eq('id', currentUser.id);

      if (error) throw error;

      setLocationToggle(checked);
      setCurrentUser({ ...currentUser, location_visible: checked });

      toast({
        title: checked ? "Location Visible" : "Location Hidden",
        description: checked 
          ? "Your location is now visible to other users" 
          : "Your location is now hidden from other users",
      });
    } catch (error) {
      console.error('Error updating location visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update location visibility",
        variant: "destructive",
      });
    }
  };

  const handleMapClick = async (position: { lat: number; lng: number }) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          toggle_latitude: position.lat,
          toggle_longitude: position.lng 
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      setCurrentUser({ 
        ...currentUser, 
        toggle_latitude: position.lat,
        toggle_longitude: position.lng 
      });

      toast({
        title: "Location Updated",
        description: "Your location marker has been placed",
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Market Map</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {locationToggle ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    <span>Location {locationToggle ? 'Visible' : 'Hidden'}</span>
                  </div>
                  <Switch
                    checked={locationToggle}
                    onCheckedChange={handleLocationToggle}
                  />
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowLocationVisible(!showLocationVisible)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Interactive Google Map */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Market Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMapComponent 
              pins={pins}
              onMapClick={handleMapClick}
              center={pins.length > 0 ? pins[0].position : undefined}
            />
          </CardContent>
        </Card>

        {/* Markets List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Markets with Locations ({markets.length})
            </h2>
            {currentUser && locationToggle && (
              <div className="text-sm text-muted-foreground">
                Click on the map to set your location marker
              </div>
            )}
          </div>
          
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