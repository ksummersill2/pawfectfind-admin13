import { RouteObject } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import {
  AdminDashboard,
  AdminBreeds,
  AdminProducts,
  AdminCategories,
  AdminArticles,
  AdminBlogs,
  AdminUsers,
  AdminVideos,
  ProductImport,
  CJImport
} from '../pages';

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'breeds', element: <AdminBreeds /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'articles', element: <AdminArticles /> },
      { path: 'videos', element: <AdminVideos /> },
      { path: 'blogs', element: <AdminBlogs /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'import', element: <ProductImport /> },
      { path: 'cj-import', element: <CJImport /> }
    ]
  }
];