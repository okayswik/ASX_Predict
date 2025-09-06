import { Menu, X } from "lucide-react";

export default function Navbar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const handleToggle = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen(!mobileOpen); // Mobile: open/close drawer
    } else {
      setCollapsed(!collapsed);   // Desktop: collapse/expand
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 justify-between z-50">
      
      {/* Left: Toggle + Logo */}
      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-md hover:bg-gray-100"
          onClick={handleToggle}
        >
          {/* Switch icon based on state */}
          {mobileOpen && window.innerWidth < 1024 ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Logo + Title */}
        <div className="flex items-center gap-2">
          <img src="Logo/Stock_Sense.png" alt="Logo" className="h-8" />
          <span className="font-bold text-lg text-gray-800">Stock Sense</span>
        </div>
      </div>

      {/* Center: Nav links (desktop only) */}
      <div className="hidden lg:flex gap-6 text-gray-700">
        <a href="#" className="hover:text-black transition-colors">Dashboard</a>
        <a href="#" className="hover:text-black transition-colors">Markets</a>
        <a href="#" className="hover:text-black transition-colors">Portfolio</a>
        <a href="#" className="hover:text-black transition-colors">News</a>
      </div>

      {/* Right: Search + Auth */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search stocks..."
          className="hidden lg:block px-3 py-1 border rounded-md text-sm"
        />
        <button className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100">
          Login
        </button>
        <button className="px-4 py-2 text-sm text-white bg-black rounded-md">
          Sign Up
        </button>
      </div>
    </nav>
  );
}
