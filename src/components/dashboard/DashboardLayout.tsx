import { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row mt-[100px] min-h-[calc(100vh-100px)]">

      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <Sidebar
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:h-auto md:z-30
          md:ml-6 
        `}
      />

      {/* Contenu principal */}
      <main className="flex-1 p-6 bg-[var(--stone)] rounded-xl md:ml-6">
        {/* Mobile toggle button - hamburger moderne */}
        <div className="md:hidden mb-6">
          <button
            className="px-3 py-2 bg-white text-gray-800 rounded-lg shadow-lg flex items-center gap-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            <span className="font-medium">Dashboard Menu</span>
          </button>
        </div>


        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}