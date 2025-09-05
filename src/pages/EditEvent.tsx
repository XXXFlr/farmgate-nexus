import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Clock, Save, Upload, Plus, X, Camera, Trash2 } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    market_name: '',
    description: '',
    date: '',
    time: '',
    end_time: '',
    latitude: '',
    longitude: '',
    address: '',
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
        end_time: '',
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
        address: '',
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('market-images')
          .upload(`${user?.uid}/${fileName}`, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('market-images')
          .getPublicUrl(data.path);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...urls]);
      
      toast({
        title: "Images uploaded successfully",
        description: `${urls.length} image(s) added to your market`,
      });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
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

      navigate(`/markets/${marketId}`);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/markets/${marketId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Edit Market</h1>
          <Badge variant="secondary" className="ml-2">{market.status}</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Image Upload Section */}
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <div 
                  className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Add Market Photos</h3>
                <p className="text-muted-foreground mb-4">Tap to upload images</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mb-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {/* Image Grid */}
              {uploadedImages.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Market image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Update Event Details</CardTitle>
                <p className="text-muted-foreground">
                  Make changes to your farmers market event. Changes will require re-approval.
                </p>
              </CardHeader>
              <CardContent>
                <form id="market-form" onSubmit={handleSubmit} className="space-y-6">
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

                {/* Date and Time Section with Visual Indicators */}
                <Card className="border-muted bg-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-2 mt-1">
                        <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                        <div className="w-0.5 h-12 bg-muted-foreground/50 border-dashed border-l-2"></div>
                        <div className="w-3 h-3 border-2 border-foreground rounded-full bg-background"></div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <Label className="text-muted-foreground">Start</Label>
                          <div className="flex gap-2">
                            <Input
                              type="date"
                              value={formData.date}
                              onChange={(e) => handleInputChange('date', e.target.value)}
                              className="w-auto"
                            />
                            <Input
                              type="time"
                              value={formData.time}
                              onChange={(e) => handleInputChange('time', e.target.value)}
                              className="w-auto"
                            />
                          </div>
                        </div>
                        <hr className="border-muted-foreground/30" />
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <Label className="text-muted-foreground">End</Label>
                          <div className="flex gap-2">
                            <Input
                              type="time"
                              value={formData.end_time}
                              onChange={(e) => handleInputChange('end_time', e.target.value)}
                              placeholder="End time"
                              className="w-auto"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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

                {/* Location Section */}
                <Card className="border-muted bg-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            placeholder="1234 Ilalo St, Honolulu, HI 96797, USA"
                            className="mt-1"
                          />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Click on the map to update coordinates
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                            <Input
                              id="latitude"
                              type="number"
                              step="any"
                              value={formData.latitude}
                              onChange={(e) => handleInputChange('latitude', e.target.value)}
                              placeholder="21.3069"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                            <Input
                              id="longitude"
                              type="number"
                              step="any"
                              value={formData.longitude}
                              onChange={(e) => handleInputChange('longitude', e.target.value)}
                              placeholder="-157.8583"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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

                {/* Cancel Button */}
                <div className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/markets/${marketId}`)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

            {/* Map */}
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="h-32 rounded-lg overflow-hidden mb-4">
                  <GoogleMapComponent
                    pins={mapPins}
                    onMapClick={handleMapClick}
                    center={mapPins.length > 0 ? mapPins[0].position : { lat: 21.3069, lng: -157.8583 }}
                    zoom={mapPins.length > 0 ? 15 : 10}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={saving || !formData.market_name}
              className="px-16 py-3 rounded-full text-lg font-semibold"
              form="market-form"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;