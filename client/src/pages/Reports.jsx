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

const BRAND_COLORS = ["#1E7F91", "#3F7D45", "#B8720E", "#A8321F", "#8D97A6"];
const PRIORITY_COLORS = {
  Low: "#8D97A6",
  Medium: "#1E7F91",
  High: "#B8720E",
  Critical: "#A8321F",
};

function Reports() {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

  // 1. Asset Status Distribution
  const statusCounts = assets.reduce((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.keys(statusCounts).map((status) => ({
    name: status.replace("_", " ").toUpperCase(),
    value: statusCounts[status],
  }));

  // 2. Assets by Category
  const categoryCounts = assets.reduce((acc, asset) => {
    acc[asset.category_name] = (acc[asset.category_name] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.keys(categoryCounts)
    .map((category) => ({
      name: category || "Uncategorized",
      count: categoryCounts[category],
    }))
    .sort((a, b) => b.count - a.count);

  // 3. Maintenance Priority Distribution
  const priorityCounts = maintenance.reduce((acc, req) => {
    acc[req.priority] = (acc[req.priority] || 0) + 1;
    return acc;
  }, {});

  const priorityData = Object.keys(priorityCounts).map((priority) => ({
    name: priority,
    value: priorityCounts[priority],
    color: PRIORITY_COLORS[priority] || "#8D97A6",
  }));

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Reports & Analytics</h1>
        <p className="font-sans text-sm text-ink/50 mt-0.5">
          Visual insights into asset utilization and maintenance health.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-ink/40 font-sans">Aggregating report data…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Asset Status */}
          <div className="bg-white border border-line rounded-md overflow-hidden">
            <div className="px-5 py-3 border-b border-line">
              <h2 className="font-display font-medium text-sm text-ink">Asset Status Distribution</h2>
              <p className="font-sans text-xs text-ink/50 mt-0.5">Current state of all tracked hardware</p>
            </div>
            <div className="p-5 h-[300px]">
              {statusData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-ink/30 font-sans text-sm">
                  No assets found
                </div>
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
                      fill="#1E7F91"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontFamily: "IBM Plex Sans", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Maintenance Priorities */}
          <div className="bg-white border border-line rounded-md overflow-hidden">
            <div className="px-5 py-3 border-b border-line">
              <h2 className="font-display font-medium text-sm text-ink">Maintenance Priorities</h2>
              <p className="font-sans text-xs text-ink/50 mt-0.5">Volume of requests by urgency</p>
            </div>
            <div className="p-5 h-[300px]">
              {priorityData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-ink/30 font-sans text-sm">
                  No maintenance data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontFamily: "IBM Plex Sans", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 3: Assets by Category */}
          <div className="bg-white border border-line rounded-md overflow-hidden lg:col-span-2">
            <div className="px-5 py-3 border-b border-line">
              <h2 className="font-display font-medium text-sm text-ink">Inventory by Category</h2>
              <p className="font-sans text-xs text-ink/50 mt-0.5">Total count of assets across all active categories</p>
            </div>
            <div className="p-5 h-[350px]">
              {categoryData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-ink/30 font-sans text-sm">
                  No category data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D8D9D2" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontFamily: "IBM Plex Sans", fontSize: 11, fill: "#14243B" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: "#14243B" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(30,127,145,0.04)" }}
                      contentStyle={{
                        borderRadius: "6px",
                        border: "1px solid #D8D9D2",
                        fontFamily: "IBM Plex Sans",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#1E7F91"
                      radius={[4, 4, 0, 0]}
                      name="Total Assets"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
