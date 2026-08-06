import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function ProtectedLayout() {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8">
        <Outlet />
      </div>
    </div>
  );
}
