import { useEffect, useState } from "react";
import { toast } from "sonner";
import { io } from "socket.io-client";

import { useAuth } from "@/context/AuthContext";
import { getAllocations } from "@/services/allocationService";
import { getAssets } from "@/services/assetService";
import { getEmployees } from "@/services/employeeService";
import { getTransferRequests, approveTransfer } from "@/services/transferService";

import AllocationForm from "@/components/allocations/AllocationForm";
import ReturnAssetDialog from "@/components/allocations/ReturnAssetDialog";

import Tag from "@/components/shared/Tag";
import StatusDot from "@/components/shared/StatusDot";
import Stepper from "@/components/shared/Stepper";

const TRANSFER_STEPS = ["Requested", "Approved", "Re-allocated"];

function getTransferStepIndex(status) {
  switch (status) {
    case "requested": return 0;
    case "approved": return 1;
    case "completed": return 2;
    default: return 0;
  }
}

function Allocations() {
  const { user } = useAuth();

  const [allocations, setAllocations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [transfers, setTransfers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);

  const canManageTransfers = ["admin", "department_head", "asset_manager"].includes(user?.role);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, assetRes, empRes] = await Promise.all([
        getAllocations(),
        getAssets(),
        getEmployees(),
      ]);
      setAllocations(allocRes);
      setAssets(assetRes);
      setEmployees(empRes);

      if (canManageTransfers) {
        const transRes = await getTransferRequests();
        setTransfers(transRes);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load allocation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = io("http://localhost:4000", { withCredentials: true });

    socket.on("connect", () => {
      if (user?.id) socket.emit("join", user.id);
    });

    const refreshData = () => fetchData();

    socket.on("allocation:created", refreshData);
    socket.on("allocation:blocked", refreshData);
    socket.on("transfer:approved", refreshData);
    socket.on("notification", refreshData);

    return () => {
      socket.off("allocation:created", refreshData);
      socket.off("allocation:blocked", refreshData);
      socket.off("transfer:approved", refreshData);
      socket.off("notification", refreshData);
      socket.disconnect();
    };
  }, [user]);

  const handleApproveTransfer = async (transferId) => {
    try {
      await approveTransfer(transferId);
      toast.success("Transfer approved.");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve transfer.");
    }
  };

  const isOverdue = (expectedDate, status) => {
    if (status === "returned" || !expectedDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(expectedDate) < today;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Allocation & Transfer</h1>
        <p className="font-sans text-sm text-ink/50 mt-0.5">
          Assign assets to employees and manage transfer requests.
        </p>
      </div>

      <AllocationForm
        assets={assets}
        employees={employees}
        onSuccess={fetchData}
      />

      {/* Pending Transfers */}
      {canManageTransfers && (
        <div className="bg-white border border-line rounded-md overflow-hidden">
          <div className="px-5 py-3 border-b border-line">
            <h2 className="font-display font-medium text-sm text-ink">Pending transfers</h2>
          </div>
          <div>
            {transfers.filter((t) => t.status === "requested").length === 0 ? (
              <div className="px-5 py-6 text-center text-sm text-ink/40 font-sans">
                No pending transfer requests — all allocations are settled.
              </div>
            ) : (
              <div className="divide-y divide-line">
                {transfers
                  .filter((t) => t.status === "requested")
                  .map((transfer) => (
                    <div key={transfer.id} className="px-5 py-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-sans">
                          <span className="text-ink/60">From</span>{" "}
                          <span className="font-medium text-ink">{transfer.requested_by_name || "Unknown"}</span>
                          <span className="text-ink/60 mx-2">→</span>
                          <span className="font-medium text-ink">{transfer.requested_to_name || "Unknown"}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveTransfer(transfer.id)}
                            className="px-3 py-1.5 text-[12px] font-sans bg-ink text-paper rounded-md transition-colors duration-150 hover:bg-ink/90"
                          >
                            Approve transfer
                          </button>
                        </div>
                      </div>
                      <div className="max-w-xs">
                        <Stepper steps={TRANSFER_STEPS} currentIndex={getTransferStepIndex(transfer.status)} />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current Allocations Table */}
      <div className="bg-white border border-line rounded-md overflow-hidden">
        <div className="px-5 py-3 border-b border-line">
          <h2 className="font-display font-medium text-sm text-ink">Current allocations</h2>
        </div>
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Asset</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Holder</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Allocated</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Expected return</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Status</th>
              <th className="text-right px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center text-ink/40 py-8">Loading allocations…</td>
              </tr>
            ) : allocations.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-ink/40 py-8">
                  No allocations yet — assign an asset above to get started.
                </td>
              </tr>
            ) : (
              allocations.map((alloc) => {
                const overdue = isOverdue(alloc.expected_return_date, alloc.status);
                return (
                  <tr key={alloc.id} className="border-b border-line last:border-b-0 transition-colors duration-150 hover:bg-accent/[0.04]">
                    <td className="px-4 py-3">
                      <span className="text-ink">{alloc.asset_name}</span>{" "}
                      <Tag>{alloc.asset_tag}</Tag>
                    </td>
                    <td className="px-4 py-3 text-ink">{alloc.employee_name}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-ink/60">
                        {alloc.allocated_at ? new Date(alloc.allocated_at).toLocaleDateString() : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs ${overdue ? "text-status-alert font-medium" : "text-ink/60"}`}>
                        {alloc.expected_return_date ? new Date(alloc.expected_return_date).toLocaleDateString() : "—"}
                      </span>
                      {overdue && (
                        <StatusDot status="overdue" label="OVERDUE" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusDot status={alloc.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {alloc.status === "active" && (
                        <button
                          onClick={() => {
                            setSelectedAllocation(alloc);
                            setReturnDialogOpen(true);
                          }}
                          className="px-3 py-1.5 text-[12px] font-sans border border-line rounded-md text-ink bg-transparent transition-colors duration-150 hover:bg-accent/5"
                        >
                          Mark returned
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ReturnAssetDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        allocation={selectedAllocation}
        onSuccess={fetchData}
      />
    </div>
  );
}

export default Allocations;
