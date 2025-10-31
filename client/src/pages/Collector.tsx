import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

const DUMPSITE_DETAILS = [
  { name: "Rosterman Dumpsite", lat: 0.25509, lng: 34.72066 },
  { name: "Regen Organics Fertilizer Processing Plant", lat: 0.33474, lng: 34.48796 },
  { name: "Khayenga Refuse Chamber", lat: 0.20819, lng: 34.77152 },
  { name: "Lurambi Refuse Chamber", lat: 0.2998, lng: 34.76485 },
  { name: "Sichirayi Refuse Chamber", lat: 0.315, lng: 34.745 },
  { name: "Masingo Refuse Chamber", lat: 0.285, lng: 34.7505 },
  { name: "Amelemba Scheme Refuse Chamber", lat: 0.295, lng: 34.755 },
  { name: "Mevic Waste Management", lat: 0.283, lng: 34.753 },
  { name: "Kambi Somali Refuse Chamber", lat: 0.286, lng: 34.752 },
  { name: "Shirere Waste Collection", lat: 0.265, lng: 34.735 },
];

export default function Collector() {
  const { user, isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    siteName: DUMPSITE_DETAILS[0].name,
    wasteType: "Organic" as "Organic" | "Inorganic" | "Mixed",
    collectionDate: new Date().toISOString().split("T")[0],
    totalVolume: 0,
    wasteSeparated: false,
    organicVolume: 0,
    inorganicVolume: 0,
    collectionCount: 1,
    latitude: DUMPSITE_DETAILS[0].lat,
    longitude: DUMPSITE_DETAILS[0].lng,
    comments: "",
  });

  const submitMutation = trpc.collections.submit.useMutation();

  if (!isAuthenticated || (user?.role !== "collector" && user?.role !== "admin")) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: "linear-gradient(to bottom right, #7cc684, #1ea30cff)",
        }}
      >
        <Card className="w-full max-w-md bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#6b3e1d] text-xl font-bold">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Only collectors can access this page. Please log in with a collector account.
            </p>
            <Link href="/">
              <Button className="w-full bg-[#6b3e1d] hover:bg-[#583014] text-white">
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const finalValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("Volume") ||
        name.includes("Count") ||
        name === "latitude" ||
        name === "longitude"
          ? parseFloat(value) || 0
          : finalValue,
    }));
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSiteName = e.target.value;
    const selectedSite = DUMPSITE_DETAILS.find((site) => site.name === newSiteName);

    if (selectedSite) {
      setFormData((prev) => ({
        ...prev,
        siteName: selectedSite.name,
        latitude: selectedSite.lat,
        longitude: selectedSite.lng,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      await submitMutation.mutateAsync({
        ...formData,
        latitude: parseFloat(formData.latitude as any),
        longitude: parseFloat(formData.longitude as any),
      });
      setSuccess(true);
      setFormData({
        siteName: DUMPSITE_DETAILS[0].name,
        wasteType: "Organic",
        collectionDate: new Date().toISOString().split("T")[0],
        totalVolume: 0,
        wasteSeparated: false,
        organicVolume: 0,
        inorganicVolume: 0,
        collectionCount: 1,
        latitude: DUMPSITE_DETAILS[0].lat,
        longitude: DUMPSITE_DETAILS[0].lng,
        comments: "",
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to submit collection data");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between"
      style={{
        background: "linear-gradient(to bottom right, #a3e4b1, #4fb36a)",
      }}
    >
      {/* HEADER */}
      <header className="bg-amber-300 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🌱</span>
            <h1 className="text-xl font-bold text-white">Taka ni Mali</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-black">
              Welcome, {user?.name || "User"}
            </span>
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-[#6b3e1d] border-none hover:bg-amber-100"
              >
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow p-6 md:p-12">
        <div className="max-w-3xl mx-auto bg-white/95 rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-[#6b3e1d] text-center mb-6">
            Waste Collection Data Entry
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-md flex gap-2 items-center">
              <AlertCircle className="text-red-500 w-5 h-5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Site Name */}
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-[#6b3e1d] mb-2">
                Site Name *
              </label>
              <select
                id="siteName"
                name="siteName"
                value={formData.siteName}
                onChange={handleSiteChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                {DUMPSITE_DETAILS.map((site) => (
                  <option key={site.name} value={site.name}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Collection Date */}
            <div>
              <label htmlFor="collectionDate" className="block text-sm font-medium text-[#6b3e1d] mb-2">
                Collection Date *
              </label>
              <input
                id="collectionDate"
                type="date"
                name="collectionDate"
                value={formData.collectionDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Waste Type */}
            <div>
              <label htmlFor="wasteType" className="block text-sm font-medium text-[#6b3e1d] mb-2">
                Waste Type *
              </label>
              <select
                id="wasteType"
                name="wasteType"
                value={formData.wasteType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="Organic">Organic</option>
                <option value="Inorganic">Inorganic</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            {/* Total Volume */}
            <div>
              <label htmlFor="totalVolume" className="block text-sm font-medium text-[#6b3e1d] mb-2">
                Total Volume (tons) *
              </label>
              <input
                id="totalVolume"
                type="number"
                name="totalVolume"
                value={formData.totalVolume}
                onChange={handleInputChange}
                placeholder="0.00"
                step="1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Waste Separated */}
            <div className="flex items-center">
              <input
                id="wasteSeparated"
                type="checkbox"
                name="wasteSeparated"
                checked={formData.wasteSeparated}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="wasteSeparated" className="ml-2 text-sm font-medium text-[#6b3e1d]">
                Waste was separated?
              </label>
            </div>

            {/* Separated Volumes */}
            {formData.wasteSeparated && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="organicVolume" className="block text-sm font-medium text-[#6b3e1d] mb-2">
                    Organic Volume (tons)
                  </label>
                  <input
                    id="organicVolume"
                    type="number"
                    name="organicVolume"
                    value={formData.organicVolume}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="inorganicVolume" className="block text-sm font-medium text-[#6b3e1d] mb-2">
                    Inorganic Volume (tons)
                  </label>
                  <input
                    id="inorganicVolume"
                    type="number"
                    name="inorganicVolume"
                    value={formData.inorganicVolume}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}

            {/* Collection Count */}
            <div>
              <label htmlFor="collectionCount" className="block text-sm font-medium text-[#6b3e1d] mb-2">
                Number of Collections *
              </label>
              <input
                id="collectionCount"
                type="number"
                name="collectionCount"
                value={formData.collectionCount}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-[#6b3e1d] mb-2">
                  Latitude *
                </label>
                <input
                  id="latitude"
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="-0.3031"
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-[#6b3e1d] mb-2">
                  Longitude *
                </label>
                <input
                  id="longitude"
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="34.7616"
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* Comments */}
            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-[#6b3e1d] mb-2">
                Other Comments
              </label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                placeholder="e.g., Contamination observed, unusual items found, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-[#6b3e1d] hover:bg-[#583014] text-white"
              size="lg"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Collection"
              )}
            </Button>

            {success && (
              <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-md text-center">
                <p className="text-sm text-green-800 font-medium">
                  Collection submitted successfully!
                </p>
              </div>
            )}
          </form>

          <div className="flex space-x-4 mt-6">
            <Link href="/">
              <Button
                variant="outline"
                className="border-[#6b3e1d] text-[#6b3e1d] hover:bg-amber-200/30"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-amber-300 text-white text-center py-4">
        © {new Date().getFullYear()} CE4HOW Initiative — Taka ni Mali Dashboard
      </footer>
    </div>
  );
}
