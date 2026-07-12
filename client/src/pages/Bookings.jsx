import { useEffect, useState } from "react";
import { toast } from "sonner";
import { io } from "socket.io-client";

import { useAuth } from "@/context/AuthContext";
import { getBookings, cancelBooking } from "@/services/bookingService";
import { getAssets } from "@/services/assetService";

import BookingForm from "@/components/bookings/BookingForm";
import Tag from "@/components/shared/Tag";
import StatusDot from "@/components/shared/StatusDot";

function Bookings() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBookingIds, setNewBookingIds] = useState(new Set());

  const isAdmin = user?.role === "admin";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookRes, assetRes] = await Promise.all([
        getBookings(),
        getAssets(),
      ]);
      setBookings(bookRes);
      setAssets(assetRes);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load booking data.");
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

    socket.on("booking:created", (data) => {
      if (data?.id) {
        setNewBookingIds((prev) => new Set(prev).add(data.id));
        setTimeout(() => {
          setNewBookingIds((prev) => {
            const next = new Set(prev);
            next.delete(data.id);
            return next;
          });
        }, 300);
      }
      refreshData();
    });
    socket.on("booking:cancelled", refreshData);
    socket.on("notification", refreshData);

    return () => {
      socket.off("booking:created");
      socket.off("booking:cancelled", refreshData);
      socket.off("notification", refreshData);
      socket.disconnect();
    };
  }, [user]);

  const handleCancel = async (id) => {
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled.");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel booking.");
    }
  };

  const getDisplayStatus = (booking) => {
    if (booking.status === "cancelled") return "cancelled";
    const end = new Date(booking.ends_at);
    return end < new Date() ? "past" : "upcoming";
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Resource Booking</h1>
        <p className="font-sans text-sm text-ink/50 mt-0.5">
          Schedule and manage bookable assets like meeting rooms and projectors.
        </p>
      </div>

      <BookingForm
        assets={assets}
        bookings={bookings}
        onSuccess={fetchData}
      />

      {/* All Bookings Table */}
      <div className="bg-white border border-line rounded-md overflow-hidden">
        <div className="px-5 py-3 border-b border-line">
          <h2 className="font-display font-medium text-sm text-ink">All bookings</h2>
        </div>
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Resource</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Booked by</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Start</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">End</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Purpose</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Status</th>
              <th className="text-right px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center text-ink/40 py-8">Loading bookings…</td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-ink/40 py-8">
                  No bookings yet for any resource — book a slot above.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const displayStatus = getDisplayStatus(booking);
                const isNew = newBookingIds.has(booking.id);

                return (
                  <tr
                    key={booking.id}
                    className={`border-b border-line last:border-b-0 transition-colors duration-150 hover:bg-accent/[0.04] ${
                      isNew ? "animate-slide-in" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-ink">{booking.asset_name}</span>{" "}
                      <Tag>{booking.asset_tag}</Tag>
                    </td>
                    <td className="px-4 py-3 text-ink">{booking.booked_by_name || "Unknown"}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-ink/60">
                        {new Date(booking.starts_at).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-ink/60">
                        {new Date(booking.ends_at).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-ink/60">
                      {booking.purpose || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusDot status={displayStatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin && displayStatus === "upcoming" && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-3 py-1.5 text-[12px] font-sans border border-line rounded-md text-status-alert bg-transparent transition-colors duration-150 hover:bg-status-alert/5"
                        >
                          Cancel booking
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
    </div>
  );
}

export default Bookings;
