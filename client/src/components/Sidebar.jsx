import { Link } from "react-router-dom";

const role = "user";

const menuItems = [
  { name: "Dashboard", path: "/" },
  { name: "Assets", path: "/assets" },
  { name: "Allocation & Transfer", path: "/allocation" },
  { name: "Resource Booking", path: "/booking" },
  { name: "Maintenance", path: "/maintenance" },
  { name: "Reports", path: "/reports" },
  { name: "Notifications", path: "/notifications" },
];

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen border-r p-4">
      <h2 className="text-xl font-bold mb-6">AssetFlow</h2>

      <ul className="space-y-3">
        {menuItems.map((item) => (
          <li key={item.name} className="cursor-pointer hover:text-blue-600">
            <Link to={item.path} className="block w-full">{item.name}</Link>
          </li>
        ))}

        {role === "admin" && (
          <li className="cursor-pointer hover:text-blue-600">
            <Link to="/organization-setup" className="block w-full">Organization Setup</Link>
          </li>
        )}
      </ul>
    </aside>
  );
}

export default Sidebar;