import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { getNotifications, markAsRead } from "@/services/notificationService";
import { useSocket } from "@/hooks/useSocket";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function Topbar() {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      // Show toast
      toast.info(data.title, {
        description: data.message,
      });

      // Update state instantly (prepend to list and increment unread badge)
      const newNotif = {
        id: `temp-${Date.now()}`,
        title: data.title,
        message: data.message,
        type: data.type,
        read: false,
        created_at: new Date().toISOString(),
      };
      
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    // Listen to both the standard backend event and the requested 'notification:new'
    socket.on("notification", handleNewNotification);
    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket]);

  const handleMarkAsRead = async (id) => {
    try {
      // Optimistic UI update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      // If it's not a temp notification from socket, persist to backend
      if (!String(id).startsWith("temp-")) {
        await markAsRead(id);
      }
    } catch (error) {
      console.error("Failed to mark as read", error);
      toast.error("Failed to mark notification as read.");
      fetchNotifications(); // Revert on error
    }
  };

  return (
    <header className="flex items-center justify-between border-b p-4 bg-white sticky top-0 z-10">
      <h1 className="text-2xl font-semibold text-blue-900">AssetFlow</h1>

      <div className="flex items-center gap-4">
        {/* Notifications Panel */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-3 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-3 border-b last:border-b-0 flex flex-col gap-1 ${
                      !notif.read ? 'bg-blue-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`text-sm ${!notif.read ? 'font-semibold text-blue-900' : 'font-medium text-gray-700'}`}>
                        {notif.title || notif.type}
                      </h4>
                      {!notif.read && (
                        <button 
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 shrink-0"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1">
                      {new Date(notif.created_at).toLocaleString([], {
                        dateStyle: "short", timeStyle: "short"
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Badge */}
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
          A
        </div>
      </div>
    </header>
  );
}

export default Topbar;