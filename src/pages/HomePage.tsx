import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus, Search, Map } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { format } from 'date-fns';
import { AppLayout } from '@/components/AppLayout';

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
    <AppLayout title="Farmers Markets">
      <div className="container mx-auto px-4 py-6">
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
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Markets List */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading markets...</p>
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No markets found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredMarkets.map((market) => (
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
    </AppLayout>
  );
};

export default HomePage;