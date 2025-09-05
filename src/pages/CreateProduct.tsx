import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Package, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface Category {
  category_id: string;
  category_name: string;
}

const CreateProduct = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    price: '',
    unit: '',
    category_id: '',
    location: '',
    stock: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchCategories();
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('category_name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('market-images')
          .upload(`products/${user.uid}/${fileName}`, file);

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
        description: `${urls.length} image(s) added to your product`,
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
    if (!user) return;

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
      const productData = {
        product_name: formData.product_name,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        unit: formData.unit || null,
        category_id: formData.category_id || null,
        location: formData.location || null,
        stock: formData.stock || null,
        photo_url: uploadedImages[0] || null,
        user_id: user.uid,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      // If there are multiple images, save them to product_photos table
      if (uploadedImages.length > 0) {
        const photoPromises = uploadedImages.map((url, index) => ({
          product_id: data.product_id,
          file_url: url,
          is_main: index === 0,
          created_at: new Date().toISOString(),
        }));

        await supabase
          .from('product_photos')
          .insert(photoPromises);
      }

      toast({
        title: "Product Created!",
        description: "Your product has been added successfully.",
      });

      navigate(`/products/${data.product_id}`);
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Add Product</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              Product Details
            </CardTitle>
            <p className="text-muted-foreground">
              Add a new product to sell at farmers markets
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Images */}
              <div className="space-y-4">
                <Label>Product Images</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Click to upload product images
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Choose Images'}
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

                {/* Image Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name *</Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => handleInputChange('product_name', e.target.value)}
                  placeholder="e.g., Organic Tomatoes"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    placeholder="e.g., lb, each, dozen"
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
                  placeholder="Describe your product, growing methods, etc..."
                  rows={4}
                />
              </div>

              {/* Stock and Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock/Availability</Label>
                  <Input
                    id="stock"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    placeholder="e.g., 50 lbs available"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Farm location"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/products')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.product_name}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateProduct;