import { createBrowserRouter } from 'react-router-dom';
import { adminRoutes } from '../admin/routes';
import { publicRoutes } from './public';

export const router = createBrowserRouter([
  ...publicRoutes,
  ...adminRoutes
]);