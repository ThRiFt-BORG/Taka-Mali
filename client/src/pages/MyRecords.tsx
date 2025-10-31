import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * MyRecords page - allows collectors to view their own submitted data
 */
export default function MyRecords() {
  const { user, isAuthenticated } = useAuth();
  const { data: records, isLoading } = trpc.collections.myRecords.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "collector" || user?.role === "admin"),
  });

  // Redirect if not authenticated or not a collector
  if (!isAuthenticated || (user?.role !== "collector" && user?.role !== "admin")) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Only collectors can access this page. Please log in with a collector account.
            </p>
            <Link href="/">
              <Button className="w-full">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Records</h1>
          <p className="text-muted-foreground">
            View all waste collection records you have submitted
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <Link href="/collector">
            <Button>Submit New Record</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">View Dashboard</Button>
          </Link>
        </div>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Records ({records?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {records && records.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Site</th>
                      <th className="text-left py-3 px-4 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Volume (tons)</th>
                      <th className="text-left py-3 px-4 font-semibold">Separated</th>
                      <th className="text-left py-3 px-4 font-semibold">Collections</th>
                      <th className="text-left py-3 px-4 font-semibold">Coordinates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record: any) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {new Date(record.collectionDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">{record.siteName}</td>
                        <td className="py-3 px-4">{record.wasteType}</td>
                        <td className="py-3 px-4">{record.totalVolume}</td>
                        <td className="py-3 px-4">
                          {record.wasteSeparated ? (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                              No
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">{record.collectionCount}</td>
                        <td className="py-3 px-4 text-xs">
                          {record.latitude && record.longitude ? (
                            <span>
                              {parseFloat(record.latitude).toFixed(4)},
                              {parseFloat(record.longitude).toFixed(4)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No records submitted yet</p>
                <Link href="/collector">
                  <Button>Submit Your First Record</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

