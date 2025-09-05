import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, MapPin, Heart, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import GoogleMapComponent from '@/components/GoogleMap';

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
  required_documents: string;
}

const MarketDetails = () => {
  const { marketId } = useParams();
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [market, setMarket] = useState<Market | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (marketId) {
      fetchMarket();
      if (user) {
        checkSavedStatus();
      }
    }
  }, [marketId, user]);

  const fetchMarket = async () => {
    try {
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .eq('market_id', marketId)
        .single();

      if (error) throw error;
      setMarket(data);
    } catch (error) {
      console.error('Error fetching market:', error);
      toast({
        title: "Error",
        description: "Failed to load market details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSavedStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_markets')
        .select('id')
        .eq('user_id', user?.uid)
        .eq('market_id', marketId)
        .single();

      setIsSaved(!!data);
    } catch (error) {
      // Market not saved, which is fine
    }
  };

  const toggleSaveMarket = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save markets",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        const { error } = await supabase
          .from('user_markets')
          .delete()
          .eq('user_id', user.uid)
          .eq('market_id', marketId);

        if (error) throw error;
        setIsSaved(false);
        toast({
          title: "Market Unsaved",
          description: "Market removed from your saved list",
        });
      } else {
        const { error } = await supabase
          .from('user_markets')
          .insert([{
            user_id: user.uid,
            market_id: marketId
          }]);

        if (error) throw error;
        setIsSaved(true);
        toast({
          title: "Market Saved",
          description: "Market added to your saved list",
        });
      }
    } catch (error) {
      console.error('Error toggling saved status:', error);
      toast({
        title: "Error",
        description: "Failed to update saved status",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date TBD';
    try {
      return format(new Date(dateString), 'EEEE, MMMM dd, yyyy');
    } catch {
      return 'Date TBD';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Time TBD';
    return timeString;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading market details...</p>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Market Not Found</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">The requested market could not be found.</p>
        </div>
      </div>
    );
  }

  const mapPins = market.latitude && market.longitude ? [{
    id: market.market_id,
    position: { lat: market.latitude, lng: market.longitude },
    title: market.market_name,
    description: market.description
  }] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Market Details</h1>
          <div className="ml-auto flex items-center gap-2">
            {user && user.uid === market.creator_id && (
              <Button variant="outline" onClick={() => navigate(`/edit-event/${market.market_id}`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {user && (
              <Button
                variant={isSaved ? "secondary" : "outline"}
                onClick={toggleSaveMarket}
                disabled={saving}
              >
                <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                {saving ? 'Saving...' : isSaved ? 'Saved' : 'Save Market'}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Market Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-3xl">{market.market_name}</CardTitle>
                <Badge variant="secondary">{market.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {market.description && (
                  <p className="text-muted-foreground text-lg">{market.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{formatDate(market.date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{formatTime(market.time)}</span>
                  </div>
                  
                  {market.latitude && market.longitude && (
                    <div className="flex items-center gap-3 md:col-span-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">
                        {market.latitude.toFixed(4)}, {market.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                {market.required_documents && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Required Documents for Vendors:</h3>
                    <p className="text-muted-foreground">{market.required_documents}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          {mapPins.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-lg overflow-hidden">
                  <GoogleMapComponent
                    pins={mapPins}
                    center={mapPins[0].position}
                    zoom={15}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketDetails;