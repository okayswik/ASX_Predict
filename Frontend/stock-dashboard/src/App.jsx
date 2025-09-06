import { useState } from 'react'
import './index.css'
import StickyNavbar from './components/Navbar'
import Sidebar from './components/Sidebar'

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <StickyNavbar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          collapsed={collapsed} 
          mobileOpen={mobileOpen} 
          setMobileOpen={setMobileOpen} 
        />

        {/* Main Content */}
        <main
          className={`
            flex-1 p-6 transition-all duration-300
            pt-20   /* 👈 push content below navbar */
            ${collapsed ? "lg:ml-16" : "lg:ml-64"} 
          `}        
        >
          <h1 className="text-2xl font-bold">Welcome to ASX Stock Dashboard</h1>
          <p className="mt-4 text-gray-600">Here’s where your content goes...</p>
        </main>
      </div>
    </div>
  )
}

export default App
