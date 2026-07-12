import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Box, Wrench, CalendarClock, AlertTriangle, Users, BookOpen } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { useCountUp } from "@/hooks/useCountUp";

import { getDashboardStats } from "@/services/dashboardService";
import { getAllocations } from "@/services/allocationService";

import Tag from "@/components/shared/Tag";

/* ---- KPI Card with count-up + socket flash ---- */
function KpiCard({ value, label, loading, flashKey }) {
  const animatedValue = useCountUp(loading ? 0 : value);
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value && prevRef.current !== 0) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 400);
      return () => clearTimeout(t);
    }
    prevRef.current = value;
  }, [value, flashKey]);

  return (
    <div
      className={`relative bg-white border border-line rounded-md p-5 transition-colors duration-400 ${
        flash ? "animate-kpi-flash" : ""
      }`}
    >
      {/* Punched hole */}
      <span
        aria-hidden="true"
        className="absolute top-2 right-2 w-[6px] h-[6px] rounded-full bg-paper border border-line"
      />

      <span className="font-mono text-2xl font-medium text-ink block">
        {loading ? "—" : animatedValue}
      </span>
      <span className="font-sans text-[11px] uppercase tracking-wide text-ink/40 mt-1 block">
        {label}
      </span>
    </div>
  );
}

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
  const [flashKey, setFlashKey] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, allocRes] = await Promise.all([
        getDashboardStats(),
        getAllocations(),
      ]);

      setStats(statsRes);

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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket: refresh and trigger flash
  useEffect(() => {
    if (!socket) return;

    const refreshData = () => {
      fetchData();
      setFlashKey((k) => k + 1);
    };

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
  }, [socket, fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="font-sans text-sm text-ink/50 mt-0.5">
            Live overview of asset operations and metrics.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/assets")}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-[13px] font-sans border border-line rounded-md text-ink bg-transparent transition-colors duration-150 hover:bg-accent/5"
          >
            <Box className="w-3.5 h-3.5" /> Register asset
          </button>
          <button
            onClick={() => navigate("/booking")}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-[13px] font-sans border border-line rounded-md text-ink bg-transparent transition-colors duration-150 hover:bg-accent/5"
          >
            <CalendarClock className="w-3.5 h-3.5" /> Book resource
          </button>
          <button
            onClick={() => navigate("/maintenance")}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-[13px] font-sans border border-line rounded-md text-ink bg-transparent transition-colors duration-150 hover:bg-accent/5"
          >
            <Wrench className="w-3.5 h-3.5" /> Raise request
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard value={stats.totalAssets} label="Total assets" loading={loading} flashKey={flashKey} />
        <KpiCard value={stats.allocatedAssets} label="Allocated assets" loading={loading} flashKey={flashKey} />
        <KpiCard value={stats.activeBookings} label="Active bookings" loading={loading} flashKey={flashKey} />
        <KpiCard value={stats.pendingMaintenance} label="Pending maintenance" loading={loading} flashKey={flashKey} />
      </div>

      {/* Overdue Returns — flagged, not loud */}
      <div className="bg-white border border-line rounded-md border-l-2 border-l-status-alert overflow-hidden"
        style={{ backgroundColor: "rgba(241,242,237,0.3)" }}
      >
        <div className="px-5 py-3 border-b border-line flex items-center justify-between">
          <h2 className="font-display font-medium text-sm text-ink flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-status-alert" />
            Overdue returns
          </h2>
          <span className="font-mono text-[11px] text-status-alert">
            {overdueAllocations.length} action required
          </span>
        </div>
        <div>
          {loading ? (
            <div className="px-5 py-6 text-center text-sm text-ink/40 font-sans">Scanning for overdue items…</div>
          ) : overdueAllocations.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-ink/50 font-sans">
              No overdue allocations — all returns are on schedule.
            </div>
          ) : (
            <div className="divide-y divide-line">
              {overdueAllocations.map((alloc) => (
                <div
                  key={alloc.id}
                  className="px-5 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-colors duration-150 hover:bg-accent/[0.04]"
                >
                  <div>
                    <h4 className="font-sans text-sm font-medium text-ink">
                      {alloc.asset_name} <Tag>{alloc.asset_tag}</Tag>
                    </h4>
                    <p className="font-sans text-xs text-ink/50 mt-0.5">
                      Held by: <span className="font-medium text-ink/70">{alloc.employee_name}</span>
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 text-right">
                    <p className="font-mono text-xs text-status-alert font-medium">
                      Due: {new Date(alloc.expected_return_date).toLocaleDateString()}
                    </p>
                    <p className="font-mono text-[10px] text-ink/30 mt-0.5">
                      Allocated: {new Date(alloc.allocated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;