import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MapPin, Users, TrendingUp } from "lucide-react";
import { APP_TITLE } from "@/const";

/**
 * Home page - landing page with navigation to main features
 */
export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        background: "linear-gradient(to bottom right, #6787f1ff, #1ea30cff)",
      }}
    >
      {/* Navigation Header */}
      <nav className="bg-amber-300 rounded-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🌱</span>
            <h1 className="text-2xl text-black font-bold">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-lg mr-4 text-black">
                  Welcome, {user?.name || "User"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-none text-[#3a3a3a] hover:bg-gray-100"
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="bg-white text-[#3a3a3a]">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-white text-[#3a3a3a]">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            CE4HOW Taka ni Mali
          </h2>
          <p className="text-xl text-[#3a3a3a] mb-8">
            Geospatial Waste Management Monitoring & Evaluation Dashboard
          </p>
          <p className="text-lg text-[#2f2f2f] max-w-2xl mx-auto">
            Track, analyze, and visualize waste collection data across Kakamega Municipality
            with real-time geospatial insights and comprehensive analytics.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow bg-white">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-green-700" />
                <CardTitle className="text-lg text-[#6b3e1d]">Interactive Map</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#3a3a3a]">
                Visualize waste collection sites across Kakamega with Leaflet-based mapping
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-white">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-green-700" />
                <CardTitle className="text-lg text-[#6b3e1d]">Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#3a3a3a]">
                Analyze waste collection trends with interactive charts and summaries
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-white">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-700" />
                <CardTitle className="text-lg text-[#6b3e1d]">Data Collection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#3a3a3a]">
                Submit and manage waste collection records securely with authentication
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-white">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-700" />
                <CardTitle className="text-lg text-[#6b3e1d]">Real-time Updates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#3a3a3a]">
                Access live data with real-time synchronization across all dashboards
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-[#6b3e1d] mb-4">Get Started</h3>
          <p className="text-[#3a3a3a] mb-6">
            Choose your role to access the appropriate features:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Public Dashboard */}
            <div className="border border-input rounded-lg p-6">
              <h4 className="text-lg font-semibold text-[#6b3e1d] mb-2">View Dashboard</h4>
              <p className="text-sm text-[#3a3a3a] mb-4">
                Access the public dashboard to view aggregated waste collection data,
                interactive maps, and analytics. No authentication required.
              </p>
              <Link href="/dashboard">
                <Button className="w-full bg-[#6b3e1d] hover:bg-[#583014] text-white">
                  Open Dashboard
                </Button>
              </Link>
            </div>

            {/* Data Collection */}
            <div className="border border-input rounded-lg p-6">
              <h4 className="text-lg font-semibold text-[#6b3e1d] mb-2">Submit Data</h4>
              <p className="text-sm text-[#3a3a3a] mb-4">
                If you're a data collector, log in to submit waste collection records
                and manage your submissions.
              </p>
              {isAuthenticated && (user?.role === "collector" || user?.role === "admin") ? (
                <Link href="/collector">
                  <Button className="w-full bg-[#6b3e1d] hover:bg-[#583014] text-white">
                    Submit Collection
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button className="w-full bg-[#6b3e1d] hover:bg-[#583014] text-white">
                    Login as Collector
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-[#6b3e1d] mb-4">About This System</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#3a3a3a]">
            <div>
              <h4 className="font-semibold text-[#6b3e1d] mb-2">Key Features</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>Geospatial mapping of waste collection sites</li>
                <li>Real-time data collection and submission</li>
                <li>Comprehensive analytics and reporting</li>
                <li>Role-based access control</li>
                <li>Secure authentication with JWT tokens</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#6b3e1d] mb-2">Data Tracked</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>Collection dates and locations</li>
                <li>Waste types (Organic, Inorganic, Mixed)</li>
                <li>Collection volumes and trends</li>
                <li>Waste separation practices</li>
                <li>Collection frequency and patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-amber-300 rounded-lg mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-lg text-black">
          <p>CE4HOW Taka ni Mali - Geospatial Waste Management M&E Dashboard</p>
          <p className="mt-2">© 2025 CE4HOW Initiative. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
