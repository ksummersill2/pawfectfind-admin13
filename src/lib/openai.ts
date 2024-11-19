import { OpenAIError } from './errors';

export async function callOpenAI(messages: any[], opts: { temperature?: number; max_tokens?: number } = {}) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new OpenAIError('OpenAI API key is not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.max_tokens ?? 2000
      })
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = 'Failed to call OpenAI API';
      
      if (data.error?.message) {
        errorMessage = data.error.message;
      } else if (data.error?.type) {
        errorMessage = `OpenAI Error (${data.error.type})`;
      }

      throw new OpenAIError(
        errorMessage,
        response.status,
        data.error
      );
    }

    if (!data.choices?.[0]?.message?.content) {
      throw new OpenAIError('Invalid response format from OpenAI');
    }

    return data;
  } catch (err) {
    if (err instanceof OpenAIError) {
      throw err;
    }
    
    // Handle network or parsing errors
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    throw new OpenAIError(errorMessage);
  }
}