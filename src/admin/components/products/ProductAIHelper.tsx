import React, { useState } from 'react';
import { Wand2, AlertCircle, Loader2 } from 'lucide-react';
import { callOpenAI } from '../../../lib/openai';
import { OpenAIError } from '../../../lib/errors';

interface ProductAIHelperProps {
  productName: string;
  originalDescription: string;
  onGenerate: (data: any) => void;
  disabled?: boolean;
}

const ProductAIHelper: React.FC<ProductAIHelperProps> = ({
  productName,
  originalDescription,
  onGenerate,
  disabled
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDogFood = (name: string, description: string): boolean => {
    const foodKeywords = [
      'dog food', 'puppy food', 'kibble', 'dry food', 'wet food',
      'dog treats', 'dog nutrition', 'dog diet', 'dog meal',
      'dog formula', 'dog feed', 'pet food'
    ];

    const lowercaseName = name.toLowerCase();
    const lowercaseDesc = description.toLowerCase();

    return foodKeywords.some(keyword => 
      lowercaseName.includes(keyword) || lowercaseDesc.includes(keyword)
    );
  };

  const generateProductInfo = async () => {
    if (!productName || isGenerating) return;

    try {
      setIsGenerating(true);
      setError(null);

      const isFood = isDogFood(productName, originalDescription);
      const prompt = `
        Analyze this dog product and provide detailed, accurate information:

        Product Name: ${productName}
        Description: ${originalDescription}
        Product Type: ${isFood ? 'Dog Food/Treat' : 'Non-Food Product'}

        ${isFood ? `
        For dog food products, analyze:
        1. Main protein sources
        2. Grain content and type
        3. Artificial preservatives or additives
        4. Key nutritional benefits
        5. Potential allergens
        6. Quality of ingredients
        7. Special dietary considerations
        ` : ''}

        Provide a response in this format:
        {
          "enhanced_description": "Write a clear, detailed, and professional product description",
          ${isFood ? `
          "ingredients": {
            "main_ingredients": ["List primary ingredients"],
            "protein_sources": ["List protein sources"],
            "grains": ["List grains/carbs"],
            "supplements": ["List supplements"],
            "preservatives": ["List preservatives"],
            "potential_allergens": ["List allergens"]
          },
          "nutritional_analysis": {
            "protein_content": "Estimated protein %",
            "fat_content": "Estimated fat %",
            "fiber_content": "Estimated fiber %",
            "moisture_content": "Estimated moisture %",
            "caloric_content": "Estimated calories"
          },
          "dietary_features": {
            "grain_free": boolean,
            "limited_ingredient": boolean,
            "organic": boolean,
            "raw": boolean,
            "natural": boolean
          },
          ` : ''}
          "life_stages": {
            "suitable_for_puppy": boolean,
            "suitable_for_adult": boolean,
            "suitable_for_senior": boolean,
            "min_age_months": number or null,
            "max_age_months": number or null,
            "explanation": "string"
          },
          "size_suitability": {
            "suitable_for_small": boolean,
            "suitable_for_medium": boolean,
            "suitable_for_large": boolean,
            "suitable_for_giant": boolean,
            "min_weight_kg": number or null,
            "max_weight_kg": number or null,
            "explanation": "string"
          },
          "breed_recommendations": [
            {
              "breed_type": "string",
              "recommendation_strength": number (1-5),
              "recommendation_reason": "string"
            }
          ],
          "features": ["string"],
          "safety_warnings": ["string"]
        }
      `;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'You are a professional pet product expert and veterinary nutritionist. Provide detailed, accurate product analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      let generatedContent;
      try {
        generatedContent = JSON.parse(response.choices[0].message.content);
      } catch (parseError) {
        throw new Error('Failed to parse AI response. Please try again.');
      }

      if (!generatedContent || typeof generatedContent !== 'object') {
        throw new Error('Invalid AI response format. Please try again.');
      }

      onGenerate(generatedContent);
    } catch (err) {
      console.error('Error generating product information:', err);
      setError(
        err instanceof OpenAIError 
          ? `AI Error: ${err.message}`
          : err instanceof Error 
            ? err.message 
            : 'Failed to generate product information. Please try again.'
      );
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
        onClick={generateProductInfo}
        disabled={disabled || isGenerating || !productName}
        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing Product...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            Analyze Product with AI
          </>
        )}
      </button>
    </div>
  );
};

export default ProductAIHelper;