import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createBooking } from "@/services/bookingService";

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
import { Badge } from "@/components/ui/badge";

const bookingSchema = z.object({
  asset_id: z.string().min(1, "Asset is required"),
  date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  purpose: z.string().optional(),
}).refine(data => {
  if (data.start_time && data.end_time) {
    const start = new Date(`1970-01-01T${data.start_time}`);
    const end = new Date(`1970-01-01T${data.end_time}`);
    return start < end;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["end_time"],
});

function BookingForm({ assets = [], bookings = [], onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState(null);

  const bookableAssets = useMemo(() => {
    return assets.filter((asset) => asset.is_bookable === true);
  }, [assets]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      asset_id: "",
      date: "",
      start_time: "",
      end_time: "",
      purpose: "",
    },
  });

  const selectedAssetId = watch("asset_id");
  const selectedDate = watch("date");

  // Filter bookings for the day view
  const dayBookings = useMemo(() => {
    if (!selectedAssetId || !selectedDate) return [];
    
    return bookings.filter((b) => {
      if (b.status === "cancelled" || b.asset_id !== selectedAssetId) return false;
      const bDate = new Date(b.starts_at).toISOString().split("T")[0];
      return bDate === selectedDate;
    }).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  }, [bookings, selectedAssetId, selectedDate]);

  async function onSubmit(values) {
    setConflictError(null);
    setIsSubmitting(true);

    const starts_at = new Date(`${values.date}T${values.start_time}:00Z`).toISOString();
    const ends_at = new Date(`${values.date}T${values.end_time}:00Z`).toISOString();

    const payload = {
      asset_id: values.asset_id,
      starts_at,
      ends_at,
      purpose: values.purpose,
    };

    try {
      await createBooking(payload);
      toast.success("Booking confirmed successfully.");
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Booking Error:", error);
      const status = error.response?.status;
      
      if (status === 400 || status === 409) {
        // Try to derive the overlap locally
        const reqStart = new Date(starts_at);
        const reqEnd = new Date(ends_at);
        
        const overlap = dayBookings.find(b => {
          const bStart = new Date(b.starts_at);
          const bEnd = new Date(b.ends_at);
          return (reqStart < bEnd && reqEnd > bStart);
        });

        if (overlap) {
          const overlapStart = new Date(overlap.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const overlapEnd = new Date(overlap.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setConflictError(`This overlaps an existing booking from ${overlapStart} to ${overlapEnd}`);
        } else {
          setConflictError("This overlaps an existing booking.");
        }
        
        toast.error("Booking conflict detected.");
      } else {
        toast.error("Failed to create booking.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Book a Resource</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Resource</label>
              <Controller
                name="asset_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Bookable Asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookableAssets.length === 0 && (
                        <SelectItem value="none" disabled>
                          No bookable assets found
                        </SelectItem>
                      )}
                      {bookableAssets.map((asset) => (
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
              <label className="mb-2 block text-sm font-medium">Date</label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Input type="date" {...field} />
                )}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Start Time</label>
              <Controller
                name="start_time"
                control={control}
                render={({ field }) => (
                  <Input type="time" {...field} />
                )}
              />
              {errors.start_time && (
                <p className="mt-1 text-sm text-red-500">{errors.start_time.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">End Time</label>
              <Controller
                name="end_time"
                control={control}
                render={({ field }) => (
                  <Input type="time" {...field} />
                )}
              />
              {errors.end_time && (
                <p className="mt-1 text-sm text-red-500">{errors.end_time.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Purpose (Optional)</label>
              <Controller
                name="purpose"
                control={control}
                render={({ field }) => (
                  <Input placeholder="E.g. Team Meeting" {...field} />
                )}
              />
            </div>
          </div>

          {/* Day View Integration */}
          {selectedAssetId && selectedDate && (
            <div className="mt-4 p-4 border rounded-md bg-slate-50">
              <h4 className="font-medium mb-3 text-sm text-slate-700">
                Schedule for {selectedDate}
              </h4>
              {dayBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No bookings for this date. The resource is fully available!
                </p>
              ) : (
                <div className="space-y-2">
                  {dayBookings.map((b) => {
                    const start = new Date(b.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const end = new Date(b.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={b.id} className="flex justify-between items-center text-sm p-2 bg-white rounded border">
                        <span className="font-medium text-blue-700">{start} - {end}</span>
                        <span className="text-muted-foreground truncate ml-4 max-w-[200px]">{b.purpose || "Reserved"}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Conflict Error Message */}
          {conflictError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm font-medium">
              {conflictError}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default BookingForm;
