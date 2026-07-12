import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { allocateAsset } from "@/services/allocationService";
import { createTransferRequest } from "@/services/transferService";

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
      setConflictData(null);

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

      if (status === 409 || status === 400) {
        let holderName = error.response?.data?.currentHolder?.name;
        let activeAllocationId = error.response?.data?.currentHolder?.allocation_id;

        if (!holderName) holderName = "another employee";

        setConflictData({
          holderName,
          allocationId: activeAllocationId,
          requestedAssetId: values.asset_id,
          requestedToEmployeeId: values.employee_id,
        });

        toast.error("Allocation conflict detected.");
      } else {
        toast.error("Failed to allocate asset.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRequestTransfer() {
    if (!conflictData || !conflictData.allocationId) {
      toast.error("Cannot request transfer: Active allocation ID is missing.");
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

  return (
    <div className="bg-white border border-line rounded-md overflow-hidden">
      <div className="px-5 py-3 border-b border-line">
        <h2 className="font-display font-medium text-sm text-ink">Allocate asset</h2>
      </div>
      <div className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">Asset</label>
              <Controller
                name="asset_id"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="">Select asset</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.asset_tag} — {asset.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.asset_id && (
                <p className="mt-1 text-xs text-status-alert">{errors.asset_id.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">Assign To</label>
              <Controller
                name="employee_id"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.employee_id && (
                <p className="mt-1 text-xs text-status-alert">{errors.employee_id.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">Expected Return Date</label>
              <Controller
                name="expected_return_date"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    {...field}
                    className="w-full px-3 py-2 text-sm font-mono border border-line rounded-md bg-white text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                )}
              />
              {errors.expected_return_date && (
                <p className="mt-1 text-xs text-status-alert">{errors.expected_return_date.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-[13px] font-sans bg-ink text-paper rounded-md transition-colors duration-150 hover:bg-ink/90 disabled:opacity-50"
            >
              {isSubmitting ? "Allocating…" : "Allocate asset"}
            </button>
          </div>
        </form>

        {/* Conflict UI */}
        {conflictData && (
          <div className="mt-4 p-4 border border-line bg-paper rounded-md flex items-center justify-between">
            <div>
              <p className="text-status-alert font-medium text-sm">Allocation conflict</p>
              <p className="text-ink/60 text-xs mt-0.5">
                Currently held by {conflictData.holderName}.
              </p>
            </div>
            <button
              onClick={handleRequestTransfer}
              disabled={isSubmitting || !conflictData.allocationId}
              className="px-3 py-1.5 text-xs font-sans border border-line rounded-md text-ink bg-transparent transition-colors duration-150 hover:bg-accent/5"
            >
              Request transfer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllocationForm;
