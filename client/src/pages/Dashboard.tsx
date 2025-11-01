import { useMemo, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import MapView from "@/components/MapView";
import ChartView from "@/components/ChartView";

interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  siteName: string;
  wasteType: string;
  volume: number;
  date: Date;
}

type CollectionRecord = {
  id: number;
  siteName: string;
  wasteType: "Organic" | "Inorganic" | "Mixed";
  collectionDate: Date;
  totalVolume: string;
};

export default function Dashboard() {
  const [filters, setFilters] = useState({
    siteName: "",
    wasteType: undefined as any,
    startDate: "",
    endDate: "",
    minVolume: "",
    maxVolume: "",
    wasteSeparated: undefined as boolean | undefined,
    minCollections: "",
    minOrganicVolume: "",
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedFilters(filters), 500);
    return () => clearTimeout(handler);
  }, [filters]);

  const { data: collections, isLoading: collectionsLoading } =
    trpc.collections.filtered.useQuery(debouncedFilters);

  const { data: mapData } = trpc.collections.dashboardData.useQuery();

  const mapMarkers: MapMarker[] =
    mapData?.markers?.map((m: any) => ({
      id: m.id,
      lat: m.lat,
      lng: m.lng,
      siteName: m.siteName,
      wasteType: m.wasteType,
      volume: m.volume,
      date: new Date(m.date),
    })) || [];

  const filteredSummary = useMemo(() => {
    if (!collections) {
      return { totalRecords: 0, totalVolume: 0, byWasteType: {} };
    }
    return {
      totalRecords: collections.length,
      totalVolume: collections.reduce(
        (sum, r) => sum + parseFloat(r.totalVolume),
        0
      ),
      byWasteType: collections.reduce((acc, r) => {
        acc[r.wasteType] = (acc[r.wasteType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [collections]);

  const filteredTrendData = useMemo(() => {
    if (!collections) {
      return {};
    }
    return collections.reduce((acc, r) => {
      const dateStr = r.collectionDate.toISOString().split("T")[0];
      acc[dateStr] = (acc[dateStr] || 0) + parseFloat(r.totalVolume);
      return acc;
    }, {} as Record<string, number>);
  }, [collections]);

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    setFilters({
      siteName: marker.siteName,
      wasteType: undefined,
      startDate: "",
      endDate: "",
      minVolume: "",
      maxVolume: "",
      wasteSeparated: undefined,
      minCollections: "",
      minOrganicVolume: "",
    });
  };

  const handleResetFilters = () => {
    setFilters({
      siteName: "",
      wasteType: undefined,
      startDate: "",
      endDate: "",
      minVolume: "",
      maxVolume: "",
      wasteSeparated: undefined,
      minCollections: "",
      minOrganicVolume: "",
    });
    setSelectedMarker(null);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSelectedMarker(null);
    setFilters((prev) => ({
      ...prev,
      siteName: "",
      [name]: value || undefined,
    }));
  };

  // ✅ Fixed background color for loading state
  if (collectionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300">
        <Loader2 className="animate-spin w-8 h-8 text-amber-700" />
      </div>
    );
  }

  // ✅ Main dashboard layout with amber gradient
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2 rounded-lg">
            Waste Management Dashboard
          </h1>
          <p className="text-amber-700">
            Monitor and analyze waste collection data across Kakamega Municipality
          </p>
        </div>

        {/* Top Navigation */}
        <div className="flex space-x-4 mb-8">
          <Link href="/">
            <Button className="bg-white text-amber-800 hover:bg-amber-200 border border-amber-600">
              Home
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-amber-400 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">
                Total Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {filteredSummary.totalRecords}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-400 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">
                Total Volume (tons)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {filteredSummary.totalVolume.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-400 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">
                Waste Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1 text-white">
                <div>Organic: {filteredSummary.byWasteType?.Organic || 0}</div>
                <div>Inorganic: {filteredSummary.byWasteType?.Inorganic || 0}</div>
                <div>Mixed: {filteredSummary.byWasteType?.Mixed || 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Filters */}
            <Card className="bg-amber-400 shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-900">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-amber-900">
                    Waste Type
                  </label>
                  <select
                    name="wasteType"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={filters.wasteType || ""}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    <option value="Organic">Organic</option>
                    <option value="Inorganic">Inorganic</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-amber-900">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-amber-900">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-amber-900">
                    Waste Separated
                  </label>
                  <select
                    name="wasteSeparated"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={
                      filters.wasteSeparated === undefined
                        ? "any"
                        : String(filters.wasteSeparated)
                    }
                    onChange={(e) => {
                      setSelectedMarker(null);
                      setFilters({
                        ...filters,
                        siteName: "",
                        wasteSeparated:
                          e.target.value === "any"
                            ? undefined
                            : e.target.value === "true",
                      });
                    }}
                  >
                    <option value="any">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-amber-900">
                      Min Volume (tons)
                    </label>
                    <input
                      type="number"
                      name="minVolume"
                      placeholder="e.g., 5"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={filters.minVolume}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-amber-900">
                      Max Volume (tons)
                    </label>
                    <input
                      type="number"
                      name="maxVolume"
                      placeholder="e.g., 20"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={filters.maxVolume}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-white border-amber-700 text-amber-800 hover:bg-amber-300"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </Button>

                {selectedMarker && (
                  <div className="p-3 bg-amber-100 border border-amber-300 rounded-md text-sm">
                    <p className="font-semibold text-amber-900">
                      Selected Site:{" "}
                      <span className="text-amber-700">
                        {selectedMarker.siteName}
                      </span>
                    </p>
                    <p className="text-amber-700">
                      Showing data for this site only.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="bg-amber-400 shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  Collection Records ({collections?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-amber-700 text-lg text-white">
                        <th className="text-left py-2 px-2">Date</th>
                        <th className="text-left py-2 px-2">Site</th>
                        <th className="text-left py-2 px-2">Type</th>
                        <th className="text-left py-2 px-2">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collections && collections.length > 0 ? (
                        collections.slice(0, 10).map((record: CollectionRecord) => (
                          <tr
                            key={record.id}
                            className="border-b border-amber-600 hover:bg-amber-100/30 text-amber-900"
                          >
                            <td className="py-2 px-2">
                              {record.collectionDate.toLocaleDateString()}
                            </td>
                            <td className="py-2 px-2">{record.siteName}</td>
                            <td className="py-2 px-2">{record.wasteType}</td>
                            <td className="py-2 px-2">{record.totalVolume} tons</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-4 text-center text-amber-900/70"
                          >
                            No records found for the selected filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-800">Geospatial Map</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <MapView
                  markers={mapMarkers}
                  onMarkerClick={handleMarkerClick}
                  selectedMarker={selectedMarker}
                />
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-800">
                  {selectedMarker
                    ? `Trends for ${selectedMarker.siteName}`
                    : "Overall Collection Trends"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartView
                  data={filteredTrendData}
                  title="Weekly Waste Collection Volume"
                  chartType="line"
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
