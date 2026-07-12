import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Box, Wrench, Calendar, AlertTriangle, Users, BookOpen } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

import { getDashboardStats } from "@/services/dashboardService";
import { getAllocations } from "@/services/allocationService";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function Dashboard() {
  const navigate = useNavigate();
  const socket = useSocket();

  const [stats, setStats] = useState({
    totalAssets: 0,
    availableAssets: 0,
    allocatedAssets: 0,
    maintenanceAssets: 0,
    totalEmployees: 0,
    activeBookings: 0,
    pendingMaintenance: 0,
  });
  
  const [overdueAllocations, setOverdueAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, allocRes] = await Promise.all([
        getDashboardStats(),
        getAllocations(),
      ]);

      setStats(statsRes);

      // Compute Overdue (Separate from upcoming)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdue = allocRes.filter((alloc) => {
        if (alloc.status === "returned" || !alloc.expected_return_date) return false;
        const returnDate = new Date(alloc.expected_return_date);
        return returnDate < today;
      });

      setOverdueAllocations(overdue);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Master Socket Subscription for Live Reload
  useEffect(() => {
    if (!socket) return;
    
    const refreshData = () => fetchData();
    
    // Subscribe to all platform events
    socket.on("notification", refreshData);
    socket.on("notification:new", refreshData);
    socket.on("allocation:created", refreshData);
    socket.on("allocation:blocked", refreshData);
    socket.on("transfer:approved", refreshData);
    socket.on("booking:created", refreshData);
    socket.on("booking:cancelled", refreshData);
    
    return () => {
      socket.off("notification", refreshData);
      socket.off("notification:new", refreshData);
      socket.off("allocation:created", refreshData);
      socket.off("allocation:blocked", refreshData);
      socket.off("transfer:approved", refreshData);
      socket.off("booking:created", refreshData);
      socket.off("booking:cancelled", refreshData);
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Live overview of asset operations and metrics.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate("/assets")} variant="outline" className="border-blue-200 hover:bg-blue-50">
            <Box className="w-4 h-4 mr-2" /> Register Asset
          </Button>
          <Button onClick={() => navigate("/booking")} variant="outline" className="border-green-200 hover:bg-green-50">
            <Calendar className="w-4 h-4 mr-2" /> Book Resource
          </Button>
          <Button onClick={() => navigate("/maintenance")} variant="outline" className="border-orange-200 hover:bg-orange-50">
            <Wrench className="w-4 h-4 mr-2" /> Raise Request
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.totalAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.availableAssets} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocated Assets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.allocatedAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently held by employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled resource usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.maintenanceAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingMaintenance} pending requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Returns Section (Strictly Red, Completely Isolated) */}
      <Card className="border-red-200 shadow-sm">
        <CardHeader className="bg-red-50/50 pb-4 border-b border-red-100 flex flex-row items-center justify-between">
          <CardTitle className="text-red-800 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" /> 
            Overdue Returns
          </CardTitle>
          <Badge variant="destructive" className="bg-red-600">
            {overdueAllocations.length} Action Required
          </Badge>
        </CardHeader>
        <CardContent className="pt-4 p-0">
          {loading ? (
            <div className="p-8 text-center text-red-500">Scanning for overdue items...</div>
          ) : overdueAllocations.length === 0 ? (
            <div className="p-8 text-center text-green-700 font-medium">
              Excellent! There are no overdue allocations.
            </div>
          ) : (
            <div className="divide-y divide-red-100">
              {overdueAllocations.map((alloc) => (
                <div key={alloc.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-red-50/20 hover:bg-red-50/50 transition-colors">
                  <div>
                    <h4 className="font-semibold text-red-900">
                      {alloc.asset_name} ({alloc.asset_tag})
                    </h4>
                    <p className="text-sm text-red-700 mt-1">
                      Held by: <span className="font-medium">{alloc.employee_name}</span>
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 text-right">
                    <p className="text-sm font-bold text-red-600">
                      Due: {new Date(alloc.expected_return_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      Allocated: {new Date(alloc.allocated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;