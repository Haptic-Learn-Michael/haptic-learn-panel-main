import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout = () => (
  <div className="app-shell flex h-screen overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      <div className="px-6 pb-6 pt-10 max-w-7xl mx-auto">
        <Outlet />
      </div>
    </main>
  </div>
);
