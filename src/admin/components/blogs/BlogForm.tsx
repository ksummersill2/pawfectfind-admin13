import React, { useState } from 'react';
import { AlertCircle, Plus, X } from 'lucide-react';
import { BlogPost, BlogFormData } from '../../types/blog';
import { callOpenAI } from '../../../lib/openai';
import RichTextEditor from './RichTextEditor';
import ImageSearch from './ImageSearch';
import BlogAIGenerator from './BlogAIGenerator';
import BlogScheduler from './BlogScheduler';
import BreedSelector from './BreedSelector';
import { adminSupabase } from '../../../lib/supabase/client';

interface BlogFormProps {
  blog?: BlogPost | null;
  onSubmit: (data: BlogFormData) => Promise<void>;
  onCancel: () => void;
}

const BlogForm: React.FC<BlogFormProps> = ({ blog, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<BlogFormData>({
    id: blog?.id || crypto.randomUUID(),
    title: blog?.title || '',
    content: blog?.content || '',
    excerpt: blog?.excerpt || '',
    cover_image: blog?.cover_image || '',
    tags: blog?.tags || [],
    category_id: blog?.category_id || null,
    meta_description: blog?.meta_description || '',
    meta_keywords: blog?.meta_keywords || [],
    breed_ids: blog?.breed_ids || [],
    status: blog?.status || 'draft',
    scheduled_for: blog?.scheduled_for || null
  });

  const [categories, setCategories] = useState<{ id: string; name: string; }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [tagInput, setTagInput] = useState('');

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await adminSupabase
          .from('categories')
          .select('id, name')
          .eq('type', 'blog')
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleFormatContent = async () => {
    if (!formData.content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const prompt = `
        Format and enhance this blog post content to be more readable and professional. Follow these specific formatting rules:

        1. Add proper spacing:
           - Add two blank lines (double <br>) between major sections
           - Add one blank line between paragraphs
           - Add appropriate spacing around lists and quotes

        2. Structure headings properly:
           - Use <h1> for the main title
           - Use <h2> for major sections
           - Use <h3> for subsections
           - Never skip heading levels
           - Add margin-bottom to headings

        3. Format paragraphs:
           - Keep paragraphs concise (3-4 sentences max)
           - Add transition sentences between sections
           - Use bullet points for lists when appropriate
           - Wrap paragraphs in <p> tags with margin-bottom

        4. Enhance readability:
           - Break up long paragraphs
           - Add subheadings for better scanning
           - Use bullet points for key takeaways
           - Maintain consistent spacing

        5. Use proper HTML structure:
           - Use semantic HTML elements
           - Add appropriate CSS classes
           - Ensure proper nesting of elements
           - Maintain clean, valid HTML

        Return the content as properly formatted HTML with consistent spacing and structure.

        Content to format:
        ${formData.content}
      `;

      const response = await callOpenAI([
        {
          role: 'system',
          content: `You are a professional blog editor and formatter specializing in creating well-structured, easy-to-read content. 
          Format content using semantic HTML with proper spacing and structure.
          Add appropriate CSS classes for styling.
          Ensure consistent formatting throughout the document.`
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      let formattedContent = response.choices[0].message.content.trim();

      // Apply consistent formatting
      formattedContent = formattedContent
        // Add proper spacing after headings
        .replace(/(<\/h[1-6]>)(\s*?)(<[p|ul|ol|blockquote])/g, '$1\n\n$3')
        // Add spacing after lists
        .replace(/(<\/[ul|ol]>)(\s*?)(<[h|p])/g, '$1\n\n$3')
        // Remove excessive line breaks
        .replace(/\n{3,}/g, '\n\n')
        // Format list items
        .replace(/(<li>)(.*?)(<\/li>)/g, '<li>$2</li>\n')
        // Format blockquotes
        .replace(/(<blockquote>)(.*?)(<\/blockquote>)/g, '\n<blockquote>$2</blockquote>\n')
        // Add margin to paragraphs
        .replace(/<p>/g, '<p class="mb-4">')
        // Add margin to headings
        .replace(/<h2>/g, '<h2 class="text-2xl font-bold mb-4 mt-8">')
        .replace(/<h3>/g, '<h3 class="text-xl font-semibold mb-3 mt-6">')
        // Format lists
        .replace(/<ul>/g, '<ul class="list-disc pl-6 mb-4 space-y-2">')
        .replace(/<ol>/g, '<ol class="list-decimal pl-6 mb-4 space-y-2">')
        // Format blockquotes
        .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-gray-300 pl-4 mb-4 italic">');

      // Update form data with formatted content
      setFormData(prev => ({ ...prev, content: formattedContent }));
    } catch (err) {
      console.error('Error formatting content:', err);
      setErrors(prev => ({
        ...prev,
        content: 'Failed to format content. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (err) {
      console.error('Error submitting blog:', err);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save blog post'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto my-4 sm:my-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h2>
            </div>

            <BreedSelector
              selectedBreeds={formData.breed_ids}
              onBreedSelect={(breedIds) => setFormData(prev => ({ ...prev, breed_ids: breedIds }))}
              disabled={isSubmitting}
            />

            {formData.breed_ids.length > 0 && (
              <BlogAIGenerator
                onGenerate={(data) => setFormData(prev => ({ ...prev, ...data }))}
                selectedBreeds={formData.breed_ids}
                disabled={isSubmitting}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value || null }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <div className="space-y-2">
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={handleFormatContent}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Format Content
                </button>
              </div>
            </div>

            <BlogScheduler
              scheduledFor={formData.scheduled_for}
              onChange={(date) => setFormData(prev => ({ 
                ...prev, 
                scheduled_for: date,
                status: date ? 'scheduled' : 'draft'
              }))}
              disabled={isSubmitting}
            />

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : (blog ? 'Update Post' : 'Create Post')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogForm;