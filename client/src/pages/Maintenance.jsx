import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";

import {
  getMaintenanceRequests,
  approveMaintenance,
  resolveMaintenance,
} from "@/services/maintenanceService";
import { getAssets } from "@/services/assetService";

import MaintenanceForm from "@/components/maintenance/MaintenanceForm";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function Maintenance() {
  const { user } = useAuth();
  const socket = useSocket();
  
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // For Admin Assign action
  const isAdmin = user?.role === "admin";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, assetRes] = await Promise.all([
        getMaintenanceRequests(),
        getAssets(),
      ]);
      setRequests(reqRes);
      setAssets(assetRes);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load maintenance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Listen to socket to auto-refresh lists when notification arrives
  useEffect(() => {
    if (!socket) return;
    
    const refreshData = () => fetchData();
    
    socket.on("notification", refreshData);
    socket.on("notification:new", refreshData);
    
    return () => {
      socket.off("notification", refreshData);
      socket.off("notification:new", refreshData);
    };
  }, [socket]);

  const handleApprove = async (id) => {
    const technician = prompt("Enter Technician Name:");
    if (!technician) {
      if (technician === "") toast.error("Technician name is required to approve.");
      return;
    }

    try {
      await approveMaintenance(id, { technician });
      toast.success("Maintenance approved and technician assigned.");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve maintenance.");
    }
  };

  const handleResolve = async (id) => {
    if (!confirm("Are you sure you want to mark this as resolved?")) return;

    try {
      await resolveMaintenance(id);
      toast.success("Maintenance marked as resolved.");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to resolve maintenance.");
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Low": return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      case "Medium": return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>;
      case "High": return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "Critical": return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Group requests based on available backend states
  const pendingRequests = requests.filter(r => r.status === "pending");
  const approvedRequests = requests.filter(r => r.status === "approved");
  const resolvedRequests = requests.filter(r => r.status === "resolved");

  const renderRequestCard = (req) => (
    <Card key={req.id} className="mb-3 shadow-sm border-slate-200">
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-sm">
            {req.asset_name} ({req.asset_tag})
          </h4>
          {getPriorityBadge(req.priority)}
        </div>
        
        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
          {req.issue_description}
        </p>

        <div className="flex justify-between items-end mt-2">
          <div className="text-xs text-muted-foreground flex flex-col gap-1">
            <span>Raised by: {req.raised_by_name}</span>
            {req.technician && <span>Assigned to: <span className="font-medium text-slate-800">{req.technician}</span></span>}
            {req.resolved_at && <span>Resolved: {new Date(req.resolved_at).toLocaleDateString()}</span>}
          </div>
          
          <div className="space-x-2">
            {isAdmin && req.status === "pending" && (
              <Button size="sm" onClick={() => handleApprove(req.id)}>Approve / Assign</Button>
            )}
            {isAdmin && req.status === "approved" && (
              <Button size="sm" variant="secondary" onClick={() => handleResolve(req.id)}>Resolve</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Maintenance</h1>
        <p className="text-muted-foreground">
          Track issues and coordinate repairs.
        </p>
      </div>

      <MaintenanceForm assets={assets} onSuccess={fetchData} />

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading maintenance requests...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="bg-slate-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Pending</h3>
              <Badge variant="outline">{pendingRequests.length}</Badge>
            </div>
            <div className="space-y-2">
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-4">No pending requests.</p>
              ) : (
                pendingRequests.map(renderRequestCard)
              )}
            </div>
          </div>

          {/* Approved / Assigned Column */}
          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-900">Approved / Assigned</h3>
              <Badge className="bg-blue-100 text-blue-800">{approvedRequests.length}</Badge>
            </div>
            <div className="space-y-2">
              {approvedRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-4">No ongoing maintenance.</p>
              ) : (
                approvedRequests.map(renderRequestCard)
              )}
            </div>
          </div>

          {/* Resolved Column */}
          <div className="bg-green-50/30 p-4 rounded-lg border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-green-900">Resolved</h3>
              <Badge className="bg-green-100 text-green-800">{resolvedRequests.length}</Badge>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {resolvedRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-4">No resolved requests yet.</p>
              ) : (
                resolvedRequests.map(renderRequestCard)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Maintenance;
