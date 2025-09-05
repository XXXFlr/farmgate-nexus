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

  const categories = [
    'All', 'Markets', 'Farms', 'Home Growers', 'Food Trucks'
  ];

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #fdf6e3 0%, #f5f1e8 100%)'
    }}>
      {/* Botanical Pattern Background */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Header - Always visible on mobile */}
      <header className="bg-teal-500 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-50 md:hidden">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="bg-teal-600 text-white px-3 py-1 rounded text-sm font-medium">
          HomePage
        </div>
      </header>

      <div className="px-4 py-4 pb-20 md:pb-4 relative z-10">
        {/* Search Bar with Profile */}
        <div className="relative mb-4">
          <div className="flex items-center gap-3 bg-white rounded-full p-3 shadow-sm border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-green-200">
              U
            </div>
            <div className="flex items-center flex-1">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                category === 'All' 
                  ? 'bg-amber-700 text-white shadow-sm' 
                  : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Hero Section */}
        <div className="relative mb-6 rounded-2xl overflow-hidden shadow-lg">
          <div 
            className="h-80 bg-cover bg-center relative"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`
            }}
          >
            <div className="absolute top-4 left-4">
              <div className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-medium">
                Text
              </div>
            </div>
            <div className="absolute bottom-8 left-6 right-6 text-white">
              <h2 className="text-4xl font-bold mb-2 leading-tight">Local harvest</h2>
              <h2 className="text-4xl font-bold mb-4 leading-tight">Local people</h2>
              <p className="text-lg mb-6 max-w-md opacity-90">
                Get to Know Nearby Farmers and Discover Their Unique Stories!
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex -space-x-2">
                  <div className="w-12 h-12 rounded-full bg-orange-400 border-2 border-white"></div>
                  <div className="w-12 h-12 rounded-full bg-green-400 border-2 border-white"></div>
                  <div className="w-12 h-12 rounded-full bg-blue-400 border-2 border-white"></div>
                </div>
              </div>
              <button className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg">
                Explore Now
              </button>
            </div>
          </div>
        </div>

        {/* Vendors Section */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Vendors</h3>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {[1, 2, 3, 4].map((vendor) => (
              <div key={vendor} className="flex flex-col items-center min-w-[100px]">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 via-blue-400 to-green-500 p-1 mb-3 shadow-lg">
                  <div className="w-full h-full rounded-full bg-green-100 flex items-center justify-center relative overflow-hidden">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full"></div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-800">[Display Name]</span>
                <span className="text-xs text-gray-500">type</span>
              </div>
            ))}
          </div>
        </div>

        {/* Farms Section */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Farms</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((farm) => (
              <div key={farm} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1544737151412-6c4cfda62e40?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')`
                  }}
                />
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 mb-2">Display Name</h4>
                  <button className="text-amber-700 font-semibold hover:text-amber-800 transition-colors flex items-center gap-1">
                    View Now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Markets */}
        {filteredMarkets.length > 0 && (
          <div className="mb-6">
            <div className="grid gap-4">
              {filteredMarkets.slice(0, 2).map((market) => (
                <div 
                  key={market.market_id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/market/${market.market_id}`)}
                >
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')`
                    }}
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(market.date)} • {formatTime(market.time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span>Location</span>
                    </div>
                    <p className="text-gray-700 font-semibold mb-2">@[Display Name]</p>
                    <p className="text-gray-600 mb-3">{market.description || 'Market Description'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-amber-600 rounded"></div>
                        <span>35</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-400 rounded"></div>
                        <span>897</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Produce Section */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Produce</h3>
          <div className="grid gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex gap-4">
                <div 
                  className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80')`
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-lg mb-1">Apple Bananas</h4>
                  <p className="text-sm text-gray-600 mb-1">@[Display Name]</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <MapPin className="h-3 w-3 text-red-500" />
                    <span>Address</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">$0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;