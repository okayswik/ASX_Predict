import { useState } from 'react'
import './index.css'
import StickyNavbar from './components/Navbar'
import Sidebar from './components/Sidebar'

function App() {
  return (
    <div className="min-h-screen">
      {/* Navbar at document level */}
      <StickyNavbar />

      {/* Sidebar + Main content */}
      <div className="flex">
        <Sidebar />
      </div>
    </div>
  )
}

export default App
