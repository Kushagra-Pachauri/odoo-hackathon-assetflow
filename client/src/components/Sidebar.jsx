const role = "user";

const menuItems = [
  "Dashboard",
  "Assets",
  "Allocation & Transfer",
  "Resource Booking",
  "Maintenance",
  "Reports",
  "Notifications",
];

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen border-r p-4">
      <h2 className="text-xl font-bold mb-6">AssetFlow</h2>

      <ul className="space-y-3">
        {menuItems.map((item) => (
          <li key={item} className="cursor-pointer hover:text-blue-600">
            {item}
          </li>
        ))}

        {role === "admin" && (
          <li className="cursor-pointer hover:text-blue-600">
            Organization Setup
          </li>
        )}
      </ul>
    </aside>
  );
}

export default Sidebar;