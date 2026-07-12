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
import Tag from "@/components/shared/Tag";
import StatusDot from "@/components/shared/StatusDot";
import Stepper from "@/components/shared/Stepper";

const MAINTENANCE_STEPS = ["Pending", "Approved", "Technician Assigned", "Resolved"];

function getMaintenanceStepIndex(status, technician) {
  if (status === "resolved") return 3;
  if (status === "approved" && technician) return 2;
  if (status === "approved") return 1;
  return 0; // pending
}

function Maintenance() {
  const { user } = useAuth();
  const socket = useSocket();

  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

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
      toast.error("Failed to load maintenance requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    if (technician === null) return;
    if (technician.trim() === "") {
      toast.error("Technician name is required to approve.");
      return;
    }

    try {
      await approveMaintenance(id, { technician });
      toast.success("Maintenance request approved and technician assigned.");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve maintenance request.");
    }
  };

  const handleResolve = async (id) => {
    if (!confirm("Are you sure you want to resolve this maintenance request?")) return;

    try {
      await resolveMaintenance(id);
      toast.success("Maintenance request resolved.");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to resolve maintenance request.");
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const resolvedRequests = requests.filter((r) => r.status === "resolved");

  const renderRequestCard = (req) => (
    <div key={req.id} className="bg-white border border-line rounded-md p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <h4 className="font-sans text-sm font-semibold text-ink">
          {req.asset_name} <Tag>{req.asset_tag}</Tag>
        </h4>
        <StatusDot status={req.priority.toLowerCase()} label={req.priority} />
      </div>

      <p className="text-sm text-ink/70 whitespace-pre-wrap leading-relaxed">
        {req.issue_description}
      </p>

      <div className="mt-1">
        <Stepper
          steps={MAINTENANCE_STEPS}
          currentIndex={getMaintenanceStepIndex(req.status, req.technician)}
        />
      </div>

      <div className="flex justify-between items-end mt-2 pt-2 border-t border-line">
        <div className="text-xs text-ink/50 flex flex-col gap-1 font-mono">
          <span>Raised by: {req.raised_by_name}</span>
          {req.technician && (
            <span>
              Technician: <span className="font-medium text-ink">{req.technician}</span>
            </span>
          )}
          {req.resolved_at && (
            <span>Resolved: {new Date(req.resolved_at).toLocaleDateString()}</span>
          )}
        </div>

        <div className="space-x-2">
          {isAdmin && req.status === "pending" && (
            <button
              onClick={() => handleApprove(req.id)}
              className="px-3 py-1.5 text-xs font-sans bg-ink text-paper rounded-md transition-colors duration-150 hover:bg-ink/90"
            >
              Approve / Assign
            </button>
          )}
          {isAdmin && req.status === "approved" && (
            <button
              onClick={() => handleResolve(req.id)}
              className="px-3 py-1.5 text-xs font-sans border border-line rounded-md text-ink bg-transparent transition-colors duration-150 hover:bg-accent/5"
            >
              Resolve request
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Maintenance</h1>
        <p className="font-sans text-sm text-ink/50 mt-0.5">
          Track issues and coordinate repairs.
        </p>
      </div>

      <MaintenanceForm assets={assets} onSuccess={fetchData} />

      {loading ? (
        <div className="text-center py-10 text-ink/40 font-sans">Loading maintenance requests…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="bg-paper border border-line p-4 rounded-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-medium text-sm text-ink">Pending</h3>
              <span className="font-mono text-xs text-ink/40">{pendingRequests.length}</span>
            </div>
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <p className="text-xs text-ink/30 italic text-center py-6">No pending requests.</p>
              ) : (
                pendingRequests.map(renderRequestCard)
              )}
            </div>
          </div>

          {/* Approved / Assigned Column */}
          <div className="bg-paper border border-line p-4 rounded-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-medium text-sm text-ink">Approved / Assigned</h3>
              <span className="font-mono text-xs text-ink/40">{approvedRequests.length}</span>
            </div>
            <div className="space-y-3">
              {approvedRequests.length === 0 ? (
                <p className="text-xs text-ink/30 italic text-center py-6">No active maintenance.</p>
              ) : (
                approvedRequests.map(renderRequestCard)
              )}
            </div>
          </div>

          {/* Resolved Column */}
          <div className="bg-paper border border-line p-4 rounded-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-medium text-sm text-ink">Resolved</h3>
              <span className="font-mono text-xs text-ink/40">{resolvedRequests.length}</span>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {resolvedRequests.length === 0 ? (
                <p className="text-xs text-ink/30 italic text-center py-6">No resolved requests yet.</p>
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
