import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MapPin, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import GoogleMapComponent from '@/components/GoogleMap';

const AddEvent = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    market_name: '',
    description: '',
    date: '',
    time: '',
    latitude: '',
    longitude: '',
    required_documents: '',
  });

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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a market event",
        variant: "destructive",
      });
      return;
    }

    // Sync user to Supabase if not exists
    try {
      await supabase.rpc('sync_firebase_user', {
        firebase_uid: user.uid,
        user_email: user.email || '',
        user_display_name: user.displayName || 'Unknown',
        user_country: 'United States'
      });
    } catch (error) {
      console.error('Error syncing user:', error);
    }

    setLoading(true);
    try {
      const marketData = {
        market_name: formData.market_name,
        description: formData.description || null,
        creator_id: user.uid,
        date: formData.date || null,
        time: formData.time || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        required_documents: formData.required_documents || null,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('markets')
        .insert([marketData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Event Created!",
        description: "Your farmers market event has been submitted for approval.",
      });

      navigate(`/market/${data.market_id}`);
    } catch (error: any) {
      console.error('Error creating market:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  const mapPins = formData.latitude && formData.longitude ? [{
    id: 'new-market',
    position: { 
      lat: parseFloat(formData.latitude), 
      lng: parseFloat(formData.longitude) 
    },
    title: formData.market_name || 'New Market',
    description: 'Selected location'
  }] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Add Market Event</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <p className="text-muted-foreground">
                Create a new farmers market event for your community
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
                    <Label>Location (Click on map to set)</Label>
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
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !formData.market_name}
                    className="flex-1"
                  >
                    {loading ? 'Creating...' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle>Select Location</CardTitle>
              <p className="text-muted-foreground">
                Click on the map to set the market location
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <GoogleMapComponent
                  pins={mapPins}
                  onMapClick={handleMapClick}
                  center={{ lat: 37.7749, lng: -122.4194 }}
                  zoom={10}
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

export default AddEvent;