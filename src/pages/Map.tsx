import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, MapPin, Calendar, Users, Filter, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import GoogleMapComponent from '@/components/GoogleMap';
import MapFilters, { FilterState } from '@/components/MapFilters';
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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    mainCategory: 'Markets',
    subCategory: '',
    vendorType: ''
  });

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
    if (!currentUser || !locationToggle) return;

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

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Here you would filter the pins based on the selected filters
    console.log('Filters changed:', newFilters);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Map Container */}
      <div className="absolute inset-0">
        <GoogleMapComponent 
          pins={pins}
          onMapClick={handleMapClick}
          center={pins.length > 0 ? pins[0].position : undefined}
        />
      </div>

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/90 backdrop-blur-sm border border-border/20"
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Location Toggle */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/20">
                <Switch
                  checked={locationToggle}
                  onCheckedChange={handleLocationToggle}
                />
                <div className="flex items-center gap-1 text-sm">
                  {locationToggle ? (
                    <Eye className="h-4 w-4 text-primary" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-foreground">
                    {locationToggle ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>
            )}

            {/* Filter Button */}
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/90 backdrop-blur-sm border border-border/20"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Location Instructions */}
        {currentUser && locationToggle && (
          <div className="mt-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/20 max-w-sm">
            <p className="text-sm text-muted-foreground">
              Click on the map to set your location marker
            </p>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <MapFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onFilterChange={handleFilterChange}
      />

      {/* Markets List Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 max-h-96 overflow-hidden">
        <Card className="bg-white/95 backdrop-blur-sm border border-border/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Markets ({markets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-muted-foreground ml-2">Loading...</p>
              </div>
            ) : markets.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No markets found</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/markets/create')}
                >
                  Create First Market
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {markets.slice(0, 3).map((market) => (
                  <div
                    key={market.market_id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/markets/${market.market_id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{market.market_name}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {market.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {market.latitude.toFixed(3)}, {market.longitude.toFixed(3)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(market.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
                {markets.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm">
                      View All {markets.length} Markets
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Map;