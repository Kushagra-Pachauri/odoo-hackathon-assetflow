import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createBooking } from "@/services/bookingService";

const bookingSchema = z
  .object({
    asset_id: z.string().min(1, "Asset is required"),
    date: z.string().min(1, "Date is required"),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
    purpose: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.start_time && data.end_time) {
        const start = new Date(`1970-01-01T${data.start_time}`);
        const end = new Date(`1970-01-01T${data.end_time}`);
        return start < end;
      }
      return true;
    },
    { message: "End time must be after start time", path: ["end_time"] }
  );

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7:00 – 19:00

function BookingForm({ assets = [], bookings = [], onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState(null);

  const bookableAssets = useMemo(
    () => assets.filter((asset) => asset.is_bookable === true),
    [assets]
  );

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

  const dayBookings = useMemo(() => {
    if (!selectedAssetId || !selectedDate) return [];
    return bookings
      .filter((b) => {
        if (b.status === "cancelled" || b.asset_id !== selectedAssetId) return false;
        const bDate = new Date(b.starts_at).toISOString().split("T")[0];
        return bDate === selectedDate;
      })
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
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
      toast.success("Resource booked.");
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Booking Error:", error);
      const status = error.response?.status;

      if (status === 400 || status === 409) {
        const reqStart = new Date(starts_at);
        const reqEnd = new Date(ends_at);

        const overlap = dayBookings.find((b) => {
          const bStart = new Date(b.starts_at);
          const bEnd = new Date(b.ends_at);
          return reqStart < bEnd && reqEnd > bStart;
        });

        if (overlap) {
          const overlapStart = new Date(overlap.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const overlapEnd = new Date(overlap.ends_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setConflictError(`This overlaps an existing booking from ${overlapStart} to ${overlapEnd}`);
        } else {
          setConflictError("This overlaps an existing booking.");
        }
        toast.error("Booking conflict detected.");
      } else {
        toast.error("Failed to book resource.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  /* Helper: turn a time into a fractional hour for the ruler */
  function timeToFraction(isoString) {
    const d = new Date(isoString);
    return d.getUTCHours() + d.getUTCMinutes() / 60;
  }

  return (
    <div className="bg-white border border-line rounded-md overflow-hidden">
      <div className="px-5 py-3 border-b border-line">
        <h2 className="font-display font-medium text-sm text-ink">Book a resource</h2>
      </div>
      <div className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">Resource</label>
              <Controller
                name="asset_id"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="">Select bookable asset</option>
                    {bookableAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.asset_tag} — {asset.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.asset_id && <p className="mt-1 text-xs text-status-alert">{errors.asset_id.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">Date</label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    {...field}
                    className="w-full px-3 py-2 text-sm font-mono border border-line rounded-md bg-white text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                )}
              />
              {errors.date && <p className="mt-1 text-xs text-status-alert">{errors.date.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">Start time</label>
              <Controller
                name="start_time"
                control={control}
                render={({ field }) => (
                  <input
                    type="time"
                    {...field}
                    className="w-full px-3 py-2 text-sm font-mono border border-line rounded-md bg-white text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                )}
              />
              {errors.start_time && <p className="mt-1 text-xs text-status-alert">{errors.start_time.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">End time</label>
              <Controller
                name="end_time"
                control={control}
                render={({ field }) => (
                  <input
                    type="time"
                    {...field}
                    className="w-full px-3 py-2 text-sm font-mono border border-line rounded-md bg-white text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                )}
              />
              {errors.end_time && <p className="mt-1 text-xs text-status-alert">{errors.end_time.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">Purpose (optional)</label>
              <Controller
                name="purpose"
                control={control}
                render={({ field }) => (
                  <input
                    placeholder="E.g. Team meeting"
                    {...field}
                    className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                )}
              />
            </div>
          </div>

          {/* Time Ruler */}
          {selectedAssetId && selectedDate && (
            <div className="mt-4 border border-line rounded-md bg-paper p-4">
              <h4 className="font-sans text-xs font-medium text-ink/60 uppercase tracking-wide mb-3">
                Schedule for <span className="font-mono">{selectedDate}</span>
              </h4>

              {/* Hour marks ruler */}
              <div className="relative">
                <div className="flex">
                  {HOURS.map((h) => (
                    <div key={h} className="flex-1 text-center">
                      <span className="font-mono text-[10px] text-ink/30">
                        {String(h).padStart(2, "0")}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Ruler line */}
                <div className="relative h-[1px] bg-line mt-1 mb-2">
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="absolute top-[-2px] w-[1px] h-[5px] bg-line"
                      style={{ left: `${((h - 7) / (HOURS.length - 1)) * 100}%` }}
                    />
                  ))}
                </div>

                {/* Booking blocks */}
                <div className="relative h-10">
                  {dayBookings.length === 0 ? (
                    <p className="text-xs text-ink/30 font-sans absolute inset-0 flex items-center justify-center">
                      No bookings for this date — the resource is fully available.
                    </p>
                  ) : (
                    dayBookings.map((b) => {
                      const startHour = timeToFraction(b.starts_at);
                      const endHour = timeToFraction(b.ends_at);
                      const rangeStart = HOURS[0];
                      const rangeEnd = HOURS[HOURS.length - 1];
                      const leftPct = ((Math.max(startHour, rangeStart) - rangeStart) / (rangeEnd - rangeStart)) * 100;
                      const widthPct = ((Math.min(endHour, rangeEnd) - Math.max(startHour, rangeStart)) / (rangeEnd - rangeStart)) * 100;

                      const startStr = new Date(b.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                      const endStr = new Date(b.ends_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                      const isWide = widthPct > 12;

                      return (
                        <div
                          key={b.id}
                          className="absolute top-0 h-full bg-accent/15 border border-accent rounded-sm flex items-center px-1.5 overflow-hidden group animate-slide-in"
                          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          title={`${startStr}–${endStr} • ${b.purpose || "Reserved"} • ${b.booked_by_name || ""}`}
                        >
                          {isWide && (
                            <span className="font-sans text-[10px] text-accent truncate">
                              {b.purpose || "Reserved"} — {b.booked_by_name || ""}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Conflict */}
          {conflictError && (
            <div className="p-3 bg-paper border border-status-alert/30 text-status-alert rounded-md text-xs font-sans font-medium">
              {conflictError}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-[13px] font-sans bg-ink text-paper rounded-md transition-colors duration-150 hover:bg-ink/90 disabled:opacity-50"
            >
              {isSubmitting ? "Booking…" : "Book resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingForm;
