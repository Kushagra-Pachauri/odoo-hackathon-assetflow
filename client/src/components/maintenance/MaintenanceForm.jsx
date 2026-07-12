import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createMaintenanceRequest } from "@/services/maintenanceService";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
      toast.success("Maintenance request raised successfully.");
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Raise Maintenance Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="mb-2 block text-sm font-medium">Priority</label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && (
                <p className="mt-1 text-sm text-red-500">{errors.priority.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Issue Description</label>
              <Controller
                name="issue_description"
                control={control}
                render={({ field }) => (
                  <Textarea 
                    placeholder="Describe the issue in detail..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                )}
              />
              {errors.issue_description && (
                <p className="mt-1 text-sm text-red-500">{errors.issue_description.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Photo URL (Optional)</label>
              <Controller
                name="photo_url"
                control={control}
                render={({ field }) => (
                  <Input placeholder="https://example.com/photo.jpg" {...field} />
                )}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default MaintenanceForm;
