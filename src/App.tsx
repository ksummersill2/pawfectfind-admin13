import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './auth';
import { AdminLayout } from './admin/layout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminBreeds from './admin/pages/AdminBreeds';
import AdminProducts from './admin/pages/AdminProducts';
import AdminCategories from './admin/pages/AdminCategories';
import AdminArticles from './admin/pages/AdminArticles';
import AdminBlogs from './admin/pages/AdminBlogs';
import AdminUsers from './admin/pages/AdminUsers';
import AdminVideos from './admin/pages/AdminVideos';
import BreedEdit from './admin/pages/BreedEdit';
import ProductImport from './admin/pages/ProductImport';
import CJImport from './admin/pages/CJImport';
import PrintfulIntegration from './admin/pages/PrintfulIntegration'; // Add this import
import LoadingScreen from './components/common/LoadingScreen';
import { LoginPage } from './auth';
import { initializeStorage } from './lib/supabase/storage';
import { ThemeProvider } from './contexts/ThemeContext';

// Initialize storage buckets
initializeStorage();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="breeds" element={<AdminBreeds />} />
              <Route path="breeds/:id" element={<BreedEdit />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="articles" element={<AdminArticles />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="import" element={<ProductImport />} />
              <Route path="cj-import" element={<CJImport />} />
              {/* Add the Printful Integration route */}
              <Route path="printful" element={<PrintfulIntegration />} />
            </Route>
            
            {/* Catch all redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
