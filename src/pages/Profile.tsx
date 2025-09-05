import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Heart, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

interface SavedMarket {
  market_id: string;
  market_name: string;
  description: string;
  date: string;
  time: string;
  status: string;
}

interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  country: string;
  role: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useFirebaseAuth();
  const [savedMarkets, setSavedMarkets] = useState<SavedMarket[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchSavedMarkets();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.uid)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchSavedMarkets = async () => {
    try {
      const { data, error } = await supabase
        .from('user_markets')
        .select('market_id')
        .eq('user_id', user?.uid);

      if (error) throw error;
      
      if (data && data.length > 0) {
        const marketIds = data.map(item => item.market_id);
        
        const { data: marketsData, error: marketsError } = await supabase
          .from('markets')
          .select('market_id, market_name, description, date, time, status')
          .in('market_id', marketIds);

        if (marketsError) throw marketsError;
        setSavedMarkets(marketsData || []);
      } else {
        setSavedMarkets([]);
      }
    } catch (error) {
      console.error('Error fetching saved markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/account')}>
              <Settings className="h-4 w-4 mr-2" />
              Account
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-6 w-6" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-lg">{userProfile?.display_name || 'Unknown'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-lg">{userProfile?.email || user.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Country</label>
                    <p className="text-lg">{userProfile?.country || 'United States'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <Badge variant="secondary">{userProfile?.role || 'visitor'}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved Markets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Heart className="h-6 w-6" />
                Saved Markets ({savedMarkets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading saved markets...</p>
              ) : savedMarkets.length === 0 ? (
                <p className="text-muted-foreground">No saved markets yet</p>
              ) : (
                <div className="space-y-4">
                  {savedMarkets.map((market) => (
                    <div
                      key={market.market_id}
                      className="border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/market/${market.market_id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{market.market_name}</h3>
                          {market.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {market.description.length > 100 
                                ? `${market.description.substring(0, 100)}...` 
                                : market.description
                              }
                            </p>
                          )}
                          {market.date && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {new Date(market.date).toLocaleDateString()}
                              {market.time && ` at ${market.time}`}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">{market.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;