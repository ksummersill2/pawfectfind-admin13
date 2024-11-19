import React from 'react';
import { Edit2, Trash2, ExternalLink, Star } from 'lucide-react';
import { BreedArticle } from '../../types';

interface BreedArticleListProps {
  articles: BreedArticle[];
  onEdit: (article: BreedArticle) => void;
  onDelete: (articleId: string) => void;
}

const BreedArticleList: React.FC<BreedArticleListProps> = ({
  articles,
  onEdit,
  onDelete
}) => {
  const getCategoryLabel = (category: string): string => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div
          key={article.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {article.title}
                </h3>
                {article.is_featured && (
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {article.description}
              </p>
              <div className="mt-2 flex items-center space-x-4 text-sm">
                <span className="text-blue-600 dark:text-blue-400">
                  {getCategoryLabel(article.category)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {article.source}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(article.published_date).toLocaleDateString()}
                </span>
              </div>
              {article.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => onEdit(article)}
                className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(article.id)}
                className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {articles.length === 0 && (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No articles added yet
          </p>
        </div>
      )}
    </div>
  );
};

export default BreedArticleList;