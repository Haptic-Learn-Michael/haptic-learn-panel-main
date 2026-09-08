import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout = () => (
  <div className="flex h-screen bg-[#1A0533] overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      <div className="px-6 pb-6 pt-10 max-w-7xl mx-auto">
        <Outlet />
      </div>
    </main>
  </div>
);
