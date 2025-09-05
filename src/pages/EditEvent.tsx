import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Clock, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';
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

const EditEvent = () => {
  const { marketId } = useParams();
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    market_name: '',
    description: '',
    date: '',
    time: '',
    latitude: '',
    longitude: '',
    required_documents: '',
  });

  useEffect(() => {
    if (marketId && user) {
      fetchMarket();
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

      // Check if user is the creator
      if (data.creator_id !== user?.uid) {
        toast({
          title: "Access Denied",
          description: "You can only edit markets you created",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setMarket(data);
      setFormData({
        market_name: data.market_name || '',
        description: data.description || '',
        date: data.date || '',
        time: data.time || '',
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
        required_documents: data.required_documents || '',
      });
    } catch (error) {
      console.error('Error fetching market:', error);
      toast({
        title: "Error",
        description: "Failed to load market details",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMapClick = (position: { lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      latitude: position.lat.toString(),
      longitude: position.lng.toString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !market) return;

    setSaving(true);
    try {
      const marketData = {
        market_name: formData.market_name,
        description: formData.description || null,
        date: formData.date || null,
        time: formData.time || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        required_documents: formData.required_documents || null,
        // Reset status to pending when editing
        status: 'pending'
      };

      const { error } = await supabase
        .from('markets')
        .update(marketData)
        .eq('market_id', marketId);

      if (error) throw error;

      toast({
        title: "Event Updated!",
        description: "Your market event has been updated and is pending approval.",
      });

      navigate(`/market/${marketId}`);
    } catch (error: any) {
      console.error('Error updating market:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading event details...</p>
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
            <h1 className="text-2xl font-bold text-foreground">Event Not Found</h1>
          </div>
        </header>
      </div>
    );
  }

  const mapPins = formData.latitude && formData.longitude ? [{
    id: 'edit-market',
    position: { 
      lat: parseFloat(formData.latitude), 
      lng: parseFloat(formData.longitude) 
    },
    title: formData.market_name || 'Market',
    description: 'Selected location'
  }] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/market/${marketId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Edit Event</h1>
          <Badge variant="secondary" className="ml-2">{market.status}</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Update Event Details</CardTitle>
              <p className="text-muted-foreground">
                Make changes to your farmers market event. Changes will require re-approval.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Market Name */}
                <div className="space-y-2">
                  <Label htmlFor="market_name">Event Name *</Label>
                  <Input
                    id="market_name"
                    value={formData.market_name}
                    onChange={(e) => handleInputChange('market_name', e.target.value)}
                    placeholder="e.g., Downtown Farmers Market"
                    required
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your market, what makes it special..."
                    rows={4}
                  />
                </div>

                {/* Location Coordinates */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <Label>Location (Click on map to update)</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => handleInputChange('latitude', e.target.value)}
                        placeholder="e.g., 40.7128"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => handleInputChange('longitude', e.target.value)}
                        placeholder="e.g., -74.0060"
                      />
                    </div>
                  </div>
                </div>

                {/* Required Documents */}
                <div className="space-y-2">
                  <Label htmlFor="required_documents">Required Documents for Vendors</Label>
                  <Textarea
                    id="required_documents"
                    value={formData.required_documents}
                    onChange={(e) => handleInputChange('required_documents', e.target.value)}
                    placeholder="List any documents vendors need to join (e.g., business license, insurance)"
                    rows={3}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/market/${marketId}`)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || !formData.market_name}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle>Update Location</CardTitle>
              <p className="text-muted-foreground">
                Click on the map to update the market location
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <GoogleMapComponent
                  pins={mapPins}
                  onMapClick={handleMapClick}
                  center={mapPins.length > 0 ? mapPins[0].position : { lat: 37.7749, lng: -122.4194 }}
                  zoom={mapPins.length > 0 ? 15 : 10}
                />
              </div>
              {formData.latitude && formData.longitude && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;