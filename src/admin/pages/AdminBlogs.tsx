import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useBlogs } from '../hooks/useBlogs';
import { Blog } from '../types/blog';
import BlogList from '../components/blogs/BlogList';
import BlogForm from '../components/blogs/BlogForm';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminBlogs: React.FC = () => {
  const { blogs, loading, error, saveBlog, updateBlog, deleteBlog, fetchBlogs } = useBlogs();
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (data: any, blogId?: string) => {
    try {
      if (blogId) {
        await updateBlog(blogId, data);
      } else {
        await saveBlog(data);
      }
      setShowForm(false);
      setEditingBlog(null);
      await fetchBlogs();
    } catch (err) {
      console.error('Error saving blog:', err);
    }
  };

  const handleDelete = async () => {
    if (!blogToDelete?.id || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteBlog(blogToDelete.id);
      setBlogToDelete(null);
    } catch (err) {
      console.error('Error deleting blog:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Post
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <BlogList
        blogs={blogs}
        onEdit={setEditingBlog}
        onDelete={setBlogToDelete}
      />

      {(showForm || editingBlog) && (
        <BlogForm
          blog={editingBlog}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingBlog(null);
          }}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!blogToDelete}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${blogToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setBlogToDelete(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default AdminBlogs;