import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, MapPin, Heart, Edit, UserPlus, Mail, Settings, MoreHorizontal } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-100">
      {/* Hero Image Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src="https://assets.site-static.com/userFiles/2805/image/Blog_Post_Images/Farmers_Markets_in_Honolulu_Oahu/Farmers_MKT_iStock-183802659_s.jpg"
          alt={market.market_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-transparent to-amber-200/60" />
        
        {/* Navigation Buttons */}
        <div className="absolute top-11 left-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 bg-white/90 hover:bg-white shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Edit Button for Creator */}
        {user && user.uid === market.creator_id && (
          <div className="absolute top-11 right-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/edit-event/${market.market_id}`)}
              className="gap-2 bg-white/90 hover:bg-white shadow-lg"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 pb-8 -mt-16 relative z-10">
        <div className="bg-white rounded-t-3xl shadow-lg">
          <div className="p-6">
            {/* Market Title and Info */}
            <div className="mb-6">
              <h1 className="text-4xl font-semibold text-gray-900 mb-2">{market.market_name}</h1>
              <p className="text-base text-gray-600 mb-4">
                Mon, Jan 1, 1:00 AM - 2:00 AM
              </p>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-medium text-gray-900 ml-2">Free</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-3 mb-6">
              <div className="flex flex-col items-center bg-white rounded-lg border border-gray-200 p-3 w-20 h-15 shadow-sm">
                <UserPlus className="h-6 w-6 text-gray-700 mb-1" />
                <span className="text-xs text-gray-700 text-center">Invite</span>
              </div>
              <div className="flex flex-col items-center bg-white rounded-lg border border-gray-200 p-3 w-20 h-15 shadow-sm">
                <Mail className="h-6 w-6 text-gray-700 mb-1" />
                <span className="text-xs text-gray-700 text-center">Contact</span>
              </div>
              <div className="flex flex-col items-center bg-white rounded-lg border border-gray-200 p-3 w-20 h-15 shadow-sm">
                <Settings className="h-6 w-6 text-gray-700 mb-1" />
                <span className="text-xs text-gray-700 text-center">Manage</span>
              </div>
              <div className="flex flex-col items-center bg-white rounded-lg border border-gray-200 p-3 w-20 h-15 shadow-sm">
                <MoreHorizontal className="h-6 w-6 text-gray-700 mb-1" />
                <span className="text-xs text-gray-700 text-center">More</span>
              </div>
            </div>

            {/* Location Section */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-2">Location</h3>
              <div className="border-t-2 border-gray-200 pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-6 w-6 text-red-500" />
                  <span className="text-sm text-gray-700">1234 Ilalo St, Honolulu, HI 96797, USA</span>
                </div>
                {market.latitude && market.longitude && (
                  <div className="h-24 rounded-lg overflow-hidden border bg-gray-100">
                    <GoogleMapComponent
                      pins={mapPins}
                      center={mapPins[0].position}
                      zoom={15}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Host Section */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-2">Host</h3>
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=900&q=60"
                    alt="Host"
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <span className="text-lg font-semibold text-gray-900">Lillimui</span>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-2">Stats</h3>
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-medium text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Vendors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-medium text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Guest</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-medium text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Invited</div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Event Section */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-2">About Event</h3>
              <div className="border-t-2 border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 leading-relaxed">
                  {market.description ||
                    "Kick off your weekends at the Kakaako Farmers Market. Every Saturday from 8am – 12pm, vendors from across Oahu are sharing the bounty of Hawaii. Expect fresh, locally-grown fruits, vegetables and flowers sourced from Hawaii farms, grab-and-go goodies, and exciting eats and treats from numerous food stalls. Find your favorites or discover new products and brands while supporting the larger community."}
                </p>
              </div>
            </div>

            {/* Save Button */}
            {user && (
              <div className="pt-4">
                <Button
                  onClick={toggleSaveMarket}
                  disabled={saving}
                  variant={isSaved ? "default" : "outline"}
                  className="w-full gap-2"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                  )}
                  {isSaved ? "Saved" : "Save Market"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetails;