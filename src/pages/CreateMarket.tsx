import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const CreateMarket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    market_name: '',
    description: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const marketData = {
        market_name: formData.market_name,
        description: formData.description || null,
        creator_id: user.id,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        required_documents: formData.required_documents || null,
      };

      const { data, error } = await supabase
        .from('markets')
        .insert([marketData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Market Created!",
        description: "Your farmers market has been created successfully.",
      });

      navigate(`/markets/${data.market_id}`);
    } catch (error: any) {
      console.error('Error creating market:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create market",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/markets')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Create Market</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Market Details</CardTitle>
            <p className="text-muted-foreground">
              Create a new farmers market for your community
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Market Name */}
              <div className="space-y-2">
                <Label htmlFor="market_name">Market Name *</Label>
                <Input
                  id="market_name"
                  value={formData.market_name}
                  onChange={(e) => handleInputChange('market_name', e.target.value)}
                  placeholder="e.g., Downtown Farmers Market"
                  required
                />
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

              {/* Location */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <Label>Location (Optional)</Label>
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
                <Label htmlFor="required_documents">Required Documents</Label>
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
                  onClick={() => navigate('/markets')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.market_name}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create Market'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateMarket;