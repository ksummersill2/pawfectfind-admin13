import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Dog, 
  FileText, 
  BookOpen, 
  Upload, 
  Video, 
  ShoppingBag,
  Printer
} from 'lucide-react';

const navigationItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/categories', icon: Tags, label: 'Categories' },
  { path: '/admin/breeds', icon: Dog, label: 'Breeds' },
  { path: '/admin/articles', icon: FileText, label: 'Articles' },
  { path: '/admin/videos', icon: Video, label: 'Videos' },
  { path: '/admin/blogs', icon: BookOpen, label: 'Blogs' },
  { path: '/admin/import', icon: ShoppingBag, label: 'Amazon Import' },
  { path: '/admin/cj-import', icon: Upload, label: 'CJ Import' },
  { path: '/admin/printful', icon: Printer, label: 'Printful' }
];

const AdminSidebar: React.FC = () => {
  return (
    <div className="h-full bg-white dark:bg-gray-800">
      <div className="flex flex-col h-full">
        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="px-4 space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => `
                  flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
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
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;