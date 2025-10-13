import { Home, TrendingUp, BarChart3, History, Settings, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar({ collapsed, mobileOpen, setMobileOpen }) {
  const navItems = [
    { label: "Home", path: "/home" , icon: <Home className="w-5 h-5" /> },
    { label: "Sentiment", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Prediction", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "History", icon: <History className="w-5 h-5" /> },
  ];

  const bottomItems = [
    { label: "Settings", icon: <Settings className="w-5 h-5" /> },
    { label: "Help", icon: <HelpCircle className="w-5 h-5" /> },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-16 left-0 h-[calc(100%-4rem)] bg-gray-900 text-white transition-all duration-300 z-50
        ${collapsed ? "w-20" : "w-64"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <nav className="flex flex-col h-full p-4">
          {/* Top items */}
          <ul className="flex-1 space-y-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 transition"
                  onClick={() => setMobileOpen(false)} // closes sidebar on mobile
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>

          {/* Bottom items */}
          <ul className="space-y-2 border-t border-gray-700 pt-2">
            {bottomItems.map((item) => (
              <li key={item.label}>
                <a
                  href="#"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 transition"
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
