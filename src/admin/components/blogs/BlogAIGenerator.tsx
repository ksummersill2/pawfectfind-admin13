import React, { useState } from 'react';
import { Wand2, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminSupabase } from '../../../lib/supabase/client';

interface BlogAIGeneratorProps {
  onGenerate: (content: { title: string; content: string }) => void;
  selectedBreeds: string[];
  disabled?: boolean;
}

const ARTICLE_TYPES = [
  { id: 'care-guide', name: 'Care Guide', prompt: 'Write a comprehensive care guide for {breed} owners, covering grooming, exercise, and daily maintenance.' },
  { id: 'training', name: 'Training Guide', prompt: 'Create a detailed training guide specifically for {breed}s, including puppy training, basic obedience, and addressing common behavioral challenges.' },
  { id: 'health', name: 'Health Guide', prompt: 'Write an in-depth health guide for {breed}s, covering common health issues, preventive care, and nutrition recommendations.' },
  { id: 'lifestyle', name: 'Lifestyle Guide', prompt: 'Create a lifestyle guide for {breed} owners, including exercise needs, living space requirements, and compatibility with different lifestyles.' },
  { id: 'grooming', name: 'Grooming Guide', prompt: 'Write a detailed grooming guide specifically for {breed}s, including coat care, bathing frequency, and professional grooming recommendations.' }
];

const BlogAIGenerator: React.FC<BlogAIGeneratorProps> = ({
  onGenerate,
  selectedBreeds,
  disabled
}) => {
  const [articleType, setArticleType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: breedDetails } = useQuery({
    queryKey: ['breed-details', selectedBreeds[0]],
    enabled: !!selectedBreeds[0],
    queryFn: async () => {
      const { data, error } = await adminSupabase
        .from('dog_breeds')
        .select(`
          *,
          size_variations:breed_size_variations(
            *,
            male_characteristics:breed_characteristics(*),
            female_characteristics:breed_characteristics(*)
          )
        `)
        .eq('id', selectedBreeds[0])
        .single();

      if (error) throw error;
      return data;
    }
  });

  const formatContent = (rawContent: string) => {
    // Extract title from the first line if it starts with #
    let title = '';
    let content = rawContent;

    // Look for a title in the first line
    const titleMatch = rawContent.match(/^#\s*(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
      content = rawContent.replace(/^#\s*.+$/m, '').trim();
    } else {
      // If no title found, use the first line as title
      const lines = rawContent.split('\n');
      title = lines[0].trim();
      content = lines.slice(1).join('\n').trim();
    }

    // Format content with proper HTML
    content = content
      // Convert headers
      .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
      .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
      // Convert paragraphs
      .split('\n\n')
      .map(para => para.trim())
      .filter(para => para)
      .map(para => {
        if (para.startsWith('<h')) return para;
        if (para.startsWith('- ')) {
          // Convert bullet points to lists
          return '<ul>' + 
            para.split('\n')
              .map(line => `<li>${line.replace(/^-\s+/, '')}</li>`)
              .join('') + 
            '</ul>';
        }
        if (para.match(/^\d+\./)) {
          // Convert numbered lists
          return '<ol>' + 
            para.split('\n')
              .map(line => `<li>${line.replace(/^\d+\.\s+/, '')}</li>`)
              .join('') + 
            '</ol>';
        }
        return `<p>${para}</p>`;
      })
      .join('\n\n');

    return { title, content };
  };

  const generateContent = async () => {
    if (!selectedBreeds[0] || !articleType || isGenerating || !breedDetails) return;

    try {
      setIsGenerating(true);
      setError(null);

      const selectedPrompt = ARTICLE_TYPES.find(type => type.id === articleType)?.prompt || '';
      const prompt = `
        Write a comprehensive article about the ${breedDetails.name} breed, focusing on ${ARTICLE_TYPES.find(t => t.id === articleType)?.name.toLowerCase()}.

        Use this breed information:
        - Description: ${breedDetails.description}
        - Size Category: ${breedDetails.size_variations[0]?.size_category}
        - Health Issues: ${breedDetails.size_variations[0]?.health_issues.join(', ')}
        - Care Instructions: ${breedDetails.size_variations[0]?.care_instructions}
        - Special Considerations: ${breedDetails.size_variations[0]?.special_considerations}

        ${selectedPrompt.replace('{breed}', breedDetails.name)}

        Format requirements:
        1. Start with a clear, engaging title prefixed with # 
        2. Use ## for main sections and ### for subsections
        3. Break content into short, readable paragraphs
        4. Use bullet points (- ) for lists where appropriate
        5. Include practical tips and actionable advice
        6. End with a brief conclusion section
        7. Keep paragraphs focused and concise
        8. Use clear section headings for easy navigation

        Example format:
        # Complete Guide to [Breed] [Topic]

        ## Introduction
        [Opening paragraph]

        ## Main Section 1
        [Content]

        ### Subsection
        - Bullet point 1
        - Bullet point 2

        ## Conclusion
        [Closing paragraph]
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a professional pet care content writer specializing in breed-specific articles. Write in a friendly, informative tone while maintaining accuracy and citing sources where appropriate.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      const rawContent = data.choices[0].message.content;
      const formattedContent = formatContent(rawContent);
      onGenerate(formattedContent);
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!selectedBreeds[0]) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        Select a breed to generate targeted content
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Article Type
        </label>
        <select
          value={articleType}
          onChange={(e) => setArticleType(e.target.value)}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          disabled={disabled || isGenerating}
        >
          <option value="">Select article type</option>
          {ARTICLE_TYPES.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={generateContent}
          disabled={disabled || isGenerating || !articleType}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BlogAIGenerator;