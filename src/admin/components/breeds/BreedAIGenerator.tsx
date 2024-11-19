import React, { useState } from 'react';
import { Wand2, AlertCircle, Loader2 } from 'lucide-react';
import { AdminBreedForm } from '../../types';

interface BreedAIGeneratorProps {
  breedName: string;
  onGenerate: (data: Partial<AdminBreedForm>) => void;
  disabled?: boolean;
}

const BreedAIGenerator: React.FC<BreedAIGeneratorProps> = ({
  breedName,
  onGenerate,
  disabled
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBreedInfo = async () => {
    if (!breedName.trim() || isGenerating) return;

    try {
      setIsGenerating(true);
      setError(null);

      const prompt = `
        Act as a professional dog breed expert and veterinarian. Provide detailed, accurate information about the ${breedName} breed in JSON format with the following structure:

        {
          "description": "Comprehensive breed description and history",
          "size_variations": [{
            "size_category": "small|medium|large|giant",
            "size_description": "Detailed physical description",
            "image": null,
            "shared_characteristics": false,
            "dietary_needs": "Detailed dietary requirements including specific nutritional needs, feeding frequency, and recommended food types",
            "health_issues": [
              "List each common health issue",
              "Include genetic conditions",
              "List preventive care recommendations"
            ],
            "care_instructions": "Comprehensive grooming and care instructions including brushing frequency, bathing needs, nail care, dental care, and specific coat maintenance",
            "special_considerations": "Important breed-specific considerations including climate sensitivity, exercise restrictions, living space requirements",
            "male_characteristics": {
              "min_height_cm": number,
              "max_height_cm": number,
              "min_weight_kg": number,
              "max_weight_kg": number,
              "life_expectancy_years": number,
              "energy_level": 1-10,
              "grooming_needs": 1-10,
              "shedding_level": 1-10,
              "trainability": 1-10,
              "barking_level": 1-10,
              "good_with_children": boolean,
              "good_with_other_dogs": boolean,
              "good_with_strangers": boolean,
              "exercise_needs_minutes": number,
              "dietary_needs": "Male-specific dietary requirements if any",
              "health_issues": [
                "Male-specific health issues",
                "Preventive care recommendations"
              ],
              "care_instructions": "Male-specific grooming and care needs",
              "special_considerations": "Male-specific considerations"
            },
            "female_characteristics": {
              // Same structure as male_characteristics but with female-specific information
              "min_height_cm": number,
              "max_height_cm": number,
              "min_weight_kg": number,
              "max_weight_kg": number,
              "life_expectancy_years": number,
              "energy_level": 1-10,
              "grooming_needs": 1-10,
              "shedding_level": 1-10,
              "trainability": 1-10,
              "barking_level": 1-10,
              "good_with_children": boolean,
              "good_with_other_dogs": boolean,
              "good_with_strangers": boolean,
              "exercise_needs_minutes": number,
              "dietary_needs": "Female-specific dietary requirements if any",
              "health_issues": [
                "Female-specific health issues",
                "Preventive care recommendations"
              ],
              "care_instructions": "Female-specific grooming and care needs",
              "special_considerations": "Female-specific considerations including maternal care"
            }
          }]
        }

        Ensure:
        1. All measurements are in metric
        2. Information is accurate and well-researched
        3. Include gender-specific variations where relevant
        4. Dietary needs cover all life stages
        5. Health issues are comprehensive and include preventive measures
        6. Care instructions are detailed and practical
        7. Special considerations cover all important aspects of breed ownership
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
              content: 'You are a professional veterinarian and dog breed expert. Provide accurate, detailed information about dog breeds in the requested format. Include comprehensive care information and gender-specific details where relevant.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate breed information');
      }

      const data = await response.json();
      const generatedContent = JSON.parse(data.choices[0].message.content);

      // Process the size variations to ensure arrays are properly formatted
      const processedContent = {
        ...generatedContent,
        size_variations: generatedContent.size_variations.map((variation: any) => ({
          ...variation,
          health_issues: Array.isArray(variation.health_issues) ? variation.health_issues : [],
          male_characteristics: {
            ...variation.male_characteristics,
            health_issues: Array.isArray(variation.male_characteristics.health_issues) 
              ? variation.male_characteristics.health_issues 
              : []
          },
          female_characteristics: {
            ...variation.female_characteristics,
            health_issues: Array.isArray(variation.female_characteristics.health_issues)
              ? variation.female_characteristics.health_issues
              : []
          }
        }))
      };

      onGenerate(processedContent);
    } catch (err) {
      console.error('Error generating breed information:', err);
      setError('Failed to generate breed information. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 flex items-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}

      <button
        onClick={generateBreedInfo}
        disabled={disabled || isGenerating || !breedName.trim()}
        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating {breedName} Information...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            Auto-Generate Breed Information
          </>
        )}
      </button>
    </div>
  );
};

export default BreedAIGenerator;