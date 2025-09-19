import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import StickyNavbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Home from './pages/home';

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Router>
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
              pt-20
              ${collapsed ? "lg:ml-16" : "lg:ml-64"} 
            `}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App;
