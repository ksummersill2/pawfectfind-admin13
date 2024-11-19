import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Dog, LogOut } from 'lucide-react';
import { useAuth } from '../../../auth/hooks/useAuth';
import ThemeToggle from '../../../components/common/ThemeToggle';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const truncateEmail = (email: string | undefined) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length > 12) {
      return `${username.slice(0, 12)}...@${domain}`;
    }
    return email;
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center min-w-0">
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/admin" className="flex items-center space-x-2 ml-1 sm:ml-0">
              <Dog className="h-8 w-8 text-blue-600 shrink-0" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                PawfectFind
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
              {truncateEmail(user?.email)}
            </span>
            <button
              onClick={() => logout()}
              className="inline-flex items-center px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={user?.email}
            >
              <LogOut className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;