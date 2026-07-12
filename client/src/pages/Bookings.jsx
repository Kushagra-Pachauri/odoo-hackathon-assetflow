import { useEffect, useState } from "react";
import { toast } from "sonner";
import { io } from "socket.io-client";

import { useAuth } from "@/context/AuthContext";
import { getBookings, cancelBooking } from "@/services/bookingService";
import { getAssets } from "@/services/assetService";

import BookingForm from "@/components/bookings/BookingForm";

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

function Bookings() {
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin role check for cancellation
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

    const socket = io("http://localhost:4000", {
      withCredentials: true,
    });

    socket.on("connect", () => {
      if (user?.id) {
        socket.emit("join", user.id);
      }
    });

    const refreshData = () => {
      fetchData();
    };

    socket.on("booking:created", refreshData);
    socket.on("booking:cancelled", refreshData);
    socket.on("notification", refreshData);

    return () => {
      socket.off("booking:created", refreshData);
      socket.off("booking:cancelled", refreshData);
      socket.off("notification", refreshData);
      socket.disconnect();
    };
  }, [user]);

  const handleCancel = async (id) => {
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled successfully.");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel booking.");
    }
  };

  // Compute status for display: upcoming, past, cancelled
  const getDisplayStatus = (booking) => {
    if (booking.status === "cancelled") return "cancelled";
    
    const end = new Date(booking.ends_at);
    const now = new Date();
    
    return end < now ? "past" : "upcoming";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Upcoming</Badge>;
      case "past":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Resource Booking</h1>
        <p className="text-muted-foreground">
          Schedule and manage bookable assets like meeting rooms and projectors.
        </p>
      </div>

      <BookingForm 
        assets={assets} 
        bookings={bookings} 
        onSuccess={fetchData} 
      />

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Booked By</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Loading bookings...
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => {
                  const displayStatus = getDisplayStatus(booking);
                  
                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.asset_name} ({booking.asset_tag})
                      </TableCell>
                      <TableCell>{booking.booked_by_name || "Unknown"}</TableCell>
                      <TableCell>
                        {new Date(booking.starts_at).toLocaleString([], {
                          dateStyle: "medium", timeStyle: "short"
                        })}
                      </TableCell>
                      <TableCell>
                        {new Date(booking.ends_at).toLocaleString([], {
                          dateStyle: "medium", timeStyle: "short"
                        })}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {booking.purpose || "—"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(displayStatus)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isAdmin && displayStatus === "upcoming" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(booking.id)}
                          >
                            Cancel
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
    </div>
  );
}

export default Bookings;
