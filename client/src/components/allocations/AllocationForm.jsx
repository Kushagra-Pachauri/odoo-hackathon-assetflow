import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { allocateAsset } from "@/services/allocationService";
import { createTransferRequest } from "@/services/transferService";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const allocateSchema = z.object({
  asset_id: z.string().min(1, "Asset is required"),
  employee_id: z.string().min(1, "Employee is required"),
  expected_return_date: z.string().optional(),
});

function AllocationForm({ assets = [], employees = [], onSuccess }) {
  const [conflictData, setConflictData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(allocateSchema),
    defaultValues: {
      asset_id: "",
      employee_id: "",
      expected_return_date: "",
    },
  });

  async function onSubmit(values) {
    try {
      setIsSubmitting(true);
      setConflictData(null); // clear previous conflicts

      const payload = { ...values };
      if (!payload.expected_return_date) {
        delete payload.expected_return_date;
      }

      await allocateAsset(payload);
      toast.success("Asset allocated successfully");
      reset();
      
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Allocation Error:", error);
      
      const status = error.response?.status;
      
      // Handle both 400 and 409 as per instructions for temporary support
      if (status === 409 || status === 400) {
        // Try to get current holder from response if available
        let holderName = error.response?.data?.currentHolder?.name;
        let activeAllocationId = error.response?.data?.currentHolder?.allocation_id;
        
        // If 400 and backend hasn't been updated to provide holder details, 
        // try to find it locally (fallback) if we can.
        // Actually, if we just set it to "an employee" if not found, it fulfills the requirement cleanly.
        if (!holderName) holderName = "another employee";
        
        setConflictData({
          holderName,
          allocationId: activeAllocationId,
          requestedAssetId: values.asset_id,
          requestedToEmployeeId: values.employee_id
        });
        
        toast.error("Allocation failed. Asset is already allocated.");
      } else {
        toast.error("Failed to allocate asset.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRequestTransfer() {
    if (!conflictData || !conflictData.allocationId) {
      toast.error("Cannot request transfer: Active allocation ID is missing from server response.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createTransferRequest({
        allocation_id: conflictData.allocationId,
        requested_to_employee_id: conflictData.requestedToEmployeeId,
      });
      
      toast.success("Transfer request submitted successfully.");
      setConflictData(null);
      reset();
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Transfer Request Error:", error);
      toast.error("Failed to submit transfer request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filter out assets that are not available just for better UX, 
  // but we can show all if we want to test the conflict logic.
  // The user says: "allocate an asset in one tab, then attempt to allocate the same asset in a second tab"
  // So we should show ALL assets in the dropdown so they can select an already allocated one to test.
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Allocate Asset</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Asset</label>
              <Controller
                name="asset_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.asset_tag} - {asset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.asset_id && (
                <p className="mt-1 text-sm text-red-500">{errors.asset_id.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Assign To</label>
              <Controller
                name="employee_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.employee_id && (
                <p className="mt-1 text-sm text-red-500">{errors.employee_id.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Expected Return Date</label>
              <Controller
                name="expected_return_date"
                control={control}
                render={({ field }) => (
                  <Input type="date" {...field} />
                )}
              />
              {errors.expected_return_date && (
                <p className="mt-1 text-sm text-red-500">{errors.expected_return_date.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Allocating..." : "Allocate Asset"}
            </Button>
          </div>
        </form>

        {/* Conflict UI */}
        {conflictData && (
          <div className="mt-4 p-4 border border-amber-200 bg-amber-50 rounded-md flex items-center justify-between">
            <div>
              <p className="text-amber-800 font-medium">Allocation Conflict</p>
              <p className="text-amber-700 text-sm">
                Currently held by {conflictData.holderName}.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={handleRequestTransfer}
              disabled={isSubmitting || !conflictData.allocationId}
            >
              Request Transfer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AllocationForm;
