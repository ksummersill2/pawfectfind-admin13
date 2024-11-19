import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  X, 
  LayoutDashboard, 
  Package, 
  Tags, 
  Dog, 
  FileText, 
  Video,
  BookOpen, 
  Users,
  ShoppingBag, 
  Upload, 
  Globe 
} from 'lucide-react'; // Added Globe as a potential icon for Printful
import { Dog as DogLogo } from 'lucide-react';

const navigationItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/categories', icon: Tags, label: 'Categories' },
  { path: '/admin/breeds', icon: Dog, label: 'Breeds' },
  { path: '/admin/articles', icon: FileText, label: 'Articles' },
  { path: '/admin/videos', icon: Video, label: 'Videos' },
  { path: '/admin/blogs', icon: BookOpen, label: 'Blogs' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/import', icon: ShoppingBag, label: 'Amazon Import' },
  { path: '/admin/cj-import', icon: Upload, label: 'CJ Import' },
  // New navigation item for Printful
  { path: '/admin/printful', icon: Globe, label: 'Printful Integration' }
];

interface AdminMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminMobileMenu: React.FC<AdminMobileMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl z-50 lg:hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-600 dark:bg-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DogLogo className="w-8 h-8 text-white" />
              <h2 className="text-xl font-bold text-white">PawfectFind</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-blue-700 dark:hover:bg-blue-900 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto max-h-[calc(100vh-64px)]">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }
                `}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default AdminMobileMenu;
