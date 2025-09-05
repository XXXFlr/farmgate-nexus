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

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { toggleSidebar } = useSidebarContext();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarkets();
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Always visible on mobile */}
      <header className="bg-primary text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-50 md:hidden">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold">Home</h1>
      </header>

      <div className="container mx-auto px-4 py-6 flex-1">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/map')}>
              <Map className="h-4 w-4 mr-2" />
              Map View
            </Button>
          </div>
          {user && (
            <Button onClick={() => navigate('/add-event')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Market
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border border-input rounded-xl"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                console.log(`Searching for: ${searchQuery}`);
              }
            }}
          />
        </div>

        {/* Welcome Content */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading markets...</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-foreground mb-4">
                Welcome to the Home Page
              </h2>
              <p className="text-muted-foreground mb-8">
                Discover local farmers markets and fresh produce in your area
              </p>
              
              {/* Featured Markets */}
              {filteredMarkets.length > 0 && (
                <div className="grid gap-6 mt-8">
                  {filteredMarkets.slice(0, 3).map((market) => (
                    <Card 
                      key={market.market_id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/market/${market.market_id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-xl">{market.market_name}</CardTitle>
                          <Badge variant="secondary">{market.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {market.description && (
                            <p className="text-muted-foreground">{market.description}</p>
                          )}
                          
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(market.date)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(market.time)}</span>
                            </div>
                            
                            {market.latitude && market.longitude && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>Location Available</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;