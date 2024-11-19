import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface BlogSchedulerProps {
  scheduledFor: string | null;
  onChange: (date: string | null) => void;
  disabled?: boolean;
}

const BlogScheduler: React.FC<BlogSchedulerProps> = ({
  scheduledFor,
  onChange,
  disabled
}) => {
  // Get minimum date (current date/time)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Schedule Publication
        </label>
        {scheduledFor && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            disabled={disabled}
          >
            Clear Schedule
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="datetime-local"
            value={scheduledFor || ''}
            onChange={(e) => onChange(e.target.value)}
            min={getMinDateTime()}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
            disabled={disabled}
          />
        </div>

        {scheduledFor && (
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>
              {new Date(scheduledFor).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </span>
          </div>
        )}
      </div>

      {scheduledFor && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This post will be automatically published on the scheduled date and time.
        </p>
      )}
    </div>
  );
};

export default BlogScheduler;