import React from 'react';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Article } from '../../types/article';

interface ArticleListProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
}

const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  onEdit,
  onDelete
}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {articles.map((article) => (
        <div
          key={article.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {article.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {article.description}
              </p>
              <div className="flex items-center space-x-4">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-sm">
                  {article.category}
                </span>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Visit Article
                </a>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(article)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Edit article"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(article)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete article"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArticleList;