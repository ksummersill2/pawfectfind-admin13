import { RouteObject } from 'react-router-dom';
import { MainLayout } from '../features/layout';
import {
  HomePage,
  AboutPage,
  BlackFridayPage,
  CategoryPage,
  CommunityPage,
  FavoritesPage,
  LoginPage,
  ProductPage,
  SearchPage,
  LegalPage,
  DogsPage,
  DogDashboard
} from '../pages';
import { ProtectedRoute, AuthCallback } from '../features/auth';

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'black-friday', element: <BlackFridayPage /> },
      { path: 'category/:categoryId', element: <CategoryPage /> },
      { path: 'community', element: <CommunityPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'product/:productId', element: <ProductPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'legal/:page', element: <LegalPage /> },
      { 
        path: 'dogs',
        element: <ProtectedRoute><DogsPage /></ProtectedRoute>
      },
      {
        path: 'dog/:dogId',
        element: <ProtectedRoute><DogDashboard /></ProtectedRoute>
      },
      { path: 'auth/callback', element: <AuthCallback /> }
    ]
  }
];