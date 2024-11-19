import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { callOpenAI } from '../../../lib/openai';
import { ArticleCategory } from '../../types/article';
import { useQuery } from '@tanstack/react-query';
import { adminSupabase } from '../../../lib/supabase/client';

interface ArticleDiscoveryProps {
  onSelect: (articles: Array<{
    title: string;
    url: string;
    description: string;
    category: ArticleCategory;
    published_date: string;
    source: string;
    is_featured: boolean;
  }>, breedId: string) => void;
  disabled?: boolean;
}

const validateUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return true;
  } catch {
    return false;
  }
};

const ArticleDiscovery: React.FC<ArticleDiscoveryProps> = ({
  onSelect,
  disabled
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveredArticles, setDiscoveredArticles] = useState<any[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [selectedBreedId, setSelectedBreedId] = useState<string>('');

  const { data: breeds = [] } = useQuery({
    queryKey: ['breeds'],
    queryFn: async () => {
      const { data, error } = await adminSupabase
        .from('dog_breeds')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const processArticles = async (articles: any[]) => {
    const validatedArticles = [];
    
    for (const article of articles) {
      try {
        // Ensure required fields exist
        if (!article.title || !article.url || !article.description || !article.category) {
          continue;
        }

        // Validate URL
        const isValidUrl = await validateUrl(article.url);
        if (!isValidUrl) continue;

        // Ensure category is valid
        const validCategories: ArticleCategory[] = ['training', 'health', 'nutrition', 'behavior', 'grooming', 'lifestyle'];
        if (!validCategories.includes(article.category as ArticleCategory)) {
          article.category = 'lifestyle';
        }

        // Ensure published date is valid
        const publishedDate = article.published_date 
          ? new Date(article.published_date)
          : new Date();
        
        validatedArticles.push({
          ...article,
          published_date: publishedDate.toISOString().split('T')[0],
          source: article.source || new URL(article.url).hostname.replace('www.', ''),
          is_featured: false
        });
      } catch (err) {
        console.error('Error validating article:', err);
        continue;
      }
    }

    return validatedArticles;
  };

  const findArticles = async (breedName: string, breedId: string) => {
    if (!breedName || isSearching) return;

    try {
      setIsSearching(true);
      setError(null);
      setSelectedBreedId(breedId);
      setDiscoveredArticles([]);
      setSelectedArticles(new Set());

      const systemPrompt = `You are an expert at finding and analyzing dog breed articles. You must return ONLY valid JSON with no additional text or explanation. The JSON must match exactly the specified format.`;

      const userPrompt = `
        Generate a JSON object containing 5-10 high-quality articles about ${breedName} dogs from reputable sources like AKC, VetStreet, and PetMD.

        The response must be a valid JSON object with this exact structure:
        {
          "articles": [
            {
              "title": "string",
              "url": "string",
              "description": "string",
              "category": "training|health|nutrition|behavior|grooming|lifestyle",
              "published_date": "YYYY-MM-DD",
              "source": "string"
            }
          ]
        }

        Requirements:
        - Use only real, complete URLs from major pet websites
        - Content must be breed-specific
        - Include a mix of categories
        - Keep descriptions to 1-2 sentences
        - Use recent dates for publication dates
        - Return ONLY the JSON object, no other text
      `;

      const response = await callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      if (!response.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response');
      }

      let data;
      try {
        data = JSON.parse(response.choices[0].message.content.trim());
      } catch (err) {
        console.error('JSON parse error:', err);
        throw new Error('Invalid JSON response from API');
      }

      if (!data?.articles || !Array.isArray(data.articles)) {
        throw new Error('Invalid articles data structure');
      }

      const validatedArticles = await processArticles(data.articles);
      
      if (validatedArticles.length === 0) {
        throw new Error('No valid articles found');
      }

      setDiscoveredArticles(validatedArticles);
      
      // Auto-select all valid articles
      const articleUrls = new Set(validatedArticles.map(article => article.url));
      setSelectedArticles(articleUrls);
    } catch (err) {
      console.error('Error discovering articles:', err);
      setError(err instanceof Error ? err.message : 'Failed to discover articles. Please try again.');
      setDiscoveredArticles([]);
      setSelectedArticles(new Set());
    } finally {
      setIsSearching(false);
    }
  };

  const toggleArticleSelection = (url: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(url)) {
      newSelected.delete(url);
    } else {
      newSelected.add(url);
    }
    setSelectedArticles(newSelected);
  };

  const handleImport = () => {
    if (selectedArticles.size === 0) return;

    const selectedArticleData = discoveredArticles
      .filter(article => selectedArticles.has(article.url))
      .map(article => ({
        title: article.title,
        url: article.url,
        description: article.description,
        category: article.category as ArticleCategory,
        published_date: article.published_date,
        source: article.source,
        is_featured: false
      }));

    onSelect(selectedArticleData, selectedBreedId);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <select
          onChange={(e) => {
            const breed = breeds.find(b => b.id === e.target.value);
            if (breed) {
              findArticles(breed.name, breed.id);
            }
          }}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          disabled={disabled || isSearching}
        >
          <option value="">Select a breed to find articles</option>
          {breeds.map((breed) => (
            <option key={breed.id} value={breed.id}>
              {breed.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-sm text-red-600 flex items-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}

      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Searching for articles...</span>
          </div>
        </div>
      )}

      {discoveredArticles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Found {discoveredArticles.length} articles
            </span>
            <button
              onClick={() => setSelectedArticles(new Set(discoveredArticles.map(a => a.url)))}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Select All
            </button>
          </div>

          <div className="grid gap-4">
            {discoveredArticles.map((article) => (
              <div
                key={article.url}
                className={`p-4 rounded-lg border ${
                  selectedArticles.has(article.url)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {article.title}
                      </h3>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                        {article.category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Source: {article.source}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Published: {article.published_date}
                      </span>
                    </div>
                  </div>
                  <label className="flex items-center ml-4">
                    <input
                      type="checkbox"
                      checked={selectedArticles.has(article.url)}
                      onChange={() => toggleArticleSelection(article.url)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleImport}
              disabled={selectedArticles.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Import Selected Articles ({selectedArticles.size})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDiscovery;