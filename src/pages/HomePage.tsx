import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus, Search, Map, Menu, ChevronRight } from 'lucide-react';
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

interface FarmUser {
  id: string;
  display_name: string | null;
  photo_url: string | null;
}

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { toggleSidebar } = useSidebarContext();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [farmUsers, setFarmUsers] = useState<FarmUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [farmsLoading, setFarmsLoading] = useState(true);

  useEffect(() => {
    fetchMarkets();
    fetchFarmUsers();
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

  const fetchFarmUsers = async () => {
    try {
      // First, get the "Farms" category ID
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('category_id')
        .eq('category_name', 'Farms')
        .single();

      if (categoryError || !categoryData) {
        console.error('Error fetching Farms category:', categoryError);
        setFarmsLoading(false);
        return;
      }

      // Then get users who are categorized as farms
      const { data: userCategoryData, error: userCategoryError } = await supabase
        .from('user_categories')
        .select(`
          user_id,
          users!inner(
            id,
            display_name,
            photo_url
          )
        `)
        .eq('category_id', categoryData.category_id);

      if (userCategoryError) {
        console.error('Error fetching farm users:', userCategoryError);
        setFarmsLoading(false);
        return;
      }

      // Transform the data to match our interface
      const farmUsersList: FarmUser[] = userCategoryData?.map((item: any) => ({
        id: item.users.id,
        display_name: item.users.display_name,
        photo_url: item.users.photo_url
      })) || [];

      setFarmUsers(farmUsersList);
    } catch (error) {
      console.error('Error fetching farm users:', error);
    } finally {
      setFarmsLoading(false);
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
    'All', 'Markets', 'Farms', 'Home Growers', 'Food Trucks', 'Drinks', 'Food'
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
        <div className="flex items-center overflow-x-auto mb-4 scrollbar-hide">
          {categories.map((category, index) => (
            <div 
              key={category}
              className={`flex items-center justify-center ${
                index === 0 ? 'px-4' : 'pr-4'
              }`}
            >
              <span className="text-gray-800 text-lg font-medium whitespace-nowrap">
                {category}
              </span>
            </div>
          ))}
        </div>

        {/* Hero Section */}
        <div className="mb-6">
          <div 
            className="w-full rounded-xl p-3 pb-2"
            style={{
              backgroundColor: 'rgba(15, 17, 19, 0.26)',
            }}
          >
            <div className="flex flex-col">
              <div className="mb-4">
                <div className="rounded-lg">
                  <h2 
                    className="text-white text-4xl font-medium leading-tight"
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      textShadow: '3px 3px 3px rgba(0,0,0,0.3)'
                    }}
                  >
                    Local harvest<br />Local people
                  </h2>
                </div>
              </div>
              
              <div className="mb-2">
                <p 
                  className="text-white text-base font-normal"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Get to Know Nearby Farmers and Discover Their Unique Stories!
                </p>
              </div>
              
              <div className="flex items-center gap-1 mb-3">
                <button 
                  className="mr-1"
                  onClick={() => navigate('/news')}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=900&q=60"
                    alt="User"
                    className="w-11 h-11 rounded-full object-cover"
                  />
                </button>
                <button 
                  className="mr-1"
                  onClick={() => navigate('/news')}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1533689476487-034f57831a58?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTA4fHx1c2VyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=900&q=60"
                    alt="User"
                    className="w-11 h-11 rounded-full object-cover"
                  />
                </button>
                <button 
                  className="mr-1"
                  onClick={() => navigate('/news')}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTE1fHx1c2VyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=900&q=60"
                    alt="User"
                    className="w-11 h-11 rounded-full object-cover"
                  />
                </button>
              </div>
              
              <button
                onClick={() => navigate('/news')}
                className="w-full h-11 bg-primary text-white text-base font-normal rounded-xl shadow-sm border border-transparent"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
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
        <div className="py-1 px-0 mb-2">
          {farmsLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex overflow-x-auto scrollbar-hide">
              {farmUsers.map((farmUser, index) => (
                <div key={farmUser.id} className="px-4 py-2 first:pl-4 last:pr-4">
                  <div 
                    className="bg-white rounded-xl p-2 animate-fade-in"
                    style={{
                      width: '200px',
                      height: '100px',
                      boxShadow: '0 1px 4px rgba(15, 17, 19, 0.26)'
                    }}
                  >
                    <div className="flex flex-col h-full">
                      <div className="mb-0">
                        <img
                          src={farmUser.photo_url || 'https://clqwofdhiwlqnwqshzfk.supabase.co/storage/v1/object/public/market-photos/HawaiiFarm.png'}
                          alt={farmUser.display_name || 'Farm'}
                          className="w-full rounded-lg"
                          style={{ 
                            height: '220px',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                      <div className="pt-4">
                        <h4 
                          className="text-xl font-normal mb-0"
                          style={{ 
                            fontFamily: 'Outfit, sans-serif',
                            color: '#0F1113',
                            fontSize: '20px',
                            fontWeight: 'normal'
                          }}
                        >
                          {farmUser.display_name || 'Display Name'}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span 
                            className="text-sm font-medium"
                            style={{ 
                              fontFamily: 'Plus Jakarta Sans, sans-serif',
                              color: '#57636C',
                              fontSize: '14px',
                              fontWeight: '500',
                              paddingLeft: '4px',
                              paddingTop: '4px'
                            }}
                          >
                            View Now
                          </span>
                          <ChevronRight className="h-6 w-6 text-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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