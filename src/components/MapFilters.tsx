import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Search } from 'lucide-react';

interface MapFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  mainCategory: string;
  subCategory: string;
  vendorType: string;
}

const MapFilters = ({ isOpen, onClose, onFilterChange }: MapFiltersProps) => {
  const [mainCategory, setMainCategory] = useState('Markets');
  const [subCategory, setSubCategory] = useState('');
  const [vendorType, setVendorType] = useState('');

  const handleMainCategoryChange = (category: string) => {
    setMainCategory(category);
    setSubCategory('');
    setVendorType('');
    onFilterChange({ mainCategory: category, subCategory: '', vendorType: '' });
  };

  const handleSubCategoryChange = (category: string) => {
    setSubCategory(category);
    onFilterChange({ mainCategory, subCategory: category, vendorType });
  };

  const handleVendorTypeChange = (type: string) => {
    setVendorType(type);
    onFilterChange({ mainCategory, subCategory, vendorType: type });
  };

  const mainCategories = ['Markets', 'Vendors', 'Products'];

  const vendorTypes = [
    'Markets', 'Farmers', 'Home Growers', 'Food Trucks', 'Prepared Food',
    'Drinks', 'Snacks', 'Sauces & Spices', 'Clothes', 'Jewelry',
    'Artisan', 'Collectibles', 'Services', 'Community Organizations', 'Other'
  ];

  const productCategories = [
    { name: 'Produce', icon: '🥕' },
    { name: 'Meats', icon: '🍖' },
    { name: 'Dairy & Eggs', icon: '🥚' },
    { name: 'Prepared Foods', icon: '🍽️' },
    { name: 'Baked Goods', icon: '🍞' },
    { name: 'Pantry', icon: '📦' },
    { name: 'Drinks', icon: '☕' }
  ];

  const getSubCategories = () => {
    switch (subCategory) {
      case 'Produce':
        return ['Salad Greens', 'Vegetables', 'Fruits', 'Herbs', 'Mushrooms'];
      case 'Meats':
        return ['Beef', 'Pork', 'Poultry', 'Lamb', 'Seafood', 'Other'];
      case 'Dairy & Eggs':
        return ['Milk', 'Yogurt', 'Cheese', 'Butter', 'Eggs'];
      case 'Prepared Foods':
        return ['Meals', 'Entrees', 'Sides', 'Soups', 'Appetizers', 'Desserts', 'Breakfast', 'Pizza', 'Seasoning Kits'];
      case 'Baked Goods':
        return ['Breads', 'Pastries', 'Desserts', 'Specialties', 'Gluten-Free', 'Other'];
      case 'Pantry':
        return ['Grains & Pasta', 'Baking Supplies', 'Cereal & Granola', 'Honey & Syrup', 'Jams & Spreads', 'Snacks', 'Spices & Seasonings', 'Sweets & Chocolates', 'Sauces & Dressings', 'Oils & Vinegar'];
      case 'Drinks':
        return ['Cold', 'Hot', 'Dry', 'Specialty Drink'];
      default:
        return [];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-80 bg-background h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Find What You Need</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Main Categories */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {mainCategories.map((category) => (
                    <Badge
                      key={category}
                      variant={mainCategory === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleMainCategoryChange(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vendor Types */}
            {mainCategory === 'Vendors' && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Vendor Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {vendorTypes.map((type) => (
                      <Badge
                        key={type}
                        variant={vendorType === type ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleVendorTypeChange(type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Categories */}
            {mainCategory === 'Products' && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {productCategories.map((category) => (
                      <Badge
                        key={category.name}
                        variant={subCategory === category.name ? "default" : "outline"}
                        className="cursor-pointer flex items-center gap-1"
                        onClick={() => handleSubCategoryChange(category.name)}
                      >
                        <span>{category.icon}</span>
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sub Categories */}
            {subCategory && getSubCategories().length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Sub Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {getSubCategories().map((category) => (
                      <Badge
                        key={category}
                        variant="outline"
                        className="cursor-pointer"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapFilters;