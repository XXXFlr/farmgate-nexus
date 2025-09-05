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
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
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

      <div className="px-4 py-6">
        {/* Search Bar with Profile */}
        <div className="relative mb-6">
          <div className="flex items-center gap-3 bg-white rounded-full p-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
              U
            </div>
            <div className="flex items-center flex-1">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['All', 'Markets', 'Farms', 'Home Growers', 'Food Trucks'].map((category) => (
            <Button
              key={category}
              variant={category === 'All' ? 'default' : 'ghost'}
              className={`whitespace-nowrap ${
                category === 'All' 
                  ? 'bg-amber-700 text-white hover:bg-amber-800' 
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Hero Section */}
        <div className="relative mb-8 rounded-2xl overflow-hidden h-80 bg-gradient-to-r from-amber-600 to-orange-500">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10 p-8 h-full flex flex-col justify-center text-white">
            <div className="bg-orange-500 text-white px-3 py-1 rounded w-fit text-sm mb-4">
              Text
            </div>
            <h2 className="text-4xl font-bold mb-2">Local harvest</h2>
            <h2 className="text-4xl font-bold mb-4">Local people</h2>
            <p className="text-lg mb-6 max-w-md">
              Get to Know Nearby Farmers and Discover Their Unique Stories!
            </p>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex -space-x-2">
                <div className="w-12 h-12 rounded-full bg-gray-300 border-2 border-white"></div>
                <div className="w-12 h-12 rounded-full bg-gray-400 border-2 border-white"></div>
                <div className="w-12 h-12 rounded-full bg-gray-500 border-2 border-white"></div>
              </div>
            </div>
            <Button className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-xl w-fit">
              Explore Now
            </Button>
          </div>
        </div>

        {/* Vendors Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Vendors</h3>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((vendor) => (
              <div key={vendor} className="flex flex-col items-center min-w-[100px]">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 p-1 mb-3">
                  <div className="w-full h-full rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-green-600"></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">[Display Name]</span>
                <span className="text-xs text-gray-500">type</span>
              </div>
            ))}
          </div>
        </div>

        {/* Farms Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Farms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((farm) => (
              <Card key={farm} className="overflow-hidden bg-white shadow-sm">
                <div className="h-48 bg-gradient-to-br from-green-400 to-green-600"></div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-1">Display Name</h4>
                  <Button variant="ghost" className="text-amber-700 p-0 h-auto font-medium">
                    View Now →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Markets */}
        {filteredMarkets.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Featured Markets</h3>
            <div className="grid gap-6">
              {filteredMarkets.slice(0, 2).map((market) => (
                <Card 
                  key={market.market_id}
                  className="overflow-hidden bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/market/${market.market_id}`)}
                >
                  <div className="h-48 bg-gradient-to-br from-amber-400 to-orange-500"></div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(market.date)} • {formatTime(market.time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span>Location</span>
                    </div>
                    <p className="text-gray-700 font-medium mb-2">@{market.market_name}</p>
                    <p className="text-gray-600">{market.description || 'Market Description'}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-amber-600 rounded"></div>
                        <span>35</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-400 rounded"></div>
                        <span>897</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Produce Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Produce</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="overflow-hidden bg-white shadow-sm">
              <div className="flex p-4">
                <div className="w-20 h-20 bg-yellow-400 rounded-lg mr-4"></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">Apple Bananas</h4>
                  <p className="text-sm text-gray-600 mb-1">@[Display Name]</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <MapPin className="h-3 w-3 text-red-500" />
                    <span>Address</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">$0</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;