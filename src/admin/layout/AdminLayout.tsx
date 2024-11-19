import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import AdminMobileMenu from './components/AdminMobileMenu';
import LoadingScreen from '../../components/common/LoadingScreen';

const AdminLayout: React.FC = () => {
  const { isLoading, session } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If no session, redirect to login
  if (!session && !isLoading) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-gray-200 dark:border-gray-700">
        <AdminSidebar />
      </aside>

      {/* Mobile Menu */}
      <AdminMobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AdminHeader 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;