import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { getAssets } from "@/services/assetService";
import { getMaintenanceRequests } from "@/services/maintenanceService";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
const PRIORITY_COLORS = {
  Low: "#94a3b8",      // slate-400
  Medium: "#3b82f6",   // blue-500
  High: "#f97316",     // orange-500
  Critical: "#ef4444", // red-500
};

function Reports() {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Note: As there are no dedicated /api/reports endpoints yet, 
        // we aggregate data locally from existing models as a temporary workaround.
        const [assetData, maintData] = await Promise.all([
          getAssets(),
          getMaintenanceRequests(),
        ]);
        
        setAssets(assetData);
        setMaintenance(maintData);
      } catch (error) {
        console.error("Failed to fetch report data", error);
        toast.error("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 1. Asset Status Distribution (Pie Chart)
  const statusCounts = assets.reduce((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {});
  
  const statusData = Object.keys(statusCounts).map(status => ({
    name: status.replace("_", " ").toUpperCase(),
    value: statusCounts[status],
  }));

  // 2. Assets by Category (Bar Chart)
  const categoryCounts = assets.reduce((acc, asset) => {
    acc[asset.category_name] = (acc[asset.category_name] || 0) + 1;
    return acc;
  }, {});
  
  const categoryData = Object.keys(categoryCounts).map(category => ({
    name: category || "Uncategorized",
    count: categoryCounts[category],
  })).sort((a, b) => b.count - a.count);

  // 3. Maintenance Priority Distribution (Pie Chart)
  const priorityCounts = maintenance.reduce((acc, req) => {
    acc[req.priority] = (acc[req.priority] || 0) + 1;
    return acc;
  }, {});

  const priorityData = Object.keys(priorityCounts).map(priority => ({
    name: priority,
    value: priorityCounts[priority],
    color: PRIORITY_COLORS[priority] || "#ccc",
  }));

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Visual insights into asset utilization and maintenance health.
          <br/>
          <span className="text-xs italic text-blue-600">
            * Currently aggregating locally via existing APIs. Dedicated report APIs are pending.
          </span>
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Aggregating data...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Asset Status */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Status Distribution</CardTitle>
              <CardDescription>Current state of all tracked hardware</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {statusData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">No assets found</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Chart 2: Maintenance Priorities */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Priorities</CardTitle>
              <CardDescription>Volume of requests by urgency</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {priorityData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">No maintenance data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Chart 3: Assets by Category */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Inventory by Category</CardTitle>
              <CardDescription>Total count of assets across all active categories</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {categoryData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">No category data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Assets" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}

export default Reports;
