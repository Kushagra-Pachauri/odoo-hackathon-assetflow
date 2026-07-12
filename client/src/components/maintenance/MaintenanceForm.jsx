import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createMaintenanceRequest } from "@/services/maintenanceService";

const maintenanceSchema = z.object({
  asset_id: z.string().min(1, "Asset is required"),
  issue_description: z.string().min(10, "Issue description must be at least 10 characters"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  photo_url: z.string().optional(),
});

function MaintenanceForm({ assets = [], onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      asset_id: "",
      issue_description: "",
      priority: "Medium",
      photo_url: "",
    },
  });

  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      await createMaintenanceRequest(values);
      toast.success("Maintenance request raised.");
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Maintenance Request Error:", error);
      toast.error("Failed to raise maintenance request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-line rounded-md overflow-hidden">
      <div className="px-5 py-3 border-b border-line">
        <h2 className="font-display font-medium text-sm text-ink">Raise maintenance request</h2>
      </div>
      <div className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">Priority</label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                )}
              />
              {errors.priority && (
                <p className="mt-1 text-xs text-status-alert">{errors.priority.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">Issue Description</label>
              <Controller
                name="issue_description"
                control={control}
                render={({ field }) => (
                  <textarea
                    placeholder="Describe the issue in detail…"
                    rows={4}
                    {...field}
                    className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                )}
              />
              {errors.issue_description && (
                <p className="mt-1 text-xs text-status-alert">{errors.issue_description.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">Photo URL (Optional)</label>
              <Controller
                name="photo_url"
                control={control}
                render={({ field }) => (
                  <input
                    placeholder="https://example.com/photo.jpg"
                    {...field}
                    className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                )}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-[13px] font-sans bg-ink text-paper rounded-md transition-colors duration-150 hover:bg-ink/90 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MaintenanceForm;
