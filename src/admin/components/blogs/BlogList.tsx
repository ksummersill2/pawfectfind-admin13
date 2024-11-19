import React from 'react';
import { Edit2, Trash2, Calendar, User, Tag, Star } from 'lucide-react';
import { BlogPost } from '../../types/blog';
import { formatDate } from '../../../utils/formatters';

interface BlogListProps {
  blogs: BlogPost[];
  onEdit: (blog: BlogPost) => void;
  onDelete: (blog: BlogPost) => void;
}

const BlogList: React.FC<BlogListProps> = ({
  blogs = [],
  onEdit,
  onDelete
}) => {
  if (!blogs || blogs.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No blog posts found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {blogs.map((blog) => (
        <article
          key={blog.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          {blog.cover_image && (
            <div className="aspect-video relative">
              <img
                src={blog.cover_image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {blog.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(blog.published_at || blog.created_at)}
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {blog.author_name || 'Unknown Author'}
                  </div>
                  {blog.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      blog.status === 'published' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                    }`}>
                      {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(blog)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit blog post"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(blog)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete blog post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              {blog.excerpt || blog.content.substring(0, 150) + '...'}
            </p>

            {blog.category_id && (
              <div className="mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                  {blog.category_id}
                </span>
              </div>
            )}

            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {blog.breed_ids && blog.breed_ids.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {blog.breed_ids.map((breedId) => (
                  <span
                    key={breedId}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300"
                  >
                    {breedId}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
};

export default BlogList;