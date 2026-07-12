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

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function Allocations() {
  const { user } = useAuth();
  
  const [allocations, setAllocations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [transfers, setTransfers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);

  // Check roles for Pending Transfers visibility
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

    // Socket.io integration
    const socket = io("http://localhost:4000", {
      withCredentials: true,
    });

    socket.on("connect", () => {
      // Backend expects join with employeeId if we want direct notifications,
      // but we are listening to global/broadcasted events per prompt as well.
      if (user?.id) {
        socket.emit("join", user.id);
      }
    });

    const refreshData = () => {
      fetchData();
    };

    // Subscribing to required events
    socket.on("allocation:created", refreshData);
    socket.on("allocation:blocked", refreshData);
    socket.on("transfer:approved", refreshData);
    // Also subscribe to backend's actual notification event just in case
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
      toast.success("Transfer approved successfully.");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve transfer.");
    }
  };

  const handleRejectTransfer = () => {
    // Backend doesn't have a reject endpoint yet
    toast.error("Reject transfer API not yet implemented by backend.");
  };

  const isOverdue = (expectedDate, status) => {
    if (status === "returned" || !expectedDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const returnDate = new Date(expectedDate);
    return returnDate < today;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Allocation & Transfer</h1>
        <p className="text-muted-foreground">
          Assign assets to employees and manage transfer requests.
        </p>
      </div>

      <AllocationForm 
        assets={assets} 
        employees={employees} 
        onSuccess={fetchData} 
      />

      {canManageTransfers && (
        <Card className="mb-6 border-blue-100">
          <CardHeader className="bg-blue-50/50 pb-4">
            <CardTitle className="text-blue-800">Pending Transfers</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Requested To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.filter(t => t.status === "requested").length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      No pending transfers.
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers
                    .filter((t) => t.status === "requested")
                    .map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell>{transfer.requested_by_name || "Unknown"}</TableCell>
                        <TableCell>{transfer.requested_to_name || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRejectTransfer(transfer.id)}
                          >
                            Reject
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveTransfer(transfer.id)}
                          >
                            Approve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Holder</TableHead>
                <TableHead>Allocated Date</TableHead>
                <TableHead>Expected Return</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Loading allocations...
                  </TableCell>
                </TableRow>
              ) : allocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No allocations found.
                  </TableCell>
                </TableRow>
              ) : (
                allocations.map((alloc) => {
                  const overdue = isOverdue(alloc.expected_return_date, alloc.status);
                  return (
                    <TableRow key={alloc.id}>
                      <TableCell className="font-medium">
                        {alloc.asset_name} ({alloc.asset_tag})
                      </TableCell>
                      <TableCell>{alloc.employee_name}</TableCell>
                      <TableCell>
                        {alloc.allocated_at ? new Date(alloc.allocated_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className={overdue ? "text-red-600 font-medium" : ""}>
                        {alloc.expected_return_date ? new Date(alloc.expected_return_date).toLocaleDateString() : "—"}
                        {overdue && <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Overdue</span>}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            alloc.status === "active"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }
                        >
                          {alloc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {alloc.status === "active" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedAllocation(alloc);
                              setReturnDialogOpen(true);
                            }}
                          >
                            Mark Returned
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
