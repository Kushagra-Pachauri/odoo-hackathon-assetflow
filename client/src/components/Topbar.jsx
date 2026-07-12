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
      toast.info(data.title, {
        description: data.message,
      });

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

    socket.on("notification", handleNewNotification);
    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket]);

  const handleMarkAsRead = async (id) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (!String(id).startsWith("temp-")) {
        await markAsRead(id);
      }
    } catch (error) {
      console.error("Failed to mark as read", error);
      toast.error("Failed to mark notification as read.");
      fetchNotifications();
    }
  };

  return (
    <header className="flex items-center justify-end border-b border-line px-6 py-3 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger className="relative p-1.5 border border-line rounded-md bg-transparent text-ink transition-colors duration-150 hover:bg-accent/5">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center px-1 text-[10px] font-mono bg-status-alert text-white rounded-md">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 border-line bg-white rounded-md">
            <div className="px-3 py-2.5 border-b border-line flex justify-between items-center">
              <h3 className="font-display font-medium text-sm text-ink">Notifications</h3>
              {unreadCount > 0 && (
                <span className="font-mono text-[10px] text-ink/50">{unreadCount} unread</span>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-ink/40 font-sans">
                  No notifications yet — actions across the platform will appear here.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-3 py-2.5 border-b border-line last:border-b-0 flex flex-col gap-0.5 ${
                      !notif.read ? "bg-accent/5" : "bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4
                        className={`text-[13px] font-sans ${
                          !notif.read
                            ? "font-medium text-ink"
                            : "text-ink/70"
                        }`}
                      >
                        {notif.title || notif.type}
                      </h4>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-[11px] font-sans text-accent hover:text-accent/80 shrink-0 transition-colors duration-150"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-[12px] text-ink/50 font-sans leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="font-mono text-[10px] text-ink/30 mt-0.5">
                      {new Date(notif.created_at).toLocaleString([], {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Avatar */}
        <div className="h-7 w-7 rounded-md bg-ink flex items-center justify-center text-paper font-display text-xs font-medium">
          A
        </div>
      </div>
    </header>
  );
}

export default Topbar;