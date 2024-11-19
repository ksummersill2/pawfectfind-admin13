import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Package, Users, Dog, FileText, BookOpen, Video, Calendar } from 'lucide-react';
import { adminSupabase } from '../../lib/supabase/client';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatTimeAgo } from '../utils/formatters';

interface DashboardActivity {
  id: string;
  type: 'product' | 'breed' | 'article' | 'blog' | 'video';
  action: 'create' | 'update' | 'delete';
  title: string;
  user_id: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: breedCount = 0 } = useQuery({
    queryKey: ['breedCount'],
    queryFn: async () => {
      const { count, error } = await adminSupabase
        .from('dog_breeds')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: productCount = 0 } = useQuery({
    queryKey: ['productCount'],
    queryFn: async () => {
      const { count, error } = await adminSupabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: articleCount = 0 } = useQuery({
    queryKey: ['articleCount'],
    queryFn: async () => {
      const { count, error } = await adminSupabase
        .from('breed_articles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: videoCount = 0 } = useQuery({
    queryKey: ['videoCount'],
    queryFn: async () => {
      const { count, error } = await adminSupabase
        .from('breed_videos')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: blogCount = 0 } = useQuery({
    queryKey: ['blogCount'],
    queryFn: async () => {
      const { count, error } = await adminSupabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const { data: products } = await adminSupabase
        .from('products')
        .select('id, name, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: breeds } = await adminSupabase
        .from('dog_breeds')
        .select('id, name, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: articles } = await adminSupabase
        .from('breed_articles')
        .select('id, title, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: blogs } = await adminSupabase
        .from('blog_posts')
        .select('id, title, created_at, updated_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: videos } = await adminSupabase
        .from('breed_videos')
        .select('id, title, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const allActivities = [
        ...(products?.map(p => ({
          id: p.id,
          type: 'product' as const,
          title: p.name,
          created_at: p.created_at,
          updated_at: p.updated_at
        })) || []),
        ...(breeds?.map(b => ({
          id: b.id,
          type: 'breed' as const,
          title: b.name,
          created_at: b.created_at,
          updated_at: b.updated_at
        })) || []),
        ...(articles?.map(a => ({
          id: a.id,
          type: 'article' as const,
          title: a.title,
          created_at: a.created_at,
          updated_at: a.updated_at
        })) || []),
        ...(blogs?.map(b => ({
          id: b.id,
          type: 'blog' as const,
          title: b.title,
          created_at: b.created_at,
          updated_at: b.updated_at,
          status: b.status
        })) || []),
        ...(videos?.map(v => ({
          id: v.id,
          type: 'video' as const,
          title: v.title,
          created_at: v.created_at,
          updated_at: v.updated_at
        })) || [])
      ].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 10);

      return allActivities;
    }
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'breed':
        return <Dog className="w-5 h-5 text-green-500" />;
      case 'article':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'blog':
        return <BookOpen className="w-5 h-5 text-orange-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityText = (activity: any) => {
    const isNew = new Date(activity.updated_at).getTime() === new Date(activity.created_at).getTime();
    const action = isNew ? 'added' : 'updated';
    
    let status = '';
    if (activity.type === 'blog' && activity.status) {
      status = ` (${activity.status})`;
    }

    return `${activity.type} ${action}: ${activity.title}${status}`;
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <button
          onClick={() => handleNavigate('/admin/products')}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Products</h3>
            <Package className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{productCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Total products
          </p>
        </button>

        <button
          onClick={() => handleNavigate('/admin/breeds')}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Breeds</h3>
            <Dog className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{breedCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Total breeds
          </p>
        </button>

        <button
          onClick={() => handleNavigate('/admin/articles')}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Articles</h3>
            <FileText className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{articleCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Total articles
          </p>
        </button>

        <button
          onClick={() => handleNavigate('/admin/videos')}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Videos</h3>
            <Video className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{videoCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Total videos
          </p>
        </button>

        <button
          onClick={() => handleNavigate('/admin/blogs')}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Blog Posts</h3>
            <BookOpen className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{blogCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Total blog posts
          </p>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {recentActivity.map((activity) => (
              <div key={`${activity.type}-${activity.id}`} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getActivityText(activity)}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={activity.created_at}>
                        {formatTimeAgo(activity.created_at)}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {recentActivity.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;