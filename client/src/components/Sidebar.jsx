import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Box,
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  BarChart3,
  Bell,
  Settings,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Assets", path: "/assets", icon: Box },
  { name: "Allocation & Transfer", path: "/allocation", icon: ArrowLeftRight },
  { name: "Resource Booking", path: "/booking", icon: CalendarClock },
  { name: "Maintenance", path: "/maintenance", icon: Wrench },
  { name: "Reports", path: "/reports", icon: BarChart3 },
  { name: "Notifications", path: "/notifications", icon: Bell },
];

function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="w-60 min-h-screen bg-ink flex flex-col">
      {/* Wordmark */}
      <div className="px-5 py-6">
        <span className="font-display font-semibold text-xl text-white tracking-tight">
          AssetFlow
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 text-[13px] font-sans transition-colors duration-150
                    ${
                      isActive
                        ? "text-white bg-accent/10 border-l-2 border-accent"
                        : "text-gray-400 hover:text-gray-200 border-l-2 border-transparent"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}

          {user?.role === "admin" && (
            <li>
              <Link
                to="/organization-setup"
                className={`flex items-center gap-3 px-3 py-2 text-[13px] font-sans transition-colors duration-150
                  ${
                    location.pathname === "/organization-setup"
                      ? "text-white bg-accent/10 border-l-2 border-accent"
                      : "text-gray-400 hover:text-gray-200 border-l-2 border-transparent"
                  }
                `}
              >
                <Settings className="w-4 h-4 shrink-0" />
                Organization Setup
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;