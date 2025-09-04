import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, MessageCircle, Plus } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useFirebaseAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">FarmGate Nexus</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email}
            </span>
            <Button variant="outline" onClick={signOut} size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Connect. Trade. Grow.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join local farmers markets, discover fresh produce, and build community connections.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/markets')}
          >
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Browse Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Find local farmers markets to join
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/markets/create')}
          >
            <CardHeader className="text-center">
              <Plus className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Create Market</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Start your own farmers market
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/map')}
          >
            <CardHeader className="text-center">
              <MapPin className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Map View</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Explore markets on the map
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/chat')}
          >
            <CardHeader className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Chat with market organizers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Section */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-foreground mb-6">
            Get Started Today
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/markets')}
            >
              Browse Markets
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/markets/create')}
            >
              Create Market
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;