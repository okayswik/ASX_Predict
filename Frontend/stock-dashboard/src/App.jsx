import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'
import StickyNavbar from './components/Navbar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar at document level - no padding/centering */}
      <StickyNavbar/>
      
      {/* Main content with proper spacing */}
      <div className="text-white flex flex-col items-center p-8">
        <div className="flex gap-8 mb-8">
          <a href="https://vite.dev" target="_blank" className="hover:opacity-75 transition-opacity">
            <img src={viteLogo} className="w-24 h-24" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" className="hover:opacity-75 transition-opacity">
            <img src={reactLogo} className="w-24 h-24 animate-spin-slow" alt="React logo" />
          </a>
        </div>
        
        <h1 className="text-4xl font-bold mb-8">Vite + React</h1>
        
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors mb-4"
          >
            count is {count}
          </button>
          <p className="text-gray-300">
            Edit <code className="bg-gray-700 px-2 py-1 rounded text-yellow-300">src/App.jsx</code> and save to test HMR
          </p>
        </div>
        
        <p className="text-gray-500 mt-8 text-center max-w-md">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </div>
  )
}

export default App